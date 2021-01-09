import {TwingNodeExpression} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

export abstract class TwingNodeExpressionBinary extends TwingNodeExpression<{}, {
    left: Node,
    right: Node
}> {
    compile(compiler: Compiler) {
        compiler
            .raw('(')
            .subcompile(this.children.left)
            .raw(' ')
        ;

        this.operator(compiler);

        compiler
            .raw(' ')
            .subcompile(this.children.right)
            .raw(')')
        ;
    }

    /**
     *
     * @param {Compiler} compiler
     * @returns {Compiler}
     */
    operator(compiler: Compiler): Compiler {
        return compiler;
    }
}
