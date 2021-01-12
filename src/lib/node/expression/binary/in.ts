import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class InBinaryExpressionNode extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('this.isIn(')
            .subCompile(this.edges.left)
            .raw(', ')
            .subCompile(this.edges.right)
            .raw(')')
        ;
    }
}
