import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class TwingNodeExpressionBinaryOr extends BinaryExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('!!')
        ;

        super.compile(compiler);
    }

    operator(compiler: Compiler): Compiler {
        return compiler.raw('||');
    }
}
