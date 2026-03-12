/**
 * Headless browser integration tests for pict-section-login.
 *
 * Verifies the login UI works in a real browser environment:
 *   1) The login form renders with expected DOM elements
 *   2) Invalid credentials display an error message
 *   3) Valid credentials show the logged-in status area
 *   4) Logout returns to the login form
 *
 * Uses a mock window.fetch to simulate authentication endpoints without
 * needing a running backend.
 *
 * Requires: npm run build (quackage) to have been run first so dist/ exists.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */

const Chai = require('chai');
const Expect = Chai.expect;

const libHTTP = require('http');
const libFS = require('fs');
const libPath = require('path');

const _PackageRoot = libPath.resolve(__dirname, '..');
const _DistDir = libPath.join(_PackageRoot, 'dist');
const _PictDistDir = libPath.join(_PackageRoot, 'node_modules', 'pict', 'dist');

/**
 * Create a simple HTTP server that serves the static files needed
 * for the browser test page.
 *
 * @param {function} fCallback - Callback with (pError, pServer, pPort)
 */
function startTestServer(fCallback)
{
	let tmpMimeTypes =
	{
		'.html': 'text/html',
		'.js': 'application/javascript',
		'.map': 'application/json'
	};

	let tmpServer = libHTTP.createServer(
		(pRequest, pResponse) =>
		{
			let tmpUrl = pRequest.url;

			// Route: / -> test page (generated inline)
			if (tmpUrl === '/' || tmpUrl === '/index.html')
			{
				pResponse.writeHead(200, { 'Content-Type': 'text/html' });
				pResponse.end(generateTestHTML());
				return;
			}

			// Route: /pict.js -> from node_modules/pict/dist/
			if (tmpUrl === '/pict.js')
			{
				serveFile(libPath.join(_PictDistDir, 'pict.js'), pResponse, tmpMimeTypes);
				return;
			}

			// Route: /pict-section-login.* -> from dist/
			if (tmpUrl.startsWith('/pict-section-login'))
			{
				serveFile(libPath.join(_DistDir, tmpUrl.slice(1)), pResponse, tmpMimeTypes);
				return;
			}

			pResponse.writeHead(404);
			pResponse.end('Not Found');
		});

	// Listen on a random available port
	tmpServer.listen(0, '127.0.0.1',
		() =>
		{
			let tmpPort = tmpServer.address().port;
			return fCallback(null, tmpServer, tmpPort);
		});
}

/**
 * Serve a static file from the filesystem.
 *
 * @param {string} pFilePath - Absolute path to file
 * @param {object} pResponse - HTTP response object
 * @param {object} pMimeTypes - Extension -> MIME type map
 */
function serveFile(pFilePath, pResponse, pMimeTypes)
{
	if (!libFS.existsSync(pFilePath))
	{
		pResponse.writeHead(404);
		pResponse.end('File not found: ' + pFilePath);
		return;
	}

	let tmpExt = libPath.extname(pFilePath);
	let tmpContentType = pMimeTypes[tmpExt] || 'application/octet-stream';

	let tmpContent = libFS.readFileSync(pFilePath);
	pResponse.writeHead(200, { 'Content-Type': tmpContentType });
	pResponse.end(tmpContent);
}

/**
 * Generate the test HTML page that runs in the browser.
 *
 * Loads pict.js (creates global Pict) and pict-section-login.js (creates
 * global PictSectionLogin).  Mocks window.fetch to simulate authentication
 * endpoints.  Tests exercise form rendering, login, and logout flows.
 * Results are stored on window.__TEST_RESULTS__.
 *
 * @returns {string} HTML content
 */
function generateTestHTML()
{
	return `<!DOCTYPE html>
<html>
<head><title>Pict-Section-Login Browser Tests</title></head>
<body>
<h1>Pict-Section-Login Browser Integration Tests</h1>
<pre id="output">Running tests...</pre>
<div id="Pict-Login-Container"></div>

<!-- Load pict (creates global Pict) -->
<script src="/pict.js"></script>

<!-- Load pict-section-login (creates global PictSectionLogin) -->
<script src="/pict-section-login.js"></script>

<script>
// ===== Mock fetch =====
// Intercept fetch calls to simulate authentication endpoints.
// Accepts demo/demo as valid credentials.
var _OriginalFetch = window.fetch;
window.fetch = function(pUrl, pOptions)
{
	// POST /1.0/Authenticate
	if (pUrl === '/1.0/Authenticate' && pOptions && pOptions.method === 'POST')
	{
		var body = JSON.parse(pOptions.body);
		if (body.UserName === 'demo' && body.Password === 'demo')
		{
			return Promise.resolve(
			{
				ok: true,
				json: function()
				{
					return Promise.resolve(
					{
						LoggedIn: true,
						UserID: 42,
						UserRecord:
						{
							IDUser: 42,
							LoginID: 'demo',
							FullName: 'Demo User',
							Email: 'demo@example.com'
						}
					});
				}
			});
		}
		else
		{
			return Promise.resolve(
			{
				ok: true,
				json: function()
				{
					return Promise.resolve(
					{
						LoggedIn: false,
						Error: 'Invalid credentials.'
					});
				}
			});
		}
	}

	// GET /1.0/Deauthenticate
	if (pUrl === '/1.0/Deauthenticate')
	{
		return Promise.resolve(
		{
			ok: true,
			json: function()
			{
				return Promise.resolve({ LoggedIn: false });
			}
		});
	}

	// GET /1.0/CheckSession
	if (pUrl === '/1.0/CheckSession')
	{
		return Promise.resolve(
		{
			ok: true,
			json: function()
			{
				return Promise.resolve({ LoggedIn: false });
			}
		});
	}

	// Fall through to real fetch for anything else
	return _OriginalFetch.apply(window, arguments);
};

// ===== Test Runner =====
(async function runTests()
{
	var results = [];
	var output = document.getElementById('output');

	function addResult(pName, pPassed, pError)
	{
		results.push({ name: pName, passed: pPassed, error: pError || null });
		output.textContent += '\\n' + (pPassed ? 'PASS' : 'FAIL') + ': ' + pName;
		if (pError)
		{
			output.textContent += ' (' + pError + ')';
		}
	}

	// Helper: wait for a condition to become true (polling)
	function waitFor(pConditionFn, pTimeoutMs)
	{
		var timeout = pTimeoutMs || 5000;
		var start = Date.now();
		return new Promise(function(resolve, reject)
		{
			function check()
			{
				if (pConditionFn())
				{
					return resolve();
				}
				if (Date.now() - start > timeout)
				{
					return reject(new Error('waitFor timed out after ' + timeout + 'ms'));
				}
				setTimeout(check, 50);
			}
			check();
		});
	}

	try
	{
		// ---- Test 1: Pict global is available ----
		addResult(
			'Pict global available',
			typeof Pict !== 'undefined' && typeof Pict === 'function'
		);

		// ---- Test 2: PictSectionLogin global is available ----
		addResult(
			'PictSectionLogin global available',
			typeof PictSectionLogin !== 'undefined' && typeof PictSectionLogin === 'function'
		);

		// ---- Create a Pict instance and register the login view ----
		var tmpPict = new Pict(
		{
			Product: 'LoginTest',
			ProductVersion: '1.0.0'
		});

		// Register and add the login view
		tmpPict.addView('PictSectionLogin',
		{
			CheckSessionOnLoad: false,
			RenderOnLoad: false
		}, PictSectionLogin);

		var tmpLoginView = tmpPict.views['PictSectionLogin'];

		// Render the login view into the container
		tmpLoginView.render();

		// ---- Test 3: Login form renders ----
		var tmpForm = document.querySelector('#pict-login-form');
		addResult(
			'Login form renders',
			tmpForm !== null,
			tmpForm === null ? 'could not find #pict-login-form' : null
		);

		// ---- Test 4: Username and password inputs exist ----
		var tmpUsernameInput = document.querySelector('#pict-login-username');
		var tmpPasswordInput = document.querySelector('#pict-login-password');
		addResult(
			'Username and password inputs exist',
			tmpUsernameInput !== null && tmpPasswordInput !== null,
			tmpUsernameInput === null ? 'missing #pict-login-username'
				: (tmpPasswordInput === null ? 'missing #pict-login-password' : null)
		);

		// ---- Test 5: Error area hidden initially ----
		var tmpErrorEl = document.querySelector('#pict-login-error');
		addResult(
			'Error area hidden initially',
			tmpErrorEl !== null && tmpErrorEl.style.display === 'none',
			tmpErrorEl === null ? 'missing #pict-login-error'
				: ('display is: ' + tmpErrorEl.style.display)
		);

		// ---- Test 6: Invalid login shows error ----
		// Fill in bad credentials and submit the form
		tmpUsernameInput.value = 'baduser';
		tmpPasswordInput.value = 'badpass';
		tmpForm.dispatchEvent(new Event('submit', { cancelable: true }));

		// Wait for the error to appear (fetch mock resolves asynchronously)
		await waitFor(function()
		{
			var el = document.querySelector('#pict-login-error');
			return el && el.style.display === 'block' && el.textContent.length > 0;
		}, 5000);

		var tmpErrorAfterBadLogin = document.querySelector('#pict-login-error');
		addResult(
			'Invalid login shows error',
			tmpErrorAfterBadLogin !== null
				&& tmpErrorAfterBadLogin.style.display === 'block'
				&& tmpErrorAfterBadLogin.textContent.indexOf('Invalid') >= 0,
			tmpErrorAfterBadLogin ? 'error text: ' + tmpErrorAfterBadLogin.textContent : 'error element missing'
		);

		// ---- Test 7: Valid login shows status area ----
		tmpUsernameInput = document.querySelector('#pict-login-username');
		tmpPasswordInput = document.querySelector('#pict-login-password');
		tmpUsernameInput.value = 'demo';
		tmpPasswordInput.value = 'demo';
		tmpForm = document.querySelector('#pict-login-form');
		tmpForm.dispatchEvent(new Event('submit', { cancelable: true }));

		// Wait for the status area to become visible
		await waitFor(function()
		{
			var el = document.querySelector('#pict-login-status-area');
			return el && el.style.display === 'block';
		}, 5000);

		var tmpStatusArea = document.querySelector('#pict-login-status-area');
		var tmpDisplayName = document.querySelector('#pict-login-display-name');
		addResult(
			'Valid login shows status area with user info',
			tmpStatusArea !== null
				&& tmpStatusArea.style.display === 'block'
				&& tmpDisplayName !== null
				&& tmpDisplayName.textContent === 'Demo User',
			tmpDisplayName ? 'display name: ' + tmpDisplayName.textContent : 'status area or display name missing'
		);

		// ---- Test 8: Logout returns to form ----
		var tmpLogoutBtn = document.querySelector('#pict-login-logout');
		if (tmpLogoutBtn)
		{
			tmpLogoutBtn.click();
		}

		// Wait for the form area to reappear
		await waitFor(function()
		{
			var el = document.querySelector('#pict-login-form-area');
			return el && el.style.display === 'block';
		}, 5000);

		var tmpFormArea = document.querySelector('#pict-login-form-area');
		var tmpStatusAfterLogout = document.querySelector('#pict-login-status-area');
		addResult(
			'Logout returns to form',
			tmpFormArea !== null
				&& tmpFormArea.style.display === 'block'
				&& tmpStatusAfterLogout !== null
				&& tmpStatusAfterLogout.style.display === 'none',
			tmpFormArea ? 'form display: ' + tmpFormArea.style.display + ', status display: '
				+ (tmpStatusAfterLogout ? tmpStatusAfterLogout.style.display : 'missing') : 'form area missing'
		);
	}
	catch (pError)
	{
		addResult('unexpected error', false, pError.message || String(pError));
	}

	// Store final results for puppeteer to read
	window.__TEST_RESULTS__ = results;
	window.__TESTS_COMPLETE__ = true;

	output.textContent += '\\n\\nDone: '
		+ results.filter(function(r) { return r.passed; }).length + '/'
		+ results.length + ' passed';
})();
</script>
</body>
</html>`;
}

suite
(
	'Browser-Integration',
	function()
	{
		// Browser tests need extra time for puppeteer startup
		this.timeout(60000);

		let _Server;
		let _Port;
		let _Browser;
		let _Puppeteer;

		suiteSetup
		(
			function(fDone)
			{
				// Verify dist/ exists
				if (!libFS.existsSync(libPath.join(_DistDir, 'pict-section-login.js')))
				{
					return fDone(new Error(
						'dist/pict-section-login.js not found. Run "npm run build" first.'
					));
				}

				// Verify pict dist exists
				if (!libFS.existsSync(libPath.join(_PictDistDir, 'pict.js')))
				{
					return fDone(new Error(
						'node_modules/pict/dist/pict.js not found. Run "npm install" first.'
					));
				}

				// Start the test server
				startTestServer(
					function(pError, pServer, pPort)
					{
						if (pError)
						{
							return fDone(pError);
						}
						_Server = pServer;
						_Port = pPort;

						// Load puppeteer
						try
						{
							_Puppeteer = require('puppeteer');
						}
						catch (pRequireError)
						{
							_Server.close();
							return fDone(new Error(
								'puppeteer is not installed. Run "npm install" to install it as a devDependency.'
							));
						}

						return fDone();
					});
			}
		);

		suiteTeardown
		(
			function(fDone)
			{
				let tmpCleanupSteps = [];

				if (_Browser)
				{
					tmpCleanupSteps.push(_Browser.close().catch(() => {}));
				}

				Promise.all(tmpCleanupSteps).then(
					function()
					{
						if (_Server)
						{
							_Server.close(fDone);
						}
						else
						{
							fDone();
						}
					});
			}
		);

		test
		(
			'All browser tests pass in headless Chrome',
			function(fDone)
			{
				_Puppeteer.launch(
					{
						headless: true,
						args: ['--no-sandbox', '--disable-setuid-sandbox']
					})
					.then(
						function(pBrowser)
						{
							_Browser = pBrowser;
							return _Browser.newPage();
						})
					.then(
						function(pPage)
						{
							// Capture console output for debugging
							pPage.on('console',
								function(pMessage)
								{
									if (pMessage.type() === 'error')
									{
										console.log('  [browser error]', pMessage.text());
									}
								});

							pPage.on('pageerror',
								function(pError)
								{
									console.log('  [browser page error]', pError.message);
								});

							return pPage.goto(`http://127.0.0.1:${_Port}/`, { waitUntil: 'networkidle0', timeout: 30000 })
								.then(function() { return pPage; });
						})
					.then(
						function(pPage)
						{
							// Wait for tests to complete
							return pPage.waitForFunction(
								'window.__TESTS_COMPLETE__ === true',
								{ timeout: 30000 }
							).then(function() { return pPage; });
						})
					.then(
						function(pPage)
						{
							// Read results
							return pPage.evaluate(function()
							{
								return window.__TEST_RESULTS__;
							});
						})
					.then(
						function(pResults)
						{
							// Assert each test passed
							Expect(pResults).to.be.an('array');
							Expect(pResults.length).to.be.above(0);

							let tmpFailures = [];

							for (let i = 0; i < pResults.length; i++)
							{
								let tmpResult = pResults[i];
								if (!tmpResult.passed)
								{
									tmpFailures.push(
										tmpResult.name + (tmpResult.error ? ': ' + tmpResult.error : '')
									);
								}
							}

							if (tmpFailures.length > 0)
							{
								Expect.fail(
									'Browser tests failed:\n  - ' + tmpFailures.join('\n  - ')
								);
							}

							console.log(`    ${pResults.length} browser sub-tests passed`);
							fDone();
						})
					.catch(
						function(pError)
						{
							fDone(pError);
						});
			}
		);
	}
);
