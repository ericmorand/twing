import {TwingNodeExpression} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

export type TwingNodeExpressionConstantAttributes<T> = {
    value: T
};

export class TwingNodeExpressionConstant<T = Node | string | number | boolean> extends TwingNodeExpression<TwingNodeExpressionConstantAttributes<T>> {
    compile(compiler: Compiler) {
        compiler.repr(this.attributes.value);
    }
}
