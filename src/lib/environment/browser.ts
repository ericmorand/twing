import {TwingEnvironment} from "../environment";
import {CacheInterface} from "../cache-interface";
import {NullCache} from "../cache/null";

export class TwingEnvironmentBrowser extends TwingEnvironment {
    cacheFromString(cache: string): CacheInterface {
        return new NullCache();
    }
}
