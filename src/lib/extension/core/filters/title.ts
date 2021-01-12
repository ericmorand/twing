import {Markup} from "../../../markup";

const ucwords = require('locutus/php/strings/ucwords');

/**
 * Returns a title-cased string.
 *
 * @param {string | Markup} string A string
 *
 * @returns {Promise<string>} The title-cased string
 */
export function title(string: string | Markup): Promise<string> {
    let result: string = ucwords(string.toString().toLowerCase());

    return Promise.resolve(result);
}
