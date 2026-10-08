
interface ManifestValues {
    owner: string;
    repository: string;
    branch: string;
    path: string;
    commit: string;
}

export interface ManifestType {
    app: ManifestValues;
}

const Manifest: ManifestType = {
    app: {
        owner: "hr1938082",
        repository: "algobitx",
        branch: "main",
        path: "apps/safty-web-server",
        commit: "986b520"
    }
}


const PackageManifest = (key: keyof ManifestType) => {
    return Manifest[key];
}

export default PackageManifest
