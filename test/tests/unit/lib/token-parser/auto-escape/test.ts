import * as tape from 'tape';
import {TokenStream} from "../../../../../../src/lib/token-stream";
import {AutoEscapeTokenParser} from "../../../../../../src/lib/token-parser/auto-escape";
import {Parser} from "../../../../../../src/lib/parser";
import {NodeEnvironment} from "../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../src/lib/loader/array";
import {TextNode} from "../../../../../../src/lib/node/text";

const sinon = require('sinon');
const {Token, TokenType} = require('twig-lexer');

tape('token-parser/auto-escape', (test) => {
    test.test('parse', (test) => {
        test.test('when escaping strategy is not a string of false', function(test) {
            let stream = new TokenStream([
                new Token(TokenType.NAME, 'foo', 1, 1)
            ]);

            let tokenParser = new AutoEscapeTokenParser();
            let parser = new Parser(new NodeEnvironment(new ArrayLoader({})));

            sinon.stub(parser, 'parseExpression').returns(new TextNode('foo', 1, 1, null));

            Reflect.set(parser, 'stream', stream);

            tokenParser.setParser(parser);

            try {
                tokenParser.parse(new Token(TokenType.TAG_START, '', 1, 1));

                test.fail();
            }
            catch (e) {
                test.same(e.message, 'An escaping strategy must be a string or false in "" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.end();
});
