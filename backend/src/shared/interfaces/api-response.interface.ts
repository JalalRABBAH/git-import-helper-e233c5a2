export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
    requestId?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
