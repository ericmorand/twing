import {TokenParser} from "../token-parser";
import {DoNode} from "../node/do";
import {Token, TokenType} from "twig-lexer";

export class DoTokenParser extends TokenParser {
    parse(token: Token) {
        let expr = this.parser.parseExpression();

        this.parser.getStream().expect(TokenType.TAG_END);

        return new DoNode(null, {expression: expr}, token, this.tag);
    }

    get tag(): string {
        return 'do';
    }
}
