import * as tape from 'tape';
import {TokenStream} from "../../../../../../src/lib/token-stream";
import {NodeEnvironment} from "../../../../../../src/lib/environment/node";
import {Parser} from "../../../../../../src/lib/parser";
import {Lexer} from "../../../../../../src/lib/lexer";
import {PrintNode} from "../../../../../../src/lib/node/print";
import {MethodCallExpressionNode} from "../../../../../../src/lib/node/expression/method-call";

tape('Parser::parseSubscriptExpression', (test) => {
    const environment = new NodeEnvironment(null, {
        autoescape: false
    });

    test.test('resolve _self attributes as MethodCallExpressionNode', (test) => {
        const templates: Array<string> = [
            `{{ _self.foo }}`,
            `{{ _self.foo() }}`,
            `{{ _self.foo(1, 2, 3) }}`,
            `{{ _self['foo'] }}`,
            `{{ attribute(_self, "foo", []) }}`,
            `{{ attribute(_self, "foo", [1, 2, 3]) }}`
        ];

        for (let template of templates) {
            test.test(template, (test) => {
                const tokens = new Lexer(environment).tokenize(template);
                const stream = new TokenStream(tokens);
                const parser = new Parser(environment);

                const moduleNode = parser.parse(new TokenStream(stream.toAst()));
                const bodyContent = moduleNode.edges.template.edges.body.edges.content;

                if (bodyContent instanceof PrintNode) {
                    const methodCall = bodyContent.edges.content;

                    if (methodCall instanceof MethodCallExpressionNode) {
                        test.pass('resolved node is an instance of MethodCallExpressionNode');
                        test.same(methodCall.edges.template.attributes.value, '_self', 'resolved template is _self');
                        test.same(methodCall.attributes.method, 'foo', 'resolved macro is foo');
                    } else {
                        test.fail();
                    }
                } else {
                    test.fail();
                }

                test.end();
            });
        }

        test.end();
    });

    test.end();
});
