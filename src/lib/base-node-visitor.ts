import {NodeVisitorInterface} from "./node-visitor-interface";
import {Node} from "./node";
import {Environment} from "./environment";

export abstract class BaseNodeVisitor implements NodeVisitorInterface {
    abstract get priority(): number;

    /**
     * Called before child nodes are visited.
     *
     * @returns {Node} The modified node
     */
    enterNode(node: Node, env: Environment): Node {
        return this.doEnterNode(node, env);
    }

    /**
     * Called after child nodes are visited.
     *
     * @returns {Node | null} The modified node or null if the node must be removed
     */
    leaveNode(node: Node, env: Environment): Node {
        return this.doLeaveNode(node, env);
    }

    /**
     * Called before child nodes are visited.
     *
     * @returns {Node} The modified node
     */
    protected abstract doEnterNode(node: Node, env: Environment): Node;

    /**
     * Called after child nodes are visited.
     *
     * @returns {Node | null} The modified node or null if the node must be removed
     */
    protected abstract doLeaveNode(node: Node, env: Environment): Node;
}
