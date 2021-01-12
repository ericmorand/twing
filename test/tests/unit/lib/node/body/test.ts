import * as tape from 'tape';
import {BodyNode} from "../../../../../../src/lib/node/body";

tape('node/body', (test) => {
    test.test('constructor', (test) => {
        let node = new BodyNode();

        test.same(node.getNodes(), new Map());

        test.end();
    });

    test.end();
});
