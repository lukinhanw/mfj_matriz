export const customSelectStyles = {
	control: (base, state) => ({
		...base,
		backgroundColor: 'var(--bg-input)',
		borderColor: 'var(--border-input)',
		color: 'var(--text-primary)',
		fontSize: '14px',
		boxShadow: state.isFocused ? '0 0 0 1px var(--border-input)' : 'none',
		'&:hover': {
			borderColor: 'var(--border-input-hover)'
		}
	}),
	menu: (base) => ({
		...base,
		backgroundColor: 'var(--bg-input)',
		zIndex: 100,
		fontSize: '14px',
		border: '1px solid var(--border-input)'
	}),
	option: (base, { isFocused, isSelected }) => ({
		...base,
		backgroundColor: isSelected
			? 'var(--orange-600)'
			: isFocused
				? 'var(--bg-hover)'
				: 'var(--bg-input)',
		color: isSelected
			? 'var(--text-primary-100)'
			: 'var(--text-primary)',
		':active': {
			backgroundColor: 'var(--orange-600)',
			color: 'var(--text-primary-100)'
		},
		cursor: 'pointer'
	}),
	multiValue: (base) => ({
		...base,
		backgroundColor: 'var(--orange-600)',
	}),
	multiValueLabel: (base) => ({
		...base,
		color: 'var(--orange-100)',
		fontSize: '14px'
	}),
	multiValueRemove: (base) => ({
		...base,
		color: 'var(--orange-100)',
		':hover': {
			backgroundColor: 'var(--orange-700)',
			color: 'var(--orange-100)',
		}
	}),
	placeholder: (base) => ({
		...base,
		color: 'var(--text-primary-400)',
		fontSize: '14px'
	}),
	singleValue: (base) => ({
		...base,
		color: 'var(--text-primary)',
		fontSize: '14px'
	}),
	input: (base) => ({
		...base,
		color: 'var(--text-primary)',
		fontSize: '14px'
	})
}