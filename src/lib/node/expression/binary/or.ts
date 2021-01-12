import {BinaryExpressionNode} from "../binary";
import {Compiler} from "../../../compiler";

export class OrBinaryExpressionNode extends BinaryExpressionNode {
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
