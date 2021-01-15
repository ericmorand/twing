/**
 * A node traverser.
 *
 * Visits all nodes and their children and calls the given visitor for each.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Environment} from "./environment";
import {NodeVisitorInterface} from "./node-visitor-interface";
import {Node} from "./node";

import {ksort} from "./helpers/ksort";
import {push} from "./helpers/push";

export class NodeTraverser {
    private readonly env: Environment;
    private visitors: Map<number, Map<string, NodeVisitorInterface>> = new Map();

    /**
     *
     * @param {Environment} env
     * @param {Array<NodeVisitorInterface>} visitors
     */
    constructor(env: Environment, visitors: Array<NodeVisitorInterface> = []) {
        let self = this;

        this.env = env;

        for (let visitor of visitors) {
            self.addVisitor(visitor);
        }
    }

    addVisitor(visitor: NodeVisitorInterface) {
        if (!this.visitors.has(visitor.priority)) {
            this.visitors.set(visitor.priority, new Map());
        }

        push(this.visitors.get(visitor.priority), visitor);
    }

    /**
     * Traverses a node and calls the registered visitors.
     *
     * @return Node
     */
    traverse(node: Node): Node {
        let result: Node | false = node;

        ksort(this.visitors);

        for (let [, visitors] of this.visitors) {
            for (let [, visitor] of visitors) {
                result = this.visit(node, visitor);
            }
        }

        return result;
    }

    visit(node: Node, visitor: NodeVisitorInterface): Node {
        node = visitor.enterNode(node, this.env);

        if (node) {
            for (let [key, subNode] of node) {
                if (subNode) {
                    let visitedNode = this.visit(subNode, visitor);

                    const edges = node.edges;

                    if (visitedNode) {
                        edges[key] = visitedNode;
                    } else {
                        delete edges[key];
                    }

                    node.edges = edges;
                }
            }
        }

        return visitor.leaveNode(node, this.env);
    }
}
