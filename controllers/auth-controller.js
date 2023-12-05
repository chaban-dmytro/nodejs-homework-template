import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { HttpError } from "../helpers/index.js";
import userSchema from "../schemas/user-schemas.js";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";

const { JWT_SECRET } = process.env;

const posterPath = path.resolve("public", "avatars");

const signUp = async (req, res, next) => {
  try {
    // const { path: oldPath, filename } = req.file;
    // const newPath = path.join(posterPath, filename);
    // await fs.rename(oldPath, newPath);
    // const avatarUrl = path.join("public", "avatars", filename);

    const { email, password } = req.body;
    const avatarUrl = gravatar.url(`${email}`);
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
      avatarUrl: avatarUrl,
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

const subUpdate = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const result = await User.findOneAndUpdate(_id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  signUp,
  signIn,
  signOut,
  getCurrent,
  subUpdate,
};
