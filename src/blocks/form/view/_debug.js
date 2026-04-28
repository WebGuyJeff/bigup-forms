import { debug } from '../../../common/_wp-inlined-script'

/**
 * Holds the start time of the script.
 */
let startTime = ''

/**
 * Set the start time of the script.
 */
const start = () => startTime = Date.now()

/**
 * Get timestamps.
 * 
 * @return milliseconds since function call.
 */
const stopwatch = () => {
	let elapsed = Date.now() - startTime
	return elapsed.toString().padStart( 5, '0' )
}


export { debug, start, stopwatch }
