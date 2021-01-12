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
import {SyntaxError} from "../error/syntax";
import {Token, TokenType} from "twig-lexer";

export class ExtendsTokenParser extends TokenParser {
    parse(token: Token): Node {
        let stream = this.parser.getStream();

        if (this.parser.peekBlockStack()) {
            throw new SyntaxError('Cannot use "extend" in a block.', null, token, stream.source);
        } else if (!this.parser.isMainScope()) {
            throw new SyntaxError('Cannot use "extend" in a macro.', null, token, stream.source);
        }

        if (this.parser.getParent() !== null) {
            throw new SyntaxError('Multiple extends tags are forbidden.', null, token, stream.source);
        }

        this.parser.setParent(this.parser.parseExpression());

        stream.expect(TokenType.TAG_END);

        return null;
    }

    getTag() {
        return 'extends';
    }
}
