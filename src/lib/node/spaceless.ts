import {Node} from "../node";
import {Compiler} from "../compiler";

export type SpacelessNodeEdges = {
    body: Node
};

export class SpacelessNode extends Node<null, SpacelessNodeEdges> {
    get outputs(): boolean {
        return true;
    }

    compile(compiler: Compiler) {
        compiler
            .addSourceMapEnter(this)
            .write("outputBuffer.start();\n")
            .subCompile(this.edges.body)
            .write("outputBuffer.echo(outputBuffer.getAndClean().replace(/>\\s+</g, '><').trim());\n")
            .addSourceMapLeave()
        ;
    }
}
