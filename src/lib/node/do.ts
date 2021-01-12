import {Node} from "../node";
import {ExpressionNode} from "./expression";
import {Compiler} from "../compiler";

/**
 * Represents a do node.
 *
 * The do tag works exactly like the regular variable expression ({{ ... }}) just that it doesn't print anything:
 * {% do 1 + 2 %}
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export type DoNodeEdges = {
    expr: ExpressionNode<any>
};

export class DoNode extends Node<null, DoNodeEdges> {
    compile(compiler: Compiler) {
        compiler
            .subCompile(this.edges.expr, true)
            .raw(";\n")
        ;
    }
}
