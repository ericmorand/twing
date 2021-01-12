import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class AndBinaryExpressionNode extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('!!')
        ;

        super.compile(compiler);
    }

    operator(compiler: Compiler) {
        return compiler.raw('&&');
    }
}
