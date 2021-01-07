import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";

import type {TwingNodeExpressionAttributes} from "../expression";

export type TwingNodeExpressionConstantAttributes<T> = TwingNodeExpressionAttributes & {
    value: T
};

export class TwingNodeExpressionConstant<T = TwingNode | string | number | boolean> extends TwingNodeExpression<TwingNodeExpressionConstantAttributes<T>> {
    compile(compiler: TwingCompiler) {
        compiler.repr(this.attributes.value);
    }
}
