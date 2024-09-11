import { model, Schema, Types } from "mongoose";

type IVoice = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  gradient: string;
  sample: {
    key: string;
    extension: string;
  };
  elevenlabs_id: string;
};

const schema = new Schema<IVoice>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  gradient: {
    type: String,
    required: true,
  },
  sample: {
    key: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
  },
  elevenlabs_id: {
    type: String,
    required: true,
  },
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export const Voice = model<IVoice>("Voice", schema);
