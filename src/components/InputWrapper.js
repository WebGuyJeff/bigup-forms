const InputWrapper = ( { children, props } ) => {

	return (
		<div { ...props }>
			{ children }
			<span className='bigup__form_flag bigup__form_flag-hover'></span>
			<span className='bigup__form_flag bigup__form_flag-focus'></span>
		</div>
	)
}

export { InputWrapper }