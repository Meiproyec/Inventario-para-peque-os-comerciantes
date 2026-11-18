# Mi Inventario (PWA)

Aplicación web progresiva para pequeños comerciantes.

## Publicar en GitHub Pages
1. Crea un repositorio público llamado `mi-inventario`.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio. No subas el ZIP como único archivo.
3. En GitHub abre **Settings > Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`, luego pulsa **Save**.
6. Espera a que GitHub Pages muestre la URL publicada.

## Probar localmente
Abre la carpeta en Visual Studio Code e inicia un servidor local (por ejemplo, Live Server). No abras el HTML con doble clic, porque los Service Workers requieren HTTPS o localhost.

## Funciones
- Alta, edición y eliminación de productos.
- Búsqueda y filtros por categoría y nivel de existencias.
- Entradas y salidas con validación de stock.
- Alertas de existencias bajas y resumen de inventario.
- Instalación PWA y caché offline.

## Importante sobre los datos
Esta versión guarda los datos en LocalStorage del navegador. No sincroniza los productos entre dispositivos ni guarda copias en la nube. Para eso se debe agregar una API y una base de datos.
