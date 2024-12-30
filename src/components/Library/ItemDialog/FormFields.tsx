import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LibraryItemType } from "@/types/library";
import { UseFormRegister } from "react-hook-form";

interface FormFieldsProps {
  register: UseFormRegister<any>;
  selectedType: LibraryItemType;
  isEditing: boolean;
}

export function FormFields({ register, selectedType, isEditing }: FormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="כותרת"
          {...register("title", { required: true })}
        />
      </div>
      <div>
        <select
          className="w-full p-2 border rounded-md"
          {...register("type", { required: true })}
          disabled={isEditing}
        >
          <option value="note">הערה</option>
          <option value="link">קישור</option>
          <option value="image">תמונה</option>
          <option value="image_gallery">אלבום תמונות</option>
          <option value="video">וידאו</option>
          <option value="whatsapp">וואטסאפ</option>
          <option value="question">שאלה</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      <div>
        <Textarea
          placeholder={selectedType === 'question' ? "מה השאלה שלך?" : "תוכן"}
          {...register("content", { required: true })}
        />
      </div>
    </div>
  );
}