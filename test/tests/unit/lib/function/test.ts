import * as tape from 'tape';
import {Function} from "../../../../../src/lib/function";
import {Node} from "../../../../../src/lib/node";

tape('function', (test) => {
    test.test('getSafe', (test) => {
        let function_ = new Function('foo', () => Promise.resolve(), [], {
            isSafeCallback: () => {
                return 'html'
            }
        });

        test.same(function_.isSafe(new Node()), 'html');

        test.end();
    });

    test.end();
});
