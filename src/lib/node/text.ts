import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";

export type TwingNodeTextAttributes = {
    data: string
};

export class TwingNodeText<A extends TwingNodeTextAttributes = TwingNodeTextAttributes> extends TwingNode<A> {
    compile(compiler: TwingCompiler) {
        compiler
            .addSourceMapEnter(this)
            .write('outputBuffer.echo(')
            .string(this.attributes.data)
            .raw(");\n")
            .addSourceMapLeave()
        ;
    }
}
