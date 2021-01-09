import {Node} from "../node";
import {Compiler} from "../compiler";

/**
 * Represents a block call node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingNodeBlockReference extends Node<{
    name: string
}, null> {
    compile(compiler: Compiler) {
        compiler
            .write(`outputBuffer.echo(await this.traceableRenderBlock(${this.line}, this.source)('${this.getAttribute('name')}', context.clone(), outputBuffer, blocks));\n`)
        ;
    }
}
