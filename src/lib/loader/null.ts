import {TwingLoaderInterface} from "../loader-interface";
import {Source} from "../source";
import {LoaderError} from "../error/loader";

/**
 * Noop implementation of TwingLoaderInterface.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingLoaderNull implements TwingLoaderInterface {
    exists(name: string, from: Source): Promise<boolean> {
        return Promise.resolve(false);
    }

    getCacheKey(name: string, from: Source): Promise<string> {
        return Promise.resolve(name);
    }

    getSourceContext(name: string, from: Source): Promise<Source> {
        throw new LoaderError(`Template "${name}" is not defined.`, null, from);
    }

    isFresh(name: string, time: number, from: Source): Promise<boolean> {
        return Promise.resolve(true);
    }

    resolve(name: string, from: Source): Promise<string> {
        return Promise.resolve(name);
    }
}
