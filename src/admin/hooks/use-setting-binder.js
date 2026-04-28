import { useCallback } from '@wordpress/element'

const useSettingBinder = ( {
	settingsState,
	updateSetting,
	debouncedUpdateSetting,
	flushUpdateSetting,
	invalidField,
} ) => {

	const bindSetting = useCallback(
		( fieldKey, { mode = 'debounced', type = 'text' } = {} ) => {
			const isInstant = mode === 'instant'

			if ( type === 'toggle' ) {
				return {
					fieldKey,
					checked: !! settingsState[ fieldKey ],
					onChange: ( event ) =>
						updateSetting(
							fieldKey,
							event.target.checked
						),
					invalid: invalidField === fieldKey,
				}
			}

			return {
				fieldKey,
				value: settingsState[ fieldKey ] ?? '',
				onChange: ( event ) =>
					isInstant
						? updateSetting( fieldKey, event.target.value )
						: debouncedUpdateSetting(
							fieldKey,
							event.target.value
						),
				onBlur: isInstant
					? undefined
					: ( event ) =>
						flushUpdateSetting(
							fieldKey,
							event.target.value
						),
				invalid: invalidField === fieldKey,
			}
		},
		[
			settingsState,
			updateSetting,
			debouncedUpdateSetting,
			flushUpdateSetting,
			invalidField,
		]
	)

	return bindSetting
}

export { useSettingBinder }
