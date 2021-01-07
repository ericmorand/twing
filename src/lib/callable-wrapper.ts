import {TwingError} from "./error";
import {TwingSource} from "./source";
import {TwingNode} from "./node";
import {TwingNodeExpressionConstant} from "./node/expression/constant";
import {TwingNodeExpression} from "./node/expression";

export type TwingCallable<T> = (...args: any[]) => Promise<T>;

export type TwingCallableArgument = {
    name: string,
    defaultValue?: any
};

export type CallableWrapperExpressionFactory = (node: TwingNode, name: string, callableArguments: TwingNode, line: number, column: number) => TwingNodeExpression;

export type TwingCallableWrapperOptions = {
    needs_template?: boolean;
    needs_context?: boolean;
    needs_output_buffer?: boolean;
    is_variadic?: boolean;
    is_safe?: Array<any>;
    is_safe_callback?: Function;
    deprecated?: boolean | string;
    alternative?: string;
    expression_factory?: CallableWrapperExpressionFactory;
}

export abstract class TwingCallableWrapper<T> {
    readonly name: string;
    readonly callable: TwingCallable<T>;
    readonly acceptedArguments: TwingCallableArgument[];
    readonly options: TwingCallableWrapperOptions;

    protected _arguments: Array<any> = [];

    protected constructor(name: string, callable: TwingCallable<any>, acceptedArguments: TwingCallableArgument[], options: TwingCallableWrapperOptions = {}) {
        this.name = name;
        this.callable = callable;
        this.acceptedArguments = acceptedArguments;

        this.options = Object.assign({}, {
            needs_template: false,
            needs_context: false,
            needs_output_buffer: false,
            is_variadic: false,
            is_safe: null,
            is_safe_callback: null,
            deprecated: false,
            alternative: null
        }, options);
    }

    getName() {
        return this.name;
    }

    /**
     * @returns {Function}
     */
    getCallable() {
        return this.callable;
    }

    /**
     * @return TwingCallableArgument[]
     */
    getAcceptedArgments(): TwingCallableArgument[] {
        return this.acceptedArguments;
    }

    /**
     * Returns the traceable callable.
     *
     * @param {number} lineno
     * @param {TwingSource} source
     *
     * @return {TwingCallable<T>}
     */
    traceableCallable(lineno: number, source: TwingSource): TwingCallable<T> {
        let callable = this.callable;

        return function () {
            return (callable.apply(null, arguments) as Promise<T>).catch((e: TwingError) => {
                if (e.getTemplateLine() === -1) {
                    e.setTemplateLine(lineno);
                    e.setSourceContext(source);
                }

                throw e;
            });
        }
    }

    get isVariadic(): boolean {
        return this.options.is_variadic;
    }

    get isDeprecated(): boolean {
        return this.options.deprecated ? true : false;
    }

    get needsTemplate(): boolean {
        return this.options.needs_template;
    }

    get needsContext(): boolean {
        return this.options.needs_context;
    }

    get needsOutputBuffer(): boolean {
        return this.options.needs_output_buffer;
    }

    get deprecatedVersion() {
        return this.options.deprecated;
    }

    get alternative() {
        return this.options.alternative;
    }

    set arguments(value: Array<any>) {
        this._arguments = value;
    }

    get arguments() {
        return this._arguments;
    }

    get expressionFactory(): CallableWrapperExpressionFactory {
        return this.options.expression_factory;
    }

    isSafe(functionArgs: TwingNode): any[] {
        if (this.options.is_safe !== null) {
            return this.options.is_safe;
        }

        if (this.options.is_safe_callback) {
            return this.options.is_safe_callback(functionArgs);
        }

        return [];
    }
}
