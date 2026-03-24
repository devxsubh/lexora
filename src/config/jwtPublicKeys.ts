import config from '~/config/config';

/**
 * Resolve RS256 public key for access-token verification from JWT `kid` header.
 * Missing `kid` accepts the primary public key (legacy tokens).
 */
export function resolveAccessTokenPublicKey(kid: string | undefined): Buffer {
	if (!kid) {
		return config.JWT_ACCESS_TOKEN_SECRET_PUBLIC;
	}
	if (config.JWT_ACCESS_TOKEN_KEY_ID && kid === config.JWT_ACCESS_TOKEN_KEY_ID) {
		return config.JWT_ACCESS_TOKEN_SECRET_PUBLIC;
	}
	const legacy = config.JWT_LEGACY_PUBLIC_KEYS[kid];
	if (legacy) {
		return legacy;
	}
	throw new Error(`Unknown JWT access token key id: ${kid}`);
}
