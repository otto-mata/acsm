export interface IAuthRequest {
    email: string;
    password: string;
}

export interface IAuthTokensPair {
    access: string;
    refresh: string;
}
export interface IApiResponse<T> {
    data: T;
}

export interface IGenericError {
    error: string;
    httpCode: number;
}

export type TRoles = 'admin' | 'operator' | 'viewer';

export const Roles: TRoles[] = ['admin', 'operator', 'viewer'];

export interface IUserProfile {
    name: string;
    id: string;
    email: string;
    role: TRoles;
}

export type TJobType = 'file_processing' | 'scheduled_task' | 'triggered_task';

export interface IJobDetails {
    id: string;
    name: string;
    description: string;
    type: TJobType;
    script_path: string;
    args: string[];
    env_vars: Object | null;
    config: Object | null;
    timeoutsecs: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}
