import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";

export abstract class TwingNodeExpressionBinary extends TwingNodeExpression<{
    left: TwingNode,
    right: TwingNode
}> {
    constructor(nodes: [TwingNode, TwingNode], line: number, column: number) {
        super({
            left: nodes[0],
            right: nodes[1]
        }, null, line, column);
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw('(')
            .subcompile(this.getNode('left'))
            .raw(' ')
        ;

        this.operator(compiler);

        compiler
            .raw(' ')
            .subcompile(this.getNode('right'))
            .raw(')')
        ;
    }

    /**
     *
     * @param {TwingCompiler} compiler
     * @returns {TwingCompiler}
     */
    operator(compiler: TwingCompiler): TwingCompiler {
        return compiler;
    }
}
