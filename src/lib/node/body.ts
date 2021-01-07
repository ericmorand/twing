import {TwingNode} from "../node";

/**
 * Represents a body node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingNodeBody extends TwingNode<null, {
    node: TwingNode
}> {
    constructor(node: TwingNode, line: number, column: number) {
        super(null, {node}, line, column);
    }
}
