/* istanbul ignore next */

import {TemplatesModule} from "./environment";

export interface CacheInterface {
    /**
     * Generates a cache key for the given template class name.
     *
     * @param {string} name The template name
     * @param {string} className The template class name
     *
     * @return {Promise<string>}
     */
    generateKey(name: string, className: string): Promise<string>;

    /**
     * Writes the compiled template to cache.
     *
     * @param {string} key The cache key
     * @param {string} content The template representation as a PHP class
     *
     * @return {Promise<void>}
     */
    write(key: string, content: string): Promise<void>;

    /**
     * Loads a template from the cache.
     *
     * @param {string} key The cache key
     *
     * @return {Promise<TemplatesModule>}
     */
    load(key: string): Promise<TemplatesModule>;

    /**
     * Returns the modification timestamp of a key.
     *
     * @param {string} key The cache key
     *
     * @returns {Promise<number>}
     */
    getTimestamp(key: string): Promise<number>;
}
