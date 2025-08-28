/**
 * Express类型扩展
 * 创建时间：2025-08-20
 * 创建人：Erikwang
 */

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        username: string;
        email: string;
        roles: string[];
      };
    }
  }
}

export {};