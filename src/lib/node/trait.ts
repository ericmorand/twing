import {Node} from "../node";

import type {Compiler} from "../compiler";

export type TraitNodeEdges = {
    template: Node,
    targets: Node
};

export class TraitNode extends Node<null, TraitNodeEdges> {
    compile(compiler: Compiler) {

        compiler
            .write(`const trait = await this.loadTemplate(`)
            .subCompile(this.edges.template)
            .raw(', ')
            .repr(this.location)
            .raw(");\n")
            .write(`const traits = this.cloneMap(await trait.getBlocks());\n\n`)
        ;

        for (let [key, value] of this.edges.targets) {
            compiler
                .write(`if (!traits.has(`)
                .string(key)
                .raw(")) {\n")
                .indent()
                .write('throw new this.RuntimeError(\'Block ')
                .string(key)
                .raw(' is not defined in trait ')
                .subCompile(this.edges.template)
                .raw('.\', ')
                .repr(value.location)
                .raw(', this.source);\n')
                .outdent()
                .write('}\n\n')
                .write(`traits.set(`)
                .subCompile(value)
                .raw(`, traits.get(`)
                .string(key)
                .raw(`));\n`)
                .write(`traits.delete(`)
                .string(key)
                .raw(');\n\n')
                .write(`return traits;`)
            ;
        }
    }
}
