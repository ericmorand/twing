import * as tape from 'tape';
import {NodeEnvironment} from "../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../src/lib/loader/array";
import {Source} from "../../../../../src/lib/source";

tape('token-stream', (test) => {
    test.test('should provide textual representation', (test) => {
        let loader = new ArrayLoader({
            index: ''
        });
        let twing = new NodeEnvironment(loader);
        let stream = twing.tokenize(new Source('Hello {{ name }}', 'index'));

        test.same(stream.toString(), `TEXT(Hello )
VARIABLE_START({{)
NAME(name)
VARIABLE_END(}})
EOF()`);

        test.end();
    });

    test.end();
});
