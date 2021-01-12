import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class PowerBinaryExpressionNode extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('Math.pow(')
            .subCompile(this.edges.left)
            .raw(', ')
            .subCompile(this.edges.right)
            .raw(')')
        ;
    }
}
