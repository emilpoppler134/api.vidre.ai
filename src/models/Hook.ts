import { model, Schema, Types } from "mongoose";

type IHook = {
  _id: Types.ObjectId;
  value: string;
};

const schema = new Schema<IHook>({
  value: {
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

export const Hook = model<IHook>("Hook", schema);
