import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://arpanghosh8617_db_user:Seed2Shelf123@cluster0.xlxdty7.mongodb.net/seed2shelf?retryWrites=true&w=majority&appName=Cluster0";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const mongoOptions = {
  tls: true,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
};

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, mongoOptions);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI, mongoOptions);
  clientPromise = client.connect();
}

export async function getMongoDb() {
  const client = await clientPromise;
  return client.db("seed2shelf");
}

export default clientPromise;
