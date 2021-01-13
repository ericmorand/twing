/**
 * Lexes a template string.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {Lexer as TwigLexer, SyntaxError as LexerSyntaxError, TokenType} from "twig-lexer";
import {Environment} from "./environment";
import {Source} from "./source";
import {TokenStream} from "./token-stream";
import {SyntaxError} from "./error/syntax";

export const typeToEnglish = (type: TokenType): string => {
    switch (type) {
        case TokenType.EOF:
            return 'end of template';
        case TokenType.TEXT:
            return 'text';
        case TokenType.TAG_START:
            return 'begin of statement block';
        case TokenType.VARIABLE_START:
            return 'begin of print statement';
        case TokenType.TAG_END:
            return 'end of statement block';
        case TokenType.VARIABLE_END:
            return 'end of print statement';
        case TokenType.NAME:
            return 'name';
        case TokenType.NUMBER:
            return 'number';
        case TokenType.STRING:
            return 'string';
        case TokenType.OPERATOR:
            return 'operator';
        case TokenType.PUNCTUATION:
            return 'punctuation';
        case TokenType.INTERPOLATION_START:
            return 'begin of string interpolation';
        case TokenType.INTERPOLATION_END:
            return 'end of string interpolation';
        case TokenType.COMMENT_START:
            return 'begin of comment statement';
        case TokenType.COMMENT_END:
            return 'end of comment statement';
        case TokenType.ARROW:
            return 'arrow function';
        default:
            throw new Error(`Token of type "${type}" does not exist.`)
    }
};

type LexerOptions = {
    interpolation_pair?: [string, string],
    comment_pair?: [string, string],
    tag_pair?: [string, string],
    variable_pair?: [string, string]
};

export class Lexer extends TwigLexer {
    private env: Environment;

    constructor(env: Environment, options: LexerOptions = {}) {
        super();

        this.env = env;

        if (options.interpolation_pair) {
            this.interpolationPair = options.interpolation_pair;
        }

        if (options.comment_pair) {
            this.commentPair = options.comment_pair;
        }

        if (options.tag_pair) {
            this.tagPair = options.tag_pair;
        }

        if (options.variable_pair) {
            this.variablePair = options.variable_pair;
        }

        // custom operators
        for (let operators of [env.binaryOperators, env.unaryOperators]) {
            for (let [name] of operators) {
                if (!this.operators.includes(name)) {
                    this.operators.push(name);
                }
            }
        }
    }

    tokenizeSource(source: Source): TokenStream {
        try {
            let tokens = this.tokenize(source.content);

            return new TokenStream(tokens, source);
        } catch (e) {
            throw new SyntaxError(e.message, null, (e as LexerSyntaxError), source, e);
        }
    }
}
