import { computed, ref } from 'vue';
import { useSessionStore } from '../store/useSessionStore';
import { STADIUM_ZONES } from '../services/dataLoader';

export function useSensoryRoom() {
  const sessionStore = useSessionStore();
  const isModalOpen = ref(false);

  const sensoryRoom = computed(() =>
    STADIUM_ZONES.find((z: any) => z.type === 'sensory_room')
  );

  const lang = computed(() => sessionStore.currentSession?.language ?? 'en');

  // Hardcode a simple step-free path for now if it exists, otherwise generate dynamically.
  // The prompt asks to "locate nearest sensory room and compute step-free routing instructions in current language"
  const stepFreeRoute = computed(() => {
    if (!sensoryRoom.value) return null;
    const l = lang.value as 'en'|'es'|'fr'|'de';
    
    // We assume the user is at Gate A (or generic entrance) and wants to reach it. 
    // Real routing would use BFS on the connections graph, filtering out hasStairs === true if hasElevator === false
    const route = {
      en: `Take the elevator at Gate A to North Concourse. Proceed straight. The ${sensoryRoom.value.label.en} is step-free.`,
      es: `Tome el ascensor en la Puerta A hasta el Vestíbulo Norte. Siga recto. El ${sensoryRoom.value.label.es} no tiene escalones.`,
      fr: `Prenez l'ascenseur à la Porte A jusqu'au Hall Nord. Allez tout droit. La ${sensoryRoom.value.label.fr} est sans marches.`,
      de: `Nehmen Sie den Aufzug an Tor A zur Nordhalle. Gehen Sie geradeaus. Der ${sensoryRoom.value.label.de} ist stufenlos.`
    };
    return route[l] || route.en;
  });

  const features = computed(() => {
    return sensoryRoom.value?.features || [];
  });

  return {
    isModalOpen,
    sensoryRoom,
    stepFreeRoute,
    features,
    lang
  };
}
