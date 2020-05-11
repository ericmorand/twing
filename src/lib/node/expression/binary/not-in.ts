import {TwingCompiler} from "../../../compiler";
import {TwingNodeExpressionBinary} from "../binary";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_binary_not_in');

export class TwingNodeExpressionBinaryNotIn extends TwingNodeExpressionBinary {
    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw('!this.isIn(')
            .subcompile(this.getChild('left'))
            .raw(', ')
            .subcompile(this.getChild('right'))
            .raw(')')
        ;
    }
}
