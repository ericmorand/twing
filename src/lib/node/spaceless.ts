import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";
import {TwingNodeOutputInterface} from "../node-output-interface";
import {TwingNodeType} from "../node-type";

export const type = new TwingNodeType('spaceless');

export class TwingNodeSpaceless extends TwingNode<{
    body: TwingNode
}, null> implements TwingNodeOutputInterface {
    TwingNodeOutputInterfaceImpl: TwingNodeOutputInterface;

    constructor(body: TwingNode, lineno: number, columnno: number, tag = 'spaceless') {
        super({body}, null, lineno, columnno, tag);

        this.TwingNodeOutputInterfaceImpl = this;
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .addSourceMapEnter(this)
            .write("outputBuffer.start();\n")
            .subcompile(this.getNode('body'))
            .write("outputBuffer.echo(outputBuffer.getAndClean().replace(/>\\s+</g, '><').trim());\n")
            .addSourceMapLeave()
        ;
    }
}
