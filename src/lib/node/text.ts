import {Node} from "../node";
import {Compiler} from "../compiler";

export type TextNodeAttributes = {
    data: string
};

export class TextNode extends Node<TextNodeAttributes, null> {
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
