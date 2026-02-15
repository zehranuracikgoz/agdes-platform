import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, CheckCircle, ArrowLeft, RefreshCw, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { NeedType, NEED_TYPE_LABELS, URGENCY_LABELS, URGENCY_COLORS } from '@/types';

const needTypeOptions = Object.entries(NEED_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export default function NeedFormScreen() {
  const router = useRouter();
  const { addNeed } = useApp();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [tckn, setTckn] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [needType, setNeedType] = useState<NeedType | ''>('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  const locationSubscription = useRef<any>(null);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.log('İzin hatası:', error);
      return false;
    }
  };

  const getDetailedAddress = async (latitude: number, longitude: number) => {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        
        const addressParts = [];

        if (addr.street && addr.streetNumber) {
          addressParts.push(`${addr.street} No:${addr.streetNumber}`);
        } else if (addr.street) {
          addressParts.push(addr.street);
        }
        
        if (addr.district) addressParts.push(addr.district);
        if (addr.city) addressParts.push(addr.city);
        if (addr.region) addressParts.push(addr.region);
        
        if (addr.name && addr.name !== addr.street && !addressParts.includes(addr.name)) {
          addressParts.unshift(addr.name);
        }

        const fullAddress = addressParts.filter(part => part && part.length > 0).join(', ');
        
        return fullAddress || 'Konum bilgisi alındı';
      }
      
      return 'Konum bilgisi alındı';
    } catch (error) {
      console.log('Adres çözümleme hatası:', error);
      return 'Konum bilgisi alındı';
    }
  };

  const getHighAccuracyLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.log('Yüksek doğruluklu konum hatası:', error);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    }
  };

  const startLocationUpdates = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000,
        distanceInterval: 5,
      },
      async (newLocation) => {
        const address = await getDetailedAddress(
          newLocation.coords.latitude,
          newLocation.coords.longitude
        );
        
        setLocation({
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          address: address,
        });
      }
    );
  };

  const setDefaultLocation = async (errorMsg?: string) => {
    const defaultCoords = { latitude: 37.8750, longitude: 32.4800 };
    const address = await getDetailedAddress(defaultCoords.latitude, defaultCoords.longitude);
    
    setLocation({
      ...defaultCoords,
      address: errorMsg ? `${errorMsg} - ${address}` : address,
    });
    setLocationLoading(false);
  };

  const getLocation = async (useHighAccuracy: boolean = true) => {
    setLocationLoading(true);
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const address = await getDetailedAddress(
                position.coords.latitude,
                position.coords.longitude
              );
              
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                address: address,
              });
              setLocationLoading(false);
            },
            (error) => {
              console.log('Web konum hatası:', error);
              setDefaultLocation();
            },
            {
              enableHighAccuracy: useHighAccuracy,
              timeout: 30000,
              maximumAge: 0
            }
          );
        } else {
          setDefaultLocation();
        }
      } else {
        const hasPermission = await requestLocationPermission();
        
        if (!hasPermission) {
          setDefaultLocation('Konum izni verilmedi');
          return;
        }

        const coords = await getHighAccuracyLocation();
        
        const address = await getDetailedAddress(coords.latitude, coords.longitude);
        
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: address,
        });

        await startLocationUpdates();
      }
    } catch (error) {
      console.log('Genel konum hatası:', error);
      setDefaultLocation('Konum alınamadı');
    } finally {
      setLocationLoading(false);
    }
  };

  const refreshLocation = async () => {
    Alert.alert(
      'Konum Güncelle',
      'Konumunuzu güncellemek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Güncelle', 
          onPress: async () => {
            if (locationSubscription.current) {
              locationSubscription.current.remove();
            }
            await getLocation(true);
          }
        }
      ]
    );
  };

  const helpWithGPS = () => {
    Alert.alert(
      'GPS Nasıl Açılır?',
      'Daha doğru konum için:\n\n' +
      'Android: Ayarlar > Konum > Yüksek Doğruluk\n' +
      'iPhone: Ayarlar > Gizlilik > Konum Servisleri\n\n' +
      'GPS kapalıysa yaklaşık konum alınır.',
      [{ text: 'Anladım' }]
    );
  };

  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    getLocation(true);
  }, []);

  const formatTCKN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  };

  const handleSubmit = () => {
    if (!title || !description || !needType || !location) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      addNeed({
        title,
        description,
        urgencyLevel,
        needType: needType as NeedType,
        location,
      });
      
      setIsSubmitting(false);
      setSuccess(true);
      
      setTimeout(() => {
        router.back();
      }, 2000);
    }, 1000);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Talep Alındı!</Text>
          <Text style={styles.successText}>
            İhtiyaç talebiniz kaydedildi. En uygun gönüllü en kısa sürede sizinle iletişime geçecektir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>İhtiyaç Bildir</Text>
        </View>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

        <Input
          label="Ad"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Adınız"
          required
          autoCapitalize="words"
        />

        <Input
          label="Soyad"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Soyadınız"
          required
          autoCapitalize="words"
        />

        <Input
          label="TC Kimlik No"
          value={formatTCKN(tckn)}
          onChangeText={(v) => setTckn(v.replace(/\s/g, ''))}
          placeholder="123 456 789 01"
          required
          keyboardType="numeric"
          maxLength={14}
        />

        <Input
          label="Telefon"
          value={formatPhone(phone)}
          onChangeText={(v) => setPhone(v.replace(/\s/g, ''))}
          placeholder="555 123 45 67"
          required
          keyboardType="phone-pad"
          maxLength={13}
        />

        <Text style={styles.sectionTitle}>İhtiyaç Detayları</Text>
        
        <Input
          label="Başlık"
          value={title}
          onChangeText={setTitle}
          placeholder="Kısa ve açıklayıcı bir başlık"
          required
        />
        
        <Input
          label="Açıklama"
          value={description}
          onChangeText={setDescription}
          placeholder="Detaylı açıklama yazın..."
          required
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />
        
        <Select
          label="İhtiyaç Tipi"
          options={needTypeOptions}
          value={needType}
          onChange={(v) => setNeedType(v as NeedType)}
          placeholder="İhtiyaç tipini seçin"
          required
        />

        <Text style={styles.sectionTitle}>Aciliyet Seviyesi</Text>
        
        <View style={styles.urgencyContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.urgencyButton,
                urgencyLevel === level && { backgroundColor: URGENCY_COLORS[level], borderColor: URGENCY_COLORS[level] }
              ]}
              onPress={() => setUrgencyLevel(level as 1 | 2 | 3 | 4 | 5)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.urgencyNumber,
                urgencyLevel === level && styles.urgencyNumberActive
              ]}>
                {level}
              </Text>
              <Text style={[
                styles.urgencyLabel,
                urgencyLevel === level && styles.urgencyLabelActive
              ]}>
                {URGENCY_LABELS[level]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Konum</Text>
        
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.locationTitleContainer}>
              <MapPin size={20} color={location ? colors.success : colors.textMuted} />
              <Text style={styles.locationTitle}>Mevcut Konumunuz</Text>
            </View>
            <View style={styles.locationActions}>
              <TouchableOpacity 
                onPress={refreshLocation} 
                style={styles.refreshButton}
                disabled={locationLoading}
              >
                <RefreshCw size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={helpWithGPS} 
                style={styles.helpButton}
              >
                <Navigation size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.locationContent}>
            {locationLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Konum alınıyor...</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.locationAddress, location && styles.locationAddressActive]}>
                  {location?.address || 'Konum alınamadı'}
                </Text>
              </>
            )}
          </View>
        </View>

        {locationPermission === false && (
          <Text style={styles.permissionWarning}>
            Konum izni verilmedi. Yaklaşık konum kullanılıyor.
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="İhtiyaç Bildir"
            onPress={handleSubmit}
            loading={isSubmitting}
            size="large"
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    width: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  urgencyNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  urgencyNumberActive: {
    color: colors.textLight,
  },
  urgencyLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  urgencyLabelActive: {
    color: colors.textLight,
  },
  locationCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  helpButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  locationContent: {
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  locationAddressActive: {
    color: colors.text,
    fontWeight: '500',
  },
  permissionWarning: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 8,
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});