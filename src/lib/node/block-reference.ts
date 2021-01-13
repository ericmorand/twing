import {Node} from "../node";
import {Compiler} from "../compiler";

export type BlockReferenceNodeAttributes = {
    name: string
};

/**
 * Represents a block call node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class BlockReferenceNode extends Node<BlockReferenceNodeAttributes, null> {
    compile(compiler: Compiler) {
        compiler
            .write(`outputBuffer.echo(await this.traceableRenderBlock(`)
            .repr(this.location)
            .raw(`, this.source)('${this.attributes.name}', context.clone(), outputBuffer, blocks));\n`)
        ;
    }
}
