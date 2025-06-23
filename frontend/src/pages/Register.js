import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
   const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
   const { register } = useContext(AuthContext);
   const navigate = useNavigate();

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await register(form);
         navigate('/login');
      } catch (err) {
         alert('Упсс... Ошибка регистрации');
      }
   };

   return (
      <div className='login-wrapper'>
         <form className='form-container' onSubmit={handleSubmit}>
            <h2 className='title'>Регистрация</h2>
            <input placeholder="Имя" onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Пароль" onChange={e => setForm({ ...form, password: e.target.value })} />
            <input type="password" placeholder="Подтвердите пароль" onChange={e => setForm({ ...form, password_confirmation: e.target.value })} />
            <button type="submit">Зарегистрироваться</button>
         </form>
      </div>
   );
}
