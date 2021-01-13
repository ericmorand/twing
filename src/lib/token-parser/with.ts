import {TokenParser} from "../token-parser";
import {WithNode} from "../node/with";
import {Token, TokenType} from "twig-lexer";
import {ExpressionNode} from "../node/expression";

export class WithTokenParser extends TokenParser {
    parse(token: Token) {
        const stream = this.parser.getStream();

        let variables: ExpressionNode<any> = null;
        let only: boolean = false;

        if (!stream.test(TokenType.TAG_END)) {
            variables = this.parser.parseExpression();

            only = stream.nextIf(TokenType.NAME, 'only') !== null;
        }

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideWithEnd], true);

        stream.expect(TokenType.TAG_END);

        return new WithNode({only}, {variables, body}, token, this.tag);
    }

    decideWithEnd(token: Token) {
        return token.test(TokenType.NAME, 'endwith');
    }

    get tag(): string {
        return 'with';
    }
}
