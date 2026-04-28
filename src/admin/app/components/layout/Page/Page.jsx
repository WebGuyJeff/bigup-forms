import PropTypes from 'prop-types'
import styles from './Page.module.scss'

/**
 * Page layout — top-level container for the plugin admin SPA.
 */
const Page = ( { children } ) => (
	<div className={styles.page}>
		{children}
	</div>
)

Page.propTypes = {
	children: PropTypes.node.isRequired,
}

export { Page }
