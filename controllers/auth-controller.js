import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { HttpError, SendMail } from "../helpers/index.js";
import userSchema from "../schemas/user-schemas.js";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import Jimp from "jimp";
import { nanoid } from "nanoid";

const { JWT_SECRET, BASE_URL } = process.env;

const posterPath = path.resolve("public", "avatars");

const signUp = async (req, res, next) => {
  try {
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
    const verificationCode = nanoid();
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      avatarUrl: avatarUrl,
      verificationCode,
    });
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationCode}">Click to verify your email</a>`,
    };
    await SendMail(verifyEmail);

    res.status(201).json({ email: newUser.email });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { verificationCode } = req.params;
    const user = await User.findOne({ verificationCode });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationCode: "",
    });
    res.json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

const sendVerify = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    if (user.verify) {
      throw HttpError(400, "Email aldeady verify");
    }
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationCode}">Click to verify your email</a>`,
    };
    await SendMail(verifyEmail);
    res.json({
      message: "Email sended succes",
    });
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
    if (!user.verify) {
      throw HttpError(401, "Email not verify");
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

const avatarUpdate = async (req, res, next) => {
  try {
    const { path: oldPath, filename } = req.file;
    const newPath = path.join(posterPath, filename);
    await fs.rename(oldPath, newPath);
    Jimp.read(newPath, (err, img) => {
      if (err) throw err;
      img
        .contain(
          250,
          250,
          Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP
        )
        .write(newPath);
    });
    const newAvatarUrl = path.join("public", "avatars", filename);
    const { _id } = req.user;
    await User.findOneAndUpdate(_id, {
      avatarUrl: newAvatarUrl,
    });
    res.json(newAvatarUrl);
  } catch (error) {
    next(error);
  }
};

export default {
  signUp,
  verify,
  sendVerify,
  signIn,
  signOut,
  getCurrent,
  subUpdate,
  avatarUpdate,
};
