import {Node} from "../node";
import {Compiler} from "../compiler";

export class FlushNode extends Node<null, null> {
    compile(compiler: Compiler) {
        compiler
            .write("outputBuffer.flush();\n")
        ;
    }
}
