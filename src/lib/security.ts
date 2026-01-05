// Security utilities for patient data protection

/**
 * Simple encoding for sensitive patient data (not true encryption)
 * In a real implementation, use proper encryption like Web Crypto API
 */
export function encodePatientData(data: string): string {
  const timestamp = Date.now().toString();
  const combined = data + '|' + timestamp;
  return btoa(combined);
}

/**
 * Decode sensitive patient data
 */
export function decodePatientData(encodedData: string): string | null {
  try {
    const decoded = atob(encodedData);
    const [data, timestampStr] = decoded.split('|');

    // Check if data is too old (more than 24 hours)
    const timestamp = parseInt(timestampStr);
    if (isNaN(timestamp) || Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return null; // Data too old
    }

    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Simple hash for sensitive data that doesn't need to be decrypted
 * In a real implementation, use proper hashing like Web Crypto API
 */
export function hashPatientData(data: string): string {
  // Simple hash using Array.reduce since we can't use crypto in browser directly here
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Validate patient data format
 */
export function validatePatientData(data: any): boolean {
  // Validate NIK format (Indonesian ID)
  if (data.nik && !/^\d{16}$/.test(data.nik)) {
    return false;
  }
  
  // Validate phone number format
  if (data.phone && !/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(data.phone.replace(/\s/g, ''))) {
    return false;
  }
  
  // Validate email format if present
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize patient data to prevent injection attacks
 */
export function sanitizePatientData(data: any): any {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Generate secure session token
 */
export function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Verify user has proper permissions to access patient data
 */
export function hasPatientDataAccess(role: string): boolean {
  // In a real implementation, this would check against a permissions database
  // For now, we'll implement basic role-based access control
  const allowedRoles = ['admin', 'doctor', 'nurse', 'receptionist'];
  return allowedRoles.includes(role);
}

/**
 * Generate access token for patient data with expiration
 */
export function generatePatientDataToken(patientId: string, userId: string, role: string, expirationHours: number = 1): string {
  const expiration = Date.now() + (expirationHours * 60 * 60 * 1000);
  const data = `${patientId}|${userId}|${role}|${expiration}`;
  // Simple hash for demonstration - in production, use proper HMAC
  const hash = hashPatientData(data + (process.env.SECRET_KEY || 'default_secret'));
  return btoa(data) + '|' + hash.substring(0, 16);
}

/**
 * Verify patient data access token
 */
export function verifyPatientDataToken(token: string): { valid: boolean; patientId?: string; userId?: string; role?: string } {
  try {
    const parts = token.split('|');
    if (parts.length !== 2) return { valid: false };

    const encodedData = parts[0];
    const storedHash = parts[1];

    const decoded = atob(encodedData);
    const [patientId, userId, role, expirationStr] = decoded.split('|');

    // Verify the hash
    const data = `${patientId}|${userId}|${role}|${expirationStr}`;
    const computedHash = hashPatientData(data + (process.env.SECRET_KEY || 'default_secret'));
    if (computedHash.substring(0, 16) !== storedHash) {
      return { valid: false };
    }

    // Check if token is expired
    const expiration = parseInt(expirationStr);
    if (isNaN(expiration) || Date.now() > expiration) {
      return { valid: false };
    }

    return {
      valid: true,
      patientId,
      userId,
      role
    };
  } catch (e) {
    return { valid: false };
  }
}

/**
 * Create audit log entry for patient data access
 */
export function createAuditLog(userId: string, patientId: string, action: string, ipAddress?: string, userAgent?: string): void {
  // In a real implementation, this would log to a secure audit system
  // For now, we'll just log to console with timestamp
  const timestamp = new Date().toISOString();
  console.log(`AUDIT: ${timestamp} | User: ${userId} | Patient: ${patientId} | Action: ${action} | IP: ${ipAddress || 'unknown'} | UA: ${userAgent || 'unknown'}`);
}