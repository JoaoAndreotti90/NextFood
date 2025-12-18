import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET as string,
  
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "USER"
      },
      cpf: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      addressNumber: {
        type: "string",
        required: false,
      },
      neighborhood: {
        type: "string",
        required: false,
      }
    }
  },
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, 
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});