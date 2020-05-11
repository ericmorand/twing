import {TwingNode, Children as NodeChildren} from "../node";
import {TwingNodeType} from "../node-type";

export const type = new TwingNodeType('body');

export type Children = NodeChildren & {
  node: TwingNode
};

/**
 * Represents a body node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingNodeBody extends TwingNode<Children> {
    constructor(node: TwingNode, lineno: number = 0, columnno: number = 0, tag: string = null) {
        super({node: node}, {}, lineno, columnno, tag);
    }

    get type() {
        return type as any;
    }
}
