import {TokenParser} from "../token-parser";
import {ImportNode} from "../node/import";
import {AssignNameExpressionNode} from "../node/expression/assign-name";
import {Token, TokenType} from "twig-lexer";

/**
 * Imports macros.
 *
 * <pre>
 *   {% from 'forms.html' import forms %}
 * </pre>
 */
export class FromTokenParser extends TokenParser {
    parse(token: Token) {
        let templateName = this.parser.parseExpression();
        let stream = this.parser.getStream();

        stream.expect(TokenType.NAME, 'import');

        let targets = new Map();

        do {
            let macro: string = stream.expect(TokenType.NAME).value;
            let alias: string = macro;

            if (stream.nextIf(TokenType.NAME, 'as')) {
                alias = stream.expect(TokenType.NAME).value;
            }

            targets.set(macro, alias);

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        } while (true);

        stream.expect(TokenType.TAG_END);

        let variable = new AssignNameExpressionNode({value: this.parser.getVarName()}, null, token);
        let node = new ImportNode({
            global: true
        }, {
            templateName,
            variable
        }, token, this.getTag());

        for (let [name, alias] of targets) {
            this.parser.addImportedSymbol('function', alias, name, variable);
        }

        return node;
    }

    getTag() {
        return 'from';
    }
}
