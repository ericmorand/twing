import {TwingNodeExpressionBinary} from "../binary";
import {Compiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_binary_sub');

export class TwingNodeExpressionBinarySub extends TwingNodeExpressionBinary {
    get type() {
        return type;
    }

    operator(compiler: Compiler): Compiler {
        return compiler.raw('-');
    }
}
