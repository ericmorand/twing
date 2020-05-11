import {TwingNode} from "../../node";
import {TwingNodeExpressionCall, Nodes as CallNodes} from "./call";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";
import {TwingCallableWrapper} from "../../callable-wrapper";

export const type = new TwingNodeType('expression_filter');

export class TwingNodeExpressionFilter extends TwingNodeExpressionCall {
    constructor(node: TwingNode, name: string, filterArguments: TwingNode, lineno: number, columnno: number) {
        let nodes: CallNodes = {
            node: node,
            arguments: filterArguments
        };

        super(nodes, 'filter', name, lineno, columnno);
    }

    get type() {
        return type;
    }

    protected getCallableWrapper(name: string, compiler: TwingCompiler): TwingCallableWrapper<any> {
        return compiler.getEnvironment().getFilter(name);
    }
}
