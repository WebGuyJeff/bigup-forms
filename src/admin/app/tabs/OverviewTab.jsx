import PropTypes from 'prop-types'
import { Panel, Card } from '../components/layout'
import { useAdminInlinedVars } from '../../hooks'

const tabHref = ( settingsBase, slug ) => {
	if ( ! settingsBase ) {
		return '#'
	}
	if ( ! slug || slug === 'overview' ) {
		return settingsBase
	}

	return `${ settingsBase }&tab=${ encodeURIComponent( slug ) }`
}

const OverviewTab = ( { status } ) => {
	const urls = useAdminInlinedVars?.urls || {}
	const settingsBase = urls.settings || ''
	const entriesList = urls.entriesList || ''

	return (
		<Panel>
			<Card>
				<h2 className="bf-overviewTitle">Getting started</h2>
				<ul className="bf-overviewList">
					<li>
						Open{' '}
						<a href={ tabHref( settingsBase, 'email' ) }>Email</a>
						{' '}to choose SMTP or Microsoft (OAuth), then run a connection test from the same screen.
					</li>
					<li>Submit a test form on the site to confirm delivery.</li>
					<li>
						View entries in{' '}
						{entriesList ? (
							<a href={ entriesList }>Form Entries</a>
						) : (
							<span className="bf-overviewMuted">Form Entries (reload the page if this link is missing)</span>
						)}
						.
					</li>
				</ul>
				<div className="bf-overviewStatus">
					<p>
						<strong>Mail readiness:</strong>{' '}
						{status?.settingsOK ? 'Ready to send mail.' : 'Incomplete — finish required fields in other tabs.'}
					</p>
					<ul className="bf-overviewStatusList">
						<li>{status?.settingsOK ? 'Email delivery settings look complete.' : 'Email delivery fields still need attention.'}</li>
						<li>
							{status?.msConnected
								? 'Microsoft account is connected.'
								: 'Microsoft account is not connected (only needed when using Microsoft OAuth).'}
						</li>
						<li>
							{status?.mailFunction
								? 'PHP mail() is available for the local fallback option.'
								: 'PHP mail() is not available — local mail fallback cannot be used.'}
						</li>
					</ul>
				</div>
			</Card>
		</Panel>
	)
}

OverviewTab.propTypes = {
	status: PropTypes.object,
}

export { OverviewTab }
