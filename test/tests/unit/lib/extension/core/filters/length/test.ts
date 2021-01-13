import * as tape from 'tape';
import {ArrayLoader} from "../../../../../../../../src/lib/loader/array";
import {length} from "../../../../../../../../src/lib/extension/core/filters/length";
import {NodeEnvironment} from "../../../../../../../../src/lib/environment/node";

tape('length', async (test) => {
    let env = new NodeEnvironment(new ArrayLoader({}));

    test.equal(await length(env, 5), 1);
    test.equal(await length(env, 55), 2);
    test.equal(await length(env, new Map([[1, 1]])), 1);
    test.equal(await length(env, []), 0);
    test.equal(await length(env, new Map()), 0);

    test.end();
});
