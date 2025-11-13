class Calculator {
    constructor() {
        this.expression = '';
        this.result = '0';
        this.lastAnswer = 0;
        this.memory = 0;
        this.justCalculated = false;
        this.calcTimeout = null;

        // DOM elements
        this.expressionDisplay = document.getElementById('expression');
        this.resultDisplay = document.getElementById('result');

        // Initialize
        this.initializeButtons();
        this.initializeKeyboard();
        this.updateDisplay();

        // Load voices
        window.speechSynthesis.onvoiceschanged = () => { this.voicesLoaded = true; };
    }

    initializeButtons() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const value = button.dataset.value;
                this.handleAction(action, value);
            });
        });
    }

    initializeKeyboard() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            const key = e.key;

            if (/[0-9]/.test(key)) this.handleAction('number', key);
            else if (['+', '-'].includes(key)) this.handleAction('operator', key);
            else if (key === '*') this.handleAction('operator', '×');
            else if (key === '/') this.handleAction('operator', '÷');
            else if (key === 'Enter' || key === '=') this.handleAction('equals');
            else if (key === 'Backspace') this.handleBackspace();
            else if (['Escape', 'c', 'C'].includes(key)) this.handleAction('clear');
            else if (key === '.') this.handleAction('decimal');
            else if (['(', ')'].includes(key)) this.handleAction('parentheses');
            else if (key === '%') this.handleAction('percent');
            else if (key === '^') this.handleAction('power');
            else if (key === '!') this.handleAction('factorial');
        });
    }

    handleAction(action, value = null) {
        // Continue expression after equals
        if (this.justCalculated && action !== 'equals') {
            if (action === 'number' || action === 'operator')
                this.expression = this.result;
            this.justCalculated = false;
        }

        switch (action) {
            case 'number': this.appendNumber(value); this.playSound('number', parseInt(value)); break;
            case 'operator': this.appendOperator(value); this.playSound('operator', value); break;
            case 'decimal': this.appendDecimal(); break;
            case 'clear': this.clear(); break;
            case 'equals': this.calculate(); break;
            case 'parentheses': this.appendParentheses(); break;
            case 'percent': this.appendPercent(); break;
            case 'sqrt': this.appendSqrt(); break;
            case 'power': this.appendPower(); break;
            case 'factorial': this.appendFactorial(); break;
            case 'pi': this.appendPi(); break;
            case 'backspace': this.handleBackspace(); break;
        }

        this.updateDisplay();
        this.scheduleRealTimeCalculation();
    }

    appendNumber(num) { this.expression += num; }

    appendOperator(op) {
        if (this.expression === '' && op === '-') return this.expression = '-';
        const lastChar = this.expression.slice(-1);
        const operators = ['+', '-', '×', '÷', '^'];
        if (operators.includes(lastChar)) this.expression = this.expression.slice(0, -1) + op;
        else if (this.expression !== '') this.expression += op;
    }

    appendDecimal() {
        const parts = this.expression.split(/[\+\-\×\÷\(\)\^]/);
        const lastPart = parts[parts.length - 1];
        if (!lastPart.includes('.')) {
            if (lastPart === '' || /[\+\-\×\÷\(\)]/.test(this.expression.slice(-1))) {
                this.expression += '0.';
            } else {
                this.expression += '.';
            }
        }
    }

    appendParentheses() {
        const openCount = (this.expression.match(/\(/g) || []).length;
        const closeCount = (this.expression.match(/\)/g) || []).length;
        const lastChar = this.expression.slice(-1);
        if (openCount === closeCount) {
            if (lastChar === '' || /[\+\-\×\÷\(]/.test(lastChar)) this.expression += '(';
            else this.expression += '×(';
        } else {
            this.expression += ')';
        }
    }

    appendPercent() {
        if (this.expression !== '') this.expression += '%';
    }

    appendSqrt() {
        const lastChar = this.expression.slice(-1);
        if (lastChar === '' || /[\+\-\×\÷\(]/.test(lastChar)) this.expression += '√(';
        else this.expression += '×√(';
    }

    appendPower() {
        if (this.expression !== '' && !/[\+\-\×\÷\^\(]/.test(this.expression.slice(-1))) this.expression += '^';
    }

    appendFactorial() {
        if (this.expression !== '' && !/[\+\-\×\÷\^\(\.]/.test(this.expression.slice(-1))) this.expression += '!';
    }

    appendPi() {
        const lastChar = this.expression.slice(-1);
        if (lastChar === '' || /[\+\-\×\÷\(]/.test(lastChar)) this.expression += 'π';
        else this.expression += '×π';
    }

    handleBackspace() {
        if (this.justCalculated) {
            this.expression = '';
            this.result = '0';
            this.justCalculated = false;
        } else this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
        this.scheduleRealTimeCalculation();
    }

    clear() {
        this.expression = '';
        this.result = '0';
        this.justCalculated = false;
        this.playSound('memory', 'clear all');
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }

    safeEvaluate(expr) {
        try {
            expr = expr.replace(/×/g, '*')
                       .replace(/÷/g, '/')
                       .replace(/π/g, Math.PI.toString())
                       .replace(/(\d+\.?\d*)%/g, '($1/100)')
                       .replace(/(\d+\.?\d*)!/g, (m, n) => this.factorial(parseFloat(n)))
                       .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
                       .replace(/(\d+\.?\d*)\^(\d+\.?\d*)/g, 'Math.pow($1,$2)');

            if (!/^[0-9+\-*/()., Mathpowsqrt]+$/.test(expr.replace(/Math/g, '')))
                throw new Error('Invalid characters');

            const result = Function('"use strict";return (' + expr + ')')();
            if (!isFinite(result)) throw new Error('Invalid result');
            return result;
        } catch {
            return null;
        }
    }

    scheduleRealTimeCalculation() {
        clearTimeout(this.calcTimeout);
        this.calcTimeout = setTimeout(() => this.calculateRealTime(), 100);
    }

    calculateRealTime() {
        if (this.expression === '') {
            this.result = '0';
            this.updateDisplay();
            return;
        }

        const result = this.safeEvaluate(this.expression);
        if (result !== null) {
            if (Math.abs(result) < 1e-10) this.result = '0';
            else if (Math.abs(result) > 1e10) this.result = result.toExponential(6);
            else this.result = parseFloat(result.toFixed(10)).toString();
        }
        this.updateDisplay();
    }

    calculate() {
        if (this.expression === '') return;

        const result = this.safeEvaluate(this.expression);
        if (result !== null) {
            this.lastAnswer = result;
            this.result = (Math.abs(result) < 1e-10)
                ? '0'
                : (Math.abs(result) > 1e10)
                    ? result.toExponential(6)
                    : parseFloat(result.toFixed(10)).toString();

            // Keep expression visible
            this.expression = this.expression + ' = ' + this.result;
            this.justCalculated = true;
            this.playSound('equals', this.result);
        } else {
            this.result = 'Error';
            this.resultDisplay.classList.add('error');
            this.playSound('error');
            setTimeout(() => {
                this.resultDisplay.classList.remove('error');
                this.clear();
                this.updateDisplay();
            }, 1500);
        }
        this.updateDisplay();
    }


    updateDisplay() {
        this.expressionDisplay.textContent = this.expression || '';
        this.resultDisplay.textContent = this.result;
    }

    playSound(type, value = null) {
        if (!window.speechSynthesis) return;
        let utterance = null;

        const calm = { volume: 1, rate: 1, pitch: 1 };
        const energetic = { volume: 1, rate: 1.2, pitch: 1.5 };

        const numberWords = ['zero','one','two','three','four','five','six','seven','eight','nine'];
        const operatorWords = { '+':'plus','-':'minus','×':'multiply','÷':'divide','%':'percent','^':'power' };

        switch (type) {
            case 'number':
                if (value >= 0 && value <= 9) utterance = new SpeechSynthesisUtterance(numberWords[value]);
                Object.assign(utterance, calm);
                break;
            case 'operator':
                if (operatorWords[value]) utterance = new SpeechSynthesisUtterance(operatorWords[value]);
                Object.assign(utterance, calm);
                break;
            case 'equals':
                utterance = new SpeechSynthesisUtterance(`The result is ${value}`);
                Object.assign(utterance, energetic);
                break;
            case 'error':
                utterance = new SpeechSynthesisUtterance('Please enter valid input');
                Object.assign(utterance, energetic);
                break;
            case 'memory':
                utterance = new SpeechSynthesisUtterance(value);
                Object.assign(utterance, calm);
                break;
        }

        if (!utterance) return;

        window.speechSynthesis.cancel();
        const speakNow = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return setTimeout(speakNow, 150);
            const voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) || voices[0];
            utterance.voice = voice;
            window.speechSynthesis.speak(utterance);
        };
        speakNow();
    }
}

document.addEventListener('DOMContentLoaded', () => new Calculator());
