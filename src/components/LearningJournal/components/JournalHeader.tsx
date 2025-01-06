import React from 'react';
import { Button } from "@/components/ui/button";

export const JournalHeader = ({ onAddEntry }: { onAddEntry: () => void }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">יומן למידה</h2>
      <Button onClick={onAddEntry} className="bg-navy-800 hover:bg-navy-900">
        הוסף רשומה
      </Button>
    </div>
  );
};