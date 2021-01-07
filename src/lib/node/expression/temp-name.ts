import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

import type {TwingNodeExpressionAttributes} from "../expression";

export const type = new TwingNodeType('expression_temp_name');

export class TwingNodeExpressionTempName extends TwingNodeExpression<null, TwingNodeExpressionAttributes & {
    declaration: boolean,
    value: string
}> {
    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw(`${this.getAttribute('declaration') ? 'let ' : ''}$_`)
            .raw(this.getAttribute('value'))
            .raw('_')
        ;
    }
}
