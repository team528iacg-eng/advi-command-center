import { Schema, model, models } from 'mongoose';

const ConversationSchema = new Schema({
  id:        { type: String, required: true, unique: true },
  name:      { type: String },
  type:      { type: String, enum: ['dm', 'group'], default: 'dm' },
  members:   [{ type: String }],
  createdAt: { type: String },
}, { timestamps: true });

export const ConversationModel = models.Conversation || model('Conversation', ConversationSchema);
