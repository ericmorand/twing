import {Node} from "../node";
import {Compiler} from "../compiler";

export type PrintNodeChildren = {
    content: Node
};

export class PrintNode extends Node<null, PrintNodeChildren> {
    compile(compiler: Compiler) {
        compiler
            .addSourceMapEnter(this)
            .write('outputBuffer.echo(')
            .subCompile(this.edges.content)
            .raw(');\n')
            .addSourceMapLeave()
        ;
    }

    get outputs(): boolean {
        return true;
    }
}
