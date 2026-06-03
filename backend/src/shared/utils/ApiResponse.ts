export class APIResponse {
  message: string;
  statusCode: number;
  data: any;
  meta?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number,
    data: any = null,
    meta: Record<string, any> | null = null
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }
}
