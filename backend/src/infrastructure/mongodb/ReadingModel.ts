import { Schema, model } from 'mongoose';
import { CATEGORIES } from '../../domain/Reading';
const schema = new Schema({
  period: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
  category: { type: String, enum: CATEGORIES, required: true },
  kwh: { type: Number, min: 0.01, max: 1000000, required: true },
  pricePerKwh: { type: Number, min: 0, max: 10000000, required: true },
  note: { type: String, maxlength: 180, default: '' }
}, { timestamps: true, versionKey: false });
schema.index({ period: -1, createdAt: -1 });
export const ReadingModel = model('Reading', schema);
