import { __ } from '@wordpress/i18n'
import { debug, start, stopwatch } from './_debug'
import { fetchHttpRequest } from './_fetch'
import { disallowedTypes } from './_file-upload'
import { removeChildren } from '../../../common/_util'
import { alertsShow, alertsUpdateWaitHide, alertsShowWaitHide } from './_alert'
import { restSubmitURL, restNonce } from '../../../common/_wp-inlined-script'
import { formReset } from './_form-reset'


/**
 * Handle frontend form submissions.
 */


/**
 * Handle the submitted form.
 * 
 * Calls all functions to perform the form submission, and handle
 * user feedback displayed over the form as 'popout messages'.
 * Popout transitions and fetch request are performed asynchronously.
 * 
 * @param {SubmitEvent} event
 * 
 */
async function submit( event ) {

	event.preventDefault()

	if( debug ) start()
	if( debug ) console.log( 'Time | Start/Finish | Function | Target' )
	if( debug ) console.log( stopwatch() + ' |START| handleSubmit' )

	const form = event.currentTarget

	// boot bots if honeypot is filled.
	if ( form.querySelector( '[name="required_field"]' ).value !== '' ) {
		document.documentElement.remove()
		window.location.replace( "https://en.wikipedia.org/wiki/Robot" )
	}

	const formData  = new FormData()
	const inputs    = form.querySelectorAll( ':is( .bigupForms__input, input, textarea, select ):not( .saveTheBees, .bigupForms__customFileUpload_input )' )
	const fileInput = form.querySelector( '.bigupForms__customFileUpload_input' )

	inputs.forEach( input => {
		formData.append(
			input.name,
			JSON.stringify( {
				'value'                : input.value,
				'type'                 : input.type,
				'id'                   : ( input.id ) ? input.id : false,
				'required'             : typeof input.getAttribute( 'required' ) === 'string' ? true : false,
				'validationDefinition' : input.getAttribute( 'data-validation-definition' ),
			} )
		)
	} )
	formData.append(
		'formMeta',
		JSON.stringify( {
			'name': form.getAttribute( 'name' ),
			'id'  : form.getAttribute( 'data-form-post-id' ),
			'url' : window.location.href,
		} )
	)

	// Handle attachments if file input present.
	if ( fileInput ) {

		// Check for disallowed MIME types.
		if ( disallowedTypes.detected ) {
			const fileExts   = disallowedTypes.list.join( ', ' )
			const fileAlerts = [ { 'text': `Files of type ".${fileExts}" are not allowed. Please amend your file selection.`, 'type': 'danger' } ]
			const wait       = 5000
			await alertsShowWaitHide( form, fileAlerts, wait )

			// User needs to amend file selection, so we quit here.
			return

		} else {
			// Add files to the form data.
			const files = fileInput.files
			for( let i = 0; i < files.length; i++ ){
				let file = files[ i ]
				formData.append( 'files[]', file, file.name )
			}
		}
	}

	// Fetch params.
	const fetchOptions = {
		method: "POST",
		headers: {
			"X-WP-Nonce" : restNonce,
			"Accept"     : "application/json"
		},
		body: formData,
	}


	try {

		// Display pre-fetch alerts in parrallel with fetch.
		const preFetchAlerts = [ { 'text': 'Connecting...', 'type': 'info' } ]
		let [ result, ] = await Promise.all( [
			fetchHttpRequest( restSubmitURL, fetchOptions ),
			alertsShow( form, preFetchAlerts )
		] )	

		// If server has reported validation errors.
		if ( result.data?.has_errors ) {
			// Check fields for errors.
			inputs.forEach( input => {

				// Get the output element.
				let output
				const nextEl = input?.nextElementSibling
				if ( nextEl && nextEl.classList.contains( 'bigupForms__inlineErrors' ) ) {
					output = nextEl
				} else {
					console.error( 'Could not find inline error element.' )
					return
				}
		
				const fieldErrors = result.data.fields[ input.name ]?.errors
				if ( fieldErrors ) {

					// Remove old errors.
					removeErrors( input )

					// Build RegExp for server-side regex rejections.
					const regexRejects = result.data.fields[ input.name ]?.rejects
					if ( regexRejects ) {
						let regexes = []
						regexRejects.forEach( reject => {
							const escapedReject = RegExp.escape( reject )
							regexes.push( escapedReject )
						} )
						const reString = '(?:' + regexes.join( ')|(?:' ) + ')'
						const re       = new RegExp( reString, 'g' )
						// Store the RegExp for the input event listener.
						input.rejectsRegexp = re
					}

					// Attach regex rejects message to output.
					if ( input?.rejectsRegexp ) {
						let span = document.createElement( 'span' )
						span.classList.add( 'regexRejects' )
						output.appendChild( span )

						// MAKE THIS.
						doRegexRejectsMessage( input )
					}

					// Attach errors to output.
					fieldErrors.forEach( error => {
						let span = document.createElement( 'span' )
						span.innerHTML = error
						output.appendChild( span )
					} )
					const errorID = 'error-' + input.id
					output.setAttribute( 'id', errorID )
					input.setAttribute( 'aria-errormessage', errorID )
					input.setAttribute( 'aria-invalid', true )
					output.classList.add( 'hasErrors' )
					input.after( output )

					input.addEventListener( 'keyup', onKeyup )
				}
			} )
		}

		// Display post-fetch alerts.
		const postFetchAlerts = []
		result.output.forEach( message => postFetchAlerts.push( { 'text': message, 'type': ( result.ok ) ? 'success' : 'danger' } ) )
		alertsUpdateWaitHide( form, postFetchAlerts, 5000 )

		// Clean up form if email was sent.
		result.ok && formReset( event )

	} catch ( error ) {
		console.error( error )
	} finally {
		if( debug ) console.log( stopwatch() + ' | END | handleSubmit' )
	}

}

/**
 * Update the outputof regex rejects message.
 *
 * @param { Element } input - The target input element.
 */
const doRegexRejectsMessage = ( input ) => {

	let rejectsMessage = ''
	const reResult = input.value.matchAll( input.rejectsRegexp )
	let reMatches  = []
	reResult.forEach( match => {
		reMatches.push( match[ 0 ] )
	} )

	if ( reMatches.length === 0 ) {
		return false
	}

	// Build a HTML string of error message content.
	reMatches.forEach( match => {
		// Use Option() to make the browser escape HTML.
		const matchEsc  = new Option( match ).innerHTML
		rejectsMessage += '<span class="regexRejectHighlight">' + matchEsc + '</span> '
	} )
	// Remove last space.
	rejectsMessage = rejectsMessage.slice( 0, -1 )

	const span = input?.nextElementSibling?.querySelector( '.regexRejects' )
	span.innerHTML = __( 'Remove invalid text: ', 'bigup-forms' ) + '<br />' + rejectsMessage

	return true
}


/**
 * Handle input state on keyup event.
 *
 * @param { Element } target - The target element passed by the event handler.
 */
const onKeyup = ( { target } ) => {
	const areMatches = doRegexRejectsMessage( target )
	if ( ! areMatches ) {
		removeErrors( target )
	}
}


/**
 *  Remove inline errors.
 */
const removeErrors = ( input ) => {
	const output = input?.nextElementSibling
	if ( output && output.classList.contains( 'bigupForms__inlineErrors' ) ) {
		output.classList.remove( 'hasErrors' )
		removeChildren( output )
		input.removeAttribute( 'aria-errormessage' )
		input.removeAttribute( 'aria-invalid' )
	}
}


export { submit }
