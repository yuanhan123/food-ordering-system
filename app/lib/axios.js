import axios from "axios";

export let BASE_URL = ""

if(process.env.NODE_ENV == "production"){
    BASE_URL = process.env.PRODUCTION_URL;
}else{
    BASE_URL = process.env.BASE_URL;
}

// const BASE_URL = process.env.BASE_URL;

export default axios.create({
    baseURL:BASE_URL,
    headers:{"Content-Type": "application/json"},
});

export const axiosAuth = axios.create({
    baseURL:BASE_URL,
    headers:{"Content-Type": "application/json"},
})