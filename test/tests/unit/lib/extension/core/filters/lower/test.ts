import * as tape from 'tape';
import {ArrayLoader} from "../../../../../../../../src/lib/loader/array";
import {NodeEnvironment} from "../../../../../../../../src/lib/environment/node";
import {lower} from "../../../../../../../../src/lib/extension/core/filters/lower";

tape('lower', async (test) => {
    let env = new NodeEnvironment(new ArrayLoader({}));

    test.same(await lower(env, 'A'), 'a');
    test.same(await lower(env, '5'), '5');

    test.end();
});
