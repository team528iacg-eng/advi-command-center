import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  id:       { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'Member' },
  initials: { type: String },
  color:    { type: String },
  bg:       { type: String },
  isAdmin:  { type: Boolean, default: false },
}, { timestamps: true });

export const UserModel = models.User || model('User', UserSchema);
