import {TwingNodeExpressionFilter} from "./node/expression/filter";
import {Node} from "./node";
import {TwingNodeExpressionConstant} from "./node/expression/constant";
import {
    TwingCallableWrapperOptions,
    TwingCallableWrapper,
    TwingCallableArgument,
    TwingCallable
} from "./callable-wrapper";

export type TwingFilterOptions = TwingCallableWrapperOptions & {
    preEscape?: string,
    preservesSafety?: Array<string>
}

export class TwingFilter extends TwingCallableWrapper<any> {
    readonly options: TwingFilterOptions;

    constructor(name: string, callable: TwingCallable<any>, acceptedArguments: TwingCallableArgument[], options: TwingFilterOptions = {}) {
        super(name, callable, acceptedArguments);

        this.options.preEscape = null;
        this.options.preservesSafety = null;
        this.options.expressionFactory = (node: Node, name: string, filterArguments: Node, line: number, column: number) => {
            return new TwingNodeExpressionFilter({name}, {node, arguments: filterArguments}, line, column);
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
