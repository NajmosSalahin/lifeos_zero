import crypto from 'crypto';
export const hashToken = (raw: string) => crypto.createHash('sha256').update(raw).digest('hex');
export const generateSecureToken = () => crypto.randomBytes(32).toString('hex');
