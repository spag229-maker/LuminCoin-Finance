import {CustomHttp} from "./custom-http.js";
import config from "../../../config/config.js";

export class OperationsService {
    static baseUrl = `${config.host}/operations`;

    /**
     * @param {{period: string, dateFrom?: string, dateTo?: string}} filter
     */
    static async getAll(filter = {period: 'today'}) {
        const params = new URLSearchParams();
        params.set('period', filter.period || 'today');
        if (filter.period === 'interval') {
            if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
            if (filter.dateTo) params.set('dateTo', filter.dateTo);
        }

        return await CustomHttp.request(`${OperationsService.baseUrl}?${params.toString()}`, 'GET');
    }

    static async getOne(id) {
        return await CustomHttp.request(`${OperationsService.baseUrl}/${id}`, 'GET');
    }

    /**
     * @param {{type: 'income'|'expense', category_id: number, amount: number, date: string, comment: string}} payload
     */
    static async create(payload) {
        return await CustomHttp.request(OperationsService.baseUrl, 'POST', {
            type: payload.type,
            category_id: Number(payload.category_id),
            amount: Number(payload.amount),
            date: payload.date,
            comment: payload.comment,
        });
    }

    static async update(id, payload) {
        return await CustomHttp.request(`${OperationsService.baseUrl}/${id}`, 'PUT', {
            type: payload.type,
            category_id: Number(payload.category_id),
            amount: Number(payload.amount),
            date: payload.date,
            comment: payload.comment,
        });
    }

    static async delete(id) {
        return await CustomHttp.request(`${OperationsService.baseUrl}/${id}`, 'DELETE');
    }
}