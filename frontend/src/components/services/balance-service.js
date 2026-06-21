import {CustomHttp} from "./custom-http.js";
import config from "../../../config/config.js";

export class BalanceService {
    static baseUrl = `${config.host}/balance`;

    static async get() {
        return await CustomHttp.request(BalanceService.baseUrl, 'GET');
    }
}