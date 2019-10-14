import {TwingLoaderInterface} from "../loader-interface";
import {TwingSource} from "../source";
import {TwingErrorLoader} from "../error/loader";
import {Stats, stat as fsStat, statSync, readFileSync} from "fs";
import {relative as relativePath, resolve as resolvePath, join as joinPath, sep as pathSeparator, isAbsolute as isAbsolutePath} from "path";

const rtrim = require('locutus/php/strings/rtrim');

/**
 * Loads template from the filesystem.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingLoaderFilesystem implements TwingLoaderInterface {
    /** Identifier of the main namespace. */
    static MAIN_NAMESPACE = '__main__';

    protected paths: Map<string, Array<string>> = new Map();
    protected cache: Map<string, string> = new Map();
    protected errorCache: Map<string, string> = new Map();

    private readonly rootPath: string;

    /**
     * @param {string | Array<string>} paths A path or a map of paths where to look for templates
     * @param {string} rootPath The root path common to all relative paths (null for process.cwd())
     */
    constructor(paths: string | Array<string> = [], rootPath: string = null) {
        rootPath = (rootPath === null ? process.cwd() : rootPath);

        this.rootPath = resolvePath(rootPath);

        if (paths) {
            this.setPaths(paths);
        }
    }

    /**
     * Returns the paths to the templates.
     *
     * @param {string} namespace A path namespace
     *
     * @returns Array<string> The array of paths where to look for templates
     */
    getPaths(namespace: string = TwingLoaderFilesystem.MAIN_NAMESPACE): Array<string> {
        return this.paths.has(namespace) ? this.paths.get(namespace) : [];
    }

    /**
     * Returns the path namespaces.
     *
     * The main namespace is always defined.
     *
     * @returns Array<string> The array of defined namespaces
     */
    getNamespaces(): Array<string> {
        return [...this.paths.keys()];
    }

    /**
     * Sets the paths where templates are stored.
     *
     * @param {string|Array<string>} paths A path or an array of paths where to look for templates
     * @param {string} namespace A path namespace
     */
    setPaths(paths: string | Array<string>, namespace: string = TwingLoaderFilesystem.MAIN_NAMESPACE) {
        if (!Array.isArray(paths)) {
            paths = [paths as string];
        }

        this.paths.set(namespace, []);

        for (let path of paths) {
            this.addPath(path, namespace);
        }
    }

    /**
     * Adds a path where templates are stored.
     *
     * @param {string} path A path where to look for templates
     * @param {string} namespace A path namespace
     *
     * @throws TwingErrorLoader
     */
    addPath(path: string, namespace: string = TwingLoaderFilesystem.MAIN_NAMESPACE) {
        // invalidate the cache
        this.cache = new Map();
        this.errorCache = new Map();

        let checkPath = this.isAbsolutePath(path) ? path : joinPath(this.rootPath, path);

        let stat: Stats = null;

        try {
            stat = statSync(this.normalizeName(checkPath));
        } catch (err) {
            // noop, we just want to handle the error
        }

        if (!stat || !stat.isDirectory()) {
            throw new TwingErrorLoader(`The "${path}" directory does not exist ("${checkPath}").`, -1, null);
        }

        if (!this.paths.has(namespace)) {
            this.paths.set(namespace, []);
        }

        this.paths.get(namespace).push(rtrim(path, '\/\\\\'));
    }

    /**
     * Prepends a path where templates are stored.
     *
     * @param {string} path A path where to look for templates
     * @param {string} namespace A path namespace
     *
     * @throws TwingErrorLoader
     */
    prependPath(path: string, namespace: string = TwingLoaderFilesystem.MAIN_NAMESPACE) {
        // invalidate the cache
        this.cache = new Map();
        this.errorCache = new Map();

        let checkPath = this.isAbsolutePath(path) ? path : joinPath(this.rootPath, path);

        let stat = statSync(this.normalizeName(checkPath));

        if (!stat.isDirectory()) {
            throw new TwingErrorLoader(`The "${path}" directory does not exist ("${checkPath}").`, -1, null);
        }

        path = rtrim(path, '\/\\\\');

        if (!this.paths.has(namespace)) {
            this.paths.set(namespace, [path]);
        } else {
            this.paths.get(namespace).unshift(path);
        }
    }

    getSourceContext(name: string, from: TwingSource): Promise<TwingSource> {
        return this.findTemplate(name, true, from).then((path) => {
            return new TwingSource(readFileSync(path).toString(), name, path);
        });
    }

    getCacheKey(name: string, from: TwingSource): Promise<string> {
        return this.findTemplate(name, true, from).then((path) => {
            return relativePath(this.rootPath, path);
        });
    }

    exists(name: string, from: TwingSource): Promise<boolean> {
        name = this.normalizeName(name);

        if (this.cache.has(name)) {
            return Promise.resolve(true);
        }

        return this.findTemplate(name, false, from).then((path) => {
            return path !== null;
        });
    }

    isFresh(name: string, time: number, from: TwingSource): Promise<boolean> {
        return this.findTemplate(name, true, from).then((path) => {
            return new Promise((resolve, reject) => {
                fsStat(path, (err, stat) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(stat.mtime.getTime() < time);
                    }
                });
            });
        });
    }

    protected findTemplate(name: string, throw_: boolean = true, from: TwingSource = null): Promise<string> {
        let _do = () => {
            name = this.normalizeName(name);

            if (this.cache.has(name)) {
                return this.cache.get(name);
            }

            if (this.errorCache.has(name)) {
                if (!throw_) {
                    return null;
                }

                throw new TwingErrorLoader(this.errorCache.get(name), -1, from);
            }

            let namespace: string;
            let shortname: string;

            try {
                this.validateName(name);

                [namespace, shortname] = this.parseName(name);
            } catch (e) {
                if (!throw_) {
                    return null;
                }

                throw e;
            }

            if (!this.paths.has(namespace)) {
                this.errorCache.set(name, `There are no registered paths for namespace "${namespace}".`);

                if (!throw_) {
                    return null;
                }

                throw new TwingErrorLoader(this.errorCache.get(name), -1, from);
            }

            for (let path of this.paths.get(namespace)) {
                if (!this.isAbsolutePath(path)) {
                    path = joinPath(this.rootPath, path);
                }

                try {
                    let stat = statSync(joinPath(path, shortname));

                    if (stat.isFile()) {
                        this.cache.set(name, resolvePath(joinPath(path, shortname)));

                        return this.cache.get(name);
                    }
                } catch (e) {
                    // let's continue searching
                }
            }

            this.errorCache.set(name, `Unable to find template "${name}" (looked into: ${this.paths.get(namespace)}).`);

            if (!throw_) {
                return null;
            }

            throw new TwingErrorLoader(this.errorCache.get(name), -1, from);
        };

        return Promise.resolve(_do());
    }

    protected normalizeName(name: string) {
        if (name === null) {
            return '';
        }

        return name.replace(/\\/g, '/').replace(/\/{2,}/g, '/')
    }

    protected parseName(name: string, default_: string = TwingLoaderFilesystem.MAIN_NAMESPACE) {
        if (name[0] === '@') {
            let pos = name.indexOf('/');

            if (pos < 0) {
                throw new TwingErrorLoader(`Malformed namespaced template name "${name}" (expecting "@namespace/template_name").`, -1, null);
            }

            let namespace = name.substr(1, pos - 1);
            let shortname = name.substr(pos + 1);

            return [namespace, shortname];
        }

        return [default_, name];
    }

    protected validateName(name: string) {
        if (name.indexOf(`\0`) > -1) {
            throw new TwingErrorLoader('A template name cannot contain NUL bytes.', -1, null);
        }

        let parts = name.split(pathSeparator);
        let level = 0;

        for (let part of parts) {
            if (part === '..') {
                level--;
            } else if (part !== '.') {
                level++;
            }
        }

        if (level < 0) {
            throw new TwingErrorLoader(`Looks like you try to load a template outside configured directories (${name}).`, -1, null);
        }
    }

    protected isAbsolutePath(file: string) {
        return isAbsolutePath(file);
    }

    resolve(name: string, from: TwingSource): Promise<string> {
        return this.findTemplate(name, false, from);
    }
}
