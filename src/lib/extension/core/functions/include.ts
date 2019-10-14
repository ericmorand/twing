import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {merge} from "../../../helpers/merge";
import {TwingErrorLoader} from "../../../error/loader";
import {TwingEnvironment} from "../../../environment";
import {TwingSource} from "../../../source";
import {TwingTemplate} from "../../../template";
import {isTraversable} from "../../../helpers/is-traversable";
import {TwingErrorRuntime} from "../../../error/runtime";
import {isNullOrUndefined} from "util";
import {isPlainObject} from "../../../helpers/is-plain-object";

/**
 * Renders a template.
 *
 * @param {TwingEnvironment} env
 * @param {any} context
 * @param {TwingSource} from
 * @param {string | Map<number, string | TwingTemplate>} templates The template to render or an array of templates to try consecutively
 * @param {any} variables The variables to pass to the template
 * @param {boolean} withContext
 * @param {boolean} ignoreMissing Whether to ignore missing templates or not
 * @param {boolean} sandboxed Whether to sandbox the template or not
 *
 * @returns {Promise<string>} The rendered template
 */
export function include(env: TwingEnvironment, context: any, from: TwingSource, templates: string | Map<number, string | TwingTemplate> | TwingTemplate, variables: any = {}, withContext: boolean = true, ignoreMissing: boolean = false, sandboxed: boolean = false): Promise<string> {
    let alreadySandboxed = env.isSandboxed();

    if (!isPlainObject(variables) && !isTraversable(variables)) {
        throw new TwingErrorRuntime(`Variables passed to the "include" function or tag must be iterable, got "${!isNullOrUndefined(variables) ? typeof variables : variables}".`, -1, from);
    }

    variables = iteratorToMap(variables);

    if (withContext) {
        variables = merge(context, variables);
    }

    if (sandboxed) {
        if (!alreadySandboxed) {
            env.enableSandbox();
        }
    }

    if (typeof templates === 'string' || templates instanceof TwingTemplate) {
        templates = new Map([[0, templates]]);
    }

    return env.resolveTemplate([...templates.values()], from)
        .then((template) => {
            let promise = template ? template.render(variables) : Promise.resolve('');

            return promise
                .then((result) => {
                    if (!alreadySandboxed) {
                        env.disableSandbox();
                    }

                    return result;
                })
                .catch((e) => {
                    if (!alreadySandboxed) {
                        env.disableSandbox();
                    }

                    throw e;
                })
        })
        .catch((e) => {
            if (e instanceof TwingErrorLoader) {
                if ((e.getSourceContext().getName() !== from.getName()) || !ignoreMissing) {
                    if (sandboxed && !alreadySandboxed) {
                        env.disableSandbox();
                    }

                    throw e;
                } else {
                    return null;
                }
            } else {
                if (sandboxed && !alreadySandboxed) {
                    env.disableSandbox();
                }

                throw e;
            }
        });
}
