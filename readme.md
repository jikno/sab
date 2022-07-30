# Sab

...Short for **Svelte App Builder** and **Sabbatical**.

> Sabbatical: (noun) A rest.  It could be a rest at the end of the week.  It could be a rest for a year after 6 years at a hard job.  But in this case, it is a restful break from the headaches of endless configuration by way of a simple and functional framework.

An opinionated framework for building mobile and web apps using Svelte and Tailwind via the Deno ecosystem.

## Usage

> NOTE: The below example outlines how to build an application for a particular platform.  In your application's runtime, however, you must [initialize Unwind](https://github.com/jikno/unwind#runtime-usage).

```ts
import { buildWeb, buildMobile, openMobile, emptyCache } from 'https://code.jikno.com/sab/mod.ts'

// If you want to build a web app...
await buildWeb({
	inputFile: 'main.ts',
	outputDir: 'platforms/web', // Directory does not have to exist
	watch: true, // Serve the project up and watch the filesystem and incrementally rebuild on changes
	reload: true, // Do not try to load remote files from the cache
})

// If you want to build a mobile app...
await buildMobile({
	appId: 'com.example.test',
	appName: 'Example App',
	inputFile: 'main.ts',
	outputDir: 'platforms/mobile', // Directory does not have to exist
	watch: true,
	reload: true
})

// If you want to open a specific mobile IDE for in order to more easily write platform-specific code
await openMobile({
	outputDir: 'platforms/mobile', // buildMobile must be run at least once with this as it's outputDir
	IDE: 'ios' // or 'android'
})

await clearCache() // Empty the local cache of all remote modules
```

## Bundler

This project ships with a bundler that bundles `.js`, `.ts`, `.svelte`, `.jpeg`, `.png`, `.svg`, `.txt`, `.html`, `.css`, and `.json` files.

### Deno Caveats

When you import a non-es file into a deno file, you'll need to add typings.  This can be done like so:

```ts
// @deno-types=https://code.jikno.com/sab/svelte.d.ts
import App from './App.svelte'
// @deno-types=https://code.jikno.com/sab/jpeg.d.ts
import jpegBase64 from './image.jpeg'
// @deno-types=https://code.jikno.com/sab/png.d.ts
import pngBase46 from './image.png'
// @deno-types=https://code.jikno.com/svg.d.ts
import svgBase64 from './image.svg'
// @deno-types=https://code.jikno.com/txt.d.ts
import plainText from './plain.txt'
// @deno-types=https://code.jikno.com/html.d.ts
import plainHtmlString from './file.html'
// @deno-types=https://code.jikno.com/css.d.ts
import './file.css' // load css into a file the current html document
```

### Svelte Caveats

The Svelte Language server does not like it when `.ts` and `.js` extensions are added to file.  It also doesn't like imports from urls.  This is because the node typescript server powers the intellisense of Svelte files.

Although imports with extensions and imports from urls in svelte files are handled just fine with this bundler, they will look really ugly in VsCode.

Happily, however, we have "help" files.  When a file path is resolved that ends with `.help`, a `.ts` extension is automatically appended.  This allows you to import from urls bunches of different functions into a `*.help.ts` file and export them.  Your svelte components can then import that `*.help.ts` file like this...

```html
<script lang="ts">
	import { foo, bar } from './foo.help'
</script>
```

... and VsCode is happy, the Sab bundler is happy, and most importantly, you, the developer are happy.

### Plain Bundling

If you are not looking for the whole app building framework that Sab has to offer, but are instead just want a Svelte bundler that supports the Deno ecosystem, look no further.  You can directly import the bundler.

```ts
import { bundle } from 'https://code.jikno.com/sab/mod.ts'

await bundle({
	inputFile: 'main.ts',
	outputFile: 'build/bundle.js',
	watch: true,
	reload: true,
	onRebuildDone() {
		// You can update the runtime in here...
		// ...send a reload message to the client
	}
})
```

## Tailwind

Sab uses [Unwind](https://github.com/jikno/unwind) to provide tailwind support.  In Unwind, the theme and aliases are configured at runtime.  For information on how to do this, consult the [Unwind docs](https://github.com/jikno/unwind#runtime-usage).

Unwind does, however, have a compile step.  You shouldn't need to worry about this because it is handled automatically by Sab.  There are, however, some configurations that can be applied to the process.

Each of the `build*` and the `bundle` function takes in an optional `unwind` parameter.  In addition to the [parameters provided by unwind](https://github.com/jikno/unwind#compiler-usage), this object takes two parameters.

```ts
export interface UnwindParams extends unwindCompiler.InsertUnwindHooks {
	/**  If `true`, Sab will not attempt to add Unwind runtime callers to remote modules */
	noCompileRemote?: boolean
	/** If `true`, Sab will not attempt to add Unwind runtime callers to local modules */
	noCompileLocal?: boolean
}
```

## Cli

Happy to accept a PR for this.  My workflow works fine without it.

## Desktop

Yes!  Support for building native desktop apps is a feature I would love to implement.  It's not super high up my priority list right now, but at some point, I want to implement it.

Need this feature right now?  You're welcome to open a PR or hit me up on Discord and we can discuss this: `Vehmloewff#0714`.

## Contributing?

Heck yeah!

```shell
git clone https://github.com/jikno/sab
cd sab
cd test
deno run -A dev.ts
```
