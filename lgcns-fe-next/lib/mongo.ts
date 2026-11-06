import { MongoClient } from "mongodb";
import { databaseUrl } from "@/lib/prisma";

const globalForMongo = globalThis as unknown as { mongo?: Promise<MongoClient> };

export function mongoClient() {
  if (!globalForMongo.mongo) {
    const client = new MongoClient(databaseUrl);
    globalForMongo.mongo = client.connect().then(
      () => client,
      (error: unknown) => {
        globalForMongo.mongo = undefined;
        throw error;
      },
    );
  }
  return globalForMongo.mongo;
}
