/**
 * Handle form updates on provider selection.
 *
 * @param {object} form The target form.
 * @param {bool} shouldLock Whether the form should be locked.
 */
function providerSelection() {
	const setupSelect = () => {
		const select = document.getElementById('smtpProvider')
		const oauthToggle = document.getElementById('oauthToggle')
		if (!select) return

		const setSelect = (value) => {
			oauthToggle.checked = value !== 'generic' ? true : false
			const msForm = document.getElementById('microsoftAccountForm')
			if (msForm) {
				msForm.style.display = value === 'microsoft' ? 'block' : 'none'
			}
		}

		// Set initial state.
		setSelect(select.value)

		select.addEventListener('change', () => {
			setSelect(select.value)
		})
	}

	// Fire on 'doc ready'.
	const docReadyInterval = setInterval(() => {
		if (document.readyState === 'complete') {
			clearInterval(docReadyInterval)
			setupSelect()
		}
	}, 100)
}

export { providerSelection }
