const {
    TwingEnvironment,
    TwingLexer,
    TwingLoaderNull,
    TwingOperator,
    TwingOperatorType,
    TwingOperatorAssociativity
} = require('../../../../../build/main');

const {typeToEnglish} = require('../../../../../build/lib/lexer');
const tap = require('tape');
const {TokenType} = require('twig-lexer');

tap.test('lexer', function (test) {
    test.test('constructor', function (test) {
        test.test('support passing variable_pair option', function (test) {
            let lexer = new TwingLexer(new TwingEnvironment(new TwingLoaderNull()), {
                variable_pair: ['<<', '>>']
            });

            let data = '<<foo>>';

            let tokens = lexer.tokenize(data);

            test.true(tokens[0].test(TokenType.VARIABLE_START, '<<'));
            test.true(tokens[1].test(TokenType.NAME, 'foo'));
            test.true(tokens[2].test(TokenType.VARIABLE_END, '>>'));

            test.end();
        });

        test.test('support passing comment_pair option', function (test) {
            let lexer = new TwingLexer(new TwingEnvironment(new TwingLoaderNull()), {
                comment_pair: ['<<', '>>']
            });

            let data = '<<foo>>';

            let tokens = lexer.tokenize(data);

            test.true(tokens[0].test(TokenType.COMMENT_START, '<<'));
            test.true(tokens[1].test(TokenType.TEXT, 'foo'));
            test.true(tokens[2].test(TokenType.COMMENT_END, '>>'));

            test.end();
        });

        test.test('support passing interpolation_pair option', function (test) {
            let lexer = new TwingLexer(new TwingEnvironment(new TwingLoaderNull()), {
                interpolation_pair: ['#<', '>']
            });

            let data = '{{"#<foo>>"}}';

            let tokens = lexer.tokenize(data);

            test.true(tokens[2].test(TokenType.INTERPOLATION_START, '#<'));
            test.true(tokens[3].test(TokenType.NAME, 'foo'));
            test.true(tokens[4].test(TokenType.INTERPOLATION_END, '>'));

            test.end();
        });

        test.test('support passing tag_pair option', function (test) {
            let lexer = new TwingLexer(new TwingEnvironment(new TwingLoaderNull()), {
                tag_pair: ['<<', '>>']
            });

            let data = '<<foo>>';

            let tokens = lexer.tokenize(data);

            test.true(tokens[0].test(TokenType.TAG_START, '<<'));
            test.true(tokens[1].test(TokenType.NAME, 'foo'));
            test.true(tokens[2].test(TokenType.TAG_END, '>>'));

            test.end();
        });

        test.test('support custom operators', function (test) {
            class CustomEnvironment extends TwingEnvironment {
                getBinaryOperators() {
                    return new Map([
                        ['foo', new TwingOperator('foo', TwingOperatorType.BINARY, 0, () => {
                            return null;
                        }, TwingOperatorAssociativity.LEFT)]
                    ]);
                }

                getUnaryOperators() {
                    return new Map([
                        ['bar', new TwingOperator('bar', TwingOperatorType.UNARY, 0, () => {
                            return null;
                        }, TwingOperatorAssociativity.LEFT)]
                    ]);
                }
            }

            let lexer = new TwingLexer(new CustomEnvironment(new TwingLoaderNull(), {}));

            let tokens = lexer.tokenize(`{{a foo b}}{{bar a}}`);

            test.true(tokens[3].test(TokenType.OPERATOR, 'foo'));
            test.true(tokens[8].test(TokenType.OPERATOR, 'bar'));

            test.end();
        });

        test.end();
    });

    test.test('should support type to english representation', function (test) {
        test.same(typeToEnglish(TokenType.TAG_END), 'end of statement block');
        test.same(typeToEnglish(TokenType.TAG_START), 'begin of statement block');
        test.same(typeToEnglish(TokenType.EOF), 'end of template');
        test.same(typeToEnglish(TokenType.INTERPOLATION_END), 'end of string interpolation');
        test.same(typeToEnglish(TokenType.INTERPOLATION_START), 'begin of string interpolation');
        test.same(typeToEnglish(TokenType.NAME), 'name');
        test.same(typeToEnglish(TokenType.NUMBER), 'number');
        test.same(typeToEnglish(TokenType.OPERATOR), 'operator');
        test.same(typeToEnglish(TokenType.PUNCTUATION), 'punctuation');
        test.same(typeToEnglish(TokenType.STRING), 'string');
        test.same(typeToEnglish(TokenType.TEXT), 'text');
        test.same(typeToEnglish(TokenType.VARIABLE_END), 'end of print statement');
        test.same(typeToEnglish(TokenType.VARIABLE_START), 'begin of print statement');
        test.same(typeToEnglish(TokenType.COMMENT_START), 'begin of comment statement');
        test.same(typeToEnglish(TokenType.COMMENT_END), 'end of comment statement');
        test.same(typeToEnglish(TokenType.ARROW), 'arrow function');

        try {
            typeToEnglish(-999);
        } catch (e) {
            test.same(e.message, 'Token of type "-999" does not exist.');
        }

        test.end();
    });

    test.end();
});
