import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import SubscribersPanel from '../components/SubscribersPanel';

export default function Home() {

   const { user, logout } = useContext(AuthContext);

   if (!user) {
      return <div>Пожалуйста, войдите в систему</div>;
   }

   return (
      <div className="container">
         <div className="home-wrapper">
            <p className="greeting-text">Добро пожаловать, <span className='user-name-text'>{user?.name}</span></p>
            <h2 className="title">Панель управления Белтелеком</h2>
            <SubscribersPanel />
         </div>
      </div>
   );
}
