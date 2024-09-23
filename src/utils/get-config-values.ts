import { Types } from "mongoose";
import { CallToAction } from "../models/CallToAction.js";
import { Hook } from "../models/Hook.js";
import { Retention } from "../models/Retention.js";

type ConfigFields = {
  hook: string | null;
  retention: string | null;
  callToAction: string | null;
};

export default async function getConfigValues(params: ConfigFields): Promise<ConfigFields> {
  const configReturn: ConfigFields = {
    hook: null,
    retention: null,
    callToAction: null,
  };

  if (params.hook !== null && Types.ObjectId.isValid(params.hook)) {
    const result = await Hook.findById(new Types.ObjectId(params.hook));
    configReturn.hook = result?.value ?? null;
  }
  if (params.retention !== null && Types.ObjectId.isValid(params.retention)) {
    const result = await Retention.findById(new Types.ObjectId(params.retention));
    configReturn.retention = result?.value ?? null;
  }
  if (params.callToAction !== null && Types.ObjectId.isValid(params.callToAction)) {
    const result = await CallToAction.findById(new Types.ObjectId(params.callToAction));
    configReturn.callToAction = result?.value ?? null;
  }

  if (params.hook === "Let Our AI Decide") configReturn.hook = "Let Our AI Decide";
  if (params.retention === "Let Our AI Decide") configReturn.retention = "Let Our AI Decide";
  if (params.callToAction === "Let Our AI Decide") configReturn.callToAction = "Let Our AI Decide";

  return configReturn;
}
