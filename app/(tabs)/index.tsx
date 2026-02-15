import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, AlertTriangle, Users, ClipboardList } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { stats } = useApp();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <Text style={styles.slogan}>&quot;Doğru gönüllü, doğru ihtiyaçta&quot;</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Users size={20} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.activeVolunteers}</Text>
          <Text style={styles.statLabel}>Aktif Gönüllü</Text>
        </View>
        <View style={styles.statCard}>
          <ClipboardList size={20} color={colors.warning} />
          <Text style={styles.statNumber}>{stats.pendingNeeds}</Text>
          <Text style={styles.statLabel}>Bekleyen İhtiyaç</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/volunteer-form' as never)}
          activeOpacity={0.9}
        >
          <View style={styles.actionIconContainer}>
            <Heart size={48} color={colors.textLight} />
          </View>
          <Text style={styles.actionTitle}>Gönüllü Ol</Text>
          <Text style={styles.actionDescription}>
            Afet bölgelerinde yardım etmek için kayıt ol
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => router.push('/need-form' as never)}
          activeOpacity={0.9}
        >
          <View style={[styles.actionIconContainer, styles.actionIconSecondary]}>
            <AlertTriangle size={48} color={colors.textLight} />
          </View>
          <Text style={[styles.actionTitle, styles.actionTitleSecondary]}>İhtiyacım Var</Text>
          <Text style={[styles.actionDescription, styles.actionDescriptionSecondary]}>
            Acil yardım veya destek talebinde bulun
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Deprem sonrası koordinasyon için hızlı ve güvenilir çözüm
        </Text>
      </View>
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
    paddingBottom: 24,
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
  slogan: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.primary,
    fontWeight: '500' as const,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
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
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButtonSecondary: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
  },
  actionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionIconSecondary: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textLight,
    marginBottom: 8,
  },
  actionTitleSecondary: {
    color: colors.textLight,
  },
  actionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  actionDescriptionSecondary: {
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
