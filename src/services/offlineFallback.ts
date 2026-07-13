export function getMockLLMResponse(_context: any, question: string, language: string): string {
  const q = question.replace(/[\x00-\x1F\x7F]/g, '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

  let intent = 'general';
  if (q.includes('exit') || q.includes('salida') || q.includes('sortie') || q.includes('ausgang')) intent = 'nearest_exit';
  else if (q.includes('wheelchair') || q.includes('silla de ruedas') || q.includes('fauteuil') || q.includes('rollstuhl') || q.includes('step free') || q.includes('step-free')) intent = 'wheelchair_route';
  else if (q.includes('food') || q.includes('drink') || q.includes('comida') || q.includes('bebida') || q.includes('nourriture') || q.includes('essen')) intent = 'food_drinks';
  else if (q.includes('first aid') || q.includes('primeros auxilios') || q.includes('premiers secours') || q.includes('erste hilfe') || q.includes('medical') || q.includes('doctor')) intent = 'first_aid';
  else if (q.includes('toilet') || q.includes('restroom') || q.includes('bathroom') || q.includes('bano') || q.includes('toilettes') || q.includes('toilette')) intent = 'toilet';
  else if (q.includes('park') || q.includes('estacionamiento') || q.includes('parking') || q.includes('parkplatz')) intent = 'parking';
  else if (q.includes('ticket') || q.includes('boleto') || q.includes('billet') || q.includes('ticket')) intent = 'ticket_help';
  else if (q.includes('crowd') || q.includes('busy') || q.includes('multitud') || q.includes('foule') || q.includes('menge')) intent = 'crowd_status';

  const responses: Record<string, Record<string, string>> = {
    nearest_exit: {
      en: 'The nearest exit is located at Gate C. Please follow the green illuminated signs.',
      es: 'La salida más cercana se encuentra en la Puerta C. Por favor, siga los carteles luminosos verdes.',
      fr: 'La sortie la plus proche est située à la porte C. Veuillez suivre les panneaux lumineux verts.',
      de: 'Der nächste Ausgang befindet sich am Tor C. Bitte folgen Sie den grün beleuchteten Schildern.'
    },
    wheelchair_route: {
      en: 'A step-free wheelchair route is available via Elevator EL-04 near Section 112.',
      es: 'Hay una ruta sin escalones para sillas de ruedas disponible a través del elevador EL-04 cerca de la Sección 112.',
      fr: 'Un itinéraire sans marches pour fauteuils roulants est disponible via l\'ascenseur EL-04 près de la section 112.',
      de: 'Ein barrierefreier Rollstuhlweg ist über den Aufzug EL-04 in der Nähe von Block 112 verfügbar.'
    },
    food_drinks: {
      en: 'Food and drinks are available at the Concourse B concessions. Water is currently well-stocked at Section 120.',
      es: 'Hay comida y bebida disponibles en las concesiones del Vestíbulo B. Actualmente hay mucha agua en la Sección 120.',
      fr: 'De la nourriture et des boissons sont disponibles aux concessions du hall B. L\'eau est actuellement bien approvisionnée à la section 120.',
      de: 'Speisen und Getränke sind an den Verkaufsständen in Halle B erhältlich. Wasser ist in Block 120 derzeit gut vorrätig.'
    },
    first_aid: {
      en: 'First aid stations are located at every major gate. The nearest one is at Gate B, Level 1.',
      es: 'Las estaciones de primeros auxilios se encuentran en todas las puertas principales. La más cercana está en la Puerta B, Nivel 1.',
      fr: 'Les postes de premiers secours sont situés à chaque porte principale. Le plus proche est à la porte B, niveau 1.',
      de: 'Erste-Hilfe-Stationen befinden sich an jedem Haupttor. Die nächste befindet sich an Tor B, Ebene 1.'
    },
    toilet: {
      en: 'The nearest restrooms are located directly behind Section 115 on the main concourse.',
      es: 'Los baños más cercanos están ubicados directamente detrás de la Sección 115 en el vestíbulo principal.',
      fr: 'Les toilettes les plus proches sont situées juste derrière la section 115 dans le hall principal.',
      de: 'Die nächsten Toiletten befinden sich direkt hinter Block 115 in der Haupthalle.'
    },
    parking: {
      en: 'Parking information: The East lot is currently full. Please use the West overflow lot.',
      es: 'Información de estacionamiento: El lote este está lleno. Utilice el lote de desbordamiento oeste.',
      fr: 'Informations sur le stationnement : Le parking Est est actuellement complet. Veuillez utiliser le parking de débordement Ouest.',
      de: 'Parkinformationen: Der Ostparkplatz ist derzeit voll. Bitte nutzen Sie den West-Ausweichparkplatz.'
    },
    ticket_help: {
      en: 'For ticket assistance, please visit the Box Office located near Gate A.',
      es: 'Para obtener ayuda con los boletos, visite la taquilla ubicada cerca de la Puerta A.',
      fr: 'Pour obtenir de l\'aide sur les billets, veuillez vous rendre à la billetterie située près de la porte A.',
      de: 'Für Hilfe zu Tickets besuchen Sie bitte die Abendkasse in der Nähe von Tor A.'
    },
    crowd_status: {
      en: 'Currently, the East Stand is experiencing high density. Gate C has a bottleneck. We recommend using Gate A.',
      es: 'Actualmente, la Grada Este experimenta alta densidad. La Puerta C tiene un cuello de botella. Recomendamos usar la Puerta A.',
      fr: 'Actuellement, la tribune Est connaît une forte densité. La porte C a un goulot d\'étranglement. Nous recommandons d\'utiliser la porte A.',
      de: 'Derzeit herrscht auf der Osttribüne hohe Dichte. An Tor C gibt es einen Engpass. Wir empfehlen die Nutzung von Tor A.'
    },
    general: {
      en: 'I am currently operating in offline mode. I can help with directions, facilities, and general stadium information.',
      es: 'Actualmente estoy operando en modo sin conexión. Puedo ayudar con direcciones, instalaciones e información general del estadio.',
      fr: 'Je fonctionne actuellement en mode hors ligne. Je peux vous aider avec les directions, les installations et les informations générales sur le stade.',
      de: 'Ich arbeite derzeit im Offline-Modus. Ich kann Ihnen mit Wegbeschreibungen, Einrichtungen und allgemeinen Stadioninformationen helfen.'
    }
  };

  const langMatch = ['en', 'es', 'fr', 'de'].includes(language) ? language : 'en';
  return responses[intent][langMatch] || responses.general.en;
}
