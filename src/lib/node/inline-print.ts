import {Compiler} from "../compiler";
import {TwingNodePrint} from "./print";

export class TwingNodeInlinePrint extends TwingNodePrint {
    compile(compiler: Compiler) {
        compiler
            .raw('outputBuffer.echo(')
            .subcompile(this.children.content)
            .raw(')')
        ;
    }
}
