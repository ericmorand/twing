import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_parent');

export type Attributes = {
  name: string
};

export class TwingNodeExpressionParent extends TwingNodeExpression<{}, Attributes> {
    constructor(name: string, lineno: number) {
        let attributes = {
            name: name
        };

        super({}, attributes, lineno);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        let name = this.getAttribute('name');

        compiler
            .raw(`await this.traceableRenderParentBlock(${this.getTemplateLine()}, this.source)(`)
            .string(name)
            .raw(', context, outputBuffer, blocks)')
        ;
    }
}
