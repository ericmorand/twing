import {constant as constantHelper} from "../../../helpers/constant";
import {Template} from "../../../template";

export function constant(template: Template, name: string, object: any = null): Promise<any> {
    return Promise.resolve(constantHelper(template, name, object));
}
