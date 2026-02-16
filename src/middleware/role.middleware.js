import { ApiError } from "../utils/ApiError.js";

export const authorize = (...roles) => {
  return (req, _, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(
        403,
        `Role: ${req.user?.role} is not allowed to access this resource`,
      );
    }
    next();
  };
};
