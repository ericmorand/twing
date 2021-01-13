import * as tape from 'tape';
import {CoreExtension} from "../../../../../../../../src/lib/extension/core";

tape('date-format', (test) => {
    let extension = new CoreExtension();

    extension.setDateFormat();

    test.same(extension.dateFormat(), ['F j, Y H:i', '%d days']);

    test.end();
});
