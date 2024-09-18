import { GraphQLError } from "graphql";

class VidreError extends GraphQLError {
  constructor(message: string, code: string) {
    super(message, { extensions: { code } });
  }
}

export const serverError = () => new VidreError("Something went wrong", "SERVER_ERROR");
export const invalidParameters = (...params: Array<string>) =>
  new VidreError(`Invalid parameters: ${params.join(", ")}`, "BAD_REQUEST");

export const authorizationAccessDenied = () => new VidreError("Access denied", "FORBIDDEN");
export const authenticationExpiredToken = () => new VidreError("Expired token given", "UNAUTHENTICATED");
export const authenticationInvalidScheme = () =>
  new VidreError('Unsupported authentication scheme, use the "Bearer" scheme', "UNAUTHENTICATED");
export const authenticationInvalidToken = () => new VidreError("Invalid token given", "UNAUTHENTICATED");
export const authenticationNotAuthenticated = () => new VidreError("Not authenticated", "UNAUTHENTICATED");

export const preconditionRequired = () => new VidreError("Precondition required", "PRECONDITION_REQUIRED");
export const invalidCredentials = () =>
  new VidreError("Wrong email or password. Please check your details.", "INVALID_CREDENTIALS");

export const userCompletionNotGuest = () =>
  new VidreError("You already have a completed account", "USER_COMPLETION_NOT_GUEST");

export const projectNotFound = () => new VidreError("There is no project with that id", "NOT_FOUND");
export const voiceNotFound = () => new VidreError("There is no voice with that id", "NOT_FOUND");
