import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class TwingNodeExpressionBinaryMod extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('%');
    }
}
