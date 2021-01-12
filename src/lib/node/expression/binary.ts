import {ExpressionNode} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

export type BinaryExpressionNodeEdges = {
    left: Node,
    right: Node
};

export abstract class BinaryExpressionNode extends ExpressionNode<{}, BinaryExpressionNodeEdges> {
    compile(compiler: Compiler) {
        compiler
            .raw('(')
            .subCompile(this.edges.left)
            .raw(' ')
        ;

        this.operator(compiler);

        compiler
            .raw(' ')
            .subCompile(this.edges.right)
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
