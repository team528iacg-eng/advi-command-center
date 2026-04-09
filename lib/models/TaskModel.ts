import mongoose, { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
  id:          { type: String, required: true, unique: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  list:        { type: String },
  spaceId:     { type: String, required: true },
  status:      { type: String, default: 'todo' },
  priority:    { type: String, default: 'normal' },
  assignees:   [{ type: String }],
  due:         { type: String, default: '' },
  est:         { type: Number, default: 60 },
  logged:      { type: Number, default: 0 },
  tags:        [{ type: String }],
  subtasks:    [{ type: Schema.Types.Mixed }],
  comments:    [{ type: Schema.Types.Mixed }],
  createdAt:   { type: String },
}, { timestamps: true });

export const TaskModel = models.Task || model('Task', TaskSchema);
