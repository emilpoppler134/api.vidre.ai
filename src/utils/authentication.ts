import jsonwebtoken from "jsonwebtoken";
import { JWT_SECRET_ACCESS_KEY } from "../config.js";
import * as errors from "./errors.js";

export enum UserType {
  GUEST = "GUEST",
  DEFAULT = "DEFAULT",
}

type Payload = {
  exp: number;
  sub: string;
  type: UserType;
  username: string;
  name: string | null;
};

export type UserInfo = {
  id: string;
  type: UserType;
  username: string;
  name: string | null;
};

function verifyToken(token: string): Payload {
  try {
    return jsonwebtoken.verify(token, JWT_SECRET_ACCESS_KEY, {
      algorithms: ["HS256"],
    }) as Payload;
  } catch (err: unknown) {
    if (err instanceof jsonwebtoken.JsonWebTokenError && err.name === "TokenExpiredError") {
      throw errors.authenticationExpiredToken();
    } else {
      throw errors.authenticationInvalidToken();
    }
  }
}

export function signToken(user: Pick<UserInfo, "id" | "type" | "username" | "name">): string {
  const payload = {
    sub: user.id,
    type: user.type,
    username: user.username,
    name: user.name,
  };

  return jsonwebtoken.sign(payload, JWT_SECRET_ACCESS_KEY, { algorithm: "HS256", expiresIn: "48h" });
}

export function getExpires(token: string): Number {
  return Math.floor(new Date((jsonwebtoken.decode(token) as Payload).exp * 1000).getTime() / 1000);
}

export async function middleware(header: string | undefined): Promise<UserInfo | null> {
  if (header === undefined) return null;

  if (!header.startsWith("Bearer ")) {
    throw errors.authenticationInvalidScheme();
  }
  const token = header.replace("Bearer ", "");
  const decoded = verifyToken(token);

  if (typeof decoded.sub !== "string") {
    throw errors.authenticationInvalidToken();
  }

  return {
    id: decoded.sub,
    type: decoded.type,
    username: decoded.username,
    name: decoded.name,
  };
}
