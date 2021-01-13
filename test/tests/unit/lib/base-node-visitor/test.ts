import * as tape from 'tape';
import {Test} from "tape";
import {BaseNodeVisitor} from "../../../../../src/lib/base-node-visitor";
import {Node} from "../../../../../src/lib/node";
import {Environment} from "../../../../../src/lib/environment";

class CustomVisitor extends BaseNodeVisitor {
    protected doEnterNode(node: Node, env: Environment): Node {
        return undefined;
    }

    protected doLeaveNode(node: Node, env: Environment): Node {
        return undefined;
    }

    getPriority(): number {
        return 0;
    }
}

tape('base-node-visitor', (test: Test) => {
    test.test('constructor', (test: Test) => {
        let visitor = new CustomVisitor();

        test.same(visitor.TwingNodeVisitorInterfaceImpl, visitor);

        test.end();
    });

    test.end();
});
