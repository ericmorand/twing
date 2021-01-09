import {Node} from "../node";
import {Compiler} from "../compiler";
import {TwingNodeType} from "../node-type";

export const type = new TwingNodeType('with');

export type TwingNodeWithAttributes = {
    only: boolean
};

export type TwingNodeWithNodes = {
    body: Node,
    variables?: Node
};

export class TwingNodeWith<A extends TwingNodeWithAttributes = TwingNodeWithAttributes, N extends TwingNodeWithNodes = TwingNodeWithNodes> extends Node<A, N> {
    compile(compiler: Compiler) {
        const variables = this.children.variables;

        if (variables) {
            compiler
                .write('{\n')
                .indent()
                .write(`let tmp = `)
                .subcompile(variables)
                .raw(";\n")
                .write(`if (typeof (tmp) !== 'object') {\n`)
                .indent()
                .write('throw new this.RuntimeError(\'Variables passed to the "with" tag must be a hash.\', ')
                .repr(this.line)
                .raw(", this.source);\n")
                .outdent()
                .write("}\n")
            ;

            if (this.attributes.only) {
                compiler.write("context = new Map([['_parent', context]]);\n");
            } else {
                compiler.write("context.set('_parent', context.clone());\n");
            }

            compiler
                .write(`context = new this.Context(this.environment.mergeGlobals(this.merge(context, this.convertToMap(tmp))));\n`)
                .outdent()
                .write('}\n\n')
        } else {
            compiler.write("context.set('_parent', context.clone());\n");
        }

        compiler
            .subcompile(this.children.body)
            .write("context = context.get('_parent');\n")
        ;
    }
}
