import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(form.email, form.password);
    if (res.success) {
      navigate("/admin/dashboard");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="section flex min-h-[70vh] items-center justify-center">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-navy-800">Admin Login</h1>
          <p className="mt-1 text-sm text-navy-500">Sign in to manage services, gallery, and inquiries.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy-700">Email</label>
          <input
            className="input-field"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="admin@aetech.rw"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy-700">Password</label>
          <input
            className="input-field"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
