import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);

   const login = async (email, password) => {
      await axios.get('/sanctum/csrf-cookie');
      await axios.post('/api/login', { email, password });
      const res = await axios.get('/api/me');
      setUser(res.data);
   };

   const register = async (data) => {
      await axios.get('/sanctum/csrf-cookie');
      await axios.post('/api/register', data);
      const res = await axios.get('/api/user');
      setUser(res.data);
   };

   const logout = async () => {
      await axios.post('/api/logout');
      setUser(null);
   };

   const checkAuth = async () => {
      try {
         const res = await axios.get('/api/user');
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
