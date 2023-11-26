import { HttpError } from "../helpers/index.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(HttpError(401, "Authorization header not found"));
  }
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    return next(HttpError(401));
  }
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      return next(HttpError(401, "User not found"));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(HttpError(401, error.message));
  }
};

export default authenticate;
