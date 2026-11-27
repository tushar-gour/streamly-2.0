import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => unknown;

const asyncHandler = (requestHandler: AsyncRequestHandler): RequestHandler => {
    return (req, res, next) => {
        void Promise.resolve()
            .then(() => requestHandler(req, res, next))
            .catch(next);
    };
};

const tryCatch = (fn: AsyncRequestHandler): RequestHandler => asyncHandler(fn);

const handleService = async <Args extends unknown[], Result>(
    serviceFunction: (...args: Args) => Result,
    ...args: Args
): Promise<Awaited<Result>> => await serviceFunction(...args);

export { asyncHandler, tryCatch, handleService };
