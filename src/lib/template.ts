import {RuntimeError} from "./error/runtime";
import {Source} from "./source";
import {Error} from "./error";
import {Environment} from "./environment";
import {OutputBuffer} from './output-buffer';
import {iteratorToMap} from "./helpers/iterator-to-map";
import {merge} from "./helpers/merge";
import {Context} from "./context";
import {isMap} from "./helpers/is-map";
import {Markup} from "./markup";
import {SandboxSecurityError} from "./sandbox/security-error";
import {NotAllowedFilterSandboxSecurityError} from "./sandbox/security-not-allowed-filter-error";
import {NotAllowedFunctionSandboxSecurityError} from "./sandbox/security-not-allowed-function-error";
import {NotAllowedTagSandboxSecurityError} from "./sandbox/security-not-allowed-tag-error";
import {compare} from "./helpers/compare";
import {count} from "./helpers/count";
import {isCountable} from "./helpers/is-countable";
import {isPlainObject} from "./helpers/is-plain-object";
import {iterate, IterateCallback} from "./helpers/iterate";
import {isIn} from "./helpers/is-in";
import {ensureTraversable} from "./helpers/ensure-traversable";
import {getAttribute} from "./helpers/get-attribute";
import {createRange} from "./helpers/create-range";
import {cloneMap} from "./helpers/clone-map";
import {parseRegex} from "./helpers/parse-regex";
import {constant} from "./helpers/constant";
import {get} from "./helpers/get";
import {include} from "./extension/core/functions/include";
import {isNullOrUndefined} from "util";
import {Location} from "./node";

type TemplateMacrosMap = Map<string, TemplateMacroHandler>;
type TemplateAliasesMap = Context<string, Template>;
type TemplateTraceableMethod<T> = (...args: Array<any>) => Promise<T>;

export type TemplateBlocksMap = Map<string, [Template, string]>;
export type TemplateBlockHandler = (context: any, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap) => Promise<void>;
export type TemplateMacroHandler = (outputBuffer: OutputBuffer, ...args: Array<any>) => Promise<string>;

/**
 * Default base class for compiled templates.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export abstract class Template {
    private readonly _environment: Environment;

    protected _source: Source;
    protected _parent: Template | false;
    protected _parents: Map<Template | string, Template>;
    protected _blocks: TemplateBlocksMap;
    protected _blockHandlers: Map<string, TemplateBlockHandler>;
    protected _macroHandlers: Map<string, TemplateMacroHandler>;
    protected _traits: TemplateBlocksMap;
    protected _macros: TemplateMacrosMap;
    protected _aliases: TemplateAliasesMap;

    constructor(environment: Environment) {
        this._environment = environment;

        this._parents = new Map();
        this._aliases = new Context();
    }

    get environment(): Environment {
        return this._environment;
    }

    protected get aliases() {
        return this._aliases;
    }

    /**
     * @returns {Source}
     */
    get source(): Source {
        return this._source;
    }

    /**
     * Returns the template name.
     *
     * @returns {string} The template name
     */
    get templateName(): string {
        return this.source.name;
    }

    get isTraitable(): boolean {
        return true;
    }

    /**
     * Returns the parent template.
     *
     * @param {any} context
     *
     * @returns {Promise<TwingTemplate|false>} The parent template or false if there is no parent
     */
    public getParent(context: any = {}): Promise<Template | false> {
        if (this._parent) {
            return Promise.resolve(this._parent);
        }

        return this.doGetParent(context)
            .then((parent) => {
                if (parent === false || parent instanceof Template) {
                    if (parent instanceof Template) {
                        this._parents.set(parent.source.name, parent);
                    }

                    return parent;
                }

                // parent is a string
                if (!this._parents.has(parent)) {
                    return this.loadTemplate(parent)
                        .then((template: Template) => {
                            this._parents.set(parent, template);

                            return template;
                        });
                } else {
                    return this._parents.get(parent);
                }
            });
    }

    /**
     * Returns template blocks.
     *
     * @returns {Promise<TemplateBlocksMap>} A map of blocks
     */
    public getBlocks(): Promise<TemplateBlocksMap> {
        if (this._blocks) {
            return Promise.resolve(this._blocks);
        } else {
            return this.getTraits().then((traits) => {
                this._blocks = merge(traits, new Map([...this._blockHandlers.keys()].map((key) => [key, [this, key]])));

                return this._blocks;
            });
        }
    }

    /**
     * Displays a block.
     *
     * @param {string} name The block name to display
     * @param {any} context The context
     * @param {OutputBuffer} outputBuffer
     * @param {TemplateBlocksMap} blocks The active set of blocks
     * @param {boolean} useBlocks Whether to use the active set of blocks
     *
     * @returns {Promise<void>}
     */
    protected displayBlock(name: string, context: any, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap, useBlocks: boolean): Promise<void> {
        return this.getBlocks().then((ownBlocks) => {
            let blockHandler: TemplateBlockHandler;

            if (useBlocks && blocks.has(name)) {
                blockHandler = blocks.get(name)[0]._blockHandlers.get(blocks.get(name)[1]);
            } else if (ownBlocks.has(name)) {
                blockHandler = ownBlocks.get(name)[0]._blockHandlers.get(ownBlocks.get(name)[1]);
            }

            if (blockHandler) {
                return blockHandler(context, outputBuffer, blocks);
            } else {
                return this.getParent(context).then((parent) => {
                    if (parent) {
                        return parent.displayBlock(name, context, outputBuffer, merge(ownBlocks, blocks), false);
                    } else if (blocks.has(name)) {
                        throw new RuntimeError(`Block "${name}" should not call parent() in "${blocks.get(name)[0].templateName}" as the block does not exist in the parent template "${this.templateName}".`, null, blocks.get(name)[0].source);
                    } else {
                        throw new RuntimeError(`Block "${name}" on template "${this.templateName}" does not exist.`, null, this.source);
                    }
                });

            }
        });
    }

    /**
     * Displays a parent block.
     *
     * @param {string} name The block name to display from the parent
     * @param {any} context The context
     * @param {OutputBuffer} outputBuffer
     * @param {TemplateBlocksMap} blocks The active set of blocks
     *
     * @returns {Promise<void>}
     */
    protected displayParentBlock(name: string, context: any, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap): Promise<void> {
        return this.getTraits().then((traits) => {
            if (traits.has(name)) {
                return traits.get(name)[0].displayBlock(traits.get(name)[1], context, outputBuffer, blocks, false);
            } else {
                return this.getParent(context).then((template) => {
                    if (template !== false) {
                        return template.displayBlock(name, context, outputBuffer, blocks, false);
                    } else {
                        throw new RuntimeError(`The template has no parent and no traits defining the "${name}" block.`, null, this.source);
                    }
                });
            }
        });
    }

    /**
     * Renders a parent block.
     *
     * @param {string} name The block name to display from the parent
     * @param {*} context The context
     * @param {OutputBuffer} outputBuffer
     * @param {TemplateBlocksMap} blocks The active set of blocks
     *
     * @returns {Promise<string>} The rendered block
     */
    protected renderParentBlock(name: string, context: any, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap): Promise<string> {
        outputBuffer.start();

        return this.getBlocks().then((blocks) => {
            return this.displayParentBlock(name, context, outputBuffer, blocks).then(() => {
                return outputBuffer.getAndClean() as string;
            })
        });
    }

    /**
     * Renders a block.
     *
     * @param {string} name The block name to display
     * @param {any} context The context
     * @param {OutputBuffer} outputBuffer
     * @param {TemplateBlocksMap} blocks The active set of blocks
     * @param {boolean} useBlocks Whether to use the active set of blocks
     *
     * @return {Promise<string>} The rendered block
     */
    protected renderBlock(name: string, context: any, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap = new Map(), useBlocks = true): Promise<string> {
        outputBuffer.start();

        return this.displayBlock(name, context, outputBuffer, blocks, useBlocks).then(() => {
            return outputBuffer.getAndClean() as string;
        });
    }

    /**
     * Returns whether a block exists or not in the active context of the template.
     *
     * This method checks blocks defined in the active template or defined in "used" traits or defined in parent templates.
     *
     * @param {string} name The block name
     * @param {any} context The context
     * @param {TemplateBlocksMap} blocks The active set of blocks
     *
     * @return {Promise<boolean>} true if the block exists, false otherwise
     */
    public hasBlock(name: string, context: any, blocks: TemplateBlocksMap = new Map()): Promise<boolean> {
        if (blocks.has(name)) {
            return Promise.resolve(true);
        } else {
            return this.getBlocks().then((blocks) => {
                if (blocks.has(name)) {
                    return Promise.resolve(true);
                } else {
                    return this.getParent(context).then((parent) => {
                        if (parent) {
                            return parent.hasBlock(name, context);
                        } else {
                            return false;
                        }
                    });
                }
            })
        }
    }

    /**
     * @param {string} name The name of the macro
     *
     * @return {Promise<boolean>}
     */
    public hasMacro(name: string): Promise<boolean> {
        // @see https://github.com/twigphp/Twig/issues/3174 as to why we don't check macro existence in parents
        return Promise.resolve(this._macroHandlers.has(name));
    }

    /**
     * @param name The name of the macro
     */
    public getMacro(name: string): Promise<TemplateMacroHandler> {
        return this.hasMacro(name).then((hasMacro) => {
            if (hasMacro) {
                return this._macroHandlers.get(name);
            } else {
                return null;
            }
        })
    }

    public loadTemplate(templates: Template | Map<number, Template> | string, location: Location = null, index: number = 0): Promise<Template> {
        let promise: Promise<Template>;

        if (typeof templates === 'string') {
            promise = this.environment.loadTemplate(templates, index, this.source);
        } else if (templates instanceof Template) {
            promise = Promise.resolve(templates);
        } else {
            promise = this.environment.resolveTemplate([...templates.values()], this.source);
        }

        return promise.catch((e: Error) => {
            if (e.location !== null) {
                throw e;
            }

            if (location) {
                // todo: create a new Error with location
                //e.setTemplateLine(location);
            }

            throw e;
        });
    }

    /**
     * Returns template traits.
     *
     * @returns {Promise<TemplateBlocksMap>} A map of traits
     */
    public getTraits(): Promise<TemplateBlocksMap> {
        if (this._traits) {
            return Promise.resolve(this._traits);
        } else {
            return this.doGetTraits().then((traits) => {
                this._traits = traits;

                return traits;
            });
        }
    }

    protected doGetTraits(): Promise<TemplateBlocksMap> {
        return Promise.resolve(new Map());
    }

    public display(context: any, blocks: TemplateBlocksMap = new Map(), outputBuffer?: OutputBuffer): Promise<void> {
        if (!outputBuffer) {
            outputBuffer = new OutputBuffer();
        }

        if (context === null) {
            throw new TypeError('Argument 1 passed to TwingTemplate::display() must be an iterator, null given');
        }

        if (!isMap(context)) {
            context = iteratorToMap(context);
        }

        context = new Context(this.environment.mergeGlobals(context));

        return this.getBlocks().then((ownBlocks) => this.displayWithErrorHandling(context, outputBuffer, merge(ownBlocks, blocks)));
    }

    protected displayWithErrorHandling(context: any, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap = new Map()): Promise<void> {
        return this.doDisplay(context, outputBuffer, blocks).catch((e) => {
            if (e instanceof Error) {
                if (!e.source) {
                    // todo: create new error
                    //e.setSourceContext(this.source);
                }
            } else {
                e = new RuntimeError(`An exception has been thrown during the rendering of a template ("${e.message}").`, null, this.source, e);
            }

            throw e;
        });
    }

    public render(context: any, outputBuffer?: OutputBuffer): Promise<string> {
        if (!outputBuffer) {
            outputBuffer = new OutputBuffer();
        }

        let level = outputBuffer.getLevel();

        outputBuffer.start();

        return this.display(context, undefined, outputBuffer)
            .then(() => {
                return outputBuffer.getAndClean() as string;
            })
            .catch((e) => {
                while (outputBuffer.getLevel() > level) {
                    outputBuffer.endAndClean();
                }

                throw e;
            })
    }

    /**
     * Auto-generated method to display the template with the given context.
     *
     * @param {any} context An array of parameters to pass to the template
     * @param {OutputBuffer} outputBuffer
     * @param {TemplateBlocksMap} blocks
     */
    protected abstract doDisplay(context: any, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap): Promise<void>;

    protected doGetParent(context: any): Promise<Template | string | false> {
        return Promise.resolve(false);
    }

    protected callMacro(template: Template, name: string, outputBuffer: OutputBuffer, location: Location, context: Context<any, any>, source: Source, ...args: any[]): Promise<string> {
        let getHandler = (template: Template): Promise<TemplateMacroHandler> => {
            if (template._macroHandlers.has(name)) {
                return Promise.resolve(template._macroHandlers.get(name));
            } else {
                return template.getParent(context).then((parent) => {
                    if (parent) {
                        return getHandler(parent);
                    } else {
                        return null;
                    }
                });
            }
        };

        return getHandler(template).then((handler) => {
            if (handler) {
                return handler(outputBuffer, args);
            } else {
                throw new RuntimeError(`Macro "${name}" is not defined in template "${template.templateName}".`, location, source);
            }
        });
    }

    public traceableMethod<T>(method: Function, location: Location, source: Source): TemplateTraceableMethod<T> {
        return function () {
            return (method.apply(null, arguments) as Promise<T>).catch((e) => {
                if (e instanceof Error) {
                    if (!e.location) {
                        // todo: create new error
                        // e.setTemplateLine(lineno);
                        // e.setSourceContext(source);
                    }
                } else {
                    throw new RuntimeError(`An exception has been thrown during the rendering of a template ("${e.message}").`, location, source, e);
                }

                throw e;
            });
        }
    }

    public traceableRenderBlock(location: Location, source: Source): TemplateTraceableMethod<string> {
        return this.traceableMethod(this.renderBlock.bind(this), location, source);
    }

    public traceableRenderParentBlock(location: Location, source: Source): TemplateTraceableMethod<string> {
        return this.traceableMethod(this.renderParentBlock.bind(this), location, source);
    }

    public traceableHasBlock(location: Location, source: Source): TemplateTraceableMethod<boolean> {
        return this.traceableMethod(this.hasBlock.bind(this), location, source);
    }

    protected concatenate(object1: any, object2: any): string {
        if (isNullOrUndefined(object1)) {
            object1 = '';
        }

        if (isNullOrUndefined(object2)) {
            object2 = '';
        }

        return String(object1) + String(object2);
    }

    protected get cloneMap(): <K, V>(m: Map<K, V>) => Map<K, V> {
        return cloneMap;
    }

    protected get compare(): (a: any, b: any) => boolean {
        return compare;
    }

    protected get constant(): (name: string, object: any) => any {
        return (name: string, object: any) => {
            return constant(this, name, object);
        }
    }

    protected get convertToMap(): (iterable: any) => Map<any, any> {
        return iteratorToMap;
    }

    protected get count(): (a: any) => number {
        return count;
    }

    protected get createRange(): (low: any, high: any, step: number) => Map<number, any> {
        return createRange;
    }

    protected get ensureTraversable(): <T>(candidate: T[]) => T[] | [] {
        return ensureTraversable;
    }

    protected get get(): (object: any, property: any) => any {
        return (object, property) => {
            if (isMap(object) || isPlainObject(object)) {
                return get(object, property);
            }
        };
    }

    protected get getAttribute(): (env: Environment, object: any, item: any, _arguments: Map<any, any>, type: string, isDefinedTest: boolean, ignoreStrictCheck: boolean, sandboxed: boolean) => any {
        return getAttribute;
    }

    protected get include(): (context: any, outputBuffer: OutputBuffer, templates: string | Map<number, string | Template> | Template, variables: any, withContext: boolean, ignoreMissing: boolean, line: number) => Promise<string> {
        return (context, outputBuffer, templates, variables, withContext, ignoreMissing, line) => {
            return include(this, context, outputBuffer, templates, variables, withContext, ignoreMissing).catch((e: Error) => {
                if (!e.location) {
                    // todo: create new error
                    // e.setTemplateLine(line);
                }

                throw e;
            });
        }
    }

    protected get isCountable(): (candidate: any) => boolean {
        return isCountable;
    }

    protected get isIn(): (a: any, b: any) => boolean {
        return isIn;
    }

    protected get iterate(): (it: any, cb: IterateCallback) => Promise<void> {
        return iterate;
    }

    protected get merge(): <V>(iterable1: Map<any, V>, iterable2: Map<any, V>) => Map<any, V> {
        return merge;
    }

    protected get parseRegExp(): (input: string) => RegExp {
        return parseRegex;
    }

    protected get Context(): typeof Context {
        return Context;
    }

    protected get Markup(): typeof Markup {
        return Markup;
    }

    protected get RuntimeError(): typeof RuntimeError {
        return RuntimeError;
    }

    protected get SandboxSecurityError(): typeof SandboxSecurityError {
        return SandboxSecurityError;
    }

    protected get SandboxSecurityNotAllowedFilterError(): typeof NotAllowedFilterSandboxSecurityError {
        return NotAllowedFilterSandboxSecurityError;
    }

    protected get SandboxSecurityNotAllowedFunctionError(): typeof NotAllowedFunctionSandboxSecurityError {
        return NotAllowedFunctionSandboxSecurityError;
    }

    protected get SandboxSecurityNotAllowedTagError(): typeof NotAllowedTagSandboxSecurityError {
        return NotAllowedTagSandboxSecurityError;
    }

    protected get Source(): typeof Source {
        return Source;
    }
}
