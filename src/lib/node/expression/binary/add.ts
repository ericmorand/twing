import {TwingNodeExpressionBinary} from "../binary";
import {Compiler} from "../../../compiler";

export class TwingNodeExpressionBinaryAdd extends TwingNodeExpressionBinary {
    operator(compiler: Compiler): Compiler {
        return compiler.raw('+');
    }
}
