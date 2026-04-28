const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
// @wordpress/scripts config.
const wordpressConfig = require('@wordpress/scripts/config/webpack.config')

// See svgo.config.js to configure SVG manipulation.

const config = {
	...wordpressConfig,
	entry: {
		// @wordpress/scripts helper which generates entry points from any '**/block.json' in 'src'.
		...wordpressConfig.entry(),
		// 'example/output': './path/to/dir/entrypoint.js',
		'admin/bigup-forms-custom-post': './src/admin/custom-post.scss.js',
		'admin/bigup-forms-spa': './src/admin/bootstrap.js',
	},
	plugins: [
		...wordpressConfig.plugins,
		new BrowserSyncPlugin({
			proxy: 'localhost:6969', // Live WordPress site. Using IP breaks it.
			ui: { port: 3001 }, // BrowserSync UI.
			port: 3000, // Dev port on localhost.
			logLevel: 'debug',
			reload: false, // false = webpack handles reloads (not sure if this works with files option).
			browser: "google-chrome-stable",
			files: [
				'src/**',
				'classes/**',
				'patterns/**',
				'parts/**',
				'templates/**',
				'**/**.json'
			]
		})
	],
}

/**
 * Prevent CSS modules from outputting hashed concatenations; use bf_ prefix (Bigup Forms).
 */
const buildCssModuleClass = (context, __, localName) => {
	const prefix = 'bf_'
	const file = context.resourcePath
		.split('/')
		.pop()
		.replace('.module.scss', '')

	const className = file.toLowerCase() === localName
		? prefix + localName
		: prefix + file.toLowerCase() + '_' + localName

	return className
}

/**
 * @wordpress/scripts registers separate rules for /\.css$/, /\.pcss$/, and /\.(sc|sa)ss$/.
 * The SCSS rule's RegExp string does not contain "css", so a naive `test.includes( 'css' )`
 * check never patches css-loader for .module.scss — only plain .css did.
 */
const ruleUsesCssLoader = (rule) =>
	Array.isArray(rule.use) &&
	rule.use.some(
		(loader) =>
			typeof loader === 'object' &&
			loader.loader &&
			/[\\/]css-loader[\\/]/.test(loader.loader)
	)

const enhanceWpScriptsCssLoader = (rule) => {
	if (Array.isArray(rule.oneOf)) {
		return { ...rule, oneOf: rule.oneOf.map(enhanceWpScriptsCssLoader) }
	}
	if (Array.isArray(rule.rules)) {
		return { ...rule, rules: rule.rules.map(enhanceWpScriptsCssLoader) }
	}

	if (! ruleUsesCssLoader(rule)) {
		return rule
	}

	return {
		...rule,
		use: rule.use.map((loader) => {
			const isCssLoader =
				typeof loader === 'object' &&
				loader.loader &&
				/[\\/]css-loader[\\/]/.test(loader.loader)

			if (! isCssLoader) {
				return loader
			}

			return {
				...loader,
				options: {
					...loader.options,
					modules: {
						auto: /\.module\.(css|scss|sass|pcss)$/i,
						getLocalIdent: buildCssModuleClass,
					},
				},
			}
		}),
	}
}

config.module.rules = config.module.rules.map(enhanceWpScriptsCssLoader)

module.exports = config
