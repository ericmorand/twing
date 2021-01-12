import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class TwingNodeExpressionBinaryGreaterEqual extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('>=');
    }
}
