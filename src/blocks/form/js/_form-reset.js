/**
 * Reset (clear) a form of all user input.
 * 
 * Requires the reset button to be enabled.
 */

const formReset = ( event ) => {
	event.preventDefault()

	const form = event.target.closest( 'form' )
	form.reset()
}

export { formReset }
