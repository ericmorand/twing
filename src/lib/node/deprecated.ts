/**
 * Represents a deprecated node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Node} from "../node";
import {TwingNodeExpression} from "./expression";
import {Compiler} from "../compiler";
import {TwingNodeExpressionConstant} from "./expression/constant";

export class TwingNodeDeprecated extends Node<null, {
    expr: TwingNodeExpression<any>
}> {
    compile(compiler: Compiler) {
        let expr = this.children.expr;

        compiler
            .write('{\n')
            .indent();

        if (expr instanceof TwingNodeExpressionConstant) {
            compiler
                .write('console.warn(')
                .subcompile(expr)
            ;
        } else {
            compiler.write(`let message = `)
                .subcompile(expr)
                .raw(';\n')
                .write(`console.warn(message`)
            ;
        }

        compiler
            .raw(' + ')
            .string(` ("${this.getTemplateName()}" at line ${this.location.line})`)
            .raw(');\n')
            .outdent()
            .write('}\n')
        ;
    }
}
