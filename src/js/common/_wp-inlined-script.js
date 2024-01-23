/**
 * Grab vars added by wp_add_inline_script().
 * 
 * Destructuring for verbose import.
 */

const getWpInlinedScript = () => {

	if ( typeof bigupFormsWpInlinedScript === 'undefined' ) return false

	const {
		settingsOK, // Boolean value indicating email settings are configured.
		restSubmitURL, // REST API submit endpoint.
		restStoreURL, // REST API store endpoint.
		restNonce, // WP nonce string.
		debug, // Boolean value indicating whether debug output should be logged to console.
		dataFormats, // Array of data format rules to use for validation.
	} = bigupFormsWpInlinedScript
	return { settingsOK, restSubmitURL, restStoreURL, restNonce, debug, dataFormats }
}
const wpInlinedVars = getWpInlinedScript()

export { wpInlinedVars }
