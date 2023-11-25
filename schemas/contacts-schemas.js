import Joi from "joi";

export const contactAddSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": `"name" must be exist`,
    "string.base": `"name" must be text`,
  }),
  email: Joi.string(),
  phone: Joi.number(),
  favorite: Joi.boolean().default(false),
});

export const contactsUpdateSchema = Joi.object({
  name: Joi.string().messages({
    "string.base": `"name" must be text`,
  }),
  email: Joi.string(),
  phone: Joi.number(),
  favorite: Joi.boolean().default(false),
});

export const contactFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
