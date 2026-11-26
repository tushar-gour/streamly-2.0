import type { Prisma } from "@prisma/client";
import { createId } from "../../shared/helpers/id-generator.js";

export function recordNotification(
    tx: Prisma.TransactionClient,
    userId: string,
    kind: "security" | "moderation" | "subscription",
    message: string
) {
    return tx.notification.create({
        data: { id: createId(), userId, kind, message },
    });
}
