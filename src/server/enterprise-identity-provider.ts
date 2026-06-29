import "server-only";

export type EnterpriseIdentityMode = "local-managed" | "oidc" | "saml";

function configuredMode(): EnterpriseIdentityMode {
  const mode = process.env.SAP_WORLD_IDENTITY_MODE?.trim().toLowerCase();
  if (mode === "oidc" || mode === "saml") return mode;
  return "local-managed";
}

export function getEnterpriseIdentityProviderStatus() {
  const mode = configuredMode();
  const allowedDomains = (process.env.SAP_WORLD_IDENTITY_ALLOWED_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
  const oidc = {
    issuerConfigured: Boolean(process.env.SAP_WORLD_OIDC_ISSUER?.trim()),
    clientIdConfigured: Boolean(process.env.SAP_WORLD_OIDC_CLIENT_ID?.trim()),
    clientSecretConfigured: Boolean(
      process.env.SAP_WORLD_OIDC_CLIENT_SECRET?.trim(),
    ),
  };
  const saml = {
    metadataConfigured: Boolean(
      process.env.SAP_WORLD_SAML_METADATA_URL?.trim(),
    ),
    entityIdConfigured: Boolean(process.env.SAP_WORLD_SAML_ENTITY_ID?.trim()),
    certificateConfigured: Boolean(
      process.env.SAP_WORLD_SAML_CERTIFICATE?.trim(),
    ),
  };
  const configured =
    mode === "local-managed"
      ? true
      : mode === "oidc"
        ? Object.values(oidc).every(Boolean)
        : Object.values(saml).every(Boolean);

  return {
    mode,
    configured,
    provider: process.env.SAP_WORLD_IDENTITY_PROVIDER?.trim() || null,
    allowedDomains,
    oidc,
    saml,
    connection: {
      signInPath: "/api/auth/sso/start",
      callbackPath: "/api/auth/sso/callback",
      accountLinkKey: "issuer + subject",
      roleClaim: "sap_world_roles",
    },
    architecture: [
      "Validate issuer metadata and signed identity assertions in a server-only adapter.",
      "Map the immutable provider subject to a durable SAP World account.",
      "Apply organisation-managed roles from approved claims or admin assignments.",
      "Create the existing opaque SAP World database session after identity verification.",
      "Record account linking, role changes, suspension, and reactivation in the identity audit trail.",
    ],
  };
}
