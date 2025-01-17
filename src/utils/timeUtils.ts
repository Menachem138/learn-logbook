/**
 * Formats a time duration in milliseconds to HH:MM:SS format
 * @param time - Time in milliseconds
 * @returns Formatted time string in HH:MM:SS format
 */
export const formatTime = (time: number): string => {
  // Handle negative time
  const absoluteTime = Math.abs(time);
  
  const hours = Math.floor(absoluteTime / 3600000);
  const minutes = Math.floor((absoluteTime % 3600000) / 60000);
  const seconds = Math.floor((absoluteTime % 60000) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formats a time duration in milliseconds to HH:MM format (for total time display)
 * @param time - Time in milliseconds
 * @returns Formatted time string in HH:MM format
 */
export const formatTotalTime = (time: number): string => {
  // Handle negative time
  const absoluteTime = Math.abs(time);
  
  const hours = Math.floor(absoluteTime / 3600000);
  const minutes = Math.floor((absoluteTime % 3600000) / 60000);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Converts minutes to milliseconds
 * @param minutes - Number of minutes
 * @returns Time in milliseconds
 */
export const minutesToMs = (minutes: number): number => {
  return minutes * 60 * 1000;
};

/**
 * Converts milliseconds to minutes
 * @param ms - Time in milliseconds
 * @returns Number of minutes (rounded down)
 */
export const msToMinutes = (ms: number): number => {
  return Math.floor(ms / (60 * 1000));
};
