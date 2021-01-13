import {TokenParser} from "../token-parser";
import {SyntaxError} from "../error/syntax";
import {ConstantExpressionNode} from "../node/expression/constant";
import {toNodeEdges, Node} from "../node";
import {Token, TokenType} from "twig-lexer";
import {TraitNode} from "../node/trait";

export class UseTokenParser extends TokenParser {
    parse(token: Token) {
        let template = this.parser.parseExpression();
        let stream = this.parser.getStream();

        if (template instanceof ConstantExpressionNode) {
            throw new SyntaxError('The template references in a "use" statement must be a string.', null, stream.getCurrent(), stream.source);
        }

        let targets: Map<string, ConstantExpressionNode<string>> = new Map();

        if (stream.nextIf(TokenType.NAME, 'with')) {
            do {
                let name = stream.expect(TokenType.NAME).value;
                let alias: string = name;

                if (stream.nextIf(TokenType.NAME, 'as')) {
                    alias = stream.expect(TokenType.NAME).value;
                }

                targets.set(name, new ConstantExpressionNode({value: alias}, null, token));

                if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                    break;
                }
            } while (true);
        }

        stream.expect(TokenType.TAG_END);

        this.parser.addTrait(new TraitNode(null, {
            template,
            targets: new Node<null>(null, toNodeEdges(targets), token)
        }, token));

        return new Node<null, null>(null, null, token);
    }

    get tag(): string {
        return 'use';
    }
}
