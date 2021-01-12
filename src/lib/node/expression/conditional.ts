import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";

export type ConditionalExpressionNodeEdges = {
    expr1: ExpressionNode<any>,
    expr2: ExpressionNode<any>,
    expr3: ExpressionNode<any>
};

export class ConditionalExpressionNode extends ExpressionNode<{}, ConditionalExpressionNodeEdges> {
    compile(compiler: Compiler) {
        compiler
            .raw('((')
            .subCompile(this.edges.expr1)
            .raw(') ? (')
            .subCompile(this.edges.expr2)
            .raw(') : (')
            .subCompile(this.edges.expr3)
            .raw('))')
        ;
    }
}
