import {Compiler} from "../../../compiler";
import {BinaryExpressionNode} from "../binary";

export class NotInBinaryExpressionNode extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('!this.isIn(')
            .subCompile(this.edges.left)
            .raw(', ')
            .subCompile(this.edges.right)
            .raw(')')
        ;
    }
}
