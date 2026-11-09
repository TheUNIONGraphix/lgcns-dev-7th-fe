export interface SpringApiResponseType<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}