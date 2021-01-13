import * as tape from 'tape';
import {Operator, TwingOperatorType} from "../../../../../src/lib/operator";
import {Extension} from "../../../../../src/lib/extension";
import {ExtensionSet} from "../../../../../src/lib/extension-set";
import {FilterTokenParser} from "../../../../../src/lib/token-parser/filter";
import {Test} from "../../../../../src/lib/test";
import {Filter} from "../../../../../src/lib/filter";
import {Function} from "../../../../../src/lib/function";
import {SourceMapNodeFactory} from "../../../../../src/lib/source-map/node-factory";
import {TokenParser} from "../../../../../src/lib/token-parser";
import {Token} from "twig-lexer";
import {Node} from "../../../../../src/lib/node";
import {BaseNodeVisitor} from "../../../../../src/lib/base-node-visitor";
import {Environment} from "../../../../../src/lib/environment";
import {spy} from "sinon";

class TwingTestExtensionSetExtension extends Extension {
    getOperators() {
        return [
            new Operator('foo', TwingOperatorType.UNARY, 1, () => null),
            new Operator('bar', TwingOperatorType.BINARY, 1, () => null)
        ];
    }
}

class TwingTestExtensionSetTokenParser extends TokenParser {
    tag() {
        return 'foo';
    }

    parse(token: Token): Node {
        return null;
    }
}

class TwingTestExtensionSetNodeVisitor extends BaseNodeVisitor {
    protected doEnterNode(node: Node, env: Environment): Node {
        return undefined;
    }

    protected doLeaveNode(node: Node, env: Environment): Node {
        return undefined;
    }

    getPriority(): number {
        return 0;
    }

}

tape('extension-set', (test) => {
    test.test('addExtension', (test) => {
        let extensionSet = new ExtensionSet();

        extensionSet.addExtension(new TwingTestExtensionSetExtension(), 'TwingTestExtensionSetExtension');

        test.true(extensionSet.hasExtension('TwingTestExtensionSetExtension'));

        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();

            // initialize the extension set
            extensionSet.getFunctions();

            try {
                extensionSet.addExtension(new TwingTestExtensionSetExtension(), 'TwingTestExtensionSetExtension');

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to register extension "TwingTestExtensionSetExtension" as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('addTokenParser', (test) => {
        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();
            // initialize the extension set
            extensionSet.getFunctions();

            try {
                extensionSet.addTokenParser(new TwingTestExtensionSetTokenParser());

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to add token parser "foo" as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('addNodeVisitor', (test) => {
        test.test('already registered', (test) => {
            let extensionSet = new ExtensionSet();
            let parser = new FilterTokenParser();

            extensionSet.addTokenParser(parser);

            try {
                extensionSet.addTokenParser(new FilterTokenParser());

                test.fail();
            } catch (e) {
                test.same(e.message, 'Tag "filter" is already registered.');
            }

            test.end();
        });

        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();
            // initialize the extension set
            extensionSet.getFunctions();

            try {
                extensionSet.addNodeVisitor(new TwingTestExtensionSetNodeVisitor());

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to add a node visitor as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('addTest', (test) => {
        test.test('already registered', (test) => {
            let extensionSet = new ExtensionSet();

            let test_ = new Test('foo', () => Promise.resolve(true), []);

            extensionSet.addTest(test_);

            try {
                extensionSet.addTest(test_);

                test.fail();
            } catch (e) {
                test.same(e.message, 'Test "foo" is already registered.');
            }

            test.end();
        });

        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();
            // initialize the extension set
            extensionSet.getTests();

            try {
                extensionSet.addTest(new Test('foo', () => Promise.resolve(true), []));

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to add test "foo" as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('getTests', (test) => {
        let extensionSet = new ExtensionSet();
        extensionSet.getTests();

        test.true(extensionSet.isInitialized());

        test.end();
    });

    test.test('addFilter', (test) => {
        test.test('already registered', (test) => {
            let extensionSet = new ExtensionSet();

            let filter = new Filter('foo', () => Promise.resolve(), []);

            extensionSet.addFilter(filter);

            try {
                extensionSet.addFilter(filter);

                test.fail();
            } catch (e) {
                test.same(e.message, 'Filter "foo" is already registered.');
            }

            test.end();
        });

        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();
            // initialize the extension set
            extensionSet.getFilters();

            try {
                extensionSet.addFilter(new Filter('foo', () => Promise.resolve(), []));

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to add filter "foo" as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('getFilters', (test) => {
        let extensionSet = new ExtensionSet();
        extensionSet.getFilters();

        test.true(extensionSet.isInitialized());

        test.end();
    });

    test.test('addTest', (test) => {
        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();
            // initialize the extension set
            extensionSet.getFunctions();

            try {
                extensionSet.addTest(new Test('foo', () => Promise.resolve(true), []));

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to add test "foo" as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('addFunction', (test) => {
        test.test('already registered', (test) => {
            let extensionSet = new ExtensionSet();

            let function_ = new Function('foo', () => Promise.resolve(), []);

            extensionSet.addFunction(function_);

            try {
                extensionSet.addFunction(function_);

                test.fail();
            } catch (e) {
                test.same(e.message, 'Function "foo" is already registered.');
            }

            test.end();
        });

        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();
            // initialize the extension set
            extensionSet.getFunctions();

            try {
                extensionSet.addFunction(new Function('foo', () => Promise.resolve(), []));

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to add function "foo" as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('getFunctions', (test) => {
        let extensionSet = new ExtensionSet();

        extensionSet.getFunctions();

        test.true(extensionSet.isInitialized());

        test.end();
    });

    test.test('getUnaryOperators', (test) => {
        let extensionSet = new ExtensionSet();
        let extension = new TwingTestExtensionSetExtension();

        extensionSet.addExtension(extension, 'TwingTestExtensionSetExtension');

        test.same(extensionSet.getUnaryOperators().size, 1);

        test.end();
    });

    test.test('getBinaryOperators', (test) => {
        let extensionSet = new ExtensionSet();
        let extension = new TwingTestExtensionSetExtension();

        extensionSet.addExtension(extension, 'TwingTestExtensionSetExtension');

        test.same(extensionSet.getBinaryOperators().size, 1);

        test.end();
    });

    test.test('addOperator', (test) => {
        test.test('already registered', (test) => {
            let extensionSet = new ExtensionSet();

            let operator = new Operator('foo', TwingOperatorType.BINARY, 1, () => null);

            extensionSet.addOperator(operator);

            try {
                extensionSet.addOperator(operator);

                test.fail();
            } catch (e) {
                test.same(e.message, 'Operator "foo" is already registered.');
            }

            test.end();
        });

        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();
            let extension = new TwingTestExtensionSetExtension();

            extensionSet.addExtension(extension, 'TwingTestExtensionSetExtension');
            // initialize the extension set
            extensionSet.getUnaryOperators();

            try {
                extensionSet.addOperator(new Operator('foo', TwingOperatorType.BINARY, 1, () => null));

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to add operator "foo" as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('addSourceMapNodeFactory', (test) => {
        test.test('already registered', (test) => {
            let extensionSet = new ExtensionSet();

            let factory = new SourceMapNodeFactory('foo' as any);

            extensionSet.addSourceMapNodeFactory(factory);

            try {
                extensionSet.addSourceMapNodeFactory(factory);

                test.fail();
            } catch (e) {
                test.same(e.message, 'Source-map node factory "foo" is already registered.');
            }

            test.end();
        });

        test.test('initialized', (test) => {
            let extensionSet = new ExtensionSet();

            // initialize the extension set
            extensionSet.getSourceMapNodeFactories();

            try {
                extensionSet.addSourceMapNodeFactory(new SourceMapNodeFactory('foo' as any));

                test.fail();
            } catch (e) {
                test.same(e.message, 'Unable to add source-map node factory "foo" as extensions have already been initialized.');
            }

            test.end();
        });

        test.end();
    });

    test.test('getSourceMapNodeFactories', (test) => {
        let extensionSet = new ExtensionSet();

        extensionSet.getSourceMapNodeFactories();

        test.true(extensionSet.isInitialized());

        test.test('on subsequent calls, don\'t initialize extensions', (test) => {
            let fooExtension = new Extension();
            let getFiltersSpy = spy(fooExtension, 'getFilters');

            extensionSet = new ExtensionSet();
            extensionSet.addExtension(fooExtension, 'foo');
            extensionSet.getSourceMapNodeFactories();
            extensionSet.getSourceMapNodeFactories();

            test.same(getFiltersSpy.callCount, 1);

            test.end();
        });

        test.end();
    });

    test.test('getSourceMapNodeFactory', (test) => {
        let extensionSet = new ExtensionSet();

        let factory = new SourceMapNodeFactory('foo' as any);

        extensionSet.addSourceMapNodeFactory(factory);

        test.same(extensionSet.getSourceMapNodeFactory('foo' as any), factory);

        test.end();
    });

    test.end();
});
