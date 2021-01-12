import {TwingEnvironment} from "../../../environment";
import {Source} from "../../../source";
import {LoaderError} from "../../../error/loader";
import {Template} from "../../../template";

/**
 * Returns a template content without rendering it.
 *
 * @param {Template} template
 * @param {string} name The template name
 * @param {boolean} ignoreMissing Whether to ignore missing templates or not
 *
 * @return {Promise<string>} The template source
 */
export function source(template: Template, name: string, ignoreMissing: boolean = false): Promise<string> {
    let env = template.environment;
    let from = template.source;

    return env.getLoader().getSourceContext(name, from).then((source) => {
        return source.content;
    }).catch((e) => {
        if (e instanceof LoaderError) {
            if (!ignoreMissing) {
                throw e;
            } else {
                return null;
            }
        } else {
            throw e;
        }
    });
}
