import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";

export type ParentExpressionNodeAttributes = {
    name: string
};

export class ParentExpressionNode extends ExpressionNode<ParentExpressionNodeAttributes> {
    // constructor(name: string, lineno: number) {
    //     let attributes = new Map();
    //
    //     // attributes.set('output', false);
    //     attributes.set('name', name);
    //
    //     super(new Map(), attributes, lineno);
    // }

    compile(compiler: Compiler) {
        let name = this.attributes.name;

        compiler
            .raw(`await this.traceableRenderParentBlock(${this.location}, this.source)(`)
            .string(name)
            .raw(', context, outputBuffer, blocks)')
        ;
    }
}
