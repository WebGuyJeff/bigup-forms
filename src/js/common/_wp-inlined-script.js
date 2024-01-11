/**
 * Grab vars added by wp_add_inline_script().
 */

const getWpInlinedScript = () => {

	if ( typeof bigupFormsWpInlinedScript === 'undefined' ) return false

	const {
		settingsOK, // Boolean value indicating email settings are configured.
		restURL, // REST API endpoint URL.
		restNonce, // WP nonce string.
		debug, // Boolean value indicating whether debug output should be logged to console.
		validationFormats, // Array of data format rules to use for validation.
	} = bigupFormsWpInlinedScript
	return { settingsOK, restURL, restNonce, debug, validationFormats }
}
const wpInlinedVars = getWpInlinedScript()

export { wpInlinedVars }
