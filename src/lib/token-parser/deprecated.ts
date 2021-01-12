import {TokenParser} from "../token-parser";
import {DeprecatedNode} from "../node/deprecated";
import {Token, TokenType} from "twig-lexer";

/**
 * Deprecates a section of a template.
 *
 * <pre>
 * {% deprecated 'The "base.twig" template is deprecated, use "layout.twig" instead.' %}
 *
 * {% extends 'layout.html.twig' %}
 * </pre>
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class DeprecatedTokenParser extends TokenParser {
    parse(token: Token) {
        let expression = this.parser.parseExpression();

        this.parser.getStream().expect(TokenType.TAG_END);

        return new DeprecatedNode(null, {expression}, token, this.getTag());
    }

    getTag() {
        return 'deprecated';
    }
}
