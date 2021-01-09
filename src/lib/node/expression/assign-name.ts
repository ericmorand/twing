import {TwingNodeExpressionName} from "./name";
import {Compiler} from "../../compiler";

export class TwingNodeExpressionAssignName extends TwingNodeExpressionName {
    compile(compiler: Compiler) {
        compiler
            .raw('context.proxy[')
            .string(this.attributes.value)
            .raw(']')
        ;
    }
}
