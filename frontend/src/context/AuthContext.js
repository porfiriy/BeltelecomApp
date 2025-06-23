// context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   const login = async (email, password) => {
      try {
         // Получаем CSRF-токен (если используете Sanctum)
         await api.get('/sanctum/csrf-cookie');
         await api.post('/api/login', { email, password });
         const res = await api.get('/api/me');
         setUser(res.data);
      } catch (error) {
         console.error('Ошибка входа:', error.response?.data || error.message);
         throw error;
      }
   };

   const register = async (name, email, password, password_confirmation) => {
      try {
         await api.get('/sanctum/csrf-cookie');
         await api.post('/api/register', { name, email, password, password_confirmation });
         const res = await api.get('/api/me');
         setUser(res.data);
      } catch (error) {
         console.error('Ошибка регистрации:', error.response?.data || error.message);
         throw error;
      }
   };

   const logout = async () => {
      try {
         await api.post('/api/logout');
      } catch (error) {
         console.error('Ошибка выхода:', error.response?.data || error.message);
      } finally {
         setUser(null);
      }
   };

   const checkAuth = async () => {
      try {
         setLoading(true);
         const res = await api.get('/api/me');
         setUser(res.data);
      } catch (error) {
         console.error('Не авторизован:', error.response?.data || error.message);
         setUser(null);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      checkAuth();
   }, []);

   return (
      <AuthContext.Provider value={{ user, login, logout, register, loading }}>
         {loading ? <div>Загрузка...</div> : children}
      </AuthContext.Provider>
   );
};