import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { HttpError } from "../helpers/index.js";
import userSchema from "../schemas/user-schemas.js";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }
    const { error } = userSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    res.status(201).json({ email: newUser.email });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const signOut = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.json({
    message: "Singout success",
  });
};

const getCurrent = (req, res) => {
  const { email } = req.user;
  res.json({ email });
};

export default {
  signUp,
  signIn,
  signOut,
  getCurrent,
};
