import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/auth', // Redirects to your custom login page
  },
  callbacks: {
    async session({ session, token }) {
      // You can add logic here to store user data in your DB later
      return session;
    },
  },
});

export { handler as GET, handler as POST };