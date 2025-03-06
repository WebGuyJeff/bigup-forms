import { debug, start, stopwatch } from '../common/_debug'
import { fetchHttpRequest } from '../common/_fetch'
import { disallowedTypes } from './_file-upload'
import { removeChildren } from '../common/_util'
import { alertsShowWaitHide, alertsShow } from '../common/_alert'
import { wpInlinedVars } from '../common/_wp-inlined-script'

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

	const formData   = new FormData()
	const textInputs = form.querySelectorAll( ':is( input, textarea ):not( .saveTheBees, .bigup__customFileUpload_input )' )
	const fileInput  = form.querySelector( '.bigup__customFileUpload_input' )

	textInputs.forEach( input => {
		formData.append(
			input.name,
			JSON.stringify( {
				'value': input.value,
				'type': input.type,
				'id': ( input.id ) ? input.id : false,
			} )
		)
	} )
	formData.append(
		'formMeta',
		JSON.stringify( {
			'name': form.getAttribute( 'name' ),
			'id': form.getAttribute( 'data-form-id' )
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
	const { restSubmitURL, restNonce } = wpInlinedVars
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
		if ( result.formData?.has_errors ) {
			// Check fields for errors.
			textInputs.forEach( input => {

				// Remove inline errors.
				const removeErrors = ( input ) => {
					const errorBox = input?.nextElementSibling
					if ( errorBox && errorBox.classList.contains( 'bigup__form_inlineErrors' ) ) {
						errorBox.remove()
						input.removeAttribute( 'aria-errormessage' )
						input.removeAttribute( 'aria-invalid' )
					}
				}

				// Remove errors on user focus.
				const onFocus = ( { target } ) => removeErrors( target )
				input.addEventListener( 'focus', onFocus, { once: true } )

				const fieldErrors = result.formData.fields[ input.name ]?.errors
				if ( fieldErrors ) {

					// Remove old errors.
					removeErrors( input )

					// Attach errors to input.
					let div = document.createElement( 'div' )
					div.classList.add( 'bigup__form_inlineErrors' )
					fieldErrors.forEach( error => {
						let span = document.createElement( 'span' )
						span.innerHTML = error
						div.appendChild( span )
					} )
					const errorID = input.name + '-error'
					div.setAttribute( 'id', errorID )
					input.setAttribute( 'aria-errormessage', errorID )
					input.setAttribute( 'aria-invalid', true )
					input.after( div )
				}
			} )
		}

		// Display post-fetch alerts.
		const postFetchAlerts = []
		result.output.forEach( message => postFetchAlerts.push( { 'text': message, 'type': ( result.ok ) ? 'success' : 'danger' } ) )
		alertsShowWaitHide( form, postFetchAlerts, 5000 )

		// Clean up form if email was sent.
		if ( result.ok ) {
			let inputs = form.querySelectorAll( '.bigup__form_input' )
			inputs.forEach( input => { input.value = '' } )
			const fileList = form.querySelector( '.bigup__customFileUpload_output' )
			if ( fileList ) removeChildren( fileList )
		}

	} catch ( error ) {
		console.error( error )
	} finally {
		if( debug ) console.log( stopwatch() + ' | END | handleSubmit' )
	}

}


export { submit }
