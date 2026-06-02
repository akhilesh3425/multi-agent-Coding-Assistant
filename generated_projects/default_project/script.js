// script.js

// Calculator class to handle calculator operations
class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.currentInput = '';
        this.result = 0;
        this.operation = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const buttons = document.querySelectorAll('[id^="btn-"]');
        buttons.forEach(button => {
            button.addEventListener('click', (event) => this.handleButtonClick(event));
        });
    }

    handleButtonClick(event) {
        const buttonId = event.target.id;
        if (buttonId.startsWith('btn-')) {
            const btnValue = buttonId.replace('btn-', '');
            if (/\d/.test(btnValue)) {
                this.appendNumber(btnValue);
            } else if (btnValue === 'add' || btnValue === 'subtract' || btnValue === 'multiply' || btnValue === 'divide') {
                this.setOperation(btnValue);
            } else if (btnValue === 'clear') {
                this.clearInput();
            } else if (btnValue === 'equals') {
                this.calculate();
            }
        }
    }

    validateInput(input) {
        if (input === '' || /[^0-9+\-*/]/.test(input)) {
            throw new Error('Invalid input. Please enter a valid number.');
        }
    }

    appendNumber(number) {
        this.currentInput += number;
        this.updateDisplay();
    }

    setOperation(operation) {
        try {
            this.validateInput(this.currentInput);
            this.result = parseFloat(this.currentInput);
            this.operation = operation;
            this.currentInput = '';
        } catch (error) {
            this.display.innerText = error.message;
        }
    }

    calculate() {
        try {
            this.validateInput(this.currentInput);
            const secondOperand = parseFloat(this.currentInput);
            switch (this.operation) {
                case 'add':
                    this.result += secondOperand;
                    break;
                case 'subtract':
                    this.result -= secondOperand;
                    break;
                case 'multiply':
                    this.result *= secondOperand;
                    break;
                case 'divide':
                    if (secondOperand === 0) {
                        throw new Error('Division by zero is not allowed.');
                    }
                    this.result /= secondOperand;
                    break;
            }
            this.currentInput = '';
            this.operation = '';
            this.updateDisplay();
        } catch (error) {
            this.display.innerText = error.message;
        }
    }

    clearInput() {
        this.currentInput = '';
        this.result = 0;
        this.operation = '';
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.innerText = this.currentInput || this.result;
    }
}

const calculator = new Calculator();