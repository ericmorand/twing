import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";

export class TwingNodeFlush extends TwingNode<null, null> {
    compile(compiler: TwingCompiler) {
        compiler
            .write("outputBuffer.flush();\n")
        ;
    }
}
