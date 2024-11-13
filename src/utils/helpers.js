/**
 * Formats a string of numbers into a Brazilian mobile phone format
 * @param {string} phone - The phone number to format
 * @returns {string} - Formatted phone number
 */

// Função para formatar numero de telefone
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const numbers = phone.replace(/\D/g, '');
    
    // Check if the number has the correct length
    if (numbers.length !== 11) return phone;
    
    // Format the number as (XX) XXXXX-XXXX
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

// Função para formatar numero de CPF ou CNPJ
export const formatCpfCnpj = (value) => {
    if (!value) return '';
    
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};