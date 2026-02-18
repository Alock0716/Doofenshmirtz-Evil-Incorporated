import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "./services/mockAuth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCode(null);

    if (!email.trim()) return setError("Email is required.");

    try {
      const resetCode = requestPasswordReset(email);
      setCode(resetCode);
    } catch (err: any) {
      setError(err.message ?? "Reset request failed.");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Forgot Password</h1>

      {error && (
        <div style={{ background: "#3b1d1d", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleRequest}>
        <label>Email</label>
        <input
          style={{ width: "100%", padding: 10, margin: "6px 0 12px" }}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button style={{ width: "100%", padding: 10 }} type="submit">
          Get Reset Code (Mock)
        </button>
      </form>

      {code && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#1d2b3b" }}>
          <div><b>Mock reset code:</b> {code}</div>
          <div style={{ marginTop: 8 }}>
            Go to:{" "}
            <Link to={`/reset-password?email=${encodeURIComponent(email)}`}>
              Reset Password
            </Link>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
