import {TokenParser} from "../token-parser";
import {IncludeNode} from "../node/include";
import {ExpressionNode} from "../node/expression";
import {Token, TokenType} from "twig-lexer";

export class IncludeTokenParser extends TokenParser {
    parse(token: Token) {
        let expr = this.parser.parseExpression();

        let parsedArguments = this.parseArguments();

        return new IncludeNode({
            ignoreMissing: parsedArguments.ignoreMissing,
            only: parsedArguments.only
        }, {
            template: expr,
            variables: parsedArguments.variables
        }, token, this.tag);
    }

    get tag(): string {
        return 'include';
    }

    /**
     *
     * @returns {{variables: ExpressionNode, only: boolean, ignoreMissing: boolean}}
     */
    protected parseArguments(): { variables: ExpressionNode<any>; only: boolean; ignoreMissing: boolean } {
        let stream = this.parser.getStream();

        let ignoreMissing = false;

        if (stream.nextIf(TokenType.NAME, 'ignore')) {
            stream.expect(TokenType.NAME, 'missing');

            ignoreMissing = true;
        }

        let variables = null;

        if (stream.nextIf(TokenType.NAME, 'with')) {
            variables = this.parser.parseExpression();
        }

        let only = false;

        if (stream.nextIf(TokenType.NAME, 'only')) {
            only = true;
        }

        stream.expect(TokenType.TAG_END);

        return {
            variables: variables,
            only: only,
            ignoreMissing: ignoreMissing
        };
    }
}
