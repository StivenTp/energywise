import { Types } from 'mongoose';
import { Reading, ReadingInput } from '../../domain/Reading';
import { ReadingRepository } from '../../application/ports/ReadingRepository';
import { ReadingModel } from './ReadingModel';
type MongoReading = ReadingInput & { _id: Types.ObjectId; createdAt: Date };
function mapReading(doc: MongoReading): Reading {
  return {
    id: String(doc._id), period: doc.period, category: doc.category,
    kwh: doc.kwh, pricePerKwh: doc.pricePerKwh, note: doc.note,
    createdAt: doc.createdAt.toISOString()
  };
}
/** Adaptador de salida: reemplazable por otro motor sin cambiar los casos de uso. */
export class MongoReadingRepository implements ReadingRepository {
  async findAll(): Promise<Reading[]> {
    const docs = await ReadingModel.find().sort({ period: -1, createdAt: -1 }).limit(1000).lean();
    return docs.map(doc => mapReading(doc as MongoReading));
  }
  async create(input: ReadingInput): Promise<Reading> {
    const doc = await ReadingModel.create(input);
    return mapReading(doc.toObject() as MongoReading);
  }
  async update(id: string, input: ReadingInput): Promise<Reading | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await ReadingModel.findByIdAndUpdate(id, input, { new: true, runValidators: true }).lean();
    return doc ? mapReading(doc as MongoReading) : null;
  }
  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    return Boolean(await ReadingModel.findByIdAndDelete(id));
  }
  async count(): Promise<number> { return ReadingModel.countDocuments(); }
  async createMany(inputs: ReadingInput[]): Promise<number> {
    const docs = await ReadingModel.insertMany(inputs);
    return docs.length;
  }
}
