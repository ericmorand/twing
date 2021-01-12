import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class TwingNodeExpressionBinaryLess extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('<');
    }
}
