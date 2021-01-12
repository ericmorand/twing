import {Node} from "../node";
import {Compiler} from "../compiler";

export type BlockNodeAttributes = {
    name: string
};

export type BlockNodeEdges = {
    body: Node
};

export class BlockNode extends Node<BlockNodeAttributes, BlockNodeEdges> {
    // constructor(name: string, body: Node, line: number, column: number, tag: string) {
    //     super({name}, {body}, line, column, tag);
    // }

    compile(compiler: Compiler) {
        compiler
            .raw(`async (context, outputBuffer, blocks = new Map()) => {\n`)
            .indent()
            .write('let aliases = this.aliases.clone();\n')
        ;

        compiler
            .subCompile(this.edges.body)
            .outdent()
            .write("}")
        ;
    }
}
