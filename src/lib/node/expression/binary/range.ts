import {TwingNodeExpressionBinary} from "../binary";
import {Compiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_binary_range');

export class TwingNodeExpressionBinaryRange extends TwingNodeExpressionBinary {
    get type() {
        return type;
    }

    compile(compiler: Compiler) {
        compiler
            .raw('this.createRange(')
            .subcompile(this.getNode('left'))
            .raw(', ')
            .subcompile(this.getNode('right'))
            .raw(')')
        ;
    }
}
