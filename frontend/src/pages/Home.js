import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import AddSubscriberModal from '../components/AddSubscriberModal';

export default function Home() {

   const { user, logout } = useContext(AuthContext);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [formData, setFormData] = useState({
      full_name: '',
      address: '',
      phone: '',
      email: '',
      registration_date: '',
   });
   const [errors, setErrors] = useState({});
   const [success, setSuccess] = useState('');

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setErrors({});
      setSuccess('');

      try {
         await api.get('/sanctum/csrf-cookie');
         const response = await api.post('/api/subscribers', formData);
         setSuccess(response.data.message);
         setFormData({
            full_name: '',
            address: '',
            phone: '',
            email: '',
            registration_date: '',
         });
         setTimeout(() => {
            setIsModalOpen(false); // Закрываем модальное окно после успеха
            setSuccess('');
         }, 1000);
      } catch (error) {
         if (error.response && error.response.status === 422) {
            setErrors(error.response.data.errors);
         } else {
            console.error('Ошибка:', error);
            setErrors({ general: 'Не удалось добавить абонента' });
         }
      }
   };

   if (!user) {
      return <div>Пожалуйста, войдите в систему</div>;
   }

   return (
      <div className="container">
         <div className="home-wrapper">
            <p className="greeting-text">Добро пожаловать, <span className='user-name-text'>{user?.name}</span></p>
            <h2 className="title">Панель управления Белтелеком</h2>
            <button className="logout-btn" onClick={logout}>
               Выйти из аккаунта
            </button>
            <AddSubscriberModal />
         </div>
      </div>
   );
}
