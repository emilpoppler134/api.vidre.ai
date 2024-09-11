import { GraphQLError } from "graphql";

export class UserInputError extends GraphQLError {
  constructor(errors: Array<{ key: string; message: string }>) {
    const state = Object.create(null);

    for (const { key, message } of errors) {
      if (key in state) {
        state[key].push(message);
      } else {
        state[key] = [message];
      }
    }

    super(errors.length === 1 ? errors[0].message : "The request is invalid", {
      extensions: {
        code: "BAD_USER_INPUT",
        state,
      },
    });
  }
}

class VidreError extends GraphQLError {
  constructor(message: string, code: string) {
    super(message, { extensions: { code } });
  }
}

export const serverError = (): Error => new VidreError("Something went wrong", "SERVER_ERROR");
export const invalidParameters = (...params: Array<string>): Error =>
  new VidreError(`Invalid parameters: ${params.join(", ")}`, "BAD_REQUEST");

export const authorizationAccessDenied = (): Error => new VidreError("Access denied", "FORBIDDEN");
export const authenticationExpiredToken = (): Error => new VidreError("Expired token given", "UNAUTHENTICATED");
export const authenticationInvalidScheme = (): Error =>
  new VidreError('Unsupported authentication scheme, use the "Bearer" scheme', "UNAUTHENTICATED");
export const authenticationInvalidToken = (): Error => new VidreError("Invalid token given", "UNAUTHENTICATED");
export const authenticationNotAuthenticated = (): Error => new VidreError("Not authenticated", "UNAUTHENTICATED");

export const userCreationEmailTaken = (): Error =>
  new VidreError("Someone already has that username", "USER_CREATION_EMAIL_TAKEN");
export const userCompletionNotGuest = (): Error =>
  new VidreError("You already have a completed account", "USER_COMPLETION_NOT_GUEST");

export const projectNotFound = (): Error => new VidreError("There is no project with that id", "NOT_FOUND");
export const voiceNotFound = (): Error => new VidreError("There is no voice with that id", "NOT_FOUND");
