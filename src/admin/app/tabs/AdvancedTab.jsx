import PropTypes from 'prop-types'
import { Panel, Card } from '../components/layout'
import { ToggleInput } from '../components/fields'
import { useSettingBinder } from '../../hooks'

const AdvancedTab = ( {
	settingsState,
	updateSetting,
	debouncedUpdateSetting,
	flushUpdateSetting,
	invalidField,
	status,
} ) => {
	const bindSetting = useSettingBinder( {
		settingsState,
		updateSetting,
		debouncedUpdateSetting,
		flushUpdateSetting,
		invalidField,
	} )

	const mailOk = !! status?.mailFunction

	return (
		<Panel>
			<Card>
				<h2>Local mail fallback</h2>
				<p className="bf-tabIntro">
					{mailOk
						? 'The PHP mail() function is available on this server.'
						: 'mail() is not available — local mail fallback cannot be used.'}
				</p>

				<ToggleInput
					{ ...bindSetting( 'use_local_mail_server', { type: 'toggle' } ) }
					label="Try local mail() when SMTP is unavailable"
					fieldKey="use_local_mail_server"
					disabled={ ! mailOk }
				/>
			</Card>

			<Card>
				<h2>Developer</h2>
				<ToggleInput
					{ ...bindSetting( 'debug', { type: 'toggle' } ) }
					label="Enable debug logging for the plugin"
					fieldKey="debug"
				/>
			</Card>
		</Panel>
	)
}

AdvancedTab.propTypes = {
	settingsState: PropTypes.object.isRequired,
	updateSetting: PropTypes.func.isRequired,
	debouncedUpdateSetting: PropTypes.func.isRequired,
	flushUpdateSetting: PropTypes.func.isRequired,
	invalidField: PropTypes.string.isRequired,
	status: PropTypes.object,
}

export { AdvancedTab }
