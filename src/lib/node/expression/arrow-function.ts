import {ExpressionNode} from "../expression";
import {Compiler} from "../../compiler";
import {Node} from "../../node";

import type {NodeEdges} from "../../node";

export type ArrowFunctionExpressionNodeEdges = {
    expr: ExpressionNode<any>,
    names: Node<null, NodeEdges<ExpressionNode<{
        value: string
    }>>>
};

/**
 * Represents an arrow function.
 */
export class ArrowFunctionExpressionNode extends ExpressionNode<{}, ArrowFunctionExpressionNodeEdges> {
    compile(compiler: Compiler) {
        compiler.raw('async (');

        let i: number = 0;

        const names = this.edges.names;

        for (let [, name] of names) {
            if (i > 0) {
                compiler.raw(', ');
            }

            compiler
                .raw('$__')
                .raw(name.attributes.value)
                .raw('__');

            i++;
        }

        compiler
            .raw(') => {')
        ;

        for (let [, name] of names) {
            compiler
                .raw('context.proxy[\'')
                .raw(name.attributes.value)
                .raw('\'] = $__')
                .raw(name.attributes.value)
                .raw('__; ');
        }

        compiler
            .raw('return ')
            .subCompile(this.edges.expr)
            .raw(';}');
    }
}
