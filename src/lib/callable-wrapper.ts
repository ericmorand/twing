import {Error} from "./error";
import {TwingSource} from "./source";
import {Node} from "./node";
import {TwingNodeExpression} from "./node/expression";

import type {Location} from "./node";

export type TwingCallable<T> = (...args: any[]) => Promise<T>;

export type TwingCallableArgument = {
    name: string,
    defaultValue?: any
};

export type CallableWrapperExpressionFactory = (node: Node, name: string, callableArguments: Node, location: Location) => TwingNodeExpression<any>;

export type TwingCallableWrapperOptions = {
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
     * @return TwingCallableArgument[]
     */
    getAcceptedArguments(): TwingCallableArgument[] {
        return this.acceptedArguments;
    }

    traceableCallable(location: Location, source: TwingSource): TwingCallable<T> {
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
