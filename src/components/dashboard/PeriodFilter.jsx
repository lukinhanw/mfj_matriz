function PeriodFilter({ value, onChange }) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="mt-2 sm:mt-0 block w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 sm:text-sm transition-colors"
		>
			<option value="7d">Últimos 7 dias</option>
			<option value="30d">Últimos 30 dias</option>
			<option value="90d">Últimos 3 meses</option>
		</select>
	)
}

export default PeriodFilter