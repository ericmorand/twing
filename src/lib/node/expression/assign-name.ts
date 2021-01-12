import {NameExpressionNode} from "./name";
import {Compiler} from "../../compiler";

export class AssignNameExpressionNode extends NameExpressionNode {
    compile(compiler: Compiler) {
        compiler
            .raw('context.proxy[')
            .string(this.attributes.value)
            .raw(']')
        ;
    }
}
