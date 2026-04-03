import KeycloakProvider from "next-auth/providers/keycloak";

const keycloakProviderConfig = {
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  issuer: process.env.KEYCLOAK_ISSUER
};

if (process.env.KEYCLOAK_CLIENT_SECRET) {
  keycloakProviderConfig.clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
}

export const authOptions = {
  providers: [
    KeycloakProvider(keycloakProviderConfig)
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile?.preferred_username) {
        token.preferredUsername = profile.preferred_username;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user && token.preferredUsername) {
        session.user.name = token.preferredUsername;
      }
      return session;
    }
  }
};
