import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class RangeBinaryExpressionNode extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('this.createRange(')
            .subCompile(this.edges.left)
            .raw(', ')
            .subCompile(this.edges.right)
            .raw(')')
        ;
    }
}
