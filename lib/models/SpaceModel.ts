import { Schema, model, models } from 'mongoose';

const SpaceSchema = new Schema({
  id:    { type: String, required: true, unique: true },
  name:  { type: String, required: true },
  color: { type: String, default: '#6B7280' },
  emoji: { type: String, default: 'folder' },
}, { timestamps: true });

export const SpaceModel = models.Space || model('Space', SpaceSchema);
