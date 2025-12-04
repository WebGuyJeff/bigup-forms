/**
 * Grab vars added by wp_add_inline_script().
 * 
 * Destructuring for verbose import.
 */

const getWpInlinedVarsAdmin = () => {
	if ( typeof bigupFormsWpInlinedScript === 'undefined' ) return false
	const {
		settingsOK, // Boolean value indicating email settings are configured.
		restTestURL, // REST API store endpoint.
		restNonce, // WP nonce string.
	} = bigupFormsWpInlinedScript
	return { settingsOK, restTestURL, restNonce }
}
const bigupFormsInlinedVarsAdmin = getWpInlinedVarsAdmin()

export { bigupFormsInlinedVarsAdmin }
