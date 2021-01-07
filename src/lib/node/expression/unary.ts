import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";

export abstract class TwingNodeExpressionUnary extends TwingNodeExpression<{
    node: TwingNode
}> {
    constructor(node: TwingNode, lineno: number, columno: number) {
        super({node}, null, lineno, columno);
    }

    compile(compiler: TwingCompiler) {
        this.operator(compiler);

        compiler
            .raw('(')
            .subcompile(this.getNode('node'))
            .raw(')');
    }

    operator(compiler: TwingCompiler): TwingCompiler {
        return compiler;
    }
}
