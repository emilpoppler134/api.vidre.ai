import { model, Schema, Types } from "mongoose";

enum UserType {
  GUEST = "GUEST",
  DEFAULT = "DEFAULT",
}

type IUser = {
  _id: Types.ObjectId;
  type: UserType;
  username: string;
  password_hash: string | null;
  name: string | null;
  age: number | null;
  wishlist: boolean | null;
  familiarity: string | null;
  purpose: string | null;
  work: string | null;
  tokens: number;
  timestamp: number;
};

const schema = new Schema<IUser>({
  type: {
    type: String,
    required: false,
    enum: ["GUEST", "DEFAULT"],
    default: () => UserType.GUEST,
  },
  username: {
    type: String,
    required: true,
  },
  password_hash: {
    type: String,
    required: false,
    default: () => null,
  },
  name: {
    type: String,
    required: false,
    default: () => null,
  },
  age: {
    type: Number,
    required: false,
    default: () => null,
  },
  wishlist: {
    type: Boolean,
    required: false,
    default: () => null,
  },
  familiarity: {
    type: String,
    required: false,
    default: () => null,
  },
  purpose: {
    type: String,
    required: false,
    default: () => null,
  },
  work: {
    type: String,
    required: false,
    default: () => null,
  },
  tokens: {
    type: Number,
    required: false,
    default: () => 0,
  },
  timestamp: {
    type: Number,
    required: false,
    default: () => Math.floor(new Date().getTime() / 1000),
  },
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export const User = model<IUser>("User", schema);
