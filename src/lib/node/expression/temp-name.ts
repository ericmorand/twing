import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";
import type {ExpressionNodeAttributes} from "../expression";

export class TempNameExpressionNode extends ExpressionNode<ExpressionNodeAttributes<{
    declaration: boolean,
    value: string
}>, null> {
    compile(compiler: Compiler) {
        compiler
            .raw(`${this.attributes.declaration ? 'let ' : ''}$_`)
            .raw(this.attributes.value)
            .raw('_')
        ;
    }
}
