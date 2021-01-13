import {FilterExpressionNode} from "./node/expression/filter";
import {Node} from "./node";
import {
    CallableWrapperOptions,
    CallableWrapper,
    CallableArgument,
    Callable
} from "./callable-wrapper";

import type {Location} from "./node";
import type {HashExpressionNode} from "./node/expression/hash";

export type FilterOptions = CallableWrapperOptions & {
    preEscape?: string,
    preservesSafety?: Array<string>
}

export class Filter extends CallableWrapper<any, FilterOptions> {
    constructor(name: string, callable: Callable<any>, acceptedArguments: CallableArgument[], options: FilterOptions = {}) {
        options.preEscape = null;
        options.preservesSafety = null;
        options.expressionFactory = (node: Node, name: string, filterArguments: HashExpressionNode, location: Location) => {
            return new FilterExpressionNode({name}, {node, arguments: filterArguments}, location);
        };

        super(name, callable, acceptedArguments, options);
    }

    getPreservesSafety() {
        return this.options.preservesSafety;
    }

    getPreEscape() {
        return this.options.preEscape;
    }
}
