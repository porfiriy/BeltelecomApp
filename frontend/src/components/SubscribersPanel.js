import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import axios from '../api/axios';
import AddSubscriberModal from './AddSubscriberModal';
import AssignServicesModal from './AssignServicesModal';
import ManageServicesButton from './ManageServicesButton';

export default function SubscribersPanel() {
   const [showPanel, setShowPanel] = useState(false);
   const [subscribers, setSubscribers] = useState([]);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedSubscriberId, setSelectedSubscriberId] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [subscriberServices, setSubscriberServices] = useState({});

   const fetchSubscribers = async () => {
      try {
         const res = await axios.get('/api/subscribers');
         setSubscribers(res.data);
         // Загружаем услуги для каждого абонента
         const servicesPromises = res.data.map(sub =>
            axios
               .get(`/api/subscribers/${sub.id}/services`)
               .then(res => ({ id: sub.id, services: res.data }))
               .catch(err => {
                  if (err.response?.status === 404) {
                     return { id: sub.id, services: [] };
                  }
                  throw err;
               })
         );
         const servicesData = await Promise.all(servicesPromises);
         const servicesMap = servicesData.reduce((acc, { id, services }) => {
            acc[id] = services;
            return acc;
         }, {});
         setSubscriberServices(servicesMap);
      } catch (err) {
         setError('Ошибка загрузки абонентов');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (showPanel) fetchSubscribers();
   }, [showPanel]);

   const handleDelete = async (id) => {
      try {
         await axios.delete(`/api/subscribers/${id}`);
         setSubscribers(prev => prev.filter(sub => sub.id !== id));
         setSubscriberServices(prev => {
            const newServices = { ...prev };
            delete newServices[id];
            return newServices;
         });
      } catch (err) {
         alert('Ошибка при удалении абонента');
      }
   };

   const handleDeleteService = async (subscriberId, serviceId) => {
      try {
         await axios.delete(`/api/subscriber_service/${serviceId}`);
         setSubscriberServices(prev => ({
            ...prev,
            [subscriberId]: prev[subscriberId].filter(s => s.id !== serviceId),
         }));
      } catch (err) {
         alert('Ошибка при удалении услуги');
      }
   };

   return (
      <div>
         <div className="button-group">
            <button className='subscribers-btn' onClick={() => setShowPanel(!showPanel)}>
               {showPanel ? 'Скрыть абонентов' : 'Абоненты'}
            </button>
            <ManageServicesButton onUpdate={fetchSubscribers} />
         </div>

         {showPanel && (
            <div className="subscribers-wrapper">
               <h2 className="panel-title">Список абонентов</h2>


               <button className="add-subscriber-btn" onClick={() => setIsModalOpen(true)}>
                  Добавить абонента
               </button>


               {loading ? (
                  <p>Загрузка...</p>
               ) : error ? (
                  <p>{error}</p>
               ) : (
                  <ul className="subscribers-list">
                     {subscribers.map(sub => (
                        <li key={sub.id}>
                           <span>{sub.full_name}</span>
                           <button
                              className="assign-services-btn"
                              onClick={() => setSelectedSubscriberId(sub.id)}
                           >
                              Назначить услуги
                           </button>
                           <button title='удалить абонента' onClick={() => handleDelete(sub.id)}>
                              <Trash2 size={20} color="red" />
                           </button>
                           {subscriberServices[sub.id]?.length > 0 ? (
                              <ul className="services-list">
                                 {subscriberServices[sub.id].map(service => (
                                    <li key={service.id}>
                                       {service.name} ({service.type})
                                       <button
                                          onClick={() => handleDeleteService(sub.id, service.id)}
                                          className="delete-service-btn"
                                          title='удалить услугу'
                                       >
                                          <Trash2 size={16} color="red" />
                                       </button>
                                    </li>
                                 ))}
                              </ul>
                           ) : (
                              <p>Услуги не подключены</p>
                           )}
                        </li>
                     ))}
                  </ul>
               )}

               {isModalOpen && (
                  <AddSubscriberModal
                     onClose={() => {
                        setIsModalOpen(false);
                        fetchSubscribers();
                     }}
                  />
               )}
               {selectedSubscriberId && (
                  <AssignServicesModal
                     subscriberId={selectedSubscriberId}
                     onClose={() => {
                        setSelectedSubscriberId(null);
                        fetchSubscribers();
                     }}
                  />
               )}
            </div>
         )}
      </div>
   );
}