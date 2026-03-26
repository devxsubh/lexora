const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function isGeminiRateLimitError(err: unknown): boolean {
	const msg = err instanceof Error ? err.message : String(err);
	return (
		msg.includes('429') ||
		msg.includes('Too Many Requests') ||
		msg.includes('RESOURCE_EXHAUSTED') ||
		msg.includes('503') ||
		msg.includes('Service Unavailable') ||
		msg.includes('high demand')
	);
}

function retryDelayMs(err: unknown, attempt: number): number {
	const msg = err instanceof Error ? err.message : String(err);
	const m = msg.match(/Please retry in ([\d.]+)s/i);
	if (m) {
		return Math.ceil(parseFloat(m[1]) * 1000) + 250;
	}
	return Math.min(32_000, 1000 * 2 ** attempt);
}

/** Retries on Gemini / Google rate-limit style errors; rethrows immediately on other failures. */
export async function withGeminiRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
	let lastErr: unknown;
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastErr = err;
			if (!isGeminiRateLimitError(err) || attempt === maxAttempts - 1) {
				throw err;
			}
			await sleep(retryDelayMs(err, attempt));
		}
	}
	throw lastErr;
}
