import {TwingCompiler} from "../compiler";
import {TwingNodePrint} from "./print";

export class TwingNodeInlinePrint extends TwingNodePrint {
    compile(compiler: TwingCompiler) {
        compiler
            .raw('outputBuffer.echo(')
            .subcompile(this.nodes.content)
            .raw(')')
        ;
    }
}
