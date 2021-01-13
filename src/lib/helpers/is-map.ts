import {Context} from "../context";

export function isMap(candidate: any): boolean {
    return (candidate instanceof Map || candidate instanceof Context);
}
