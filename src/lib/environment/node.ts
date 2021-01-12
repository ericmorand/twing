import {TwingEnvironment} from "../environment";
import {CacheInterface} from "../cache-interface";
import {FilesystemCache} from "../cache/filesystem";

export class TwingEnvironmentNode extends TwingEnvironment {
    cacheFromString(cache: string): CacheInterface {
        return new FilesystemCache(cache);
    }
}
