import {TokenParser} from "../token-parser";
import {FlushNode} from "../node/flush";
import {Token, TokenType} from "twig-lexer";

export class FlushTokenParser extends TokenParser {
    parse(token: Token) {
        this.parser.getStream().expect(TokenType.TAG_END);

        return new FlushNode(null, null, token, this.getTag());
    }

    getTag() {
        return 'flush';
    }
}
