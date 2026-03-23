export interface ApiResponce<T> {
    success: boolean
    message?: string
    data?: T
}

export const successResponse = <T>(
  data: T,
  message = "success"
): ApiResponce<T> => {
  return {
    success: true,
    message,
    data,
  }
}