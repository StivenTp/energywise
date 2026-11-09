import { Router, Request, Response, NextFunction } from 'express';
import { ReadingService } from '../application/ReadingService';
import { DashboardService } from '../application/DashboardService';
const asyncRoute = (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => { Promise.resolve(handler(req, res)).catch(next); };
export function createRoutes(readings: ReadingService, dashboard: DashboardService): Router {
  const router = Router();
  router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'energywise-api' }));
  router.get('/readings', asyncRoute(async (_req, res) => { res.json(await readings.list()); }));
  router.post('/readings', asyncRoute(async (req, res) => { res.status(201).json(await readings.create(req.body)); }));
  router.put('/readings/:id', asyncRoute(async (req, res) => {
    const result = await readings.update(req.params.id, req.body);
    if (!result) { res.status(404).json({ error: 'Registro no encontrado.' }); return; }
    res.json(result);
  }));
  router.delete('/readings/:id', asyncRoute(async (req, res) => {
    const deleted = await readings.remove(req.params.id);
    if (!deleted) { res.status(404).json({ error: 'Registro no encontrado.' }); return; }
    res.status(204).end();
  }));
  router.get('/dashboard', asyncRoute(async (req, res) => { res.json(await dashboard.execute(req.query.goal)); }));
  router.post('/demo/seed', asyncRoute(async (_req, res) => {
    const created = await readings.seedExamples();
    if (!created) { res.status(409).json({ error: 'Solo se pueden cargar ejemplos si no hay registros.' }); return; }
    res.status(201).json({ created });
  }));
  return router;
}
