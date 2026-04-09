import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  id:             { type: String, required: true, unique: true },
  from:           { type: String, required: true },
  to:             { type: String },
  conversationId: { type: String },
  text:           { type: String, required: true },
  time:           { type: String },
}, { timestamps: true });

export const MessageModel = models.Message || model('Message', MessageSchema);
