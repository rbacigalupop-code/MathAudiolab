/**
 * Password utilities for MVP parent authentication
 * NOTE: This uses btoa() for basic encoding only - NOT CRYPTOGRAPHICALLY SECURE
 * For production, replace with bcryptjs or Firebase Auth
 */

/**
 * Hash a password using btoa (base64 encoding)
 * @param {string} password - Plain text password
 * @returns {string} Base64-encoded password
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    return '';
  }
  try {
    return btoa(password);
  } catch (e) {
    console.error('Password hash error:', e);
    return '';
  }
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Base64-encoded hash from storage
 * @returns {boolean} True if password matches hash
 */
export function verifyPassword(password, hash) {
  if (!password || !hash) {
    return false;
  }
  try {
    const computed = btoa(password);
    return computed === hash;
  } catch (e) {
    console.error('Password verify error:', e);
    return false;
  }
}

/**
 * Validate password strength (MVP criteria)
 * @param {string} password - Password to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];

  if (!password) {
    errors.push('La contraseña es requerida');
  } else if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  } else if (password.length > 100) {
    errors.push('La contraseña no puede exceder 100 caracteres');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'El correo es requerido' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Ingresa un correo válido' };
  }

  return { valid: true };
}

/**
 * Validate parent name
 * @param {string} name - Name to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export function validateParentName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre es requerido' };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  if (name.trim().length > 50) {
    return { valid: false, error: 'El nombre no puede exceder 50 caracteres' };
  }

  return { valid: true };
}

/**
 * FUTURE: When replacing with bcryptjs, use this signature:
 *
 * import bcrypt from 'bcryptjs';
 *
 * export async function hashPasswordBcrypt(password) {
 *   const salt = await bcrypt.genSalt(10);
 *   return await bcrypt.hash(password, salt);
 * }
 *
 * export async function verifyPasswordBcrypt(password, hash) {
 *   return await bcrypt.compare(password, hash);
 * }
 */
