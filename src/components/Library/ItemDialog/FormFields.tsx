import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldsProps {
  register: any;
  selectedType: string;
}

export function FormFields({ register, selectedType }: FormFieldsProps) {
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