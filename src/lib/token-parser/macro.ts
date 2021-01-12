/**
 * Defines a macro.
 *
 * <pre>
 * {% macro input(name, value, type, size) %}
 *    <input type="{{ type|default('text') }}" name="{{ name }}" value="{{ value|e }}" size="{{ size|default(20) }}" />
 * {% endmacro %}
 * </pre>
 */
import {TokenParser} from "../token-parser";
import {SyntaxError} from "../error/syntax";
import {BodyNode} from "../node/body";

import {MacroNode} from "../node/macro";
import {Node, NodeEdges} from "../node";
import {Token, TokenType} from "twig-lexer";

export class MacroTokenParser extends TokenParser {
    parse(token: Token): Node {
        let stream = this.parser.getStream();
        let name = stream.expect(TokenType.NAME).value;
        let macroArguments = this.parser.parseArguments(true, true);

        stream.expect(TokenType.TAG_END);

        this.parser.pushLocalScope();

        let body = this.parser.subparse([this, this.decideBlockEnd], true);
        let nextToken = stream.nextIf(TokenType.NAME);

        if (nextToken) {
            let value = nextToken.value;

            if (value != name) {
                throw new SyntaxError(`Expected endmacro for macro "${name}" (but "${value}" given).`, null, stream.getCurrent(), stream.source);
            }
        }

        this.parser.popLocalScope();

        stream.expect(TokenType.TAG_END);

        this.parser.setMacro(name, new MacroNode({name}, {
            body: new BodyNode(null, {content: body}, token),
            arguments: macroArguments
        }, token, this.getTag()));

        return null;
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endmacro');
    }

    getTag() {
        return 'macro';
    }
}
