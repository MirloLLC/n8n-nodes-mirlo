// Copies every .svg under nodes/ to dist/nodes/, preserving relative paths.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'nodes');
const DEST = path.join(__dirname, '..', 'dist', 'nodes');

function copySvgs(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const from = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			copySvgs(from);
		} else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
			const to = path.join(DEST, path.relative(SRC, from));
			fs.mkdirSync(path.dirname(to), { recursive: true });
			fs.copyFileSync(from, to);
		}
	}
}

copySvgs(SRC);
