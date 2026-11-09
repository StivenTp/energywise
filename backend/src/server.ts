import 'dotenv/config';
import mongoose from 'mongoose';
import { ReadingService } from './application/ReadingService';
import { DashboardService } from './application/DashboardService';
import { MongoReadingRepository } from './infrastructure/mongodb/MongoReadingRepository';
import { createApp } from './presentation/app';
async function start(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI en las variables de entorno.');
  const dbName = process.env.MONGO_DB_NAME || 'energywise';
  await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB conectado a la base de datos: ${dbName}`);
  // Composición de dependencias: el dominio no conoce Mongoose ni Express.
  const repository = new MongoReadingRepository();
  const app = createApp(new ReadingService(repository), new DashboardService(repository));
  const port = Number(process.env.PORT || 10000);
  const server = app.listen(port, '0.0.0.0', () => console.log(`EnergyWise escuchando en ${port}`));
  const stop = () => server.close(() => mongoose.disconnect().finally(() => process.exit(0)));
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}
start().catch(error => {
  console.error('No se pudo iniciar la aplicación:', error instanceof Error ? error.message : error);
  process.exit(1);
});
