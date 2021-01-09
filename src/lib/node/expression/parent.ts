import {TwingNodeExpression} from "../expression";
import {Compiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_parent');

export type TwingNodeExpressionParentAttributes = {
    name: string
};

export class TwingNodeExpressionParent extends TwingNodeExpression<TwingNodeExpressionParentAttributes> {
    // constructor(name: string, lineno: number) {
    //     let attributes = new Map();
    //
    //     // attributes.set('output', false);
    //     attributes.set('name', name);
    //
    //     super(new Map(), attributes, lineno);
    // }

    get type() {
        return type;
    }

    compile(compiler: Compiler) {
        let name = this.attributes.name;

        compiler
            .raw(`await this.traceableRenderParentBlock(${this.line}, this.source)(`)
            .string(name)
            .raw(', context, outputBuffer, blocks)')
        ;
    }
}
