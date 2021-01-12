import {Markup} from "../../../markup";

/**
 * Converts a string to uppercase.
 *
 * @param {string | Markup} string A string
 *
 * @returns {Promise<string>} The uppercased string
 */
export function upper(string: string | Markup): Promise<string> {
    return Promise.resolve(string.toString().toUpperCase());
}
