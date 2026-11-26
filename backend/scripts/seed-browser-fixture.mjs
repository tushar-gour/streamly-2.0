import bcrypt from "bcrypt";

import { prisma } from "../src/infrastructure/database/prisma/client.js";
import { createId } from "../src/shared/helpers/id-generator.js";

const url = new URL(process.env.DATABASE_URL || "");
if (
    process.env.NODE_ENV !== "test" ||
    process.env.RUN_DATABASE_TESTS !== "true" ||
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    url.pathname !== "/streamly_test"
) {
    throw new Error("Browser fixture requires an isolated local test database");
}

try {
    const role = await prisma.role.findUniqueOrThrow({
        where: { name: "user" },
    });
    const password = await bcrypt.hash("StreamlyBrowserTest123!", 10);
    await prisma.user.create({
        data: {
            id: createId(),
            email: "browser-test@example.com",
            username: "browser-test",
            fullName: "Browser Test",
            avatar: "",
            coverImage: "",
            password,
            onboardingStatus: "active",
            emailVerifiedAt: new Date(),
            userRoles: {
                create: { id: createId(), roleId: role.id },
            },
        },
    });
} finally {
    await prisma.$disconnect();
}
