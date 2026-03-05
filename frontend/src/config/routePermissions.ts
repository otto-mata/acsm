export type Role = 'admin' | 'operator' | 'viewer';

export const routePermissions: Record<string, Role[]> = {
    '/dashboard': ['admin', 'operator', 'viewer'],
    '/users': ['admin'],
    '/jobs/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/edit': [
        'operator',
        'admin',
    ],
};

export const PUBLIC_ROUTES = ['/login'];
