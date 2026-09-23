# Aula Virtual – Guía de despliegue

Arquitectura: **GitHub Pages** (`index.html` + `app.js`) → `fetch` → **Google Apps Script** (Web App JSON) → **Google Sheets**.

## 1. Preparar la hoja de Google Sheets
1. Crea una hoja nueva en [sheets.google.com](https://sheets.google.com).
2. Renombra la primera pestaña a **`Estudiantes_Notas`** con esta estructura (fila 1 = encabezados):

| Curso | Documento | Nombre | Taller 1 | Quiz 1 | Proyecto | Observaciones |
|---|---|---|---|---|---|---|
| 901 | 1001234567 | Ana Pérez | 4.5 | 3.8 | 4.0 | Buen trabajo |

   - Desde la columna D, **cada columna es una actividad** (puedes agregar las que quieras). Usa notas numéricas de 0 a 5.
   - `Observaciones` es opcional. Formatea la columna **Documento** como *Texto plano* para no perder ceros iniciales.
3. La pestaña **`Respuestas_Autoevaluacion`** se crea sola en el paso 2.3 (`Fecha | Curso | Documento | Nombre | Detalle_Rubrica | Nota_Sugerida | Reflexion`).

## 2. Desplegar Google Apps Script
1. En la hoja: **Extensiones → Apps Script**.
2. Borra el contenido y pega todo `google_apps_script.gs`. Guarda.
3. Selecciona la función `crearPestanas` y pulsa **Ejecutar** (acepta los permisos). Si ya creaste `Estudiantes_Notas`, solo añadirá la otra pestaña.
4. **Implementar → Nueva implementación → ⚙ Aplicación web**:
   - *Ejecutar como*: **Yo**
   - *Quién tiene acceso*: **Cualquier persona**
5. Pulsa **Implementar** y copia la **URL** (termina en `/exec`).
6. Prueba en el navegador: `URL/exec?action=cursos` debe devolver `{"ok":true,"cursos":[...]}`.

> ⚠️ Cada vez que cambies el script debes ir a **Implementar → Administrar implementaciones → Editar → Versión nueva**; la URL no cambia.

## 3. Configurar el frontend
En `app.js`, sección `CONFIG` y `DATA`:
- `API_URL`: pega la URL `/exec`.
- **PDF de Drive**: sube el archivo → clic derecho → *Compartir* → **Cualquier persona con el enlace (lector)**. En el enlace `drive.google.com/file/d/`**`ESTE_ES_EL_ID`**`/view`, copia el ID en `drive:`.
- **Videos**: en `yt:` va el ID después de `v=` en el enlace de YouTube (el video debe permitir insertarlo).
- **Libro**: mismo procedimiento que un PDF en `libro:`.
- Edita `topics`, `rubrica` y `unidades` con tus contenidos.

## 4. Publicar en GitHub Pages
1. Crea un repositorio público en GitHub (ej. `aula-virtual`).
2. Sube `index.html` y `app.js` a la raíz (**Add file → Upload files**).
3. **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save**.
4. En 1–2 minutos estará en `https://TU_USUARIO.github.io/aula-virtual/`.

## Notas de seguridad y mantenimiento
- El **documento de identidad funciona como una clave débil**: cualquiera que lo conozca puede ver esas notas. Para más protección, añade un PIN por estudiante (columna extra) y valídalo en `consultarNotas`.
- El script solo devuelve la fila del estudiante consultado; la hoja completa nunca se expone. No compartas públicamente la hoja.
- Los datos de sesión se guardan en `localStorage` del navegador; el botón *Cerrar sesión* los borra.
- Si aparece "No pudimos conectar con el servidor": confirma que el acceso sea *Cualquier persona* y que la URL termine en `/exec`, no en `/dev`.
- Cuotas de Apps Script: suficientes para un aula (miles de consultas/día).
