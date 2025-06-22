import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
   baseURL: 'http://127.0.0.1:8000',
   withCredentials: true,
});

// Настройка перехватчика для экземпляра api
api.interceptors.request.use((config) => {
   const xsrfToken = Cookies.get('XSRF-TOKEN');
   if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken); // Декодируем токен
   }
   return config;
});

export default api;