import { Schema, model } from "mongoose";
import { handleSaveEror, preUpdate } from "./hooks.js";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: Number,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.post("save", handleSaveEror);

contactSchema.pre("findOneAndUpdate", preUpdate);

contactSchema.post("findOneAndUpdate", handleSaveEror);

const Contact = model("contact", contactSchema);

export default Contact;
