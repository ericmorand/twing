import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";
import {TwingNodeOutputInterface} from "../node-output-interface";

/**
 * Represents a block call node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingNodeBlockReference extends TwingNode<{
    name: string
}, null> implements TwingNodeOutputInterface {
    TwingNodeOutputInterfaceImpl: TwingNodeOutputInterface;

    constructor(name: string, line: number, column: number, tag: string = null) {
        super({name}, null, line, column, tag);

        this.TwingNodeOutputInterfaceImpl = this;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .write(`outputBuffer.echo(await this.traceableRenderBlock(${this.line}, this.source)('${this.getAttribute('name')}', context.clone(), outputBuffer, blocks));\n`)
        ;
    }
}
