import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
   const { user, logout } = useContext(AuthContext);

   return (
      <div>
         <h2>Добро пожаловать, {user?.name}</h2>
         <button onClick={logout}>Выйти</button>
      </div>
   );
}
