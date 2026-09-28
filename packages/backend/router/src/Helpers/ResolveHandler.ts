import BootException from "@algobitx/exception/server/BootException";

const ResolveHandler = (controller: any, handler: string, controllerCache: Map<any, any>) => {
    let instance: any;
    if (typeof controller === "function") {
        if (typeof controller[handler] === "function") {
            instance = controller;
        } else {
            instance = controllerCache.get(controller);
            if (!instance) {
                instance = new controller();
                controllerCache.set(controller, instance);
            }
        }
    } else {
        instance = controller;
    }

    const fn = instance[handler];

    if (typeof fn !== "function") {
        throw new BootException(
            new Error(`Method "${handler}" not found in controller`)
        );
    }

    return fn.bind(instance);
}

export default ResolveHandler