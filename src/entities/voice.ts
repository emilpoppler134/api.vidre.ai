import { Context } from "../index.js";
import { Voice } from "../models/Voice.js";

export const typeDefs = `#graphql
  type Voice {
    id: String!
    name: String
    description: String
    gradient: String
    sample: Sample
  }

  type Sample {
    duration: Float
  }

  type Query {
    voices: [Voice!]! @authorization
  }
`;

export const resolvers = {
  Query: {
    voices: async (parent: undefined, args: undefined, context: Context) => {
      return await Voice.find();
    },
  },
};
