import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class BitwiseAndBinaryExpressionNode extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('&');
    }
}
