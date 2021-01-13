import {CacheInterface} from "../cache-interface";
import {TemplatesModule} from "../environment";

/**
 * Implements a no-cache strategy.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class NullCache implements CacheInterface {
    generateKey(name: string, className: string): Promise<string> {
        return Promise.resolve('');
    }

    write(key: string, content: string): Promise<void> {
        return Promise.resolve();
    }

    load(key: string): Promise<TemplatesModule> {
        return Promise.resolve(() => {
            return new Map();
        });
    }

    getTimestamp(key: string): Promise<number> {
        return Promise.resolve(0);
    }
}
