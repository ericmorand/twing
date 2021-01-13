import {Environment} from "../environment";
import {CacheInterface} from "../cache-interface";
import {FilesystemCache} from "../cache/filesystem";

export class NodeEnvironment extends Environment {
    cacheFromString(cache: string): CacheInterface {
        return new FilesystemCache(cache);
    }
}
