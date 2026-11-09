# EnergyWise — MongoDB Atlas + Render

Aplicación moderna **full-stack** para registrar y analizar consumo eléctrico de un hogar. Proyecto académico de Arquitectura de Software con **arquitectura hexagonal**, **Clean Code**, **refactorización** y **principios SOLID**.

**Tecnologías:** React 18 + TypeScript + Vite, Node.js 22 + Express + TypeScript, MongoDB Atlas + Mongoose y Render + Docker.

## Funcionalidades entregadas

- Crear, consultar, actualizar y eliminar lecturas energéticas (CRUD real en MongoDB).
- Registrar período, categoría, kWh, tarifa en COP/kWh y descripción.
- Visualizar costo mensual estimado, consumo, meta configurable y comparativo mensual.
- Gráfico de consumo de seis meses y desglose por categoría.
- Recomendaciones automáticas derivadas de reglas de negocio (sin IA externa).
- Cargar 24 registros de ejemplo **solo cuando la colección está vacía**.
- Filtrar el historial de lecturas; vista específica de arquitectura y SOLID.
- API REST, validación en dominio, manejo de errores, pruebas del dominio.

## Estructura del repositorio

```text
energywise-mongodb-render/
├── backend/
│   ├── src/
│   │   ├── domain/                      # Entidades, validación y análisis puros
│   │   ├── application/                 # Casos de uso
│   │   │   └── ports/                   # Interfaz ReadingRepository
│   │   ├── infrastructure/mongodb/      # Adaptador Mongoose
│   │   ├── presentation/                # Adaptador HTTP / Express
│   │   └── server.ts                    # Inyección de dependencias
│   ├── tests/                           # Pruebas unitarias
│   └── .env.example
├── frontend/
│   └── src/                             # React + TypeScript
├── docs/
│   └── ARQUITECTURA.md                  # Documentación académica
├── Dockerfile                           # Render: backend + frontend en un servicio
├── render.yaml                          # Despliegue declarativo
└── README.md
```

## 1. Crear MongoDB Atlas

1. Entra a https://www.mongodb.com/atlas y crea un proyecto y un clúster (por ejemplo, el nivel gratuito si está disponible).
2. Ve a **Database Access** y crea un usuario de base de datos con permisos de lectura y escritura sobre la base `energywise`.
3. En **Network Access** autoriza **los rangos de IP de salida de tu servicio de Render**. Los encuentras en Render > tu servicio > **Connect** > **Outbound**. Para hacer pruebas locales, agrega temporalmente tu IP pública. Evita `0.0.0.0/0` salvo que entiendas el riesgo: permite conexiones desde cualquier IP.
4. Dentro del clúster, selecciona **Connect > Drivers** y copia tu cadena de conexión:

```env
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.ejemplo.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=energywise
PORT=10000
```

Reemplaza los valores ficticios; si la contraseña tiene caracteres especiales, codifícala para una URL. **Nunca subas tu URI real a GitHub**: usa variables de entorno.

## 2. Ejecutar localmente

Requisitos: Node.js 22+, npm y una conexión válida a MongoDB Atlas.

Abre una terminal:

```bash
cd backend
npm install
```

Copia `backend/.env.example` como `backend/.env`, reemplaza `MONGODB_URI` y ejecuta:

```bash
npm run dev
```

El backend queda disponible en `http://localhost:10000` y el control de salud en `http://localhost:10000/api/health`.

Abre otra terminal desde la raíz:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite redirige las solicitudes `/api` al backend local. No debes cambiar direcciones del frontend.

Para comprobar pruebas y compilación:

```bash
cd backend
npm test
npm run build
cd ../frontend
npm run build
```

## 3. Subir a GitHub

Crea un repositorio vacío en GitHub y, desde la carpeta raíz del proyecto (no desde `backend`), ejecuta:

```bash
git init
git add .
git commit -m "EnergyWise con MongoDB y arquitectura hexagonal"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/energywise.git
git push -u origin main
```

Especifica tu usuario y repositorio. Los archivos `.env` están en `.gitignore`.

## 4. Publicar en Render

La opción más sencilla es **un servicio Docker**, que publica la aplicación React y la API bajo el mismo dominio (sin variables `VITE_API_URL`, sin CORS y sin un segundo servicio).

1. Entra a https://dashboard.render.com y selecciona **New > Web Service**.
2. Conecta tu repositorio de GitHub.
3. Selecciona **Language: Docker**, **Dockerfile Path: `./Dockerfile`**, **Docker Context: `.`** y el plan gratuito si está disponible.
4. En **Environment**, agrega:
   - `MONGODB_URI`: tu cadena de conexión real (secreta).
   - `MONGO_DB_NAME`: `energywise`.
   - `NODE_ENV`: `production`.
5. Configura la ruta de health check como `/api/health` (ya está indicada en `render.yaml` si utilizas Blueprints).
6. Finaliza el despliegue. Render construirá React y el backend dentro del Dockerfile, arrancará Express en el puerto configurado y publicará el sitio.
7. Copia los **rangos de IP de salida** de tu servicio desde **Connect > Outbound** y añádelos en **MongoDB Atlas > Network Access**. Si aún no los habías habilitado, realiza un redeploy después.
8. Verifica `https://TU_SERVICIO.onrender.com/api/health`; debería responder `{"status":"ok","service":"energywise-api"}`. Luego visita la raíz del dominio para ver la web.

**Opción alternativa:** en Render puedes usar **New > Blueprint** y seleccionar el repositorio que incluye `render.yaml`. Te pedirá el valor secreto de `MONGODB_URI`.

**Nota:** en el plan Free, Render puede suspender temporalmente el servicio por inactividad y tardar algo en responder a la primera visita. La información permanece en MongoDB Atlas, no en el disco efímero de Render.

## 5. Documentación de endpoints

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/readings` | Listar lecturas |
| POST | `/api/readings` | Crear lectura |
| PUT | `/api/readings/:id` | Editar lectura completa |
| DELETE | `/api/readings/:id` | Eliminar lectura |
| GET | `/api/dashboard?goal=360` | Datos agregados y análisis |
| POST | `/api/demo/seed` | Cargar datos de ejemplo si está vacío |

**Ejemplo de JSON para `POST /api/readings`:**

```json
{
  "period": "2026-11",
  "category": "Iluminación",
  "kwh": 40,
  "pricePerKwh": 890,
  "note": "Bombillos LED"
}
```

En caso de error de validación, el servidor responde HTTP 400 con un mensaje en español.

## 6. Evidencias para entregar

- Captura del dashboard con registros reales y gráfico.
- Captura del CRUD (crear/editar/eliminar) funcionando.
- Captura de la colección `readings` en MongoDB Atlas.
- Captura del panel de Render con el servicio desplegado correctamente.
- URL pública de Render y repositorio de GitHub.
- Archivo `docs/ARQUITECTURA.md` como explicación de capas, flujo, SOLID, Clean Code y refactorización.
- Resultado de `npm test` del backend.

## Consideraciones de seguridad y alcance

Este proyecto está preparado para **demostración académica, no para manejar datos privados en producción**. No incluye registro/inicio de sesión ni autorización: cualquier visitante que conozca la URL puede agregar, modificar o borrar registros. Usa únicamente información ficticia al publicarlo; antes de usarlo con usuarios reales, añade autenticación, autorización, limitación de solicitudes, auditoría y separación por usuario. La meta mensual se guarda en el navegador mediante `localStorage`, mientras que las lecturas se guardan en MongoDB.


## Evidencias para la actividad académica

Consultar [Cumplimiento de los cuatro requisitos](docs/CUMPLIMIENTO_ACTIVIDAD.md): problema, frameworks, arquitectura hexagonal, SOLID, Clean Code, refactorización y pruebas.
