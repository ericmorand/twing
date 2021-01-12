import * as tape from 'tape';
import {Markup} from "../../../../../src/lib/markup";

tape('TwingMarkup', (test) => {
    test.test('constructor', (test) => {
        let markup = new Markup('foo', 'bar');

        test.same(markup.toString(), 'foo');

        test.end();
    });

    test.test('count', (test) => {
        let markup = new Markup('饿', 'utf-8');

        test.same(markup.count(), 1);

        markup = new Markup('饿', 'EUC-CN');

        test.same(markup.count(), 2);

        test.end();
    });

    test.end();
});
