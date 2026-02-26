export interface IAuthRequest {
    email: string;
    password: string;
}

export interface IAuthTokensPair {
    access: string;
    refresh: string;
}

export interface IUserProfile {
    name: string;
    id: string;
    email: string;
    role: string;
}

export interface IGenericError {
    error: string;
    httpCode: number;
}
