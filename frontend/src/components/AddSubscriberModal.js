import { useState } from 'react';
import axios from '../api/axios';

export default function AddSubscriberModal({ onClose }) {
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
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const resetForm = () => {
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
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         await axios.post('/api/subscribers', formData);
         setSuccess('Абонент добавлен!');
         setTimeout(() => onClose(), 1000);
      } catch (err) {
         if (err.response?.data?.errors) {
            setErrors(err.response.data.errors);
         } else {
            setErrors({ general: 'Ошибка при добавлении' });
         }
      }
   };

   return (
      <>
         <button onClick={() => setIsModalOpen(true)}>Добавить абонента</button>

         {isModalOpen && (
            <div className="gray-background">
               <div className="modal-container">
                  <div>
                     <h2 className="title">Добавить нового абонента</h2>
                     <button className="close-btn" onClick={onClose}>✕</button>
                  </div>

                  {success && <div>{success}</div>}
                  {errors.general && <div>{errors.general}</div>}

                  <form onSubmit={handleSubmit}>
                     {['full_name', 'address', 'phone', 'email', 'registration_date'].map((field, i) => (
                        <div className="form-group" key={i}>
                           <label>{field === 'full_name' ? 'ФИО' :
                              field === 'address' ? 'Адрес' :
                                 field === 'phone' ? 'Телефон' :
                                    field === 'email' ? 'Email (необязательно)' :
                                       'Дата регистрации (необязательно)'}</label>
                           <input
                              type={field === 'registration_date' ? 'date' : field === 'email' ? 'email' : 'text'}
                              name={field}
                              value={formData[field]}
                              onChange={handleChange}
                              placeholder={field === 'full_name' ? 'Иванов Иван Иванович' :
                                 field === 'address' ? 'г. Минск, ул. Ленина, д. 10' :
                                    field === 'phone' ? '+375291234567' :
                                       field === 'email' ? 'example@domain.com' : ''}
                           />
                           {errors[field] && <p>{errors[field][0]}</p>}
                        </div>
                     ))}

                     <div className="form-group-btns">
                        <button type="button" onClick={resetForm}>Отмена</button>
                        <button type="submit">Добавить</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </>
   );
}
