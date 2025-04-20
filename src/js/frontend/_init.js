import { submit } from './_submit'
import { formLock } from '../common/_form-lock'
import { fileUpload } from './_file-upload'
import { formReset } from './_form-reset'

/**
 * Initialise the form.
 */
const init = () => {

	const setupForms = () => {

		// Attach listeners to the form(s)
		document.querySelectorAll( '.bigupForms__form' ).forEach( form => {

			// Ensure honeypot is hidden.
			const honeypot = document.querySelector( '.saveTheBees' )
			if ( honeypot && honeypot.style.display !== 'none' ) {
				honeypot.style.display = 'none'
			}

			// Attach submit function.
			form.addEventListener( 'submit', submit )

			// Enable the submit button now js is ready (disabled by default).
			formLock( form, false ) 

			// File upload.
			const filesInput = form.querySelector( '.bigupForms__customFileUpload_input' )
			if ( filesInput ) {
				filesInput.addEventListener( 'change', fileUpload )
			}

			// Enable reset button.
			const resetButton = form.querySelector( '.bigupForms__reset' )
			if ( resetButton ) {
				resetButton.disabled = false
				resetButton.addEventListener( 'click', formReset )
			}
		} )
	}


	// Initialise view on 'doc ready'.
	let docReady = setInterval( () => {
		if ( document.readyState === 'complete' ) {
			clearInterval( docReady )
			setupForms()
		}
	}, 100 )
}

export { init }
