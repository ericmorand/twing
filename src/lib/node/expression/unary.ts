import {ExpressionNode, ExpressionNodeAttributes} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

export type UnaryExpressionNodeEdges = {
    operand: Node
};

export abstract class UnaryExpressionNode extends ExpressionNode<ExpressionNodeAttributes<{}>, UnaryExpressionNodeEdges> {
    compile(compiler: Compiler) {
        this.operator(compiler);

        compiler
            .raw('(')
            .subCompile(this.edges.operand)
            .raw(')');
    }

    operator(compiler: Compiler): Compiler {
        return compiler;
    }
}
