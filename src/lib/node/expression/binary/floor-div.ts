import {TwingNodeExpressionBinaryDiv} from "./div";
import {Compiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_binary_floor_div');

export class TwingNodeExpressionBinaryFloorDiv extends TwingNodeExpressionBinaryDiv {
    get type() {
        return type;
    }

    compile(compiler: Compiler) {
        compiler.raw('Math.floor(');
        super.compile(compiler);
        compiler.raw(')');
    }

    operator(compiler: Compiler) {
        return compiler.raw('/');
    }
}
