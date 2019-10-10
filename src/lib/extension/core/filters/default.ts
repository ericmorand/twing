import {empty} from "../tests/empty";

export function defaultFilter(value: any, defaultValue: any = ''): Promise<any> {
    if (empty(value)) {
        return Promise.resolve(defaultValue);
    }

    return Promise.resolve(value);
}
