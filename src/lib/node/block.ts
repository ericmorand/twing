import {Node} from "../node";
import {Compiler} from "../compiler";
import {TwingNodeType} from "../node-type";

export const type = new TwingNodeType('auto_escape');

export class TwingNodeBlock extends Node<{
    name: string
}, {
    body: Node
}> {
    constructor(name: string, body: Node, line: number, column: number, tag: string) {
        super({name}, {body}, line, column, tag);
    }

    get type() {
        return type;
    }

    compile(compiler: Compiler) {
        compiler
            .raw(`async (context, outputBuffer, blocks = new Map()) => {\n`)
            .indent()
            .write('let aliases = this.aliases.clone();\n')
        ;

        compiler
            .subcompile(this.getNode('body'))
            .outdent()
            .write("}")
        ;
    }
}
