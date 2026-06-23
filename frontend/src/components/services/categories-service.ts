import { CustomHttp } from './custom-http.js';
import config from '../../../config/config.js';
import type { Category, CategoryType } from '../../types/common.types.js';

export class CategoriesService {
    private readonly baseUrl: string;
    private readonly type: CategoryType;

    constructor(type: CategoryType) {
        this.type = type;
        this.baseUrl = `${config.host}/categories/${type}`;
    }

    async getAll(): Promise<Category[] | null> {
        return CustomHttp.request<Category[]>(this.baseUrl, 'GET');
    }

    async getOne(id: number): Promise<Category | null> {
        return CustomHttp.request<Category>(`${this.baseUrl}/${id}`, 'GET');
    }

    async create(title: string): Promise<Category | null> {
        return CustomHttp.request<Category>(this.baseUrl, 'POST', { title });
    }

    async update(id: number, title: string): Promise<Category | null> {
        return CustomHttp.request<Category>(`${this.baseUrl}/${id}`, 'PUT', { title });
    }

    async delete(id: number): Promise<null> {
        return CustomHttp.request<null>(`${this.baseUrl}/${id}`, 'DELETE');
    }
}