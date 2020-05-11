import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";

export type Nodes = {
    node: TwingNode
};

export abstract class TwingNodeExpressionUnary extends TwingNodeExpression<Nodes> {
    constructor(node: TwingNode, lineno: number, columno: number) {
        super({node: node}, {}, lineno, columno);
    }

    compile(compiler: TwingCompiler) {
        this.operator(compiler);

        compiler
            .raw('(')
            .subcompile(this.getChild('node'))
            .raw(')');
    }

    operator(compiler: TwingCompiler): TwingCompiler {
        return compiler;
    }
}
