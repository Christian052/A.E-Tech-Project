import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="section flex flex-col items-center py-24 text-center">
      <h1 className="text-6xl font-extrabold text-navy-800">404</h1>
      <p className="mt-4 text-navy-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
}
