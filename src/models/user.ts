import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default model<IUser>("User", userSchema);
