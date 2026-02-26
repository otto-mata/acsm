export type Role = 'admin' | 'operator' | 'viewer';

export const routePermissions: Record<string, Role[]> = {
    '/dashboard': ['admin', 'operator', 'viewer'],
    '/users': ['admin'],
};

export const PUBLIC_ROUTES = ['/login'];
