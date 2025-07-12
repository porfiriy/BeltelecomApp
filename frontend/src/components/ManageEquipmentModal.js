import React, { useState, useEffect } from 'react';
import axios from '../api/axios';


const ManageEquipmentModal = ({ onClose }) => {
   const [equipment, setEquipment] = useState([]);
   const [subscribers, setSubscribers] = useState([]);
   const [equipmentTypes, setEquipmentTypes] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [newEquipment, setNewEquipment] = useState({
      model: '',
      equipment_type_id: '1',
   });
   const [issueData, setIssueData] = useState({
      subscriber_id: '',
      equipment_id: '',
      issue_date: new Date().toISOString().split('T')[0],
   });
   const [replaceData, setReplaceData] = useState({
      subscriber_id: '',
      old_equipment_id: '',
      new_equipment_id: '',
      issue_date: new Date().toISOString().split('T')[0],
   });

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [equipmentRes, subscribersRes, typesRes] = await Promise.all([
               axios.get('/api/equipment'),
               axios.get('/api/subscribers'),
               axios.get('/api/equipment_types'),
            ]);
            console.log('Список оборудования:', equipmentRes.data);
            console.log('Список абонентов:', subscribersRes.data);
            console.log('Типы оборудования:', typesRes.data);
            setEquipment(equipmentRes.data);
            setSubscribers(subscribersRes.data);
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

   const handleInputChange = (e, setState) => {
      const { name, value } = e.target;
      setState(prev => ({ ...prev, [name]: value }));
   };

   const handleAddEquipment = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      try {
         const res = await axios.post('/api/equipment', newEquipment);
         setEquipment(prev => [...prev, res.data]);
         setSuccess('Оборудование успешно добавлено');
         setNewEquipment({ model: '', equipment_type_id: '1' });
         setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
         console.error('Ошибка при добавлении оборудования:', err);
         setError('Ошибка при добавлении оборудования: ' + (err.response?.data?.message || err.message));
      }
   };

   const handleIssueEquipment = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      try {
         await axios.post('/api/subscriber_equipment', issueData);
         setSuccess('Оборудование успешно выдано');
         setIssueData({
            subscriber_id: '',
            equipment_id: '',
            issue_date: new Date().toISOString().split('T')[0],
         });
         setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
         console.error('Ошибка при выдаче оборудования:', err);
         setError('Ошибка при выдаче оборудования: ' + (err.response?.data?.message || err.message));
      }
   };

   const handleReplaceEquipment = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      try {
         await axios.post('/api/replace_equipment', replaceData);
         setSuccess('Оборудование успешно заменено');
         setReplaceData({
            subscriber_id: '',
            old_equipment_id: '',
            new_equipment_id: '',
            issue_date: new Date().toISOString().split('T')[0],
         });
         setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
         console.error('Ошибка при замене оборудования:', err);
         setError('Ошибка при замене оборудования: ' + (err.response?.data?.message || err.message));
      }
   };

   return (
      <div className="gray-background">
         <div className="modal-container">
            <div>
               <h2 className="title">Управление оборудованием</h2>
               <button className="close-btn" onClick={onClose}>✕</button>
            </div>
            {loading ? (
               <div className="modal-loading">Загрузка...</div>
            ) : error ? (
               <div className="modal-error">{error}</div>
            ) : (
               <>
                  {success && <div className="success">{success}</div>}
                  <form onSubmit={handleAddEquipment}>
                     <div className="form-group">
                        <h3>Добавить новое оборудование</h3>
                        <label>
                           Модель:
                           <input
                              type="text"
                              name="model"
                              value={newEquipment.model}
                              onChange={e => handleInputChange(e, setNewEquipment)}
                              required
                           />
                        </label>
                        <label>
                           Тип:
                           <select
                              name="equipment_type_id"
                              value={newEquipment.equipment_type_id}
                              onChange={e => handleInputChange(e, setNewEquipment)}
                              required
                           >
                              {equipmentTypes.map(type => (
                                 <option key={type.id} value={type.id}>{type.name}</option>
                              ))}
                           </select>
                        </label>
                        <button type="submit">Добавить</button>
                     </div>
                  </form>
                  <form onSubmit={handleIssueEquipment}>
                     <div className="form-group">
                        <h3>Выдать оборудование</h3>
                        <label>
                           Абонент:
                           <select
                              name="subscriber_id"
                              value={issueData.subscriber_id}
                              onChange={e => handleInputChange(e, setIssueData)}
                              required
                           >
                              <option value="">Выберите абонента</option>
                              {subscribers.map(sub => (
                                 <option key={sub.id} value={sub.id}>{sub.full_name}</option>
                              ))}
                           </select>
                        </label>
                        <label>
                           Оборудование:
                           <select
                              name="equipment_id"
                              value={issueData.equipment_id}
                              onChange={e => handleInputChange(e, setIssueData)}
                              required
                           >
                              <option value="">Выберите оборудование</option>
                              {equipment.filter(eq => eq.status === 'available').map(eq => (
                                 <option key={eq.id} value={eq.id}>
                                    {eq.model} ({eq.equipment_type ? eq.equipment_type.name : 'Неизвестный тип'})
                                 </option>
                              ))}
                           </select>
                        </label>
                        <label>
                           Дата выдачи:
                           <input
                              type="date"
                              name="issue_date"
                              value={issueData.issue_date}
                              onChange={e => handleInputChange(e, setIssueData)}
                              required
                           />
                        </label>
                        <button type="submit">Выдать</button>
                     </div>
                  </form>
                  <form onSubmit={handleReplaceEquipment}>
                     <div className="form-group">
                        <h3>Заменить оборудование</h3>
                        <label>
                           Абонент:
                           <select
                              name="subscriber_id"
                              value={replaceData.subscriber_id}
                              onChange={e => handleInputChange(e, setReplaceData)}
                              required
                           >
                              <option value="">Выберите абонента</option>
                              {subscribers.map(sub => (
                                 <option key={sub.id} value={sub.id}>{sub.full_name}</option>
                              ))}
                           </select>
                        </label>
                        <label>
                           Старое оборудование:
                           <select
                              name="old_equipment_id"
                              value={replaceData.old_equipment_id}
                              onChange={e => handleInputChange(e, setReplaceData)}
                              required
                           >
                              <option value="">Выберите оборудование</option>
                              {equipment.filter(eq => eq.status === 'issued' && eq.subscriber_id == replaceData.subscriber_id).map(eq => (
                                 <option key={eq.id} value={eq.id}>
                                    {eq.model} ({eq.equipment_type ? eq.equipment_type.name : 'Неизвестный тип'})
                                 </option>
                              ))}
                           </select>
                        </label>
                        <label>
                           Новое оборудование:
                           <select
                              name="new_equipment_id"
                              value={replaceData.new_equipment_id}
                              onChange={e => handleInputChange(e, setReplaceData)}
                              required
                           >
                              <option value="">Выберите оборудование</option>
                              {equipment.filter(eq => eq.status === 'available' && (
                                 replaceData.old_equipment_id ? eq.equipment_type_id === equipment.find(e => e.id == replaceData.old_equipment_id)?.equipment_type_id : true
                              )).map(eq => (
                                 <option key={eq.id} value={eq.id}>
                                    {eq.model} ({eq.equipment_type ? eq.equipment_type.name : 'Неизвестный тип'})
                                 </option>
                              ))}
                           </select>
                        </label>
                        <label>
                           Дата выдачи:
                           <input
                              type="date"
                              name="issue_date"
                              value={replaceData.issue_date}
                              onChange={e => handleInputChange(e, setReplaceData)}
                              required
                           />
                        </label>
                        <button type="submit">Заменить</button>
                     </div>
                  </form>
                  <div className="equipment-list">
                     <h3>Список оборудования</h3>
                     {equipment.length > 0 ? (
                        <ul>
                           {equipment.map(eq => (
                              <li key={eq.id}>
                                 {eq.model} ({eq.equipment_type ? eq.equipment_type.name : 'Неизвестный тип'}) - {eq.status === 'free' ? 'Доступно' : eq.status === 'issued' ? 'Выдано' : 'Возвращено'}
                              </li>
                           ))}
                        </ul>
                     ) : (
                        <p>Оборудование не найдено</p>
                     )}
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default ManageEquipmentModal;