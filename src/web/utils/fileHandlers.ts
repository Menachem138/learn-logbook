export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Ensure we always return a string
        const result = event.target.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          // Convert ArrayBuffer to base64 string if needed
          const uint8Array = new Uint8Array(result);
          const binaryString = uint8Array.reduce((str, byte) => str + String.fromCharCode(byte), '');
          const base64String = btoa(binaryString);
          resolve(`data:${file.type};base64,${base64String}`);
        }
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};