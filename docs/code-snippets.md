# Code Snippets

One runnable snippet per exposed function. Each example assumes you have a Pict instance and have registered the login view under the name `MyLogin`:

```javascript
const libPict             = require('pict');
const libPictSectionLogin = require('pict-section-login');

const _Pict = new libPict();

_Pict.addView(
	'MyLogin',
	{
		"ViewIdentifier":       "MyLogin",
		"TargetElementAddress": "#Pict-Login-Container"
	},
	libPictSectionLogin);

const view = _Pict.views.MyLogin;
```

---

## `default_configuration`

Merge the shipped defaults with your own options when registering the view.

```javascript
const tmpDefaults = libPictSectionLogin.default_configuration;

const tmpOptions = Object.assign({}, tmpDefaults,
{
	"ViewIdentifier":       "MyLogin",
	"TargetElementAddress": "#Pict-Login-Container",
	"LoginEndpoint":        "/api/auth/login",
	"LogoutEndpoint":       "/api/auth/logout",
	"CheckSessionEndpoint": "/api/auth/session"
});

_Pict.addView('MyLogin', tmpOptions, libPictSectionLogin);
```

---

## Subclassing the view

Subclass when you want to override the post-auth hooks. Pict constructs it for you via `addView`.

```javascript
class MyLoginView extends libPictSectionLogin
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onLoginSuccess(pSessionData)
	{
		this.log.info('Welcome,', pSessionData?.UserRecord?.FullName);
		this.pict.PictApplication?.showProtectedApp?.();
	}
}

_Pict.addView('MyLogin', { "ViewIdentifier": "MyLogin" }, MyLoginView);
```

---

## `render()`

Inherited from `pict-view`. Shows the login form (or the status bar if a session is already active).

```javascript
view.render();
```

---

## `login(pUsername, pPassword, fCallback)`

Programmatically authenticate. Normally the form's submit handler calls this for you, but you can drive it directly for tests, SSO handoff, or a custom login UI.

```javascript
view.login('admin', 's3cret', (pError, pSessionData) =>
{
	if (pError)
	{
		console.error('Login failed:', pError);
		return;
	}
	console.log('Logged in as', pSessionData.UserRecord?.LoginID);
});
```

---

## `logout(fCallback)`

End the current session. Clears local state even if the network call fails.

```javascript
view.logout((pError) =>
{
	// Local state is already cleared regardless of pError
	console.log('Logged out');
});
```

---

## `checkSession(fCallback)`

Validate an existing session (e.g. restored from an HTTP-only cookie on page load). Called automatically when `CheckSessionOnLoad` is `true`, but you can call it manually as well.

```javascript
view.checkSession((pError, pSessionData) =>
{
	if (pError)
	{
		console.warn('Session check failed:', pError);
		return;
	}
	if (pSessionData && pSessionData.LoggedIn)
	{
		console.log('Existing session restored');
	}
	else
	{
		console.log('No active session');
	}
});
```

---

## `loadOAuthProviders(fCallback)`

Fetch the OAuth provider list and render the button row. Called automatically when `ShowOAuthProviders` is `true`.

```javascript
view.loadOAuthProviders((pError, pProviders) =>
{
	if (pError)
	{
		console.warn('Failed to load providers:', pError);
		return;
	}
	console.log('Available providers:', pProviders.map(p => p.Name));
});
```

---

## `onLoginSuccess(pSessionData)`

Override to run custom logic after a successful sign-in.

```javascript
class MyLoginView extends libPictSectionLogin
{
	onLoginSuccess(pSessionData)
	{
		// Fire analytics
		this.pict.services.Analytics?.track('login', { userId: pSessionData.UserID });

		// Redirect to a pending route (if there is one)
		const tmpPending = this.pict.AppData.PendingRoute;
		if (tmpPending && this.pict.providers.PictRouter)
		{
			this.pict.AppData.PendingRoute = null;
			this.pict.providers.PictRouter.navigate(tmpPending);
		}
		else
		{
			this.pict.PictApplication?.showProtectedApp?.();
		}
	}
}
```

---

## `onLoginFailed(pError)`

Override to react to a failed login attempt.

```javascript
class MyLoginView extends libPictSectionLogin
{
	onLoginFailed(pError)
	{
		this.log.warn('Failed login:', pError);
		this.pict.services.Analytics?.track('login_failed', { reason: pError });
	}
}
```

---

## `onLogout()`

Override to run custom logic after a logout.

```javascript
class MyLoginView extends libPictSectionLogin
{
	onLogout()
	{
		// Clear app-level caches
		this.pict.AppData.CachedBooks = null;

		// Hide the protected shell and show the login view
		this.pict.PictApplication?.showLogin?.();
	}
}
```

---

## `onSessionChecked(pSessionData)`

Override to react to a session check -- the most common place to auto-show the protected application shell when an existing cookie is still valid.

```javascript
class MyLoginView extends libPictSectionLogin
{
	onSessionChecked(pSessionData)
	{
		if (pSessionData && pSessionData.LoggedIn)
		{
			this.pict.PictApplication?.showProtectedApp?.();
		}
		else
		{
			this.pict.PictApplication?.showLogin?.();
		}
	}
}
```

---

## Reading session state from anywhere

Any Pict view or service can read the session from `SessionDataAddress` (default `AppData.Session`):

```javascript
const tmpSession = _Pict.AppData.Session;

if (tmpSession && tmpSession.LoggedIn)
{
	const tmpUserName = tmpSession.UserRecord?.FullName;
	const tmpUserId   = tmpSession.UserID;
	console.log(`Welcome, ${ tmpUserName } (${ tmpUserId })`);
}
```

From a Pict template you can use the manifest address directly:

```
{~D:AppData.Session.UserRecord.FullName~}
```

---

## Manually replacing the view's state

You should not normally mutate `authenticated` or `sessionData` directly, but you can read them to make decisions:

```javascript
if (view.authenticated)
{
	console.log('Session active for', view.sessionData?.UserRecord?.LoginID);
}
else
{
	console.log('User is signed out');
}
```
