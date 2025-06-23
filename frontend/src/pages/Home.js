import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
   const { user, logout } = useContext(AuthContext);

   return (
      <div>
         <p>Добро пожаловать, {user?.name}</p>
         <h2>Панель управления Белтелеком</h2>
         <button onClick={logout}>Выйти из аккаунта</button>
      </div>
   );
}
