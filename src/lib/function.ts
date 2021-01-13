import {FunctionExpressionNode} from "./node/expression/function";
import {Node} from "./node";
import {
    CallableWrapperOptions,
    CallableWrapper,
    CallableArgument,
    Callable
} from "./callable-wrapper";

import type {Location} from "./node";
import type {HashExpressionNode} from "./node/expression/hash";

export class Function extends CallableWrapper<any, {}> {
    constructor(name: string, callable: Callable<any>, acceptedArguments: CallableArgument[], options: CallableWrapperOptions = {}) {
        options.expressionFactory = (node: Node, name: string, functionArguments: HashExpressionNode, location: Location) => {
            return new FunctionExpressionNode({name}, {node, arguments: functionArguments}, location);
        };

        super (name, callable, acceptedArguments, options);
    }
}
