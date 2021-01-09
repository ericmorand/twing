import {TwingNodeExpression} from "./node/expression";
import {Node} from "./node";
import {TwingNodeExpressionTest} from "./node/expression/test";
import {
    TwingCallable,
    TwingCallableArgument,
    TwingCallableWrapper,
    TwingCallableWrapperOptions
} from "./callable-wrapper";

export class TwingTest extends TwingCallableWrapper<boolean> {
    readonly options: TwingCallableWrapperOptions;

    /**
     * Creates a template test.
     *
     * @param {string} name Name of this test
     * @param {TwingCallable<boolean>} callable A callable implementing the test. If null, you need to overwrite the "node_class" option to customize compilation.
     * @param {TwingCallableArgument[]} acceptedArguments
     * @param {TwingCallableWrapperOptions} options Options
     */
    constructor(name: string, callable: TwingCallable<boolean>, acceptedArguments: TwingCallableArgument[], options: TwingCallableWrapperOptions = {}) {
        super(name, callable, acceptedArguments);

        this.options.expressionFactory = (node: TwingNodeExpression<any>, name: string, testArguments: Node, line: number, column: number) => {
            return new TwingNodeExpressionTest({
                name
            }, {
                node,
                arguments: testArguments
            }, line, column);
        };

        this.options = Object.assign({}, this.options, options);
    }
}
