import { BadRequestError } from "../errors/api-error.js";

class ObjectIdValidator {
    static isValid(id: unknown): id is string {
        return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    }

    static ensureValid(id: unknown, fieldName = "ID"): asserts id is string {
        if (!ObjectIdValidator.isValid(id)) {
            throw new BadRequestError(`Invalid ${fieldName}`);
        }
    }
}

export { ObjectIdValidator };
