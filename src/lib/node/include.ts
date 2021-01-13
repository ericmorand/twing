import {Node} from "../node";
import {ExpressionNode} from "./expression";
import {Compiler} from "../compiler";

export type IncludeNodeAttributes = {
    ignoreMissing: boolean,
    only: boolean
};

export type IncludeNodeEdges = {
    template: ExpressionNode<any>,
    variables: ExpressionNode<any>,
};

export class IncludeNode<A extends IncludeNodeAttributes = IncludeNodeAttributes,
    N extends IncludeNodeEdges = IncludeNodeEdges> extends Node<A, N> {
    compile(compiler: Compiler) {
        compiler.write('outputBuffer.echo(await this.include(context, outputBuffer, ');

        this.addGetTemplate(compiler);

        compiler.raw(', ');

        const variables = this.edges.variables;

        if (variables) {
            compiler.subCompile(variables);
        } else {
            compiler.repr(undefined)
        }

        compiler
            .raw(', ')
            .repr(!this.attributes.only)
            .raw(', ')
            .repr(this.attributes.ignoreMissing)
            .raw(', ')
            .repr(this.location)
            .raw(')')
            .raw(');\n');
    }

    protected addGetTemplate(compiler: Compiler) {
        compiler.subCompile(this.edges.template);
    }
}
