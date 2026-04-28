import { createRoot, createElement, Fragment, useEffect, useState } from '@wordpress/element'
import { useAdminActions, useAdminInlinedVars, useToast, useWpAdminBarOffset } from '../hooks'
import { Page, Header, Footer, Tabs } from './components/layout'
import { Toast } from './components/feedback'
import {
	OverviewTab,
	EmailTab,
	AdvancedTab,
} from './tabs'

const getActiveTabFromURL = () => {
	const query = new URLSearchParams( window.location.search )

	return query.get( 'tab' ) || 'overview'
}

const updateHistoryTab = ( tab ) => {
	const url = new URL( window.location.href )

	if ( tab === 'overview' ) {
		url.searchParams.delete( 'tab' )
	} else {
		url.searchParams.set( 'tab', tab )
	}
	window.history.pushState( {}, '', url.toString() )
}

const App = () => {
	const { toasts, showToast } = useToast()
	const {
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
	} = useAdminActions( { showToast } )
	const [ activeTab, setActiveTab ] = useState( getActiveTabFromURL() )
	const [ statusReady, setStatusReady ] = useState( false )
	const pluginName = shellData.pluginData?.Name || 'Bigup Forms'
	const pluginDescription = shellData.pluginData?.Description
	const PluginURI = shellData.pluginData?.PluginURI
	const PluginVersion = shellData.pluginData?.Version
	const AuthorName = shellData.pluginData?.Author
	const AuthorURI = shellData.pluginData?.AuthorURI
	const statusInfo = shellData.status || {}
	const tabs = Array.isArray( shellData.tabs ) ? shellData.tabs : []
	const oauth = shellData.oauth || {}

	useWpAdminBarOffset()

	useEffect( () => {
		( async () => {
			const result = await loadBootstrap()

			if ( result?.ok ) {
				setStatusReady( true )
			}
		} )()
	}, [] )

	useEffect( () => {
		const params = new URLSearchParams( window.location.search )

		if ( params.get( 'oauth' ) !== 'success' ) {
			return
		}

		showToast( 'Microsoft account connected.', 'success' )
		const url = new URL( window.location.href )

		url.searchParams.delete( 'oauth' )
		window.history.replaceState( {}, '', url.toString() )
		loadBootstrap()
		// One-shot on load; loadBootstrap identity is stable enough for refresh after OAuth redirect.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] )

	useEffect( () => {
		const onPopState = () => setActiveTab( getActiveTabFromURL() )

		window.addEventListener( 'popstate', onPopState )

		return () => window.removeEventListener( 'popstate', onPopState )
	}, [] )

	const handleTabSelect = ( tab ) => {
		if ( ! tab || tab === activeTab ) {
			return
		}
		setActiveTab( tab )
		updateHistoryTab( tab )
	}

	const tabProps = {
		settingsState,
		updateSetting,
		debouncedUpdateSetting,
		flushUpdateSetting,
		invalidField,
		status: statusInfo,
	}

	let tabContent = createElement( OverviewTab, {
		status: statusInfo,
		onNavigateTab: handleTabSelect,
	} )

	if ( activeTab === 'email' ) {
		tabContent = createElement( EmailTab, {
			...tabProps,
			oauth,
			runTest,
			smtpOutput,
			loadingAction,
			disconnectMicrosoft,
		} )
	}
	if ( activeTab === 'advanced' ) {
		tabContent = createElement( AdvancedTab, tabProps )
	}

	return (
		<>
			<Page>
				<Header
					pluginName={pluginName}
					pluginDescription={pluginDescription}
					status={statusInfo}
					showStatus={statusReady}
				/>

				{tabs.length > 0 && (
					<Tabs
						activeTab={activeTab}
						tabs={tabs}
						onSelectTab={handleTabSelect}
					/>
				)}

				{tabContent}

				<Footer
					pluginName={pluginName}
					PluginURI={PluginURI}
					PluginVersion={PluginVersion}
					AuthorName={AuthorName}
					AuthorURI={AuthorURI}
				/>
			</Page>
			<Toast toasts={toasts} />
		</>
	)
}

const mountApp = () => {
	const rootNode = document.getElementById( 'bigupFormsAdmin' )

	if ( ! rootNode || ! useAdminInlinedVars ) {
		return
	}

	const root = createRoot( rootNode )

	root.render( createElement( Fragment, null, createElement( App ) ) )
}

export { mountApp }
