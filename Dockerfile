# Etapa 1: compilar React/Vite.
FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# Etapa 2: compilar TypeScript del backend.
FROM node:22-alpine AS backend-build
WORKDIR /backend
COPY backend/package*.json ./
RUN npm install --no-audit --no-fund
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# Etapa 3: imagen final de ejecución.
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force
COPY --from=backend-build /backend/dist ./dist
COPY --from=frontend-build /frontend/dist ./public
EXPOSE 10000
CMD ["node", "dist/server.js"]
