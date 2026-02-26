import axios, { Axios, isAxiosError } from 'axios';
import { IAuthRequest, IGenericError } from './client.models';

interface IRemoteGenericError {
    error: string;
}

interface IJWT {
    token: string;
    sub: string;
    exp: number;
    nbf: number;
    iat: number;
    jti: string;
}

interface IRemoteLoginResponse {
    access_token: IJWT;
}

export const IsError = (obj: any): obj is IGenericError => {
    const errobj = obj as IGenericError;
    return (
        errobj.httpCode !== undefined &&
        Object.hasOwn(obj, 'httpCode') &&
        errobj.error !== undefined &&
        Object.hasOwn(obj, 'error')
    );
};

export class Backend {
    private static _instance: Backend | null = null;
    private _cl: Axios;

    // Utilise la variable d'environnement ou fallback vers le proxy local
    private constructor() {
        const apiUrl = process.env.BACKEND_URL || '/api';
        console.log(apiUrl);
        this._cl = axios.create({ baseURL: apiUrl });
    }

    public static getInstance(): Backend {
        if (Backend._instance == null) Backend._instance = new Backend();
        return Backend._instance;
    }
    public async Login(
        data: IAuthRequest,
    ): Promise<IGenericError | IRemoteLoginResponse> {
        try {
            const res = await this._cl.post<IRemoteLoginResponse>(
                '/auth/login',
                data,
            );
            return { access_token: res.data.access_token };
        } catch (e: any) {
            if (isAxiosError(e)) {
                console.log(e.toJSON());
                const code = e.status ?? 500;
                const reason = e.toJSON() as IRemoteGenericError;
                return {
                    httpCode: code,
                    error: reason.error,
                };
            } else throw e;
        }
    }
    public async GetUserByID(id: string) {
        try {
            const res = await this._cl.get<IRemoteLoginResponse>(
                '/api/users',
                data,
            );
            return { access_token: res.data.access_token };
        } catch (e: any) {
            if (isAxiosError(e)) {
                console.log(e.toJSON());
                const code = e.status ?? 500;
                const reason = e.toJSON() as IRemoteGenericError;
                return {
                    httpCode: code,
                    error: reason.error,
                };
            } else throw e;
        }
    }
}
