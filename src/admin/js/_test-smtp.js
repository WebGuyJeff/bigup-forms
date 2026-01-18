import { fetchHttpRequest } from './_fetch'
import { cleanOutput, addAlerts } from './_alert-inline'
import { bigupFormsInlinedVarsAdmin } from './_get-wp-inlined-vars-admin'
import { formLock } from './_form-lock'

/**
 * Handle the submission.
 * 
 * Send the request and display test feedback.
 * 
 * @param {SubmitEvent} event
 * 
 */
async function testSMTP( event ) {

	event.preventDefault()

	const form = event.currentTarget.closest( 'form' )

	// Fetch params.
	const { restTestURL, restNonce } = bigupFormsInlinedVarsAdmin
	const fetchOptions = {
		method: "POST",
		headers: {
			"X-WP-Nonce"  : restNonce,
			"Content-Type": "application/json",
			"Accept"      : "application/json"
		},
		body: JSON.stringify( { test: 'SMTP' } ),
	}

	try {
		formLock( form, true )
		cleanOutput( form ),
		addAlerts( form, [ { 'text': 'Connecting...', 'type': 'info' } ] )
		let result = await fetchHttpRequest( restTestURL, fetchOptions )

		// Display post-fetch alerts.
		const postFetchAlerts = []
		result.output.forEach( message => postFetchAlerts.push( { 'text': message, 'type': ( result.ok ) ? 'success' : 'danger' } ) )
		addAlerts( form, postFetchAlerts )
		formLock( form, false )

	} catch ( error ) {
		console.error( error )
		addAlerts( form, [ { 'text': 'Failed to test your SMTP settings due to an unknown error.', 'type': 'danger' } ] )
		formLock( form, false )
	}
}

export { testSMTP }
