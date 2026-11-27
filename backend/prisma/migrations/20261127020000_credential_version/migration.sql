-- Additive credential generation. Legacy in-flight MFA challenges are intentionally invalidated.
ALTER TABLE "users" ADD COLUMN "credentialVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "mfa_challenges" ADD COLUMN "credentialVersion" INTEGER;
