import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class DivBinaryExpressionNode extends BinaryExpressionNode {
    operator(compiler: Compiler): Compiler {
        return compiler.raw('/');
    }
}
