import {DivBinaryExpressionNode} from "./div";
import {Compiler} from "../../../compiler";

export class FloorDivBinaryExpressionNode extends DivBinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler.raw('Math.floor(');
        super.compile(compiler);
        compiler.raw(')');
    }

    operator(compiler: Compiler) {
        return compiler.raw('/');
    }
}
