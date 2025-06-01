import { user } from 'prisma/db';

export interface JwtPayload {
  iss: string;
  sub: number;
  aud: string;
  iat: number;
  exp: number;
}

export type AuthUser = user;

export type PaginationResponse<T> = {
  list: T[];
  totalCount: number;
};
