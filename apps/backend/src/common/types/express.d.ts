import { AuthenticatedUser } from './authenticated-user.type';

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}
