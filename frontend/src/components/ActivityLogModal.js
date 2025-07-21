import { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function ActivityLogModal({ onClose }) {
   const [activities, setActivities] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      const fetchActivities = async () => {
         try {
            const response = await axios.get('/api/dashboard');
            setActivities(response.data.recentActivities);
            setLoading(false);
         } catch (err) {
            console.error('Ошибка запроса:', err.response?.data);
            setError(err.response?.data?.error || 'Ошибка при загрузке логов активности');
            setLoading(false);
         }
      };

      fetchActivities();
   }, []);

   return (
      <div className="gray-background">
         <div className="modal-container">
            <div className="modal-header">
               <h2 className="title">Логи активности</h2>
               <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            {loading && <div>Загрузка...</div>}
            {error && <div className="error text-red-500">{error}</div>}

            {!loading && !error && activities.length === 0 && (
               <div className="text-gray-500">Нет недавних действий.</div>
            )}

            {!loading && !error && activities.length > 0 && (
               <ul className="space-y-4">
                  {activities.map((activity) => (
                     <li key={activity.id} className="border-b pb-2">
                        <p><strong>Сотрудник:</strong> {activity.user_name}</p>
                        <p><strong>Действие:</strong> {activity.action}</p>
                        <p><strong>Подробности:</strong> {activity.details}</p>
                        <p><strong>Дата:</strong> {activity.logged_at}</p>
                     </li>
                  ))}
               </ul>
            )}

            <div className="form-group-btns">
               <button className="cancel-btn" type="button" onClick={onClose}>
                  Закрыть
               </button>
            </div>
         </div>
      </div>
   );
}