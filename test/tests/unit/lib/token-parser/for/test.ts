import * as tape from 'tape';
import {TokenStream} from "../../../../../../src/lib/token-stream";
import {ForTokenParser} from "../../../../../../src/lib/token-parser/for";
import {ForNode} from "../../../../../../src/lib/node/for";
import {AssignNameExpressionNode} from "../../../../../../src/lib/node/expression/assign-name";
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";
import {Node} from "../../../../../../src/lib/node";

const sinon = require('sinon');
const {Token, TokenType} = require('twig-lexer');

tape('token-parser/for', (test) => {
    test.test('checkLoopUsageBody', (test) => {
        let stream = new TokenStream([
            new Token(TokenType.TAG_END, null, 1, 1),
            new Token(TokenType.EOF, null, 1, 1)
        ]);

        let tokenParser = new ForTokenParser();

        let checkLoopUsageBody = Reflect.get(tokenParser, 'checkLoopUsageBody').bind(tokenParser);
        let checkLoopUsageBodySpy = sinon.spy(tokenParser, 'checkLoopUsageBody');

        checkLoopUsageBody(stream, new ForNode(new AssignNameExpressionNode('foo', 1, 1), new AssignNameExpressionNode('bar', 1, 1), new ConstantExpressionNode(1, 1, 1), new ConstantExpressionNode(1, 1, 1), new Node(), new Node(),1, 1));

        test.true(checkLoopUsageBodySpy.notCalled);

        test.end();
    });

    test.end();
});
