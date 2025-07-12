import React, { useState } from 'react';
import ManageEquipmentModal from './ManageEquipmentModal';


const ManageEquipmentButton = ({ onUpdate }) => {
   const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);

   return (
      <>
         <button
            className="manage-equipment-btn"
            onClick={() => setIsEquipmentModalOpen(true)}
         >
            Управление оборудованием
         </button>
         {isEquipmentModalOpen && (
            <ManageEquipmentModal
               onClose={() => {
                  setIsEquipmentModalOpen(false);
                  if (onUpdate) onUpdate();
               }}
            />
         )}
      </>
   );
};

export default ManageEquipmentButton;