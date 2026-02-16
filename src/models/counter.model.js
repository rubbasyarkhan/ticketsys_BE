import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
  year: {
    type: Number,
    required: true,
  },
  sequence: {
    type: Number,
    default: 0,
  },
});

export const Counter = mongoose.model("Counter", counterSchema);
