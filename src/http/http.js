import axios from 'axios'

const http = axios.create({
    baseURL: 'http://119.23.53.78:8888/api/private/v1'
})

export default http