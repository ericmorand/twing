import {TokenParserInterface} from "./token-parser-interface";
import {Filter} from "./filter";
import {Function} from "./function";
import {NodeVisitorInterface} from "./node-visitor-interface";
import {ExtensionInterface} from "./extension-interface";
import {Test} from "./test";
import {Operator} from "./operator";
import {SourceMapNodeFactory} from "./source-map/node-factory";
import {BinaryOperator} from "./operator/binary";
import {UnaryOperator} from "./operator/unary";

export class ExtensionSet {
    private initialized: boolean = false;
    private runtimeInitialized: boolean = false;
    private visitors: NodeVisitorInterface[] = [];
    private filters: Map<string, Filter> = new Map();
    private tests: Map<string, Test> = new Map();
    private functions: Map<string, Function> = new Map();
    private _unaryOperators: Map<string, UnaryOperator> = new Map();
    private _binaryOperators: Map<string, BinaryOperator> = new Map();
    private sourceMapNodeFactories: Map<string, SourceMapNodeFactory> = new Map();

    private _tokenParsers: Map<string, TokenParserInterface> = new Map();

    readonly extensions: Map<string, ExtensionInterface>;

    constructor() {
        this.extensions = new Map();
    }

    hasExtension(name: string) {
        return this.extensions.has(name);
    }

    getExtension(name: string) {
        return this.extensions.get(name);
    }

    /**
     * Registers somes extensions.
     *
     * @param {Map<string, ExtensionInterface>} extensions
     */
    addExtensions(extensions: Map<string, ExtensionInterface>) {
        for (let [name, extension] of extensions) {
            this.addExtension(extension, name);
        }
    }

    /**
     * Returns all registered extensions.
     *
     * @return Map<string, TwingExtensionInterface>
     */
    getExtensions() {
        return this.extensions;
    }

    getSignature() {
        return JSON.stringify([...this.extensions.keys()]);
    }

    isInitialized() {
        return this.initialized || this.runtimeInitialized;
    }

    getNodeVisitors(): NodeVisitorInterface[] {
        if (!this.initialized) {
            this.initExtensions();
        }

        return this.visitors;
    }

    get tokenParsers(): Array<TokenParserInterface> {
        if (!this.initialized) {
            this.initExtensions();
        }

        return [...this._tokenParsers.values()];
    }

    /**
     * Registers an extension.
     *
     * @param {ExtensionInterface} extension A TwingExtensionInterface instance
     * @param {string} name A name the extension will be registered as
     */
    addExtension(extension: ExtensionInterface, name: string) {
        if (this.initialized) {
            throw new Error(`Unable to register extension "${name}" as extensions have already been initialized.`);
        }

        if (this.extensions.has(name)) {
            throw new Error(`Unable to register extension "${name}" as it is already registered.`);
        }

        this.extensions.set(name, extension);
    }

    addTokenParser(parser: TokenParserInterface) {
        if (this.initialized) {
            throw new Error(`Unable to add token parser "${parser.tag}" as extensions have already been initialized.`);
        }

        if (this._tokenParsers.has(parser.tag)) {
            throw new Error(`Tag "${parser.tag}" is already registered.`);
        }

        this._tokenParsers.set(parser.tag, parser);
    }

    /**
     * Gets the registered unary Operators.
     *
     * @return Map<string, TwingOperator> A map of unary operator definitions
     */
    get unaryOperators(): Map<string, UnaryOperator> {
        if (!this.initialized) {
            this.initExtensions();
        }

        return this._unaryOperators;
    }

    /**
     * Gets the registered binary Operators.
     */
    get binaryOperators(): Map<string, BinaryOperator> {
        if (!this.initialized) {
            this.initExtensions();
        }

        return this._binaryOperators;
    }

    addFunction(twingFunction: Function) {
        if (this.initialized) {
            throw new Error(`Unable to add function "${twingFunction.name}" as extensions have already been initialized.`);
        }

        if (this.functions.has(twingFunction.name)) {
            throw new Error(`Function "${twingFunction.name}" is already registered.`);
        }

        this.functions.set(twingFunction.name, twingFunction);
    }

    getFunctions() {
        if (!this.initialized) {
            this.initExtensions();
        }

        return this.functions;
    }

    /**
     * Get a function by name.
     *
     * @param {string} name The function name
     * @returns {Function} A Function instance or null if the function does not exist
     */
    getFunction(name: string): Function {
        if (!this.initialized) {
            this.initExtensions();
        }

        if (this.functions.has(name)) {
            return this.functions.get(name);
        }

        for (let [pattern, twingFunction] of this.functions) {
            let count: number = 0;

            pattern = pattern.replace(/\*/g, () => {
                count++;

                return '(.*?)';
            });

            if (count) {
                let regExp = new RegExp('^' + pattern + '$', 'g');
                let match: RegExpExecArray = regExp.exec(name);
                let matches = [];

                if (match) {
                    for (let i = 1; i <= count; i++) {
                        matches.push(match[i]);
                    }

                    twingFunction.arguments = matches;

                    return twingFunction;
                }
            }
        }

        return null;
    }

    addFilter(filter: Filter) {
        if (this.initialized) {
            throw new Error(`Unable to add filter "${filter.name}" as extensions have already been initialized.`);
        }

        if (this.filters.has(filter.name)) {
            throw new Error(`Filter "${filter.name}" is already registered.`);
        }

        this.filters.set(filter.name, filter);
    }

    getFilters(): Map<string, Filter> {
        if (!this.initialized) {
            this.initExtensions();
        }

        return this.filters;
    }

    /**
     * Get a filter by name.
     *
     * @param {string} name The filter name
     *
     * @return {Filter|false} A TwingFilter instance or false if the filter does not exist
     */
    getFilter(name: string): Filter {
        if (!this.initialized) {
            this.initExtensions();
        }

        if (this.filters.has(name)) {
            return this.filters.get(name);
        }

        for (let [pattern, filter] of this.filters) {
            let count: number = 0;

            pattern = pattern.replace(/\*/g, () => {
                count++;

                return '(.*?)';
            });

            if (count) {
                let regExp = new RegExp('^' + pattern + '$', 'g');
                let match: RegExpExecArray = regExp.exec(name);
                let matches = [];

                if (match) {
                    for (let i = 1; i <= count; i++) {
                        matches.push(match[i]);
                    }

                    filter.arguments = matches;

                    return filter;
                }
            }
        }

        return null;
    }

    addNodeVisitor(visitor: NodeVisitorInterface) {
        if (this.initialized) {
            throw new Error('Unable to add a node visitor as extensions have already been initialized.');
        }

        this.visitors.push(visitor);
    }

    addTest(test: Test) {
        if (this.initialized) {
            throw new Error(`Unable to add test "${test.name}" as extensions have already been initialized.`);
        }

        if (this.tests.has(test.name)) {
            throw new Error(`Test "${test.name}" is already registered.`);
        }

        this.tests.set(test.name, test);
    }

    /**
     *
     * @returns {Map<string, Test>}
     */
    getTests() {
        if (!this.initialized) {
            this.initExtensions();
        }

        return this.tests;
    }

    /**
     * Gets a test by name.
     *
     * @param {string} name The test name
     * @returns {Test} A TwingTest instance or null if the test does not exist
     */
    getTest(name: string): Test {
        if (!this.initialized) {
            this.initExtensions();
        }

        if (this.tests.has(name)) {
            return this.tests.get(name);
        }

        for (let [pattern, test] of this.tests) {
            let count: number = 0;

            pattern = pattern.replace(/\*/g, () => {
                count++;

                return '(.*?)';
            });

            if (count) {
                let regExp = new RegExp('^' + pattern + '$', 'g');
                let match: RegExpExecArray = regExp.exec(name);
                let matches = [];

                if (match) {
                    for (let i = 1; i <= count; i++) {
                        matches.push(match[i]);
                    }

                    test.arguments = matches;

                    return test;
                }
            }
        }

        return null;
    }

    addOperator(operator: Operator<any>) {
        if (this.initialized) {
            throw new Error(`Unable to add operator "${operator.name}" as extensions have already been initialized.`);
        }

        let bucket: Map<string, Operator<any>>;

        if (operator instanceof UnaryOperator) {
            bucket = this._unaryOperators;
        } else {
            bucket = this._binaryOperators;
        }

        if (bucket.has(operator.name)) {
            throw new Error(`Operator "${operator.name}" is already registered.`);
        }

        bucket.set(operator.name, operator);
    }

    addSourceMapNodeFactory(factory: SourceMapNodeFactory, name: string) {
        if (this.initialized) {
            throw new Error(`Unable to add source-map node factory "${name}" as extensions have already been initialized.`);
        }

        if (this.sourceMapNodeFactories.has(name)) {
            throw new Error(`Source-map node factory "${name}" is already registered.`);
        }

        this.sourceMapNodeFactories.set(name, factory);
    }

    /**
     * @return Map<TwingNodeType, TwingSourceMapNodeFactory>
     */
    getSourceMapNodeFactories(): Map<string, SourceMapNodeFactory> {
        if (!this.initialized) {
            this.initExtensions();
        }

        return this.sourceMapNodeFactories;
    }

    /**
     * @param nodeType
     *
     * @return SourceMapNodeFactory | null
     */
    getSourceMapNodeFactory(nodeType: string) {
        return this.sourceMapNodeFactories.has(nodeType) ? this.sourceMapNodeFactories.get(nodeType) : null;
    }

    protected initExtensions() {
        for (let extension of this.extensions.values()) {
            this.initExtension(extension);
        }

        this.initialized = true;
    }

    protected initExtension(extension: ExtensionInterface) {
        // filters
        for (let filter of extension.getFilters()) {
            this.addFilter(filter);
        }

        // functions
        for (let function_ of extension.getFunctions()) {
            this.addFunction(function_);
        }

        // tests
        for (let test of extension.getTests()) {
            this.addTest(test);
        }

        // operators
        for (let operator of extension.getOperators()) {
            this.addOperator(operator);
        }

        // token parsers
        for (let parser of extension.getTokenParsers()) {
            this.addTokenParser(parser);
        }

        // node visitors
        for (let visitor of extension.getNodeVisitors()) {
            this.addNodeVisitor(visitor);
        }

        // source-map node constructors
        let factories = extension.getSourceMapNodeFactories();

        for (let [name, factory] of factories) {
            this.addSourceMapNodeFactory(factory, name);
        }
    }
}
