import * as tape from 'tape';
import {TwingNodeExpressionConstant} from "../../../../../../../src/lib/node/expression/constant";
import {TwingNodeExpressionArray, type} from "../../../../../../../src/lib/node/expression/array";
import {MockCompiler} from "../../../../../../mock/compiler";

tape('node/expression/array', (test) => {
    test.test('constructor', (test) => {
        let foo = new TwingNodeExpressionConstant('bar', 1, 1);

        let elements = new Map<any, any>([
            [0, new TwingNodeExpressionConstant('foo', 1, 1)],
            [1, foo]
        ]);

        let node = new TwingNodeExpressionArray(elements, 1, 1);

        test.same(node.getChild(1), foo);
        test.same(node.type, type);
        test.end();
    });

    test.test('compile', (test) => {
        let compiler = new MockCompiler();

        let elements = new Map<any, any>([
            [0, new TwingNodeExpressionConstant(0, 1, 1)],
            [1, new TwingNodeExpressionConstant('bar', 1, 1)],
            [2, new TwingNodeExpressionConstant(1, 1, 1)],
            [3, new TwingNodeExpressionConstant('foo', 1, 1)]
        ]);

        let node = new TwingNodeExpressionArray(elements, 1, 1);

        test.same(compiler.compile(node).getSource(), 'new Map([[0, \`bar\`], [1, \`foo\`]])');
        test.end();
    });

    test.end();
});
