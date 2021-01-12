import {Error} from "../error";

/**
 * Exception thrown when an error occurs during template loading.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class LoaderError extends Error {
    get name(): string {
        return 'TwingErrorLoader';
    }
}
