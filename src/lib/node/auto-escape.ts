import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";
import {TwingNodeType} from "../node-type";

/**
 * Represents an autoescape node.
 *
 * The value is the escaping strategy (can be html, js, ...)
 *
 * The true value is equivalent to html.
 *
 * If autoescaping is disabled, then the value is false.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingNodeAutoEscape extends TwingNode<{
    value: any
}, {
    body: TwingNode
}> {
    constructor(value: any, body: TwingNode, line: number, column: number, tag: string) {
        super({value}, {body}, line, column, tag);
    }

    compile(compiler: TwingCompiler) {
        compiler.subcompile(this.nodes.body);
    }
}
