import type { Prisma } from "@prisma/client";
import { recordNotification } from "./notification-record.js";

export async function revokeCredentialSessions(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date,
    reason: string
) {
    await recordNotification(
        tx,
        userId,
        "security",
        reason === "email_change"
            ? "Your account email address was changed. Other sessions were signed out."
            : reason === "phone_enrollment"
              ? "Your verified phone number was changed. All sessions were signed out."
              : "Your password was changed. Other sessions were signed out."
    );
    await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now, revokedReason: reason },
    });
    await tx.mfaTrustToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
    });
    await tx.authChallenge.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: now },
    });
    await tx.mfaChallenge.updateMany({
        where: { userId, consumedAt: null },
        data: { consumedAt: now },
    });
    await tx.emailVerificationToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: now },
    });
}
