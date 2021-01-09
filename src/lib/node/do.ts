import {Node} from "../node";
import {TwingNodeExpression} from "./expression";
import {Compiler} from "../compiler";

/**
 * Represents a do node.
 *
 * The do tag works exactly like the regular variable expression ({{ ... }}) just that it doesn't print anything:
 * {% do 1 + 2 %}
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingNodeDo extends Node<null, {
    expr: TwingNodeExpression
}> {
    constructor(expr: TwingNodeExpression, line: number, column: number, tag: string) {
        super(null, {expr}, line, column, tag);
    }

    compile(compiler: Compiler) {
        compiler
            .subcompile(this.getNode('expr'), true)
            .raw(";\n")
        ;
    }
}
