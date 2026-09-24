# Seguridad del servidor

Configuración manual necesaria en cada despliegue nuevo.

```text
Internet -> HTTPS/nginx -> PocketBase (127.0.0.1:8091)
```

## 1. nginx

PocketBase debe escuchar solamente en `127.0.0.1:8091`. En el `location` que
hace proxy a PocketBase:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_pass http://127.0.0.1:8091;
```

Validar y recargar:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 2. PocketBase > Settings > Application

| Campo | Valor |
| --- | --- |
| Application name | `Coki` |
| Application URL | `https://admin-coki.ctes.dedyn.io` |
| Trusted IP proxy headers | `X-Real-IP` |
| IP priority | `Use rightmost IP` |

Antes de activar límites, comprobar que el panel muestre:

```text
Resolved user IP: <IP pública real>
Detected proxy header: X-Real-IP
```

Si muestra `127.0.0.1`, revisar nginx. No activar todavía el rate limiter.

## 3. Rate limiting

Activar **Settings > Application > Rate limiting**.

Conservar las reglas predeterminadas:

| Label | Audience | Requests | Seconds |
| --- | --- | ---: | ---: |
| `*:auth` | All | 2 | 3 |
| `*:create` | All | 20 | 5 |
| `/api/batch` | All | 3 | 1 |
| `/api/` | All | 300 | 10 |

Agregar:

| Label | Audience | Requests | Seconds |
| --- | --- | ---: | ---: |
| `users:authWithPassword` | All | 5 | 60 |
| `_superusers:authWithPassword` | All | 3 | 300 |
| `users:requestPasswordReset` | All | 3 | 900 |

## 4. Prueba

```bash
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST -H "Content-Type: application/json" \
    -d '{"identity":"rate-limit-test@example.com","password":"incorrect-password"}' \
    https://admin-coki.ctes.dedyn.io/api/collections/users/auth-with-password
done
```

Resultado esperado: cinco respuestas `400` y luego una `429`.

## Checklist

- [ ] PocketBase actualizado y con backup.
- [ ] PocketBase escucha solo en `127.0.0.1:8091`.
- [ ] HTTPS activo.
- [ ] nginx establece `X-Real-IP`.
- [ ] PocketBase detecta la IP pública real.
- [ ] Rate limiting habilitado con las reglas anteriores.
- [ ] La prueba devuelve `429`.
- [ ] Login administrativo protegido con contraseña única y fuerte.
