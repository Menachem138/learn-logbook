import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = '@auth_biometric_enabled';

export function useBiometricAuth() {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const checkBiometricAvailability = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const savedPreference = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    
    setIsAvailable(hasHardware && isEnrolled);
    setIsBiometricEnabled(savedPreference === 'true');
    
    return hasHardware && isEnrolled;
  }, []);

  const toggleBiometric = useCallback(async () => {
    const newState = !isBiometricEnabled;
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(newState));
    setIsBiometricEnabled(newState);
  }, [isBiometricEnabled]);

  const authenticateWithBiometric = useCallback(async () => {
    if (!isAvailable || !isBiometricEnabled) return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'אימות זהות',
        fallbackLabel: 'השתמש בסיסמה',
        cancelLabel: 'ביטול',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }, [isAvailable, isBiometricEnabled]);

  return {
    isAvailable,
    isBiometricEnabled,
    checkBiometricAvailability,
    toggleBiometric,
    authenticateWithBiometric,
  };
}
