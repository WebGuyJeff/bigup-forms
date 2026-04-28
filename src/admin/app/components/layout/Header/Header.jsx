import PropTypes from 'prop-types'
import styles from './Header.module.scss'

const Header = ( {
	pluginName,
	pluginDescription,
	status,
	showStatus,
} ) => {
	const settingsOk = status.settingsOK ? '✅ Settings complete' : '❌ Settings incomplete'
	const ms = status.msConnected ? '✅ Microsoft connected' : '⚠️ Microsoft not connected'
	const mailFn = status.mailFunction ? '✅ mail() available' : '❌ mail() not available'

	return (
		<header className={styles.header}>

			<div className={styles.title}>
				<span
					className="dashicons-bigup-logo"
					style={{ fontSize: '2em', marginRight: '0.2em' }}
				/>

				<div>
					<h1>{pluginName}</h1>
					{pluginDescription && (
						<p>{pluginDescription}</p>
					)}
				</div>
			</div>

			<hr className={styles.divider} />

			{showStatus && (
				<div className={styles.status}>
					<span>{settingsOk}</span>
					<span>{ms}</span>
					<span>{mailFn}</span>
				</div>
			)}
		</header>
	)
}

Header.propTypes = {
	pluginName: PropTypes.string.isRequired,
	pluginDescription: PropTypes.string,
	status: PropTypes.shape( {
		settingsOK: PropTypes.bool,
		msConnected: PropTypes.bool,
		mailFunction: PropTypes.bool,
	} ).isRequired,
	showStatus: PropTypes.bool,
}

export { Header }
