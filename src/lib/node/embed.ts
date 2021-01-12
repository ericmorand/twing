import {IncludeNode} from "./include";
import {Compiler} from "../compiler";

import type {TwingNodeIncludeAttributes} from "./include";

export type TwingNodeEmbedAttributes = TwingNodeIncludeAttributes & {
    name: string,
    index: number
};

export class EmbedNode extends IncludeNode<TwingNodeEmbedAttributes> {
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
