import { useState } from 'react';
import axios from '../api/axios';

export default function AddSubscriberModal({ onClose }) {
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
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await axios.post('/api/subscribers', formData);
         setSuccess('Абонент добавлен!');
         setTimeout(() => onClose(), 1000); // Закрыть окно
      } catch (err) {
         if (err.response?.data?.errors) {
            setErrors(err.response.data.errors);
         } else {
            setErrors({ general: 'Ошибка при добавлении' });
         }
      }
   };

   return (
      <div className="gray-background">
         <div className="modal-container">
            <div className="modal-header">
               <h2 className="title">Добавить нового абонента</h2>
               <button className="close-btn" onClick={onClose}>✕</button>
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
                  <button className='cancel-btn' type="button" onClick={onClose}>Отмена</button>
                  <button className='submit-btn' type="submit">Добавить</button>
               </div>
            </form>
         </div>
      </div>
   );
}
