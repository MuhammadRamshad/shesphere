
import mongoose, { Schema, Document } from 'mongoose';

export interface IPeriodData extends Document {
  userId: string;
  date: Date;
  periodStart: boolean;
  periodEnd: boolean;
  symptoms: string[];
  flow: 'light' | 'medium' | 'heavy' | null;
  mood: string[];
  notes: string;
  temperature?: number;
  medications?: string[];
  spotting?: boolean;
  intercourse?: boolean;
}

const PeriodDataSchema: Schema = new Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  periodStart: { type: Boolean, default: false },
  periodEnd: { type: Boolean, default: false },
  symptoms: [{ type: String }],
  flow: { type: String, enum: ['light', 'medium', 'heavy', null], default: null },
  mood: [{ type: String }],
  notes: { type: String, default: '' },
  temperature: { type: Number },
  medications: [{ type: String }],
  spotting: { type: Boolean },
  intercourse: { type: Boolean }
}, { timestamps: true });

export default mongoose.model<IPeriodData>('PeriodData', PeriodDataSchema);
