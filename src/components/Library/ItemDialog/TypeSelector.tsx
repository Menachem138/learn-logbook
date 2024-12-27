import { LibraryItemType } from "@/types/library";
import { UseFormRegister } from "react-hook-form";

interface TypeSelectorProps {
  register: UseFormRegister<any>;
  disabled?: boolean;
}

export function TypeSelector({ register, disabled }: TypeSelectorProps) {
  return (
    <select
      className="w-full p-2 border rounded-md"
      {...register("type", { required: true })}
      disabled={disabled}
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
  );
}