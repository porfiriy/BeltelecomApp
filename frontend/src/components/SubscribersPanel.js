import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import axios from '../api/axios';
import AddSubscriberModal from './AddSubscriberModal';
import AssignServicesModal from './AssignServicesModal';
import ManageServicesButton from './ManageServicesButton';
import ManageEquipmentButton from './ManageEquipmentButton';


export default function SubscribersPanel() {
   const [subscribers, setSubscribers] = useState([]);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedSubscriberId, setSelectedSubscriberId] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [subscriberServices, setSubscriberServices] = useState({});
   const [subscriberEquipment, setSubscriberEquipment] = useState({});

   const fetchSubscribers = async () => {
      try {
         setLoading(true);
         setError('');
         console.log('Отправка запроса GET /api/subscribers');
         const res = await axios.get('/api/subscribers');
         console.log('Получены абоненты:', res.data);
         setSubscribers(res.data);

         console.log('Загрузка услуг и оборудования для абонентов...');
         const servicesPromises = res.data.map(sub =>
            axios
               .get(`/api/subscribers/${sub.id}/services`)
               .then(res => ({ id: sub.id, services: res.data }))
               .catch(err => {
                  console.error(`Ошибка загрузки услуг для абонента ${sub.id}:`, err);
                  if (err.response?.status === 404) {
                     return { id: sub.id, services: [] };
                  }
                  throw err;
               })
         );

         const equipmentPromises = res.data.map(sub =>
            axios
               .get(`/api/subscribers/${sub.id}/equipment`)
               .then(res => ({ id: sub.id, equipment: res.data }))
               .catch(err => {
                  console.error(`Ошибка загрузки оборудования для абонента ${sub.id}:`, err);
                  if (err.response?.status === 404) {
                     return { id: sub.id, equipment: [] };
                  }
                  throw err;
               })
         );

         const [servicesData, equipmentData] = await Promise.all([
            Promise.all(servicesPromises),
            Promise.all(equipmentPromises),
         ]);

         const servicesMap = servicesData.reduce((acc, { id, services }) => {
            acc[id] = services;
            return acc;
         }, {});
         const equipmentMap = equipmentData.reduce((acc, { id, equipment }) => {
            acc[id] = equipment;
            return acc;
         }, {});
         console.log('Карта услуг:', servicesMap);
         console.log('Карта оборудования:', equipmentMap);
         setSubscriberServices(servicesMap);
         setSubscriberEquipment(equipmentMap);
      } catch (err) {
         console.error('Ошибка в fetchSubscribers:', err);
         setError('Ошибка загрузки абонентов: ' + (err.response?.data?.message || err.message));
      } finally {
         setLoading(false);
      }
   };

   const handleDelete = async (id) => {
      try {
         console.log(`Удаление абонента ${id}`);
         await axios.delete(`/api/subscribers/${id}`);
         setSubscribers(prev => prev.filter(sub => sub.id !== id));
         setSubscriberServices(prev => {
            const newServices = { ...prev };
            delete newServices[id];
            return newServices;
         });
         setSubscriberEquipment(prev => {
            const newEquipment = { ...prev };
            delete newEquipment[id];
            return newEquipment;
         });
      } catch (err) {
         console.error('Ошибка при удалении абонента:', err);
         alert('Ошибка при удалении абонента');
      }
   };

   const handleDeleteService = async (subscriberId, serviceId) => {
      try {
         console.log(`Удаление услуги ${serviceId} для абонента ${subscriberId}`);
         await axios.delete(`/api/subscriber_service/${serviceId}`);
         setSubscriberServices(prev => ({
            ...prev,
            [subscriberId]: prev[subscriberId].filter(s => s.id !== serviceId),
         }));
      } catch (err) {
         console.error('Ошибка при удалении услуги:', err);
         alert('Ошибка при удалении услуги');
      }
   };

   return (
      <div>
         <div className="subscribers-wrapper">
            <h2 className="panel-title">Список абонентов</h2>

            <div className="button-group">
               <button className="add-subscriber-btn" onClick={() => setIsModalOpen(true)}>
                  Добавить абонента
               </button>
               <ManageServicesButton onUpdate={fetchSubscribers} />
               <ManageEquipmentButton onUpdate={fetchSubscribers} />
               <button className="load-subscribers-btn" onClick={fetchSubscribers}>
                  Загрузить абонентов
               </button>
            </div>

            {loading ? (
               <p>Загрузка...</p>
            ) : error ? (
               <p>{error}</p>
            ) : subscribers.length > 0 ? (
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
                        <button title="удалить абонента" onClick={() => handleDelete(sub.id)}>
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
                                       title="удалить услугу"
                                    >
                                       <Trash2 size={16} color="red" />
                                    </button>
                                 </li>
                              ))}
                           </ul>
                        ) : (
                           <p>Услуги не подключены</p>
                        )}
                        {subscriberEquipment[sub.id]?.length > 0 ? (
                           <ul className="equipment-list">
                              {subscriberEquipment[sub.id].map(eq => (
                                 <li key={eq.id}>
                                    {eq.model} ({eq.equipment_type ? eq.equipment_type.name : 'Неизвестный тип'}) - {eq.status === 'issued' ? `Выдано ${new Date(eq.created_at).toLocaleDateString()}` : eq.status}
                                 </li>
                              ))}
                           </ul>
                        ) : (
                           <p>Оборудование не выдано</p>
                        )}
                     </li>
                  ))}
               </ul>
            ) : (
               <p>Абоненты не найдены</p>
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
      </div>
   );
}