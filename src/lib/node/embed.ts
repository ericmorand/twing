import {TwingNodeInclude} from "./include";
import {Compiler} from "../compiler";

import type {TwingNodeIncludeAttributes} from "./include";

export type TwingNodeEmbedAttributes = TwingNodeIncludeAttributes & {
    name: string,
    index: number
};

export class TwingNodeEmbed<A extends TwingNodeEmbedAttributes = TwingNodeEmbedAttributes> extends TwingNodeInclude<TwingNodeEmbedAttributes> {
    protected addGetTemplate(compiler: Compiler) {
        compiler
            .raw('await this.loadTemplate(')
            .string(this.attributes.name)
            .raw(', ')
            .repr(this.line)
            .raw(', ')
            .repr(this.attributes.index)
            .raw(')')
        ;
    }
}
