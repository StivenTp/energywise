import express, { ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { DomainError } from '../domain/Reading';
import { createRoutes } from './routes';
import { ReadingService } from '../application/ReadingService';
import { DashboardService } from '../application/DashboardService';
export function createApp(readings: ReadingService, dashboard: DashboardService) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', createRoutes(readings, dashboard));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta API no encontrada.' }));
  // En Render, el mismo servicio publica React compilado y su API.
  const staticDir = path.resolve(__dirname, '../../public');
  if (existsSync(path.join(staticDir, 'index.html'))) {
    app.use(express.static(staticDir, { maxAge: '1h', index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }
  const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof DomainError) { res.status(400).json({ error: error.message }); return; }
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ error: 'El JSON enviado no es válido.' }); return;
    }
    console.error('Error interno:', error);
    res.status(500).json({ error: 'No se pudo completar la operación.' });
  };
  app.use(handleError);
  return app;
}
