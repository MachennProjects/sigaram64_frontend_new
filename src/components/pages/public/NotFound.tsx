// 404 — Not Found Page
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4 animate-float">♟</div>
        <h1 className="text-white text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-6">This square is empty on the board.</p>
        <Link to="/" className="btn-gold px-6 py-3 inline-block">Go Home →</Link>
      </div>
    </div>
  );
}
