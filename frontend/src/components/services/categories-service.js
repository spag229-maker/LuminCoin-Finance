import {CustomHttp} from "./custom-http.js";
import config from "../../../config/config.js";

export class CategoriesService {
    /**
     * @param {'income' | 'expense'} type
     */
    constructor(type) {
        this.type = type;
        this.baseUrl = `${config.host}/categories/${type}`;
    }

    async getAll() {
        return await CustomHttp.request(this.baseUrl, 'GET');
    }

    async getOne(id) {
        return await CustomHttp.request(`${this.baseUrl}/${id}`, 'GET');
    }

    async create(title) {
        return await CustomHttp.request(this.baseUrl, 'POST', {title});
    }

    async update(id, title) {
        return await CustomHttp.request(`${this.baseUrl}/${id}`, 'PUT', {title});
    }

    async delete(id) {
        return await CustomHttp.request(`${this.baseUrl}/${id}`, 'DELETE');
    }
}