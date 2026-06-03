const operationSelect = document.getElementById('operation');
const firstNumberInput = document.getElementById('first-number');
const secondNumberInput = document.getElementById('second-number');
const calculateButton = document.getElementById('calculate-btn');
const clearButton = document.getElementById('clear-btn');
const resultOutput = document.getElementById('result');
const errorOutput = document.getElementById('error-message');

function validateInput(value) {
  const trimmedValue = String(value).trim();

  if (trimmedValue === '') {
    return { valid: false, message: 'Please enter both numbers.' };
  }

  const number = Number(trimmedValue);

  if (Number.isNaN(number)) {
    return { valid: false, message: 'Please enter valid numeric values.' };
  }

  return { valid: true, value: number };
}

function validateInputs(firstValue, secondValue, operation) {
  const firstValidation = validateInput(firstValue);
  if (!firstValidation.valid) {
    return firstValidation;
  }

  const secondValidation = validateInput(secondValue);
  if (!secondValidation.valid) {
    return secondValidation;
  }

  if (operation === 'divide' && secondValidation.value === 0) {
    return { valid: false, message: 'Division by zero is not allowed.' };
  }

  return {
    valid: true,
    firstNumber: firstValidation.value,
    secondNumber: secondValidation.value,
  };
}

function calculate(firstNumber, secondNumber, operation) {
  switch (operation) {
    case 'add':
      return firstNumber + secondNumber;
    case 'subtract':
      return firstNumber - secondNumber;
    case 'multiply':
      return firstNumber * secondNumber;
    case 'divide':
      return firstNumber / secondNumber;
    default:
      throw new Error('Unsupported operation.');
  }
}

function displayResult(value) {
  resultOutput.textContent = `Result: ${value}`;
  errorOutput.textContent = '';
}

function displayError(message) {
  errorOutput.textContent = message;
  resultOutput.textContent = '';
}

function clearCalculator() {
  firstNumberInput.value = '';
  secondNumberInput.value = '';
  operationSelect.value = 'add';
  resultOutput.textContent = '';
  errorOutput.textContent = '';
}

function handleCalculation() {
  const validation = validateInputs(
    firstNumberInput.value,
    secondNumberInput.value,
    operationSelect.value,
  );

  if (!validation.valid) {
    displayError(validation.message);
    return;
  }

  try {
    const result = calculate(
      validation.firstNumber,
      validation.secondNumber,
      operationSelect.value,
    );
    displayResult(result);
  } catch (error) {
    displayError(error.message);
  }
}

if (calculateButton) {
  calculateButton.addEventListener('click', handleCalculation);
}

if (clearButton) {
  clearButton.addEventListener('click', clearCalculator);
}
