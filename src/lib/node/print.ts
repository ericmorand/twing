import {TwingNode} from "../node";
import {TwingNodeOutputInterface} from "../node-output-interface";
import {TwingCompiler} from "../compiler";

export type TwingNodePrintNodes = {
    content: TwingNode
};

export class TwingNodePrint extends TwingNode<TwingNodePrintNodes> implements TwingNodeOutputInterface {
    TwingNodeOutputInterfaceImpl: TwingNodeOutputInterface;

    compile(compiler: TwingCompiler) {
        compiler
            .addSourceMapEnter(this)
            .write('outputBuffer.echo(')
            .subcompile(this.nodes.content)
            .raw(');\n')
            .addSourceMapLeave()
        ;
    }
}
