import { Volunteer, Need, SkillType, NeedType, AvailabilityType } from '@/types';

export interface VolunteerMatch {
  volunteer: Volunteer;
  score: number;
  skillMatch: number;
  distanceScore: number;
  availabilityScore: number;
  distance: number;
}

const SKILL_TO_NEED_MAP: Record<SkillType, NeedType[]> = {
  ilk_yardim: ['ilk_yardim'],
  arama_kurtarma: ['arama_kurtarma'],
  psikolog: ['psikolojik_destek'],
  lojistik: ['lojistik', 'barinma', 'gida'],
  diger: ['diger'],
};

const AVAILABILITY_SCORES: Record<AvailabilityType, number> = {
  aninda: 1.0,
  gun_ici: 0.7,
  hafta_ici: 0.4,
  hafta_sonu: 0.3,
};

function calculateDistance(loc1: { latitude: number; longitude: number }, loc2: { latitude: number; longitude: number }): number {
  const R = 6371;
  const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateSkillMatch(volunteerSkill: SkillType, needType: NeedType): number {
  const matchingNeeds = SKILL_TO_NEED_MAP[volunteerSkill] || [];
  if (matchingNeeds.includes(needType)) return 1.0;
  if (volunteerSkill === 'diger' || needType === 'diger') return 0.3;
  return 0.1;
}

function calculateDistanceScore(distance: number): number {
  if (distance <= 5) return 1.0;
  if (distance <= 10) return 0.8;
  if (distance <= 25) return 0.6;
  if (distance <= 50) return 0.4;
  if (distance <= 100) return 0.2;
  return 0.1;
}

function calculateAvailabilityScore(availability: AvailabilityType, urgencyLevel: number): number {
  const baseScore = AVAILABILITY_SCORES[availability];
  const urgencyMultiplier = urgencyLevel >= 4 ? 1.5 : 1.0;
  return Math.min(baseScore * urgencyMultiplier, 1.0);
}

export function findBestMatches(need: Need, volunteers: Volunteer[], limit: number = 5): VolunteerMatch[] {
  const availableVolunteers = volunteers.filter(v => v.isActive && !v.assignedNeedId);
  
  const matches: VolunteerMatch[] = availableVolunteers.map(volunteer => {
    const distance = calculateDistance(volunteer.location, need.location);
    const skillMatch = calculateSkillMatch(volunteer.skill, need.needType);
    const distanceScore = calculateDistanceScore(distance);
    const availabilityScore = calculateAvailabilityScore(volunteer.availability, need.urgencyLevel);
    
    const score = (skillMatch * 0.5) + (distanceScore * 0.3) + (availabilityScore * 0.2);
    
    return {
      volunteer,
      score,
      skillMatch,
      distanceScore,
      availabilityScore,
      distance,
    };
  });
  
  matches.sort((a, b) => b.score - a.score);
  
  return matches.slice(0, limit);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}