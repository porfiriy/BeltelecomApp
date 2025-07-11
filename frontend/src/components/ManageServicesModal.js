import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import axios from '../api/axios';

const ManageServicesModal = ({ onClose }) => {
   const [services, setServices] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [newService, setNewService] = useState({
      name: '',
      type: 'internet',
   });

   useEffect(() => {
      const fetchServices = async () => {
         try {
            const res = await axios.get('/api/services');
            console.log('Список услуг:', res.data);
            setServices(res.data);
         } catch (err) {
            console.error('Ошибка загрузки услуг:', err);
            setError('Ошибка загрузки услуг: ' + (err.response?.data?.message || err.message));
         } finally {
            setLoading(false);
         }
      };
      fetchServices();
   }, []);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewService(prev => ({ ...prev, [name]: value }));
   };

   const handleAddService = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      try {
         const res = await axios.post('/api/services', newService);
         setServices(prev => [...prev, res.data]);
         setSuccess('Услуга успешно добавлена');
         setNewService({ name: '', type: 'internet' });
         setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
         console.error('Ошибка при добавлении услуги:', err);
         setError('Ошибка при добавлении услуги: ' + (err.response?.data?.message || err.message));
      }
   };

   const handleDeleteService = async (id) => {
      try {
         await axios.delete(`/api/services/${id}`);
         setServices(prev => prev.filter(service => service.id !== id));
         setSuccess('Услуга успешно удалена');
         setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
         console.error('Ошибка при удалении услуги:', err);
         setError('Ошибка при удалении услуги: ' + (err.response?.data?.message || err.message));
      }
   };

   return (
      <div className="gray-background">
         <div className="modal-container">
            <div>
               <h2 className="title">Управление услугами</h2>
               <button className="close-btn" onClick={onClose}>✕</button>
            </div>
            {loading ? (
               <div className="modal-loading">Загрузка...</div>
            ) : error ? (
               <div className="modal-error">{error}</div>
            ) : (
               <>
                  {success && <div className="success">{success}</div>}
                  <form onSubmit={handleAddService}>
                     <div className="form-group">
                        <h3>Добавить новую услугу</h3>
                        <label>
                           Название:
                           <input
                              type="text"
                              name="name"
                              value={newService.name}
                              onChange={handleInputChange}
                              required
                           />
                        </label>
                        <label>
                           Тип:
                           <select
                              name="type"
                              value={newService.type}
                              onChange={handleInputChange}
                              required
                           >
                              <option value="internet">Интернет</option>
                              <option value="tv">ТВ</option>
                              <option value="phone">Телефония</option>
                              <option value="extra">Дополнительная</option>
                           </select>
                        </label>
                        <button type="submit">Добавить</button>
                     </div>
                  </form>
                  <div className="services-list">
                     <h3>Список услуг</h3>
                     {services.length > 0 ? (
                        <ul>
                           {services.map(service => (
                              <li key={service.id}>
                                 {service.name} ({service.type})
                                 <button
                                    onClick={() => handleDeleteService(service.id)}
                                    className="delete-service-btn"
                                    title="удалить услугу"
                                 >
                                    <Trash2 size={16} color="red" />
                                 </button>
                              </li>
                           ))}
                        </ul>
                     ) : (
                        <p>Услуги не найдены</p>
                     )}
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default ManageServicesModal;