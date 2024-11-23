export const customSelectStyles = {
	control: (base, state) => ({
		...base,
		backgroundColor: 'var(--bg-input)',
		borderColor: 'var(--border-input)',
		color: 'var(--text-orange)',
		fontSize: '14px', // fonte base para o controle
		boxShadow: state.isFocused ? 'none' : base.boxShadow,
		'&:hover': {
			borderColor: 'var(--border-input-hover)'
		}
	}),
	menu: (base) => ({
		...base,
		backgroundColor: 'var(--bg-input)',
		zIndex: 100,
		fontSize: '14px' // fonte para o menu dropdown
	}),
    option: (base, { isFocused, isSelected }) => ({
        ...base,
        backgroundColor: isSelected
            ? 'var(--orange-600)'
            : isFocused
                ? 'var(--bg-hover)'
                : 'var(--bg-input)',
        color: isSelected
            ? 'var(--orange-100)'
            : 'var(--orange)',
        '&:active': {
            backgroundColor: 'var(--orange-200)',
            color: 'var(--orange-600)'
        },
        fontSize: '14px' // fonte para as opções
    }),
	multiValue: (base) => ({
		...base,
		backgroundColor: 'var(--orange-100)',
		fontSize: '14px' // fonte para valores múltiplos
	}),
	multiValueLabel: (base) => ({
		...base,
		color: 'var(--orange-700)',
	}),
	multiValueRemove: (base) => ({
		...base,
		color: 'var(--orange-700)',
		'&:hover': {
			backgroundColor: 'var(--orange-200)',
			color: 'var(--orange-900)',
		},
	}),
	singleValue: (base) => ({
		...base,
		color: 'var(--text-orange)',
	}),
	input: (base) => ({
		...base,
		color: 'var(--text-orange)',
	}),
	placeholder: (base) => ({
		...base,
		color: 'var(--text-orange)',
	}),
	menuPortal: (base) => ({
		...base,
		zIndex: 9999
	}),
}