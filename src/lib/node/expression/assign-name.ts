import {TwingNodeExpressionName} from "./name";
import {TwingCompiler} from "../../compiler";

export class TwingNodeExpressionAssignName extends TwingNodeExpressionName {
    compile(compiler: TwingCompiler) {
        compiler
            .raw('context.proxy[')
            .string(this.attributes.value)
            .raw(']')
        ;
    }
}
