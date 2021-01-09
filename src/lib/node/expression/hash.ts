import {Compiler} from "../../compiler";
import {TwingNodeExpression} from "../expression";

import {TwingNodeExpressionList} from "./list";

export type TwingNodeExpressionHashElement = [TwingNodeExpression<any>, TwingNodeExpression<any>];

export class TwingNodeExpressionHash extends TwingNodeExpressionList<TwingNodeExpression<any>> {
    protected compileKey(compiler: Compiler, key: TwingNodeExpression<any>): void {
        compiler.subcompile(key);
    }
}
