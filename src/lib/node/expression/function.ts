import {TwingNode} from "../../node";
import {TwingNodeExpressionCall} from "./call";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";
import {TwingCallableWrapper} from "../../callable-wrapper";

export const type = new TwingNodeType('expression_function');

export class TwingNodeExpressionFunction extends TwingNodeExpressionCall {
    constructor(name: string, functionArguments: TwingNode, lineno: number, columnno: number) {
        let nodes = {
            arguments: functionArguments
        };

        super(nodes, 'function', name, lineno, columnno);

        this.setAttribute('is_defined_test', false)
    }

    get type() {
        return type;
    }

    getCallableWrapper(name: string, compiler: TwingCompiler): TwingCallableWrapper<any> {
        return compiler.getEnvironment().getFunction(name);
    }
}
