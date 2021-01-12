import {LoaderInterface} from "../loader-interface";
import {LoaderError} from "../error/loader";
import {Source} from "../source";

/**
 * Loads templates from other loaders.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class ChainLoader implements LoaderInterface {
    private hasSourceCache: Map<string, boolean> = new Map();
    private loaders: Array<LoaderInterface> = [];

    /**
     * @param {Array<LoaderInterface>} loaders
     */
    constructor(loaders: Array<LoaderInterface> = []) {
        for (let loader of loaders) {
            this.addLoader(loader);
        }
    }

    addLoader(loader: LoaderInterface) {
        this.loaders.push(loader);
        this.hasSourceCache = new Map();
    }

    /**
     * @return LoaderInterface[]
     */
    getLoaders(): LoaderInterface[] {
        return this.loaders;
    }

    getSourceContext(name: string, from: Source): Promise<Source> {
        let exceptions: Array<string> = [];

        let getSourceContextAtIndex = (index: number): Promise<Source> => {
            if (index < this.loaders.length) {
                let loader = this.loaders[index];

                return loader.exists(name, from).then((exists) => {
                    if (!exists) {
                        return getSourceContextAtIndex(index + 1);
                    } else {
                        return loader.getSourceContext(name, from)
                            .catch((e) => {
                                if (e instanceof LoaderError) {
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

        return getSourceContextAtIndex(0).then((source) => {
            if (source) {
                return source;
            } else {
                throw new LoaderError(`Template "${name}" is not defined${exceptions.length ? ' (' + exceptions.join(', ') + ')' : ''}.`, null, from);
            }
        });
    }

    exists(name: string, from: Source): Promise<boolean> {
        if (this.hasSourceCache.has(name)) {
            return Promise.resolve(this.hasSourceCache.get(name));
        }

        let existsAtIndex = (index: number): Promise<boolean> => {
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

        return existsAtIndex(0).then((exists) => {
            this.hasSourceCache.set(name, exists);

            return exists;
        })
    }

    getCacheKey(name: string, from: Source): Promise<string> {
        let exceptions: Array<string> = [];

        let getCacheKeyAtIndex = (index: number): Promise<string> => {
            if (index < this.loaders.length) {
                let loader = this.loaders[index];

                return loader.exists(name, from).then((exists) => {
                    if (!exists) {
                        return getCacheKeyAtIndex(index + 1);
                    } else {
                        return loader.getCacheKey(name, from)
                            .catch((e) => {
                                if (e instanceof LoaderError) {
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

        return getCacheKeyAtIndex(0).then((key) => {
            if (key) {
                return key;
            } else {
                throw new LoaderError(`Template "${name}" is not defined${exceptions.length ? ' (' + exceptions.join(', ') + ')' : ''}.`, null, from);
            }
        });
    }

    isFresh(name: string, time: number, from: Source): Promise<boolean> {
        let exceptions: Array<string> = [];

        let isFreshAtIndex = (index: number): Promise<boolean> => {
            if (index < this.loaders.length) {
                let loader = this.loaders[index];

                return loader.exists(name, from).then((exists) => {
                    if (!exists) {
                        return isFreshAtIndex(index + 1);
                    } else {
                        return loader.isFresh(name, time, from)
                            .catch((e) => {
                                if (e instanceof LoaderError) {
                                    exceptions.push(loader.constructor.name + ': ' + e.message);
                                }

                                return isFreshAtIndex(index + 1);
                            });
                    }
                });
            } else {
                return Promise.resolve(null);
            }
        };

        return isFreshAtIndex(0).then((fresh) => {
            if (fresh !== null) {
                return fresh;
            } else {
                throw new LoaderError(`Template "${name}" is not defined${exceptions.length ? ' (' + exceptions.join(', ') + ')' : ''}.`, null, from);
            }
        });
    }

    resolve(name: string, from: Source, shouldThrow: boolean = true): Promise<string> {
        let exceptions: Array<string> = [];

        let resolveAtIndex = (index: number): Promise<string> => {
            if (index < this.loaders.length) {
                let loader = this.loaders[index];

                return loader.resolve(name, from, true).catch((e) => {
                    if (e instanceof LoaderError) {
                        exceptions.push(loader.constructor.name + ': ' + e.message);
                    }

                    return resolveAtIndex(index + 1);
                });
            } else {
                return Promise.resolve(null);
            }
        };

        return resolveAtIndex(0).then((resolvedName) => {
            if (resolvedName) {
                return resolvedName;
            } else {
                if (shouldThrow) {
                    throw new LoaderError(`Template "${name}" is not defined${exceptions.length ? ' (' + exceptions.join(', ') + ')' : ''}.`, null, from);
                } else {
                    return null;
                }
            }
        });
    }
}
