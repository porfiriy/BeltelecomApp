// pages/Login.js
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const { login } = useContext(AuthContext);
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await login(email, password);
         navigate('/home');
      } catch (error) {
         alert('Ошибка входа');
      }
   };

   return (
      <div className='login-wrapper'>
         <h2 className='title'>Вход в аккаунт</h2>
         <form className='form-container' onSubmit={handleSubmit}>
            <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="Email"
            />
            <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Пароль"
            />
            <button type="submit">Войти</button>
         </form>
      </div>
   );
}