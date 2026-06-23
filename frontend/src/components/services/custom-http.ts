import { Auth } from './auth.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestBody {
    [key: string]: unknown;
}

interface ErrorWithValidation extends Error {
    validation: { field: string; message: string }[] | null;
}

interface ErrorResponse {
    message?: string;
    validation?: { field: string; message: string }[];
}

export class CustomHttp {
    static async request<T = unknown>(
        url: string,
        method: HttpMethod = 'GET',
        body: RequestBody | null = null,
    ): Promise<T | null> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        const token = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            headers['x-auth-token'] = token;
        }

        const params: RequestInit = { method, headers };

        if (body !== null) {
            params.body = JSON.stringify(body);
        }

        let response: Response;
        let result: T & ErrorResponse;

        try {
            response = await fetch(url, params);
            result = await response.json();
        } catch {
            throw new Error('Ошибка сети. Проверьте подключение к серверу');
        }

        if (response.status < 200 || response.status >= 300) {
            if (response.status === 401) {
                const refreshed = await Auth.processUnauthorizedResponse();
                if (refreshed) {
                    return this.request<T>(url, method, body);
                }
                return null;
            }

            const error = new Error(result.message ?? 'Ошибка запроса') as ErrorWithValidation;
            error.validation = result.validation ?? null;
            throw error;
        }

        return result;
    }
}