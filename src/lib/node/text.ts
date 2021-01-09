import {Node} from "../node";
import {Compiler} from "../compiler";

export type TwingNodeTextAttributes = {
    data: string
};

export class TwingNodeText extends Node<TwingNodeTextAttributes, null> {
    compile(compiler: Compiler) {
        compiler
            .addSourceMapEnter(this)
            .write('outputBuffer.echo(')
            .string(this.attributes.data)
            .raw(");\n")
            .addSourceMapLeave()
        ;
    }

    get outputs(): boolean {
        return true;
    }
}
