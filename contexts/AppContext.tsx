import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Volunteer, Need } from '@/types';
import { mockVolunteers, mockNeeds } from '@/mocks/data';
import { findBestMatches, VolunteerMatch } from '@/utils/matching';

export const [AppProvider, useApp] = createContextHook(() => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [needs, setNeeds] = useState<Need[]>(mockNeeds);

  const addVolunteer = useCallback((volunteer: Omit<Volunteer, 'id' | 'createdAt' | 'isActive'>) => {
    const newVolunteer: Volunteer = {
      ...volunteer,
      id: Date.now().toString(),
      createdAt: new Date(),
      isActive: true,
    };
    setVolunteers(prev => [...prev, newVolunteer]);
    console.log('[AGDES] Yeni gönüllü kaydedildi:', newVolunteer);
    return newVolunteer;
  }, []);

  const addNeed = useCallback((need: Omit<Need, 'id' | 'createdAt' | 'status'>) => {
    const newNeed: Need = {
      ...need,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending',
    };
    setNeeds(prev => [...prev, newNeed]);
    console.log('[AGDES] Yeni ihtiyaç bildirimi:', newNeed);
    return newNeed;
  }, []);

  const assignVolunteer = useCallback((needId: string, volunteerId: string) => {
    setNeeds(prev => prev.map(n => 
      n.id === needId ? { ...n, status: 'assigned' as const, assignedVolunteerId: volunteerId } : n
    ));
    setVolunteers(prev => prev.map(v => 
      v.id === volunteerId ? { ...v, assignedNeedId: needId } : v
    ));
    console.log('[AGDES] Gönüllü atandı - İhtiyaç:', needId, 'Gönüllü:', volunteerId);
  }, []);

  const getMatchesForNeed = useCallback((needId: string): VolunteerMatch[] => {
    const need = needs.find(n => n.id === needId);
    if (!need) return [];
    return findBestMatches(need, volunteers, 5);
  }, [needs, volunteers]);

  const pendingNeeds = useMemo(() => 
    needs.filter(n => n.status === 'pending').sort((a, b) => b.urgencyLevel - a.urgencyLevel),
    [needs]
  );

  const activeVolunteers = useMemo(() => 
    volunteers.filter(v => v.isActive),
    [volunteers]
  );

  const stats = useMemo(() => ({
    totalVolunteers: volunteers.length,
    activeVolunteers: activeVolunteers.length,
    totalNeeds: needs.length,
    pendingNeeds: pendingNeeds.length,
    assignedNeeds: needs.filter(n => n.status === 'assigned').length,
  }), [volunteers, activeVolunteers, needs, pendingNeeds]);

  return {
    volunteers,
    needs,
    pendingNeeds,
    activeVolunteers,
    stats,
    addVolunteer,
    addNeed,
    assignVolunteer,
    getMatchesForNeed,
  };
});
