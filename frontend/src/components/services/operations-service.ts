import { CustomHttp } from './custom-http.js';
import config from '../../../config/config.js';
import type { Operation, OperationFilter, OperationPayload } from '../../types/common.types.js';

export class OperationsService {
    private static readonly baseUrl = `${config.host}/operations`;

    static async getAll(filter: OperationFilter = { period: 'today' }): Promise<Operation[] | null> {
        const params = new URLSearchParams();
        params.set('period', filter.period ?? 'today');

        if (filter.period === 'interval') {
            if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
            if (filter.dateTo) params.set('dateTo', filter.dateTo);
        }

        return CustomHttp.request<Operation[]>(
            `${OperationsService.baseUrl}?${params.toString()}`,
                'GET',
        );
    }

    static async getOne(id: number): Promise<Operation | null> {
        return CustomHttp.request<Operation>(`${OperationsService.baseUrl}/${id}`, 'GET');
    }

    static async create(payload: OperationPayload): Promise<Operation | null> {
        return CustomHttp.request<Operation>(OperationsService.baseUrl, 'POST', {
            type: payload.type,
            category_id: Number(payload.category_id),
            amount: Number(payload.amount),
            date: payload.date,
            comment: payload.comment,
        });
    }

    static async update(id: number, payload: OperationPayload): Promise<Operation | null> {
        return CustomHttp.request<Operation>(`${OperationsService.baseUrl}/${id}`, 'PUT', {
            type: payload.type,
            category_id: Number(payload.category_id),
            amount: Number(payload.amount),
            date: payload.date,
            comment: payload.comment,
        });
    }

    static async delete(id: number): Promise<null> {
        return CustomHttp.request<null>(`${OperationsService.baseUrl}/${id}`, 'DELETE');
    }
}