import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import express from "express";
import { gql } from "graphql-tag";
import http from "http";
import { PORT } from "./config.js";
import * as authentication from "./utils/authentication.js";
import { checkMongoDBConnection, connectToMongoDB } from "./utils/mongoose.js";

import * as Configuration from "./entities/configuration.js";
import * as Project from "./entities/project.js";
import * as User from "./entities/user.js";
import * as Voice from "./entities/voice.js";

import { makeExecutableSchema } from "@graphql-tools/schema";
import mediaRoutes from "./routes/media.route.js";
import { authorizationDirectiveTransformer } from "./utils/authorization-directive.js";
import { json } from "./utils/json.js";

export type Context = {
  user: authentication.UserInfo | null;
};

const typeDefs = gql`
  directive @authorization on FIELD_DEFINITION
`;

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: authorizationDirectiveTransformer(
    makeExecutableSchema({
      typeDefs: [typeDefs, Configuration.typeDefs, Project.typeDefs, User.typeDefs, Voice.typeDefs],
      resolvers: [Configuration.resolvers, Project.resolvers, User.resolvers, Voice.resolvers],
    })
  ),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();
await connectToMongoDB();

app.use(cors());
app.use(
  "/graphql",
  json,
  expressMiddleware(server, {
    context: async ({ req }): Promise<Context> => {
      await checkMongoDBConnection();

      const user = await authentication.middleware(req.headers.authorization);

      return {
        user,
      };
    },
  })
);

app.use("/media", mediaRoutes);

httpServer.listen({ port: PORT });
console.log(`🚀 Server ready at http://localhost:${PORT}`);
