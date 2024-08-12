import { Prisma } from '@prisma/client'
import { ErrorTypes, errors } from './errors'

export interface ErrorConstructorPayload {
  name?: keyof typeof ErrorTypes
  type?: ErrorTypes
  context?: string
  httpCode?: number
  message?: string
  metadata?: any
  reason?: string
}

interface ParseErrorPayload {
  err: CustomError | Prisma.PrismaClientKnownRequestError
  message: string
  context?: string
}

export interface CustomErrorMetadata {
  key: string
  value: string
  reason?: string
}

export class CustomError extends Error {
  public name: keyof typeof ErrorTypes
  public context?: string
  public metadata: any
  public httpCode: number
  public reason?: string

  constructor({
    name,
    context,
    message,
    httpCode,
    metadata,
    reason,
  }: ErrorConstructorPayload) {
    super(message)
    this.message = message ?? 'Generic error message'
    this.name = name ?? ErrorTypes.SERVER_ERROR
    this.context = context ?? ''
    this.httpCode = httpCode ?? 500
    this.metadata = metadata ?? []
    this.reason = reason ?? ''
  }
}

export function parseError(payload: ParseErrorPayload): CustomError {
  if (payload.err instanceof CustomError) {
    throw payload.err
  }

  if (payload.message.includes('Error in DB seeding:')) {
    return new CustomError({
      name: 'DATABASE_ERROR',
      context: payload.context,
      message: payload.message,
    })
  }

  if (payload.err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = payload.err
    let errorType: any
    let message: string
    let metadata: any

    if (prismaError.meta) {
      metadata = prismaError.meta
    }

    if (
      prismaError.code === 'P2002' ||
      prismaError.code === 'P2003' ||
      prismaError.code === 'P2004' ||
      prismaError.code === 'P2011'
    ) {
      errorType = errors.ERR_DB_CONSTRAINT
      message = `Prisma error code ${prismaError.code}: ${payload.message}`
    } else if (prismaError.code === 'P2025' || prismaError.code === 'P2018') {
      errorType = errors.ERR_NOT_FOUND
      message = `Prisma error code ${prismaError.code}: ${payload.message}`
    } else {
      errorType = errors.ERR_DB_ERROR
      message = payload.message
    }

    return new CustomError({
      ...(errorType ?? errors.ERR_DB_ERROR),
      message,
      metadata,
      context: payload.context,
    })
  }

  return new CustomError({
    name: 'SERVER_ERROR',
    message: payload.message,
    context: payload.context,
  })
}
