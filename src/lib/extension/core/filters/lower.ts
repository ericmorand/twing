import {Environment} from "../../../environment";
import {Markup} from "../../../markup";

/**
 * Converts a string to lowercase.
 *
 * @param {Environment} env
 * @param {string | Markup} string A string
 *
 * @returns {Promise<string>} The lowercased string
 */
export function lower(env: Environment, string: string | Markup): Promise<string> {
    return Promise.resolve(string.toString().toLowerCase());
}
