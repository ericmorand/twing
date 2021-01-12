import {ExpressionNode} from "../expression";
import {Node} from "../../node";
import {Compiler} from "../../compiler";

export type ConstantExpressionNodeAttributes<T> = {
    value: T
};

export class ConstantExpressionNode<T = Node | string | number | boolean> extends ExpressionNode<ConstantExpressionNodeAttributes<T>> {
    compile(compiler: Compiler) {
        compiler.repr(this.attributes.value);
    }
}
