import mongoose, { Document, Schema } from "mongoose";

export namespace MongoUser {
  export const CollectionName = "users";

  export interface UserDocument extends Document {
    _id: string;
    emailAddress: string;
    password: string;
  }

  export const UserSchema = new Schema<UserDocument>({
    _id: { type: String, required: true },
    emailAddress: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  });

  export const UserModel = mongoose.model<UserDocument>(
    CollectionName,
    UserSchema
  );
}
