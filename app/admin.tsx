import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, MapPin, Clock, ChevronRight, Users, CheckCircle, LogOut, Heart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Need, NEED_TYPE_LABELS, URGENCY_LABELS, URGENCY_COLORS } from '@/types';

function NeedCard({ need, onPress }: { need: Need; onPress: () => void }) {
  const urgencyColor = URGENCY_COLORS[need.urgencyLevel];
  
  return (
    <TouchableOpacity style={styles.needCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.urgencyBar, { backgroundColor: urgencyColor }]} />
      <View style={styles.needContent}>
        <View style={styles.needHeader}>
          <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}20` }]}>
            <AlertTriangle size={14} color={urgencyColor} />
            <Text style={[styles.urgencyText, { color: urgencyColor }]}>
              {URGENCY_LABELS[need.urgencyLevel]}
            </Text>
          </View>
          <Text style={styles.needType}>{NEED_TYPE_LABELS[need.needType]}</Text>
        </View>
        
        <Text style={styles.needTitle} numberOfLines={2}>{need.title}</Text>
        
        <View style={styles.needMeta}>
          <View style={styles.metaItem}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {need.location.address || 'Konum belirtilmemiş'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {new Date(need.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function AdminScreen() {
  const router = useRouter();
  const { pendingNeeds, stats } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Yetkili panelinden çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: () => router.replace('/login')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Ana sayfa ile aynı stil */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Heart size={32} color={colors.textLight} fill={colors.textLight} />
          </View>
          <View>
            <Text style={styles.logoText}>AGDES</Text>
            <Text style={styles.logoSubtext}>Afet Gönüllü Destek Sistemi</Text>
          </View>
        </View>
        <View style={styles.panelInfo}>
          <Text style={styles.panelTitle}>Yetkili Paneli</Text>
          <Text style={styles.slogan}>&quot;Doğru gönüllü, doğru ihtiyaçta&quot;</Text>
        </View>
      </View>

      <FlatList
        data={pendingNeeds}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NeedCard 
            need={item} 
            onPress={() => router.push(`/need-details/${item.id}`)}
          />
        )}
        ListHeaderComponent={
          <>
            {/* İstatistikler - Ana sayfadaki kartlarla uyumlu */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <AlertTriangle size={20} color={colors.warning} />
                <Text style={styles.statNumber}>{stats.pendingNeeds}</Text>
                <Text style={styles.statLabel}>Bekleyen</Text>
              </View>
              <View style={styles.statCard}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.statNumber}>{stats.activeVolunteers}</Text>
                <Text style={styles.statLabel}>Gönüllü</Text>
              </View>
              <View style={styles.statCard}>
                <CheckCircle size={20} color={colors.success} />
                <Text style={styles.statNumber}>{stats.assignedNeeds}</Text>
                <Text style={styles.statLabel}>Atanmış</Text>
              </View>
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Bekleyen İhtiyaçlar</Text>
              <Text style={styles.listCount}>{pendingNeeds.length} kayıt</Text>
            </View>
          </>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} color={colors.textMuted} />
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <CheckCircle size={48} color={colors.success} />
            <Text style={styles.emptyTitle}>Tüm İhtiyaçlar Karşılandı</Text>
            <Text style={styles.emptyText}>Şu an bekleyen ihtiyaç bulunmuyor</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  panelInfo: {
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    marginTop:6,
  },
  slogan: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700'as const,
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  listCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  listContent: {
    paddingBottom: 24,
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    width: '100%',
    maxWidth: 200,
  },
  logoutText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  needCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  urgencyBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  needContent: {
    flex: 1,
    padding: 12,
  },
  needHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  needType: {
    fontSize: 11,
    color: colors.textMuted,
  },
  needTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  needMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});