import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class GreaterOrEqualBinaryExpressionNode extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('>=');
    }
}
