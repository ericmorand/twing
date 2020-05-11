import {TwingNodeExpressionCall} from "./call";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";
import {TwingCallableWrapper} from "../../callable-wrapper";

export const type = new TwingNodeType('expression_test');

export class TwingNodeExpressionTest extends TwingNodeExpressionCall {
    constructor(node: TwingNode, name: string, nodeArguments: TwingNode, lineno: number, columnno: number) {
        let nodes = {
            node: node,
            arguments: nodeArguments
        };

        super(nodes, 'test', name, lineno, columnno);
    }

    get type() {
        return type;
    }

    protected getCallableWrapper(name: string, compiler: TwingCompiler): TwingCallableWrapper<boolean> {
        return compiler.getEnvironment().getTest(name);
    }
}
