import * as tape from 'tape';
import {ArrayLoader} from "../../../../../../../../src/lib/loader/array";
import {Source} from "../../../../../../../../src/lib/source";
import {include} from "../../../../../../../../src/lib/extension/core/functions/include";
import {RelativeFilesystemLoader} from "../../../../../../../../src/lib/loader/relative-filesystem";
import {resolve} from "path";
import {MockTemplate} from "../../../../../../../mock/template";
import {Context} from "../../../../../../../../src/lib/context";
import {MockEnvironment} from "../../../../../../../mock/environment";
import {OutputBuffer} from "../../../../../../../../src/lib/output-buffer";

tape('include', async (test) => {
    let template = new MockTemplate(
        new MockEnvironment(new ArrayLoader({})),
        new Source('', 'index.twig')
    );

    try {
        await include(template, new Context<any, any>(), null, 'foo', {}, true, false, true);

        test.fail();
    } catch (e) {
        test.same(e.name, 'TwingErrorLoader');
        test.same(e.message, 'Template "foo" is not defined in "index.twig".');
    }

    try {
        await include(template, new Context(), null, 'foo', 'bar', true, false, true);

        test.fail();
    } catch (e) {
        test.same(e.message, 'Variables passed to the "include" function or tag must be iterable, got "string" in "index.twig".');
    }

    template = new MockTemplate(
        new MockEnvironment(new ArrayLoader({foo: 'bar'}))
    );
    template.environment.enableSandbox();

    test.same(await include(template, new Context(), new OutputBuffer(), 'foo', {}, true, false, true), 'bar');

    test.test('supports relative filesystem loader', async (test) => {
        template = new MockTemplate(
            new MockEnvironment(new RelativeFilesystemLoader()),
            new Source('code', resolve('test/tests/unit/lib/extension/core/index.twig'))
        );

        test.same(await include(template, new Context(), new OutputBuffer(), 'templates/foo.twig', {}), 'foo');

        test.end();
    });

    test.end();
});
