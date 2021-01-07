export function push(map: Map<string, any>, item: any) {
    map.set(`${map.size}`, item);
}
