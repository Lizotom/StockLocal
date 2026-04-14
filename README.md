# StockLocal PWA

StockLocal es una aplicación PWA para administrar inventario de productos. La versión final incluye diseño responsive para celular, almacenamiento local con IndexedDB, funcionamiento parcial sin conexión, consumo de API, service worker, manifest, metadatos SEO y notificaciones.

## Funcionalidades cubiertas

- Diseño responsive para escritorio y celular.
- Instalación como PWA desde navegador móvil o escritorio.
- Manifest configurado con íconos, nombre, tema y modo standalone.
- Service Worker para cache de recursos, fallback offline y cache de respuestas GET del API.
- IndexedDB para guardar productos localmente.
- Acciones offline pendientes para crear, editar o eliminar productos.
- Sincronización automática cuando vuelve la conexión.
- Notificaciones al iniciar sesión, guardar productos y sincronizar acciones.
- Metadatos SEO básicos, Open Graph y soporte mobile web app.

## Ejecutar en local

```bash
npm install
npm run dev
```

La aplicación se abrirá normalmente en Vite.

## Configurar API

El frontend usa la variable:

```env
VITE_API_URL=http://localhost/stocklocal-pwa/backend/index.php
```

Para desarrollo local puedes copiar `.env.example` a `.env`:

```bash
cp .env.example .env
```

En Windows, puedes crear el archivo manualmente y pegar el contenido de `.env.example`.

## Importante para celular y Vercel

Si subes solo el frontend a Vercel, no uses `localhost` como API, porque en celular `localhost` apunta al teléfono y no a tu computadora.

Para producción necesitas publicar también el backend PHP/MySQL en un servidor con HTTPS y configurar en Vercel:

```env
VITE_API_URL=https://tu-dominio.com/backend/index.php
```

Luego debes volver a desplegar la aplicación.

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. En Vercel, importa el repositorio.
3. Framework Preset: Vite.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. En Environment Variables agrega `VITE_API_URL` con la URL real del backend publicado.
7. Deploy.

## Prueba offline

1. Abre la aplicación con internet.
2. Inicia sesión.
3. Entra a Productos y carga los datos.
4. Abre DevTools > Application > IndexedDB y verifica `stocklocal-db`.
5. Activa modo offline desde DevTools o desconecta internet.
6. La aplicación debe mostrar datos locales y el banner de modo offline.
7. Crea, edita o elimina un producto.
8. Recupera la conexión.
9. La aplicación intentará sincronizar las acciones pendientes.

## Prueba de instalación PWA

En Chrome escritorio:

1. Abre la URL publicada.
2. Presiona el icono de instalar en la barra del navegador.
3. Abre la app instalada.

En Android:

1. Abre la URL en Chrome.
2. Menú de tres puntos.
3. Instalar app o Agregar a pantalla principal.
4. Abre StockLocal desde el ícono instalado.

En iPhone:

1. Abre la URL en Safari.
2. Compartir.
3. Agregar a pantalla de inicio.
