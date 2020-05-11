import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";

export const type = new TwingNodeType('expression_conditional');

export type Nodes = Partial<{
   expr1: TwingNodeExpression,
   expr2: TwingNodeExpression,
   expr3: TwingNodeExpression
}>;

export class TwingNodeExpressionConditional extends TwingNodeExpression<Nodes> {
    constructor(expr1: TwingNodeExpression, expr2: TwingNodeExpression, expr3: TwingNodeExpression, lineno: number, columnno: number) {
        let nodes: Nodes = {
            expr1: expr1,
            expr2: expr2,
            expr3: expr3
        };

        super(nodes, {}, lineno, columnno);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw('((')
            .subcompile(this.getChild('expr1'))
            .raw(') ? (')
            .subcompile(this.getChild('expr2'))
            .raw(') : (')
            .subcompile(this.getChild('expr3'))
            .raw('))')
        ;
    }
}
