import * as tape from 'tape';
import {Error} from "../../../../../src/lib/error";
import {ArrayLoader} from "../../../../../src/lib/loader/array";
import {TwingEnvironmentNode} from "../../../../../src/lib/environment/node";
import {RuntimeError} from "../../../../../src/lib/error/runtime";
import {FilesystemLoader} from "../../../../../src/lib/loader/filesystem";
import {Source} from "../../../../../src/lib/source";

const path = require('path');

class TwingTestsErrorTestFoo {
    bar() {
        throw new Error('Runtime error...');
    }
}

tape('TwingError', (test) => {
    test.test('constructor', (test) => {
        let previous = new Error();
        let error = new Error('foo', -1, new Source('', 'bar'), previous);

        test.same(error.getRawMessage(), 'foo', 'raw message should be set');
        test.same(error.getLocation(), -1, 'template line should be set');
        test.same(error.getMessage(), 'foo in "bar"', 'message should be set');

        error = new Error('foo');

        test.same(error.getSourceContext(), undefined);

        test.end();
    });

    test.test('twingExceptionGuessWithMissingVarAndArrayLoader', async (test) => {
        let loader = new ArrayLoader({
            'base.html': '{% block content %}{% endblock %}',
            'index.html': `{% extends 'base.html' %}
{% block content %}
    {{ foo.bar }}
{% endblock %}
{% block foo %}
    {{ foo.bar }}
{% endblock %}`
        });

        let twing = new TwingEnvironmentNode(loader, {
            strict_variables: true,
            debug: true,
            cache: false
        });

        let template = await twing.loadTemplate('index.html');

        try {
            await template.render({});

            test.fail();
        }
        catch (e) {
            test.same(e.getMessage(), 'Variable \`foo\` does not exist in "index.html" at line 3.');
            test.same(e.getTemplateLine(), 3);
            test.same(e.getSourceContext().getName(), 'index.html');
            test.true(e instanceof RuntimeError);
        }

        test.end();
    });

    test.test('twingExceptionGuessWithExceptionAndArrayLoader', async (test) => {
        let loader = new ArrayLoader({
            'base.html': '{% block content %}{% endblock %}',
            'index.html': `{% extends 'base.html' %}
{% block content %}
    {{ foo.bar }}
{% endblock %}
{% block foo %}
    {{ foo.bar }}
{% endblock %}`
        });

        let twing = new TwingEnvironmentNode(loader, {
            strict_variables: true,
            debug: true,
            cache: false
        });

        let template = await twing.loadTemplate('index.html');

        try {
            await template.render({
                foo: new TwingTestsErrorTestFoo()
            });

            test.fail();
        }
        catch (e) {
            test.true(e instanceof RuntimeError);
            test.same(e.getMessage(), 'An exception has been thrown during the rendering of a template ("Runtime error...") in "index.html" at line 3.');
            test.same(e.getTemplateLine(), 3);
            test.same(e.getSourceContext().getName(), 'index.html');
        }

        test.end();
    });

    test.test('twingExceptionGuessWithMissingVarAndFilesystemLoader', async (test) => {
        let loader = new FilesystemLoader(path.resolve('test/tests/integration/fixtures/errors'));

        let twing = new TwingEnvironmentNode(loader, {
            strict_variables: true,
            debug: true,
            cache: false
        });

        let template = await twing.loadTemplate('index.html');

        try {
            await template.render({});

            test.fail();
        }
        catch (e) {
            test.true(e instanceof RuntimeError);
            test.same(e.getMessage(), `Variable \`foo\` does not exist in "${path.resolve('test/tests/integration/fixtures/errors/index.html')}" at line 3.`);
            test.same(e.getTemplateLine(), 3);
            test.same(e.getSourceContext().getName(), path.resolve('test/tests/integration/fixtures/errors/index.html'));
        }

        test.end();
    });

    test.test('twingExceptionAddsFileAndLine', async (test) => {
        let erroredTemplates = [
            {
                templates: {
                    index: '\n\n{{ foo.bar }}\n\n\n{{ \'foo\' }}'
                },
                name: 'index',
                line: 3
            },

            // error occurs in an included template
            {
                templates: {
                    index: '{% include \'partial\' %}',
                    partial: '{{ foo.bar }}'
                },
                name: 'partial',
                line: 1
            },

            // error occurs in a parent block when called via parent()
            {
                templates: {
                    index: `{% extends 'base' %}
                    {% block content %}
                        {{ parent() }}
                    {% endblock %}`,
                    base: '{% block content %}{{ foo.bar }}{% endblock %}'
                },
                name: 'base',
                line: 1
            },

            // error occurs in a block from the child
            {
                templates: {
                    index: `{% extends 'base' %}
                    {% block content %}
                        {{ foo.bar }}
                    {% endblock %}
                    {% block foo %}
                        {{ foo.bar }}
                    {% endblock %}`,
                    base: '{% block content %}{% endblock %}'
                },
                name: 'index',
                line: 3
            }
        ];

        for (let erroredTemplate of erroredTemplates) {
            let loader = new ArrayLoader(erroredTemplate.templates);

            let twing = new TwingEnvironmentNode(loader, {
                strict_variables: true,
                debug: true,
                cache: false
            });

            let template = await twing.loadTemplate('index');

            try {
                await template.render({});

                test.fail();
            }
            catch (e) {
                test.true(e instanceof RuntimeError);
                test.same(e.getMessage(), `Variable \`foo\` does not exist in "${erroredTemplate.name}" at line ${erroredTemplate.line}.`);
                test.same(e.getTemplateLine(), erroredTemplate.line);
                test.same(e.getSourceContext().getName(), erroredTemplate.name);
            }

            try {
                await template.render({
                    foo: new TwingTestsErrorTestFoo()
                });

                test.fail();
            }
            catch (e) {
                test.true(e instanceof RuntimeError);
                test.same(e.getMessage(), `An exception has been thrown during the rendering of a template ("Runtime error...") in "${erroredTemplate.name}" at line ${erroredTemplate.line}.`);
                test.same(e.getTemplateLine(), erroredTemplate.line);
                test.same(e.getSourceContext().getName(), erroredTemplate.name);
            }
        }

        test.end();
    });

    test.test('setSourceContext', (test) => {
        let error = new Error('foo', -1, new Source('', 'bar'));

        error.setSourceContext(null);

        test.equal(error.getSourceContext(), null);

        test.end();
    });

    test.test('updateRepr', function(test) {
        let error = new Error('foo', -1);

        error.setSourceContext(new Source('', 'bar'));

        test.same(error.getMessage(), 'foo in "bar"');

        test.end();
    });

    test.end();
});
