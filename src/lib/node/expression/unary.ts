import {TwingNodeExpression} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

export abstract class TwingNodeExpressionUnary extends TwingNodeExpression<{
    node: Node
}> {
    constructor(node: Node, lineno: number, columno: number) {
        super({node}, null, lineno, columno);
    }

    compile(compiler: Compiler) {
        this.operator(compiler);

        compiler
            .raw('(')
            .subcompile(this.getNode('node'))
            .raw(')');
    }

    operator(compiler: Compiler): Compiler {
        return compiler;
    }
}
