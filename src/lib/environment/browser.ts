import {Environment} from "../environment";
import {CacheInterface} from "../cache-interface";
import {NullCache} from "../cache/null";

export class BrowserEnvironment extends Environment {
    cacheFromString(cache: string): CacheInterface {
        return new NullCache();
    }
}
