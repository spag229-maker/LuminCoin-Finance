import { CustomHttp } from './custom-http.js';
import config from '../../../config/config.js';
import type { BalanceResponse } from '../../types/common.types.js';

export class BalanceService {
    private static readonly baseUrl = `${config.host}/balance`;

    static async get(): Promise<BalanceResponse | null> {
        return CustomHttp.request<BalanceResponse>(BalanceService.baseUrl, 'GET');
    }
}