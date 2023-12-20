/**
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 */

import { submit } from '../../js/_submit'
import { formLock } from '../../js/_form-lock'
import { fileUpload } from '../../js/_file-upload'

function init() {

	// Hide the honeypot input field(s)
	let honeypots = document.querySelectorAll( '.saveTheBees' )
	honeypots.forEach( honeypot => {
		if ( honeypot.style.display !== "none" ) {
			honeypot.style.display = "none"
		}
	} )

	// Attach listeners to the form(s)
	document.querySelectorAll( '.bigup__form' ).forEach( form => {

		// Attach submit function.
		form.addEventListener( 'submit', submit )

		// Enable the submit button now js is ready (disabled by default).
		formLock( form, false ) 

		// File upload.
		const filesInput = form.querySelector( '.bigup__customFileUpload_input' )
		if ( filesInput ) {
			filesInput.addEventListener( 'change', fileUpload )
		}
	} )
}


// Initialise view on 'doc ready'.
let docReady = setInterval( () => {
	if ( document.readyState === 'complete' ) {
		clearInterval( docReady )
		init()
	}
}, 250 )
