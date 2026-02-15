export type SkillType = 'ilk_yardim' | 'arama_kurtarma' | 'psikolog' | 'lojistik' | 'diger';

export type NeedType = 'ilk_yardim' | 'arama_kurtarma' | 'psikolojik_destek' | 'lojistik' | 'barinma' | 'gida' | 'diger';

export type AvailabilityType = 'aninda' | 'gun_ici' | 'hafta_ici' | 'hafta_sonu';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  tckn: string;
  phone: string;
  skill: SkillType;
  location: Location;
  availability: AvailabilityType;
  createdAt: Date;
  isActive: boolean;
  assignedNeedId?: string;
}

export interface Need {
  id: string;
  title: string;
  description: string;
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
  needType: NeedType;
  location: Location;
  createdAt: Date;
  status: 'pending' | 'assigned' | 'completed';
  assignedVolunteerId?: string;
}

export const SKILL_LABELS: Record<SkillType, string> = {
  ilk_yardim: 'İlk Yardım',
  arama_kurtarma: 'Arama Kurtarma',
  psikolog: 'Psikolog',
  lojistik: 'Lojistik',
  diger: 'Diğer',
};

export const NEED_TYPE_LABELS: Record<NeedType, string> = {
  ilk_yardim: 'İlk Yardım',
  arama_kurtarma: 'Arama Kurtarma',
  psikolojik_destek: 'Psikolojik Destek',
  lojistik: 'Lojistik',
  barinma: 'Barınma',
  gida: 'Gıda',
  diger: 'Diğer',
};

export const AVAILABILITY_LABELS: Record<AvailabilityType, string> = {
  aninda: 'Anında Müsait',
  gun_ici: 'Gün İçinde',
  hafta_ici: 'Hafta İçi',
  hafta_sonu: 'Hafta Sonu',
};

export const URGENCY_LABELS: Record<number, string> = {
  1: 'Düşük',
  2: 'Orta-Düşük',
  3: 'Orta',
  4: 'Yüksek',
  5: 'Kritik',
};

export const URGENCY_COLORS: Record<number, string> = {
  1: '#22c55e',
  2: '#84cc16',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
};
