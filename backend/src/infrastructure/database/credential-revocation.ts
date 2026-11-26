import type { Prisma } from "@prisma/client";

export async function revokeCredentialSessions(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date,
    reason: string
) {
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
