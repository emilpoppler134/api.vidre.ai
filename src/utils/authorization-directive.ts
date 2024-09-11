import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";
import { defaultFieldResolver, GraphQLSchema } from "graphql";
import * as errors from "./errors.js";

export function authorizationDirectiveTransformer(schema: GraphQLSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authorizationDirective = getDirective(schema, fieldConfig, "authorization")?.[0];

      if (authorizationDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        fieldConfig.resolve = async function (source, args, context, info) {
          if (!context.user) {
            throw errors.authorizationAccessDenied();
          }

          return resolve(source, args, context, info);
        };
      }
      return fieldConfig;
    },
  });
}
