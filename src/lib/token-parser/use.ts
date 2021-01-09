import {TwingTokenParser} from "../token-parser";
import {SyntaxError} from "../error/syntax";
import {TwingNodeExpressionConstant, type as constantType} from "../node/expression/constant";
import {toTwingNodeNodes, Node} from "../node";
import {Token, TokenType} from "twig-lexer";
import {TwingNodeTrait} from "../node/trait";

export class TwingTokenParserUse extends TwingTokenParser {
    parse(token: Token) {
        const {line, column} = token;

        let template = this.parser.parseExpression();
        let stream = this.parser.getStream();

        if (template.type !== constantType) {
            throw new SyntaxError('The template references in a "use" statement must be a string.', stream.getCurrent().line, stream.getSourceContext());
        }

        let targets: Map<string, TwingNodeExpressionConstant<string>> = new Map();

        if (stream.nextIf(TokenType.NAME, 'with')) {
            do {
                let name = stream.expect(TokenType.NAME).value;
                let alias = name;

                if (stream.nextIf(TokenType.NAME, 'as')) {
                    alias = stream.expect(TokenType.NAME).value;
                }

                targets.set(name, new TwingNodeExpressionConstant(alias, line, column));

                if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                    break;
                }
            } while (true);
        }

        stream.expect(TokenType.TAG_END);

        this.parser.addTrait(new TwingNodeTrait(template, new Node(toTwingNodeNodes(targets), null, line, column), line, column))

        return new Node<null, null>(null, null);
    }

    getTag() {
        return 'use';
    }
}
