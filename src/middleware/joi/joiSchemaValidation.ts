import Joi from '../../../node_modules/joi/lib/index'

export function validateSchema(
  schema: Joi.ObjectSchema<any> | Joi.ArraySchema<any>,
  body: any,
): Joi.ValidationResult<any> {
  return schema.validate(body, {
    abortEarly: false,
  })
}
