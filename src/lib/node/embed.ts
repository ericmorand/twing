import {IncludeNode} from "./include";
import {Compiler} from "../compiler";

import type {IncludeNodeAttributes} from "./include";

export type EmbedNodeAttributes = IncludeNodeAttributes & {
    name: string,
    index: number
};

export class EmbedNode extends IncludeNode<EmbedNodeAttributes> {
    protected addGetTemplate(compiler: Compiler) {
        compiler
            .raw('await this.loadTemplate(')
            .string(this.attributes.name)
            .raw(', ')
            .repr(this.location)
            .raw(', ')
            .repr(this.attributes.index)
            .raw(')')
        ;
    }
}
