import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, AlertTriangle, User, Phone, Award, Navigation, CheckCircle, ArrowLeft, TrendingUp, Filter, RefreshCw } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/Button';
import { NEED_TYPE_LABELS, URGENCY_LABELS, URGENCY_COLORS, SKILL_LABELS, AVAILABILITY_LABELS, SkillType, AvailabilityType } from '@/types';
import { formatDistance, VolunteerMatch } from '@/utils/matching';

function VolunteerCard({ match, onAssign, isAssigning, index }: { match: VolunteerMatch; onAssign: () => void; isAssigning: boolean; index: number }) {
  const scorePercent = Math.round(match.score * 100);
  
  return (
    <View style={styles.volunteerCard}>
      
      <View style={styles.volunteerHeader}>
        <View style={[styles.volunteerAvatar, index === 0 && styles.topVolunteerAvatar]}>
          <User size={24} color={colors.textLight} />
        </View>
        <View style={styles.volunteerInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.volunteerName} numberOfLines={1}>
              {match.volunteer.firstName} {match.volunteer.lastName}
            </Text>
            {index === 0 && (
              <View style={styles.bestMatchBadge}>
                <TrendingUp size={12} color={colors.success} />
                <Text style={styles.bestMatchText}>En İyi Eşleşme</Text>
              </View>
            )}
          </View>
          <Text style={styles.volunteerSkill}>{SKILL_LABELS[match.volunteer.skill as SkillType]}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scorePercent >= 70 ? colors.successLight : scorePercent >= 40 ? colors.warningLight : colors.dangerLight }]}>
          <Text style={[styles.scoreText, { color: scorePercent >= 70 ? colors.success : scorePercent >= 40 ? colors.warning : colors.danger }]}>
            %{scorePercent}
          </Text>
        </View>
      </View>
      
      <View style={styles.volunteerMeta}>
        <View style={styles.metaRow}>
          <Navigation size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatDistance(match.distance)} uzaklıkta</Text>
        </View>
        <View style={styles.metaRow}>
          <Clock size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{AVAILABILITY_LABELS[match.volunteer.availability as AvailabilityType]}</Text>
        </View>
        <View style={styles.metaRow}>
          <Phone size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{match.volunteer.phone}</Text>
        </View>
      </View>

      <View style={styles.aiInsights}>
        <Text style={styles.aiInsightsTitle}>AI Değerlendirmesi</Text>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>• Beceri uyumu:</Text>
          <Text style={styles.insightValue}>{Math.round(match.skillMatch * 100)}%</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>• Mesafe faktörü:</Text>
          <Text style={styles.insightValue}>{Math.round(match.distanceScore * 100)}%</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>• Müsaitlik durumu:</Text>
          <Text style={styles.insightValue}>{Math.round(match.availabilityScore * 100)}%</Text>
        </View>
        <View style={styles.insightDivider} />
        <Text style={styles.insightSummary}>
          {index === 0 
            ? 'Bu gönüllü tüm kriterlerde en yüksek uyuma sahip. Hemen atama yapılması önerilir.'
            : index === 1
            ? 'İkinci en iyi alternatif. İlk tercih ulaşamazsa değerlendirilebilir.'
            : index === 2
            ? 'İyi bir alternatif. Acil durumlarda değerlendirilebilir.'
            : 'Diğer uygun gönüllüler.'}
        </Text>
      </View>
      
      <Button
        title="Gönüllüyü Ata"
        onPress={onAssign}
        loading={isAssigning}
        size="medium"
        variant={index === 0 ? 'secondary' : 'primary'}
      />
    </View>
  );
}

export default function NeedDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { needs, getMatchesForNeed, assignVolunteer } = useApp();
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(false);
  const [filterSkill, setFilterSkill] = useState<SkillType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'availability'>('score');
  
  const need = useMemo(() => needs.find(n => n.id === id), [needs, id]);
  const matches = useMemo(() => need ? getMatchesForNeed(need.id) : [], [need, getMatchesForNeed]);
  
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = [...matches];
    
    if (filterSkill !== 'all') {
      filtered = filtered.filter(m => m.volunteer.skill === filterSkill);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'distance') return a.distance - b.distance;
      if (sortBy === 'availability') {
        const availabilityOrder = { 'anytime': 3, 'evenings': 2, 'weekends': 1 };
        return (availabilityOrder[b.volunteer.availability] || 0) - (availabilityOrder[a.volunteer.availability] || 0);
      }
      return 0;
    });
    
    return filtered;
  }, [matches, filterSkill, sortBy]);

  const stats = useMemo(() => {
    if (matches.length === 0) return null;
    
    const avgScore = matches.reduce((sum, m) => sum + m.score, 0) / matches.length;
    const avgDistance = matches.reduce((sum, m) => sum + m.distance, 0) / matches.length;
    const bestMatch = matches.reduce((best, current) => current.score > best.score ? current : best, matches[0]);
    
    return { avgScore, avgDistance, bestMatch };
  }, [matches]);
  
  if (!need) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hata</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>İhtiyaç bulunamadı</Text>
          <Button title="Geri Dön" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const urgencyColor = URGENCY_COLORS[need.urgencyLevel];

  const handleAssign = (volunteerId: string) => {
    setAssigningId(volunteerId);
    
    setTimeout(() => {
      assignVolunteer(need.id, volunteerId);
      setAssigningId(null);
      setAssigned(true);
      
      Alert.alert(
        'Atama Başarılı',
        'Gönüllü ihtiyaca atandı. SMS ve bildirim gönderildi.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
    }, 1500);
  };

  if (assigned) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Atama Tamamlandı!</Text>
          <Text style={styles.successText}>
            Gönüllüye bildirim gönderildi. Koordinasyon sağlanıyor.
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
          <Text style={styles.headerTitle}>İhtiyaç Detayı</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.needCard, { borderLeftColor: urgencyColor }]}>
          <View style={styles.needHeader}>
            <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}20` }]}>
              <AlertTriangle size={16} color={urgencyColor} />
              <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                {URGENCY_LABELS[need.urgencyLevel]}
              </Text>
            </View>
            <Text style={styles.needType}>{NEED_TYPE_LABELS[need.needType]}</Text>
          </View>
          
          <Text style={styles.needTitle}>{need.title}</Text>
          <Text style={styles.needDescription}>{need.description}</Text>
          
          <View style={styles.needMeta}>
            <View style={styles.metaRow}>
              <MapPin size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{need.location.address || 'Konum belirtilmemiş'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Clock size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {new Date(need.createdAt).toLocaleString('tr-TR', { 
                  day: 'numeric', 
                  month: 'long', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
        </View>

        {stats && (
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Award size={20} color={colors.primary} />
              <Text style={styles.statsTitle}>AI Öneri Analizi</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{matches.length}</Text>
                <Text style={styles.statLabel}>Uygun Gönüllü</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(stats.avgScore * 100)}%</Text>
                <Text style={styles.statLabel}>Ort. Uyum</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDistance(stats.avgDistance)}</Text>
                <Text style={styles.statLabel}>Ort. Mesafe</Text>
              </View>
            </View>
            <View style={styles.bestMatch}>
              <Text style={styles.bestMatchLabel}>🏆 En İyi Eşleşme:</Text>
              <Text style={styles.bestMatchName}>
                {stats.bestMatch.volunteer.firstName} {stats.bestMatch.volunteer.lastName} (%{Math.round(stats.bestMatch.score * 100)})
              </Text>
            </View>
          </View>
        )}

        {matches.length > 0 && (
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Filter size={16} color={colors.textMuted} />
              <Text style={styles.filterTitle}>Filtrele ve Sırala</Text>
            </View>
            <View style={styles.filterButtons}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity 
                  style={[styles.filterChip, filterSkill === 'all' && styles.filterChipActive]}
                  onPress={() => setFilterSkill('all')}
                >
                  <Text style={[styles.filterChipText, filterSkill === 'all' && styles.filterChipTextActive]}>Tümü</Text>
                </TouchableOpacity>
                {Object.entries(SKILL_LABELS).map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.filterChip, filterSkill === value && styles.filterChipActive]}
                    onPress={() => setFilterSkill(value as SkillType)}
                  >
                    <Text style={[styles.filterChipText, filterSkill === value && styles.filterChipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.sortButtons}>
              <TouchableOpacity 
                style={[styles.sortButton, sortBy === 'score' && styles.sortButtonActive]}
                onPress={() => setSortBy('score')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'score' && styles.sortButtonTextActive]}>Eşleşme Skoru</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
                onPress={() => setSortBy('distance')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'distance' && styles.sortButtonTextActive]}>Mesafe</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sortButton, sortBy === 'availability' && styles.sortButtonActive]}
                onPress={() => setSortBy('availability')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'availability' && styles.sortButtonTextActive]}>Müsaitlik</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.matchesSection}>
          <View style={styles.matchesHeader}>
            <Award size={20} color={colors.primary} />
            <Text style={styles.matchesTitle}>
              AI Önerilen Gönüllüler ({filteredAndSortedMatches.length})
            </Text>
          </View>
          
          {filteredAndSortedMatches.length > 0 ? (
            filteredAndSortedMatches.map((match, index) => (
              <VolunteerCard
                key={match.volunteer.id}
                match={match}
                index={index}
                onAssign={() => handleAssign(match.volunteer.id)}
                isAssigning={assigningId === match.volunteer.id}
              />
            ))
          ) : (
            <View style={styles.noMatches}>
              <Text style={styles.noMatchesText}>Uygun gönüllü bulunamadı</Text>
              {filterSkill !== 'all' && (
                <TouchableOpacity onPress={() => setFilterSkill('all')}>
                  <Text style={styles.clearFilterText}>Filtreyi Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
  needCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  needHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  needType: {
    fontSize: 13,
    color: colors.textMuted,
  },
  needTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  needDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  needMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bestMatch: {
    backgroundColor: colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bestMatchLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  bestMatchName: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  filterButtons: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.textLight,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sortButtonTextActive: {
    color: colors.textLight,
  },
  matchesSection: {
    marginBottom: 24,
  },
  matchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  matchesTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  volunteerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  medalBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    zIndex: 1,
  },
  medalText: {
    fontSize: 24,
  },
  volunteerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volunteerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topVolunteerAvatar: {
    backgroundColor: colors.secondary,
  },
volunteerInfo: {
  flex: 1,
  marginLeft: 12,
  marginRight: 8,
},
nameContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 4,
  marginBottom: 2,
},
volunteerName: {
  fontSize: 16,
  fontWeight: '600' as const,
  color: colors.text,
  flexShrink: 1,
  maxWidth: '60%',
},
bestMatchBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  backgroundColor: colors.successLight,
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 12,
  flexShrink: 0,
},
bestMatchText: {
  fontSize: 10,
  color: colors.success,
  fontWeight: '600' as const,
},
volunteerSkill: {
  fontSize: 13,
  color: colors.textSecondary,
},
scoreBadge: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 12,
  marginLeft: 8,
  flexShrink: 0,
},
  scoreText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  volunteerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aiInsights: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  aiInsightsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  insightValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  insightDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  insightSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  scoreBreakdown: {
    marginBottom: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    width: 70,
    fontSize: 12,
    color: colors.textMuted,
  },
  scoreBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  noMatches: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  noMatchesText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
  },
  clearFilterText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
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
    fontWeight: '700' as const,
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