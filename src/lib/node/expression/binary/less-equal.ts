import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class TwingNodeExpressionBinaryLessEqual extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('<=');
    }
}
