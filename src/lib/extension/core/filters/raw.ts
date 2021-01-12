import {Markup} from "../../../markup";

/**
 * Marks a variable as being safe.
 *
 * @param {string | Markup} string A variable
 *
 * @return {Promise<string>}
 */
export function raw(string: string | Markup): Promise<string> {
    return Promise.resolve(string.toString());
}
