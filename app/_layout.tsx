import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/contexts/AppContext';
import { colors } from '@/constants/colors';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    console.log('[AGDES] Afet Gönüllü Destek Sistemi başlatıldı');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <StatusBar style="dark" />
        <RootLayoutNav />
      </AppProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen 
        name="volunteer-form" 
        options={{ 
          title: 'Gönüllü Kayıt',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="need-form" 
        options={{ 
          title: 'İhtiyaç Bildir',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="need-details/[id]" 
        options={{ 
          title: 'İhtiyaç Detayı',
          presentation: 'card',
        }} 
      />
      <Stack.Screen name="+not-found" options={{ title: 'Sayfa Bulunamadı' }} />
    </Stack>
  );
}