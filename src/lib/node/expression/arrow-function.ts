import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNode} from "../../node";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_arrow_function');

export type Nodes = {
  expr: TwingNodeExpression,
  names: TwingNode
};

/**
 * Represents an arrow function.
 */
export class TwingNodeExpressionArrowFunction extends TwingNodeExpression<Nodes> {
    constructor(expr: TwingNodeExpression, names: TwingNode, lineno: number, columnno: number, tag: string = null) {
        super({expr: expr, names: names}, {}, lineno, columnno, tag);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler.raw('async (');

        let i: number = 0;

        for (let name of this.getChild('names').children.values()) {
            if (i > 0) {
                compiler.raw(', ');
            }

            compiler
                .raw('$__')
                .raw(name.getAttribute('name'))
                .raw('__');

            i++;
        }

        compiler
            .raw(') => {')
        ;

        for (let name of this.getChild('names').children.values()) {
            compiler
                .raw('context.proxy[\'')
                .raw(name.getAttribute('name'))
                .raw('\'] = $__')
                .raw(name.getAttribute('name'))
                .raw('__; ');
        }

        compiler
            .raw('return ')
            .subcompile(this.getChild('expr'))
            .raw(';}');
    }
}
