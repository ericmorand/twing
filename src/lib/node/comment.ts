import {TwingNode} from "../node";
import {TwingCompiler} from "../compiler";

export class TwingNodeComment extends TwingNode<{
    data: string
}, null> {
    constructor(data: string, line: number, column: number) {
        super({data}, null, line, column);
    }

    compile(compiler: TwingCompiler) {
        // noop
    }
}
