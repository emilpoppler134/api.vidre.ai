import crypto from "crypto";
import { Context } from "../index.js";
import { User } from "../models/User.js";
import { getExpires, signToken, UserType } from "../utils/authentication.js";
import * as errors from "../utils/errors.js";

type CompleteParams = {
  name: string;
  age: string;
  wishlist: boolean;
  purpose: string;
  familiarity: string;
  work: string | null;
  password: string;
};

// This regex will enforce that:
//  - The string starts with a letter.
//  - The string has at least one number.
//  - The string is at least 6 characters long.
//  - Only alphanumeric characters or #$@!%&*? special characters are allowed.
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z][A-Za-z\d#$@!%&*?]{5,}$/;

export const typeDefs = `#graphql
  type AccessToken {
    expires: Int!
    token: String!
  }

  enum UserType {
    GUEST
    DEFAULT
  }

  type User {
    id: String!
    type: UserType
    username: String

    name: String
    age: Int
    wishlist: Boolean
    familiarity: String
    purpose: String
    work: String
    tokens: Int

    timestamp: Int
  }

  input CompleteParams {
    purpose: String!
    familiarity: String!
    name: String!
    age: String!
    password: String!
  }

  type Query {
    me: User! @authorization
  }

  type Mutation {
    login(username: String!, password: String): AccessToken!
    complete(params: CompleteParams!): Boolean! @authorization
    refreshAccessToken: AccessToken! @authorization
  }
`;

export const resolvers = {
  Query: {
    me: async (parent: undefined, args: undefined, context: Context) => {
      return User.findOne({ _id: context.user?.id });
    },
  },
  Mutation: {
    login: async (parent: undefined, { username, password }: { username: string; password?: string }) => {
      let findUser = await User.findOne({ username });

      if (findUser !== null && findUser.type === UserType.DEFAULT) {
        if (password === undefined) {
          throw errors.preconditionRequired();
        }

        const password_hash = crypto.createHash("sha256").update(password).digest("hex");
        if (findUser.password_hash !== password_hash) {
          throw errors.invalidCredentials();
        }
      }

      try {
        const result = findUser === null ? await User.create({ username }) : findUser;

        const token = signToken({
          id: result.id,
          type: result.type,
          username: result.username,
          name: result.name,
        });

        const expires = getExpires(token);

        return { expires, token };
      } catch {
        throw errors.serverError();
      }
    },
    complete: async (parent: undefined, { params }: { params: CompleteParams }, context: Context) => {
      const result = await User.findOne({ _id: context.user?.id });

      if (result === null) {
        throw errors.serverError();
      }

      if (result.type !== UserType.GUEST) {
        throw errors.userCompletionNotGuest();
      }

      const invalidParameters: Array<string> = [];

      if (params.name.trim() === "") invalidParameters.push("name");
      if (params.age.trim() === "") invalidParameters.push("age");
      if (params.purpose.trim() === "") invalidParameters.push("purpose");
      if (params.familiarity.trim() === "") invalidParameters.push("familiarity");
      if (!params.password.match(passwordRegex)) invalidParameters.push("password");

      if (invalidParameters.length > 0) {
        throw errors.invalidParameters(...invalidParameters);
      }

      try {
        const password_hash = crypto.createHash("sha256").update(params.password).digest("hex");

        const updateParams = {
          type: UserType.DEFAULT,
          name: params.name,
          age: params.age,
          purpose: params.purpose,
          familiarity: params.familiarity,
          tokens: 1500,
          password_hash: password_hash,
        };

        await User.updateOne({ _id: result.id }, { $set: updateParams });

        return true;
      } catch {
        throw errors.serverError();
      }
    },
    refreshAccessToken: async (parent: undefined, args: undefined, context: Context) => {
      const result = await User.findOne({ _id: context.user?.id });

      if (result === null) {
        throw errors.serverError();
      }

      const token = signToken({
        id: result.id,
        type: result.type,
        username: result.username,
        name: result.name,
      });

      const expires = getExpires(token);

      return { expires, token };
    },
  },
};
