const tsReservedWords = [
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'enum',
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'import',
	'in',
	'istanceOf',
	'new',
	'null',
	'return',
	'super',
	'switch',
	'this',
	'throw',
	'true',
	'try',
	'typeOf',
	'var',
	'void',
	'while',
	'with',
	'as',
	'implements',
	'interface',
	'let',
	'package',
	'private',
	'protected',
	'public',
	'static',
	'yield',
	'await',
	'async',
]

export function getVariables(code: string) {
	const idRegex = /[a-zA-Z_$][a-zA-Z0-9_$]*/g
	const ids = code.match(idRegex) || []

	return ids.filter(id => !tsReservedWords.includes(id))
}

export function assembleLog(ids: string[]) {
	return `console.log(${ids.join(', ')})`
}

export function removeTrailingLog(code: string) {
	return code.trimEnd().split('\n').slice(0, -1).join('\n')
}

export function addTrailingLog(code: string) {
	const log = assembleLog(getVariables(code))

	return `${code}\n${log}`
}
