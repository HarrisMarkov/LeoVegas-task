import Joi from 'joi'

export const getUserSchema = Joi.object({
  id: Joi.string().required(),
})

export const listUsersSchema = Joi.object({
  limit: Joi.number().required(),
  offset: Joi.number().required(),
})

export const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('ADMIN', 'USER').required(),
})

export const updateUserSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
  role: Joi.string().valid('ADMIN', 'USER'),
})

export const deleteUserSchema = Joi.object({
  id: Joi.string().required(),
})
