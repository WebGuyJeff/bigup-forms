import PropTypes from 'prop-types'
import styles from './Footer.module.scss'

const Footer = ( {
	pluginName,
	PluginURI,
	PluginVersion,
	AuthorName,
	AuthorURI,
} ) => {

	return (
		<div className={styles.footer}>
			<div className={styles.inner}>
				<div className={styles.left}>
					<strong>{pluginName}</strong>{' '}
					{AuthorName && AuthorURI && (
						<span className={styles.meta}>
							by{' '}
							<a
								href={AuthorURI}
								target="_blank"
								rel="noopener noreferrer"
							>
								{AuthorName}
							</a>
						</span>
					)}
					{PluginVersion && (
						<>
							<br />
							<span className={styles.meta}>v{PluginVersion}</span>
						</>
					)}
				</div>

				<div className={styles.right}>

					{PluginURI && (
						<a
							href={PluginURI}
							target="_blank"
							rel="noopener noreferrer"
						>
							Plugin page
						</a>
					)}
				</div>
			</div>
		</div>
	)
}

Footer.propTypes = {
	pluginName: PropTypes.string.isRequired,
	PluginURI: PropTypes.string,
	PluginVersion: PropTypes.string,
	AuthorName: PropTypes.string,
	AuthorURI: PropTypes.string,
}

export { Footer }
