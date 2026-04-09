# Quick Start

This guide walks through a minimal working integration of `pict-section-login` into a Pict application.

## 1. Install

```bash
npm install pict-section-login
```

The only runtime dependency is `pict-view`, which you already have if you are running a Pict application.

## 2. Provide a Mount Point

The default configuration renders into the element with id `Pict-Login-Container`. Drop one into your page wherever the login form should appear:

```html
<div id="Pict-Login-Container"></div>
```

You can change the selector with the `TargetElementAddress` config key.

## 3. Extend the View (Optional)

Subclassing is optional -- you can register `PictSectionLogin` directly -- but extending gives you a place to override the post-auth hooks:

```javascript
const libPictSectionLogin = require('pict-section-login');

class MyLoginView extends libPictSectionLogin
{
	onLoginSuccess(pSessionData)
	{
		this.log.info('Logged in as', pSessionData?.UserRecord?.LoginID);
		// e.g. show the protected application shell:
		// this.pict.PictApplication.showProtectedApp();
	}

	onLoginFailed(pError)
	{
		this.log.warn('Login failed:', pError);
	}

	onLogout()
	{
		this.log.info('Logged out');
	}

	onSessionChecked(pSessionData)
	{
		if (pSessionData && pSessionData.LoggedIn)
		{
			// Existing session was restored
			// this.pict.PictApplication.showProtectedApp();
		}
	}
}
```

## 4. Register the View

```javascript
const libPict = require('pict');

const _Pict = new libPict();

_Pict.addView(
	'MyLogin',
	{
		"ViewIdentifier": "MyLogin",
		"TargetElementAddress": "#Pict-Login-Container"
	},
	MyLoginView);

_Pict.views.MyLogin.render();
```

That's the whole integration for a default orator-authentication backend. The view:

1. Renders the container, form, and (hidden) status / error / OAuth areas
2. Calls `checkSession()` on first render (because `CheckSessionOnLoad` defaults to `true`)
3. If a session is already valid, renders the logged-in status bar instead of the form
4. Otherwise shows the login form and waits for a submission

## 5. Point at a Custom Backend

If your auth API does not match `orator-authentication`'s defaults, override the endpoints:

```javascript
_Pict.addView(
	'MyLogin',
	{
		"ViewIdentifier":       "MyLogin",
		"TargetElementAddress": "#Pict-Login-Container",
		"LoginEndpoint":        "/api/auth/login",
		"LoginMethod":          "POST",
		"LogoutEndpoint":       "/api/auth/logout",
		"CheckSessionEndpoint": "/api/auth/session"
	},
	MyLoginView);
```

The login method sends `{ UserName, Password }` as a JSON body on POST, or appends `/:username/:password` to the URL on GET. The view expects a response shaped like:

```json
{
	"LoggedIn":   true,
	"UserID":     "user-123",
	"UserRecord": { "IDUser": "user-123", "LoginID": "admin", "FullName": "Administrator" }
}
```

Any response without `LoggedIn: true` is treated as a failed login.

## 6. Show OAuth Providers

To render an OAuth button row alongside the form, enable the feature and make sure your backend exposes a provider list endpoint:

```javascript
_Pict.addView(
	'MyLogin',
	{
		"ViewIdentifier":         "MyLogin",
		"TargetElementAddress":   "#Pict-Login-Container",
		"ShowOAuthProviders":     true,
		"OAuthProvidersEndpoint": "/1.0/OAuth/Providers",
		"OAuthBeginEndpoint":     "/1.0/OAuth/Begin"
	},
	MyLoginView);
```

The providers endpoint should return `{ Providers: [{ Name: "Google", ... }, { Name: "Microsoft", ... }] }`. Each button navigates the browser to `<OAuthBeginEndpoint>/<Name>`.

## 7. Read the Session From Anywhere

After a successful login (or a successful session check), the session object is stored at the configured manifest address (`AppData.Session` by default):

```javascript
const tmpSession = _Pict.AppData.Session;

if (tmpSession && tmpSession.LoggedIn)
{
	const tmpUserId    = tmpSession.UserID;
	const tmpUserName  = tmpSession.UserRecord?.FullName;
}
```

Any Pict template solver or view can read the same address. See [Embedding Guide](embedding-guide.md) for how to gate protected views on this value.

## 8. Log Out

Call `logout()` from anywhere that holds a reference to the view:

```javascript
_Pict.views.MyLogin.logout((pError) =>
{
	// view already cleared local state and called onLogout()
	// navigate back to the login page or show a farewell screen
});
```

The view clears its local state (and the session at `SessionDataAddress`) even if the network call fails, so the UI is always consistent after a logout attempt.

## 9. Next Steps

- [Embedding Guide](embedding-guide.md) -- how to wire this view into an application shell with login / protected-content separation
- [Router Integration](router-integration.md) -- how to use this view with `pict-router` for route guards and post-login redirects
- [Configuration](configuration.md) -- every configuration key with defaults and descriptions
- [API Reference](api-reference.md) -- every method, callback, and override hook
- [Code Snippets](code-snippets.md) -- a runnable snippet for each exposed function
