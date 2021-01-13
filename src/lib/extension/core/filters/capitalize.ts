import {Environment} from "../../../environment";
import {Markup} from "../../../markup";
import {isNullOrUndefined} from "util";

const words = require('capitalize');

/**
 * Returns a capitalized string.
 *
 * @param {Environment} env
 * @param {string | Markup} string A string
 *
 * @returns {Promise<string>} The capitalized string
 */
export function capitalize(env: Environment, string: string | Markup): Promise<string> {
    if (isNullOrUndefined(string) || string === '') {
        return Promise.resolve(string);
    }

    return Promise.resolve(words(string.toString()));
}
