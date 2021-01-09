import {Node} from "../node";
import {Compiler} from "../compiler";

export type CommentNodeAttributes = {
    data: string
};

export class CommentNode extends Node<CommentNodeAttributes, null> {
    compile(compiler: Compiler) {
        // noop
    }
}
