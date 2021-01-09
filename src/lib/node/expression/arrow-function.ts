import {TwingNodeExpression} from "../expression";
import {Compiler} from "../../compiler";
import {Node} from "../../node";

import type {NodeChildren} from "../../node";

export type TwingNodeExpressionArrowFunctionNodes = {
    expr: TwingNodeExpression<any>,
    names: Node<null, NodeChildren<TwingNodeExpression<{
        value: string
    }>>>
};

/**
 * Represents an arrow function.
 */
export class TwingNodeExpressionArrowFunction extends TwingNodeExpression<{}, TwingNodeExpressionArrowFunctionNodes> {
    compile(compiler: Compiler) {
        compiler.raw('async (');

        let i: number = 0;

        const names = this.children.names;

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
            .subcompile(this.children.expr)
            .raw(';}');
    }
}
