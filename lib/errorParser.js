/**
 * Parse error messages and extract line number and error details
 * Handles formats from C++, Java, Python, JavaScript compilers
 */
export function parseErrorMessage(errorText) {
    if (!errorText) return null;

    const lines = errorText.split('\n').filter(l => l.trim());
    const errors = [];

    for (const line of lines) {
        // C++/JavaScript format: filename:line:column: error: message
        const cppMatch = line.match(/^(.+?):(\d+):(\d+):\s*(error|warning|note):\s*(.+)$/);
        if (cppMatch) {
            errors.push({
                file: cppMatch[1],
                line: parseInt(cppMatch[2]),
                column: parseInt(cppMatch[3]),
                type: cppMatch[4],
                message: cppMatch[5],
                raw: line,
            });
            continue;
        }

        // Java format: filename.java:line: error: message
        const javaMatch = line.match(/^(.+?\.java):(\d+):\s*(error|warning):\s*(.+)$/);
        if (javaMatch) {
            errors.push({
                file: javaMatch[1],
                line: parseInt(javaMatch[2]),
                column: 0,
                type: javaMatch[3],
                message: javaMatch[4],
                raw: line,
            });
            continue;
        }

        // Python format: File "filename", line X
        const pythonMatch = line.match(/File\s+"(.+?)",\s+line\s+(\d+)/);
        if (pythonMatch) {
            errors.push({
                file: pythonMatch[1],
                line: parseInt(pythonMatch[2]),
                column: 0,
                type: 'error',
                message: line,
                raw: line,
            });
            continue;
        }

        // If no pattern matched, add as raw error
        if (errors.length === 0 || !errors[errors.length - 1].raw.includes(line)) {
            errors.push({
                line: null,
                column: null,
                type: 'error',
                message: line,
                raw: line,
            });
        }
    }

    return errors.length > 0 ? errors : null;
}

/**
 * Format parsed errors for display
 */
export function formatErrorForDisplay(errors) {
    if (!errors || errors.length === 0) return null;

    return errors
        .map(err => {
            if (err.line) {
                return `Line ${err.line}:${err.column || 0} [${err.type}] ${err.message}`;
            }
            return err.message;
        })
        .join('\n');
}

/**
 * Get the first error with line number
 */
export function getFirstError(errors) {
    if (!errors || errors.length === 0) return null;
    return errors.find(e => e.line) || errors[0];
}
