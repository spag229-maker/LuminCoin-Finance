import config from '../../../config/config.js';
import type { AuthResult, Tokens, UserInfo } from '../../types/common.types.js';

interface LoginPayload {
    email: string;
    password: string;
    rememberMe?: boolean;
}

interface SignupPayload {
    name: string;
    lastName: string;
    email: string;
    password: string;
    passwordRepeat: string;
}

interface LoginResponse {
    tokens: Tokens;
    user: UserInfo;
    message?: string;
    validation?: { field: string; message: string }[];
}

interface RefreshResponse {
    tokens: Tokens;
}

interface LogoutResponse {
    error: boolean;
}

export class Auth {
    static readonly accessTokenKey = 'accessToken';
    static readonly refreshTokenKey = 'refreshToken';
    static readonly userInfoKey = 'userInfo';

    static async login(payload: LoginPayload): Promise<AuthResult> {
        try {
            const response = await fetch(config.host + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result: LoginResponse = await response.json();

            if (response.status === 200 && result.tokens) {
                this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                this.setUserInfo(result.user);
                return { error: false };
            }

            return {
                error: true,
                message: result.message,
                validation: result.validation ?? null,
            };
        } catch {
            return { error: true, message: 'Ошибка сети. Попробуйте позже' };
        }
    }

    static async signup(payload: SignupPayload): Promise<AuthResult> {
        try {
            const response = await fetch(config.host + '/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result: Omit<LoginResponse, 'tokens' | 'user'> = await response.json();

            if (response.status === 201) {
                return { error: false };
            }

            return {
                error: true,
                message: result.message,
                validation: result.validation ?? null,
            };
        } catch {
            return { error: true, message: 'Ошибка сети. Попробуйте позже' };
        }
    }

    static async logout(): Promise<true> {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);

        if (refreshToken) {
            try {
                const response = await fetch(config.host + '/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (response.status === 200) {
                    const result: LogoutResponse = await response.json();
                    if (!result.error) {
                        this.removeTokens();
                        this.removeUserInfo();
                        return true;
                    }
                }
            } catch {
            }
        }

        this.removeTokens();
        this.removeUserInfo();
        return true;
    }

    /**
     * Вызывается из CustomHttp при получении 401.
     * Пытается обновить пару токенов через refreshToken.
     */
    static async processUnauthorizedResponse(): Promise<boolean> {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);

        if (refreshToken) {
            try {
                const response = await fetch(config.host + '/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (response.status === 200) {
                    const result: RefreshResponse = await response.json();
                    if (result?.tokens) {
                        this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                        return true;
                    }
                }
            } catch {
            }
        }

        this.removeTokens();
        this.removeUserInfo();
        location.href = '#/login';
        return false;
    }

    static isAuthenticated(): boolean {
        return !!localStorage.getItem(this.accessTokenKey);
    }

    private static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    private static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    private static setUserInfo(info: UserInfo): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    static getUserInfo(): UserInfo | null {
        const raw = localStorage.getItem(this.userInfoKey);
        if (!raw) return null;
        return JSON.parse(raw) as UserInfo;
    }

    private static removeUserInfo(): void {
        localStorage.removeItem(this.userInfoKey);
    }
}