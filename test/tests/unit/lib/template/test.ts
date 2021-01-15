import * as tape from 'tape';
import {OutputBuffer} from "../../../../../src/lib/output-buffer";
import {Template, TemplateBlocksMap} from "../../../../../src/lib/template";
import {NodeEnvironment} from "../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../src/lib/loader/array";
import {ChainLoader} from "../../../../../src/lib/loader/chain";
import {Source} from "../../../../../src/lib/source";
import {RuntimeError} from "../../../../../src/lib/error/runtime";
import {LoaderError} from "../../../../../src/lib/error/loader";
import {Environment} from "../../../../../src/lib/environment";
import {MockEnvironment} from "../../../../mock/environment";
import {MockTemplate} from "../../../../mock/template";

const sinon = require('sinon');

class TwingTestTemplateTemplate extends Template {
    protected _mySource: Source;

    constructor(environment?: Environment) {
        super(environment !== undefined ? environment : new NodeEnvironment(new ArrayLoader({
            foo: '{% block foo %}foo{% endblock %}'
        })));

        this._mySource = new Source('', 'foo');
    }

    get source() {
        return this._mySource;
    }

    displayWithErrorHandling(context: any, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap) {
        return super.displayWithErrorHandling(context, outputBuffer, blocks);
    }

    doDisplay(context: {}, outputBuffer: OutputBuffer, blocks: TemplateBlocksMap): Promise<void> {
        outputBuffer.echo('foo');

        return Promise.resolve();
    }

    doGetParent(context: any): Promise<Template | string | false> {
        return super.doGetParent(context);
    }

    displayParentBlock(name: string, context: any, outputBuffer: OutputBuffer, blocks: Map<string, [Template, string]> = new Map()): Promise<void> {
        return super.displayParentBlock(name, context, outputBuffer, blocks);
    }

    displayBlock(name: string, context: any, outputBuffer: OutputBuffer, blocks: Map<string, [Template, string]> = new Map(), useBlocks: boolean = true): Promise<void> {
        return super.displayBlock(name, context, outputBuffer, blocks, useBlocks);
    }

    renderParentBlock(name: string, context: any, outputBuffer: OutputBuffer, blocks: Map<string, [Template, string]> = new Map()): Promise<string> {
        return super.renderParentBlock(name, context, outputBuffer, blocks);
    }

    renderBlock(name: string, context: any, outputBuffer: OutputBuffer, blocks: Map<string, [Template, string]> = new Map(), useBlocks: boolean = true): Promise<string> {
        return super.renderBlock(name, context, outputBuffer, blocks, useBlocks);
    }
}

class TwingTestTemplateTemplateWithInvalidLoadTemplate extends Template {
    constructor() {
        super(new NodeEnvironment(new ChainLoader([
            new ArrayLoader({})
        ])));
    }

    get templateName() {
        return 'foo';
    }

    doDisplay(context: {}, outputBuffer: OutputBuffer, blocks: Map<string, Array<any>>): Promise<void> {
        return this.loadTemplate('not_found').then(() => {
            return;
        });
    }

    get source() {
        return new Source('code', 'path');
    }
}

tape('template', function (test) {
    test.test('environment accessor', function (test) {
        let environment = new MockEnvironment();
        let template = new TwingTestTemplateTemplate(environment);

        test.same(template.environment, environment);

        test.end();
    });

    test.test('getSourceContext', function (test) {
        let template = new TwingTestTemplateTemplate();

        test.same(template.source.getName(), 'foo');

        test.end();
    });

    test.test('getParent', async (test) => {
        let template = new TwingTestTemplateTemplate();
        let stub = sinon.stub(template, 'doGetParent');

        stub.returns(Promise.resolve(false));

        test.same(await template.getParent(), false);

        stub.returns(Promise.resolve('foo'));

        test.true(await template.getParent() instanceof Template);

        stub.returns(Promise.resolve('bar'));

        try {
            await template.getParent();

            test.fail();
        } catch (e) {
            test.same(e.message, 'Template "bar" is not defined in "foo".');
        }

        stub.returns(Promise.reject(new Error('foo')));

        try {
            await template.getParent();

            test.fail();
        } catch (e) {
            test.same(e.message, 'foo');
        }

        test.end();
    });

    test.test('displayParentBlock', async (test) => {
        let template = new TwingTestTemplateTemplate();
        let stub = sinon.stub(template, 'getParent');

        stub.returns(Promise.resolve(false));

        try {
            await template.displayParentBlock('foo', {}, null);

            test.fail();
        } catch (e) {
            test.same(e.message, 'The template has no parent and no traits defining the "foo" block in "foo".');
        }

        test.end();
    });

    test.test('displayBlock', async (test) => {
        let template = new TwingTestTemplateTemplate();
        let stub = sinon.stub(template, 'getParent');

        stub.returns(Promise.resolve(false));

        try {
            await template.displayBlock('foo', {}, null);
        } catch (e) {
            test.true(e instanceof RuntimeError);
            test.same(e.rawMessage, 'Block "foo" on template "foo" does not exist.')
        }

        test.end();
    });

    test.test('renderParentBlock', async (test) => {
        let template = new TwingTestTemplateTemplate();
        let stub = sinon.stub(template, 'doGetParent');

        stub.returns(Promise.resolve('foo'));

        test.same(await template.renderParentBlock('foo', {}, new OutputBuffer(), new Map()), 'foo');
        test.same(await template.renderParentBlock('foo', {}, new OutputBuffer()), 'foo');

        test.end();
    });

    test.test('loadTemplate', async (test) => {
        let template = new TwingTestTemplateTemplate(null);

        try {
            await template.loadTemplate('foo');

            test.fail('should throw an Error');
        } catch (e) {
            test.true(e instanceof Error);
            test.same(e.message, 'Cannot read property \'loadTemplate\' of null')
        }

        test.test('should return an error with full source information when templateName is set', async (test) => {
            let template = new TwingTestTemplateTemplateWithInvalidLoadTemplate();

            try {
                await template.display({});

                test.fail('should throw an Error');
            } catch (e) {
                test.true(e instanceof LoaderError);
                test.same(e.message, 'Template "not_found" is not defined in "path".');
                test.same(e.getSourceContext(), new Source('code', 'path'));
            }

            test.end();
        });

        test.end();
    });

    test.test('doGetParent', async (test) => {
        let template = new TwingTestTemplateTemplate();

        test.equals(await template.doGetParent('foo'), false);

        test.end();
    });

    test.test('display', async (test) => {
        let template = new TwingTestTemplateTemplate();

        try {
            await template.display(null);

            test.fail();
        } catch (e) {
            test.same(e.message, 'Argument 1 passed to TwingTemplate::display() must be an iterator, null given');
        }

        test.end();
    });

    test.test('displayWithErrorHandling', async (test) => {
        let template = new TwingTestTemplateTemplate();

        let outputBuffer = new OutputBuffer();

        outputBuffer.start();

        await template.displayWithErrorHandling({}, outputBuffer, undefined);

        let content = outputBuffer.getContents();

        test.same(content, 'foo');

        test.test('should rethrow native error as TwingErrorRuntime', async (test) => {
            sinon.stub(template, 'doDisplay').returns(Promise.reject(new Error('foo error')));

            try {
                await template.displayWithErrorHandling({}, outputBuffer, new Map());

                test.fail();
            } catch (e) {
                test.same(e.constructor.name, 'TwingErrorRuntime');
                test.same(e.message, 'An exception has been thrown during the rendering of a template ("foo error") in "foo".');
            }

            test.end();
        });

        test.end();
    });

    test.test('traceableMethod', async (test) => {
        let template = new TwingTestTemplateTemplate();

        try {
            await template.traceableMethod(() => {
                return Promise.reject(new Error('foo error'));
            }, 1, new Source('', 'foo'))();
        } catch (e) {
            test.same(e.message, 'An exception has been thrown during the rendering of a template ("foo error") in "foo" at line 1.');
            test.same(e.constructor.name, 'TwingErrorRuntime');
        }

        test.end();
    });

    test.test('traceableRenderBlock', async (test) => {
        let template = new TwingTestTemplateTemplate();
        let stub = sinon.stub(template, 'renderBlock').returns(Promise.resolve(''));

        await template.traceableRenderBlock(1, null)();

        test.same(stub.callCount, 1, 'should call renderBlock once');

        test.end();
    });

    test.test('traceableRenderParentBlock', async (test) => {
        let template = new TwingTestTemplateTemplate();
        let stub = sinon.stub(template, 'renderParentBlock').returns(Promise.resolve(''));

        await template.traceableRenderParentBlock(1, null)();

        test.same(stub.callCount, 1, 'should call renderParentBlock once');

        test.end();
    });

    test.test('traceableHasBlock', async (test) => {
        let template = new TwingTestTemplateTemplate();
        let stub = sinon.stub(template, 'hasBlock').returns(Promise.resolve(true));

        await template.traceableHasBlock(1, null)();

        test.same(stub.callCount, 1, 'should call hasBlock once');

        test.end();
    });

    test.test('getMacro', async (test) => {
        const fooHandler = () => {
            return Promise.resolve('');
        };

        class TemplateWithMacros extends Template {
            constructor() {
                super(new MockEnvironment());

                this._macroHandlers = new Map([
                    ['foo', fooHandler]
                ])
            }

            protected doDisplay(context: any, outputBuffer: OutputBuffer, blocks: Map<string, [Template, string]>): Promise<void> {
                return;
            }
        }

        let template = new TemplateWithMacros();

        test.same(await template.getMacro('foo'), fooHandler);
        test.same(await template.getMacro('bar'), null);

        test.end();
    });

    test.end();
});
