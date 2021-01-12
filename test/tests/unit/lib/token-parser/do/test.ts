import * as tape from 'tape';
import {TokenStream} from "../../../../../../src/lib/token-stream";
import {DoTokenParser} from "../../../../../../src/lib/token-parser/do";
import {getParser} from "../../../../../mock-builder/parser";
import {type} from "../../../../../../src/lib/node/do";

const sinon = require('sinon');
const {Token, TokenType} = require('twig-lexer');

tape('token-parser/do', (test) => {
    test.test('parse', (test) => {
        let stream = new TokenStream([
            new Token(TokenType.TAG_END, null, 1, 1),
            new Token(TokenType.EOF, null, 1, 1)
        ]);

        let tokenParser = new DoTokenParser();
        let parser = getParser(stream);

        sinon.stub(parser, 'parseExpression').returns(new Token(TokenType.NAME, 'foo', 1, 1));

        tokenParser.setParser(parser);

        test.same(tokenParser.parse(new Token(TokenType.TAG_START, null, 1, 1)).type, type);

        test.end();
    });

    test.end();
});
