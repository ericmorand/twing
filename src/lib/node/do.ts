import {TwingNode} from "../node";
import {TwingNodeExpression} from "./expression";
import {TwingCompiler} from "../compiler";

/**
 * Represents a do node.
 *
 * The do tag works exactly like the regular variable expression ({{ ... }}) just that it doesn't print anything:
 * {% do 1 + 2 %}
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingNodeDo extends TwingNode<null, {
    expr: TwingNodeExpression
}> {
    constructor(expr: TwingNodeExpression, line: number, column: number, tag: string) {
        super(null, {expr}, line, column, tag);
    }

    compile(compiler: TwingCompiler) {
        compiler
            .subcompile(this.getNode('expr'), true)
            .raw(";\n")
        ;
    }
}
