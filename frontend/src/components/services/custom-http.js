import {Auth} from "./auth.js";

export class CustomHttp {
    static async request(url, method = 'GET', body = null) {
        const params = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };

        const token = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            params.headers['x-auth-token'] = token;
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        let response;
        let result;
        try {
            response = await fetch(url, params);
            result = await response.json();
        } catch (e) {
            throw new Error('Ошибка сети. Проверьте подключение к серверу');
        }

        if (response.status < 200 || response.status >= 300) {
            if (response.status === 401) {
                const refreshed = await Auth.processUnauthorizedResponse();
                if (refreshed) {
                    return await this.request(url, method, body);
                }
                return null;
            }

            const error = new Error(result.message || 'Ошибка запроса');
            error.validation = result.validation || null;
            throw error;
        }

        return result;
    }
}
