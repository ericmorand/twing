import {TwingNodeExpressionTest} from "../test";
import {TwingCompiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_test_constant');

export class TwingNodeExpressionTestConstant extends TwingNodeExpressionTest {
    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw('(')
            .subcompile(this.getChild('node'))
            .raw(' === this.constant(')
            .subcompile(this.getChild('arguments').getChild(0));

        if (this.getChild('arguments').hasChild(1)) {
            compiler
                .raw(', ')
                .subcompile(this.getChild('arguments').getChild(1));
        }

        compiler.raw('))');
    }
}
