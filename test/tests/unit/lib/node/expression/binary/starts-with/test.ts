import * as tape from 'tape';
import {TwingNodeExpressionConstant} from "../../../../../../../../src/lib/node/expression/constant";
import {TwingNodeExpressionBinaryStartsWith, type} from "../../../../../../../../src/lib/node/expression/binary/starts-with";
import {MockCompiler} from "../../../../../../../mock/compiler";

tape('node/expression/binary/starts-with', (test) => {
    test.test('constructor', (test) => {
        let left = new TwingNodeExpressionConstant(1, 1, 1);
        let right = new TwingNodeExpressionConstant(2, 1, 1);
        let node = new TwingNodeExpressionBinaryStartsWith([left, right], 1, 1);

        test.same(node.getChild('left'), left);
        test.same(node.getChild('right'), right);
        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let left = new TwingNodeExpressionConstant(1, 1, 1);
        let right = new TwingNodeExpressionConstant(2, 1, 1);
        let node = new TwingNodeExpressionBinaryStartsWith([left, right], 1, 1);
        let compiler = new MockCompiler();

        test.same(compiler.compile(node).getSource(), 'await (async () => {let left = 1; let right = 2; return typeof left === \'string\' && typeof right === \'string\' && (right.length < 1 || left.startsWith(right));})()');

        test.end();
    });

    test.end();
});
