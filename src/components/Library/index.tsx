import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { LibraryItemType, toggleStar } from '@/api/library';

export default function Library() {
  const [items, setItems] = useState([]);

  const handleToggleStar = async (id: string, currentStarred: boolean, itemType: LibraryItemType) => {
    try {
      await toggleStar.mutate({ 
        id, 
        is_starred: !currentStarred,
        type: itemType 
      });
      toast.success('Item updated successfully');
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <button onClick={() => handleToggleStar(item.id, item.is_starred, item.type)}>
            {item.is_starred ? 'Unstar' : 'Star'}
          </button>
        </div>
      ))}
    </div>
  );
}
