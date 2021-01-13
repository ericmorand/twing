import {Error} from "./error";
import {Source} from "./source";
import {Node} from "./node";
import {ExpressionNode} from "./node/expression";

import type {Location} from "./node";
import {HashExpressionNode} from "./node/expression/hash";

export type Callable<T> = (...args: any[]) => Promise<T>;

export type CallableArgument = {
    name: string,
    defaultValue?: any
};

export type CallableWrapperExpressionFactory = (node: Node, name: string, callableArguments: HashExpressionNode, location: Location) => ExpressionNode<any>;

export type CallableWrapperOptions = {
    needsTemplate?: boolean;
    needsContext?: boolean;
    needsOutputBuffer?: boolean;
    isVariadic?: boolean;
    isSafe?: Array<any>;
    isSafeCallback?: Function;
    deprecated?: boolean | string;
    alternative?: string;
    expressionFactory?: CallableWrapperExpressionFactory;
}

export abstract class CallableWrapper<T, O extends CallableWrapperOptions> {
    private readonly _name: string;
    private readonly _callable: Callable<T>;
    private readonly _acceptedArguments: CallableArgument[];
    private readonly _options: O;

    protected _arguments: Array<number> = [];

    protected constructor(name: string, callable: Callable<any>, acceptedArguments: CallableArgument[], options: O) {
        this._name = name;
        this._callable = callable;
        this._acceptedArguments = acceptedArguments;

        this._options = Object.assign({}, {
            needsTemplate: false,
            needsContext: false,
            needsOutputBuffer: false,
            isVariadic: false,
            isSafe: null,
            isSafeCallback: null,
            deprecated: false,
            alternative: null
        }, options);
    }

    get name(): string {
        return this._name;
    }

    get callable(): Callable<T> {
        return this._callable;
    }

    get acceptedArguments(): CallableArgument[] {
        return this._acceptedArguments;
    }

    get options(): O {
        return this._options;
    }

    traceableCallable(location: Location, source: Source): Callable<T> {
        let callable = this._callable;

        return function () {
            return (callable.apply(null, arguments) as Promise<T>).catch((e: Error) => {
                if (!e.location) {
                    e = new Error(e.message, location, source, e.previous);
                }

                throw e;
            });
        }
    }

    get isVariadic(): boolean {
        return this._options.isVariadic;
    }

    get isDeprecated(): boolean {
        return this._options.deprecated ? true : false;
    }

    get needsTemplate(): boolean {
        return this._options.needsTemplate;
    }

    get needsContext(): boolean {
        return this._options.needsContext;
    }

    get needsOutputBuffer(): boolean {
        return this._options.needsOutputBuffer;
    }

    get deprecatedVersion() {
        return this._options.deprecated;
    }

    get alternative() {
        return this._options.alternative;
    }

    set arguments(value: Array<any>) {
        this._arguments = value;
    }

    get arguments() {
        return this._arguments;
    }

    get expressionFactory(): CallableWrapperExpressionFactory {
        return this._options.expressionFactory;
    }

    isSafe(functionArgs: Node): any[] {
        if (this._options.isSafe !== null) {
            return this._options.isSafe;
        }

        if (this._options.isSafeCallback) {
            return this._options.isSafeCallback(functionArgs);
        }

        return [];
    }
}
