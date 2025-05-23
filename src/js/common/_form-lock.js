import { debug, stopwatch } from './_debug'

/**
 * Lock/unlock a form from user input.
 * 
 * @param {object} form The target form.
 * @param {bool} shouldLock Whether the form should be locked.
 */
function formLock( form, shouldLock ) {
	const inputs = form.querySelectorAll( ':is( input, textarea )' ),
		button   = form.querySelector( '.bigupForms__submit' )

	if ( shouldLock ) {
		if( debug ) console.log( `${stopwatch()} |START| formLock | Locked` )
		form.classList.add( 'bigupForms__form-locked' )
		inputs.forEach( input => { input.disabled = true } )
		button.disabled = true

	} else {
		form.classList.remove( 'bigupForms__form-locked' )
		inputs.forEach( input => { input.disabled = false } )
		button.disabled = false
		if( debug ) console.log( `${stopwatch()} | END | formLock | Unlocked` )
	}
}

export { formLock }
