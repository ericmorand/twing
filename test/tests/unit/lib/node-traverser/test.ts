import * as tape from 'tape';
import {NodeTraverser} from "../../../../../src/lib/node-traverser";
import {TwingEnvironmentNode} from "../../../../../src/lib/environment/node";
import {TwingLoaderArray} from "../../../../../src/lib/loader/array";
import {Node} from "../../../../../src/lib/node";
import {TwingBaseNodeVisitor} from "../../../../../src/lib/base-node-visitor";

class TwingTestNodeVisitorRemoveVisitor extends TwingBaseNodeVisitor {
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
            new NodeTraverser(new TwingEnvironmentNode(new TwingLoaderArray({})));
        });

        test.end();
    });

    test.test('traverseForVisitor', (test) => {
        let traverser = new NodeTraverser(new TwingEnvironmentNode(new TwingLoaderArray({})));

        let nodeToRemove = new Node();
        let visitor = new TwingTestNodeVisitorRemoveVisitor(nodeToRemove);
        let node = traverser.visit(visitor, new Node(new Map([[0, nodeToRemove]])));

        test.same(node.getNodes(), new Map());

        test.end();
    });


    test.end();
});
