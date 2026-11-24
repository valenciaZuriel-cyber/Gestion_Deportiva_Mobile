export const INITIAL_ITEMS = [
  { id: 1, codigo: 'FUT-001', nombre: 'Balón de Fútbol #5', deporte: 'Fútbol', estadoFisico: 'NUEVO', cantidadTotal: 10, cantidadDisponible: 8 },
  { id: 2, codigo: 'BASQ-002', nombre: 'Balón de Básquetbol Oficial', deporte: 'Básquetbol', estadoFisico: 'BUENO', cantidadTotal: 6, cantidadDisponible: 4 },
  { id: 3, codigo: 'VOL-003', nombre: 'Red de Voleibol Profesional', deporte: 'Voleibol', estadoFisico: 'DESGASTADO', cantidadTotal: 3, cantidadDisponible: 2 },
  { id: 4, codigo: 'FUT-004', nombre: 'Conos de Entrenamiento (Set)', deporte: 'Fútbol', estadoFisico: 'BUENO', cantidadTotal: 5, cantidadDisponible: 0 },
  { id: 5, codigo: 'OTR-005', nombre: 'Raquetas de Bádminton (Par)', deporte: 'Otros', estadoFisico: 'NUEVO', cantidadTotal: 4, cantidadDisponible: 4 },
];

export const INITIAL_LOANS = [
  {
    id: 101,
    itemId: 1,
    itemNombre: 'Balón de Fútbol #5',
    cantidad: 2,
    canchaOActividad: 'Cancha 2 - Torneo Interno',
    fechaSalida: '10:00 AM',
    estatus: 'ACTIVO',
  },
  {
    id: 102,
    itemId: 2,
    itemNombre: 'Balón de Básquetbol Oficial',
    cantidad: 1,
    canchaOActividad: 'Gimnasio Principal',
    fechaSalida: '02:30 PM',
    estatus: 'FINALIZADO',
  },
];