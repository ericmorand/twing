import {TwingNodeExpressionBinary} from "../binary";
import {Compiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_binary_matches');

export class TwingNodeExpressionBinaryMatches extends TwingNodeExpressionBinary {
    get type() {
        return type;
    }

    compile(compiler: Compiler) {
        compiler
            .raw('this.parseRegExp(')
            .subcompile(this.getNode('right'))
            .raw(').test(')
            .subcompile(this.getNode('left'))
            .raw(')')
        ;
    }
}
