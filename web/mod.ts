import { readText } from 'https://denopkg.com/Vehmloewff/deno-utils@master/mod.ts'
import { pathUtils, utils } from '../deps.ts'
import { bundle, UnwindParams } from '../mod.ts'
import { http, fileServer, colors } from './deps.ts'

export interface BuildWebOptions {
	/** The entry file of the application */
	inputFile: string
	/** The directory where web-specific code is to be located */
	outputDir: string
	/** If `true`, the program will be rebuilt when a file changes that may invalidate it */
	watch?: boolean
	/** If true, the program will not try to load any remote module from the cache */
	reload?: boolean
	/** The port that the dev server is to start on.  Ignored if watch is `false` */
	port?: number
	/** COnfiguration for unwind */
	unwind?: UnwindParams
}

export async function buildWeb(params: BuildWebOptions) {
	const sockets = new Set<WebSocket>()

	async function handle(request: Request): Promise<Response> {
		const url = new URL(request.url)
		if (url.pathname === '/livereload.ws') {
			const { response, socket } = Deno.upgradeWebSocket(request)

			socket.onopen = () => {
				sockets.add(socket)
			}

			socket.onclose = () => {
				sockets.delete(socket)
			}

			return response
		}

		if (request.method === 'GET' && url.pathname === '/') {
			const html = await readText(pathUtils.join(params.outputDir, 'index.html'))
			const template = html.replace('%livereload-script%', `<script>${generateLiveReloadScript()}</script>`)

			return new Response(template, {
				headers: { 'Content-Type': 'text/html' },
			})
		}

		return await fileServer.serveDir(request, { fsRoot: params.outputDir })
	}

	if (!(await utils.exists(params.outputDir))) await writeIndexHtml(params.outputDir)

	await bundle({
		inputFile: params.inputFile,
		outputFile: pathUtils.join(params.outputDir, 'build/bundle.js'),
		watch: params.watch,
		onRebuildDone() {
			for (const socket of sockets) socket.send('reload')

			console.log(colors.magenta('Updated'), colors.gray(`${sockets.size} active client${sockets.size === 1 ? '' : 's'}`))

			return Promise.resolve()
		},
		unwind: params.unwind,
	})

	if (params.watch)
		await new Promise<void>(resolve => {
			http.serve(handle, {
				port: params.port || 3000,
				onListen({ port }) {
					console.log(colors.green('Listen'), `http://localhost:${port}`)
					resolve()
				},
				onError(error) {
					console.error(error)

					return new Response(`There was an error in the build process: ${error}`, { status: 500 })
				},
			})
		})
}

export async function writeIndexHtml(outDir: string) {
	const html = `\
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Title</title>

	<script src="build/bundle.js" defer></script>

	%livereload-script%
</head>
<body></body>
</html>
`
	const file = pathUtils.join(outDir, 'index.html')

	await utils.writeText(file, html)
	console.log(colors.green('Write'), file)
}

function generateLiveReloadScript() {
	return `\
function connect(firstConnection) {
	const socket = new WebSocket(\`ws://\${location.host}/livereload.ws\`)

	socket.onopen = () => {
		if (firstConnection) console.log('[livereload] connected')
		else location.reload()
	}

	socket.onclose = () => {
		console.log('[livereload] disconnected.  Trying to reconnect in 1 second...')
		setTimeout(() => connect(false), 1000)
	}

	socket.onmessage = ({ data }) => {
		if (data === 'reload') location.reload()
	}
}

connect(true)
`
}
