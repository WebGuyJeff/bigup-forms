import { testSMTP } from './_test-smtp'
import { bigupFormsInlinedVarsAdmin } from './_get-wp-inlined-vars-admin'

/**
 * Initialise the email test button.
 */
const init = () => {

	const setupTestButton = () => {
		const testButton = document.querySelector( '.bigupForms__smtpTest_button' )
		if ( !testButton ) return

		testButton.addEventListener( 'click', testSMTP )

		// Enable the submit button now that JS is ready (disabled by default).
		if ( bigupFormsInlinedVarsAdmin.settingsOK ) {
			testButton.disabled = false
		}
	}

	// Initialise on 'doc ready'.
	const docReadyInterval = setInterval( () => {
		if ( document.readyState === 'complete' ) {
			clearInterval( docReadyInterval )
			setupTestButton()
		}
	}, 100 )
}

export { init }
