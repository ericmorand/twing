import {TokenParserInterface} from "./token-parser-interface";
import {NodeVisitorInterface} from "./node-visitor-interface";
import {ExtensionSet} from "./extension-set";
import {CoreExtension} from "./extension/core";
import {ExtensionInterface} from "./extension-interface";
import {Filter} from "./filter";
import {Lexer} from "./lexer";
import {Parser} from "./parser";
import {TokenStream} from "./token-stream";
import {Source} from "./source";
import {LoaderInterface} from "./loader-interface";
import {LoaderError} from "./error/loader";
import {Test} from "./test";
import {Function} from "./function";
import {SyntaxError} from "./error/syntax";
import {Template} from "./template";
import {Error} from "./error";
import {CacheInterface} from "./cache-interface";
import {Compiler} from "./compiler";
import {ModuleNode} from "./node/module";
import {NullCache} from "./cache/null";
import {RuntimeError} from "./error/runtime";
import {EventEmitter} from 'events';
import {OutputBuffer} from "./output-buffer";
import {SourceMapNode} from "./source-map/node";
import {Operator} from "./operator";
import {SandboxSecurityPolicy} from "./sandbox/security-policy";
import {SandboxSecurityPolicyInterface} from "./sandbox/security-policy-interface";
import {EnvironmentOptions} from "./environment-options";
import {SourceMapNodeFactory} from "./source-map/node-factory";
import {NativeError} from "./native-error";
import {NativeFunction} from "./native-function";
import {UnaryOperator} from "./operator/unary";
import {BinaryOperator} from "./operator/binary";
import {Node} from "./node";

const path = require('path');
const sha256 = require('crypto-js/sha256');
const hex = require('crypto-js/enc-hex');

export type TemplateConstructor = new(e: Environment) => Template;
export type TemplatesModule = (T: typeof Template) => Map<number, TemplateConstructor>;
export type EscapingStrategyResolver = (name: string) => string | false;

export const VERSION: string = '__VERSION__';

/**
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export abstract class Environment extends EventEmitter {
    private charset: string;
    private loader: LoaderInterface = null;
    private debug: boolean;
    private autoReload: boolean;
    private cache: CacheInterface;
    private lexer: Lexer;
    private parser: Parser;
    private globals: Map<any, any> = new Map();
    private loadedTemplates: Map<string, Template> = new Map();
    private strictVariables: boolean;
    private originalCache: CacheInterface | string | false;
    private extensionSet: ExtensionSet = null;
    private optionsHash: string;
    private sourceMapNode: SourceMapNode;
    private sourceMap: boolean;
    private autoescape: string | false | EscapingStrategyResolver;
    private coreExtension: CoreExtension;
    private sandboxed: boolean;
    private sandboxPolicy: SandboxSecurityPolicyInterface;

    /**
     * Constructor.
     *
     * @param {LoaderInterface} loader
     * @param {EnvironmentOptions} options
     */
    constructor(loader: LoaderInterface, options: EnvironmentOptions = null) {
        super();

        this.setLoader(loader);

        options = Object.assign({}, {
            debug: false,
            charset: 'UTF-8',
            strict_variables: false,
            autoescape: 'html',
            cache: false,
            auto_reload: null,
            source_map: false,
            sandbox_policy: new SandboxSecurityPolicy([], [], new Map(), new Map(), []),
            sandboxed: false
        }, options);

        this.debug = options.debug;
        this.setCharset(options.charset);
        this.autoReload = options.auto_reload === null ? this.debug : options.auto_reload;
        this.strictVariables = options.strict_variables;
        this.setCache(options.cache);
        this.extensionSet = new ExtensionSet();
        this.sourceMap = options.source_map;
        this.autoescape = options.autoescape;
        this.sandboxed = options.sandboxed;
        this.sandboxPolicy = options.sandbox_policy;

        this.setCoreExtension(new CoreExtension(options.autoescape));
    }

    getCoreExtension(): CoreExtension {
        return this.coreExtension;
    }

    setCoreExtension(extension: CoreExtension) {
        // todo: remove any
        this.addExtension(extension as any, 'TwingExtensionCore');

        this.coreExtension = extension;
    }

    /**
     * Enables debugging mode.
     */
    enableDebug() {
        this.debug = true;
        this.updateOptionsHash();
    }

    /**
     * Disables debugging mode.
     */
    disableDebug() {
        this.debug = false;
        this.updateOptionsHash();
    }

    /**
     * Checks if debug mode is enabled.
     *
     * @return {boolean} true if debug mode is enabled, false otherwise
     */
    isDebug() {
        return this.debug;
    }

    /**
     * Enables the auto_reload option.
     */
    enableAutoReload() {
        this.autoReload = true;
    }

    /**
     * Disables the auto_reload option.
     */
    disableAutoReload() {
        this.autoReload = false;
    }

    /**
     * Checks if the auto_reload option is enabled.
     *
     * @return {boolean} true if auto_reload is enabled, false otherwise
     */
    isAutoReload() {
        return this.autoReload;
    }

    /**
     * Enables the strict_variables option.
     */
    enableStrictVariables() {
        this.strictVariables = true;
        this.updateOptionsHash();
    }

    /**
     * Disables the strict_variables option.
     */
    disableStrictVariables() {
        this.strictVariables = false;
        this.updateOptionsHash();
    }

    /**
     * Checks if the strict_variables option is enabled.
     *
     * @return {boolean} true if strict_variables is enabled, false otherwise
     */
    isStrictVariables() {
        return this.strictVariables;
    }

    /**
     * Gets the active cache implementation.
     *
     * @param {boolean} original Whether to return the original cache option or the real cache instance
     *
     * @return {CacheInterface|string|false} A TwingCacheInterface implementation, an absolute path to the compiled templates or false to disable cache
     */
    getCache(original: boolean = true): CacheInterface | string | false {
        return original ? this.originalCache : this.cache;
    }

    /**
     * Sets the active cache implementation.
     *
     * @param {CacheInterface|string|false} cache A TwingCacheInterface implementation, a string or false to disable cache
     */
    setCache(cache: CacheInterface | string | false) {
        if (typeof cache === 'string') {
            this.originalCache = cache;
            this.cache = this.cacheFromString(cache);
        } else if (cache === false) {
            this.originalCache = cache;
            this.cache = new NullCache();
        } else {
            this.originalCache = this.cache = cache;
        }
    }

    protected abstract cacheFromString(cache: string): CacheInterface;

    protected get templateConstructor(): typeof Template {
        return Template;
    }

    /**
     * Gets the template class associated with the given string.
     *
     * The generated template class is based on the following parameters:
     *
     *  * The cache key for the given template;
     *  * The currently enabled extensions;
     *  * Twing version;
     *  * Options with what environment was created.
     *
     * @param {string} name The name for which to calculate the template class name
     * @param {number} index The index of the template
     * @param {Source} from The source that initiated the template loading
     *
     * @return {Promise<string>} The template hash
     */
    getTemplateHash(name: string, index: number = 0, from: Source = null): Promise<string> {
        return this.getLoader().getCacheKey(name, from).then((key) => {
            key += this.optionsHash;

            return hex.stringify(sha256(key)) + (index === 0 ? '' : '_' + index);
        });
    }

    /**
     * Checks if the source_map option is enabled.
     *
     * @return {boolean} true if source_map is enabled, false otherwise
     */
    isSourceMap() {
        return this.sourceMap;
    }

    /**
     * Renders a template.
     *
     * @param {string} name The template name
     * @param {{}} context An array of parameters to pass to the template
     * @return {Promise<string>}
     */
    render(name: string, context: any = {}): Promise<string> {
        return this.loadTemplate(name).then((template) => template.render(context));
    }

    /**
     * Displays a template.
     *
     * @param {string} name The template name
     * @param {{}} context An array of parameters to pass to the template
     * @return {Promise<void>}
     *
     * @throws LoaderError  When the template cannot be found
     * @throws SyntaxError  When an error occurred during compilation
     * @throws RuntimeError When an error occurred during rendering
     */
    display(name: string, context: any = {}): Promise<void> {
        return this.loadTemplate(name).then((template) => template.display(context));
    }

    /**
     * Loads a template.
     *
     * @param {string | Template} name The template name
     *
     * @throws {LoaderError}  When the template cannot be found
     * @throws {RuntimeError} When a previously generated cache is corrupted
     * @throws {SyntaxError}  When an error occurred during compilation
     *
     * @return {Promise<Template>}
     */
    load(name: string | Template): Promise<Template> {
        if (name instanceof Template) {
            return Promise.resolve(name);
        }

        return this.loadTemplate(name);
    }

    /**
     * Register a template under an arbitrary name.
     *
     * @param {Template} template The template to register
     * @param {string} name The name of the template
     */
    protected registerTemplate(template: Template, name: string): void {
        this.loadedTemplates.set(name, template);
    }

    /**
     * Register a templates module under an arbitrary name.
     *
     * @param {TemplatesModule} module
     * @param {string} name
     */
    registerTemplatesModule(module: TemplatesModule, name: string) {
        let templates = module(this.templateConstructor);

        for (let [index, constructor] of templates) {
            let template = new constructor(this);
            this.registerTemplate(template, name + (index !== 0 ? '_' + index : ''));
        }
    }

    /**
     * Loads a template internal representation.
     *
     * @param {string} name The template name
     * @param {number} index The index of the template
     * @param {Source} from The source that initiated the template loading
     *
     * @return {Promise<Template>} A template instance representing the given template name
     *
     * @throws {LoaderError}  When the template cannot be found
     * @throws {RuntimeError} When a previously generated cache is corrupted
     * @throws {SyntaxError}  When an error occurred during compilation
     */
    loadTemplate(name: string, index: number = 0, from: Source = null): Promise<Template> {
        this.emit('template', name, from);

        let cacheKey: string = name + (index !== 0 ? '_' + index : '');

        if (this.loadedTemplates.has(cacheKey)) {
            return Promise.resolve(this.loadedTemplates.get(cacheKey));
        }

        let hashesPromises: Array<Promise<string>> = [
            this.getTemplateHash(name, 0, from),
            this.getTemplateHash(name, index, from)
        ];

        return Promise.all(hashesPromises).then(([mainTemplateHash, templateHash]) => {
            if (this.loadedTemplates.has(templateHash)) {
                return Promise.resolve(this.loadedTemplates.get(templateHash));
            } else {
                let cache = this.cache;

                return cache.generateKey(name, mainTemplateHash).then((cacheKey) => {
                    return cache.getTimestamp(cacheKey).then((timestamp) => {
                        let templateConstructor = this.templateConstructor;

                        let resolveTemplateConstructorsFromCache = (): Promise<Map<number, TemplateConstructor>> => {
                            let loadFromCache = () => cache.load(cacheKey).then((templatesModule) => templatesModule(templateConstructor));

                            if (!this.isAutoReload()) {
                                return loadFromCache();
                            } else {
                                return this.getLoader().isFresh(name, timestamp, from).then((fresh) => {
                                    if (fresh) {
                                        return loadFromCache();
                                    } else {
                                        return Promise.resolve(new Map());
                                    }
                                });
                            }
                        };

                        let resolveMainTemplateFromTemplateConstructors = (templates: Map<number, TemplateConstructor>): Promise<Template> => {
                            let mainTemplate: Template;

                            let promises: Array<Promise<void>> = [];

                            for (let [index, constructor] of templates) {
                                let template = new constructor(this);

                                if (index === 0) {
                                    mainTemplate = template;
                                }

                                promises.push(this.getTemplateHash(name, index, from).then((hash) => {
                                    this.registerTemplate(template, hash);
                                }));
                            }

                            return Promise.all(promises).then(() => Promise.resolve(mainTemplate));
                        };

                        return resolveTemplateConstructorsFromCache().then((templates) => {
                            if (!templates.has(index)) {
                                return this.getLoader().getSourceContext(name, from).then((source) => {
                                    let content = this.compileSource(source);

                                    return cache.write(cacheKey, content).then(() => {
                                        return cache.load(cacheKey).then((templatesModule) => {
                                            templates = templatesModule(templateConstructor);

                                            if (!templates.has(index)) {
                                                let templatesModule = this.getTemplatesModule(content);

                                                templates = templatesModule(templateConstructor);
                                            }

                                            return resolveMainTemplateFromTemplateConstructors(templates);
                                        });
                                    });
                                });
                            } else {
                                return resolveMainTemplateFromTemplateConstructors(templates);
                            }
                        })
                    });
                });
            }
        });
    }

    /**
     * Creates a template from source.
     *
     * This method should not be used as a generic way to load templates.
     *
     * @param {string} template The template name
     * @param {string} name An optional name for the template to be used in error messages
     *
     * @return {Promise<Template>} A template instance representing the given template name
     *
     * @throws LoaderError When the template cannot be found
     * @throws SyntaxError When an error occurred during compilation
     */
    createTemplate(template: string, name: string = null): Promise<Template> {
        let hash: string = hex.stringify(sha256(template));

        if (name !== null) {
            name = `${name} (string template ${hash})`;
        } else {
            name = `__string_template__${hash}`;
        }

        let templatesModule = this.getTemplatesModule(this.compileSource(new Source(template, name)));

        this.registerTemplatesModule(templatesModule, name);

        return this.loadTemplate(name);
    }

    /**
     * Tries to load templates consecutively from an array.
     *
     * Similar to loadTemplate() but it also accepts instances of TwingTemplate and an array of templates where each is tried to be loaded.
     *
     * @param {string|Template|Array<string|Template>} names A template or an array of templates to try consecutively
     * @param {Source} from The source of the template that initiated the resolving.
     *
     * @return {Promise<Template>}
     *
     * @throws {LoaderError} When none of the templates can be found
     * @throws {SyntaxError} When an error occurred during compilation
     */
    resolveTemplate(names: string | Template | Array<string | Template>, from: Source): Promise<Template> {
        let namesArray: Array<any>;

        if (!Array.isArray(names)) {
            namesArray = [names];
        } else {
            namesArray = names;
        }

        let error: LoaderError = null;

        let loadTemplateAtIndex = (index: number): Promise<Template> => {
            if (index < namesArray.length) {
                let name = namesArray[index];

                if (name instanceof Template) {
                    return Promise.resolve(name);
                } else {
                    return this.loadTemplate(name, 0, from).catch((e) => {
                        if (e instanceof LoaderError) {
                            error = e;

                            return loadTemplateAtIndex(index + 1);
                        } else {
                            throw e;
                        }
                    });
                }
            } else {
                if (namesArray.length === 1) {
                    throw error;
                } else {
                    throw new LoaderError(`Unable to find one of the following templates: "${namesArray.join(', ')}".`, null, from);
                }
            }
        };

        return loadTemplateAtIndex(0);
    }

    setLexer(lexer: Lexer) {
        this.lexer = lexer;
    }

    /**
     * Tokenizes a source code.
     *
     * @param {Source} source The source to tokenize
     * @return {TokenStream}
     *
     * @throws {SyntaxError} When the code is syntactically wrong
     */
    tokenize(source: Source): TokenStream {
        if (!this.lexer) {
            this.lexer = new Lexer(this);
        }

        let stream = this.lexer.tokenizeSource(source);

        return new TokenStream(stream.toAst(), stream.source);
    }

    setParser(parser: Parser) {
        this.parser = parser;
    }

    /**
     * Converts a token list to a module.
     *
     * @param {TokenStream} stream
     * @return {Node}
     *
     * @throws {SyntaxError} When the token stream is syntactically or semantically wrong
     */
    parse(stream: TokenStream): Node {
        if (!this.parser) {
            this.parser = new Parser(this);
        }

        return this.parser.parse(stream);
    }

    /**
     * Compiles a module node.
     *
     * @return {string}
     */
    compile(node: Node) {
        let compiler = new Compiler(this);

        return compiler.compile(node).getSource();
    }

    /**
     * @param {Source} source
     *
     * @return {Map<number, Template> }
     */
    compileSource(source: Source): string {
        try {
            return this.compile(this.parse(this.tokenize(source)));
        } catch (e) {
            if (e instanceof Error) {
                // todo
                // if (!e.getSourceContext()) {
                //     e.setSourceContext(source);
                // }

                throw e;
            } else {
                throw new SyntaxError(`An exception has been thrown during the compilation of a template ("${e.message}").`, null, null, source);
            }
        }
    }

    /**
     * @return {TemplatesModule}
     */
    private getTemplatesModule(content: string): TemplatesModule {
        let resolver = new NativeFunction(`let module = {
    exports: undefined
};

${content}

return module.exports;

`);

        return resolver();
    }

    setLoader(loader: LoaderInterface) {
        this.loader = loader;
    }

    /**
     * Gets the Loader instance.
     *
     * @return LoaderInterface
     */
    getLoader() {
        return this.loader;
    }

    /**
     * Sets the default template charset.
     *
     * @param {string} charset The default charset
     */
    setCharset(charset: string) {
        this.charset = charset;
    }

    /**
     * Gets the default template charset.
     *
     * @return {string} The default charset
     */
    getCharset() {
        return this.charset;
    }

    /**
     * Returns true if the given extension is registered.
     *
     * @param {string} name
     * @return {boolean}
     */
    hasExtension(name: string) {
        return this.extensionSet.hasExtension(name);
    }

    /**
     * Gets an extension by name.
     *
     * @param {string} name
     * @return {ExtensionInterface}
     */
    getExtension(name: string) {
        return this.extensionSet.getExtension(name);
    }

    /**
     *
     * @param {ExtensionInterface} extension
     * @param {string} name A name the extension will be registered as
     */
    addExtension(extension: ExtensionInterface, name: string) {
        this.extensionSet.addExtension(extension, name);
        this.updateOptionsHash();
    }

    /**
     * Registers some extensions.
     *
     * @param {Map<string, ExtensionInterface>} extensions
     */
    addExtensions(extensions: Map<string, ExtensionInterface>) {
        this.extensionSet.addExtensions(extensions);
        this.updateOptionsHash();
    }

    /**
     * Returns all registered extensions.
     *
     * @return Map<string, TwingExtensionInterface>
     */
    getExtensions() {
        return this.extensionSet.getExtensions();
    }

    addTokenParser(parser: TokenParserInterface) {
        this.extensionSet.addTokenParser(parser);
    }

    /**
     * Gets the registered Token Parsers.
     *
     * @internal
     */
    get tokenParsers() {
        return this.extensionSet.tokenParsers;
    }

    /**
     * Gets registered tags.
     *
     * @return Map<string, TwingTokenParserInterface>
     *
     * @internal
     */
    getTags(): Map<string, TokenParserInterface> {
        let tags = new Map();

        this.tokenParsers.forEach(function (parser) {
            tags.set(parser.tag, parser);
        });

        return tags;
    }

    addNodeVisitor(visitor: NodeVisitorInterface) {
        this.extensionSet.addNodeVisitor(visitor);
    }

    /**
     * Gets the registered Node Visitors.
     *
     * @return {Array<NodeVisitorInterface>}
     *
     * @internal
     */
    getNodeVisitors() {
        return this.extensionSet.getNodeVisitors();
    }

    addFilter(filter: Filter) {
        this.extensionSet.addFilter(filter);
    }

    /**
     * Get a filter by name.
     *
     * @param {string} name
     *
     * @return Twig_Filter|false A Twig_Filter instance or null if the filter does not exist
     */
    getFilter(name: string): Filter {
        return this.extensionSet.getFilter(name);
    }

    /**
     * Gets the registered Filters.
     *
     * Be warned that this method cannot return filters defined with registerUndefinedFilterCallback.
     *
     * @return Twig_Filter[]
     *
     * @see registerUndefinedFilterCallback
     *
     * @internal
     */
    getFilters(): Map<string, Filter> {
        return this.extensionSet.getFilters();
    }

    /**
     * Registers a Test.
     *
     * @param {Test} test
     */
    addTest(test: Test) {
        this.extensionSet.addTest(test);
    }

    /**
     * Gets the registered Tests.
     *
     * @return {Map<string, Test>}
     */
    getTests() {
        return this.extensionSet.getTests();
    }

    /**
     * Gets a test by name.
     *
     * @param {string} name The test name
     * @return {Test} A TwingTest instance or null if the test does not exist
     */
    getTest(name: string): Test {
        return this.extensionSet.getTest(name);
    }

    addFunction(aFunction: Function) {
        this.extensionSet.addFunction(aFunction);
    }

    /**
     * Get a function by name.
     *
     * Subclasses may override this method and load functions differently;
     * so no list of functions is available.
     *
     * @param {string} name function name
     *
     * @return {Function} A TwingFunction instance or null if the function does not exist
     *
     * @internal
     */
    getFunction(name: string) {
        return this.extensionSet.getFunction(name);
    }

    /**
     * Gets registered functions.
     *
     * Be warned that this method cannot return functions defined with registerUndefinedFunctionCallback.
     *
     * @return Twig_Function[]
     *
     * @see registerUndefinedFunctionCallback
     *
     * @internal
     */
    getFunctions() {
        return this.extensionSet.getFunctions();
    }

    /**
     * @param nodeType
     *
     * @return SourceMapNodeFactory
     */
    getSourceMapNodeFactory(nodeType: string) {
        return this.extensionSet.getSourceMapNodeFactory(nodeType);
    }

    /**
     * @return Map<string, TwingSourceMapNodeFactory>
     */
    getSourceMapNodeFactories(): Map<string, SourceMapNodeFactory> {
        return this.extensionSet.getSourceMapNodeFactories();
    }

    /**
     * Registers a Global.
     *
     * New globals can be added before compiling or rendering a template, but after, you can only update existing globals.
     *
     * @param {string} name The global name
     * @param {*} value The global value
     */
    addGlobal(name: string, value: any) {
        if (this.extensionSet.isInitialized() && !this.getGlobals().has(name)) {
            throw new NativeError(`Unable to add global "${name}" as the extensions have already been initialized.`);
        }

        this.globals.set(name, value);
    }

    /**
     * Gets the registered Globals.
     *
     * @return Map<any, any> A map of globals
     */
    getGlobals(): Map<any, any> {
        return this.globals;
    }

    /**
     * Merges a context with the defined globals.
     *
     * @param {Map<*, *>} context
     * @return {Map<*, *>}
     */
    mergeGlobals(context: Map<any, any>) {
        for (let [key, value] of this.getGlobals()) {
            if (!context.has(key)) {
                context.set(key, value);
            }
        }

        return context;
    }

    /**
     * Gets the registered unary Operators.
     */
    get unaryOperators(): Map<string, UnaryOperator> {
        return this.extensionSet.unaryOperators;
    }

    /**
     * Gets the registered binary Operators.
     */
    get binaryOperators(): Map<string, BinaryOperator> {
        return this.extensionSet.binaryOperators;
    }

    updateOptionsHash() {
        this.optionsHash = [
            this.extensionSet.getSignature(),
            VERSION,
            this.debug,
            this.strictVariables,
            this.sourceMap,
            typeof this.autoescape === 'function' ? 'function' : this.autoescape
        ].join(':');
    }

    /**
     * @param {number} line 0-based
     * @param {number} column 1-based
     * @param {string} nodeTag
     * @param {Source} source
     * @param {OutputBuffer} outputBuffer
     */
    enterSourceMapBlock(line: number, column: number, nodeTag: string, source: Source, outputBuffer: OutputBuffer) {
        outputBuffer.start();

        let sourceName = source.resolvedName;

        if (path.isAbsolute(sourceName)) {
            sourceName = path.relative('.', sourceName);
        }

        source = new Source(source.content, sourceName);

        let factory = this.getSourceMapNodeFactory(nodeTag);

        if (!factory) {
            factory = new SourceMapNodeFactory();
        }

        let node = factory.create(line, column - 1, source, nodeTag);

        if (this.sourceMapNode) {
            this.sourceMapNode.addChild(node);
        }

        this.sourceMapNode = node;
    }

    /**
     * @param {OutputBuffer} outputBuffer
     */
    leaveSourceMapBlock(outputBuffer: OutputBuffer) {
        this.sourceMapNode.content = outputBuffer.getAndFlush() as string;

        let parent = this.sourceMapNode.parent;

        if (parent) {
            this.sourceMapNode = parent;
        }
    }

    getSourceMap(): string {
        let sourceMap: string = null;

        if (this.isSourceMap() && this.sourceMapNode) {
            let sourceNode = this.sourceMapNode.toSourceNode();

            let codeAndMap = sourceNode.toStringWithSourceMap();

            sourceMap = codeAndMap.map.toString();
        }

        return sourceMap;
    }

    enableSandbox() {
        this.sandboxed = true;
    }

    disableSandbox() {
        this.sandboxed = false;
    }

    isSandboxed() {
        return this.sandboxed;
    }

    checkSecurity(tags: string[], filters: string[], functions: string[]) {
        if (this.isSandboxed()) {
            this.sandboxPolicy.checkSecurity(tags, filters, functions);
        }
    }

    checkMethodAllowed(obj: any, method: string) {
        if (this.isSandboxed()) {
            this.sandboxPolicy.checkMethodAllowed(obj, method);
        }
    }

    checkPropertyAllowed(obj: any, property: string) {
        if (this.isSandboxed()) {
            this.sandboxPolicy.checkPropertyAllowed(obj, property);
        }
    }

    ensureToStringAllowed(obj: any) {
        if (this.isSandboxed() && typeof obj === 'object') {
            this.sandboxPolicy.checkMethodAllowed(obj, 'toString');
        }

        return obj;
    }
}
