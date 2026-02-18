import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { confirmPasswordReset } from "./services/mockAuth";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const query = useQuery();

  const [email, setEmail] = useState(query.get("email") ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) return setError("Email is required.");
    if (!code.trim()) return setError("Reset code is required.");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters.");

    try {
      confirmPasswordReset(email, code, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Password reset failed.");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Reset Password</h1>

      {error && (
        <div style={{ background: "#3b1d1d", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: "#1d3b2a", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          Password updated! <Link to="/login">Go log in</Link>.
        </div>
      )}

      <form onSubmit={handleReset}>
        <label>Email</label>
        <input
          style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Reset Code</label>
        <input
          style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <label>New Password</label>
        <input
          style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button style={{ width: "100%", padding: 10 }} type="submit">
          Update Password
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
