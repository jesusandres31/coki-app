"""
Load selected legacy CSV exports into PocketBase.

Sources:
- Clientes.csv       -> clients
- Articulos.csv      -> products
- Factura.csv        -> invoices
- FacturaDetalle.csv -> invoices_products
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Load selected CSVs into PocketBase.")
    parser.add_argument("--pb-url", default="http://127.0.0.1:8090", help="PocketBase URL")
    parser.add_argument(
        "--csv-dir",
        type=Path,
        default=script_dir / "csv",
        help="Directory containing exported CSV files",
    )
    parser.add_argument(
        "--private-file",
        type=Path,
        default=script_dir.parent / "deployment" / "private.txt",
        help="Path to private.txt (fallback for admin credentials)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and validate mappings without creating records",
    )
    return parser.parse_args()


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def clean_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned if cleaned else None


def parse_number(value: str | None) -> float | None:
    text = clean_text(value)
    if text is None:
        return None
    text = text.replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def parse_date_for_pb(value: str | None) -> str | None:
    text = clean_text(value)
    if not text:
        return None

    # Accept common legacy formats found in the source CSV.
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(text, fmt)
            return dt.strftime("%Y-%m-%d %H:%M:%S.000Z")
        except ValueError:
            continue
    return None


def normalize_key(value: str | None) -> str | None:
    text = clean_text(value)
    return text.lower() if text else None


def normalize_doc(value: str | None) -> str | None:
    text = clean_text(value)
    if not text:
        return None
    # Keep all digits but strip leading zeros for robust matching.
    digits = "".join(ch for ch in text if ch.isdigit())
    if not digits:
        return text
    return str(int(digits))


def load_credentials_from_private(private_file: Path) -> tuple[str, str] | None:
    if not private_file.exists():
        return None

    content = private_file.read_text(encoding="utf-8", errors="ignore")
    lines = [line.strip() for line in content.splitlines() if line.strip()]

    email_pattern = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    for idx, line in enumerate(lines):
        if email_pattern.match(line) and idx + 1 < len(lines):
            return line, lines[idx + 1]
    return None


def resolve_admin_credentials(private_file: Path) -> tuple[str, str]:
    email = os.getenv("PB_ADMIN_EMAIL")
    password = os.getenv("PB_ADMIN_PASSWORD")
    if email and password:
        return email, password

    fallback = load_credentials_from_private(private_file)
    if fallback:
        return fallback

    raise RuntimeError(
        "PocketBase admin credentials not found. Set PB_ADMIN_EMAIL and "
        "PB_ADMIN_PASSWORD env vars, or provide a valid private.txt file."
    )


class PBClient:
    def __init__(self, base_url: str, token: str | None = None):
        self.base_url = base_url.rstrip("/")
        self.token = token

    def _request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = self.token

        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(url, method=method, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                body = resp.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"HTTP {e.code} {method} {path}: {error_body}") from e
        except urllib.error.URLError as e:
            raise RuntimeError(f"Could not reach PocketBase at {self.base_url}: {e}") from e

        if not body:
            return {}
        return json.loads(body)

    def auth_admin(self, email: str, password: str) -> None:
        result = self._request(
            "POST",
            "/api/admins/auth-with-password",
            {"identity": email, "password": password},
        )
        token = result.get("token")
        if not token:
            raise RuntimeError("Auth succeeded but no token received.")
        self.token = token

    def list_records(self, collection: str, fields: list[str] | None = None) -> list[dict[str, Any]]:
        page = 1
        all_items: list[dict[str, Any]] = []
        while True:
            params = {"page": page, "perPage": 500}
            if fields:
                params["fields"] = ",".join(fields)
            query = urllib.parse.urlencode(params)
            result = self._request("GET", f"/api/collections/{collection}/records?{query}")
            items = result.get("items", [])
            all_items.extend(items)
            if page >= result.get("totalPages", 1):
                break
            page += 1
        return all_items

    def create_record(self, collection: str, data: dict[str, Any]) -> dict[str, Any]:
        return self._request("POST", f"/api/collections/{collection}/records", data)

    def delete_record(self, collection: str, record_id: str) -> None:
        self._request("DELETE", f"/api/collections/{collection}/records/{record_id}")


@dataclass
class ImportStats:
    created: int = 0
    skipped: int = 0
    failed: int = 0


def build_measure_unit_map(client: PBClient, dry_run: bool) -> dict[str, str]:
    # Legacy mapping discovered from CSV content:
    # IdUM 11 -> Uni, IdUM 12 -> Kg
    legacy_to_name = {
        "11": "uni",
        "12": "kg",
    }

    records = client.list_records("measureunits", fields=["id", "name"])
    name_to_id: dict[str, str] = {}
    for rec in records:
        name = normalize_key(rec.get("name"))
        if name and rec.get("id"):
            name_to_id[name] = rec["id"]

    for required in ("uni", "kg"):
        if required not in name_to_id and not dry_run:
            created = client.create_record("measureunits", {"name": required.capitalize()})
            name_to_id[required] = created["id"]

    result: dict[str, str] = {}
    for legacy_id, unit_name in legacy_to_name.items():
        unit_id = name_to_id.get(unit_name)
        if unit_id:
            result[legacy_id] = unit_id
    return result


def resolve_invoice_state_open_id(client: PBClient) -> str:
    records = client.list_records("invoicestates", fields=["id", "name"])
    for rec in records:
        if normalize_key(rec.get("name")) == "open" and rec.get("id"):
            return rec["id"]
    raise RuntimeError("No 'open' record found in invoicestates collection.")


def clear_import_collections(client: PBClient, dry_run: bool) -> None:
    # Delete children first to avoid relation constraints when clearing invoices.
    ordered_collections = ["invoices_products", "invoices", "clients", "products"]
    if dry_run:
        print("Dry-run: skipping cleanup of invoices_products, invoices, clients, products.")
        return

    for collection in ordered_collections:
        records = client.list_records(collection, fields=["id"])
        deleted = 0
        failed = 0
        for rec in records:
            rec_id = rec.get("id")
            if not rec_id:
                continue
            try:
                client.delete_record(collection, rec_id)
                deleted += 1
            except Exception:
                failed += 1
        print(f"cleanup {collection}: deleted={deleted} failed={failed}")


def import_clients(client: PBClient, rows: list[dict[str, str]], dry_run: bool) -> tuple[ImportStats, dict[str, str]]:
    stats = ImportStats()
    client_id_map: dict[str, str] = {}

    for row in rows:
        legacy_id = clean_text(row.get("Cod_Cliente"))
        name = clean_text(row.get("Razon_Social"))
        if not legacy_id or not name:
            stats.skipped += 1
            continue

        payload = {
            "name": name,
            "phone": clean_text(row.get("Telefono")),
            "address": clean_text(row.get("Domicilio")),
        }
        payload = {k: v for k, v in payload.items() if v is not None}

        if dry_run:
            client_id_map[legacy_id] = f"dry-{legacy_id}"
            stats.created += 1
            continue

        try:
            created = client.create_record("clients", payload)
            client_id_map[legacy_id] = created["id"]
            stats.created += 1
        except Exception:
            stats.failed += 1

    return stats, client_id_map


def import_products(
    client: PBClient,
    rows: list[dict[str, str]],
    measure_unit_map: dict[str, str],
    dry_run: bool,
) -> tuple[ImportStats, dict[str, str], dict[str, str]]:
    stats = ImportStats()
    by_id_art: dict[str, str] = {}
    by_codigo: dict[str, str] = {}

    for row in rows:
        legacy_id_art = clean_text(row.get("IdArt"))
        legacy_codigo = clean_text(row.get("Codigo"))
        name = clean_text(row.get("Descripcion1"))
        measure_id = measure_unit_map.get((clean_text(row.get("IdUM")) or ""))

        if not name or not measure_id:
            stats.skipped += 1
            continue

        payload = {
            "name": name,
            "unit_price": parse_number(row.get("Precio01")),
            "measure_unit": measure_id,
        }
        payload = {k: v for k, v in payload.items() if v is not None}

        if dry_run:
            fake_id = f"dry-prod-{legacy_id_art or legacy_codigo or stats.created}"
            if legacy_id_art:
                by_id_art[legacy_id_art] = fake_id
            if legacy_codigo:
                by_codigo[legacy_codigo] = fake_id
            stats.created += 1
            continue

        try:
            created = client.create_record("products", payload)
            pb_id = created["id"]
            if legacy_id_art:
                by_id_art[legacy_id_art] = pb_id
            if legacy_codigo:
                by_codigo[legacy_codigo] = pb_id
            stats.created += 1
        except Exception:
            stats.failed += 1

    return stats, by_id_art, by_codigo


def import_invoices(
    client: PBClient,
    rows: list[dict[str, str]],
    client_id_map: dict[str, str],
    default_state_id: str,
    dry_run: bool,
) -> tuple[ImportStats, dict[str, str]]:
    stats = ImportStats()
    invoice_by_doc: dict[str, str] = {}

    for row in rows:
        legacy_client = clean_text(row.get("IdCliente"))
        client_id = client_id_map.get(legacy_client or "")
        date = parse_date_for_pb(row.get("FechaFactura"))

        if not client_id or not date:
            stats.skipped += 1
            continue

        payload = {
            "client": client_id,
            "discount": parse_number(row.get("Recargo1")) or 0.0,
            "total": parse_number(row.get("Total")),
            "date": date,
            "state": default_state_id,
        }
        payload = {k: v for k, v in payload.items() if v is not None}

        doc_key = normalize_doc(row.get("NroDoc"))

        if dry_run:
            if doc_key:
                invoice_by_doc[doc_key] = f"dry-inv-{doc_key}"
            stats.created += 1
            continue

        try:
            created = client.create_record("invoices", payload)
            if doc_key:
                invoice_by_doc[doc_key] = created["id"]
            stats.created += 1
        except Exception:
            stats.failed += 1

    return stats, invoice_by_doc


def import_invoice_products(
    client: PBClient,
    rows: list[dict[str, str]],
    invoice_by_doc: dict[str, str],
    product_by_id_art: dict[str, str],
    product_by_codigo: dict[str, str],
    dry_run: bool,
) -> ImportStats:
    stats = ImportStats()

    for row in rows:
        invoice_id = invoice_by_doc.get(normalize_doc(row.get("NroDoc")) or "")
        product_id = None

        id_art = clean_text(row.get("IdArt"))
        codigo = clean_text(row.get("Codigo"))
        if id_art:
            product_id = product_by_id_art.get(id_art)
        if not product_id and codigo:
            product_id = product_by_codigo.get(codigo)

        if not invoice_id or not product_id:
            stats.skipped += 1
            continue

        payload = {
            "invoice": invoice_id,
            "product": product_id,
            "unit_price": parse_number(row.get("PU")),
            "amount": parse_number(row.get("Cantidad")),
            "discount": parse_number(row.get("Bonif")),
            "total": parse_number(row.get("Importe")),
        }
        payload = {k: v for k, v in payload.items() if v is not None}

        if dry_run:
            stats.created += 1
            continue

        try:
            client.create_record("invoices_products", payload)
            stats.created += 1
        except Exception:
            stats.failed += 1

    return stats


def main() -> int:
    args = parse_args()
    csv_dir = args.csv_dir.resolve()

    required_files = {
        "clientes": csv_dir / "Clientes.csv",
        "articulos": csv_dir / "Articulos.csv",
        "factura": csv_dir / "Factura.csv",
        "factura_detalle": csv_dir / "FacturaDetalle.csv",
    }
    missing = [str(path) for path in required_files.values() if not path.exists()]
    if missing:
        print("Missing required CSV files:", file=sys.stderr)
        for path in missing:
            print(f"- {path}", file=sys.stderr)
        return 1

    try:
        admin_email, admin_password = resolve_admin_credentials(args.private_file.resolve())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 2

    client = PBClient(args.pb_url)
    if not args.dry_run:
        try:
            client.auth_admin(admin_email, admin_password)
        except Exception as exc:
            print(f"PocketBase auth failed: {exc}", file=sys.stderr)
            return 3

    clientes_rows = read_csv_rows(required_files["clientes"])
    articulos_rows = read_csv_rows(required_files["articulos"])
    factura_rows = read_csv_rows(required_files["factura"])
    detalle_rows = read_csv_rows(required_files["factura_detalle"])

    try:
        clear_import_collections(client, args.dry_run)
    except Exception as exc:
        print(f"Failed while cleaning target collections: {exc}", file=sys.stderr)
        return 8

    try:
        measure_unit_map = build_measure_unit_map(client, args.dry_run)
    except Exception as exc:
        print(f"Failed to load measure units: {exc}", file=sys.stderr)
        return 4

    if not measure_unit_map:
        print(
            "No measure unit mapping found. Ensure measureunits has at least 'Uni' and 'Kg'.",
            file=sys.stderr,
        )
        return 5

    try:
        open_state_id = resolve_invoice_state_open_id(client)
    except Exception as exc:
        print(f"Failed to resolve invoice state 'open': {exc}", file=sys.stderr)
        return 7

    clients_stats, client_id_map = import_clients(client, clientes_rows, args.dry_run)
    products_stats, product_by_id_art, product_by_codigo = import_products(
        client, articulos_rows, measure_unit_map, args.dry_run
    )
    invoices_stats, invoice_by_doc = import_invoices(
        client,
        factura_rows,
        client_id_map,
        open_state_id,
        args.dry_run,
    )
    inv_products_stats = import_invoice_products(
        client,
        detalle_rows,
        invoice_by_doc,
        product_by_id_art,
        product_by_codigo,
        args.dry_run,
    )

    print("Import completed.")
    print(
        f"clients: created={clients_stats.created} skipped={clients_stats.skipped} failed={clients_stats.failed}"
    )
    print(
        f"products: created={products_stats.created} skipped={products_stats.skipped} failed={products_stats.failed}"
    )
    print(
        f"invoices: created={invoices_stats.created} skipped={invoices_stats.skipped} failed={invoices_stats.failed}"
    )
    print(
        "invoices_products: "
        f"created={inv_products_stats.created} skipped={inv_products_stats.skipped} failed={inv_products_stats.failed}"
    )

    total_failed = (
        clients_stats.failed + products_stats.failed + invoices_stats.failed + inv_products_stats.failed
    )
    return 0 if total_failed == 0 else 6


if __name__ == "__main__":
    raise SystemExit(main())
