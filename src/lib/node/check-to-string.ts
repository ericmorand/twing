import {Node} from "../node";
import {ExpressionNode} from "./expression";
import {Compiler} from "../compiler";

/**
 * Checks if casting an expression to toString() is allowed by the sandbox.
 *
 * For instance, when there is a simple Print statement, like {{ article }},
 * and if the sandbox is enabled, we need to check that the toString()
 * method is allowed if 'article' is an object. The same goes for {{ article|upper }}
 * or {{ random(article) }}.
 */
export type TwingNodeCheckToStringEdges = {
    expression: ExpressionNode<any>
}

export class TwingNodeCheckToString extends Node<null, TwingNodeCheckToStringEdges> {
    compile(compiler: Compiler) {
        compiler
            .raw('this.environment.ensureToStringAllowed(')
            .subCompile(this.edges.expression)
            .raw(')')
        ;
    }
}

