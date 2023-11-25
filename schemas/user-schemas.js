import Joi from "joi";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = Joi.object({
  email: Joi.string().required().pattern(emailRegexp).messages({
    "any.required": `"email" must be exist`,
  }),
  password: Joi.string().required().min(4).messages({
    "any.required": `"password" must be exist`,
  }),
});

export default userSchema;
