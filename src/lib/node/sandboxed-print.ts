import {PrintNode} from "./print"
import {Compiler} from "../compiler";

export class SandboxedPrintNode extends PrintNode {
    compile(compiler: Compiler) {
        compiler
            .write('outputBuffer.echo(this.environment.ensureToStringAllowed(')
            .subCompile(this.edges.content)
            .raw("));\n")
        ;
    }
}
