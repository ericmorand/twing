import {TwingLoaderInterface} from "../loader-interface";
import {TwingErrorLoader} from "../error/loader";
import {TwingSource} from "../source";

/**
 * Loads templates from other loaders.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingLoaderChain implements TwingLoaderInterface {
    private hasSourceCache: Map<string, boolean> = new Map();
    private loaders: Array<TwingLoaderInterface> = [];

    /**
     * @param {Array<TwingLoaderInterface>} loaders
     */
    constructor(loaders: Array<TwingLoaderInterface> = []) {
        for (let loader of loaders) {
            this.addLoader(loader);
        }
    }

    addLoader(loader: TwingLoaderInterface) {
        this.loaders.push(loader);
        this.hasSourceCache = new Map();
    }

    /**
     * @return TwingLoaderInterface[]
     */
    getLoaders(): TwingLoaderInterface[] {
        return this.loaders;
    }

    getSourceContext(name: string, from: TwingSource): Promise<TwingSource> {
        let exceptions: Array<string> = [];

        let getSourceContextAtIndex = (index: number = 0): Promise<TwingSource> => {
            if (index < this.loaders.length) {
                let loader = this.loaders[index];

                return loader.exists(name, from).then((exists) => {
                    if (!exists) {
                        return getSourceContextAtIndex(index + 1);
                    } else {
                        return loader.getSourceContext(name, from)
                            .catch((e) => {
                                console.warn(e);

                                if (e instanceof TwingErrorLoader) {
                                    exceptions.push(e.message);
                                }

                                return getSourceContextAtIndex(index + 1);
                            });
                    }
                });
            } else {
                return Promise.resolve(null);
            }
        };

        return getSourceContextAtIndex().then((source) => {
            if (source) {
                return source;
            } else {
                throw new TwingErrorLoader(`Template "${name}" is not defined${exceptions.length ? ' (' + exceptions.join(', ') + ')' : ''}.`, -1, from);
            }
        });
    }

    exists(name: string, from: TwingSource): Promise<boolean> {
        if (this.hasSourceCache.has(name)) {
            return Promise.resolve(this.hasSourceCache.get(name));
        }

        let existsAtIndex = (index: number = 0): Promise<boolean> => {
            if (index < this.loaders.length) {
                let loader = this.loaders[index];

                return loader.exists(name, from).then((exists) => {
                    this.hasSourceCache.set(name, exists);

                    if (!exists) {
                        return existsAtIndex(index + 1);
                    } else {
                        return true;
                    }
                });
            } else {
                return Promise.resolve(null);
            }
        };

        return existsAtIndex().then((exists) => {
            this.hasSourceCache.set(name, exists);

            return exists;
        })
    }

    getCacheKey(name: string, from: TwingSource): Promise<string> {
        let exceptions: Array<string> = [];

        let getCacheKeyAtIndex = (index: number = 0): Promise<string> => {
            if (index < this.loaders.length) {
                let loader = this.loaders[index];

                return loader.exists(name, from).then((exists) => {
                    if (!exists) {
                        return getCacheKeyAtIndex(index + 1);
                    } else {
                        return loader.getCacheKey(name, from)
                            .catch((e) => {
                                if (e instanceof TwingErrorLoader) {
                                    exceptions.push(loader.constructor.name + ': ' + e.message);
                                }

                                return getCacheKeyAtIndex(index + 1);
                            });
                    }
                });
            } else {
                return Promise.resolve(null);
            }
        };

        return getCacheKeyAtIndex().then((key) => {
            if (key) {
                return key;
            } else {
                throw new TwingErrorLoader(`Template "${name}" is not defined${exceptions.length ? ' (' + exceptions.join(', ') + ')' : ''}.`, -1, from);
            }
        });
    }

    isFresh(name: string, time: number, from: TwingSource) {
        let exceptions = [];

        for (let loader of this.loaders) {
            if (!loader.exists(name, from)) {
                continue;
            }

            try {
                return loader.isFresh(name, time, from);
            } catch (e) {
                if (e instanceof TwingErrorLoader) {
                    exceptions.push(loader.constructor.name + ': ' + e.message);
                }
            }
        }

        throw new TwingErrorLoader(`Template "${name}" is not defined${exceptions.length ? ' (' + exceptions.join(', ') + ')' : ''}.`, -1, from);
    }

    resolve(name: string, from: TwingSource): Promise<string> {
        return Promise.resolve(name);
        // let exceptions = [];
        //
        // for (let loader of this.loaders) {
        //     if (!loader.exists(name, from)) {
        //         continue;
        //     }
        //
        //     try {
        //         return loader.resolve(name, from);
        //     } catch (e) {
        //         if (e instanceof TwingErrorLoader) {
        //             exceptions.push(loader.constructor.name + ': ' + e.message);
        //         }
        //     }
        // }
        //
        // throw new TwingErrorLoader(`Template "${name}" is not defined${exceptions.length ? ' (' + exceptions.join(', ') + ')' : ''}.`, -1, from);
    }
}
