import axios from "axios";
import { Router } from "next/router";
import { parseCookies } from "nookies";
import { apiUrl, url } from "../utils/pageUrl";

export function getAPIClient(ctx?: any) {
    
    const { 'sol.token': token } = parseCookies(ctx);

    const api = axios.create({
        baseURL: apiUrl
    });
    
    api.interceptors.response.use(
        response => response,
        error => {
            if(error.response.status === 401 && error.response.data.code == 154879645) {                
                window.location.replace(`${url}/401`);
            } else {
                return Promise.reject(error);
            }
        }
    );

    if(token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return api;
}