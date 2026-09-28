import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "augu_mobile_access_token";
const REFRESH_TOKEN_KEY = "augu_mobile_refresh_token";

/**
 * Universal secure storage helper with fallback:
 * Prefers expo-secure-store (hardware-backed encrypted keychain/keystore).
 * Gracefully falls back to AsyncStorage in environments where SecureStore is unavailable (e.g. web preview).
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      return await SecureStore.getItemAsync(key);
    }
  } catch (e) {
    // SecureStore not available or threw on platform
  }

  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setSecureItem(key: string, value: string | null): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      if (value) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
      return;
    }
  } catch (e) {
    // fallback to AsyncStorage
  }

  try {
    if (value) {
      await AsyncStorage.setItem(key, value);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch {}
}

export async function getStoredAccessToken(): Promise<string | null> {
  return getSecureItem(ACCESS_TOKEN_KEY);
}

export async function setStoredAccessToken(token: string | null): Promise<void> {
  return setSecureItem(ACCESS_TOKEN_KEY, token);
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return getSecureItem(REFRESH_TOKEN_KEY);
}

export async function setStoredRefreshToken(token: string | null): Promise<void> {
  return setSecureItem(REFRESH_TOKEN_KEY, token);
}
