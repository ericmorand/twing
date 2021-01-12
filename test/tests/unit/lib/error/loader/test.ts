import * as tape from 'tape';
import {LoaderError} from "../../../../../../src/lib/error/loader";
import {Source} from "../../../../../../src/lib/source";

tape('TwingErrorLoader', (test) => {
    test.test('constructor', (test) => {
        let error = new LoaderError('foo', 1, new Source('', 'bar'));

        test.same(error.getRawMessage(), 'foo', 'raw message should be set');
        test.same(error.getLocation(), 1, 'template line should be set');
        test.same(error.message, 'foo in "bar" at line 1', 'message should be set');

        test.end();
    });

    test.end();
});
