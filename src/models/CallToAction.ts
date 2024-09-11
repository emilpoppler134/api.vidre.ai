import { model, Schema, Types } from "mongoose";

type ICallToAction = {
  _id: Types.ObjectId;
  value: string;
};

const schema = new Schema<ICallToAction>({
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

export const CallToAction = model<ICallToAction>("Call_To_Action", schema);
