export interface IAuthRequest {
    email: string;
    password: string;
}

export interface IAuthTokensPair {
    access: string;
    refresh: string;
}

export const Roles = ['admin', 'operator', 'viewer'];

export interface IApiResponse<T> {
    data: T;
}

export interface IUserProfile {
    name: string;
    id: string;
    email: string;
    role: 'admin' | 'operator' | 'viewer';
}

export interface IGenericError {
    error: string;
    httpCode: number;
}
