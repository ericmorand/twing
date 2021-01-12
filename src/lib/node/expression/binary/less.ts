import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class LessBinaryExpressionNode extends BinaryExpressionNode {
    operator(compiler: Compiler) {
        return compiler.raw('<');
    }
}
