module.exports = {
	"*.{ts,tsx,js,jsx}": [
		"yarn check:all",
		() => "yarn typescript:check --skipLibCheck -p tsconfig.json",
	],
	"*": "yarn translation:extract",
};
