export type ActionResponse<T> = 
  | {
      success: true;
      message: string;
      data: T;        
      errors?: never;  
    }
  | {
      success: false;
      message: string;
      data?: T;        
      errors?: unknown;
    };