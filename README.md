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
8. En Authentication → Usuarios, copia el **UID** de esa cuenta.
9. Firestore → Iniciar colección `admins` → ID del documento = ese UID → añade cualquier campo (p. ej. `admin: true`).
10. Recarga, entra como admin: **+ Nuevo árbol**, abre el árbol y pulsa **Datos iniciales** para cargar la familia de ejemplo.

## Seguridad
El código es el ID del documento y las reglas no permiten listar árboles, así que hace falta conocerlo. Hay 26^5 ≈ 11,8 millones de combinaciones; es suficiente para uso familiar, pero no es secreto de nivel bancario. Para endurecerlo, activa Firebase App Check.
