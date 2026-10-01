# SAVE — Backend, panel de administración y sitio web

Sistema completo para el proyecto SAVE (Sistema de Alerta Vital Por Entornos):
sitio público, backend real con base de datos, panel de administración, y
la base de datos real de 12.135 paraderos y estaciones de Metro de Santiago
(convertida desde el Excel que entregaste).

No requiere dominio ni tarjeta de crédito para funcionar: corre en tu
computador con Node.js, y puede subirse gratis a un hosting cuando quieras.

## Qué incluye

- **`server/`** — Backend (Node.js + Express + SQLite). Toda la lógica, la
  base de datos y las rutas de la API.
- **`public-site/`** — El sitio público que ve cualquier visitante.
- **`admin/`** — El panel de administración (gestión de contenido).
- **`data/`** — Aquí se crea automáticamente el archivo de base de datos
  (`save.db`) la primera vez que corres el servidor. Es un solo archivo:
  para respaldar todo el sistema, basta con copiar ese archivo.

## 1. Instalación (una sola vez)

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 18 o
superior). Para comprobarlo, abre una terminal y escribe:

```bash
node -v
```

Luego, dentro de la carpeta del proyecto:

```bash
npm install
```

Esto descarga las librerías necesarias (Express, SQLite, etc.), todas
gratuitas y de código abierto.

## 2. Cargar los datos iniciales (una sola vez)

```bash
npm run seed:paraderos
```
Carga los 12.135 paraderos y estaciones de Metro reales en la base de datos.

```bash
npm run seed:demo
```
Carga el contenido de ejemplo (casos documentados, noticias, etapas del
roadmap) para que el sitio no se vea vacío. Puedes editarlo o borrarlo
después desde el panel de administración.

```bash
npm run create:admin -- tu-correo@ejemplo.com "TuContraseñaSegura123" "Tu Nombre"
```
Crea tu usuario de administrador. Cambia el correo, la contraseña y el
nombre por los tuyos. Puedes volver a ejecutar este comando más adelante
para cambiar la contraseña o crear un segundo administrador.

## 3. Correr el sistema

```bash
npm start
```

Verás un mensaje como:

```
SAVE backend escuchando en http://localhost:3000
  Sitio público:     http://localhost:3000/
  Panel admin:       http://localhost:3000/admin
  API:               http://localhost:3000/api/health
```

- Abre `http://localhost:3000` en tu navegador para ver el sitio público.
- Abre `http://localhost:3000/admin` para entrar al panel de administración
  con el correo y contraseña que creaste en el paso 2.

Para detener el servidor, vuelve a la terminal y presiona `Ctrl + C`.

## 4. Qué puedes gestionar desde el panel de administración

- **Solicitudes**: pedidos de organizaciones y personas naturales.
- **Cotizaciones**: cotizaciones rápidas de pulsera, app y nodo móvil.
- **Mensajes de contacto** y **Newsletter** (suscriptores).
- **Nodos SAVE**: los nodos reales o planificados de la red (incluye el
  **Nodo LED**, el panel de aviso que recibe la alerta y guía a las personas
  del entorno — la pieza central del sistema), con coordenadas, categoría de
  instalación (público / hogar / empresa / comunidad) y un interruptor para
  hacerlos visibles o no en el sitio.
- **Paraderos y estaciones**: los 12.135 puntos reales del sistema RED,
  separados en dos pestañas (Paraderos de buses / Estaciones de Metro), con
  buscador por nombre y comuna, y un interruptor para activar o desactivar
  cada uno. También puedes seleccionar varios a la vez y activarlos o
  desactivarlos en lote, y agregar puntos manualmente para cuando el
  Ministerio de Transportes incorpore nuevos paraderos.
- **Empresas afiliadas**, **Noticias**, **Lanzamientos** (el roadmap
  destacado en el inicio), **Producto** (las imágenes del Nodo LED, la
  pulsera, la app y el nodo móvil que se muestran en el inicio) y **Casos
  documentados**.

Todo lo que cambies ahí se refleja de inmediato en el sitio público.

### Importante: por qué un paradero no aparece en el sitio hasta que lo actives

Los 12.135 paraderos y estaciones se cargan **inactivos** por defecto. Esto
es intencional: te permite revisar y validar cada punto antes de que
aparezca en la web oficial, en vez de publicar los 12.135 de una sola vez.
Para activarlos:

1. Entra a **Paraderos y estaciones** en el panel.
2. Usa el buscador o el filtro de comuna para encontrar los que quieres
   publicar.
3. Actívalos uno por uno con el interruptor de la columna "Visible", o
   selecciona varios con las casillas de la izquierda y usa el botón
   "Marcar visibles" que aparece arriba de la tabla.

Ya dejé activado un grupo de 40 paraderos y estaciones del centro de
Santiago como ejemplo funcional; el resto queda a tu criterio.

### Código de trazabilidad de los nodos

Cada nodo que crees recibe automáticamente un código único (por ejemplo
`SAVE-LED-HA1L4P`), pensado para conectar más adelante ese nodo físico con
la app móvil y la página de monitoreo cuando estén listas: ese código será
el que identifique al nodo en los tres sistemas (sitio, monitoreo, app).

### Geocodificación por dirección (para hogares, empresas y comunidades)

Al crear un nodo, si no conoces las coordenadas exactas, puedes escribir la
dirección (y la comuna) y presionar "Buscar coordenadas desde la
dirección": el sistema las completa automáticamente usando un servicio
gratuito (OpenStreetMap Nominatim). Si no encuentra la dirección, puedes
ingresar las coordenadas a mano. Esto requiere que el servidor tenga acceso
a internet; en tu computador local funciona igual que en un hosting.

## 5. Mapa y geolocalización (sin Google Maps, sin costo)

El sitio usa **OpenStreetMap + Leaflet** para el mapa: es gratuito, no
requiere API key ni tarjeta de crédito, y no tiene límite de uso para un
sitio de este tamaño. La búsqueda de "paraderos cercanos a mí" calcula la
distancia real (fórmula de Haversine) contra las coordenadas reales del
sistema RED de Santiago.

### Si más adelante quieres usar Google Maps

Cuando tengas tu propia API Key de Google Maps, solo hay que reemplazar la
inicialización del mapa en `public-site/js/06b-map-leaflet.js` (las
funciones `initLeafletMap`, `initHomeMiniMap`, `initNodesMap`) por el SDK de
Google Maps. El resto del sistema —la base de datos de paraderos, el
cálculo de distancias, la geolocalización del visitante— no depende del
proveedor del mapa y no necesita cambios.

## 6. Subir el sitio a internet gratis (sin dominio propio)

Puedes desplegar este proyecto gratis en servicios como
[Render](https://render.com) o [Railway](https://railway.app). Ambos te dan
una dirección gratuita del tipo `tu-proyecto.onrender.com` mientras no
tengas un dominio propio.

Pasos generales (Render, como ejemplo):

1. Sube este proyecto a un repositorio de GitHub.
2. En Render, crea un nuevo "Web Service" y conéctalo a ese repositorio.
3. Configura:
   - **Build command**: `npm install`
   - **Start command**: `npm start`
4. En "Environment Variables", agrega `SESSION_SECRET` con un valor largo
   y secreto (no uses el de ejemplo).
5. Tras el primer despliegue, entra a la consola/shell de Render y corre una
   vez: `npm run seed:paraderos`, `npm run seed:demo` y `npm run create:admin -- ...`
   (los mismos comandos del paso 2, pero ejecutados en el servidor).

Importante: en el plan gratuito de estos servicios, el disco no siempre es
permanente entre reinicios. Si notas que la base de datos se reinicia sola,
busca la opción de "disco persistente" (persistent disk) del plan gratuito,
o considera pasar a una base de datos gestionada más adelante — el proyecto
está preparado para migrar a Postgres si algún día lo necesitas.

## 7. Seguridad antes de salir a producción

- Cambia `SESSION_SECRET` en `.env` por un valor propio y secreto.
- Cambia la contraseña de administrador por una fuerte y única.
- Este proyecto no envía correos automáticos (confirmaciones, notificaciones
  por email); las solicitudes y mensajes quedan guardados y visibles en el
  panel para que los gestiones manualmente. Si más adelante quieres correos
  automáticos, es un paso adicional que se puede agregar.

## Estructura técnica (resumen)

- **Backend**: Node.js + Express + `better-sqlite3` (base de datos en un
  solo archivo, sin servidor de base de datos aparte).
- **Autenticación del panel**: usuario/contraseña con `bcryptjs`, sesión
  con cookie firmada (`cookie-session`).
- **Frontend público**: HTML + JavaScript plano (sin framework), con un
  router por hash (`#/inicio`, `#/red-nodos`, etc.) para que todo funcione
  como una sola página, sin recargar.
- **Mapa**: Leaflet + OpenStreetMap.
- **Panel de administración**: HTML + JavaScript plano, mismo patrón que el
  sitio público, consumiendo la misma API.
