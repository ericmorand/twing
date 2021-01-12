import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class BitwiseOrBinaryExpressionNode extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('|');
    }
}
