import * as tape from 'tape';
import * as sinon from 'sinon';
import {TwingEnvironmentNode} from "../../../../../src/lib/environment/node";
import {TwingParser} from "../../../../../src/lib/parser";
import {Node} from "../../../../../src/lib/node";
import {TokenStream} from "../../../../../src/lib/token-stream";
import {TokenParser} from "../../../../../src/lib/token-parser";
import {Token, TokenType} from "twig-lexer";
import {TwingNodeText} from "../../../../../src/lib/node/text";
import {SetNode} from "../../../../../src/lib/node/set";
import {TwingLoaderArray} from "../../../../../src/lib/loader/array";
import {Source} from "../../../../../src/lib/source";
import {SyntaxError} from "../../../../../src/lib/error/syntax";
import {TwingExtension} from "../../../../../src/lib/extension";
import {Operator, TwingOperatorType} from "../../../../../src/lib/operator";
import {ConstantExpressionNode} from "../../../../../src/lib/node/expression/constant";
import {Function} from "../../../../../src/lib/function";
import {Test} from "../../../../../src/lib/test";
import {Filter} from "../../../../../src/lib/filter";
import {ArrayExpressionNode} from "../../../../../src/lib/node/expression/array";
import {ConcatBinaryExpressionNode} from "../../../../../src/lib/node/expression/binary/concat";
import {NameExpressionNode} from "../../../../../src/lib/node/expression/name";
import {MockLoader} from "../../../../mock/loader";
import {MockEnvironment} from "../../../../mock/environment";
import {HashExpressionNode} from "../../../../../src/lib/node/expression/hash";
import {ExpressionNode} from "../../../../../src/lib/node/expression";
import {type} from "../../../../../src/lib/node/comment";

let testEnv = new TwingEnvironmentNode(null);

let getParser = function () {
    let parser = new TwingParser(testEnv);

    parser.setParent(new Node());
    parser['stream'] = new TokenStream([], new Source('', 'foo'));

    return parser;
};

class Parser extends TwingParser {
    parseArrow() {
        return super.parseArrow();
    }
}

class TwingTestExpressionParserExtension extends TwingExtension {
    getOperators() {
        return [
            new Operator('with-callable', TwingOperatorType.BINARY, 1, () => {
                    return new ConstantExpressionNode('3', 1, 1);
                }
            )
        ];
    }

    getFunctions() {
        return [
            new Function('deprecated', () => Promise.resolve(), [], {
                deprecated: true
            }),
            new Function('deprecated_with_version', () => Promise.resolve(), [], {
                deprecated: '1'
            }),
            new Function('deprecated_with_alternative', () => Promise.resolve(), [], {
                deprecated: '1',
                alternative: 'alternative'
            }),
        ];
    }

    getTests() {
        return [
            new Test('foo bar', () => Promise.resolve(true), [])
        ]
    }

    getFilters() {
        return [
            new Filter('deprecated', () => Promise.resolve(), [], {
                deprecated: true
            }),
            new Filter('deprecated_with_version', () => Promise.resolve(), [], {
                deprecated: '1'
            }),
            new Filter('deprecated_with_alternative', () => Promise.resolve(), [], {
                deprecated: '1',
                alternative: 'alternative'
            })
        ];
    }
}

class TestTokenParser extends TokenParser {
    parse(token: Token) {
        // simulate the parsing of another template right in the middle of the parsing of the active template
        this.parser.parse(new TokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'extends', 1, 0),
            new Token(TokenType.STRING, 'base', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ]));

        this.parser.getStream().expect(TokenType.TAG_END);

        return new Node();
    }

    getTag() {
        return 'test';
    }
}

/**
 *
 * @returns Array<{input; expected}>
 */
let getFilterBodyNodesData = function () {
    let input;

    return [
        {
            input: new Node(new Map([[0, new TwingNodeText('   ', 1, 0)]])),
            expected: new Node(),
        },
        {
            input: input = new Node(new Map([[0, new SetNode(false, new Node(), new Node(), 1, 0)]])),
            expected: input
        },
        {
            input: input = new Node(new Map([
                    ['0', new SetNode(
                        true,
                        new Node(),
                        new Node(new Map([[
                            0, new Node(new Map([[
                                0, new TwingNodeText('foo', 1, 0)
                            ]]))
                        ]])),
                        1, 0
                    )]
                ])
            ),
            expected: input
        },
    ];
};

let getFilterBodyNodesWithBOMData = function () {
    return [
        ' ',
        "\t",
        "\n",
        "\n\t\n   ",
    ];
};

tape('parser', (test) => {
    test.test('testUnknownTag', (test) => {
        let stream = new TokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'foo', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ], new Source('', 'foo'));

        let parser = new TwingParser(testEnv);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.message, 'Unknown "foo" tag. Did you mean "for" in "foo" at line 1?');
        }

        test.end();
    });

    test.test('testUnknownTagWithoutSuggestions', (test) => {
        let stream = new TokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'foobar', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ], new Source('', 'foo'));

        let parser = new TwingParser(testEnv);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.message, 'Unknown "foobar" tag in "foo" at line 1.');
        }

        test.end();
    });

    test.test('testFilterBodyNodes', (test) => {
        let parser = new TwingParser(testEnv);

        getFilterBodyNodesData().forEach(function (data) {
            test.same(parser.filterBodyNodes(data.input), data.expected);
        });

        test.end();
    });

    test.test('testFilterBodyNodesThrowsException', (test) => {
        let parser = getParser();

        let fixtures = [
            new TwingNodeText('foo', 1, 0),
            new Node(
                new Map([[0, new Node(
                    new Map([[0, new TwingNodeText('foo', 1, 0)]])
                )]])
            )
        ];

        try {
            fixtures.forEach(function (fixture) {
                parser.filterBodyNodes(fixture);
            });

            test.fail();
        } catch (e) {
            test.same(e.message, 'A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag in "foo" at line 1?');
        }

        test.end();
    });

    test.test('testFilterBodyNodesWithBOM', (test) => {
        let parser = getParser();

        let bomData = String.fromCharCode(0xEF, 0xBB, 0xBF);

        try {
            parser.filterBodyNodes(new TwingNodeText(bomData + 'not empty', 1, 0));

            test.fail();
        } catch (e) {
            test.same(e.message, 'A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag in "foo" at line 1?');
        }

        for (let emptyNode of getFilterBodyNodesWithBOMData()) {
            test.same(null, parser.filterBodyNodes(new TwingNodeText(bomData + emptyNode, 1, 0)));
        }

        test.end();
    });

    test.test('testParseIsReentrant', (test) => {
        let twing = new TwingEnvironmentNode(null, {
            autoescape: false
        });

        twing.addTokenParser(new TestTokenParser());

        let parser = new TwingParser(twing);

        parser.parse(new TokenStream([
            new Token(TokenType.TAG_START, '', 1, 0),
            new Token(TokenType.NAME, 'test', 1, 0),
            new Token(TokenType.TAG_END, '', 1, 0),
            new Token(TokenType.VARIABLE_START, '', 1, 0),
            new Token(TokenType.NAME, 'foo', 1, 0),
            new Token(TokenType.VARIABLE_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ]));

        test.isEqual(parser.getParent(), null);

        test.end();
    });

    test.test('testGetVarName', (test) => {
        let twing = new TwingEnvironmentNode(new TwingLoaderArray(new Map()), {
            autoescape: false
        });

        // The getVarName() must not depend on the template loaders,
        // If this test does not throw any exception, that's good.
        // see https://github.com/symfony/symfony/issues/4218
        try {
            let ast = twing.parse(twing.tokenize(new Source('{% from _self import foo %}\n\n{% macro foo() %}\n{{ foo }}\n{% endmacro %}', 'index')));

            test.ok(ast);
        } catch (err) {
            test.fail(err);
        }

        test.end();
    });

    test.test('should throw an error on missing tag name', (test) => {
        let twing = new TwingEnvironmentNode(null, {
            autoescape: false
        });

        twing.addTokenParser(new TestTokenParser());

        let parser = new TwingParser(twing);

        try {
            parser.parse(new TokenStream([
                new Token(TokenType.TAG_START, '', 1, 0),
                new Token(TokenType.VARIABLE_START, '', 1, 0),
                new Token(TokenType.TAG_END, '', 1, 0)
            ], new Source('', 'foo')));

            test.fail();
        } catch (e) {
            test.same(e.message, 'A block must start with a tag name in "foo" at line 1.');
        }

        test.end();
    });

    test.test('parse', (test) => {
        let twing = new TwingEnvironmentNode(null, {
            autoescape: false
        });

        let parser = new TwingParser(twing);

        let stub = sinon.stub(parser, 'subparse');

        stub.throws(new Error('foo'));

        try {
            parser.parse(new TokenStream([], new Source('', 'foo')));

            test.fail()
        } catch (e) {
            test.same(e.name, 'Error');
            test.same(e.message, 'foo');
        }

        stub.throws(new SyntaxError('foo.'));

        try {
            parser.parse(new TokenStream([], new Source('', 'foo')));

            test.fail()
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'foo in "foo".');
        }

        test.end();
    });

    test.test('subparse', (test) => {
        let twing = new TwingEnvironmentNode(null, {
            autoescape: false
        });

        let parser = new TwingParser(twing);

        try {
            parser.parse(new TokenStream([
                new Token(TokenType.TAG_START, '{%', 1, 0),
                new Token(TokenType.NAME, 'foo', 1, 0),
                new Token(TokenType.TAG_END, '{', 1, 0)
            ], new Source('', 'foo')), [false, () => {
                return false;
            }]);

            test.fail()
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unexpected "foo" tag in "foo" at line 1');
        }

        try {
            parser.parse(new TokenStream([
                new Token(-999 as any, null, 1, 0)
            ], new Source('', 'foo')), ['foo', () => {
                return false;
            }]);

            test.fail()
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Lexer or parser ended up in unsupported state in "foo" at line 1.');
        }

        test.end();
    });

    test.test('getImportedSymbol', (test) => {
        let twing = new TwingEnvironmentNode(null);
        let parser = new TwingParser(twing);

        Reflect.set(parser, 'importedSymbols', [new Map()]);
        parser.addImportedSymbol('foo', null);

        test.equals(parser.getImportedSymbol('foo', 'bar'), null);

        test.end();
    });

    test.test('hasMacro', (test) => {
        let twing = new TwingEnvironmentNode(null);
        let parser = new TwingParser(twing);

        Reflect.set(parser, 'macros', new Map([['foo', 'bar']]));

        test.true(parser.hasMacro('foo'));

        test.end();
    });

    test.test('supports comment tokens', (test) => {
        let twing = new TwingEnvironmentNode(null, {
            autoescape: false
        });

        let parser = new TwingParser(twing);

        let node = parser.parse(new TokenStream([
            new Token(TokenType.COMMENT_START, '', 1, 0),
            new Token(TokenType.TEXT, 'test', 1, 0),
            new Token(TokenType.COMMENT_END, '', 1, 0),
            new Token(TokenType.EOF, '', 1, 0),
        ], new Source('', 'foo')));

        let body = node.getNode('body');

        test.same(body.getNode(0).type, type);
        test.same(body.getNode(0).getAttribute('data'), 'test');

        test.end();
    });

    test.test('canOnlyAssignToNames', (test) => {
        let templatesAndMessages = [
            ['{% set false = "foo" %}', 'You cannot assign a value to "false" in "index" at line 1.'],
            ['{% set FALSE = "foo" %}', 'You cannot assign a value to "FALSE" in "index" at line 1.'],
            ['{% set true = "foo" %}', 'You cannot assign a value to "true" in "index" at line 1.'],
            ['{% set TRUE = "foo" %}', 'You cannot assign a value to "TRUE" in "index" at line 1.'],
            ['{% set none = "foo" %}', 'You cannot assign a value to "none" in "index" at line 1.'],
            ['{% set NONE = "foo" %}', 'You cannot assign a value to "NONE" in "index" at line 1.'],
            ['{% set null = "foo" %}', 'You cannot assign a value to "null" in "index" at line 1.'],
            ['{% set NULL = "foo" %}', 'You cannot assign a value to "NULL" in "index" at line 1.'],
            ['{% set 3 = "foo" %}', 'Only variables can be assigned to. Unexpected token "number" of value "3" ("name" expected) in "index" at line 1.'],
            ['{% set 1 + 2 = "foo" %}', 'Only variables can be assigned to. Unexpected token "number" of value "1" ("name" expected) in "index" at line 1.'],
            ['{% set "bar" = "foo" %}', 'Only variables can be assigned to. Unexpected token "string" of value "bar" ("name" expected) in "index" at line 1.'],
            ['{% set %}{% endset %})', 'Only variables can be assigned to. Unexpected token "end of statement block" of value "%}" ("name" expected) in "index" at line 1.']
        ];

        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let parser = new TwingParser(env);

        for (let templateAndMessage of templatesAndMessages) {
            let source = new Source(templateAndMessage[0], 'index');

            try {
                parser.parse(env.tokenize(source));

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, templateAndMessage[1]);
            }
        }

        test.end();
    });

    test.test('arrayExpression', (test) => {
        let templatesAndNodes: [string, ExpressionNode][] = [
            // simple array
            ['{{ [1, 2] }}', new ArrayExpressionNode(new Map([
                ['0', new ConstantExpressionNode(0, 1, 5)],
                ['1', new ConstantExpressionNode(1, 1, 5)],

                ['2', new ConstantExpressionNode(1, 1, 8)],
                ['3', new ConstantExpressionNode(2, 1, 8)]
            ]), 1, 5)
            ],

            // array with trailing ,
            ['{{ [1, 2, ] }}', new ArrayExpressionNode(new Map([
                ['0', new ConstantExpressionNode(0, 1, 5)],
                ['1', new ConstantExpressionNode(1, 1, 5)],

                ['2', new ConstantExpressionNode(1, 1, 8)],
                ['3', new ConstantExpressionNode(2, 1, 8)]
            ]), 1, 5)
            ],

            // simple hash
            ['{{ {"a": "b", "b": "c"} }}', new ArrayExpressionNode(new Map([
                ['0', new ConstantExpressionNode('a', 1, 5)],
                ['1', new ConstantExpressionNode('b', 1, 10)],

                ['2', new ConstantExpressionNode('b', 1, 15)],
                ['3', new ConstantExpressionNode('c', 1, 20)]
            ]), 1, 5)
            ],

            // hash with trailing ,
            ['{{ {"a": "b", "b": "c", } }}', new ArrayExpressionNode(new Map([
                ['0', new ConstantExpressionNode('a', 1, 5)],
                ['1', new ConstantExpressionNode('b', 1, 10)],

                ['2', new ConstantExpressionNode('b', 1, 15)],
                ['3', new ConstantExpressionNode('c', 1, 20)]
            ]), 1, 5)
            ],

            // hash in an array
            ['{{ [1, {"a": "b", "b": "c"}] }}', new ArrayExpressionNode(new Map([
                ['0', new ConstantExpressionNode(0, 1, 5)],
                ['1', new ConstantExpressionNode(1, 1, 5)],

                ['2', new ConstantExpressionNode(1, 1, 9)],
                ['3', new ArrayExpressionNode(new Map([
                    ['0', new ConstantExpressionNode('a', 1, 9)],
                    ['1', new ConstantExpressionNode('b', 1, 14)],

                    ['2', new ConstantExpressionNode('b', 1, 19)],
                    ['3', new ConstantExpressionNode('c', 1, 24)]
                ]), 1, 9)]
            ]), 1, 5)
            ],

            // array in a hash
            ['{{ {"a": [1, 2], "b": "c"} }}', new ArrayExpressionNode(new Map([
                ['0', new ConstantExpressionNode('a', 1, 5)],
                ['1', new ArrayExpressionNode(new Map([
                    ['0', new ConstantExpressionNode(0, 1, 11)],
                    ['1', new ConstantExpressionNode(1, 1, 11)],

                    ['2', new ConstantExpressionNode(1, 1, 14)],
                    ['3', new ConstantExpressionNode(2, 1, 14)]
                ]), 1, 11)],
                ['2', new ConstantExpressionNode('b', 1, 18)],
                ['3', new ConstantExpressionNode('c', 1, 23)]
            ]), 1, 5)
            ],
        ];

        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let parser = new TwingParser(env);

        for (let templateAndNodes of templatesAndNodes) {
            let stream = env.tokenize(new Source(templateAndNodes[0], ''));

            let actual = parser.parse(stream)
                .getNode('body')
                .getNode(0)
                .getNode('expr');

            let expected = templateAndNodes[1];

            expected.setTemplateName('');

            test.same(actual, expected);
        }

        test.end();
    });

    test.test('arraySyntaxError', (test) => {
        let templatesAndMessages = [
            ['{{ [1, "a": "b"] }}', 'An array element must be followed by a comma. Unexpected token "punctuation" of value ":" ("punctuation" expected with value ",") in "index" at line 1.'],
            ['{{ {"a": "b", 2} }}', 'A hash key must be followed by a colon (:). Unexpected token "punctuation" of value "}" ("punctuation" expected with value ":") in "index" at line 1.']
        ];

        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let parser = new TwingParser(env);

        for (let templateAndMessage of templatesAndMessages) {
            let source = new Source(templateAndMessage[0], 'index');

            try {
                parser.parse(env.tokenize(source));

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, templateAndMessage[1]);
            }
        }

        test.end();
    });

    test.test('stringExpressionDoesNotConcatenateTwoConsecutiveStrings', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{{ "a" "b" }}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unexpected token "string" of value "b" ("end of print statement" expected) in "index" at line 1.');
        }

        test.end();
    });

    test.test('stringExpression', (test) => {
        let templatesAndNodes: [string, ExpressionNode][] = [
            ['{{ "foo" }}', new ConstantExpressionNode('foo', 1, 4)],
            ['{{ "foo #{bar}" }}', new ConcatBinaryExpressionNode(
                [
                    new ConstantExpressionNode('foo ', 1, 5),
                    new NameExpressionNode('bar', 1, 11)
                ], 1, 11)],
            ['{{ "foo #{bar} baz" }}', new ConcatBinaryExpressionNode([
                    new ConcatBinaryExpressionNode(
                        [
                            new ConstantExpressionNode('foo ', 1, 5),
                            new NameExpressionNode('bar', 1, 11)
                        ], 1, 11
                    ),
                    new ConstantExpressionNode(' baz', 1, 15)
                ], 1, 15
            )],
            ['{{ "foo #{"foo #{bar} baz"} baz" }}', new ConcatBinaryExpressionNode(
                [
                    new ConcatBinaryExpressionNode(
                        [
                            new ConstantExpressionNode('foo ', 1, 5),
                            new ConcatBinaryExpressionNode(
                                [
                                    new ConcatBinaryExpressionNode([
                                        new ConstantExpressionNode('foo ', 1, 12),
                                        new NameExpressionNode('bar', 1, 18)
                                    ], 1, 18),
                                    new ConstantExpressionNode(' baz', 1, 22)
                                ], 1, 22)
                        ], 1, 22),
                    new ConstantExpressionNode(' baz', 1, 28)
                ], 1, 28)
            ]
        ];

        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let parser = new TwingParser(env);

        for (let templateAndNodes of templatesAndNodes) {
            let stream = env.tokenize(new Source(templateAndNodes[0], ''));

            let actual = parser.parse(stream)
                .getNode('body')
                .getNode(0)
                .getNode('expr');

            let expected = templateAndNodes[1];

            expected.setTemplateName('');

            test.same(actual, expected);
        }
        test.end();
    });

    test.test('attributeCallDoesNotSupportNamedArguments', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{{ foo.bar(name="Foo") }}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Arguments must be separated by a comma. Unexpected token "operator" of value "=" ("punctuation" expected with value ",") in "index" at line 1.');
        }

        test.end();
    });

    test.test('macroCallDoesNotSupportNamedArguments', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{% from _self import foo %}{% macro foo() %}{% endmacro %}{{ foo(name="Foo") }}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Arguments must be separated by a comma. Unexpected token "operator" of value "=" ("punctuation" expected with value ",") in "index" at line 1.');
        }

        test.end();
    });

    test.test('macroCallDoesNotSupportNamedArguments', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{% macro foo("a") %}{% endmacro %}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'An argument must be a name. Unexpected token "string" of value "a" ("name" expected) in "index" at line 1.');
        }

        test.end();
    });

    test.test('macroDefinitionDoesNotSupportNonConstantDefaultValues', (test) => {
        let templates = [
            '{% macro foo(name = "a #{foo} a") %}{% endmacro %}',
            '{% macro foo(name = [["b", "a #{foo} a"]]) %}{% endmacro %}'
        ];

        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let parser = new TwingParser(env);

        for (let template of templates) {
            let source = new Source(template, 'index');
            let stream = env.tokenize(source);

            try {
                parser.parse(stream);

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'A default value for an argument must be a constant (a boolean, a string, a number, or an array) in "index" at line 1.');
            }
        }

        test.end();
    });

    test.test('macroDefinitionSupportsConstantDefaultValues', (test) => {
        let templates = [
            '{% macro foo(name = "aa") %}{% endmacro %}',
            '{% macro foo(name = 12) %}{% endmacro %}',
            '{% macro foo(name = true) %}{% endmacro %}',
            '{% macro foo(name = ["a"]) %}{% endmacro %}',
            '{% macro foo(name = [["a"]]) %}{% endmacro %}',
            '{% macro foo(name = {a: "a"}) %}{% endmacro %}',
            '{% macro foo(name = {a: {b: "a"}}) %}{% endmacro %}'
        ];

        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let parser = new TwingParser(env);

        for (let template of templates) {
            let source = new Source(template, 'index');
            let stream = env.tokenize(source);

            test.ok(parser.parse(stream), 'should not throw an error');
        }

        test.end();
    });

    test.test('unknownFunction', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{{ cycl() }}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "cycl" function. Did you mean "cycle" in "index" at line 1?');
        }

        test.end();
    });

    test.test('unknownFunctionWithoutSuggestions', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{{ foobar() }}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "foobar" function in "index" at line 1.');
        }

        test.end();
    });

    test.test('unknownFilter', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{{  1|lowe }}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "lowe" filter. Did you mean "lower" in "index" at line 1?');
        }

        test.end();
    });

    test.test('unknownFilterWithoutSuggestions', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{{ 1|foobar }}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "foobar" filter in "index" at line 1.');
        }

        test.end();
    });

    test.test('unknownTest', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{{  1 is nul }}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "nul" test. Did you mean "null" in "index" at line 1?');
        }

        test.end();
    });

    test.test('unknownTestWithoutSuggestions', (test) => {
        let loader = new MockLoader();
        let env = new MockEnvironment(loader, {cache: false, autoescape: false});
        let source = new Source('{{ 1 is foobar}}', 'index');
        let stream = env.tokenize(source);
        let parser = new TwingParser(env);

        try {
            parser.parse(stream);

            test.fail();
        } catch (e) {
            test.same(e.name, 'TwingErrorSyntax');
            test.same(e.message, 'Unknown "foobar" test in "index" at line 1.');
        }

        test.end();
    });

    test.test('parseExpression', (test) => {
        let env = new TwingEnvironmentNode(new MockLoader());

        env.addExtension(new TwingTestExpressionParserExtension(), 'TwingTestExpressionParserExtension');

        let stream = new TokenStream([
            new Token(TokenType.NUMBER, '1', 1, 1),
            new Token(TokenType.OPERATOR, 'with-callable', 1, 1),
            new Token(TokenType.NUMBER, '2', 1, 1),
            new Token(TokenType.VARIABLE_END, null, 1, 1)
        ]);

        let parser = new TwingParser(env);

        Reflect.set(parser, 'stream', stream);

        let expression = parser.parseExpression();

        test.true(expression instanceof ConstantExpressionNode);
        test.looseEqual(expression.getAttribute('value'), 3);

        test.end();
    });

    test.test('getFunctionNode', (test) => {
        let env = new MockEnvironment(new MockLoader());
        let parser = new TwingParser(env);

        let stream = new TokenStream([
            new Token(TokenType.PUNCTUATION, '(', 1, 1),
            new Token(TokenType.PUNCTUATION, ')', 1, 1),
            new Token(TokenType.VARIABLE_END, null, 1, 1)
        ], new Source('', 'foo'));

        Reflect.set(parser, 'stream', stream);

        test.test('attribute', (test) => {
            try {
                parser.getFunctionNode('attribute', 1, 1);

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'The "attribute" function takes at least two arguments (the variable and the attributes) in "foo" at line 1.');
            }

            test.end();
        });

        test.test('parent', (test) => {
            let parser = new TwingParser(env);

            let stream = new TokenStream([
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.PUNCTUATION, ')', 1, 1),
                new Token(TokenType.VARIABLE_END, null, 1, 1)
            ], new Source('', 'foo'));

            Reflect.set(parser, 'stream', stream);

            sinon.stub(parser, 'getBlockStack').returns([]);

            try {
                parser.getFunctionNode('parent', 1, 1);

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'Calling "parent" outside a block is forbidden in "foo" at line 1.');
            }

            test.end();
        });

        test.test('deprecated function', (test) => {
            let env = new MockEnvironment(new MockLoader());

            env.addExtension(new TwingTestExpressionParserExtension(), 'foo');

            let testCases: [string, boolean, string][] = [
                ['deprecated', false, 'Twing Function "deprecated" is deprecated in "index" at line 1.'],
                ['deprecated_with_version', false, 'Twing Function "deprecated_with_version" is deprecated since version 1 in "index" at line 1.'],
                ['deprecated_with_alternative', false, 'Twing Function "deprecated_with_alternative" is deprecated since version 1. Use "alternative" instead in "index" at line 1.'],
                ['deprecated', true, 'Twing Function "deprecated" is deprecated in "index.html.twig" at line 1.']
            ];

            let parser = new TwingParser(env);

            sinon.stub(parser, 'getImportedSymbol').returns(null);

            for (let testCase of testCases) {
                let stream = new TokenStream([
                    new Token(TokenType.PUNCTUATION, '(', 1, 1),
                    new Token(TokenType.PUNCTUATION, ')', 1, 1),
                    new Token(TokenType.VARIABLE_END, null, 1, 1)
                ], new Source('', testCase[1] ? 'index.html.twig' : 'index'));

                Reflect.set(parser, 'stream', stream);

                let originalWrite = process.stdout.write;

                process.stdout.write = (chunk: string | Buffer): boolean => {
                    process.stdout.write = originalWrite;

                    test.same(chunk, testCase[2], testCase[0]);

                    return true;
                };

                parser.getFunctionNode(testCase[0], 1, 1);
            }

            test.end();
        });

        test.end();
    });

    test.test('parseHashExpression', (test) => {
        let env = new TwingEnvironmentNode(new MockLoader());

        test.test('with key as an expression', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.PUNCTUATION, '{', 1, 1),
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.STRING, '1', 1, 1),
                new Token(TokenType.PUNCTUATION, ')', 1, 1),
                new Token(TokenType.PUNCTUATION, ':', 1, 1),
                new Token(TokenType.STRING, 'bar', 1, 1),
                new Token(TokenType.PUNCTUATION, '}', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ]);

            let parser = new TwingParser(env);

            Reflect.set(parser, 'stream', stream);

            let expression = parser.parseHashExpression();

            test.true(expression instanceof HashExpressionNode);

            test.end();
        });

        test.test('with key as an expression', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.PUNCTUATION, '{', 1, 1),
                new Token(TokenType.OPERATOR, 'foo', 1, 1)
            ], new Source('', 'foo'));

            let parser = new TwingParser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseHashExpression();

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "operator" of value "foo" in "foo" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.test('parseSubscriptExpression', (test) => {
        let env = new TwingEnvironmentNode(new MockLoader());

        test.test('with dot syntax and non-name/number token', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.PUNCTUATION, '.', 1, 1),
                new Token(TokenType.STRING, 'bar', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ], new Source('', 'foo'));

            let parser = new TwingParser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseSubscriptExpression(new ConstantExpressionNode('foo', 1, 1));

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'Expected name or number in "foo" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.test('parseTestExpression', (test) => {
        let env = new TwingEnvironmentNode(new MockLoader());

        env.addExtension(new TwingTestExpressionParserExtension(), 'foo');

        test.test('with not existing 2-words test', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.NAME, 'foo', 1, 1),
                new Token(TokenType.NAME, 'bar2', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ], new Source('', 'foo'));

            let parser = new TwingParser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseTestExpression(new ConstantExpressionNode(1, 1, 1));

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'Unknown "foo bar2" test. Did you mean "foo bar" in "foo" at line 1?');
            }

            test.end();
        });

        test.end();
    });

    test.test('parseArguments', (test) => {
        let env = new TwingEnvironmentNode(new MockLoader());

        test.test('with non-name named argument', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.NUMBER, '5', 1, 1),
                new Token(TokenType.OPERATOR, '=', 1, 1),
                new Token(TokenType.NUMBER, '5', 1, 1),
                new Token(TokenType.PUNCTUATION, ')', 1, 1)
            ], new Source('', 'foo'));

            let parser = new TwingParser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseArguments(true);

                test.fail();
            } catch (e) {
                test.same(e.name, 'TwingErrorSyntax');
                test.same(e.message, 'A parameter name must be a string, "TwingNodeExpressionConstant" given in "foo" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.test('parseFilterExpressionRaw', (test) => {
        test.test('deprecated filter', (test) => {
            let env = new TwingEnvironmentNode(new MockLoader());

            env.addExtension(new TwingTestExpressionParserExtension(), 'foo');

            let testCases: [string, boolean, string][] = [
                ['deprecated', false, 'Twing Filter "deprecated" is deprecated in "index" at line 1.'],
                ['deprecated_with_version', false, 'Twing Filter "deprecated_with_version" is deprecated since version 1 in "index" at line 1.'],
                ['deprecated_with_alternative', false, 'Twing Filter "deprecated_with_alternative" is deprecated since version 1. Use "alternative" instead in "index" at line 1.'],
                ['deprecated', true, 'Twing Filter "deprecated" is deprecated in "index.html.twig" at line 1.']
            ];

            let parser = new TwingParser(env);

            for (let testCase of testCases) {
                let stream = new TokenStream([
                    new Token(TokenType.NAME, testCase[0], 1, 1),
                    new Token(TokenType.EOF, null, 1, 1)
                ], new Source('', testCase[1] ? 'index.html.twig' : 'index'));

                Reflect.set(parser, 'stream', stream);

                let originalWrite = process.stdout.write;

                process.stdout.write = (chunk: Buffer | string): boolean => {
                    process.stdout.write = originalWrite;

                    test.same(chunk, testCase[2], testCase[0]);

                    return true;
                };

                parser.parseFilterExpressionRaw(new ConstantExpressionNode(1, 1, 1), testCase[0]);
            }

            test.end();
        });

        test.end();
    });

    test.test('parseArrow', (test) => {
        let env = new TwingEnvironmentNode(new MockLoader());

        test.test('returns null when closing parenthesis is missing', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.STRING, 'bar', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ], new Source('', 'foo'));

            let parser = new Parser(env);

            Reflect.set(parser, 'stream', stream);

            let expr = parser.parseArrow();

            test.same(expr, null);

            test.end();
        });

        test.test('returns null when arrow is missing', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.STRING, 'bar', 1, 1),
                new Token(TokenType.PUNCTUATION, ')', 1, 1),
                new Token(TokenType.STRING, '=>', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ], new Source('', 'foo'));

            let parser = new Parser(env);

            Reflect.set(parser, 'stream', stream);

            let expr = parser.parseArrow();

            test.same(expr, null);

            test.end();
        });

        test.test('with non-name token', (test) => {
            let stream = new TokenStream([
                new Token(TokenType.PUNCTUATION, '(', 1, 1),
                new Token(TokenType.STRING, 'bar', 1, 1),
                new Token(TokenType.PUNCTUATION, ')', 1, 1),
                new Token(TokenType.ARROW, '=>', 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ], new Source('', 'foo'));

            let parser = new Parser(env);

            Reflect.set(parser, 'stream', stream);

            try {
                parser.parseArrow();

                test.fail('should throw an error');
            } catch (e) {
                test.same(e.getMessage(), 'Unexpected token "string" of value "bar" in "foo" at line 1.');
            }

            test.end();
        });

        test.end();
    });

    test.end();
});
