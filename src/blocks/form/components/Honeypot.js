const Honeypot = () => {
	return (
		<input
			style={{ position: 'absolute', left: '-9999px' }}
			name='required_field'
			type='text'
			autoComplete='off'
		/>
	)
}

export { Honeypot }
