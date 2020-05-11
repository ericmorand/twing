import {TwingNodeExpression} from "../expression";
import {TwingCompiler} from "../../compiler";
import {TwingNodeType} from "../../node-type";
import {Children} from "../../node";

export const type = new TwingNodeType('expression_constant');

export type Attributes<T> = {
    value: T
};

export abstract class TwingNodeExpressionConstant<T> extends TwingNodeExpression<Children, Attributes<T>> {
    constructor(value: T, lineno: number, columnno: number) {
        super({}, {value: value}, lineno, columnno);
    }

    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler.repr(this.getAttribute('value'));
    }
}
