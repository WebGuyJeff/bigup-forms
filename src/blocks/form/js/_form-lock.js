import { debug, stopwatch } from './_debug'

/**
 * Lock/unlock a form from user input.
 * 
 * @param {object} form The target form.
 * @param {bool} shouldLock Whether the form should be locked.
 */
function formLock( form, shouldLock ) {
	const inputs = form.querySelectorAll( ':is( input, textarea )' ),
		buttons  = form.querySelectorAll( '.bigupForms__button' )

	if ( shouldLock ) {
		if( debug ) console.log( `${stopwatch()} |START| formLock | Locked` )
		form.classList.add( 'bigupForms__form-locked' )
		inputs.forEach( input => { input.disabled = true } )
		buttons.forEach( button => { button.disabled = true } )

	} else {
		form.classList.remove( 'bigupForms__form-locked' )
		inputs.forEach( input => { input.disabled = false } )
		buttons.forEach( button => { button.disabled = false } )
		if( debug ) console.log( `${stopwatch()} | END | formLock | Unlocked` )
	}
}

export { formLock }
