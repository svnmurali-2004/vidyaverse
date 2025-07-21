// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import User from "@/models/user.model.js";
// Import or define verifyPassword
import { verifyPassword } from "@/lib/hash"; // Adjust path as needed
import db from "@/lib/db"; // Adjust path as needed
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        await db();
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        const user = await User.findOne({ email: credentials.email });
        if (
          user &&
          (await verifyPassword(credentials.password, user.password))
        ) {
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || "user",
          };
        }
        throw new Error("Invalid email or password");
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // For credentials login, set token fields from user
      if (user && !account) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.avatar;
      }
      // For OAuth providers, create user in database if not exists, and always set token fields from DB user
      if (
        account &&
        (account.provider === "google" || account.provider === "github")
      ) {
        await db();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            email: user.email,
            name: user.name,
            avatar: user.image,
            role: "student",
            provider: account.provider,
          });
        }
        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.avatar = dbUser.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.avatar = token.avatar || "https://avatar.vercel.sh/svnm";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback - URL:", url, "BaseURL:", baseUrl);

      // If it's a relative URL, it's safe to redirect
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // If it's the same origin, allow it
      if (new URL(url).origin === baseUrl) return url;

      // Default redirect to root (middleware will handle role-based routing)
      return baseUrl;
    },
  },
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
