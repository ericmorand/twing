import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class LessOrEqualBinaryExpressionNode extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('<=');
    }
}
