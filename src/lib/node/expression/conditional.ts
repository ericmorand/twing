import {TwingNodeExpression} from "../expression";
import {Compiler} from "../../compiler";

export type TwingNodeExpressionConditionalNodes = {
    expr1: TwingNodeExpression<any>,
    expr2: TwingNodeExpression<any>,
    expr3: TwingNodeExpression<any>
};

export class TwingNodeExpressionConditional extends TwingNodeExpression<{}, TwingNodeExpressionConditionalNodes> {
    compile(compiler: Compiler) {
        compiler
            .raw('((')
            .subcompile(this.children.expr1)
            .raw(') ? (')
            .subcompile(this.children.expr2)
            .raw(') : (')
            .subcompile(this.children.expr3)
            .raw('))')
        ;
    }
}
