import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // DNS fallback
}

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const DIRECT_REPLICA_URI =
  "mongodb://PizzaHub:8hltHVeesJUZtL9F@ac-zgr00ce-shard-00-00.hffrouf.mongodb.net:27017,ac-zgr00ce-shard-00-01.hffrouf.mongodb.net:27017,ac-zgr00ce-shard-00-02.hffrouf.mongodb.net:27017/pizzahub?ssl=true&replicaSet=atlas-97vqqn-shard-0&authSource=admin&retryWrites=true&w=majority";

const uri =
  process.env.MONGODBURI ||
  process.env.MONGODB_URI ||
  DIRECT_REPLICA_URI;

const client = new MongoClient(uri);
const db = client.db("pizzahub");

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "KOzk9YeoVCHMSJt2IqEajUtMSumYGbvE",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        required: false,
      },
      isBlocked: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
      businessName: {
        type: "string",
        required: false,
      },
      subscriptionPlan: {
        type: "string",
        defaultValue: "free",
        required: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
