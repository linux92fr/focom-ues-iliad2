// Règles alignées sur la politique de mot de passe configurée côté Supabase Auth
// (minuscule + majuscule + chiffre + symbole), pour éviter qu'un mot de passe
// jugé valide côté formulaire soit ensuite rejeté par l'API.
export const PASSWORD_MIN_LENGTH = 8;
const SYMBOL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"|<>?,./`~]/;

export type PasswordCriteria = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  symbol: boolean;
};

export const getPasswordCriteria = (password: string): PasswordCriteria => ({
  length: password.length >= PASSWORD_MIN_LENGTH,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  digit: /[0-9]/.test(password),
  symbol: SYMBOL_REGEX.test(password),
});

export const isPasswordValid = (password: string): boolean =>
  Object.values(getPasswordCriteria(password)).every(Boolean);

export const getPasswordError = (password: string): string | null => {
  const c = getPasswordCriteria(password);
  if (!c.length) return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`;
  if (!c.upper) return "Le mot de passe doit contenir au moins une majuscule";
  if (!c.lower) return "Le mot de passe doit contenir au moins une minuscule";
  if (!c.digit) return "Le mot de passe doit contenir au moins un chiffre";
  if (!c.symbol) return "Le mot de passe doit contenir au moins un caractère spécial";
  return null;
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{};:,.?";

const randomInt = (max: number) => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};

const pick = (charset: string) => charset[randomInt(charset.length)];

export const generateStrongPassword = (length = 16): string => {
  const all = LOWER + UPPER + DIGITS + SYMBOLS;
  const chars = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  for (let i = chars.length; i < length; i++) chars.push(pick(all));

  // Mélange (Fisher-Yates) pour ne pas laisser les 4 catégories garanties en tête.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};
