import {TwingNodeExpressionBinary} from "../binary";
import {TwingCompiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_binary_power');

export class TwingNodeExpressionBinaryPower extends TwingNodeExpressionBinary {
    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw('Math.pow(')
            .subcompile(this.getChild('left'))
            .raw(', ')
            .subcompile(this.getChild('right'))
            .raw(')')
        ;
    }
}
