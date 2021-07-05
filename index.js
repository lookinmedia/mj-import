const path = require('path');
const got = require('got');
const jetpack = require('fs-jetpack');
var ProgressBar = require('progress');

const DEFAULT_UA = 'Java/1.8.0_121';
const MOJANG_LISTING = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';
const BASE_URL = 'https://41a359f1-eb0b-4ba3-9e0f-2db91205576d.selcdn.net/minecraft/v1/mojang/meta/';
const BASE_URL_DEV = 'https://41a359f1-eb0b-4ba3-9e0f-2db91205576d.selcdn.net/dev/minecraft/v1/mojang/meta/';

async function main() {
	const dev = process.env.DEV === 'true';

	const releaseDir = dev ? 'release-dev' : 'release';
	const baseUrl = dev ? BASE_URL_DEV : BASE_URL;
	const metaDir = path.join(releaseDir, 'meta');

	await jetpack.removeAsync(releaseDir);

	const versionList = await got(MOJANG_LISTING).json();
	const progressBar = new ProgressBar('  downloading [:bar] :percent', { total: versionList.versions.length, width: 60 });
	for (const version of versionList.versions) {
		const verManifest = await got(version.url, {
			headers: {
				'user-agent': DEFAULT_UA
			}
		}).json();
		await jetpack.writeAsync(path.join(metaDir, `${version.id}.json`), verManifest);
		version.url = `${baseUrl}${version.id}.json`;
		progressBar.tick();
	}

	await jetpack.writeAsync(path.join(metaDir, 'versions.json'), JSON.stringify(versionList));
	console.log('\nCompleted.');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
