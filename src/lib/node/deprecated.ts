/**
 * Represents a deprecated node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {TwingNode} from "../node";
import {TwingNodeExpression} from "./expression";
import {TwingCompiler} from "../compiler";
import {TwingNodeExpressionConstant} from "./expression/constant";

export class TwingNodeDeprecated extends TwingNode<null, {
    expr: TwingNodeExpression
}> {
    constructor(expr: TwingNodeExpression, line: number, column: number, tag: string) {
        super(null, {expr}, line, column, tag);
    }

    compile(compiler: TwingCompiler) {
        let expr = this.getNode('expr');

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
            .string(` ("${this.getTemplateName()}" at line ${this.line})`)
            .raw(');\n')
            .outdent()
            .write('}\n')
        ;
    }
}
