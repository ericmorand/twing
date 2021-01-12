import {FilterExpressionNode} from "./node/expression/filter";
import {Node} from "./node";
import {
    CallableWrapperOptions,
    CallableWrapper,
    CallableArgument,
    Callable
} from "./callable-wrapper";

import type {Location} from "./node";

export type FilterOptions = CallableWrapperOptions & {
    preEscape?: string,
    preservesSafety?: Array<string>
}

export class Filter extends CallableWrapper<any> {
    readonly options: FilterOptions;

    constructor(name: string, callable: Callable<any>, acceptedArguments: CallableArgument[], options: FilterOptions = {}) {
        super(name, callable, acceptedArguments);

        this.options.preEscape = null;
        this.options.preservesSafety = null;
        this.options.expressionFactory = (node: Node, name: string, filterArguments: Node, location: Location) => {
            return new FilterExpressionNode({name}, {node, arguments: filterArguments}, location);
        };

        this.options = Object.assign({}, this.options, options);
    }

    getPreservesSafety() {
        return this.options.preservesSafety;
    }

    getPreEscape() {
        return this.options.preEscape;
    }
}
