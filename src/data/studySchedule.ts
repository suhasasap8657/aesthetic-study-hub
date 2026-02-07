export interface DayTarget {
  id: string;
  date: string;
  day: number;
  month: string;
  year: number;
  targets: TargetItem[];
  isBreak?: boolean;
}

export interface TargetItem {
  id: string;
  text: string;
  type: 'video' | 'qs' | 'normal';
  videoUrl?: string;
  requiredMinutes?: number; // For video: 120 (2 hours)
  completed: boolean;
}

// Video links
const VIDEO_LINKS = [
  "https://youtu.be/gWVIRjGKnAk?si=PKfy1uozxSfjjrep", // Alcohol, Phenol, Ether - Feb 7
  "https://www.youtube.com/live/8SiHbc0gP5s?si=oxh_j1Erc7YVXRnG",
  "https://www.youtube.com/live/nyIf7AXZ4I8?si=2-rInc1rZvXufwd9"
];

// Helper to create target items
const createTarget = (text: string, type: 'video' | 'qs' | 'normal' = 'normal', videoUrl?: string): Omit<TargetItem, 'id'> => ({
  text,
  type,
  videoUrl,
  requiredMinutes: type === 'video' ? 120 : undefined,
  completed: false
});

// The complete study schedule
export const STUDY_SCHEDULE: DayTarget[] = [
  // FEBRUARY 2026
  { id: 'd-2026-02-07', date: '2026-02-07', day: 7, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Alcohol, Phenol, Ether - Video Lecture', 'video', VIDEO_LINKS[0]) }, // Uses the new video
    { id: 't2', ...createTarget('Alcohol, Phenol, Ether - Questions Practice', 'qs') },
    { id: 't3', ...createTarget('Biology Chapter', 'normal') },
    { id: 't4', ...createTarget('Revision & Doubts', 'normal') }
  ]},
  { id: 'd-2026-02-08', date: '2026-02-08', day: 8, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Aldehyde, Ketone, Carboxylic Acid - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Aldehyde, Ketone, Carboxylic Acid - QS', 'qs') },
    { id: 't3', ...createTarget('Biology Chapter', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-09', date: '2026-02-09', day: 9, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Aldehyde, Ketone, Carboxylic Acid - Contd', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Practice Questions', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-10', date: '2026-02-10', day: 10, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Amines - Video Lecture', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Amines - QS Practice', 'qs') },
    { id: 't3', ...createTarget('Biology Chapter', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-11', date: '2026-02-11', day: 11, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Biomolecules - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Biomolecules - Questions', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-12', date: '2026-02-12', day: 12, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Buffers (Organic) - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Buffers - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-13', date: '2026-02-13', day: 13, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Solutions - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Solutions - Questions', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-14', date: '2026-02-14', day: 14, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Solutions Contd - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Solutions - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  // Break days 15-23 Feb
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `d-2026-02-${15 + i}`,
    date: `2026-02-${String(15 + i).padStart(2, '0')}`,
    day: 15 + i,
    month: 'February',
    year: 2026,
    isBreak: true,
    targets: [{ id: 'break', text: 'Function / Break', type: 'normal' as const, completed: false }]
  })),
  { id: 'd-2026-02-24', date: '2026-02-24', day: 24, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Chemical Kinetics - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Chemical Kinetics - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-25', date: '2026-02-25', day: 25, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Chemical Kinetics Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-26', date: '2026-02-26', day: 26, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Redox + Electrochemistry - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Redox - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-27', date: '2026-02-27', day: 27, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Electrochemistry - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Electrochemistry - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-02-28', date: '2026-02-28', day: 28, month: 'February', year: 2026, targets: [
    { id: 't1', ...createTarget('Mole Concept - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Mole Concept - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  
  // MARCH 2026
  { id: 'd-2026-03-01', date: '2026-03-01', day: 1, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Mole Concept Contd - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Mole Concept - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-02', date: '2026-03-02', day: 2, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Atomic Structure - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Atomic Structure - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-03', date: '2026-03-03', day: 3, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Atomic Structure Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-04', date: '2026-03-04', day: 4, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Thermodynamics - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Thermodynamics - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-05', date: '2026-03-05', day: 5, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Thermodynamics Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-06', date: '2026-03-06', day: 6, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Chemical Equilibrium - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Chemical Equilibrium - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-07', date: '2026-03-07', day: 7, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Ionic Equilibrium - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Ionic Equilibrium - QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-08', date: '2026-03-08', day: 8, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Ionic Equilibrium Contd', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Practice QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-09', date: '2026-03-09', day: 9, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Ionic Equilibrium Final', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Complete QS', 'qs') },
    { id: 't3', ...createTarget('Biology', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-10', date: '2026-03-10', day: 10, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Electrostatics - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Electrostatics - QS', 'qs') },
    { id: 't3', ...createTarget('Periodic Table', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-11', date: '2026-03-11', day: 11, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Electrostatics Part 1 - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice QS', 'qs') },
    { id: 't3', ...createTarget('Periodic', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-12', date: '2026-03-12', day: 12, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Electrostatics Part 1 Contd', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('QS Practice', 'qs') },
    { id: 't3', ...createTarget('Periodic', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-13', date: '2026-03-13', day: 13, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Electrostatics Part 2 - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Part 2 QS', 'qs') },
    { id: 't3', ...createTarget('IOC', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-14', date: '2026-03-14', day: 14, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Electrostatics Part 2 Contd', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('QS', 'qs') },
    { id: 't3', ...createTarget('IOC', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-15', date: '2026-03-15', day: 15, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Current Electricity - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Current Electricity - QS', 'qs') },
    { id: 't3', ...createTarget('IOC', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-16', date: '2026-03-16', day: 16, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Magnetic Effect of Current - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Magnetic - QS', 'qs') },
    { id: 't3', ...createTarget('IOC', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-17', date: '2026-03-17', day: 17, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Magnetic Effect Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice QS', 'qs') },
    { id: 't3', ...createTarget('IOC', 'normal') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-18', date: '2026-03-18', day: 18, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('EMI - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('EMI - QS', 'qs') },
    { id: 't3', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-19', date: '2026-03-19', day: 19, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('EMI Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice QS', 'qs') },
    { id: 't3', ...createTarget('Mock Test 1', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-20', date: '2026-03-20', day: 20, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('AC - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('AC - QS', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-21', date: '2026-03-21', day: 21, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('AC Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-22', date: '2026-03-22', day: 22, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('EM Waves - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('EM Waves - QS', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-23', date: '2026-03-23', day: 23, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('EM Waves Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-24', date: '2026-03-24', day: 24, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Modern Physics - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Modern Physics - QS', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-25', date: '2026-03-25', day: 25, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Modern Physics Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-26', date: '2026-03-26', day: 26, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Modern Physics Final', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Complete QS', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-27', date: '2026-03-27', day: 27, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Ray Optics - Video', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Ray Optics - QS', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-28', date: '2026-03-28', day: 28, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Ray Optics Contd', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Practice', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-29', date: '2026-03-29', day: 29, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Ray Optics Final', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Complete QS', 'qs') },
    { id: 't3', ...createTarget('Mock Test', 'qs') },
    { id: 't4', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-30', date: '2026-03-30', day: 30, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Gravitation - Video', 'video', VIDEO_LINKS[0]) },
    { id: 't2', ...createTarget('Gravitation - QS', 'qs') },
    { id: 't3', ...createTarget('Mock Test 1', 'qs') },
    { id: 't4', ...createTarget('Mock Test 2', 'qs') },
    { id: 't5', ...createTarget('Revision', 'normal') }
  ]},
  { id: 'd-2026-03-31', date: '2026-03-31', day: 31, month: 'March', year: 2026, targets: [
    { id: 't1', ...createTarget('Gravitation Contd', 'video', VIDEO_LINKS[1]) },
    { id: 't2', ...createTarget('Practice', 'qs') },
    { id: 't3', ...createTarget('Mock Test 1', 'qs') },
    { id: 't4', ...createTarget('Mock Test 2', 'qs') },
    { id: 't5', ...createTarget('Revision', 'normal') }
  ]},
  
  // APRIL 2026
  ...generateAprilSchedule(),
  
  // MAY 2026
  { id: 'd-2026-05-01', date: '2026-05-01', day: 1, month: 'May', year: 2026, targets: [
    { id: 't1', ...createTarget('Full Revision', 'normal') },
    { id: 't2', ...createTarget('Mock Test 1', 'qs') },
    { id: 't3', ...createTarget('Mock Test 2', 'qs') },
    { id: 't4', ...createTarget('Final Prep', 'normal') }
  ]},
  { id: 'd-2026-05-02', date: '2026-05-02', day: 2, month: 'May', year: 2026, targets: [
    { id: 't1', ...createTarget('Full Revision', 'normal') },
    { id: 't2', ...createTarget('Mock Test 1', 'qs') },
    { id: 't3', ...createTarget('Mock Test 2', 'qs') },
    { id: 't4', ...createTarget('Final Prep', 'normal') }
  ]}
];

function generateAprilSchedule(): DayTarget[] {
  const aprilTopics = [
    { days: [1, 2, 3], topic: 'Kinematics' },
    { days: [4, 5, 6], topic: 'NLM' },
    { days: [7, 8], topic: 'WPE' },
    { days: [9, 10], topic: 'COM' },
    { days: [11, 12, 13], topic: 'Rotation (RBD)' },
    { days: [14, 15, 16], topic: 'Properties of Matter' },
    { days: [17, 18, 19], topic: 'Fluid Mechanics' },
    { days: [20, 21, 22], topic: 'SHM' },
    { days: [23, 24, 25], topic: 'Waves / Oscillations' },
    { days: [26, 27, 28, 29], topic: 'Revision' },
    { days: [30], topic: 'Full Revision' }
  ];

  const result: DayTarget[] = [];
  
  aprilTopics.forEach(({ days, topic }) => {
    days.forEach((day, idx) => {
      result.push({
        id: `d-2026-04-${String(day).padStart(2, '0')}`,
        date: `2026-04-${String(day).padStart(2, '0')}`,
        day,
        month: 'April',
        year: 2026,
        targets: [
          { id: 't1', ...createTarget(`${topic} - Video`, 'video', VIDEO_LINKS[idx % 2]) },
          { id: 't2', ...createTarget(`${topic} - QS`, 'qs') },
          { id: 't3', ...createTarget('Mock Test 1', 'qs') },
          { id: 't4', ...createTarget('Mock Test 2', 'qs') },
          { id: 't5', ...createTarget('Revision', 'normal') }
        ]
      });
    });
  });

  return result;
}

// Helper to get today's schedule
export const getTodaySchedule = (): DayTarget | null => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  return STUDY_SCHEDULE.find(d => d.date === dateStr) || null;
};

// Helper to get schedule by date
export const getScheduleByDate = (date: string): DayTarget | null => {
  return STUDY_SCHEDULE.find(d => d.date === date) || null;
};

// Get all months with their days
export const getMonthlySchedule = () => {
  const months: Record<string, DayTarget[]> = {};
  
  STUDY_SCHEDULE.forEach(day => {
    const key = `${day.month} ${day.year}`;
    if (!months[key]) months[key] = [];
    months[key].push(day);
  });
  
  return months;
};

// Check if a date is a break day
export const isBreakDay = (date: string): boolean => {
  const day = STUDY_SCHEDULE.find(d => d.date === date);
  return day?.isBreak || false;
};
