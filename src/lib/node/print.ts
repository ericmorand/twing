import {Node} from "../node";
import {Compiler} from "../compiler";

export type TwingNodePrintNodes = {
    content: Node
};

export class TwingNodePrint extends Node<null, TwingNodePrintNodes> {
    compile(compiler: Compiler) {
        compiler
            .addSourceMapEnter(this)
            .write('outputBuffer.echo(')
            .subcompile(this.children.content)
            .raw(');\n')
            .addSourceMapLeave()
        ;
    }

    get outputs(): boolean {
        return true;
    }
}
