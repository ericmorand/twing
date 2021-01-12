import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class TwingNodeExpressionBinaryMatches extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('this.parseRegExp(')
            .subCompile(this.edges.right)
            .raw(').test(')
            .subCompile(this.edges.left)
            .raw(')')
        ;
    }
}
