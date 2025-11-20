/**
 * ESMC JWT Signature Validator
 * Prevents token forgery attacks by verifying RSA/ECDSA signatures
 *
 * SECURITY: This module validates JWT tokens cryptographically
 * to prevent attackers from creating fake tokens claiming VIP tier.
 */

const crypto = require('crypto');
const https = require('https');

/**
 * ESMC Server Public Key Configuration
 * Fetched dynamically from Vercel deployment
 */
const JWKS_URL = 'https://esmc-sdk.com/.well-known/jwks.json';
let cachedPublicKey = null;
let cacheExpiry = 0;
const CACHE_TTL = 3600000; // 1 hour cache

/**
 * Fetch public key from Vercel JWKS endpoint
 * Implements caching to avoid unnecessary requests
 * Follows redirects automatically
 *
 * @returns {Promise<string>} - PEM-formatted public key
 */
async function fetchPublicKey() {
  // Return cached key if still valid
  if (cachedPublicKey && Date.now() < cacheExpiry) {
    return cachedPublicKey;
  }

  return new Promise((resolve, reject) => {
    const makeRequest = (url, redirectCount = 0) => {
      if (redirectCount > 5) {
        return reject(new Error('Too many redirects'));
      }

      https.get(url, { timeout: 5000 }, (res) => {
        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
          const redirectUrl = res.headers.location;
          if (!redirectUrl) {
            return reject(new Error(`Redirect without location header (${res.statusCode})`));
          }
          console.log(`🔄 Following redirect to: ${redirectUrl}`);
          return makeRequest(redirectUrl, redirectCount + 1);
        }

        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              throw new Error(`JWKS endpoint returned ${res.statusCode}`);
            }

            const jwks = JSON.parse(data);

            // Extract first key (assuming single key for simplicity)
            if (!jwks.keys || jwks.keys.length === 0) {
              throw new Error('No keys found in JWKS response');
            }

            const key = jwks.keys[0];

            // Convert JWK to PEM format (for RSA keys)
            if (key.kty === 'RSA') {
              const pemKey = convertJWKtoPEM(key);

              // Cache the key
              cachedPublicKey = pemKey;
              cacheExpiry = Date.now() + CACHE_TTL;

              resolve(pemKey);
            } else {
              throw new Error(`Unsupported key type: ${key.kty}`);
            }
          } catch (error) {
            reject(new Error(`Failed to parse JWKS: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`Failed to fetch JWKS: ${error.message}`));
      }).on('timeout', () => {
        reject(new Error('JWKS fetch timeout after 5 seconds'));
      });
    };

    makeRequest(JWKS_URL);
  });
}

/**
 * Convert JWK (JSON Web Key) to PEM format
 *
 * @param {object} jwk - JWK object with n (modulus) and e (exponent)
 * @returns {string} - PEM-formatted public key
 */
function convertJWKtoPEM(jwk) {
  if (!jwk.n || !jwk.e) {
    throw new Error('Invalid JWK: missing n or e');
  }

  // Decode base64url to buffer
  const modulus = Buffer.from(jwk.n, 'base64url');
  const exponent = Buffer.from(jwk.e, 'base64url');

  // Create public key object
  const publicKey = crypto.createPublicKey({
    key: {
      kty: 'RSA',
      n: modulus.toString('base64'),
      e: exponent.toString('base64')
    },
    format: 'jwk'
  });

  // Export as PEM
  return publicKey.export({
    type: 'spki',
    format: 'pem'
  });
}

/**
 * Verify JWT signature using RSA/ECDSA
 *
 * @param {string} token - JWT token from authentication server
 * @param {string} publicKey - PEM-formatted public key (fetched from Vercel)
 * @returns {object|null} - Decoded payload if valid, null if invalid
 *
 * Security: Prevents attacks like:
 * - alg:none bypass
 * - Weak HMAC signatures
 * - Self-signed tokens
 * - Expired tokens
 */
async function verifyJWT(token, publicKey = null) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token format');
  }

  // Fetch public key from Vercel if not provided
  if (!publicKey) {
    publicKey = await fetchPublicKey();
  }

  // Split JWT into parts
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT token (expected 3 parts)');
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // Decode header
  let header;
  try {
    header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf-8'));
  } catch (error) {
    throw new Error('Invalid JWT header encoding');
  }

  // Verify algorithm (MUST be RS256 or ES256)
  if (!['RS256', 'ES256'].includes(header.alg)) {
    throw new Error(`Unsupported/insecure algorithm: ${header.alg} (only RS256/ES256 allowed)`);
  }

  // Decode payload (without validation yet)
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
  } catch (error) {
    throw new Error('Invalid JWT payload encoding');
  }

  // Verify signature
  const dataToVerify = `${headerB64}.${payloadB64}`;
  const signature = Buffer.from(signatureB64, 'base64url');

  let isValid = false;
  try {
    if (header.alg === 'RS256') {
      // RSA-SHA256 verification
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(dataToVerify);
      isValid = verifier.verify(publicKey, signature);
    } else if (header.alg === 'ES256') {
      // ECDSA-SHA256 verification
      const verifier = crypto.createVerify('SHA256');
      verifier.update(dataToVerify);
      isValid = verifier.verify(publicKey, signature);
    }
  } catch (error) {
    throw new Error(`Signature verification failed: ${error.message}`);
  }

  if (!isValid) {
    throw new Error('JWT signature verification failed - token may be forged');
  }

  // Verify claims
  const now = Math.floor(Date.now() / 1000);

  // Check expiration (exp)
  if (payload.exp && payload.exp < now) {
    throw new Error(`Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
  }

  // Check not-before (nbf)
  if (payload.nbf && payload.nbf > now) {
    throw new Error(`Token not valid until ${new Date(payload.nbf * 1000).toISOString()}`);
  }

  // Verify issuer (must be esmc-sdk.com)
  if (payload.iss && payload.iss !== 'esmc-sdk.com') {
    throw new Error(`Invalid issuer: ${payload.iss} (expected esmc-sdk.com)`);
  }

  // Verify audience (must be esmc-client)
  if (payload.aud && payload.aud !== 'esmc-client') {
    throw new Error(`Invalid audience: ${payload.aud} (expected esmc-client)`);
  }

  // All checks passed
  return payload;
}

/**
 * Verify token and extract user data safely
 *
 * @param {string} token - JWT token
 * @returns {Promise<object>} - User data { email, tier, userId, exp, etc. }
 * @throws {Error} - If token is invalid, expired, or forged
 */
async function verifyAndExtractUserData(token) {
  const payload = await verifyJWT(token);

  // Extract user data
  return {
    email: payload.email || 'unknown@esmc-sdk.com',
    userId: payload.sub || payload.userId,
    tier: payload.tier || 'FREE',
    name: payload.name || payload.email?.split('@')[0],
    exp: payload.exp,
    iat: payload.iat,
    issuer: payload.iss,
    hardwareId: payload.hardwareId // Server-validated hardware ID
  };
}

/**
 * Check if JWT validation is bypassed (DEVELOPMENT ONLY)
 * In production, always return false
 */
function isDevMode() {
  // NEVER enable in production builds
  return process.env.ESMC_DEV_MODE === 'true' && process.env.NODE_ENV !== 'production';
}

/**
 * Verify token with dev mode fallback
 * WARNING: Only use in development. Production MUST validate signatures.
 */
async function verifyTokenSafe(token) {
  if (isDevMode()) {
    console.warn('⚠️  DEV MODE: JWT signature validation disabled!');
    console.warn('   This is insecure and should NEVER happen in production');

    // Decode without verification (dev only)
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64url').toString('utf-8')
      );
      return payload;
    } catch (error) {
      throw new Error('Invalid JWT format (even in dev mode)');
    }
  }

  // Production: always verify
  return await verifyJWT(token);
}

module.exports = {
  verifyJWT,
  verifyAndExtractUserData,
  verifyTokenSafe,
  isDevMode,
  fetchPublicKey,
  convertJWKtoPEM
};
