/**
 * Marks a section of a template to be escaped or not.
 */
import {TokenParser} from "../token-parser";
import {Node} from "../node";
import {SyntaxError} from "../error/syntax";
import {AutoEscapeNode} from "../node/auto-escape";
import {Token, TokenType} from "twig-lexer";
import {ConstantExpressionNode} from "../node/expression/constant";

export class AutoEscapeTokenParser extends TokenParser {
    parse(token: Token): Node {
        const {line, column} = token;
        const stream = this.parser.getStream();

        let strategy: string;

        if (stream.test(TokenType.TAG_END)) {
            strategy = 'html';
        } else {
            let expr = this.parser.parseExpression();

            if (!(expr instanceof ConstantExpressionNode)) {
                throw new SyntaxError('An escaping strategy must be a string or false.', null, {
                    line,
                    column
                }, stream.source);
            }

            // todo: are we sure value is an attribute of expr?
            strategy = expr.attributes.value;
        }

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        return new AutoEscapeNode({strategy}, {body}, {line, column}, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endautoescape');
    }

    getTag() {
        return 'autoescape';
    }
}
