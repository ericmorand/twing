import {Compiler} from "../compiler";
import {PrintNode} from "./print";

export class InlinePrintNode extends PrintNode {
    compile(compiler: Compiler) {
        compiler
            .raw('outputBuffer.echo(')
            .subCompile(this.edges.content)
            .raw(')')
        ;
    }
}
