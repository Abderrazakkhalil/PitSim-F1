export interface TeamTheme {
  id: number;
  name: string;
  slug: string;
  logo: string;
  primaryColor: string;
  primaryGradient: string;
  accentColor: string;
  pace: number;
  tireMgmt: number;
  pitSpeed: number;
  season: number;
  points: number;
  country: string;
}

export const TEAMS: TeamTheme[] = [
  {
    id: 1,
    name: 'Ferrari',
    slug: 'ferrari',
    logo: '🏎️',
    primaryColor: '#ff1e1e',
    primaryGradient: 'from-red-950 to-red-900',
    accentColor: '#ffa500',
    pace: 4,
    tireMgmt: 3,
    pitSpeed: 5,
    season: 2024,
    points: 406,
    country: 'Italy',
  },
  {
    id: 2,
    name: 'Mercedes',
    slug: 'mercedes',
    logo: '⭐',
    primaryColor: '#00d9ff',
    primaryGradient: 'from-cyan-950 to-teal-900',
    accentColor: '#ff0080',
    pace: 5,
    tireMgmt: 5,
    pitSpeed: 4,
    season: 2024,
    points: 438,
    country: 'Germany',
  },
  {
    id: 3,
    name: 'Red Bull',
    slug: 'red-bull',
    logo: '🐂',
    primaryColor: '#0033ff',
    primaryGradient: 'from-blue-950 to-blue-900',
    accentColor: '#ffff00',
    pace: 5,
    tireMgmt: 4,
    pitSpeed: 5,
    season: 2024,
    points: 454,
    country: 'Austria',
  },
  {
    id: 4,
    name: 'McLaren',
    slug: 'mclaren',
    logo: '🍊',
    primaryColor: '#ff6b00',
    primaryGradient: 'from-orange-950 to-orange-900',
    accentColor: '#00ffff',
    pace: 4,
    tireMgmt: 4,
    pitSpeed: 4,
    season: 2024,
    points: 372,
    country: 'UK',
  },
];
