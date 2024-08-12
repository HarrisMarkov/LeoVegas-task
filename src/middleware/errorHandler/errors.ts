export enum ErrorTypes {
  'DATABASE_ERROR' = 'DATABASE_ERROR',
  'NOT_FOUND_ERROR' = 'NOT_FOUND_ERROR',
  'DB_CONSTRAINT_ERROR' = 'ERR_DB_CONSTRAINT_ERROR',
  'AUTHORIZATION_ERROR' = 'AUTHORIZATION_ERROR',
  'PAYLOAD_ERROR' = 'PAYLOAD_ERROR',
  'SERVER_ERROR' = 'SERVER_ERROR',
}

export const errors = {
  ERR_NOT_FOUND: {
    message: 'Not found',
    name: ErrorTypes.NOT_FOUND_ERROR,
    httpCode: 404,
  },
  ERR_NOT_AUTHORIZED: {
    message: 'Invalid authentication',
    name: ErrorTypes.AUTHORIZATION_ERROR,
    httpCode: 401,
  },
  ERR_INVALID_PAYLOAD: {
    message: 'Invalid Payload',
    name: ErrorTypes.PAYLOAD_ERROR,
    httpCode: 400,
  },
  ERR_DB_CONSTRAINT: {
    message: 'Database Constraint',
    name: ErrorTypes.DB_CONSTRAINT_ERROR,
    httpCode: 400,
  },
  ERR_DB_ERROR: {
    message: 'Database Error',
    name: ErrorTypes.DATABASE_ERROR,
    httpCode: 400,
  },
  ERR_SERVER: {
    message: 'Server Error',
    name: ErrorTypes.SERVER_ERROR,
    httpCode: 500,
  },
}

export const joiPayloadErrorList = {
  MUST_BE_STRING: {
    message: 'Field must be a string.',
    reason: 'MUST_BE_STRING',
  },
  MUST_BE_NUMBER: {
    message: 'Field must be a number.',
    reason: 'MUST_BE_NUMBER',
  },
  MUST_BE_ARRAY: {
    message: 'Field must be an array.',
    reason: 'MUST_BE_ARRAY',
  },
  MUST_BE_OBJECT: {
    message: 'Field must be an object.',
    reason: 'MUST_BE_OBJECT',
  },
  INVALID_BENEFIT: {
    message: 'Benefit is invalid.',
    reason: 'INVALID_BENEFIT',
  },
  INVALID_SUBSIDY: {
    message: 'Subsidy is invalid.',
    reason: 'INVALID_SUBSIDY',
  },
  INVALID_CHARGE: {
    message: 'Charge is invalid.',
    reason: 'INVALID_CHARGE',
  },
  INVALID_PERIOD: {
    message: 'Charge is invalid.',
    reason: 'INVALID_PERIOD',
  },
  INVALID_FIELD: {
    message: 'Some field is invalid.',
    reason: 'INVALID_FIELD',
  },
  FIELD_IS_REQUIRED: {
    message: 'Some field is required.',
    reason: 'FIELD_IS_REQUIRED',
  },
  VALUE_IS_REQUIRED: {
    message: 'Some value is required.',
    reason: 'VALUE_IS_REQUIRED',
  },
  EMPTY_FIELD: {
    message: 'Field cannot be empty.',
    reason: 'EMPTY_FIELD',
  },
  MUST_CHOSE_OPTION: {
    message: 'Must chose one of the provided options',
    reason: 'MUST_CHOSE_OPTION',
  },
}
