import {Node} from "../node";
import {Compiler} from "../compiler";
import {TwingNodeOutputInterface} from "../node-output-interface";
import {TwingNodeType} from "../node-type";

export const type = new TwingNodeType('spaceless');

export class TwingNodeSpaceless extends Node<{
    body: Node
}, null> implements TwingNodeOutputInterface {
    TwingNodeOutputInterfaceImpl: TwingNodeOutputInterface;

    constructor(body: Node, lineno: number, columnno: number, tag = 'spaceless') {
        super({body}, null, lineno, columnno, tag);

        this.TwingNodeOutputInterfaceImpl = this;
    }

    get type() {
        return type;
    }

    compile(compiler: Compiler) {
        compiler
            .addSourceMapEnter(this)
            .write("outputBuffer.start();\n")
            .subcompile(this.getNode('body'))
            .write("outputBuffer.echo(outputBuffer.getAndClean().replace(/>\\s+</g, '><').trim());\n")
            .addSourceMapLeave()
        ;
    }
}
