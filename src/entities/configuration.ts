import { Context } from "../index.js";
import { CallToAction } from "../models/CallToAction.js";
import { Hook } from "../models/Hook.js";
import { Retention } from "../models/Retention.js";

export const typeDefs = `#graphql
  type ConfigurationAlternatives {
    hooks: [ConfigurationItem]
    retentions: [ConfigurationItem]
    callToActions: [ConfigurationItem]
  }

  type ConfigurationItem {
    id: String
    value: String
    description: String
  }

  type Query {
    configurations: ConfigurationAlternatives @authorization
  }
`;

export const resolvers = {
  Query: {
    configurations: async (parent: undefined, args: undefined, context: Context) => {
      return {
        hooks: await Hook.find(),
        retentions: await Retention.find(),
        callToActions: await CallToAction.find(),
      };
    },
  },
};
