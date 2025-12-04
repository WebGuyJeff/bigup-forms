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
function makeNameAttributeSafe( string = '' ) {
	// Regex patterns.
	const badChars         = /[^a-z0-9_ ]/g
	const extraSpaces      = /^\s*|\s(?=\s)|\s*$/g
	const spaces           = /\s/g
	const extraHyphens     = /-{2,}/g
	const extraUnderscores = /_{2,}/g
	const firsCharIsLetter = /^[a-z]/g
	// Process strings.
	const lowercase       = string.toLowerCase()
	const goodChars       = lowercase.replace( badChars, '' )
	const goodSpaces      = goodChars.replace( extraSpaces, '' )
	const hyphenSpaces    = goodSpaces.replace( spaces, '-' )
	const goodUnderscores = hyphenSpaces.replace( extraUnderscores, '-' )
	const goodHyphens     = goodUnderscores.replace( extraHyphens, '-' )
	const cleanName       = firsCharIsLetter.test( goodHyphens ) ? goodHyphens : 'name' + '-' + goodHyphens

	return cleanName
}


/**
 * Escape a regex string.
 * 
 * @param	string	The string to escape.
 * @returns	string	Regex string with special chars escaped.
 */
const escapeRegex = ( string ) => {
	// Special regex chars: . \ + * ? [ ^ ] $ ( ) { } = ! < > | : - #
	return string.replace( /[.\\+*?[^\]\$(){}=!<>\|:\-#]/g, '\\$&' ) // $& means the whole matched string.
}


/**
 * Unescape a regex string.
 * 
 * @param	string	The string to escape.
 * @returns	string	Regex string with special chars escaped.
 */
const unescapeRegex = ( string ) => {
	// Special regex chars: . \ + * ? [ ^ ] $ ( ) { } = ! < > | : - #
	const escapedSpecialChars = new RegExp( '\\\\\\' + [
		'\\', // Escaped \
		'+',
		'*',
		'?',
		'[',
		'^',
		']',
		'$',
		'(',
		')',
		'{',
		'}',
		'=',
		'!',
		'<',
		'>',
		'|',
		':',
		'-',
		'#'
	].join( '|\\\\\\' ), 'g' )
	const stripLeadingSlash = ( string ) => {
		const hasSlash = new RegExp( /^\\.*/ )
		if ( hasSlash.test( string ) ) {
			return string.slice( 1 ) 
		}
		return string
	}
	return string.replace( escapedSpecialChars, stripLeadingSlash )
}


/**
 * String to Regex.
 * 
 * Separates the delimiters and flags from a regex string before using the RegExp constructor to
 * create and return a regex object.
 * 
 * @param   string Valid regex as a string.
 * @returns object Regular expression object
 */
const stringToRegex = ( string ) => {
	/*
	 * Regex to match and capture regex parts.
	 * @link https://regex101.com/r/m1tRwJ/1
	 * Unescaped regex: ^(?<delim>\/(?=.+(?<delim_end>\/)(?<flags>(?:(?<f>[igsmyu])(?!.*\k<f>.*$)){0,6}$)))?(?<pattern>.*(?=\k<delim>)|(?<!^\/).*(?!\k<delim>))(?:\k<delim>\k<flags>)?$
	 */
	const regexRe    = new RegExp( '^(?<delim>\\/(?=.+(?<delim_end>\\/)(?<flags>(?:(?<f>[igsmyu])(?!.*\\k<f>.*$)){0,6}$)))?(?<pattern>.*(?=\\k<delim>)|(?<!^\\/).*(?!\\k<delim>))(?:\\k<delim>\\k<flags>)?$' )
	const regexParts = string.match( regexRe )
	const pattern    = regexParts?.groups?.pattern || ''
	const flags      = regexParts?.groups?.flags || ''
	const regex      = new RegExp( pattern, flags )
	return regex
}


export {
	removeChildren,
	makeHumanReadable,
	makeNameAttributeSafe,
	escapeRegex,
	unescapeRegex,
	stringToRegex
}
