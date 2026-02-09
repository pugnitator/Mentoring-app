import { createHmac, createHash } from 'crypto';

const AUTH_DATE_MAX_AGE_SEC = 24 * 60 * 60; // 24 hours

export interface TelegramCallbackPayload {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

/**
 * Verifies Telegram Login Widget data per https://core.telegram.org/widgets/login#checking-authorization
 * data_check_string = all fields except hash, sorted alphabetically, key=value, \n separator
 * secret_key = SHA256(bot_token)
 * HMAC-SHA256(data_check_string, secret_key) in hex must equal hash
 */
export function verifyTelegramAuth(
  payload: Record<string, string | undefined>,
  botToken: string,
): boolean {
  const { hash, ...rest } = payload;
  if (!hash || !payload.id || !payload.auth_date) return false;

  const dataCheckString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join('\n');
  const secretKey = createHash('sha256').update(botToken).digest();
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  if (calculatedHash !== hash) return false;

  const authDate = parseInt(payload.auth_date, 10);
  if (Number.isNaN(authDate)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > AUTH_DATE_MAX_AGE_SEC) return false;

  return true;
}
