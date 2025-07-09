import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const AssignServicesModal = ({ subscriberId, onClose }) => {
   const [services, setServices] = useState([]);
   const [selectedServices, setSelectedServices] = useState({
      phone: null,
      internet: null,
      tv: null,
      extra: [],
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');

   useEffect(() => {
      const fetchServices = async () => {
         try {
            const [servicesRes, subscriberServicesRes] = await Promise.all([
               axios.get('/api/services'),
               axios.get(`/api/subscribers/${subscriberId}/services`).catch(err => ({
                  data: [], // Возвращаем пустой массив при ошибке
               })),
            ]);
            console.log('Услуги:', servicesRes.data); // Отладка
            console.log('Услуги абонента:', subscriberServicesRes.data); // Отладка
            setServices(servicesRes.data);

            const subscriberServices = subscriberServicesRes.data;
            const phoneService = servicesRes.data.find(s => s.type === 'phone');
            const internetService = subscriberServices.find(s => s.type === 'internet')?.id;
            const tvService = subscriberServices.find(s => s.type === 'tv')?.id;
            const extraServices = subscriberServices
               .filter(s => s.type === 'extra')
               .map(s => s.id);

            setSelectedServices({
               phone: phoneService?.id || null,
               internet: internetService || null,
               tv: tvService || null,
               extra: extraServices,
            });
         } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            setError('Ошибка загрузки услуг');
         } finally {
            setLoading(false);
         }
      };
      fetchServices();
   }, [subscriberId]);

   const handleServiceChange = (type, serviceId) => {
      if (type === 'internet' || type === 'tv') {
         setSelectedServices(prev => ({ ...prev, [type]: serviceId }));
      } else if (type === 'extra') {
         setSelectedServices(prev => ({
            ...prev,
            extra: prev.extra.includes(serviceId)
               ? prev.extra.filter(id => id !== serviceId)
               : [...prev.extra, serviceId],
         }));
      } else if (type === 'phone') {
         setSelectedServices(prev => ({ ...prev, phone: serviceId }));
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      if (!selectedServices.phone) {
         setError('Услуга телефонии обязательна');
         return;
      }

      try {
         const servicesToAssign = [
            selectedServices.phone,
            selectedServices.internet,
            selectedServices.tv,
            ...selectedServices.extra,
         ].filter(id => id !== null);

         await Promise.all(
            servicesToAssign.map(serviceId =>
               axios.post('/api/subscriber_service', {
                  subscriber_id: subscriberId,
                  service_id: serviceId,
               })
            )
         );
         setSuccess('Услуги успешно назначены');
         setTimeout(() => {
            onClose();
         }, 1000);
      } catch (err) {
         console.error('Ошибка при назначении услуг:', err);
         setError('Ошибка при назначении услуг');
      }
   };

   const groupedServices = services.reduce((acc, service) => {
      acc[service.type] = acc[service.type] || [];
      acc[service.type].push(service);
      return acc;
   }, {});

   console.log('Группированные услуги:', groupedServices); // Отладка

   if (loading) {
      return <div className="modal-loading">Загрузка...</div>;
   }

   if (error) {
      return <div className="modal-error">{error}</div>;
   }

   return (
      <div className="gray-background">
         <div className="modal-container">
            <div>
               <h2 className="title">Назначить услуги</h2>
               <button className="close-btn" onClick={onClose}>✕</button>
            </div>
            {success && <div className="success">{success}</div>}
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
               <div className="form-group">
                  <h3>Телефония (обязательно)</h3>
                  {groupedServices.phone?.length > 0 ? (
                     groupedServices.phone.map(service => (
                        <div key={service.id}>
                           <input
                              type="radio"
                              name="phone"
                              value={service.id}
                              checked={selectedServices.phone === service.id}
                              onChange={() => handleServiceChange('phone', service.id)}
                           />
                           <label>{service.name}</label>
                        </div>
                     ))
                  ) : (
                     <p>Услуги телефонии не найдены</p>
                  )}
               </div>
               <div className="form-group">
                  <h3>Интернет (выберите один тариф)</h3>
                  {groupedServices.internet?.length > 0 ? (
                     groupedServices.internet.map(service => (
                        <div key={service.id}>
                           <input
                              type="radio"
                              name="internet"
                              value={service.id}
                              checked={selectedServices.internet === service.id}
                              onChange={() => handleServiceChange('internet', service.id)}
                           />
                           <label>{service.name}</label>
                        </div>
                     ))
                  ) : (
                     <p>Услуги интернета не найдены</p>
                  )}
               </div>
               <div className="form-group">
                  <h3>ТВ (выберите один тариф)</h3>
                  {groupedServices.tv?.length > 0 ? (
                     groupedServices.tv.map(service => (
                        <div key={service.id}>
                           <input
                              type="radio"
                              name="tv"
                              value={service.id}
                              checked={selectedServices.tv === service.id}
                              onChange={() => handleServiceChange('tv', service.id)}
                           />
                           <label>{service.name}</label>
                        </div>
                     ))
                  ) : (
                     <p>Услуги ТВ не найдены</p>
                  )}
               </div>
               <div className="form-group">
                  <h3>Дополнительные услуги</h3>
                  {groupedServices.extra?.length > 0 ? (
                     groupedServices.extra.map(service => (
                        <div key={service.id}>
                           <input
                              type="checkbox"
                              value={service.id}
                              checked={selectedServices.extra.includes(service.id)}
                              onChange={() => handleServiceChange('extra', service.id)}
                           />
                           <label>{service.name}</label>
                        </div>
                     ))
                  ) : (
                     <p>Дополнительные услуги не найдены</p>
                  )}
               </div>
               <div className="form-group-btns">
                  <button type="button" onClick={onClose}>Отмена</button>
                  <button type="submit">Назначить</button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default AssignServicesModal;