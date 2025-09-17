// types/profile.ts
export type Profile = {
  fullName: string;
  ssn: string;
  dob: string; // ISO YYYY-MM-DD
  address: string;
  phone: string;
  email: string;
};

export const emptyProfile: Profile = {
  fullName: '',
  ssn: '',
  dob: '',
  address: '',
  phone: '',
  email: '',
};

export function validateProfile(
  p: Profile,
): { ok: true } | { ok: false; reason: string } {
  if (!p.fullName.trim()) return { ok: false, reason: 'Full name required' };
  if (!/^\d{3}-?\d{2}-?\d{4}$/.test(p.ssn.trim()))
    return { ok: false, reason: 'Invalid SSN format' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.dob))
    return { ok: false, reason: 'DOB must be YYYY-MM-DD' };
  if (!p.address.trim()) return { ok: false, reason: 'Address required' };
  if (!p.phone.trim()) return { ok: false, reason: 'Phone required' };
  if (!/^\S+@\S+\.\S+$/.test(p.email))
    return { ok: false, reason: 'Invalid email' };
  return { ok: true };
}

export function redactProfile(p: Profile): Profile {
  const mask = (s: string, n: number) =>
    s.length <= n ? '*'.repeat(s.length) : '*'.repeat(n) + s.slice(n);

  return {
    ...p,
    ssn: p.ssn ? '***-**-' + p.ssn.slice(-4) : '',
    email: p.email
      ? mask(p.email, Math.max(0, p.email.indexOf('@')))
      : '',
    phone: p.phone
      ? mask(p.phone, Math.max(0, p.phone.length - 4))
      : '',
    address: p.address ? '[REDACTED ADDRESS]' : '',
  };
}