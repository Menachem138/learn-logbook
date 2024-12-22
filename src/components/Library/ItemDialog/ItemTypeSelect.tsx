import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LibraryItemType } from "@/types/library";

interface ItemTypeSelectProps {
  selectedType: LibraryItemType;
  onTypeChange: (value: string) => void;
}

export function ItemTypeSelect({ selectedType, onTypeChange }: ItemTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">סוג פריט</Label>
      <Select
        onValueChange={onTypeChange}
        defaultValue={selectedType}
      >
        <SelectTrigger>
          <SelectValue placeholder="בחר סוג פריט" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="note">הערה</SelectItem>
          <SelectItem value="link">קישור</SelectItem>
          <SelectItem value="image">תמונה</SelectItem>
          <SelectItem value="image_album">אלבום תמונות</SelectItem>
          <SelectItem value="video">וידאו</SelectItem>
          <SelectItem value="whatsapp">וואטסאפ</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="question">שאלה</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}