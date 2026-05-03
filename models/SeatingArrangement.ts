import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatingArrangement extends Document {
  arrangements: any[]; // Using any[] here as requested, but typically this would be a structured sub-document
  sessionName: string;
  updatedAt: number;
}

const SeatingArrangementSchema: Schema = new Schema({
  arrangements: { type: Array, default: [] },
  sessionName: { type: String, required: true },
  updatedAt: { type: Number, default: Date.now },
});

export default mongoose.models.SeatingArrangement || mongoose.model<ISeatingArrangement>('SeatingArrangement', SeatingArrangementSchema);
