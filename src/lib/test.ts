import {ExpressionNode} from "./node/expression";
import {Node} from "./node";
import {TestExpressionNode} from "./node/expression/test";
import {
    Callable,
    CallableArgument,
    CallableWrapper,
    CallableWrapperOptions
} from "./callable-wrapper";

import type {Location} from "./node";

export class Test extends CallableWrapper<boolean> {
    readonly options: CallableWrapperOptions;

    /**
     * Creates a template test.
     *
     * @param {string} name Name of this test
     * @param {Callable<boolean>} callable A callable implementing the test. If null, you need to overwrite the "node_class" option to customize compilation.
     * @param {CallableArgument[]} acceptedArguments
     * @param {CallableWrapperOptions} options Options
     */
    constructor(name: string, callable: Callable<boolean>, acceptedArguments: CallableArgument[], options: CallableWrapperOptions = {}) {
        super(name, callable, acceptedArguments);

        this.options.expressionFactory = (node: ExpressionNode<any>, name: string, testArguments: Node, location: Location) => {
            return new TestExpressionNode({
                name
            }, {
                node,
                arguments: testArguments
            }, location);
        };

        this.options = Object.assign({}, this.options, options);
    }
}
