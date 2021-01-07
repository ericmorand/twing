import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";

export type TwingNodePrintNodes = {
    content: TwingNode
};

export class TwingNodePrint extends TwingNode<null, TwingNodePrintNodes> {
    compile(compiler: TwingCompiler) {
        compiler
            .addSourceMapEnter(this)
            .write('outputBuffer.echo(')
            .subcompile(this.nodes.content)
            .raw(');\n')
            .addSourceMapLeave()
        ;
    }

    get outputs(): boolean {
        return true;
    }
}
