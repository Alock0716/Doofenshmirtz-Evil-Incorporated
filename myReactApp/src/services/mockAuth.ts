// src/services/mockAuth.ts
const USERS_KEY = "mock_users";
const RESET_CODES_KEY = "mock_reset_codes";

export type MockUser = { email: string; password: string };

function getUsers(): MockUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as MockUser[]) : [];
}

function saveUsers(users: MockUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getResetCodes(): Record<string, string> {
  const raw = localStorage.getItem(RESET_CODES_KEY);
  return raw ? (JSON.parse(raw) as Record<string, string>) : {};
}

function saveResetCodes(codes: Record<string, string>) {
  localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digit
}

// Creates a demo account so login/reset can be tested
export function seedDemoUserIfEmpty() {
  const users = getUsers();
  if (users.length > 0) return;
  saveUsers([{ email: "test@demo.com", password: "Password123!" }]);
}

export function login(email: string, password: string) {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("No account found with that email.");
  if (user.password !== password) throw new Error("Incorrect password.");
  return user;
}

export function requestPasswordReset(email: string) {
  const users = getUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!exists) throw new Error("No account found with that email.");

  const code = generateResetCode();
  const codes = getResetCodes();
  codes[email.toLowerCase()] = code;
  saveResetCodes(codes);

  return code; // returned so you can display it (since no email system yet)
}

export function confirmPasswordReset(email: string, code: string, newPassword: string) {
  const codes = getResetCodes();
  const saved = codes[email.toLowerCase()];
  if (!saved || saved !== code) throw new Error("Invalid reset code.");

  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) throw new Error("User not found.");

  users[idx] = { ...users[idx], password: newPassword };
  saveUsers(users);

  delete codes[email.toLowerCase()];
  saveResetCodes(codes);
}
