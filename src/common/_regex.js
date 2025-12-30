/**
 * Accept a string and attempt to build a RegExp() object from it.
 * 
 * @param {string} string - Any input string normally passed from backend or user input.
 * @returns {string} reString - RegExp().source (no /.../ delimiters)
 */
const stringToJsRegexString = ( string ) => {
	if ( typeof string !== 'string' ) {
		console.error( "'string' must be a string." + typeof string + ' found.' )
		return
	}
	let re
	try {
		re = new RegExp( string )
	} catch ( e ) {
		console.error( "Invalid Regex:", e.message )
	}
	const reString = re.source // No delimeters or flags.
	return reString
}


/**
 * Convert a JS RegExp().source string into a safe HTML `pattern` attribute value.
 *
 * HTML pattern notes:
 * - No delimiters (/.../) and no flags.
 * - Implicitly anchored to the entire value (acts like ^(?:pattern)$).
 * - Must be single-line.
 * - Some modern regex features can be unsupported/inconsistent in pattern across browsers.
 * 
 * String to test flag all warnings: ^(?<=A)\\p{L}(?<name>abc)(?i:xyz)\n.*$
 *
 * @param {string} jsPattern - RegExp().source (no /.../ delimiters)
 * @param {object} [opts]
 * @param {boolean} [opts.stripAnchors=true] - Remove one leading ^ and one trailing $
 * @param {boolean} [opts.warnUnsupported=true] - Detect common unsupported constructs and warn
 * @returns { { patternAttr: string, warnings: string[] } }
 */
const jsRegexToPatternAttr = ( jsRegex, opts = { stripAnchors: true, warnUnsupported: true } ) => {
	const stripAnchors    = !! opts.stripAnchors
  	const warnUnsupported = !! opts.warnUnsupported

	if ( typeof jsRegex !== 'string' ) {
		console.error( "'jsPattern' must be a string." + typeof jsPattern + ' found.' )
		return
	}

	const warnings = []

	let p = jsRegex

	// 1. Must be single-line.
	if ( /[\r\n]/.test( p ) ) {
		warnings.push( 'Newlines are not allowed in HTML pattern; removed.' )
		p = p.replace( /[\r\n]/g, '' )
	}

	// 2. Strip anchors (HTML patterns are implicitly anchored).
	if ( stripAnchors ) {
		if ( p.startsWith( '^' ) ) {
			warnings.push( 'Leading ^ removed ( HTML pattern is implicitly anchored ).' )
			p = p.slice( 1 )
		}
		if ( p.endsWith( '$' ) ) {
			warnings.push( 'Trailing $ removed (HTML pattern is implicitly anchored).' )
			p = p.slice( 0, -1 )
		}
	}

	// 3. Best-effort warnings for constructs that often break HTML pattern validation.
	if ( warnUnsupported ) {
		// Lookbehind (?<=...) (?<!...)
		if ( /\(\?<=[\s\S]*?\)|\(\?<![\s\S]*?\)/.test( p ) ) {
			warnings.push( 'Lookbehind detected; HTML pattern support is inconsistent across browsers.' )
		}

		// Unicode property escapes \p{..} \P{..}
		if ( /\\[pP]\{[^}]+\}/.test( p ) ) {
			warnings.push( 'Unicode property escapes (\\p{…}/\\P{…}) detected; not reliably supported in HTML pattern.' )
		}

		// Named capturing groups (?<name>...)
		if ( /\(\?<([A-Za-z_]\w*)>/.test( p ) ) {
			warnings.push( 'Named capturing groups detected; may not be supported in HTML pattern on all browsers.' )
		}

		// PCRE-style inline modifiers (?i) (?m) etc. (not valid JS/HTML pattern)
		if ( /\(\?[imsuxU-]+:?/.test( p ) ) {
			warnings.push( 'Inline modifiers like (?i) detected; not valid in HTML pattern. Attempting to neutralize.' )
			// Best-effort: convert "(?i:" or "(?i" into "(?:"
			p = p.replace( /\(\?[imsuxU-]+:?/g, '(?:' )
		}
	}
	return { patternAttr: p, warnings }
}


export { stringToJsRegexString, jsRegexToPatternAttr }
