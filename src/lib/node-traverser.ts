/**
 * A node traverser.
 *
 * Visits all nodes and their children and calls the given visitor for each.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {TwingEnvironment} from "./environment";
import {TwingNodeVisitorInterface} from "./node-visitor-interface";
import {Node} from "./node";

import {ksort} from "./helpers/ksort";
import {push} from "./helpers/push";

export class NodeTraverser {
    private env: TwingEnvironment;
    private visitors: Map<number, Map<string, TwingNodeVisitorInterface>> = new Map();

    /**
     *
     * @param {TwingEnvironment} env
     * @param {Array<TwingNodeVisitorInterface>} visitors
     */
    constructor(env: TwingEnvironment, visitors: Array<TwingNodeVisitorInterface> = []) {
        let self = this;

        this.env = env;

        for (let visitor of visitors) {
            self.addVisitor(visitor);
        }
    }

    addVisitor(visitor: TwingNodeVisitorInterface) {
        if (!this.visitors.has(visitor.getPriority())) {
            this.visitors.set(visitor.getPriority(), new Map());
        }

        push(this.visitors.get(visitor.getPriority()), visitor);
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

    visit(node: Node, visitor: TwingNodeVisitorInterface): Node {
        node = visitor.TwingNodeVisitorInterfaceImpl.enterNode(node, this.env);

        for (let [key, subNode] of node) {
            let visitedNode = this.visit(subNode, visitor);

            if (visitedNode) {
                if (visitedNode !== subNode) {
                    node.edges[key] = visitedNode;
                }
            } else {
                delete node.edges[key];
            }
        }

        return visitor.TwingNodeVisitorInterfaceImpl.leaveNode(node, this.env);
    }
}
