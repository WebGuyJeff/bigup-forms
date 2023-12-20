const Honeypot = () => {
	return (
		<input
			style={{ position: 'absolute', height: 0, overflow: 'hidden', opacity: 0 }}
			className='bigup__form_input saveTheBees'
			name='required_field'
			type='text'
			autocomplete='off'
		/>
	)
}

export { Honeypot }