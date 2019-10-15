import {TwingNodeExpressionFunction} from "./node/expression/function";
import {TwingNode} from "./node";
import {
    TwingCallableWrapperOptions,
    TwingCallableWrapper,
    TwingCallableArgument,
    TwingCallable
} from "./callable-wrapper";

type TwingFunctionCallable = (...args: any[]) => void;

export class TwingFunction extends TwingCallableWrapper {
    readonly options: TwingCallableWrapperOptions;

    /**
     * Creates a template function.
     *
     * @param {string} name Name of this function
     * @param {TwingFunctionCallable} callable A callable implementing the function. If null, you need to overwrite the "expression_factory" option to customize compilation.
     * @param {TwingCallableArgument[]} acceptedArguments
     * @param {TwingCallableWrapperOptions} options Options
     */
    constructor(name: string, callable: TwingCallable, acceptedArguments: TwingCallableArgument[], options: TwingCallableWrapperOptions = {}) {
        super (name, callable, acceptedArguments);

        this.options.expression_factory = function (name: string, functionArguments: TwingNode, line: number, columnno: number) {
            return new TwingNodeExpressionFunction(name, functionArguments, line, columnno);
        };

        this.options = Object.assign({}, this.options, options);
    }
}
