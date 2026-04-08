"""
Export every table from a Microsoft Access .mdb file into CSV files.

Default behavior:
- Input DB: restore/coki-base.mdb
- Output dir: restore/csv/

Engines:
- Windows/ODBC: uses pyodbc + Microsoft Access Driver
- mdbtools fallback: uses mdb-tables and mdb-export binaries
"""

from __future__ import annotations

import argparse
import csv
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    default_db = script_dir / "coki-base.mdb"
    default_output = script_dir / "csv"

    parser = argparse.ArgumentParser(
        description="Extract all tables and rows from an .mdb file into CSV files."
    )
    parser.add_argument(
        "--db-path",
        type=Path,
        default=default_db,
        help=f"Path to .mdb file (default: {default_db})",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=default_output,
        help=f"Directory where CSV files are written (default: {default_output})",
    )
    parser.add_argument(
        "--encoding",
        default="utf-8-sig",
        help="CSV text encoding (default: utf-8-sig)",
    )
    return parser.parse_args()


def sanitize_filename(name: str) -> str:
    sanitized = re.sub(r'[<>:"/\\|?*\x00-\x1F]+', "_", name).strip()
    return sanitized or "table"


def unique_csv_path(output_dir: Path, table_name: str, used: set[str]) -> Path:
    base = sanitize_filename(table_name)
    candidate = base
    i = 1
    while candidate.lower() in used:
        i += 1
        candidate = f"{base}_{i}"
    used.add(candidate.lower())
    return output_dir / f"{candidate}.csv"


def choose_engine() -> str:
    try:
        import pyodbc  # noqa: F401

        return "pyodbc"
    except Exception:
        pass

    if shutil.which("mdb-tables") and shutil.which("mdb-export"):
        return "mdbtools"

    return "none"


def export_with_pyodbc(db_path: Path, output_dir: Path, encoding: str) -> int:
    import pyodbc

    conn_str = (
        r"Driver={Microsoft Access Driver (*.mdb, *.accdb)};"
        f"DBQ={db_path};"
    )
    conn = pyodbc.connect(conn_str)

    exported = 0
    used_names: set[str] = set()

    try:
        cursor = conn.cursor()
        tables = cursor.tables(tableType="TABLE")
        for table in tables:
            table_name = table.table_name
            csv_path = unique_csv_path(output_dir, table_name, used_names)

            query = f"SELECT * FROM [{table_name}]"
            rows_cursor = conn.cursor()
            rows_cursor.execute(query)
            columns = [desc[0] for desc in rows_cursor.description] if rows_cursor.description else []

            with csv_path.open("w", newline="", encoding=encoding) as f:
                writer = csv.writer(f)
                writer.writerow(columns)
                for row in rows_cursor:
                    writer.writerow(list(row))

            exported += 1
            print(f"Exported: {table_name} -> {csv_path.name}")
    finally:
        conn.close()

    return exported


def run_command(args: Iterable[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        list(args),
        check=True,
        text=True,
        capture_output=True,
    )


def list_tables_with_mdbtools(db_path: Path) -> list[str]:
    result = run_command(["mdb-tables", "-1", str(db_path)])
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def export_with_mdbtools(db_path: Path, output_dir: Path, encoding: str) -> int:
    tables = list_tables_with_mdbtools(db_path)
    used_names: set[str] = set()
    exported = 0

    for table_name in tables:
        csv_path = unique_csv_path(output_dir, table_name, used_names)
        result = run_command(["mdb-export", "-D", "%Y-%m-%d %H:%M:%S", str(db_path), table_name])
        # mdb-export always writes UTF-8 text; keep output consistent by re-encoding if requested.
        text_data = result.stdout
        if encoding.lower().replace("_", "-") != "utf-8":
            text_data = text_data.encode("utf-8").decode("utf-8")
        csv_path.write_text(text_data, encoding=encoding, newline="")
        exported += 1
        print(f"Exported: {table_name} -> {csv_path.name}")

    return exported


def main() -> int:
    args = parse_args()
    db_path: Path = args.db_path.resolve()
    output_dir: Path = args.output_dir.resolve()
    encoding: str = args.encoding

    if not db_path.exists():
        print(f"Database file not found: {db_path}", file=sys.stderr)
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    engine = choose_engine()
    if engine == "none":
        print(
            "No compatible exporter found.\n"
            "Install one of:\n"
            "1) pyodbc + Microsoft Access ODBC Driver (Windows)\n"
            "2) mdbtools (mdb-tables, mdb-export)",
            file=sys.stderr,
        )
        return 2

    try:
        if engine == "pyodbc":
            count = export_with_pyodbc(db_path, output_dir, encoding)
        else:
            count = export_with_mdbtools(db_path, output_dir, encoding)
    except Exception as exc:
        print(f"Export failed: {exc}", file=sys.stderr)
        return 3

    print(f"Done. Exported {count} tables into: {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
