import * as tape from 'tape';
import {NodeTraverser} from "../../../../../src/lib/node-traverser";
import {NodeEnvironment} from "../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../src/lib/loader/array";
import {Node} from "../../../../../src/lib/node";
import {BaseNodeVisitor} from "../../../../../src/lib/base-node-visitor";

class TwingTestNodeVisitorRemoveVisitor extends BaseNodeVisitor {
    nodeToRemove: Node;

    constructor(nodeToRemove: Node) {
        super();

        this.nodeToRemove = nodeToRemove;
    }

    doEnterNode(node: Node) {
        return node;
    }

    doLeaveNode(node: Node) {
        if (node === this.nodeToRemove) {
            return null;
        }

        return node;
    }

    getPriority(): number {
        return 0;
    }
}

tape('node-traverser', (test) => {
    test.test('constructor', (test) => {
        test.doesNotThrow(function() {
            new NodeTraverser(new NodeEnvironment(new ArrayLoader({})));
        });

        test.end();
    });

    test.test('traverseForVisitor', (test) => {
        let traverser = new NodeTraverser(new NodeEnvironment(new ArrayLoader({})));

        let nodeToRemove = new Node();
        let visitor = new TwingTestNodeVisitorRemoveVisitor(nodeToRemove);
        let node = traverser.visit(visitor, new Node(new Map([[0, nodeToRemove]])));

        test.same(node.getNodes(), new Map());

        test.end();
    });


    test.end();
});
