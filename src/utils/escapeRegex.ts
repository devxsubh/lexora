/**
 * Escape special regex characters in a string to prevent ReDoS and injection
 * when using user input in MongoDB $regex queries.
 */
const escapeRegex = (str: string): string => {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
