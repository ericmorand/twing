import {Node} from "../node";

export type BodyNodeEdges = {
    content: Node
};

/**
 * Represents a body node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
// todo: is it really useful?
export class BodyNode extends Node<null, BodyNodeEdges> {

}
