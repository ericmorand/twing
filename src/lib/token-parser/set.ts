import {TwingTokenParser} from "../token-parser";
import {TwingErrorSyntax} from "../error/syntax";
import {TwingNodeSet} from "../node/set";
import {Token, TokenType} from "twig-lexer";

export class TwingTokenParserSet extends TwingTokenParser {
    parse(token: Token) {
        const {line, column} = token;
        const stream = this.parser.getStream();
        const names = this.parser.parseAssignmentExpression();

        let capture = false;
        let values;

        if (stream.nextIf(TokenType.OPERATOR, '=')) {
            values = this.parser.parseMultiTargetExpression();

            stream.expect(TokenType.TAG_END);

            if (names.nodesCount !== values.nodesCount) {
                throw new TwingErrorSyntax('When using set, you must have the same number of variables and assignments.', stream.getCurrent().line, stream.getSourceContext());
            }
        } else {
            capture = true;

            if (names.nodesCount > 1) {
                throw new TwingErrorSyntax('When using set with a block, you cannot have a multi-target.', stream.getCurrent().line, stream.getSourceContext());
            }

            stream.expect(TokenType.TAG_END);

            values = this.parser.subparse([this, this.decideBlockEnd], true);

            stream.expect(TokenType.TAG_END);
        }

        return new TwingNodeSet({capture}, {names, values}, line, column, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endset');
    }

    getTag() {
        return 'set';
    }
}
