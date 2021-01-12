import {Error} from "./error";
import {Source} from "./source";
import {Node} from "./node";
import {ExpressionNode} from "./node/expression";

import type {Location} from "./node";

export type Callable<T> = (...args: any[]) => Promise<T>;

export type CallableArgument = {
    name: string,
    defaultValue?: any
};

export type CallableWrapperExpressionFactory = (node: Node, name: string, callableArguments: Node, location: Location) => ExpressionNode<any>;

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

export abstract class CallableWrapper<T> {
    readonly name: string;
    readonly callable: Callable<T>;
    readonly acceptedArguments: CallableArgument[];
    readonly options: CallableWrapperOptions;

    protected _arguments: Array<any> = [];

    protected constructor(name: string, callable: Callable<any>, acceptedArguments: CallableArgument[], options: CallableWrapperOptions = {}) {
        this.name = name;
        this.callable = callable;
        this.acceptedArguments = acceptedArguments;

        this.options = Object.assign({}, {
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
     * @return CallableArgument[]
     */
    getAcceptedArguments(): CallableArgument[] {
        return this.acceptedArguments;
    }

    traceableCallable(location: Location, source: Source): Callable<T> {
        let callable = this.callable;

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
        return this.options.isVariadic;
    }

    get isDeprecated(): boolean {
        return this.options.deprecated ? true : false;
    }

    get needsTemplate(): boolean {
        return this.options.needsTemplate;
    }

    get needsContext(): boolean {
        return this.options.needsContext;
    }

    get needsOutputBuffer(): boolean {
        return this.options.needsOutputBuffer;
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
        return this.options.expressionFactory;
    }

    isSafe(functionArgs: Node): any[] {
        if (this.options.isSafe !== null) {
            return this.options.isSafe;
        }

        if (this.options.isSafeCallback) {
            return this.options.isSafeCallback(functionArgs);
        }

        return [];
    }
}
