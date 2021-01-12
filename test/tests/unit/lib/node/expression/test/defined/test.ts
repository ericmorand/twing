import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {DefinedTestExpressionNode} from "../../../../../../../../src/lib/node/expression/test/defined";
import {NegativeUnaryExpressionNode} from "../../../../../../../../src/lib/node/expression/unary/neg";

tape('node/expression/test/defined', (test) => {
    test.test('constructor', (test) => {
        test.test('when filter is "default" and "EXPRESSION_NAME" or "EXPRESSION_GET_ATTR" node', (test) => {
            try {
                new DefinedTestExpressionNode(
                    new NegativeUnaryExpressionNode(new ConstantExpressionNode('foo', 1, 1), 1, 1),
                    'foo',
                    null,
                    1, 1
                );

                test.fail();
            }
            catch (e) {
                test.same(e.message, 'The "defined" test only works with simple variables at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.end();
});
