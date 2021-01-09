import {TwingTokenParser} from "../token-parser";
import {SyntaxError} from "../error/syntax";
import {TwingNodeSandbox} from "../node/sandbox";
import {type as includeType} from "../node/include";
import {type as textType} from "../node/text";
import {Node} from "../node";
import {ctypeSpace} from "../helpers/ctype-space";
import {Token, TokenType} from "twig-lexer";

export class TwingTokenParserSandbox extends TwingTokenParser {
    parse(token: Token) {
        let stream = this.parser.getStream();

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        // in a sandbox tag, only include tags are allowed
        if (body.type !== includeType) {
            body.getNodes().forEach(function (node: Node) {
                if (!(node.is(textType) && ctypeSpace(node.getAttribute('data')))) {
                    if (!node.is(includeType)) {
                        throw new SyntaxError('Only "include" tags are allowed within a "sandbox" section.', node.getLine(), stream.getSourceContext());
                    }
                }
            });
        }

        return new TwingNodeSandbox(body, token.line, token.column, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endsandbox');
    }

    getTag() {
        return 'sandbox';
    }
}
