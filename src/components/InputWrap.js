const InputWrap = ( { children, props } ) => {

	return (
		<div className={ 'bigupForms__inputWrap' }>
			{ children }
			<span className='bigupForms__flag bigupForms__flag-hover'></span>
			<span className='bigupForms__flag bigupForms__flag-focus'></span>
		</div>
	)
}

export { InputWrap }
