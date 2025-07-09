import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const AssignServicesModal = ({ subscriberId, onClose }) => {
   const [services, setServices] = useState([]);
   const [selectedServices, setSelectedServices] = useState({
      telephony: null,
      internet: null,
      tv: null,
      additional: [],
   });
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');

   useEffect(() => {
      const fetchServices = async () => {
         try {
            const res = await axios.get('/api/services');
            setServices(res.data);

            const telephonyService = res.data.find(s => s.type === 'telephony');
            if (telephonyService) {
               setSelectedServices(prev => ({ ...prev, telephony: telephonyService.id }));
            }
         } catch (err) {
            setError('Ошибка загрузки услуг');
         } finally {
            setLoading(false);
         }
      };
      fetchServices();
   }, []);

   const handleServiceChange = (type, serviceId) => {
      if (type === 'internet' || type === 'tv') {
         setSelectedServices(prev => ({ ...prev, [type]: serviceId }));
      } else if (type === 'additional') {
         setSelectedServices(prev => ({
            ...prev,
            additional: prev.additional.includes(serviceId)
               ? prev.additional.filter(id => id !== serviceId)
               : [...prev.additional, serviceId],
         }));
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      if (!selectedServices.telephony) {
         setError('Услуга телефонии обязательна');
         return;
      }

      try {
         const servicesToAssign = [
            selectedServices.telephony,
            selectedServices.internet,
            selectedServices.tv,
            ...selectedServices.additional,
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
         setError('Ошибка при назначении услуг');
      }
   };

   const groupedServices = services.reduce((acc, service) => {
      acc[service.type] = acc[service.type] || [];
      acc[service.type].push(service);
      return acc;
   }, {});

   if (!loading && error) {
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
            {loading ? (
               <p>Загрузка...</p>
            ) : (
               <form onSubmit={handleSubmit}>
                  <div className="form-group">
                     <h3>Телефония (обязательно)</h3>
                     {groupedServices.telephony?.map(service => (
                        <div key={service.id}>
                           <input
                              type="radio"
                              name="telephony"
                              value={service.id}
                              checked={selectedServices.telephony === service.id}
                              disabled
                           />
                           <label>{service.name}</label>
                        </div>
                     ))}
                  </div>
                  <div className="form-group">
                     <h3>Интернет (выберите один тариф)</h3>
                     {groupedServices.internet?.map(service => (
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
                     ))}
                  </div>
                  <div className="form-group">
                     <h3>ТВ (выберите один тариф)</h3>
                     {groupedServices.tv?.map(service => (
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
                     ))}
                  </div>
                  <div className="form-group">
                     <h3>Дополнительные услуги</h3>
                     {groupedServices.additional?.map(service => (
                        <div key={service.id}>
                           <input
                              type="checkbox"
                              value={service.id}
                              checked={selectedServices.additional.includes(service.id)}
                              onChange={() => handleServiceChange('additional', service.id)}
                           />
                           <label>{service.name}</label>
                        </div>
                     ))}
                  </div>
                  <div className="form-group-btns">
                     <button type="button" onClick={onClose}>Отмена</button>
                     <button type="submit">Назначить</button>
                  </div>
               </form>
            )}
         </div>
      </div>
   );
};

export default AssignServicesModal;