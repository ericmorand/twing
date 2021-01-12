import {TestExpressionNode} from "../test";
import {Compiler} from "../../../compiler";

export class ConstantTestExpressionNode extends TestExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('(')
            .subCompile(this.edges.node)
            .raw(' === this.constant(')
            .subCompile(this.edges.arguments.edges[0]);

        if (this.edges.arguments.edges[1]) {
            compiler
                .raw(', ')
                .subCompile(this.edges.arguments.edges[1]);
        }

        compiler.raw('))');
    }
}
