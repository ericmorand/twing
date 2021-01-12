/**
 * Represents a deprecated node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Node} from "../node";
import {ExpressionNode} from "./expression";
import {Compiler} from "../compiler";
import {ConstantExpressionNode} from "./expression/constant";

export type DeprecatedNodeEdges = {
    expression: ExpressionNode<any>
};

export class DeprecatedNode extends Node<null, DeprecatedNodeEdges> {
    compile(compiler: Compiler) {
        let expression = this.edges.expression;

        compiler
            .write('{\n')
            .indent();

        if (expression instanceof ConstantExpressionNode) {
            compiler
                .write('console.warn(')
                .subCompile(expression)
            ;
        } else {
            compiler.write(`let message = `)
                .subCompile(expression)
                .raw(';\n')
                .write(`console.warn(message`)
            ;
        }

        compiler
            .raw(' + ')
            .string(` ("${compiler.getSource()}" at line ${this.location.line})`)
            .raw(');\n')
            .outdent()
            .write('}\n')
        ;
    }
}
