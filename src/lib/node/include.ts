import {Node} from "../node";
import {TwingNodeExpression} from "./expression";
import {Compiler} from "../compiler";

export type TwingNodeIncludeAttributes = {
    ignoreMissing: boolean,
    only?: boolean
};

export type TwingNodeIncludeNodes = {
    template: TwingNodeExpression,
    variables?: TwingNodeExpression,
};

export class TwingNodeInclude<A extends TwingNodeIncludeAttributes = TwingNodeIncludeAttributes,
    N extends TwingNodeIncludeNodes = TwingNodeIncludeNodes> extends Node<A, N> {
    compile(compiler: Compiler) {
        compiler.write('outputBuffer.echo(await this.include(context, outputBuffer, ');

        this.addGetTemplate(compiler);

        compiler.raw(', ');

        const variables = this.children.variables;

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

    protected addGetTemplate(compiler: Compiler) {
        compiler.subcompile(this.children.template);
    }
}
