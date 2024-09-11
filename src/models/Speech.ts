import { model, Schema, Types } from "mongoose";
import { IProject } from "./Project";

type ISpeech = {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  object: {
    key: string;
    extension: string;
  };
  voice: Types.ObjectId;
  created: number;
  expires: number;
};

export type ExtendedSpeech = Omit<ISpeech, "project"> & { project: IProject };

const schema = new Schema<ISpeech>({
  project: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Project",
  },
  object: {
    key: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
  },
  voice: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Voice",
  },
  created: {
    type: Number,
    required: false,
    default: () => Math.floor(new Date().getTime() / 1000),
  },
  expires: {
    type: Number,
    required: false,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return Math.floor(date.getTime() / 1000);
    },
  },
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export const Speech = model<ISpeech>("Speech", schema);
