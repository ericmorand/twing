/**
 * Loops over each item of a sequence.
 *
 * <pre>
 * <ul>
 *  {% for user in users %}
 *    <li>{{ user.username|e }}</li>
 *  {% endfor %}
 * </ul>
 * </pre>
 */
import {TokenParser} from "../token-parser";
import {Node} from "../node";
import {SpacelessNode} from "../node/spaceless";
import {Token, TokenType} from "twig-lexer";

export class SpacelessTokenParser extends TokenParser {
    parse(token: Token): Node {
        const {line, column} = token;

        let stream = this.parser.getStream();

        console.warn(`The "spaceless" tag in "${stream.source.name}" at line ${line} is deprecated since Twig 2.7, use the "spaceless" filter instead.`);

        stream.expect(TokenType.TAG_END);
        let body = this.parser.subparse([this, this.decideSpacelessEnd], true);
        stream.expect(TokenType.TAG_END);

        return new SpacelessNode(null, {body}, token, this.tag);
    }

    decideSpacelessEnd(token: Token) {
        return token.test(TokenType.NAME, 'endspaceless');
    }

    get tag(): string {
        return 'spaceless';
    }
}
