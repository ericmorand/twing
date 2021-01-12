import {Source} from "../../src/lib/source";
import {NullLoader} from "../../src/lib/loader/null";

export class MockLoader extends NullLoader {
    getSourceContext(name: string) {
        return Promise.resolve(new Source('', ''));
    }

    getCacheKey(name: string) {
        return Promise.resolve('');
    }

    isFresh(name: string, time: number) {
        return Promise.resolve(true);
    }

    exists(name: string) {
        return Promise.resolve(true);
    }
}
