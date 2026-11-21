import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // DNS fallback
}

import { betterAuth, APIError } from "better-auth";
import { MongoClient, ObjectId } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const uri = process.env.MONGODBURI || process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODBURI environment variable is missing");
}

const client = new MongoClient(uri);
const db = client.db("pizzahub");

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user?.email) {
            const existing = await db.collection("user").findOne({
              email: user.email.toLowerCase().trim(),
            });
            if (existing?.isBlocked) {
              throw new APIError("FORBIDDEN", {
                message: "This email has been blocked by an administrator and cannot sign up or log in.",
              });
            }
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          if (session?.userId) {
            const query = ObjectId.isValid(session.userId)
              ? { $or: [{ _id: new ObjectId(session.userId) }, { _id: session.userId }, { id: session.userId }] }
              : { $or: [{ _id: session.userId }, { id: session.userId }] };
            const existingUser = await db.collection("user").findOne(query);
            if (existingUser?.isBlocked) {
              throw new APIError("FORBIDDEN", {
                message: "Your account has been blocked by an administrator and cannot log in.",
              });
            }
          }
        },
      },
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
