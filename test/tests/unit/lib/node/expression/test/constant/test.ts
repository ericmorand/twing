import * as tape from 'tape';
import {ConstantExpressionNode} from "../../../../../../../../src/lib/node/expression/constant";
import {ConstantTestExpressionNode} from "../../../../../../../../src/lib/node/expression/test/constant";
import {ArrayExpressionNode} from "../../../../../../../../src/lib/node/expression/array";
import {MockCompiler} from "../../../../../../../mock/compiler";

tape('node/expression/test/constant', (test) => {
    test.test('compile', (test) => {
        let node = new ConstantTestExpressionNode(
            new ConstantExpressionNode('foo', 1, 1),
            'constant',
            new ArrayExpressionNode(new Map([
                [0, new ConstantExpressionNode('Foo', 1, 1)]
            ]), 1, 1),
            1, 1
        );
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), '(`foo` === this.constant(`Foo`))');

        node = new ConstantTestExpressionNode(
            new ConstantExpressionNode('foo', 1, 1),
            'constant',
            new ArrayExpressionNode(new Map([
                [0, new ConstantExpressionNode('Foo', 1, 1)],
                [1, new ConstantExpressionNode('Bar', 1, 1)]
            ]), 1, 1),
            1, 1
        );

        test.same(compiler.compile(node).getSource(), '(`foo` === this.constant(`Foo`, `Bar`))');

        test.end();
    });

    test.end();
});
