import {IncludeTokenParser} from "./include";
import {EmbedNode} from "../node/embed";
import {Token, TokenType} from "twig-lexer";
import {ConstantExpressionNode} from "../node/expression/constant";
import {NameExpressionNode} from "../node/expression/name";

export class EmbedTokenParser extends IncludeTokenParser {
    parse(token: Token) {
        let stream = this.parser.getStream();

        let parent = this.parser.parseExpression();

        let embedArguments = this.parseArguments();

        let variables = embedArguments.variables;
        let only = embedArguments.only;
        let ignoreMissing = embedArguments.ignoreMissing;

        let parentToken;
        let fakeParentToken;

        parentToken = fakeParentToken = new Token(TokenType.STRING, '__parent__', token.line, token.column);

        if (parent instanceof ConstantExpressionNode || parent instanceof NameExpressionNode) {
            parentToken = new Token(TokenType.STRING, parent.attributes.value, token.line, token.column);
        }

        // inject a fake parent to make the parent() function work
        stream.injectTokens([
            new Token(TokenType.TAG_START, '', token.line, token.column),
            new Token(TokenType.NAME, 'extends', token.line, token.column),
            parentToken,
            new Token(TokenType.TAG_END, '', token.line, token.column),
        ]);

        let template = this.parser.parseTemplate(stream, [this, this.decideBlockEnd], true);

        // override the parent with the correct one
        if (fakeParentToken === parentToken) {
            template.edges.parent = parent;
        }

        const embeddedModule = this.parser.embedTemplate(template);

        stream.expect(TokenType.TAG_END);

        // return new EmbedNode(module.getTemplateName(), module.getAttribute('index'), variables, only, ignoreMissing, token, this.getTag());
        return new EmbedNode({
            only,
            ignoreMissing,
            index: embeddedModule.attributes.index,
            name: template.attributes.source.name
        }, {
            variables,
            template: null
        }, token, this.tag);
    }

    decideBlockEnd(token: Token): boolean {
        return token.test(TokenType.NAME, 'endembed');
    }

    get tag(): string {
        return 'embed';
    }
}
