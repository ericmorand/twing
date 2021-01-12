import {TokenParser} from "../token-parser";
import {SyntaxError} from "../error/syntax";
import {SandboxNode} from "../node/sandbox";
import {IncludeNode} from "../node/include";
import {TwingNodeText} from "../node/text";
import {ctypeSpace} from "../helpers/ctype-space";
import {Token, TokenType} from "twig-lexer";

export class SandboxTokenParser extends TokenParser {
    parse(token: Token) {
        const {line, column} = token;
        const stream = this.parser.getStream();

        stream.expect(TokenType.TAG_END);

        const body = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        // in a sandbox tag, only include tags are allowed
        if (body instanceof IncludeNode) {
            for (let [, node] of body) {
                if (!(node instanceof TwingNodeText && ctypeSpace(node.attributes.data))) {
                    if (!(node instanceof IncludeNode)) {
                        throw new SyntaxError('Only "include" tags are allowed within a "sandbox" section.', null, node.location, stream.source);
                    }
                }
            }
        }

        return new SandboxNode(null, {body}, {line, column}, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endsandbox');
    }

    getTag() {
        return 'sandbox';
    }
}
