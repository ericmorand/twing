import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class EqualBinaryExpressionNode extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('this.compare(')
            .subCompile(this.edges.left)
            .raw(', ')
            .subCompile(this.edges.right)
            .raw(')')
        ;
    }
}
