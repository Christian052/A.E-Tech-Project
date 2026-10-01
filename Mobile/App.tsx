import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, asyncStoragePersister } from "./src/config/queryClient";
import { AuthProvider } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { View, ActivityIndicator } from "react-native";
import { colors } from "./src/theme/colors";

export default function App() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours offline cache
        }}
        onSuccess={() => {
          console.log("[PersistQueryClient] Cache restored from AsyncStorage successfully");
        }}
      >
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <NotificationProvider>
                <StatusBar style="light" />
                <RootNavigator />
              </NotificationProvider>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
