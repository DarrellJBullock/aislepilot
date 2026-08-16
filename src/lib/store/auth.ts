import type { Profile } from "@aislepilot/domain/types";
import type { AppState } from "@aislepilot/domain/store/state";
import { uid, now, displayNameFromEmail } from "@aislepilot/domain/utils";

export interface AuthResult {
  state: AppState;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function signUp(
  state: AppState,
  email: string,
  password: string,
  displayName?: string,
): AuthResult {
  const clean = email.trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) return { state, error: "Enter a valid email address." };
  if (password.length < 6)
    return { state, error: "Password must be at least 6 characters." };
  const existing = Object.values(state.profiles).find((p) => p.email === clean);
  if (existing) return { state, error: "An account with this email already exists." };

  const id = uid("user");
  const profile: Profile & { password: string } = {
    id,
    email: clean,
    displayName: displayName?.trim() || displayNameFromEmail(clean),
    createdAt: now(),
    password,
  };
  return {
    state: {
      ...state,
      profiles: { ...state.profiles, [id]: profile },
      sessionUserId: id,
    },
  };
}

export function signIn(
  state: AppState,
  email: string,
  password: string,
): AuthResult {
  const clean = email.trim().toLowerCase();
  const profile = Object.values(state.profiles).find((p) => p.email === clean);
  if (!profile || profile.password !== password)
    return { state, error: "Invalid email or password." };
  return { state: { ...state, sessionUserId: profile.id } };
}

export function signOut(state: AppState): AppState {
  return { ...state, sessionUserId: null };
}

export function updateProfile(
  state: AppState,
  patch: Partial<Pick<Profile, "displayName">>,
): AppState {
  const id = state.sessionUserId;
  if (!id || !state.profiles[id]) return state;
  return {
    ...state,
    profiles: {
      ...state.profiles,
      [id]: { ...state.profiles[id], ...patch },
    },
  };
}

export function currentProfile(state: AppState): Profile | null {
  const id = state.sessionUserId;
  if (!id) return null;
  const p = state.profiles[id];
  if (!p) return null;
  return {
    id: p.id,
    email: p.email,
    displayName: p.displayName,
    createdAt: p.createdAt,
  };
}
