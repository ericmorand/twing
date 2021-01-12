import {TokenParser} from "../token-parser";
import {VerbatimNode} from "../node/verbatim";
import {Token, TokenType} from "twig-lexer";

export class VerbatimTokenParser extends TokenParser {
    /**
     * @param {Token} token
     *
     * @return VerbatimNode
     */
    parse(token: Token) {
        let stream = this.parser.getStream();

        stream.expect(TokenType.TAG_END);

        /**
         * @type {TwingNodeText}
         */
        let text = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        return new VerbatimNode({data: text.attributes.data}, null, token, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endverbatim');
    }

    getTag() {
        return 'verbatim';
    }
}
