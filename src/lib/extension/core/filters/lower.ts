import {TwingEnvironment} from "../../../environment";
import {Markup} from "../../../markup";

/**
 * Converts a string to lowercase.
 *
 * @param {TwingEnvironment} env
 * @param {string | Markup} string A string
 *
 * @returns {Promise<string>} The lowercased string
 */
export function lower(env: TwingEnvironment, string: string | Markup): Promise<string> {
    return Promise.resolve(string.toString().toLowerCase());
}
