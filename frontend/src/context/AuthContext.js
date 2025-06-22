import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);

   const login = async (email, password) => {
      try {
         await api.get('/sanctum/csrf-cookie');
         await api.post('/api/login', { email, password });
         const res = await api.get('/api/me');
         setUser(res.data);
      } catch (error) {
         console.error('Ошибка входа:', error.response?.data || error.message);
         throw error;
      }
   };

   const register = async (data) => {
      try {
         await api.get('/sanctum/csrf-cookie');
         await api.post('/api/register', data);
         const res = await api.get('/api/user');
         setUser(res.data);
      } catch (error) {
         console.error('Ошибка регистрации:', error.response?.data || error.message);
         throw error;
      }
   };

   const logout = async () => {
      try {
         await api.post('/api/logout');
         setUser(null);
      } catch (error) {
         console.error('Ошибка выхода:', error.response?.data || error.message);
      }
   };

   const checkAuth = async () => {
      try {
         const res = await api.get('/api/user');
         setUser(res.data);
      } catch {
         setUser(null);
      }
   };

   useEffect(() => {
      checkAuth();
   }, []);

   return (
      <AuthContext.Provider value={{ user, login, logout, register }}>
         {children}
      </AuthContext.Provider>
   );
};