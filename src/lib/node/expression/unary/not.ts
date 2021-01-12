import {UnaryExpressionNode} from "../unary";
import {Compiler} from "../../../compiler";

export class NotUnaryExpressionNode extends UnaryExpressionNode {
    operator(compiler: Compiler): Compiler {
        return compiler.raw('!');
    }
}
