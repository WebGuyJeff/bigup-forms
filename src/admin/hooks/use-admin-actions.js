import { useRef, useState } from '@wordpress/element'
import { useAPI } from './use-api'

const useAdminActions = ( { showToast } ) => {
	const [ settingsState, setSettingsState ] = useState( {} )
	const [ shellData, setShellData ] = useState( {
		pluginName: 'Bigup Forms',
		status: {},
		tabs: [],
		oauth: {},
	} )
	const [ invalidField, setInvalidField ] = useState( '' )
	const [ loadingAction, setLoadingAction ] = useState( '' )
	const [ smtpOutput, setSmtpOutput ] = useState( null )
	const requestKeys = useRef( { bootstrap: 0 } )
	const debounceTimers = useRef( {} )
	const settingRequestKeys = useRef( {} )
	const { sendRequest } = useAPI( { showToast } )

	const applyBootstrapPayload = ( data ) => {
		if ( ! data ) {
			return
		}
		setSettingsState( data.settings || {} )
		setShellData( ( prev ) => ( {
			pluginData: data.pluginData || { Name: 'Bigup Forms' },
			status: data.status || {},
			tabs: Array.isArray( data.tabs ) ? data.tabs : prev.tabs,
			oauth: data.oauth || prev.oauth,
		} ) )
	}

	const syncBootstrapQuiet = async () => {
		const result = await sendRequest( 'bootstrap', {
			method: 'GET',
			showFeedback: false,
		} )
		if ( result.ok && result.data ) {
			applyBootstrapPayload( result.data )
		}
		return result
	}

	const loadBootstrap = async () => {
		const requestKey = requestKeys.current.bootstrap + 1

		requestKeys.current.bootstrap = requestKey
		const result = await sendRequest( 'bootstrap', {
			method: 'GET',
			showFeedback: false,
		} )

		if ( requestKeys.current.bootstrap !== requestKey ) {
			return result
		}
		if ( result.ok && result.data ) {
			applyBootstrapPayload( result.data )
		}

		return result
	}

	const updateSetting = async ( key, value ) => {
		setSettingsState( ( current ) => ( { ...current, [ key ]: value } ) )

		const requestKey = ( settingRequestKeys.current[ key ] || 0 ) + 1

		settingRequestKeys.current[ key ] = requestKey

		const result = await sendRequest( 'settings', {
			method: 'POST',
			body: { key, value },
		} )

		if ( settingRequestKeys.current[ key ] !== requestKey ) {
			return
		}

		if ( result.ok ) {
			setInvalidField( '' )
			await syncBootstrapQuiet()
		} else if ( result?.data?.field ) {
			setInvalidField( result.data.field )
		}
	}

	const debouncedUpdateSetting = ( key, value, delay = 400 ) => {
		setSettingsState( ( current ) => ( { ...current, [ key ]: value } ) )

		if ( debounceTimers.current[ key ] ) {
			clearTimeout( debounceTimers.current[ key ] )
		}

		debounceTimers.current[ key ] = setTimeout( () => {
			updateSetting( key, value )
		}, delay )
	}

	const flushUpdateSetting = ( key, value ) => {
		if ( debounceTimers.current[ key ] ) {
			clearTimeout( debounceTimers.current[ key ] )
		}

		updateSetting( key, value )
	}

	const runTest = async ( type ) => {
		setLoadingAction( `test_${type}` )
		const result = await sendRequest( 'email/test', {
			method: 'POST',
			body: { type },
		} )
		const data = Array.isArray( result?.data ) ? result.data : [ 'Error: No output returned' ]

		if ( type === 'smtp' || type === 'email' ) {
			const status = result.ok ? 'success' : 'danger'

			setSmtpOutput( { status, messages: data } )
		}
		setLoadingAction( '' )
		await syncBootstrapQuiet()
	}

	const disconnectMicrosoft = async () => {
		setLoadingAction( 'disconnect_ms' )
		const result = await sendRequest( 'email/oauth-disconnect', {
			method: 'POST',
		} )
		setLoadingAction( '' )
		await syncBootstrapQuiet()
		return result
	}

	return {
		settingsState,
		shellData,
		invalidField,
		loadingAction,
		smtpOutput,
		loadBootstrap,
		updateSetting,
		debouncedUpdateSetting,
		flushUpdateSetting,
		runTest,
		disconnectMicrosoft,
	}
}

export { useAdminActions }
