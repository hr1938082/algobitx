import PackageManifest, { ManifestType } from "./PackageManifest";

const PackagesURLFactory = (key: keyof ManifestType) => {
    const { owner, repository, branch } = PackageManifest(key);
    return `https://api.github.com/repos/${owner}/${repository}/tarball/${branch}`;
}

export default PackagesURLFactory