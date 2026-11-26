// @ts-nocheck
import {
    ApiError,
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
} from "../../shared/errors/api-error.js";
import {
    ErrorMessages,
    SuccessMessages,
} from "../../shared/constants/index.js";
import { appConfig } from "../../config/env.js";
import { audit } from "../../infrastructure/logger/audit-logger.js";
import { createLogger } from "../../infrastructure/logger/logger.js";

const userServiceLogger = createLogger("user-service");

class UserService {
    constructor({
        userRepository,
        roleRepository,
        userRoleRepository,
        authService,
        cloudinaryService,
        mediaStorageService,
        emailVerificationService,
    }) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.authService = authService;
        this.cloudinaryService = cloudinaryService;
        this.mediaStorageService = mediaStorageService || cloudinaryService;
        this.emailVerificationService = emailVerificationService;
    }

    async register({ body, files }) {
        if (appConfig.otp.enabled || appConfig.mfa.enabled) {
            throw new BadRequestError(
                "Use staged registration to create an account"
            );
        }
        const { username, email, fullName, password } = body;

        this.#validateRequired({ username, email, fullName, password }, [
            "username",
            "email",
            "fullName",
            "password",
        ]);

        const existingUser = await this.userRepository.findByUsernameOrEmail(
            username,
            email
        );

        if (existingUser) {
            throw new ConflictError(ErrorMessages.USER_EXISTS);
        }

        const defaultRole = await this.roleRepository.findByName(
            appConfig.rbac.defaultRole
        );

        if (!defaultRole) {
            throw new ApiError(
                500,
                "Default user role is not configured. Run RBAC seed."
            );
        }

        const avatarLocalPath = files?.avatar?.[0]?.path;
        if (!avatarLocalPath) {
            throw new BadRequestError("Avatar image is required");
        }

        const coverImageLocalPath = files?.coverImage?.[0]?.path;
        const avatar = await this.mediaStorageService.upload(avatarLocalPath);

        if (!avatar) {
            throw new ApiError(500, "Failed to upload avatar image");
        }

        const coverImage = coverImageLocalPath
            ? await this.mediaStorageService.upload(coverImageLocalPath)
            : null;

        const user = await this.userRepository.createUser({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            fullName,
            password,
            avatar: avatar.secureUrl || avatar.url,
            coverImage: coverImage?.secureUrl || coverImage?.url || "",
        });

        const createdUser = await this.userRepository.findById(user._id);

        if (!createdUser) {
            throw new ApiError(500, "Failed to create user");
        }

        await this.emailVerificationService.createVerificationToken(user._id);
        await this.userRoleRepository.assignRoleToUser(
            user._id,
            defaultRole._id
        );

        audit.info("auth.register_success", { userId: user._id });

        return {
            statusCode: 201,
            data: createdUser,
            message: SuccessMessages.REGISTER_SUCCESS,
        };
    }

    async login({ body, userAgent, ipAddress }) {
        const { email, username, password } = body;

        if (!email && !username) {
            throw new BadRequestError("Email or username is required");
        }

        if (!password) {
            throw new BadRequestError("Password is required");
        }

        const user = await this.userRepository.findByCredentials(
            email || username
        );

        if (!user) {
            audit.warn("auth.login_failed", { reason: "invalid-credentials" });
            throw new UnauthorizedError("Invalid credentials");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            audit.warn("auth.login_failed", {
                userId: user._id,
                reason: "invalid-credentials",
            });
            throw new UnauthorizedError("Invalid credentials");
        }

        // Legacy clients must use challenge-aware sign-in when required.
        if (
            user.mfaEnabledAt ||
            user.onboardingStatus !== "active" ||
            appConfig.captcha.enabled
        ) {
            throw new UnauthorizedError(
                "Use the advanced sign-in flow to continue"
            );
        }

        const { accessToken, refreshToken } =
            await this.authService.createLoginSession({
                user,
                userAgent,
                ipAddress,
            });
        const loggedInUser = await this.userRepository.findById(user._id);
        audit.info("auth.login_success", { userId: user._id });

        return {
            data: { user: loggedInUser, accessToken, refreshToken },
            message: SuccessMessages.LOGIN_SUCCESS,
            accessToken,
            refreshToken,
        };
    }

    async logout({ sessionId }) {
        await this.authService.revokeSession(sessionId, "logout");
        audit.info("auth.logout", { sessionId });
        return { data: {}, message: SuccessMessages.LOGOUT_SUCCESS };
    }

    async logoutAll(userId) {
        await this.authService.revokeAllUserSessions(userId, "logout-all");
        audit.info("auth.logout_all", { userId });
        return { data: {}, message: "All sessions logged out successfully" };
    }

    async refreshAccessToken({ refreshToken }) {
        if (!refreshToken) {
            throw new UnauthorizedError("Refresh token is required");
        }

        try {
            const { accessToken, refreshToken: newRefreshToken } =
                await this.authService.refreshSession(refreshToken);
            const tokens = { accessToken, refreshToken: newRefreshToken };

            return {
                data: tokens,
                message: SuccessMessages.TOKEN_REFRESHED,
                ...tokens,
            };
        } catch (error) {
            audit.warn("auth.refresh_failed", {
                reason: error.message,
            });
            if (error instanceof ApiError) throw error;
            throw new UnauthorizedError("Invalid or expired refresh token");
        }
    }

    verifyEmailToken(token) {
        return this.emailVerificationService.verifyEmailToken(token);
    }

    getCurrentUser(user) {
        return { data: user, message: SuccessMessages.USER_FETCHED };
    }

    async changePassword({ userId, body }) {
        const { oldPassword, newPassword } = body;

        this.#validateRequired({ oldPassword, newPassword }, [
            "oldPassword",
            "newPassword",
        ]);

        if (
            typeof oldPassword !== "string" ||
            typeof newPassword !== "string" ||
            newPassword.length < 8 ||
            Buffer.byteLength(newPassword, "utf8") > 72
        ) {
            throw new BadRequestError(
                "New password must have at least 8 characters and at most 72 UTF-8 bytes"
            );
        }

        const user = await this.userRepository.findByIdWithPassword(userId);

        if (!user) {
            throw new NotFoundError("User");
        }

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if (!isPasswordCorrect) {
            throw new BadRequestError("Current password is incorrect");
        }

        const changed =
            await this.userRepository.changePasswordAndRevokeSessions(
                userId,
                user.password,
                newPassword
            );
        if (!changed) {
            throw new ConflictError(
                "Credentials changed; sign in and try again"
            );
        }
        audit.info("auth.password_changed", { userId });

        return { data: {}, message: SuccessMessages.PASSWORD_CHANGED };
    }

    async updateAccountDetails({ userId, body }) {
        const { fullName, email } = body;

        if (email !== undefined) {
            throw new BadRequestError(
                "Email replacement requires a separate verification workflow"
            );
        }
        if (
            typeof fullName !== "string" ||
            !fullName.trim() ||
            fullName.trim().length > 100
        ) {
            throw new BadRequestError("A valid full name is required");
        }

        const updateData = { fullName: fullName.trim() };

        const user = await this.userRepository.updateById(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return { data: user, message: SuccessMessages.USER_UPDATED };
    }

    async updateAvatar({ userId, file }) {
        const avatarLocalPath = file?.path;

        if (!avatarLocalPath) {
            throw new BadRequestError("Avatar image is required");
        }

        const currentUser = await this.userRepository.findById(userId);
        const oldAvatarPublicId = this.mediaStorageService.extractPublicId(
            currentUser.avatar
        );
        const avatar = await this.mediaStorageService.upload(avatarLocalPath, {
            contentType: file.mimetype,
        });

        if (!avatar) {
            throw new ApiError(500, "Failed to upload avatar");
        }

        const user = await this.userRepository.updateById(
            userId,
            { $set: { avatar: avatar.secureUrl || avatar.url } },
            { new: true }
        );

        if (oldAvatarPublicId) {
            this.mediaStorageService
                .delete(oldAvatarPublicId)
                .catch((error) =>
                    userServiceLogger.warn(
                        { error: { message: error.message } },
                        "failed to delete old avatar"
                    )
                );
        }

        return { data: user, message: SuccessMessages.AVATAR_UPDATED };
    }

    async updateCoverImage({ userId, file }) {
        const coverImageLocalPath = file?.path;

        if (!coverImageLocalPath) {
            throw new BadRequestError("Cover image is required");
        }

        const currentUser = await this.userRepository.findById(userId);
        const oldCoverPublicId = this.mediaStorageService.extractPublicId(
            currentUser.coverImage
        );
        const coverImage = await this.mediaStorageService.upload(
            coverImageLocalPath,
            { contentType: file.mimetype }
        );

        if (!coverImage) {
            throw new ApiError(500, "Failed to upload cover image");
        }

        const user = await this.userRepository.updateById(
            userId,
            { $set: { coverImage: coverImage.secureUrl || coverImage.url } },
            { new: true }
        );

        if (oldCoverPublicId) {
            this.mediaStorageService
                .delete(oldCoverPublicId)
                .catch((error) =>
                    userServiceLogger.warn(
                        { error: { message: error.message } },
                        "failed to delete old cover image"
                    )
                );
        }

        return { data: user, message: SuccessMessages.COVER_IMAGE_UPDATED };
    }

    async getChannelProfile({ username, currentUserId }) {
        if (!username?.trim()) {
            throw new BadRequestError("Username is required");
        }

        const channel = await this.userRepository.getChannelProfile(
            username,
            currentUserId
        );

        if (!channel?.length) {
            throw new NotFoundError("Channel", username);
        }

        return {
            data: channel[0],
            message: "Channel profile fetched successfully",
        };
    }

    async getWatchHistory(userId) {
        const user = await this.userRepository.getWatchHistory(userId);
        return {
            data: user[0]?.watchHistory || [],
            message: "Watch history fetched successfully",
        };
    }

    #validateRequired(fields, required) {
        const missing = required.filter(
            (field) => !fields[field] || fields[field].toString().trim() === ""
        );

        if (missing.length > 0) {
            throw new BadRequestError(
                `Missing required fields: ${missing.join(", ")}`
            );
        }
    }
}

export { UserService };
