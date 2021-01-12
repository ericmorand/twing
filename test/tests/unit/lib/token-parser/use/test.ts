import * as tape from 'tape';
import {TokenStream} from "../../../../../../src/lib/token-stream";
import {UseTokenParser} from "../../../../../../src/lib/token-parser/use";
import {getParser} from "../../../../../mock-builder/parser";
import {Node} from "../../../../../../src/lib/node";
import {ConstantExpressionNode} from "../../../../../../src/lib/node/expression/constant";

const sinon = require('sinon');
const {Token, TokenType} = require('twig-lexer');

tape('token-parser/use', (test) => {
    test.test('parse', (test) => {
        test.test('when template name is not a "EXPRESSION_CONSTANT"', (test) => {
            let stream = new TokenStream([]);
            let tokenParser = new UseTokenParser();
            let parser = getParser(stream);

            tokenParser.setParser(parser);

            sinon.stub(parser, 'parseExpression').returns(new Node());
            sinon.stub(stream, 'getCurrent').returns({
                line: 1
            });

            try {
                tokenParser.parse(new Token(TokenType.NAME, 'set', 1, 1));

                test.fail();
            }
            catch (e) {
                test.same(e.message, 'The template references in a "use" statement must be a string in "" at line 1.')
            }

            test.end();
        });

        test.test('when multiple aliases', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.NAME, 'with', 1, 1),
                new Token(TokenType.NAME, 'bar', 1, 1),
                new Token(TokenType.NAME, 'as', 1, 1),
                new Token(TokenType.NAME, 'rab', 1, 1),
                new Token(TokenType.PUNCTUATION, ',', 1, 1),
                new Token(TokenType.NAME, 'foo', 1, 1),
                new Token(TokenType.NAME, 'as', 1, 1),
                new Token(TokenType.NAME, 'oof', 1, 1),
                new Token(TokenType.TAG_END, null, 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ]);

            let tokenParser = new UseTokenParser();
            let parser = getParser(stream);

            tokenParser.setParser(parser);

            let trait: Node;

            sinon.stub(parser, 'parseExpression').returns(new ConstantExpressionNode('foo', 1, 1));
            sinon.stub(parser, 'addTrait').callsFake((node: Node) => {
                trait = node;
            });

            tokenParser.parse(new Token(TokenType.NAME, 'set', 1, 1));

            test.equals(trait.getNode('targets').getNodes().size, 2);

            test.end();
        });

        test.end();
    });

    test.end();
});
