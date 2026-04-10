# Configuration

`PictSectionLogin` ships with a `default_configuration` object that is merged with any options you pass in the constructor (or via `pict.addView(name, options, Class)`). Your options take precedence, so you only need to specify the keys you want to change.

## Default Configuration (abbreviated)

```javascript
{
	// Rendering
	"RenderOnLoad":              true,
	"DefaultRenderable":         "Login-Container",
	"DefaultDestinationAddress": "#Pict-Login-Container",
	"TargetElementAddress":      "#Pict-Login-Container",

	// Endpoints (match orator-authentication)
	"LoginEndpoint":          "/1.0/Authenticate",
	"LoginMethod":            "POST",
	"LogoutEndpoint":         "/1.0/Deauthenticate",
	"CheckSessionEndpoint":   "/1.0/CheckSession",
	"OAuthProvidersEndpoint": "/1.0/OAuth/Providers",
	"OAuthBeginEndpoint":     "/1.0/OAuth/Begin",

	// Behavior
	"CheckSessionOnLoad":  true,
	"ShowOAuthProviders":  false,

	// Data
	"SessionDataAddress": "AppData.Session",

	// Rendering resources
	"Templates":   [ /* 5 default templates -- see Templates & Styling */ ],
	"Renderables": [ /* default Login-Container renderable */ ],
	"CSS":         "/* embedded .pict-login-* design system */"
}
```

## Settings Reference

### Rendering

| Setting | Type | Default | Description |
|---|---|---|---|
| `RenderOnLoad` | boolean | `true` | Inherited from `pict-view`. When true, the view renders as soon as it is initialized. Set to `false` if you want to call `render()` manually. |
| `DefaultRenderable` | string | `"Login-Container"` | Renderable hash invoked on render. Override only if you provide your own wrapper template. |
| `DefaultDestinationAddress` | string | `"#Pict-Login-Container"` | CSS selector the default renderable writes into. |
| `TargetElementAddress` | string | `"#Pict-Login-Container"` | CSS selector for the outer mount point. The host page must provide this element. |

### Endpoints

| Setting | Type | Default | Description |
|---|---|---|---|
| `LoginEndpoint` | string | `"/1.0/Authenticate"` | URL the `login()` method calls. For `POST` the body is `{ UserName, Password }`; for `GET` the username and password are appended to the URL as `/:username/:password`. |
| `LoginMethod` | string | `"POST"` | `"POST"` or `"GET"`. Almost always `POST`. |
| `LogoutEndpoint` | string | `"/1.0/Deauthenticate"` | URL the `logout()` method calls (GET). |
| `CheckSessionEndpoint` | string | `"/1.0/CheckSession"` | URL the `checkSession()` method calls (GET). The backend should return `{ LoggedIn: true, ... }` for a valid session or `{ LoggedIn: false }` otherwise. |
| `OAuthProvidersEndpoint` | string | `"/1.0/OAuth/Providers"` | URL that returns `{ Providers: [...] }` for the OAuth button row. Only called when `ShowOAuthProviders` is true. |
| `OAuthBeginEndpoint` | string | `"/1.0/OAuth/Begin"` | URL prefix used when a user clicks an OAuth button. The view navigates the browser to `<OAuthBeginEndpoint>/<providerName>`. |

### Behavior

| Setting | Type | Default | Description |
|---|---|---|---|
| `CheckSessionOnLoad` | boolean | `true` | When true, the view automatically calls `checkSession()` after the first render so an already-authenticated user does not see the form. Set to `false` if you want to control the session check yourself (e.g. from the application's `onAfterInitializeAsync`). |
| `ShowOAuthProviders` | boolean | `false` | When true, the view calls `loadOAuthProviders()` on first render and renders a button row for each returned provider. |

### Data

| Setting | Type | Default | Description |
|---|---|---|---|
| `SessionDataAddress` | string | `"AppData.Session"` | Pict manifest address where the session data is stored. Any address the Pict manifest can resolve (typically under `AppData`, `Bundle`, or `Fable`). Templates and views can read this address to react to login state. |

### Rendering Resources

| Setting | Type | Default | Description |
|---|---|---|---|
| `Templates` | array | 5 default templates | Pict template descriptors. The defaults provide the wrapper, form, status bar, OAuth row, and error message. See [Templates & Styling](templates-and-styling.md) for the exact shapes and how to override them. |
| `Renderables` | array | 1 default renderable | Pict renderable descriptors. The default wires `Login-Container` to the wrapper template. |
| `CSS` | string | embedded design system | The CSS that the view injects into the page. Replace or extend to restyle the form. See [Templates & Styling](templates-and-styling.md). |

## Common Recipes

### Minimal (orator-authentication defaults)

```javascript
{
	"ViewIdentifier":       "MyLogin",
	"TargetElementAddress": "#Pict-Login-Container"
}
```

### Custom backend

```javascript
{
	"ViewIdentifier":       "MyLogin",
	"TargetElementAddress": "#Pict-Login-Container",
	"LoginEndpoint":        "/api/auth/login",
	"LogoutEndpoint":       "/api/auth/logout",
	"CheckSessionEndpoint": "/api/auth/session"
}
```

### Application-controlled session check

```javascript
// Set CheckSessionOnLoad to false and call checkSession from the app.
{
	"ViewIdentifier":       "MyLogin",
	"TargetElementAddress": "#HarnessApp-Login-Container",
	"CheckSessionOnLoad":   false
}
```

```javascript
// Later, in PictApplication.onAfterInitializeAsync:
this.pict.views.MyLogin.render();
this.pict.views.MyLogin.checkSession();
```

### With OAuth providers

```javascript
{
	"ViewIdentifier":         "MyLogin",
	"TargetElementAddress":   "#Pict-Login-Container",
	"ShowOAuthProviders":     true,
	"OAuthProvidersEndpoint": "/api/oauth/providers",
	"OAuthBeginEndpoint":     "/api/oauth/begin"
}
```

### Custom session address

```javascript
{
	"ViewIdentifier":      "MyLogin",
	"SessionDataAddress":  "Bundle.AuthData.CurrentSession"
}
```

Templates and views can then read `Bundle.AuthData.CurrentSession` via the usual manifest-address mechanisms.

## Merging Notes

The constructor merges your options into a copy of `default_configuration`:

```javascript
let tmpOptions = Object.assign({}, _DefaultConfiguration, pOptions);
```

This is a shallow merge. If you pass your own `Templates`, `Renderables`, or `CSS`, you replace the defaults entirely rather than adding to them. To add a template without losing the defaults, spread the defaults explicitly:

```javascript
const libPictSectionLogin = require('pict-section-login');
const tmpDefaults = libPictSectionLogin.default_configuration;

const tmpOptions = {
	"ViewIdentifier": "MyLogin",
	"Templates": [
		...tmpDefaults.Templates,
		{
			"Hash":     "MyLogin-Footer",
			"Template": "<div class=\"my-login-footer\">Powered by Example Inc.</div>"
		}
	]
};
```
