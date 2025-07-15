import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const AssignServicesModal = ({ subscriberId, onClose }) => {
   const [services, setServices] = useState([]);
   const [equipment, setEquipment] = useState([]);
   const [equipmentTypes, setEquipmentTypes] = useState([]);
   const [selectedServiceId, setSelectedServiceId] = useState('');
   const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([]);
   const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [servicesRes, equipmentRes, typesRes] = await Promise.all([
               axios.get('/api/services'),
               axios.get('/api/equipment'),
               axios.get('/api/equipment_types'),
            ]);
            setServices(servicesRes.data);
            setEquipment(equipmentRes.data.filter(eq => eq.status === 'free'));
            setEquipmentTypes(typesRes.data);
            setLoading(false);
         } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            setError('Ошибка загрузки данных: ' + (err.response?.data?.message || err.message));
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   const handleAssignService = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      try {
         await axios.post('/api/subscriber_service', {
            subscriber_id: subscriberId,
            service_id: selectedServiceId,
            equipment_ids: selectedEquipmentIds,
            issue_date: issueDate,
         });
         setSuccess('Услуга и оборудование успешно назначены');
         setSelectedServiceId('');
         setSelectedEquipmentIds([]);
         setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
         console.error('Ошибка при назначении услуги:', err);
         setError('Ошибка при назначении услуги: ' + (err.response?.data?.message || err.message));
      }
   };

   const handleEquipmentChange = (e) => {
      const options = e.target.options;
      const selected = [];
      for (let i = 0; i < options.length; i++) {
         if (options[i].selected) {
            selected.push(options[i].value);
         }
      }
      setSelectedEquipmentIds(selected);
   };

   const getEquipmentTypeName = (typeId) => {
      const type = equipmentTypes.find(t => t.id === parseInt(typeId));
      return type ? type.name : 'Неизвестный тип';
   };

   return (
      <div className="gray-background">
         <div className="modal-container">
            <div>
               <h2 className="title">Назначить услуги для абонента {subscriberId}</h2>
               <button className="close-btn" onClick={onClose}>✕</button>
            </div>
            {loading ? (
               <div className="modal-loading">Загрузка...</div>
            ) : error ? (
               <div className="modal-error">{error}</div>
            ) : (
               <>
                  {success && <div className="success">{success}</div>}
                  <form onSubmit={handleAssignService}>
                     <div className="form-group">
                        <label>
                           Услуга:
                           <select
                              value={selectedServiceId}
                              onChange={e => setSelectedServiceId(e.target.value)}
                              required
                           >
                              <option value="">Выберите услугу</option>
                              {services.map(service => (
                                 <option key={service.id} value={service.id}>
                                    {service.name} ({service.type})
                                 </option>
                              ))}
                           </select>
                        </label>
                        {selectedServiceId && services.find(s => s.id === parseInt(selectedServiceId))?.type === 'internet' && (
                           <label>
                              Роутер/Модем:
                              <select
                                 multiple
                                 value={selectedEquipmentIds}
                                 onChange={handleEquipmentChange}
                              >
                                 {equipment
                                    .filter(eq => [1, 2].includes(eq.equipment_type_id)) // Роутер или Модем
                                    .map(eq => (
                                       <option key={eq.id} value={eq.id}>{eq.model} ({getEquipmentTypeName(eq.equipment_type_id)})</option>
                                    ))}
                              </select>
                           </label>
                        )}
                        {selectedServiceId && services.find(s => s.id === parseInt(selectedServiceId))?.type === 'tv' && (
                           <>
                              <label>
                                 Роутер/Модем:
                                 <select
                                    multiple
                                    value={selectedEquipmentIds}
                                    onChange={handleEquipmentChange}
                                 >
                                    {equipment
                                       .filter(eq => [1, 2].includes(eq.equipment_type_id)) // Роутер или Модем
                                       .map(eq => (
                                          <option key={eq.id} value={eq.id}>{eq.model} ({getEquipmentTypeName(eq.equipment_type_id)})</option>
                                       ))}
                                 </select>
                              </label>
                              <label>
                                 ТВ-приставка:
                                 <select
                                    multiple
                                    value={selectedEquipmentIds}
                                    onChange={handleEquipmentChange}
                                 >
                                    {equipment
                                       .filter(eq => eq.equipment_type_id === 3) // ТВ-приставка
                                       .map(eq => (
                                          <option key={eq.id} value={eq.id}>{eq.model} ({getEquipmentTypeName(eq.equipment_type_id)})</option>
                                       ))}
                                 </select>
                              </label>
                           </>
                        )}
                        {selectedServiceId && services.find(s => s.id === parseInt(selectedServiceId))?.name.includes('Видеоконтроль') && (
                           <label>
                              Камера:
                              <select
                                 multiple
                                 value={selectedEquipmentIds}
                                 onChange={handleEquipmentChange}
                              >
                                 {equipment
                                    .filter(eq => eq.equipment_type_id === 4) // Камера
                                    .map(eq => (
                                       <option key={eq.id} value={eq.id}>{eq.model} ({getEquipmentTypeName(eq.equipment_type_id)})</option>
                                    ))}
                              </select>
                           </label>
                        )}
                        <label>
                           Дата выдачи:
                           <input
                              type="date"
                              value={issueDate}
                              onChange={e => setIssueDate(e.target.value)}
                              required
                           />
                        </label>
                        <button type="submit">Назначить</button>
                     </div>
                  </form>
               </>
            )}
         </div>
      </div>
   );
};

export default AssignServicesModal;