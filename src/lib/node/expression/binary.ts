import {TwingNodeExpression} from "../expression";
import {TwingNode} from "../../node";
import {TwingCompiler} from "../../compiler";

export type Nodes = {
    left: TwingNode,
    right: TwingNode
};

export abstract class TwingNodeExpressionBinary extends TwingNodeExpression<Nodes> {
    constructor(nodes: [TwingNode, TwingNode], lineno: number, columno: number) {
        super({left: nodes[0], right: nodes[1]}, {}, lineno, columno);
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw('(')
            .subcompile(this.getChild('left'))
            .raw(' ')
        ;

        this.operator(compiler);

        compiler
            .raw(' ')
            .subcompile(this.getChild('right'))
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
