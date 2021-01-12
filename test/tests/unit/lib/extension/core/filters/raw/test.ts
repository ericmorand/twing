import * as tape from 'tape';
import {raw} from "../../../../../../../../src/lib/extension/core/filters/raw";
import {Markup} from "../../../../../../../../src/lib/markup";

tape('raw', async (test) => {
    test.same(await raw('<br/>'), '<br/>');
    test.same(await raw(new Markup('<br/>', 'utf-8')), '<br/>');

    test.end();
});
