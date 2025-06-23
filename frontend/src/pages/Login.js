import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
   const [form, setForm] = useState({ email: '', password: '' });
   const { login } = useContext(AuthContext);
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await login(form.email, form.password);
         navigate('/home');
      } catch (err) {
         alert('Ошибка входа');
      }
   };

   return (
      <form onSubmit={handleSubmit}>
         <h2>Вход</h2>
         <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
         <input type="password" placeholder="Пароль" onChange={e => setForm({ ...form, password: e.target.value })} />
         <button type="submit">Войти</button>
      </form>
   );
}
