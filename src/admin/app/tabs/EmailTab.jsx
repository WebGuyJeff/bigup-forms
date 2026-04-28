import PropTypes from 'prop-types'
import { useMemo } from '@wordpress/element'
import { Panel, Card } from '../components/layout'
import { TextInput, SelectInput, ToggleInput } from '../components/fields'
import { ButtonRow, Button } from '../components/controls'
import { useSettingBinder } from '../../hooks'

const TRANSPORT_SMTP = 'smtp'
const TRANSPORT_MICROSOFT = 'microsoft_oauth'

const EmailTab = ( {
	settingsState,
	updateSetting,
	debouncedUpdateSetting,
	flushUpdateSetting,
	invalidField,
	status,
	runTest,
	smtpOutput,
	loadingAction,
	oauth,
	disconnectMicrosoft,
} ) => {
	const bindSetting = useSettingBinder( {
		settingsState,
		updateSetting,
		debouncedUpdateSetting,
		flushUpdateSetting,
		invalidField,
	} )

	const transport = settingsState.transport === TRANSPORT_MICROSOFT ? TRANSPORT_MICROSOFT : TRANSPORT_SMTP
	const isMicrosoft = transport === TRANSPORT_MICROSOFT
	const msConnected = !! status?.msConnected

	const enableTests = useMemo(
		() => !! status?.settingsOK,
		[ status ]
	)

	const portStr = settingsState.port !== undefined && settingsState.port !== null
		? String( settingsState.port )
		: '587'

	const postUrl = oauth?.connectPostUrl || ''
	const action = oauth?.connectAction || ''
	const nonceName = oauth?.connectNonceName || ''
	const nonce = oauth?.connectNonce || ''
	const azureUrl = oauth?.azurePortalUrl || '#'
	const redirectUri = oauth?.redirectUri || ''

	const encValue = settingsState.smtp_encryption ? String( settingsState.smtp_encryption ) : 'auto'

	return (
		<Panel layout="columns">
			<Card>
				<h2>Notification addresses</h2>
				<p className="bf-tabIntro">
					These apply regardless of how mail is delivered.
				</p>

				<TextInput
					{ ...bindSetting( 'from_email' ) }
					label="Sent-from email address"
					type="email"
					classes="field-medium"
				/>

				<TextInput
					{ ...bindSetting( 'to_email' ) }
					label="Email to send notifications to"
					type="email"
					classes="field-medium"
				/>
			</Card>

			<Card>
				<h2>Email delivery method</h2>

				<fieldset className="bf-fieldset">
					<legend className="bf-fieldsetLegend">Transport</legend>
					<div className="bf-radioRow">
						<label className="bf-radioLabel">
							<input
								type="radio"
								name="bigupFormsTransport"
								checked={ ! isMicrosoft }
								onChange={ () => updateSetting( 'transport', TRANSPORT_SMTP ) }
							/>
							<span>SMTP (username + password)</span>
						</label>
					</div>
					<div className="bf-radioRow">
						<label className="bf-radioLabel">
							<input
								type="radio"
								name="bigupFormsTransport"
								checked={ isMicrosoft }
								onChange={ () => updateSetting( 'transport', TRANSPORT_MICROSOFT ) }
							/>
							<span>Microsoft (OAuth)</span>
						</label>
					</div>
				</fieldset>

				{ ! isMicrosoft && (
					<>
						<h3 className="bf-subheading">SMTP server</h3>
						<TextInput
							{ ...bindSetting( 'host' ) }
							label="SMTP host"
							classes="field-medium"
						/>

						<SelectInput
							{ ...bindSetting( 'port', { mode: 'instant' } ) }
							label="Port"
							fieldKey="port"
							value={ portStr }
							options={ {
								'25': '25',
								'465': '465',
								'587': '587',
								'2525': '2525',
							} }
						/>

						<SelectInput
							{ ...bindSetting( 'smtp_encryption', { mode: 'instant' } ) }
							label="Encryption"
							fieldKey="smtp_encryption"
							value={ encValue }
							options={ {
								auto: 'Auto (probe server)',
								none: 'None',
								starttls: 'STARTTLS',
								ssl: 'SSL / SMTPS',
							} }
						/>

						<TextInput
							{ ...bindSetting( 'username' ) }
							label="SMTP username"
							classes="field-medium"
						/>

						<TextInput
							{ ...bindSetting( 'password' ) }
							label="SMTP password"
							type="password"
							description="Leave blank to keep the saved password. A stored password is never shown after save."
							classes="field-medium"
						/>

						<ToggleInput
							{ ...bindSetting( 'auth', { type: 'toggle' } ) }
							label="Server requires authentication (AUTH)"
							fieldKey="auth"
						/>
					</>
				) }

				{ isMicrosoft && (
					<>
						<h3 className="bf-subheading">Microsoft account</h3>
						<p>
							<strong>Status:</strong>{' '}
							{ msConnected ? 'Connected' : 'Not connected' }
						</p>
						{ msConnected && settingsState.username && (
							<p>
								<strong>Microsoft account:</strong>{' '}
								<code>{ String( settingsState.username ) }</code>
							</p>
						) }

						<form method="post" action={ postUrl } className="bf-inlineForm">
							<input type="hidden" name="action" value={ action } />
							<input type="hidden" name={ nonceName } value={ nonce } />
							<Button
								type="submit"
								label="Connect Microsoft account"
								variant="primary"
							/>
						</form>
						{ msConnected && (
							<ButtonRow>
								<Button
									type="button"
									label={ loadingAction === 'disconnect_ms' ? 'Disconnecting…' : 'Disconnect' }
									variant="secondary"
									disabled={ loadingAction === 'disconnect_ms' }
									onClick={ () => disconnectMicrosoft() }
								/>
							</ButtonRow>
						) }
						<p className="bf-tabHint">
							Register an app in{' '}
							<a href={ azureUrl } target="_blank" rel="noopener noreferrer">Azure App registrations</a>
							. Redirect URI (Web): <code>{ redirectUri }</code>
						</p>

						<h3 className="bf-subheading">Connection details (auto-configured)</h3>
						<dl className="bf-readonlyDl">
							<dt>Host</dt>
							<dd>smtp-mail.outlook.com</dd>
							<dt>Port</dt>
							<dd>587</dd>
							<dt>Encryption</dt>
							<dd>STARTTLS</dd>
							<dt>Auth</dt>
							<dd>OAuth2 (XOAUTH2)</dd>
						</dl>

						<details className="bf-detailsAdvanced">
							<summary>Advanced (Azure app credentials)</summary>
							<TextInput
								{ ...bindSetting( 'oauth_client_id' ) }
								label="Application (client) ID"
								classes="field-large"
							/>
							<TextInput
								{ ...bindSetting( 'oauth_client_secret' ) }
								label="Client secret"
								type="password"
								description="Leave blank to keep the saved secret. Stored secrets are never shown after save."
								classes="field-large"
							/>
						</details>
					</>
				) }

				{ ! isMicrosoft && (
					<details className="bf-detailsAdvanced">
						<summary>Advanced (Azure app credentials)</summary>
						<p className="bf-tabHint">
							Only needed if you use Microsoft OAuth as the delivery method.
						</p>
						<TextInput
							{ ...bindSetting( 'oauth_client_id' ) }
							label="Application (client) ID"
							classes="field-large"
						/>
						<TextInput
							{ ...bindSetting( 'oauth_client_secret' ) }
							label="Client secret"
							type="password"
							description="Leave blank to keep the saved secret."
							classes="field-large"
						/>
					</details>
				) }
			</Card>

			<Card>
				<h2>Test actions</h2>
				<p className="bf-tabIntro">
					Save settings first. The server must pass the readiness check in the header before testing.
					{ isMicrosoft && ' Microsoft uses XOAUTH2 (no SMTP password).' }
				</p>

				<ButtonRow>
					<Button
						id="bigupFormsSmtpConnectionTest"
						label={ loadingAction === 'test_smtp' ? 'Testing…' : 'Test connection' }
						variant="secondary"
						disabled={ ! enableTests || loadingAction === 'test_smtp' }
						onClick={ () => runTest( 'smtp' ) }
					/>
					<Button
						id="bigupFormsSmtpSendTestEmail"
						label={ loadingAction === 'test_email' ? 'Sending test email…' : 'Send test email' }
						variant="secondary"
						disabled={ ! enableTests || loadingAction === 'test_email' }
						onClick={ () => runTest( 'email' ) }
					/>
				</ButtonRow>

				{ smtpOutput && (
					<div className="bf_logOutput">
						<pre
							className={ `bf_smtpLog${ smtpOutput.status ? ` bf_smtpLog__${ smtpOutput.status }` : '' }` }
						>
							{ smtpOutput.messages.join( '\n' ) }
						</pre>
					</div>
				) }
			</Card>
		</Panel>
	)
}

EmailTab.propTypes = {
	settingsState: PropTypes.object.isRequired,
	updateSetting: PropTypes.func.isRequired,
	debouncedUpdateSetting: PropTypes.func.isRequired,
	flushUpdateSetting: PropTypes.func.isRequired,
	invalidField: PropTypes.string.isRequired,
	status: PropTypes.object,
	runTest: PropTypes.func.isRequired,
	smtpOutput: PropTypes.object,
	loadingAction: PropTypes.string.isRequired,
	oauth: PropTypes.object,
	disconnectMicrosoft: PropTypes.func.isRequired,
}

export { EmailTab }
