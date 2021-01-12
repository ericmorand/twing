import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class GreaterBinaryExpressionNode extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('>');
    }
}
