import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class TwingNodeExpressionBinaryMul extends BinaryExpressionNode {
    operator(compiler: Compiler): Compiler {
        return compiler.raw('*');
    }
}
