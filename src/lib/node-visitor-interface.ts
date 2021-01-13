/* istanbul ignore next */

/**
 * Twig_NodeVisitorInterface is the interface the all node visitor classes must implement.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Node} from "./node";
import {Environment} from "./environment";

export interface NodeVisitorInterface {
    /**
     * Called before child nodes are visited.
     *
     * @return Twig_Node The modified node
     */
    enterNode(node: Node, env: Environment): Node;

    /**
     * Called after child nodes are visited.
     *
     * @return Twig_Node The modified node or null if the node must be removed
     */
    leaveNode(node: Node, env: Environment): Node;

    /**
     * Returns the priority for this visitor.
     *
     * Priority should be between -10 and 10 (0 is the default).
     *
     * @return int The priority level
     */
    priority: number;
}
