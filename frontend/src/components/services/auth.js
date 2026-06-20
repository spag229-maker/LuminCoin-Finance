import config from "../../../config/config.js";

export class Auth {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfoKey = 'userInfo';

    /**
     * Логин пользователя.
     * @param {{email: string, password: string, rememberMe?: boolean}} payload
     * @returns {Promise<{error: boolean, message?: string, validation?: any[]}>}
     */
    static async login(payload) {
        try {
            const response = await fetch(config.host + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.status === 200 && result.tokens) {
                this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                this.setUserInfo(result.user);
                return {error: false};
            }

            return {
                error: true,
                message: result.message,
                validation: result.validation || null,
            };
        } catch (e) {
            return {error: true, message: 'Ошибка сети. Попробуйте позже'};
        }
    }

    /**
     * Регистрация пользователя.
     * @param {{name: string, lastName: string, email: string, password: string, passwordRepeat: string}} payload
     * @returns {Promise<{error: boolean, message?: string, validation?: any[]}>}
     */
    static async signup(payload) {
        try {
            const response = await fetch(config.host + '/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.status === 201) {
                return {error: false};
            }

            return {
                error: true,
                message: result.message,
                validation: result.validation || null,
            };
        } catch (e) {
            return {error: true, message: 'Ошибка сети. Попробуйте позже'};
        }
    }

    static async logout() {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            try {
                const response = await fetch(config.host + '/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({refreshToken: refreshToken}),
                });

                if (response && response.status === 200) {
                    const result = await response.json();
                    if (result && !result.error) {
                        this.removeTokens();
                        this.removeUserInfo();
                        return true;
                    }
                }
            } catch (e) {
                // даже если сеть упала, чистим локально, чтобы не запереть пользователя
            }
        }

        this.removeTokens();
        this.removeUserInfo();
        return true;
    }

    /**
     * Пытается обновить пару токенов по refreshToken.
     * Вызывается из CustomHttp при получении 401.
     * @returns {Promise<boolean>}
     */
    static async processUnauthorizedResponse() {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            try {
                const response = await fetch(config.host + '/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({refreshToken: refreshToken}),
                });

                if (response && response.status === 200) {
                    const result = await response.json();
                    if (result && result.tokens) {
                        this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                        return true;
                    }
                }
            } catch (e) {
                // falls through to logout below
            }
        }

        this.removeTokens();
        this.removeUserInfo();
        location.href = '#/login';
        return false;
    }

    static isAuthenticated() {
        return !!localStorage.getItem(this.accessTokenKey);
    }

    static setTokens(accessToken, refreshToken) {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    static removeTokens() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    static setUserInfo(info) {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    static getUserInfo() {
        const userInfo = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }

    static removeUserInfo() {
        localStorage.removeItem(this.userInfoKey);
    }
}
