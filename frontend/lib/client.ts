import { Axios, AxiosError, isAxiosError } from 'axios';
import {
    IAuthRequest,
    IAuthTokensPair,
    IGenericError,
    IUserProfile,
} from './client.models';

interface IRemoteGenericError {
    error: string;
}

interface IAccessToken {
    token: string;
    sub: string;
}

interface IRemoteLoginResponse {
    access_token: string;
}

export class Backend {
    private static _instance: Backend | null = null;
    private _cl: Axios;

    // Utilise la variable d'environnement ou fallback vers le proxy local
    private constructor() {
        const apiUrl = process.env.BACKEND_URL || '/api';
        this._cl = new Axios({
            baseURL: apiUrl,
        });
    }

    public static getInstance(): Backend {
        if (Backend._instance == null) Backend._instance = new Backend();
        return Backend._instance;
    }
    public async Login(
        data: IAuthRequest,
    ): Promise<IAuthTokensPair | IGenericError> {
        try {
            const res = await this._cl.post<IRemoteLoginResponse>(
                '/auth/login',
                data,
            );
            const cookies = res.headers['set-cookie'];
            if (cookies === undefined) {
                return {
                    httpCode: 500,
                    error: 'No set-cookie header in response',
                };
            }
            const refreshTokenCookie = cookies.find((c) =>
                c.includes('refresh_token'),
            );
            if (refreshTokenCookie === undefined) {
                return {
                    httpCode: 500,
                    error: 'No refresh token in response',
                };
            }

            return {
                access: res.data.access_token,
                refresh,
            };
        } catch (e: any) {
            if (isAxiosError(e)) {
                const code = e.status ?? 500;
                const reason = e.toJSON() as IRemoteGenericError;
                return {
                    httpCode: code,
                    error: reason.error,
                };
            } else throw e;
        }
    }
    public async GetUser(id: string): Promise<IUserProfile | IGenericError> {
        return this._cl.get();
    }
}
