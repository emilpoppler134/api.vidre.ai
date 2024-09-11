import { model, Schema, Types } from "mongoose";

type IRetention = {
  _id: Types.ObjectId;
  value: string;
  description: string;
};

const schema = new Schema<IRetention>({
  value: {
    type: String,
    required: true,
  },
  description: {
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

export const Retention = model<IRetention>("Retention", schema);
