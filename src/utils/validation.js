/**
 * Validates if a string is a valid email address.
 * Minimal implementation as requested.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
