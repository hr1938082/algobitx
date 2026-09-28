
const NormalizePath = (path: string) => {
    if (path === "/") return "/";
    return "/" + path.replace(/^\/|\/$/g, "");
}

export default NormalizePath