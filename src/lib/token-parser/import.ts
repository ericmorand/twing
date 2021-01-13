import {TokenParser} from "../token-parser";
import {AssignNameExpressionNode} from "../node/expression/assign-name";
import {ImportNode} from "../node/import";
import {Token, TokenType} from "twig-lexer";

export class ImportTokenParser extends TokenParser {
    parse(token: Token) {
        let templateName = this.parser.parseExpression();

        this.parser.getStream().expect(TokenType.NAME, 'as');

        // template alias
        let variable = new AssignNameExpressionNode({value: this.parser.getStream().expect(TokenType.NAME).value}, null, token);

        this.parser.getStream().expect(TokenType.TAG_END);
        this.parser.addImportedSymbol('template', variable.attributes.value);

        return new ImportNode({
            global: this.parser.isMainScope()
        }, {
            templateName,
            variable
        }, token, this.tag);
    }

    get tag(): string {
        return 'import';
    }
}
