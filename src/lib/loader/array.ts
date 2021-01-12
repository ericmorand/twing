import {TwingLoaderInterface} from "../loader-interface";
import {Source} from "../source";
import {LoaderError} from "../error/loader";
import {iteratorToMap} from "../helpers/iterator-to-map";

/**
 * Loads template from the filesystem.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingLoaderArray implements TwingLoaderInterface {
    private templates: Map<string, string>;

    constructor(templates: any) {
        this.templates = iteratorToMap(templates);
    }

    setTemplate(name: string, template: string) {
        this.templates.set(name, template);
    }

    getSourceContext(name: string, from: Source): Promise<Source> {
        return this.exists(name, from).then((exists) => {
            if (!exists) {
                throw new LoaderError(`Template "${name}" is not defined.`, null, from);
            }

            return new Source(this.templates.get(name), name);
        });
    }

    exists(name: string, from: Source): Promise<boolean> {
        return Promise.resolve(this.templates.has(name));
    }

    getCacheKey(name: string, from: Source): Promise<string> {
        return this.exists(name, from).then((exists) => {
            if (!exists) {
                throw new LoaderError(`Template "${name}" is not defined.`, null, from);
            }

            return name + ':' + this.templates.get(name);
        });
    }

    isFresh(name: string, time: number, from: Source): Promise<boolean> {
        return this.exists(name, from).then((exists) => {
            if (!exists) {
                throw new LoaderError(`Template "${name}" is not defined.`, null, from);
            }

            return true;
        });
    }

    resolve(name: string, from: Source): Promise<string> {
        return Promise.resolve(name);
    }
}
