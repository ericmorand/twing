import {FunctionExpressionNode} from "./node/expression/function";
import {Node} from "./node";
import {
    CallableWrapperOptions,
    CallableWrapper,
    CallableArgument,
    Callable
} from "./callable-wrapper";

import type {Location} from "./node";

export class Function extends CallableWrapper<any> {
    readonly options: CallableWrapperOptions;

    /**
     * Creates a template function.
     *
     * @param {string} name Name of this function
     * @param {Callable<any>} callable A callable implementing the function. If null, you need to overwrite the "expression_factory" option to customize compilation.
     * @param {CallableArgument[]} acceptedArguments
     * @param {CallableWrapperOptions} options Options
     */
    constructor(name: string, callable: Callable<any>, acceptedArguments: CallableArgument[], options: CallableWrapperOptions = {}) {
        super (name, callable, acceptedArguments);

        this.options.expressionFactory = (node: Node, name: string, functionArguments: Node, location: Location) => {
            return new FunctionExpressionNode({name}, {node, arguments: functionArguments}, location);
        };

        this.options = Object.assign({}, this.options, options);
    }
}
