/**
 * Grab vars added by wp_add_inline_script() for the admin SPA.
 */
/* global bigupFormsAdminInlinedScript */
const getAdminInlinedVars = () => {
	if ( typeof bigupFormsAdminInlinedScript === 'undefined' ) {
		return false
	}

	return { ...bigupFormsAdminInlinedScript }
}

const useAdminInlinedVars = getAdminInlinedVars()

export { useAdminInlinedVars }
