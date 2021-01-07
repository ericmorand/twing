import {TwingNode} from "../node";
import {TwingNodeExpression} from "./expression";
import {TwingCompiler} from "../compiler";

export type TwingNodeIncludeAttributes = {
    ignoreMissing: boolean,
    only?: boolean
};

export type TwingNodeIncludeNodes = {
    template: TwingNodeExpression,
    variables?: TwingNodeExpression,
};

export class TwingNodeInclude<A extends TwingNodeIncludeAttributes = TwingNodeIncludeAttributes,
    N extends TwingNodeIncludeNodes = TwingNodeIncludeNodes> extends TwingNode<A, N> {
    compile(compiler: TwingCompiler) {
        compiler.write('outputBuffer.echo(await this.include(context, outputBuffer, ');

        this.addGetTemplate(compiler);

        compiler.raw(', ');

        const variables = this.nodes.variables;

        if (variables) {
            compiler.subcompile(variables);
        } else {
            compiler.repr(undefined)
        }

        compiler
            .raw(', ')
            .repr(!this.attributes.only)
            .raw(', ')
            .repr(this.attributes.ignoreMissing)
            .raw(', ')
            .repr(this.line)
            .raw(')')
            .raw(');\n');
    }

    protected addGetTemplate(compiler: TwingCompiler) {
        compiler.subcompile(this.nodes.template);
    }
}
