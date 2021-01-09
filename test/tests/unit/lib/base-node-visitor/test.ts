import * as tape from 'tape';
import {Test} from "tape";
import {TwingBaseNodeVisitor} from "../../../../../src/lib/base-node-visitor";
import {Node} from "../../../../../src/lib/node";
import {TwingEnvironment} from "../../../../../src/lib/environment";

class CustomVisitor extends TwingBaseNodeVisitor {
    protected doEnterNode(node: Node, env: TwingEnvironment): Node {
        return undefined;
    }

    protected doLeaveNode(node: Node, env: TwingEnvironment): Node {
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
