document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const resultElement = document.getElementById('result');
    const cardCountElement = document.getElementById('cardCount');
    const cardTypeElement = document.getElementById('cardType');
    const formatElement = document.getElementById('format');
    const languageSelect = document.getElementById('languageSelect');
    
    // Current language
    let currentLanguage = 'en';
    
    // Card number prefixes for different card types
    const cardPrefixes = {
        visa: ['4'],
        mastercard: ['51', '52', '53', '54', '55'],
        amex: ['34', '37'],
        jcb: ['35']
    };
    
    // Card number lengths for different card types
    const cardLengths = {
        visa: 16,
        mastercard: 16,
        amex: 15,
        jcb: 16
    };

    // Initialize language
    initLanguage();
    
    // Language selector change event
    languageSelect.addEventListener('change', function() {
        currentLanguage = this.value;
        updateLanguage();
        
        // Save language preference to localStorage
        localStorage.setItem('preferredLanguage', currentLanguage);
    });
    
    // Generate button click event
    generateBtn.addEventListener('click', function() {
        const count = parseInt(cardCountElement.value);
        const cardType = cardTypeElement.value;
        const format = formatElement.value;
        
        const cardNumbers = generateCardNumbers(count, cardType);
        displayResults(cardNumbers, format);
    });
    
    // Copy button click event
    copyBtn.addEventListener('click', function() {
        const text = resultElement.textContent;
        navigator.clipboard.writeText(text).then(function() {
            // Show copy success feedback
            const originalText = copyBtn.innerHTML;
            const successText = currentLanguage === 'en' ? '<i class="fas fa-check"></i> Copied' : '<i class="fas fa-check"></i> 已复制';
            copyBtn.innerHTML = successText;
            copyBtn.style.backgroundColor = 'var(--success-color)';
            copyBtn.style.color = 'white';
            
            setTimeout(function() {
                copyBtn.innerHTML = originalText;
                copyBtn.style.backgroundColor = '';
                copyBtn.style.color = '';
            }, 2000);
        });
    });

    // Initialize language settings
    function initLanguage() {
        // Check if user has a saved language preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            currentLanguage = savedLanguage;
            languageSelect.value = currentLanguage;
        } else {
            // Try to detect browser language
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.startsWith('zh')) {
                currentLanguage = 'zh';
                languageSelect.value = 'zh';
            }
        }
        
        // Apply initial language
        updateLanguage();
    }
    
    // Update all text elements with the selected language
    function updateLanguage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (languages[currentLanguage] && languages[currentLanguage][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = languages[currentLanguage][key];
                } else if (element.tagName === 'OPTION') {
                    element.textContent = languages[currentLanguage][key];
                } else {
                    element.textContent = languages[currentLanguage][key];
                }
            }
        });
        
        // Update document title
        document.title = languages[currentLanguage]['title'];
        
        // Update card type options manually as they might need special handling
        updateCardTypeOptions();
    }
    
    // Update the card type dropdown options with translated text
    function updateCardTypeOptions() {
        const options = cardTypeElement.options;
        for (let i = 0; i < options.length; i++) {
            const key = options[i].getAttribute('data-i18n');
            if (key && languages[currentLanguage] && languages[currentLanguage][key]) {
                options[i].textContent = languages[currentLanguage][key];
            }
        }
    }
    
    // Generate credit card numbers
    function generateCardNumbers(count, type) {
        const results = [];
        
        for (let i = 0; i < count; i++) {
            let cardNumber;
            
            if (type === 'random') {
                // Select a random card type
                const types = Object.keys(cardPrefixes);
                const randomType = types[Math.floor(Math.random() * types.length)];
                cardNumber = generateSingleCardNumber(randomType);
            } else {
                cardNumber = generateSingleCardNumber(type);
            }
            
            results.push({
                number: cardNumber,
                type: getCardTypeFromNumber(cardNumber),
                cvv: generateCVV(cardNumber),
                expiry: generateExpiry()
            });
        }
        
        return results;
    }
    
    // Generate a single credit card number
    function generateSingleCardNumber(type) {
        // Get prefix and length for the card type
        const prefixes = cardPrefixes[type] || cardPrefixes.visa;
        const length = cardLengths[type] || 16;
        
        // Select a random prefix
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        // Generate the card number without the last digit
        let cardNumber = prefix;
        const digitsNeeded = length - prefix.length - 1;
        
        for (let i = 0; i < digitsNeeded; i++) {
            cardNumber += Math.floor(Math.random() * 10);
        }
        
        // Calculate the check digit using Luhn algorithm
        const checkDigit = calculateLuhnCheckDigit(cardNumber);
        
        // Add the check digit to complete the card number
        return cardNumber + checkDigit;
    }
    
    // Calculate the check digit using Luhn algorithm
    function calculateLuhnCheckDigit(partialCardNumber) {
        let sum = 0;
        let alternate = false;
        
        for (let i = partialCardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(partialCardNumber.charAt(i));
            
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            alternate = !alternate;
        }
        
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit.toString();
    }
    
    // Generate CVV
    function generateCVV(cardNumber) {
        const cardType = getCardTypeFromNumber(cardNumber);
        const cvvLength = cardType === 'amex' ? 4 : 3;
        let cvv = '';
        
        for (let i = 0; i < cvvLength; i++) {
            cvv += Math.floor(Math.random() * 10);
        }
        
        return cvv;
    }
    
    // Generate expiry date (MM/YY)
    function generateExpiry() {
        const currentYear = new Date().getFullYear();
        const year = currentYear + Math.floor(Math.random() * 5); // Expiry within next 5 years
        const month = Math.floor(Math.random() * 12) + 1; // 1-12
        
        return {
            month: month.toString().padStart(2, '0'),
            year: (year % 100).toString().padStart(2, '0')
        };
    }
    
    // Determine card type from card number
    function getCardTypeFromNumber(cardNumber) {
        if (cardNumber.startsWith('4')) {
            return 'visa';
        } else if (/^5[1-5]/.test(cardNumber)) {
            return 'mastercard';
        } else if (/^3[47]/.test(cardNumber)) {
            return 'amex';
        } else if (cardNumber.startsWith('35')) {
            return 'jcb';
        } else {
            return 'unknown';
        }
    }
    
    // Format card number with spaces
    function formatCardNumber(cardNumber) {
        const cardType = getCardTypeFromNumber(cardNumber);
        
        if (cardType === 'amex') {
            return cardNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
        } else {
            return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
        }
    }
    
    // Display results in the selected format
    function displayResults(cardNumbers, format) {
        let output = '';
        
        switch (format) {
            case 'json':
                output = JSON.stringify(cardNumbers, null, 2);
                break;
                
            case 'csv':
                const headers = {
                    en: 'Card Number,Card Type,CVV,Expiry\n',
                    zh: '卡号,卡类型,CVV,有效期\n'
                };
                output = headers[currentLanguage] || headers.en;
                
                cardNumbers.forEach(card => {
                    output += `${card.number},${card.type},${card.cvv},${card.expiry.month}/${card.expiry.year}\n`;
                });
                break;
                
            default: // text format
                const cardLabel = currentLanguage === 'zh' ? '卡片' : 'Card';
                const typeLabel = currentLanguage === 'zh' ? '类型' : 'Type';
                const expiryLabel = currentLanguage === 'zh' ? '有效期' : 'Expiry';
                
                cardNumbers.forEach((card, index) => {
                    output += `${cardLabel} ${index + 1}: ${formatCardNumber(card.number)}\n`;
                    output += `${typeLabel}: ${getCardTypeTranslated(card.type)}\n`;
                    output += `CVV: ${card.cvv}\n`;
                    output += `${expiryLabel}: ${card.expiry.month}/${card.expiry.year}\n\n`;
                });
                break;
        }
        
        resultElement.textContent = output;
    }
    
    // Get translated name for card type
    function getCardTypeTranslated(type) {
        if (currentLanguage === 'zh') {
            const types = {
                visa: '维萨卡',
                mastercard: '万事达卡',
                amex: '美国运通',
                jcb: 'JCB卡',
                unknown: '未知卡类型'
            };
            return types[type] || types.unknown;
        } else {
            const types = {
                visa: 'Visa Card',
                mastercard: 'MasterCard',
                amex: 'American Express',
                jcb: 'JCB Card',
                unknown: 'Unknown Card Type'
            };
            return types[type] || types.unknown;
        }
    }
    
    // Generate initial results
    generateBtn.click();
}); 