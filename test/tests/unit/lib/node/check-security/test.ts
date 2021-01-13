import * as tape from 'tape';
import {CheckSecurityNode, type} from "../../../../../../src/lib/node/check-security";
import {Compiler} from "../../../../../../src/lib/compiler";
import {NodeEnvironment} from "../../../../../../src/lib/environment/node";
import {ArrayLoader} from "../../../../../../src/lib/loader/array";

tape('node/check-security', (test) => {
    test.test('constructor', (test) => {
        let node = new CheckSecurityNode(new Map([]), new Map([]), new Map([]));

        test.same(node.type, type);

        test.end();
    });

    test.test('compile', (test) => {
        let node = new CheckSecurityNode(new Map([['foo', 'bar']]), new Map([['foo', 'bar']]), new Map([['foo', 'bar']]));
        let compiler = new Compiler(new NodeEnvironment(new ArrayLoader({})));

        test.same(compiler.compile(node).getSource(), `let tags = new Map([[\`bar\`, null]]);
let filters = new Map([[\`bar\`, null]]);
let functions = new Map([[\`bar\`, null]]);

try {
    this.environment.checkSecurity(
        [\'bar\'],
        [\'bar\'],
        [\'bar\']
    );
}
catch (e) {
    if (e instanceof this.SandboxSecurityError) {
        e.setSourceContext(this.source);

        if (e instanceof this.SandboxSecurityNotAllowedTagError && tags.has(e.getTagName())) {
            e.setTemplateLine(tags.get(e.getTagName()));
        }
        else if (e instanceof this.SandboxSecurityNotAllowedFilterError && filters.has(e.getFilterName())) {
            e.setTemplateLine(filters.get(e.getFilterName()));
        }
        else if (e instanceof this.SandboxSecurityNotAllowedFunctionError && functions.has(e.getFunctionName())) {
            e.setTemplateLine(functions.get(e.getFunctionName()));
        }
    }

    throw e;
}

`);

        test.end();
    });

    test.end();
});
