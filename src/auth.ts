import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { authConfig } from "../auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || "stocksense_super_secret_jwt_key_2026_secure",
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email) return null;

        try {
          const email = (credentials.email as string).trim().toLowerCase();
          const result = await pool.query(
            "SELECT * FROM users WHERE email = $1 LIMIT 1",
            [email]
          );
          const user = result.rows[0];

          if (!user) return null;

          // If password was passed, check it
          if (credentials.password) {
            const passwordsMatch = await bcrypt.compare(
              credentials.password as string,
              user.password_hash
            );
            if (!passwordsMatch) return null;
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.login_id,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      },
    }),
  ],
});
