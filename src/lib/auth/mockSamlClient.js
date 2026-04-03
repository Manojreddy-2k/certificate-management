export async function signInWithMockSaml() {
  return Promise.resolve({
    loginMethod: "mock-saml",
    user: {
      subjectId: "mock-user-001",
      displayName: "Mock Citizen User"
    },
    sessionDurationMs: 15 * 60 * 1000
  });
}
