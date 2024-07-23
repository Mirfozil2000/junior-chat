import { Schema, model, Document } from "mongoose";

interface IMessage extends Document {
  sender: string;
  room: string;
  content: string;
  timestamp: Date;
  readBy: string[];
  file?: {
    url: string;
    filename: string;
  };
}

const messageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  room: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: { type: [String], default: [] },
  file: {
    url: { type: String },
    filename: { type: String },
  },
});

export default model<IMessage>("Message", messageSchema);
