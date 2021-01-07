import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_conditional');

export class TwingNodeExpressionConditional extends TwingNodeExpression<{
    expr1: TwingNodeExpression,
    expr2: TwingNodeExpression,
    expr3: TwingNodeExpression
}> {
    constructor(expr1: TwingNodeExpression, expr2: TwingNodeExpression, expr3: TwingNodeExpression, line: number, column: number) {
        super({expr1, expr2, expr3}, null, line, column);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw('((')
            .subcompile(this.getNode('expr1'))
            .raw(') ? (')
            .subcompile(this.getNode('expr2'))
            .raw(') : (')
            .subcompile(this.getNode('expr3'))
            .raw('))')
        ;
    }
}
