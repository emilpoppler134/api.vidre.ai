import dotenv from "dotenv";
import unwrap from "ts-unwrap";

dotenv.config();

export const PORT = unwrap(process.env.PORT) ? parseInt(unwrap(process.env.PORT), 10) : 4000;
export const JWT_SECRET_ACCESS_KEY = unwrap(process.env.JWT_SECRET_ACCESS_KEY);

export const DATABASE_USERNAME = unwrap(process.env.DATABASE_USERNAME);
export const DATABASE_PASSWORD = unwrap(process.env.DATABASE_PASSWORD);
export const DATABASE_HOST = unwrap(process.env.DATABASE_HOST);
export const DATABASE_NAME = unwrap(process.env.DATABASE_NAME);
export const MONGODB_URI = `mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`;

export const S3_ACCESS_KEY_ID = unwrap(process.env.S3_ACCESS_KEY_ID);
export const S3_BUCKET_NAME = unwrap(process.env.S3_BUCKET_NAME);
export const S3_REGION = unwrap(process.env.S3_REGION);
export const S3_SECRET_ACCESS_KEY = unwrap(process.env.S3_SECRET_ACCESS_KEY);

export const OPENAI_API_KEY = unwrap(process.env.OPENAI_API_KEY);
export const ELEVENLABS_API_KEY = unwrap(process.env.ELEVENLABS_API_KEY);
