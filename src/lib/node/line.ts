import {Node} from "../node";
import {Compiler} from "../compiler";

export type LineNodeAttributes = {
    quantity: number
};

export class LineNode extends Node<LineNodeAttributes, null> {
    compile(compiler: Compiler) {
        // noop
    }
}
