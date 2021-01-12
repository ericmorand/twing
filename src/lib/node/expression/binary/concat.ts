import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class ConcatBinaryExpressionNode extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('(this.concatenate(')
            .subCompile(this.edges.left)
            .raw(', ')
            .subCompile(this.edges.right)
            .raw('))')
        ;
    }
}
