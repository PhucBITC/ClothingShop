//Cầu nối API localhost:8080
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Địa chỉ Backend của bạn
});

export default api;