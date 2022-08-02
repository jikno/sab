import { unwindCompiler } from './deps.ts'
import { UnwindParams } from './mod.ts'

export function runUnwind(code: string, url: URL, unwindParams: UnwindParams): string {
	if (url.protocol === 'file:') {
		if (unwindParams.noCompileLocal) return code

		return unwindCompiler.insertUnwindHooks(code, unwindParams)
	}

	if (unwindParams.noCompileRemote) return code

	return unwindCompiler.insertUnwindHooks(code, unwindParams)
}
