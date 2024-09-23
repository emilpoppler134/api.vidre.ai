import crypto from "crypto";
import { Types } from "mongoose";
import { Context } from "../index.js";
import { Project } from "../models/Project.js";
import { Speech } from "../models/Speech.js";
import { User } from "../models/User.js";
import { Voice } from "../models/Voice.js";
import { UserType } from "../utils/authentication.js";
import * as s3 from "../utils/aws-client.js";
import * as completion from "../utils/completion.js";
import * as errors from "../utils/errors.js";
import getConfigValues from "../utils/get-config-values.js";
import * as speech from "../utils/speech.js";

type CreateConfigParams = {
  hook: string | null;
  retention: string | null;
  callToAction: string | null;
};

type UpdateParams = {
  name: string;
  script: string;
};

export const typeDefs = `#graphql
  type Project {
    id: String!
    topic: String
    config: Config
    result: String
    name: String
    script: String
    speech: Speech
    timestamp: Int
  }

  type Config {
    hook: ConfigurationItem
    retention: ConfigurationItem
    callToAction: ConfigurationItem
  }

  type Speech {
    id: String!
    voice: Voice
    created: Int
    expires: Int
  }

  input CreateConfigParams {
    hook: String!
    retention: String!
    callToAction: String!
  }

  input UpdateParams {
    name: String
    script: String
  }

  type Query {
    projects: [Project!]! @authorization
    project(id: String): Project! @authorization
  }

  type Mutation {
    createProject(topic: String!, config: CreateConfigParams!): Project! @authorization
    generateSpeech(projectId: String, voiceId: String!): Project! @authorization
    updateProject(id: String, params: UpdateParams!): Project! @authorization
    removeProject(id: String): Boolean! @authorization
  }
`;

export const resolvers = {
  Query: {
    projects: async (parent: undefined, args: undefined, context: Context) => {
      const result = await Project.find({ user: context.user?.id })
        .populate({ path: "config.hook" })
        .populate({ path: "config.retention" })
        .populate({ path: "config.callToAction" })
        .populate({ path: "speech", populate: { path: "voice" } });

      return result;
    },
    project: async (parent: undefined, { id }: { id: string }, context: Context) => {
      if (context.user?.type === UserType.GUEST) {
        throw errors.authorizationGuestAccount();
      }
      if (!Types.ObjectId.isValid(id)) {
        throw errors.invalidParameters("id");
      }

      const result = await Project.findOne({
        _id: id,
        user: context.user?.id,
      })
        .populate({ path: "config.hook" })
        .populate({ path: "config.retention" })
        .populate({ path: "config.callToAction" })
        .populate({ path: "speech", populate: { path: "voice" } });

      if (result === null) {
        throw errors.projectNotFound();
      }

      return result;
    },
  },
  Mutation: {
    createProject: async (
      parent: undefined,
      { topic, config }: { topic: string; config: CreateConfigParams },
      context: Context
    ) => {
      const configValues = await getConfigValues(config);

      const invalidFields: Array<string> = [];
      if (configValues.hook === null) invalidFields.push("hook");
      if (configValues.retention === null) invalidFields.push("retention");
      if (configValues.callToAction === null) invalidFields.push("callToAction");

      if (invalidFields.length > 0) {
        throw errors.invalidParameters(invalidFields.join(", "));
      }

      const completionResult = await completion.create({
        topic: topic,
        hook: configValues.hook,
        retention: configValues.retention,
        callToAction: configValues.callToAction,
      });

      if (completionResult === null) {
        throw errors.serverError();
      }

      try {
        const result = await Project.create({
          user: context.user?.id,
          topic,
          config: {
            hook: config.hook === "Let Our AI Decide" ? null : config.hook,
            retention: config.retention === "Let Our AI Decide" ? null : config.retention,
            callToAction: config.callToAction === "Let Our AI Decide" ? null : config.callToAction,
          },
          result: completionResult,
          name: topic,
          script: completionResult,
        });

        return await Project.findOne({ _id: result.id })
          .populate({ path: "config.hook" })
          .populate({ path: "config.retention" })
          .populate({ path: "config.callToAction" })
          .populate({ path: "speech", populate: { path: "voice" } });
      } catch (e) {
        console.log(e);
        throw errors.serverError();
      }
    },
    generateSpeech: async (
      parent: undefined,
      { projectId, voiceId }: { projectId: string; voiceId: string },
      context: Context
    ) => {
      if (context.user?.type === UserType.GUEST) {
        throw errors.authorizationGuestAccount();
      }
      if (!Types.ObjectId.isValid(projectId)) {
        throw errors.invalidParameters("projectId");
      }
      if (!Types.ObjectId.isValid(voiceId)) {
        throw errors.invalidParameters("voiceId");
      }

      const projectResult = await Project.findOne({ _id: projectId });
      const voiceResult = await Voice.findOne({ _id: voiceId });

      if (projectResult === null) {
        throw errors.projectNotFound();
      }
      if (voiceResult === null) {
        throw errors.voiceNotFound();
      }

      const userResult = await User.findOne({ _id: context.user?.id });

      if (userResult === null || userResult.tokens < projectResult.script.length) {
        throw errors.speechOutOfTokens();
      }

      const buffer = await speech.create(voiceResult.elevenlabs_id, projectResult.script);

      const key = crypto.randomUUID();
      const extension = "mp3";
      const contentType = "audio/mpeg";
      const awsKey = `speeches/${key}.${extension}`;

      try {
        // Upload speech to aws
        await s3.uploadObject(buffer, awsKey, contentType);

        // Delete old speech
        await Speech.deleteOne({ _id: projectResult.speech });

        // Create new speech
        const result = await Speech.create({
          project: projectId,
          object: {
            key,
            extension,
          },
          voice: voiceId,
        });

        // Update project
        await Project.updateOne({ _id: projectId }, { speech: result.id });

        // Update user tokens
        await User.updateOne({ _id: context.user?.id }, { tokens: userResult.tokens - projectResult.script.length });

        // Return project
        return await Project.findOne({ _id: projectId })
          .populate({ path: "config.hook" })
          .populate({ path: "config.retention" })
          .populate({ path: "config.callToAction" })
          .populate({ path: "speech", populate: { path: "voice" } });
      } catch {
        throw errors.serverError();
      }
    },
    updateProject: async (
      parent: undefined,
      { id, params }: { id: string; params: UpdateParams },
      context: Context
    ) => {
      if (context.user?.type === UserType.GUEST) {
        throw errors.authorizationGuestAccount();
      }
      if (!Types.ObjectId.isValid(id)) {
        throw errors.invalidParameters("id");
      }

      const project = await Project.findOne({
        _id: id,
        user: context.user?.id,
      });

      if (project === null) {
        throw errors.projectNotFound();
      }

      try {
        await Project.updateOne(
          { _id: id },
          {
            $set: {
              name: params.name,
              script: params.script,
            },
          }
        );

        return await Project.findOne({ _id: id })
          .populate({ path: "config.hook" })
          .populate({ path: "config.retention" })
          .populate({ path: "config.callToAction" })
          .populate({ path: "speech", populate: { path: "voice" } });
      } catch {
        throw errors.serverError();
      }
    },
    removeProject: async (parent: undefined, { id }: { id: string }, context: Context) => {
      if (!Types.ObjectId.isValid(id)) {
        throw errors.invalidParameters("id");
      }

      const projectResult = await Project.findOne({
        _id: id,
        user: context.user?.id,
      });

      if (projectResult === null) {
        throw errors.projectNotFound();
      }

      try {
        if (projectResult.speech !== null) {
          await Speech.deleteOne({ _id: projectResult.speech });
        }

        const removeProjectResult = await Project.deleteOne({ _id: id });

        if (removeProjectResult.deletedCount === 0) {
          throw new Error();
        }

        return true;
      } catch {
        throw errors.serverError();
      }
    },
  },
};
