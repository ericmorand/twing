import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";

/**
 * Represents a block call node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingNodeBlockReference extends TwingNode<{
    name: string
}, null> {
    compile(compiler: TwingCompiler) {
        compiler
            .write(`outputBuffer.echo(await this.traceableRenderBlock(${this.line}, this.source)('${this.getAttribute('name')}', context.clone(), outputBuffer, blocks));\n`)
        ;
    }
}
