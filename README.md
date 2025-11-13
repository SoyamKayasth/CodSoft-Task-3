# CodSoft-Task-3
# Advanced Calculator

A modern, responsive web-based calculator with extended math support and keyboard input. This small project demonstrates a polished UI, real-time evaluation, and optional speech feedback.

## Features
- Responsive design with smooth button animations
- Real-time expression evaluation (preview of result while typing)
- Supports:
  - Basic arithmetic: +, -, ×, ÷
  - Parentheses, decimal numbers
  - Percent (%), pi (π)
  - Square root (√), power (^), factorial (!)
- Keyboard support: numbers, +, -, *, /, Enter (equals), Backspace, ., parentheses, %, ^, !
- Speech feedback via browser SpeechSynthesis (if available)

## Files
- `index.html` — the app HTML
- `style.css` — styling and responsive layout
- `script.js` — calculator logic, keyboard handlers, real-time evaluation and speech feedback

## Running locally
1. Clone or create a repository and copy the files into the project root.
2. Open `index.html` in a browser for a quick preview. For full functionality (e.g., some browsers restrict speech API on file://), run a simple HTTP server:

```bash
# Python 3
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

3. Use keyboard keys or click the buttons. The browser's SpeechSynthesis API is optional — if available it will vocalize numbers, operators and results.

## Notes & Limitations
- The evaluator uses a sanitized evaluator built with Function(); while common expressions and functions (√, ^, factorial, percent, π) are handled, complex or malicious input is guarded against basic invalid characters. Do not evaluate untrusted input server-side without proper isolation.
- Factorial is supported for integer inputs up to ~170 (larger values return Infinity).
- The project is client-only — no build step required.

## License
MIT

## Author
Prepared for "CodSoft Task 3"
