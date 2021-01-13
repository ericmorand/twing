import {Node} from "../node";
import {Compiler} from "../compiler";

export type SandboxNodeEdges = {
    body: Node
};

export class SandboxNode extends Node<null, SandboxNodeEdges> {
    compile(compiler: Compiler) {
        compiler
            .write('await (async () => {\n')
            .indent()
            .write('let alreadySandboxed = this.environment.isSandboxed();\n')
            .write("if (!alreadySandboxed) {\n")
            .indent()
            .write("this.environment.enableSandbox();\n")
            .outdent()
            .write("}\n")
            .subCompile(this.edges.body)
            .write("if (!alreadySandboxed) {\n")
            .indent()
            .write("this.environment.disableSandbox();\n")
            .outdent()
            .write("}\n")
            .outdent()
            .write("})();\n")
        ;
    }
}
