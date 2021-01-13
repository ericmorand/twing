import {TokenParser} from "../token-parser";
import {Token, TokenType} from "twig-lexer";
import {LineNode} from "../node/line";

export class LineTokenParser extends TokenParser {
    parse(token: Token) {
        const {line, column} = token;
        const numberToken = this.parser.getStream().expect(TokenType.NUMBER);

        this.parser.getStream().expect(TokenType.TAG_END);

        return new LineNode({
            quantity: Number(numberToken.value)
        }, null, {line, column}, this.tag);
    }

    get tag(): string {
        return 'line';
    }
}
