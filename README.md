# Apartamento 206 — Bö Escalante

Sitio estático bilingüe (ES/EN) para el alquiler del Apto 206 en el edificio Bö, Barrio Escalante, San José, Costa Rica.

## Estructura

```
docs/
  index.html         ES (root)
  en/index.html      EN
  css/style.css      Sistema de diseño compartido con jaco-live-local
  js/main.js         Lightbox + filtro de galería por ambiente
  images/
    hero.{jpg,webp}
    og-image.jpg     (1200x630)
    gallery/<ambiente>/<slug>-{600,1600}.{jpg,webp}
  sitemap.xml
  robots.txt
images/original/     Fotos fuente (no se publican)
```

## Datos del inmueble

- 2 habitaciones, segundo piso del edificio Bö Escalante.
- Aire acondicionado en sala y habitación principal.
- Electrodomésticos (lavadora-secadora, refrigeradora) opcionales — negociable.
- ₡550.000 / mes sin parqueo · ₡600.000 / mes con parqueo (1 vehículo).
- Tipología base del edificio (~54 m² según el desarrollador).

## Servir localmente

```bash
cd docs
python3 -m http.server 8000
# abrir http://localhost:8000/
```

## Publicar

GitHub Pages servido desde `/docs`. Listado enlazado desde el hub
[rentalincostarica.com](https://rentalincostarica.com).
