import {TokenParser} from "../token-parser";
import {SyntaxError} from "../error/syntax";
import {SetNode} from "../node/set";
import {Token, TokenType} from "twig-lexer";

export class SetTokenParser extends TokenParser {
    parse(token: Token) {
        const {line, column} = token;
        const stream = this.parser.getStream();
        const names = this.parser.parseAssignmentExpression();

        let capture = false;
        let values;

        if (stream.nextIf(TokenType.OPERATOR, '=')) {
            values = this.parser.parseMultiTargetExpression();

            stream.expect(TokenType.TAG_END);

            if (names.edgesCount !== values.edgesCount) {
                throw new SyntaxError('When using set, you must have the same number of variables and assignments.', null, stream.getCurrent(), stream.source);
            }
        } else {
            capture = true;

            if (names.edgesCount > 1) {
                throw new SyntaxError('When using set with a block, you cannot have a multi-target.', null, stream.getCurrent(), stream.source);
            }

            stream.expect(TokenType.TAG_END);

            values = this.parser.subparse([this, this.decideBlockEnd], true);

            stream.expect(TokenType.TAG_END);
        }

        return new SetNode({capture}, {names, values}, {line, column}, this.tag);
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endset');
    }

    get tag(): string {
        return 'set';
    }
}
