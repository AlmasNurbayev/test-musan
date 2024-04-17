export type ResponseHTTP = {
  error: boolean;
  statusCode: number;
  message: string;
  data?: any; // в задании object, но это может быть и массив
};
