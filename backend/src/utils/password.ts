import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface PasswordValidation {
  valid: boolean;
  message: string;
}

export function validatePasswordStrength(password: string): PasswordValidation {
  if (password.length < 8) {
    return { valid: false, message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Parol tarkibida kamida bitta katta harf (A-Z) bo\'lishi kerak' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Parol tarkibida kamida bitta kichik harf (a-z) bo\'lishi kerak' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Parol tarkibida kamida bitta raqam (0-9) bo\'lishi kerak' };
  }

  return { valid: true, message: 'Parol yetarlicha kuchli' };
}
