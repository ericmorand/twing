import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class EndsWithBinaryExpressionNode extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('await (async () => {')
            .raw(`let left = `)
            .subCompile(this.edges.left)
            .raw('; ')
            .raw(`let right = `)
            .subCompile(this.edges.right)
            .raw('; ')
            .raw(`return typeof left === 'string' && typeof right === 'string' && (right.length < 1 || left.endsWith(right));`)
            .raw('})()')
        ;
    }
}
