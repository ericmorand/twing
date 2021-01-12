import {Node} from "../node";
import {Compiler} from "../compiler";

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
export type AutoEscapeNodeAttributes = {
    strategy: any
};

export type AutoEscapeNodeEdges = {
    body: Node
};

export class AutoEscapeNode extends Node<AutoEscapeNodeAttributes, AutoEscapeNodeEdges> {
    compile(compiler: Compiler) {
        compiler.subCompile(this.edges.body);
    }
}
