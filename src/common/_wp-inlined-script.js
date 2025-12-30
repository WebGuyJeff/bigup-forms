import { stringToJsRegexString, jsRegexToPatternAttr } from './_regex.js'
// Global bigupFormsWpInlinedScript passed from backend by by wp_add_inline_script().


if ( typeof bigupFormsWpInlinedScript === 'undefined' ) {
	throw new Error( "Variable 'bigupFormsWpInlinedScript' is undefined." )
}


/**
 * Iterate definition pattern objects and transform into HTML pattern friendly strings.
 * 
 * @param   {object} defs The validation definitions passed from the backend.
 * @returns {object} defs Definitions with HTML patterns ready for the frontend.
 */
const makePatterns = ( defs ) => {
	for ( const [ i, ] of Object.entries( defs ) ) {
		let pattern = defs[ i ].rules.pattern
		if ( pattern?.regex === undefined || typeof pattern.regex !== 'string' ) {
			console.error( "Pattern object must contain 'regex' property as type 'string'." )
			pattern = ''
		} else if ( pattern.regex !== '' ) {
			pattern = stringToJsRegexString( pattern.regex )
		} else {
			pattern = ''
		}
		const { patternAttr, warnings } = jsRegexToPatternAttr( pattern )
		if ( warnings.length ) {
			console.warn( warnings.join( '\n' ) )
		}
		defs[ i ].rules.pattern = patternAttr
	}
	return defs
}


const {
	settingsOK,
	restSubmitURL,
	restStoreURL,
	restTestURL,
	restNonce,
	debug,
} = bigupFormsWpInlinedScript

// Clone to prevent mutating the original by reference.
const validationDefinitions = makePatterns( structuredClone( bigupFormsWpInlinedScript.validationDefinitions ) )

export {
	settingsOK, // Boolean value indicating email settings are configured.
	restSubmitURL, // REST API submit endpoint.
	restStoreURL, // REST API store endpoint.
	restTestURL, // REST API store endpoint.
	restNonce, // WP nonce string.
	debug, // Boolean value indicating whether debug output should be logged to console.
	validationDefinitions // Server-side Validation definitions.
}
