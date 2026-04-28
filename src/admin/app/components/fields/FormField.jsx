import PropTypes from 'prop-types'

/**
 * Shared wrapper for all form inputs
 */
const FormField = ({
	label,
	children,
	description,
	classes = '',
	invalid = false,
	layout = 'default', // 'default' | 'toggle' | 'select'
	fieldKey,
}) => {

	const layoutModes = {
		default: 'field-singleline',
		toggle: 'field-toggle',
		select: 'field-select',
	}
	
	const className = [
		'field',
		layoutModes[ layout ],
		classes,
		invalid && 'bf-has-error',
	].filter(Boolean).join(' ')

	return (
		<div className={className}>
			{ layout === 'toggle' && (children) }
			<label
				htmlFor={fieldKey ? `${fieldKey}-id` : undefined}
				id={fieldKey ? `${fieldKey}-aria` : undefined}
			>
				{label}
			</label>
			{ layout !== 'toggle' && (children) }
			{description && (
				<p className="field__description">{description}</p>
			)}
		</div>
	)
}

FormField.propTypes = {
	label: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
	description: PropTypes.string,
	classes: PropTypes.string,
	invalid: PropTypes.bool,
	layout: PropTypes.oneOf([ 'default', 'toggle', 'select' ]),
	fieldKey: PropTypes.string.isRequired,
}

export { FormField }
