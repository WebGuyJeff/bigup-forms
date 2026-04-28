import { useEffect } from '@wordpress/element'

const useWpAdminBarOffset = ( varName = '--bf_wpadminbarHeight_jsControlled' ) => {

	useEffect( () => {
		const root = document.getElementById( 'bigupFormsAdmin' )

		if ( ! root ) {
			console.error( 'Element with ID "bigupFormsAdmin" not found.' )

			return
		}

		const update = () => {

			const el = document.getElementById( 'wpadminbar' )

			if ( ! el ) {
				root.style.setProperty( varName, '0px' )

				return
			}

			const rect = el.getBoundingClientRect()
			let offset = rect.bottom

			if ( offset < 0 ) {
				offset = 0
			}

			root.style.setProperty( varName, `${offset}px` )
		}

		update()

		let ticking = false
		const onScroll = () => {
			if ( ! ticking ) {
				requestAnimationFrame( () => {
					update()
					ticking = false
				} )
				ticking = true
			}
		}

		window.addEventListener( 'resize', update )
		window.addEventListener( 'scroll', onScroll, { passive: true } )

		const observer = new MutationObserver( update )
		const el = document.getElementById( 'wpadminbar' )

		if ( el ) {
			observer.observe( el, { childList: true, subtree: true } )
		}

		return () => {
			window.removeEventListener( 'resize', update )
			window.removeEventListener( 'scroll', onScroll )
			observer.disconnect()
		}
	}, [ varName ] )
}

export { useWpAdminBarOffset }
