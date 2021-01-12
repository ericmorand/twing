import {Node} from "../node";
import {Compiler} from "../compiler";

export type WithNodeAttributes = {
    only: boolean
};

export type WithNodeEdges = {
    body: Node,
    variables?: Node
};

export class WithNode extends Node<WithNodeAttributes, WithNodeEdges> {
    compile(compiler: Compiler) {
        const variables = this.edges.variables;

        if (variables) {
            compiler
                .write('{\n')
                .indent()
                .write(`let tmp = `)
                .subCompile(variables)
                .raw(";\n")
                .write(`if (typeof (tmp) !== 'object') {\n`)
                .indent()
                .write('throw new this.RuntimeError(\'Variables passed to the "with" tag must be a hash.\', ')
                .repr(this.location)
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
            .subCompile(this.edges.body)
            .write("context = context.get('_parent');\n")
        ;
    }
}
