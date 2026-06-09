import { type FirestoreUser } from '../firebase/firestoreService';

export function exportStudentsToCSV(students: FirestoreUser[], filename = 'students_export.csv') {
  const headers = ['Name', 'Email', 'School', 'District', 'Rating', 'Games Played', 'Games Won', 'Status', 'Last Activity'];
  
  const rows = students.map(s => [
    s.Name || s.name || s.Email || 'Unknown',
    s.Email || s.Email || '',
    s.SchoolName || s.school || '',
    s.SchoolDistrict || s.district || '',
    s.rating || s.elo || 1000,
    s.games_played || s.TotalMatch || 0,
    s.games_won || s.WinMatch || 0,
    s.Status === true ? 'Active' : 'Inactive',
    s.last_activity ? new Date(typeof s.last_activity === 'string' ? s.last_activity : (s.last_activity?.toMillis ? s.last_activity.toMillis() : s.last_activity)).toLocaleString() : 'Never'
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function triggerPrint() {
  window.print();
}
