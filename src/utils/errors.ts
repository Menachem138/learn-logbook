export function getHebrewError(message: string): string {
  const errorMessages: Record<string, string> = {
    'Failed to fetch': 'שגיאה בטעינת הסרטונים',
    'Invalid YouTube URL': 'כתובת יוטיוב לא תקינה',
    'Video not found': 'הסרטון לא נמצא',
    'Failed to add video': 'שגיאה בהוספת הסרטון',
    'Failed to delete video': 'שגיאה במחיקת הסרטון',
    'Failed to fetch videos': 'שגיאה בטעינת הסרטונים',
  };

  return errorMessages[message] || 'שגיאה לא ידועה';
}
