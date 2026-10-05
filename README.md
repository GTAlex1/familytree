# Árbol genealógico (Firebase)

HTML + CSS + JS estático con Firebase (Auth + Firestore). Varios árboles, cada uno con un código de 5 letras mayúsculas.

## Cómo funciona
- Arriba a la izquierda se escribe el código para abrir un árbol.
- **Invitado:** hay que volver a escribir el código en cada recarga.
- **Con cuenta** (botón Login → Crear cuenta): los códigos desbloqueados se guardan en tu cuenta.
- **Admin:** crea árboles (se genera un código aleatorio), edita personas y ve todos los árboles.

## Configuración (una sola vez)
1. https://console.firebase.google.com → Crear proyecto.
2. Compilación → **Firestore Database** → Crear base de datos (modo producción).
3. Pestaña **Reglas** → pega `firestore.rules` → Publicar.
4. Compilación → **Authentication** → Comenzar → habilita **Correo electrónico/contraseña**.
5. Configuración del proyecto → Tus apps → Web (</>) → copia la config en `firebase-config.js`.
6. Authentication → Configuración → Dominios autorizados: añade `TU_USUARIO.github.io`.
7. Abre la página y **crea tu cuenta de admin** (Login → usuario `Kazus_01` + contraseña → Crear cuenta). Hazlo antes de compartir la web.
8. El UID de esa cuenta (Authentication → Usuarios) se pone en `firestore.rules` (función `isAdmin`) y en `firebase-config.js` (`ADMIN_UID`).
9. Recarga, entra como admin: **+ Nuevo árbol** y empieza a añadir personas.

## Seguridad
El código es el ID del documento y las reglas no permiten listar árboles, así que hace falta conocerlo. Hay 26^5 ≈ 11,8 millones de combinaciones; es suficiente para uso familiar, pero no es secreto de nivel bancario. Para endurecerlo, activa Firebase App Check.

## Despliegue automático (GitHub Actions)
`.github/workflows/deploy.yml` publica la web en cada push a `main` y sustituye `?v=__VERSION__` en `index.html` por el hash del commit, para que el navegador nunca use archivos viejos en caché.
Una sola vez: Settings → Pages → **Source: GitHub Actions** (en lugar de "Deploy from a branch").
Solo se publican `index.html`, `style.css`, `app.js` y `firebase-config.js`; si añades más archivos, agrégalos a la línea `cp` del workflow.

## Dar permisos de edición a otras personas
1. La otra persona crea su cuenta desde la web (Login → Crear cuenta).
2. Tú, como admin, abres el árbol y pulsas **Editores** → escribes su nombre de usuario → **Añadir editor**.
3. Esa persona verá el árbol en su selector (aunque no tenga el código) y podrá **añadir, editar, quitar y reordenar** miembros.
Los editores **no** pueden borrar el árbol, cambiar el código ni gestionar editores. Eso lo aplican las reglas de Firestore (`firestore.rules`), no solo la página.
Hay que **volver a publicar las reglas** (pestaña Reglas de Firestore) después de actualizar `firestore.rules`.