import { submitTest, wpLocalized } from './_submit-test'

/**
 * Initialise the email test button.
 */
const init = () => {

	const setupTestButton = () => {
		const button = document.querySelector( '.bigup__smtpTest_button' )
		if ( ! button ) return

		button.addEventListener( 'click', submitTest )

		// Enable the submit button now js is ready (disabled by default).
		if ( wpLocalized.settings_ok ) {
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
