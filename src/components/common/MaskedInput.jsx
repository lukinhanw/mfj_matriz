import React, { forwardRef } from 'react'

const MaskedInput = forwardRef(({ mask, value = '', onChange, ...props }, ref) => {
  const handleChange = (e) => {
    let inputValue = e.target.value
    let maskedValue = inputValue

    if (mask === 'cpf') {
      // Remove non-digits
      inputValue = inputValue.replace(/\D/g, '')

      // Limit to 11 digits
      inputValue = inputValue.slice(0, 11)

      // Apply CPF mask
      if (inputValue.length > 0) {
        maskedValue = inputValue.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2}).*/, (_, p1, p2, p3, p4) => {
          let result = ''
          if (p1) result += p1
          if (p2) result += `.${p2}`
          if (p3) result += `.${p3}`
          if (p4) result += `-${p4}`
          return result
        })
      }
    } else if (mask === 'phone') {
      // Remove non-digits
      inputValue = inputValue.replace(/\D/g, '')

      // Limit to 11 digits
      inputValue = inputValue.slice(0, 11)

      // Apply phone mask
      if (inputValue.length > 0) {
        if (inputValue.length <= 10) {
          // Format as (XX) XXXX-XXXX
          maskedValue = inputValue.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, p1, p2, p3) => {
            let result = p1 ? `(${p1}` : ''
            if (p2) result += `) ${p2}`
            if (p3) result += `-${p3}`
            return result
          })
        } else {
          // Format as (XX) XXXXX-XXXX
          maskedValue = inputValue.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_, p1, p2, p3) => {
            let result = p1 ? `(${p1}` : ''
            if (p2) result += `) ${p2}`
            if (p3) result += `-${p3}`
            return result
          })
        }
      }
    } else if (mask === 'cnpj') {
      // Remove non-digits
      inputValue = inputValue.replace(/\D/g, '')

      // Limit to 14 digits
      inputValue = inputValue.slice(0, 14)

      // Apply CNPJ mask
      if (inputValue.length > 0) {
        maskedValue = inputValue.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2}).*/, (_, p1, p2, p3, p4, p5) => {
          let result = p1
          if (p2) result += `.${p2}`
          if (p3) result += `.${p3}`
          if (p4) result += `/${p4}`
          if (p5) result += `-${p5}`
          return result
        })
      }
    }

    // Call original onChange with the masked value
    onChange({ target: { value: maskedValue } })
  }

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={handleChange}
      {...props}
    />
  )
})

MaskedInput.displayName = 'MaskedInput'

export default MaskedInput