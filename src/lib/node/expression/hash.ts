import {TwingCompiler} from "../../compiler";
import {TwingNodeExpression} from "../expression";

import {TwingNodeExpressionList} from "./list";

export type TwingNodeExpressionHashElement = [TwingNodeExpression, TwingNodeExpression];

export class TwingNodeExpressionHash extends TwingNodeExpressionList<TwingNodeExpression> {
    protected compileKey(compiler: TwingCompiler, key: TwingNodeExpression): void {
        compiler.subcompile(key);
    }
}
