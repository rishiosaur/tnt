#!/usr/bin/env node

import express = require("express");
import { readFile } from "fs/promises";
import { graphqlHTTP } from "express-graphql";
import { Kind, OperationTypeNode, buildSchema, graphql, parse } from "graphql";
import { isPlural } from "pluralize";
import pluralize = require("pluralize");
import {
  parsed,
  schema,
  getStarship,
  getStarships,
  getPets,
} from "./finalSchema";
import { makeExecutableSchema } from "graphql-tools";

console.log(parsed.getTypeMap());

const typeMap = parsed.getTypeMap();
const entities = Object.entries(typeMap).filter(
  ([k, v]) =>
    ![
      "ID",
      "String",
      "Mutation",
      "Query",
      "Boolean",
      "__Schema",
      "__Type",
      "__TypeKind",
      "__Field",
      "__InputValue",
      "__EnumValue",
      "__Directive",
      "__DirectiveLocation",
    ].includes(k) && v.astNode.kind === Kind.OBJECT_TYPE_DEFINITION
);

console.log(entities);

const queryType = parsed.getQueryType();
const queryFields = queryType.getFields();
const mutationType = parsed.getMutationType();

enum StorageTypes {
  Local,
  S3,
}

class IJSON {
  constructor(private type: StorageTypes, private source: string) {}

  async readFull() {
    if (this.type === StorageTypes.Local) {
      const f = await readFile(this.source);
      const stringified = f.toString();
      return JSON.parse(stringified);
    }
  }
}

class DB {
  constructor(private writer: IJSON) {}

  async setup() {}

  async upsertSetup() {}

  async resolveBaseMany(entityName: string) {
    const json = await this.writer.readFull();
    const collectionName = pluralize(entityName);
    console.log(collectionName);
    const matched = json[collectionName.toLowerCase()];
    return matched || [];
  }

  async resolveBaseSingle(entityName: string, id: string) {
    const json = await this.writer.readFull();
    console.log(json);
    const matched = await this.resolveBaseMany(entityName);
    console.log(matched);
    const found = matched.find((item) => item.id === id);
    return found || null;
  }

  async isBaseEntity(entityName: string) {
    const filtered = Object.keys(queryFields).map(pluralize.singular);
    return filtered.includes(entityName.toLowerCase());
  }

  get baseEntities() {
    return Object.keys(queryFields).map(pluralize.singular);
  }
}

const jsonInterface = new IJSON(StorageTypes.Local, "./db.json");
const db = new DB(jsonInterface);

// Queries

console.log(db.isBaseEntity("Starship"));

const baseQR = new Object();
const queryResolvers = new Proxy(baseQR, {
  get(target, name) {
    return async (obj, args, context, info) => {
      if (isPlural(info.fieldName)) {
        console.log("plural");
        const entityName = pluralize.singular(info.fieldName);
        const resolved = await db.resolveBaseMany(entityName);
        return resolved;
      } else {
        console.log("singular queryField");
        console.log({ args, info, context, obj });
        const { id } = args;
        const entityName = info.fieldName;
        const resolved = await db.resolveBaseSingle(entityName, id);
        // const resolved = { name: "testSingular", id: "123" };
        return resolved;
      }
    };
  },
});

// Mutations

// Entities
console.log(entities);
const entityResolvers = Object.fromEntries(
  entities.map(([k]) => {
    const baseFieldResolver = new Object();
    const fieldResolvers = new Proxy(baseFieldResolver, {
      get(target, name) {
        // console.log("hi", target, name);
        return async (obj, args, context, info) => {
          //   console.log(name);
          if ((name || "") === "__isTypeOf") {
            // console.log(obj, args, context);
            // console.log("!!!!!");
            return true;
          } else {
            const kind = info?.parentType?.name;
            const isBase = await db.isBaseEntity(kind);
            if (isBase) {
              const fetched = await db.resolveBaseSingle(kind, obj.id);
              return fetched[info.fieldName];
            }
          }

          //   const kind = info.parentType?.name || "Starship";
          //   console.log(kind);

          //   const isBase = db.isBaseEntity(kind);
          //   if (isBase) {
          //     const fetched = await db.resolveBaseSingle(kind, obj.id);
          //     console.log(fetched[info.fieldName]);
          //     return fetched[info.fieldName];
          //   }
        };
      },
    });
    return [k, fieldResolvers];
  })
);

/*
Resolvers
*/

/*
server
*/

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers: {
    Query: queryResolvers,
    ...entityResolvers,
  },
});

graphql({
  schema: executableSchema,
  source: getPets,
  variableValues: {
    id: "1", // Replace "123" with the actual ID you want to query for
  },
  //   rootValue: resolverProxy,
}).then((response) => {
  console.log(JSON.stringify(response, null, 2));
});

// const app = express();
// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema: parsed,
//     rootValue,
//   })
// );
