import * as tape from 'tape';
import * as sinon from 'sinon';
import {source} from "../../../../../../../../src/lib/extension/core/functions/source";
import {ArrayLoader} from "../../../../../../../../src/lib/loader/array";
import {Source} from "../../../../../../../../src/lib/source";
import {MockTemplate} from "../../../../../../../mock/template";
import {MockEnvironment} from "../../../../../../../mock/environment";

tape('source', async (test) => {
    let loader = new ArrayLoader({});
    let template = new MockTemplate(new MockEnvironment(loader), new Source('', 'index'));

    try {
        await source(template, 'foo', false);
    } catch (e) {
        test.same(e.name, 'TwingErrorLoader');
        test.same(e.message, 'Template "foo" is not defined in "index".');
    }

    test.equals(await source(template, 'foo', true), null);

    sinon.stub(loader, 'getSourceContext').returns(Promise.reject(new Error('foo')));

    try {
        await source(template, 'foo', false);
    } catch (e) {
        test.same(e.name, 'Error');
        test.same(e.message, 'foo');
    }

    test.end();
});
