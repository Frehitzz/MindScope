/* ─── Fake / Mock Data for Dashboard ─── */

export const statsOverview = [
  { label: 'Avg Stress Level', value: '6.8/10', delta: '+0.4 from last month', deltaPositive: false },
  { label: 'Avg Anxiety Level', value: '7.1/10', delta: '+0.2 from last month', deltaPositive: false },
  { label: 'Avg Sleep Hours', value: '6.2h', delta: '-0.5h from last month', deltaPositive: false },
  { label: 'Avg Social Media Usage', value: '4.5h', delta: '+1.2h from last month', deltaPositive: false },
];

export const moodTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  values: [5.8, 5.6, 6.0, 6.1, 6.3, 6.4, 6.2, 6.5, 6.7, 6.4, 6.6, 6.8],
};

export const stressTriggers = {
  labels: ['Academic', 'Social Media', 'Family', 'Peer Pressure', 'Body Image', 'Future Plans'],
  values: [78, 65, 52, 48, 44, 40],
};

export const wellbeingBreakdown = {
  labels: ['Thriving', 'Managing', 'Struggling', 'In Crisis'],
  values: [32, 41, 21, 6],
};

export const helpSeekingSources = {
  labels: ['School Counselor', 'Friends', 'Parents', 'Online Resources', 'Helpline', 'Other'],
  values: [28, 25, 18, 15, 8, 6],
};

/* ─── Analytics page extras ─── */

export const monthlyEngagement = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  checkIns: [820, 910, 1050, 1120, 1240, 1310, 1180, 1400, 1520, 1460, 1550, 1630],
  resources: [340, 380, 420, 510, 560, 610, 580, 650, 720, 690, 740, 780],
};

export const ageGroupDistribution = {
  labels: ['13–14', '15–16', '17–18'],
  values: [3200, 5800, 3847],
};

export const interventionEffectiveness = {
  labels: ['Counseling', 'Peer Support', 'Mindfulness', 'Exercise', 'Art Therapy', 'Journaling'],
  before: [4.2, 4.8, 5.0, 4.5, 4.9, 5.1],
  after: [6.5, 6.8, 6.9, 6.7, 6.4, 6.6],
};

/* ─── Data table page ─── */

export interface StudentRecord {
  id: string;
  name: string;
  age: number;
  grade: string;
  moodScore: number;
  stressLevel: string;
  helpSeeking: boolean;
  lastCheckIn: string;
  program: string;
}

export const studentRecords: StudentRecord[] = [
  { id: 'MS-001', name: 'Alex Rivera', age: 15, grade: '10th', moodScore: 7.2, stressLevel: 'Low', helpSeeking: true, lastCheckIn: '2026-05-01', program: 'Peer Support' },
  { id: 'MS-002', name: 'Jordan Lee', age: 16, grade: '11th', moodScore: 5.4, stressLevel: 'Moderate', helpSeeking: false, lastCheckIn: '2026-04-28', program: 'Mindfulness' },
  { id: 'MS-003', name: 'Sam Patel', age: 14, grade: '9th', moodScore: 6.8, stressLevel: 'Low', helpSeeking: true, lastCheckIn: '2026-05-03', program: 'Art Therapy' },
  { id: 'MS-004', name: 'Taylor Kim', age: 17, grade: '12th', moodScore: 4.1, stressLevel: 'High', helpSeeking: true, lastCheckIn: '2026-05-05', program: 'Counseling' },
  { id: 'MS-005', name: 'Morgan Chen', age: 15, grade: '10th', moodScore: 7.8, stressLevel: 'Low', helpSeeking: false, lastCheckIn: '2026-04-30', program: 'Exercise' },
  { id: 'MS-006', name: 'Casey Brooks', age: 16, grade: '11th', moodScore: 5.9, stressLevel: 'Moderate', helpSeeking: true, lastCheckIn: '2026-05-02', program: 'Journaling' },
  { id: 'MS-007', name: 'Riley Nguyen', age: 13, grade: '8th', moodScore: 6.3, stressLevel: 'Moderate', helpSeeking: false, lastCheckIn: '2026-04-25', program: 'Peer Support' },
  { id: 'MS-008', name: 'Avery Thompson', age: 17, grade: '12th', moodScore: 3.8, stressLevel: 'High', helpSeeking: true, lastCheckIn: '2026-05-04', program: 'Counseling' },
  { id: 'MS-009', name: 'Quinn Davis', age: 14, grade: '9th', moodScore: 7.5, stressLevel: 'Low', helpSeeking: false, lastCheckIn: '2026-04-29', program: 'Mindfulness' },
  { id: 'MS-010', name: 'Drew Martinez', age: 16, grade: '11th', moodScore: 5.2, stressLevel: 'Moderate', helpSeeking: true, lastCheckIn: '2026-05-01', program: 'Art Therapy' },
  { id: 'MS-011', name: 'Jamie Wilson', age: 15, grade: '10th', moodScore: 8.1, stressLevel: 'Low', helpSeeking: false, lastCheckIn: '2026-05-03', program: 'Exercise' },
  { id: 'MS-012', name: 'Reese Okafor', age: 17, grade: '12th', moodScore: 4.5, stressLevel: 'High', helpSeeking: true, lastCheckIn: '2026-05-05', program: 'Counseling' },
];
