# EnergyWise — Evidencias de la actividad

## 1. Problema seleccionado
Los hogares y pequeños negocios no siempre conocen cuánto consumen sus equipos eléctricos ni cómo cambia su costo mes a mes. **EnergyWise** permite registrar consumos por período y categoría, calcular costos en COP, visualizar tendencias y comparar con una meta mensual. Los datos se almacenan en MongoDB Atlas.

## 2. Frameworks
- **Backend:** Express con TypeScript y Node.js. API REST en `backend/src/presentation/routes.ts`.
- **Frontend:** React con TypeScript y Vite. Pantallas y componentes en `frontend/src/`.
- **Persistencia:** MongoDB Atlas y Mongoose, mediante `MongoReadingRepository`.
- **Publicación:** Docker en Render; código versionado en GitHub.

## 3. Arquitectura hexagonal
- **Dominio:** `domain/Reading.ts`, `domain/Analytics.ts`: reglas de validación y análisis; sin dependencias de Express/Mongoose.
- **Aplicación:** `application/ReadingService.ts`, `DashboardService.ts`: casos de uso.
- **Puertos:** `application/ports/ReadingRepository.ts`: interfaces que definen operaciones sin fijar base de datos.
- **Adaptadores de entrada:** `presentation/routes.ts`: recibe peticiones HTTP y llama a los servicios.
- **Adaptador de salida:** `infrastructure/mongodb/MongoReadingRepository.ts`: implementa los puertos usando Mongoose.
- **Composición:** `presentation/app.ts`: conecta adaptadores y casos de uso.

Flujo: React → Express → servicio de aplicación → puerto de repositorio ← adaptador MongoDB → Atlas.

## 4. Evidencias SOLID
| Principio | Evidencia verificable |
|---|---|
| S (responsabilidad única) | `Reading.ts` valida datos, `ReadingService.ts` coordina operaciones, `MongoReadingRepository.ts` persiste; `buildDemoReadings.ts` genera ejemplos. |
| O (abierto/cerrado) | Una nueva implementación de `ReadingRepository` puede reemplazar MongoDB sin reescribir los casos de uso. |
| L (sustitución de Liskov) | `tests/application.test.ts` ejecuta los servicios con un repositorio en memoria que cumple el mismo contrato. |
| I (segregación de interfaces) | `ReadingQueryPort` separa consultas de `ReadingCommandPort`; `DashboardService` depende solo de `ReadingQueryPort`. |
| D (inversión de dependencias) | Los servicios reciben interfaces mediante sus constructores; no importan Mongoose. |

## 5. Código limpio y refactorización realizada
**Antes:** `ReadingService.seedExamples()` combinaba verificación de registros, definición de categorías, cálculo de valores y persistencia. **Después:** el método solo verifica la precondición y delega a `buildDemoReadings(periods)`; esta función es pura, reutilizable y comprobable sin MongoDB. Se mantuvo el comportamiento de generar 24 lecturas para seis meses.

Además, se segregó el puerto de lectura del de escritura, reduciendo las dependencias del dashboard. Nombres descriptivos, tipos explícitos, validación en dominio y pruebas automatizadas contribuyen a la legibilidad y al mantenimiento.

## 6. Pruebas
En `backend`: `npm install` y `npm test`. Las pruebas incluyen validación, costos, dashboard, generación de 24 ejemplos, prevención de duplicados y sustitución por repositorio en memoria. Para comprobar el despliegue, visitar `/api/health` y `/api/readings` en la URL pública.

## 7. Entrega
Subir todo el código a GitHub y compartir la URL del repositorio. Como evidencia complementaria, compartir el enlace público de Render y capturas del dashboard, MongoDB Atlas y pruebas.

**Nota:** `POST /api/demo/seed` devuelve HTTP 409 cuando ya existen lecturas; es un comportamiento intencional para evitar duplicados, no una falla de conexión.
