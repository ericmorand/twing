import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

import type {TwingNodeExpressionAttributes} from "../expression";

export const type = new TwingNodeType('expression_constant');

export class TwingNodeExpressionConstant<T = TwingNode | string | number | boolean> extends TwingNodeExpression<TwingNodeExpressionAttributes & {
    value: T
}, null> {
    constructor(value: T, line: number, column: number) {
        super({value}, null, line, column);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler.repr(this.getAttribute('value'));
    }
}
