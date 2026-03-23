export interface ApiErrorOptions{
    statusCode: number,
    message?: string
    errors?: string[]
    isOperational?: boolean
}

class ApiError extends Error {
  readonly statusCode: number
  readonly errors: string[]
  readonly success = false
  readonly isOperational: boolean

  constructor(options: ApiErrorOptions) {
    const message = options.message ?? "Something went wrong"
    super(message)

    this.statusCode = options.statusCode
    this.errors = options.errors ?? []
    this.isOperational = options.isOperational ?? true

    
    Error.captureStackTrace(this, this.constructor)
  }
}

export {ApiError}