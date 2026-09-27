import type { AuthenticatedUser } from '../types/authenticated-user.ts';

declare global {
    namespace Express {
        interface User extends AuthenticatedUser {}
    }
}

export {};