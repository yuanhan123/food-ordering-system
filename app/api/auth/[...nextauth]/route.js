import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        // user login credentials
        CredentialsProvider({
            id: 'customer-credentials',
            name: 'Customer-Credentials',
            credentials: {},

            async authorize(credentials, req) {
                return credentials;
            }
        }),

        // seller login credentials
        CredentialsProvider({
            id: 'seller-credentials',
            name: 'Seller-Credentials',
            credentials: {},

            async authorize(credentials, req) {
                return credentials;
            }
        }),

    ],

    //custom sign in page
    pages: {
        signIn: "/login",
    },

    session: {
        jwt: true,
    },

    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update") {
                return {
                    ...token, ...session.user
                };
            }

            if (user) {
                token.customerId = user.customerId;
                token.username = user.username;
                token.fullname = user.fullname;
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
            }


            return token;
        },

        async session({ session, token }) {
            session.user = {
                customerId: token.customerId,
                username: token.username,
                fullname: token.fullname,
                role: token.role,
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
            }
            return session;
        },
    }

})

export { handler as GET, handler as POST };