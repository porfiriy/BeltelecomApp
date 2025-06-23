import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

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
            <p className="greeting-text">Добро пожаловать, {user?.name}</p>
            <h2 className="title">Панель управления Белтелеком</h2>
            <button className="logout-btn" onClick={logout}>
               Выйти из аккаунта
            </button>
            <button
               onClick={() => setIsModalOpen(true)}
            >
               Добавить абонента
            </button>
         </div>

         {/* Модальное окно */}
         {isModalOpen && (
            <div className="gray-background">
               <div className="modal-container">
                  <div>
                     <h2 className='title'>Добавить нового абонента</h2>
                     <button
                        className="close-btn"
                        onClick={() => {
                           setIsModalOpen(false);
                           setErrors({});
                           setSuccess('');
                           setFormData({
                              full_name: '',
                              address: '',
                              phone: '',
                              email: '',
                              registration_date: '',
                           });
                        }}
                     >
                        ✕
                     </button>
                  </div>
                  {success && <div>{success}</div>}
                  {errors.general && <div>{errors.general}</div>}
                  <form onSubmit={handleSubmit}>
                     <div className="form-group">
                        <label>ФИО</label>
                        <input
                           type="text"
                           name="full_name"
                           value={formData.full_name}
                           onChange={handleChange}
                           placeholder="Иванов Иван Иванович"
                        />
                        {errors.full_name && <p>{errors.full_name[0]}</p>}
                     </div>
                     <div className="form-group">
                        <label>Адрес</label>
                        <input
                           type="text"
                           name="address"
                           value={formData.address}
                           onChange={handleChange}
                           placeholder="г. Минск, ул. Ленина, д. 10"
                        />
                        {errors.address && <p>{errors.address[0]}</p>}
                     </div>
                     <div className="form-group">
                        <label>Телефон</label>
                        <input
                           type="text"
                           name="phone"
                           value={formData.phone}
                           onChange={handleChange}
                           placeholder="+375291234567"
                        />
                        {errors.phone && <p>{errors.phone[0]}</p>}
                     </div>
                     <div className="form-group">
                        <label>Email (необязательно)</label>
                        <input
                           type="email"
                           name="email"
                           value={formData.email}
                           onChange={handleChange}
                           placeholder="example@domain.com"
                        />
                        {errors.email && <p>{errors.email[0]}</p>}
                     </div>
                     <div className="form-group">
                        <label>Дата регистрации (необязательно)</label>
                        <input
                           type="date"
                           name="registration_date"
                           value={formData.registration_date}
                           onChange={handleChange}
                        />
                        {errors.registration_date && <p>{errors.registration_date[0]}</p>}
                     </div>
                     <div className="form-group-btns">
                        <button
                           type="button"
                           onClick={() => {
                              setIsModalOpen(false);
                              setErrors({});
                              setSuccess('');
                              setFormData({
                                 full_name: '',
                                 address: '',
                                 phone: '',
                                 email: '',
                                 registration_date: '',
                              });
                           }}>Отмена</button>
                        <button type="submit">Добавить</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
