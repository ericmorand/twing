import {TwingNodeExpressionBinary} from "../binary";
import {Compiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_binary_bitwise_and');

export class TwingNodeExpressionBinaryBitwiseAnd extends TwingNodeExpressionBinary {
    get type() {
        return type;
    }

    operator(compiler: Compiler) {
        return compiler.raw('&');
    }
}
