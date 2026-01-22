
import axios from "axios";
import {Agent} from "https";
import urls from "./urls.js";

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0 (Edition std-2)";
const agent = new Agent({
    rejectUnauthorized: false,
});

let instance = axios.create({
    baseURL: urls.base_url,
    httpsAgent: agent,
    responseType: 'arraybuffer',
    responseEncoding: 'binary',
    headers: {
        "User-Agent": userAgent
    }
})

async function post(url: string, data?: any, headers?: {}) {
    return await instance.post(url, data, {
        headers: {
            ...headers,
        }
    })
}
async function get(url: string, headers?: {}) {
    return await instance.get(url, {
        headers: {

            ...headers,
        }
    })
}

function setSessionCookie(cookie: string) {
    instance.interceptors.request.use((request)=> {
        request.headers.cookie= cookie;
        return request
    })
}

export default {
    post,
    get,
    setSessionCookie,
}