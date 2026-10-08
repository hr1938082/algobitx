import PackageManifest, { ManifestType } from "./PackageManifest"

const PackageFullPathFactory = (key: keyof ManifestType) => {
    const { owner, repository, commit, path } = PackageManifest(key);
    return `${owner}-${repository}-${commit}/${path}`;
}

export default PackageFullPathFactory