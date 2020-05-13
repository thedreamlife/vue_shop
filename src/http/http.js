import axios from 'axios'

const http = axios.create({
    baseURL: 'http://119.23.53.78:8888/api/private/v1'
})
http.interceptors.request.use(config => {
    // console.log(config);
    // 需要授权的API必须在请求头中使用Authorization字段提供token令牌
    config.headers.Authorization = window.sessionStorage.getItem('token')

    return config
})
export default http