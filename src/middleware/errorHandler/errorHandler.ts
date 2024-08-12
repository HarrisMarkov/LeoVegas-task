import { NextFunction, Request, Response } from 'express'
import { errors, joiPayloadErrorList } from './errors'
import { CustomError, CustomErrorMetadata, parseError } from './errorParser'

export interface JoiError {
  _original: Record<string, any>
  details: JoiErrorDetails[]
}

export interface JoiErrorDetails {
  message: string
  path: string[]
  type: string
  context: JoiErrorDetailsContext
}

interface JoiErrorDetailsContext {
  label: string
  value: string
  key: string
}

const typeExpressions = {
  isRequired: 'is required',
  mustBeOneOf: 'must be one of',
  notEmpty: 'not allowed to be empty',
  requiredValues: 'required value(s)',
  mustBeAString: 'must be a string',
  mustBeANumber: 'must be a number',
  mustBeAnArray: 'must be an array',
  mustBeAnObject: 'must be of type object',
}

export async function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response> {
  error.message = parseErrorMessage(error.message)

  if (error instanceof CustomError) {
    return res.status(error.httpCode).json({
      name: error.name,
      httpCode: error.httpCode,
      message: error.message,
      metadata: error.metadata,
    })
  }

  // JOI errors
  if (error.name === 'ValidationError') {
    return res.status(400).send({
      name: errors.ERR_INVALID_PAYLOAD.name,
      httpCode: errors.ERR_INVALID_PAYLOAD.httpCode,
      message: error.message,
      metadata: buildMetadataForJoiError(error),
    })
  }

  return res.status(errors.ERR_SERVER.httpCode).json({
    name: errors.ERR_SERVER.name,
    message: `Unhandled Error: ${errors.ERR_SERVER.httpCode}`,
  })
}

function parseErrorMessage(message: string): string {
  const regexNumbers = /[[][1-9]*[m]/gi
  const regexNewLine = /[\n]+/g
  const reTilde = /[~]+/g

  message = message.replace(regexNumbers, '')
  message = message.replace(regexNewLine, '')
  message = message.replace(reTilde, '')
  message = message.replace(/\\/g, '')
  message = message.replace(/"/g, '')

  return message
}

function buildMetadataForJoiError(joiError: JoiError): CustomErrorMetadata[] {
  try {
    return joiError.details.map(
      (detail: JoiErrorDetails): CustomErrorMetadata => {
        /**
         * Parse Joi type errors
         */
        if (
          detail.message.includes(typeExpressions.isRequired) ||
          detail.message.includes(typeExpressions.mustBeOneOf) ||
          detail.message.includes(typeExpressions.requiredValues) ||
          detail.message.includes(typeExpressions.notEmpty) ||
          detail.message.includes(typeExpressions.mustBeAString) ||
          detail.message.includes(typeExpressions.mustBeANumber) ||
          detail.message.includes(typeExpressions.mustBeAnObject) ||
          detail.message.includes(typeExpressions.mustBeAnArray)
        ) {
          const reason = parseTypeErrorsJoiMetadata({ detail })

          return {
            key: detail.context.label,
            value: detail.context.value,
            reason,
          }
        }

        return {
          key: detail.context.label,
          value: detail.context.value,
          reason: detail.message.replace(/"/g, ''),
        }
      },
    )
  } catch (err: any) {
    throw parseError({
      err,
      message: `errorHandler.buildMetadataForJoiError() error: ${err.message}`,
    })
  }
}

function parseTypeErrorsJoiMetadata(payload: {
  detail: JoiErrorDetails
}): string {
  const { detail } = payload
  let reason = joiPayloadErrorList.INVALID_FIELD.reason

  if (detail.message.includes(typeExpressions.mustBeAString)) {
    reason = joiPayloadErrorList.MUST_BE_STRING.reason
  } else if (detail.message.includes(typeExpressions.mustBeANumber)) {
    reason = joiPayloadErrorList.MUST_BE_NUMBER.reason
  } else if (detail.message.includes(typeExpressions.mustBeAnArray)) {
    reason = joiPayloadErrorList.MUST_BE_ARRAY.reason
  } else if (detail.message.includes(typeExpressions.mustBeAnObject)) {
    reason = joiPayloadErrorList.MUST_BE_OBJECT.reason
  } else if (detail.message.includes(typeExpressions.isRequired)) {
    reason = joiPayloadErrorList.FIELD_IS_REQUIRED.reason
  } else if (detail.message.includes(typeExpressions.requiredValues)) {
    reason = joiPayloadErrorList.VALUE_IS_REQUIRED.reason
  } else if (detail.message.includes(typeExpressions.notEmpty)) {
    reason = joiPayloadErrorList.EMPTY_FIELD.reason
  } else if (detail.message.includes(typeExpressions.mustBeOneOf)) {
    reason = joiPayloadErrorList.MUST_CHOSE_OPTION.reason
  }

  return reason
}

export default errorHandler
