import { useState, useEffect } from 'react';
import axios from '../api/axios';
import AddSubscriberModal from './AddSubscriberModal';

export default function SubscribersPanel() {
   const [showPanel, setShowPanel] = useState(false);
   const [subscribers, setSubscribers] = useState([]);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   const fetchSubscribers = async () => {
      try {
         const res = await axios.get('/api/subscribers');
         setSubscribers(res.data);
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
      } catch (err) {
         alert('Ошибка при удалении абонента');
      }
   };

   return (
      <div>
         <button onClick={() => setShowPanel(!showPanel)}>
            {showPanel ? 'Скрыть абонентов' : 'Абоненты'}
         </button>

         {showPanel && (
            <div className="subscribers-wrapper">
               <h2>Список абонентов</h2>

               <button onClick={() => setIsModalOpen(true)}>
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
                           <button onClick={() => handleDelete(sub.id)}>Удалить</button>
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
            </div>
         )}
      </div>
   );
}
