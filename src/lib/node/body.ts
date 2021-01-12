import {Node} from "../node";

export type TwingNodeBodyNodes = {
    content: Node
};

/**
 * Represents a body node.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
// todo: is it really useful?
export class TwingNodeBody extends Node<null, TwingNodeBodyNodes> {

}
