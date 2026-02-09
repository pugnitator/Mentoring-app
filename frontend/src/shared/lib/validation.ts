/**
 * Валидация текстовых полей:
 * - не только пробелы
 * - не только символы без букв
 * - не меньше 3 символов (для непустого значения)
 */
const MIN_LENGTH = 3;
const ONLY_SPACES = /^\s*$/;
const HAS_LETTER = /[a-zA-Zа-яА-ЯёЁ]/;

export function validateTextField(
  value: string,
  required: boolean
): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return required ? 'Обязательное поле' : null;
  }
  if (ONLY_SPACES.test(value)) {
    return 'Нельзя указать только пробелы';
  }
  if (!HAS_LETTER.test(trimmed)) {
    return 'Должна быть хотя бы одна буква';
  }
  if (trimmed.length < MIN_LENGTH) {
    return `Минимум ${MIN_LENGTH} символа`;
  }
  return null;
}

export function validateOptionalTextField(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (ONLY_SPACES.test(value)) return 'Нельзя указать только пробелы';
  if (!HAS_LETTER.test(trimmed)) return 'Должна быть хотя бы одна буква';
  if (trimmed.length < MIN_LENGTH) return `Минимум ${MIN_LENGTH} символа`;
  return null;
}

/** Валидация списка тем (через запятую): хотя бы одна тема, каждая не менее 3 символов и с буквой */
export function validateTopicsString(value: string): string | null {
  const topics = value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (topics.length === 0) return 'Обязательное поле';
  for (const t of topics) {
    const err = validateOptionalTextField(t);
    if (err) return err;
  }
  return null;
}
