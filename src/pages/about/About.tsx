import { Navigate } from 'react-router-dom';

// "За нас" page removed – redirect to home
export function About() {
  return <Navigate to="/" replace />;
}
