/**
 * Remove all child nodes from a dom node.
 * 
 * @param {object} parent The dom node to remove all child nodes from.
 * 
 */
function removeChildren( parent ) {
	return new Promise( ( resolve, reject ) => {
		try {
			while ( parent.firstChild ) {
				parent.removeChild( parent.firstChild )
			}
			resolve( 'Child nodes removed successfully.' )
		} catch ( error ) {
			reject( error )
		}
	} )
}


/**
 * Clean strings for human output.
 * 
 * This function uses regex patterns to clean strings in 3 stages:
 * 
 * 1) Remove all html tags not inside brackets ()
 *      (?<!\([^)]*?) - do not match if preceeded by a '('
 *      <[^>]*?> - match all <>
 * 2) Remove anything that is not:
 *      (\([^\)]*?\)) - content enclosed in ()
 *      ' '   - spaces
 *      \p{L} - letters
 *      \p{N} - numbers
 *      \p{M} - marks (accents etc)
 *      \p{P} - punctuation
 * 3) Trim and replace multiple spaces with a single space.
 * 
 * @link https://www.regular-expressions.info/unicode.html#category
 * @param {string} string The dirty string.
 * @returns The cleaned string.
 * 
 */
function makeHumanReadable( string ) {
	if ( typeof string !== 'string' ) {
		console.error( `makeHumanReadable expects a string, but ${typeof string} received.`, string )
		return 'error getting message'
	}
	const tags = /(?<!\([^)]*?)<[^>]*?>/g
	const humanReadable = /(\([^\)]*?\))|[ \p{L}\p{N}\p{M}\p{P}]/ug
	const badWhitespaces = /^\s*|\s(?=\s)|\s*$/g
	let notags = string.replace( tags, '' )
	let notagsHuman = notags.match( humanReadable ).join( '' )
	let notagsHumanClean = notagsHuman.replace( badWhitespaces, '' )
	return notagsHumanClean
}


/**
 * Convert string to a slug safe for the input[ name ] attribute.
 * 
 * Strip a string of invalid charaters leaving only numbers, letters and "-_".
 * Returned string cannot begin with a number.
 * 
 * @param {*}	string	The string to clean.
 * @returns		string	Cleaned string, or false on no valid characters.
 */
function makeNameAttributeSafe( string ) {
	// Regex patterns.
	const badChars         = /[^a-z0-9_-]/g
	const extraSpaces      = /^\s*|\s(?=\s)|\s*$/g
	const spaces           = /\s/g
	const extraHyphens     = /-{2,}/g
	const extraUnderscores = /_{2,}/g
	const firsCharIsLetter = /^[A-Za-z]/g
	// Process strings.
	const goodChars       = string ? string.replace( badChars, '' ) : false
	const goodSpaces      = goodChars ? goodChars.replace( extraSpaces, '' ) : false
	const hyphenSpaces    = goodSpaces ? goodSpaces.replace( spaces, '-' ) : false
	const goodHyphens     = hyphenSpaces ? hyphenSpaces.replace( extraHyphens, '-' ) : false
	const goodUnderscores = goodHyphens ? goodHyphens.replace( extraUnderscores, '_' ) : false
	if ( ! goodUnderscores ) return false
	// Apply prefix if first char isn't a letter.
	const cleanName = firsCharIsLetter.test( goodUnderscores ) ? goodUnderscores : type + '-' + goodUnderscores
	return cleanName
}


/**
 * Escape a regex string.
 * 
 * @param	string	The string to escape.
 * @returns	string	Regex string with special chars escaped.
 */
const escapeRegex = ( string ) => {
	return string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) // $& means the whole matched string.
}

/*
 *   /^[\p{L}](?:[\p{L}]|([- ',\.])(?!))*$/u
 *   /\^\[\\p\{L\}\]\(\?:\[\\p\{L\}\]\|\(\[- ',\\\.\]\)\(\?!\)\)\*\$/u
 */



/**
 * Unescape a regex string.
 * 
 * @param	string	The string to escape.
 * @returns	string	Regex string with special chars escaped.
 */
const unescapeRegex = ( string ) => {
	const escapedSpecialChars = '/(\\' +
		[
			'/',
			'.',
			'*',
			'+',
			'?',
			'|',
			'(',
			')',
			'[',
			']',
			'{',
			'}',
			'\\',
			'$',
			'^',
			'-'
		].join( '|\\' ) + ')/g'

	return string.replace( escapedSpecialChars, '' )
}


export { removeChildren, makeHumanReadable, makeNameAttributeSafe, escapeRegex, unescapeRegex }
