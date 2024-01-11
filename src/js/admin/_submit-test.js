import { debug, start, stopwatch } from '../common/_debug'
import { fetchHttpRequest } from '../common/_fetch'
import { alertsShowWaitHide, alertsShow } from '../common/_alert'
import { wpInlinedVars } from '../common/_wp-inlined-script'


/**
 * Perform a test submission in the admin area.
 */


/**
 * Test values to pass in fetch request.
 * 
 * Backend controller expects values for 'email', 'name' and 'message'.
 */
const testValues = {
	'email': 'test@email.test',
	'name': 'Test Email',
	'message': 'This is a test message. If you receive this, your email settings are OK! 🥳',
}


/**
 * Handle the submitted form.
 * 
 * Perform a test email send and display user feedback as popout alerts.
 * 
 * @param {SubmitEvent} event
 * 
 */
async function submitTest( event ) {

	event.preventDefault()
	if( debug ) start()
	if( debug ) console.log( 'Time | Start/Finish | Function | Target' )
	if( debug ) console.log( stopwatch() + ' |START| handleSubmit' )

	const form = event.currentTarget.closest( 'form' )

	// Set test values in formData.
	const formData   = new FormData()
	for ( const prop in testValues ) {
		formData.append( prop, testValues[ prop ] )
	}

	// Fetch params.
	const { restURL, restNonce } = wpInlinedVars
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
			fetchHttpRequest( restURL, fetchOptions ),
			alertsShow( form, preFetchAlerts )
		] )

		// Display post-fetch alerts.
		const postFetchAlerts = []
		result.output.forEach( message => postFetchAlerts.push( { 'text': message, 'type': ( result.ok ) ? 'success' : 'danger' } ) )
		alertsShowWaitHide( form, postFetchAlerts, 5000 )

	} catch ( error ) {
		console.error( error )
	} finally {
		if( debug ) console.log( stopwatch() + ' | END | handleSubmit' )
	}

}


export { submitTest }
