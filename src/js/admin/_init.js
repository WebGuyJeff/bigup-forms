import { submitTest } from './_submit-test'
import { wpInlinedVars } from '../common/_wp-inlined-script'

/**
 * Initialise the email test button.
 */
const init = () => {

	const setupTestButton = () => {
		const button = document.querySelector( '.bigup__smtpTest_button' )
		if ( ! button ) return

		button.addEventListener( 'click', submitTest )

		// Enable the submit button now js is ready (disabled by default).
		if ( wpInlinedVars.settingsOK ) {
			button.disabled = false
		}
	}


	// Initialise on 'doc ready'.
	let docReady = setInterval( () => {
		if ( document.readyState === 'complete' ) {
			clearInterval( docReady )
			setupTestButton()
		}
	}, 100 )
}

export { init }
