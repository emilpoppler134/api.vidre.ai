import { model, Schema, Types } from "mongoose";

export type IProject = {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  topic: string;
  config: {
    hook: Types.ObjectId | null;
    retention: Types.ObjectId | null;
    callToAction: Types.ObjectId | null;
  };
  result: string;
  name: string;
  script: string;
  speech: Types.ObjectId | null;
  timestamp: number;
};

const schema = new Schema<IProject>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  topic: {
    type: String,
    required: true,
  },
  config: {
    hook: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Hook",
    },
    retention: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Retention",
    },
    callToAction: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Call_To_Action",
    },
  },
  result: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  script: {
    type: String,
    required: true,
  },
  speech: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "Speech",
    default: () => null,
  },
  timestamp: {
    type: Number,
    required: true,
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

export const Project = model<IProject>("Project", schema);
