// Shared navigation constants used across Student and Admin layouts

export interface NavItem {
  icon: string;
  label: string;
  path: string;
}

export const STUDENT_NAV_TABS: NavItem[] = [
  { icon: '🏠', label: 'Home', path: '/dashboard' },
  { icon: '♟', label: 'Play', path: '/play' },
  { icon: '🧩', label: 'Puzzles', path: '/puzzle' },
  { icon: '📚', label: 'Learn', path: '/lessons' },
  { icon: '🏆', label: 'Famous Games', path: '/famous-games' },
  { icon: '📋', label: 'PGN Viewer', path: '/pgn-load' },
];

export const STUDENT_DROPDOWN_LINKS: NavItem[] = [
  { icon: '🏆', label: 'Famous Games', path: '/famous-games' },
  { icon: '📋', label: 'PGN Viewer', path: '/pgn-load' },
  { icon: '👤', label: 'My Profile', path: '/profile' },
];

export const ADMIN_NAV: NavItem[] = [
  { icon: '📊', label: 'Dashboard', path: '/admin' },
  { icon: '👥', label: 'Students', path: '/students' },
  { icon: '📍', label: 'District Activity', path: '/district-activity' },
  { icon: '📄', label: 'Renewal Reports', path: '/renewal-report' },
  // Admin can also switch to student view
  { icon: '🏠', label: 'Student View', path: '/dashboard' },
  { icon: '♟', label: 'Puzzle', path: '/puzzle' },
  { icon: '📈', label: 'Game Analysis', path: '/analysis' },
  { icon: '📚', label: 'Lessons', path: '/lessons' },
];

// Compact nav for admin mobile bottom bar (limited to 5 key items)
export const ADMIN_BOTTOM_NAV: NavItem[] = [
  { icon: '📊', label: 'Dashboard', path: '/admin' },
  { icon: '👥', label: 'Students', path: '/students' },
  { icon: '📍', label: 'Activity', path: '/district-activity' },
  { icon: '📄', label: 'Reports', path: '/renewal-report' },
];

export const MANAGER_NAV: NavItem[] = [
  { icon: '📍', label: 'Bootcamp Activity', path: '/district-activity' },
  { icon: '👥', label: 'My Students', path: '/students' },
];

export const MANAGER_BOTTOM_NAV: NavItem[] = [
  { icon: '📍', label: 'Activity', path: '/district-activity' },
  { icon: '👥', label: 'Students', path: '/students' },
];

export const DISTRICTS = [
  'All Districts',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Trichy',
  'Thanjavur',
];
