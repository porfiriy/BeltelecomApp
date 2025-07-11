import React, { useState } from 'react';
import ManageServicesModal from './ManageServicesModal';

const ManageServicesButton = ({ onUpdate }) => {
   const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

   return (
      <>
         <button
            className="manage-services-btn"
            onClick={() => setIsServicesModalOpen(true)}
         >
            Управление услугами
         </button>
         {isServicesModalOpen && (
            <ManageServicesModal
               onClose={() => {
                  setIsServicesModalOpen(false);
                  if (onUpdate) onUpdate();
               }}
            />
         )}
      </>
   );
};

export default ManageServicesButton;