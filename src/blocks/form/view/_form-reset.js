import { updateFileList } from './_file-upload'

/**
 * Reset (clear) a form of all user input.
 * 
 * Requires the reset button to be enabled.
 */

const formReset = ( event ) => {
	event.preventDefault()

	const form = event.target.closest( 'form' )
	form.reset()

	// Remove the file list table if present.
	const filesInput = form.querySelector( '.bigupForms__customFileUpload' )?.querySelector( 'input' )
	filesInput && updateFileList( filesInput )
}

export { formReset }
