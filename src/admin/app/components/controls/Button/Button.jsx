import PropTypes from 'prop-types'
import styles from './Button.module.scss'

/**
 * Button.
 */
const Button = ( {
	label,
	type = 'button',
	variant = 'secondary',
	disabled,
	onClick = () => {},
	id,
	className: extraClassName,
} ) => {

	const variations = {
		primary: styles.primary,
		secondary: styles.secondary,
	}

	const className = [
		styles.button,
		variations[ variant ],
		extraClassName,
	].filter( Boolean ).join( ' ' )

	return (
		<button
			type={type}
			id={id}
			className={className}
			disabled={disabled}
			onClick={onClick}
		>
			{ label }
		</button>
	)
}

Button.propTypes = {
	label: PropTypes.string.isRequired,
	type: PropTypes.string,
	variant: PropTypes.string,
	disabled: PropTypes.bool,
	onClick: PropTypes.func,
	id: PropTypes.string,
	className: PropTypes.string,
}

export { Button }
