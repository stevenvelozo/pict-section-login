# Architecture

Pict Section Login is a single `pict-view` subclass that owns its own templates, CSS, state, and auth request logic. It leans on the standard Pict services (TemplateProvider, CSSMap, ContentAssignment, manifest) for rendering and state storage, and exposes four override hooks that let the host application react to auth state changes.

## Component Map

```mermaid
graph TB
	subgraph "Host Pict Application"
		APP["PictApplication"]
		APPDATA["AppData tree<br/>(manifest-addressable)"]
		ROUTER["Pict Router<br/>(optional)"]
	end

	subgraph "pict-section-login"
		LOGIN["PictSectionLogin<br/>(extends pict-view)"]
		CONFIG["default_configuration"]
		TEMPLATES["Templates<br/>Wrapper / Form / Status / OAuth / Error"]
		CSS["CSS design system"]
	end

	subgraph "Pict Services"
		TP["TemplateProvider"]
		CM["CSSMap"]
		CA["ContentAssignment"]
		MAN["fable.manifest"]
	end

	subgraph "Backend"
		AUTH["Auth REST API<br/>(orator-authentication<br/>or custom)"]
	end

	APP -->|addView| LOGIN
	LOGIN -->|merges| CONFIG
	LOGIN -->|registers| TEMPLATES
	LOGIN -->|registers| CSS
	LOGIN -->|parse| TP
	LOGIN -->|inject| CM
	LOGIN -->|DOM reads/writes| CA
	LOGIN -->|setValueByHash| MAN
	MAN -->|reads/writes| APPDATA
	LOGIN -->|fetch| AUTH
	LOGIN -.->|hooks| APP
	APP -.->|post-auth| ROUTER
```

## Class Hierarchy

```mermaid
classDiagram
	class libPictViewClass {
		+pict
		+services
		+options
		+log
		+render()
		+onBeforeInitialize()
		+onAfterRender()
		+onAfterInitialRender()
	}

	class PictSectionLogin {
		+authenticated : boolean
		+sessionData : object
		+oauthProviders : array
		+initialRenderComplete : boolean
		+login(pUsername, pPassword, fCallback)
		+logout(fCallback)
		+checkSession(fCallback)
		+loadOAuthProviders(fCallback)
		+onLoginSuccess(pSessionData)
		+onLoginFailed(pError)
		+onLogout()
		+onSessionChecked(pSessionData)
	}

	libPictViewClass <|-- PictSectionLogin
	PictSectionLogin ..> TemplateProvider : uses
	PictSectionLogin ..> CSSMap : uses
	PictSectionLogin ..> ContentAssignment : uses
	PictSectionLogin ..> manifest : uses
```

## Auth State Machine

```mermaid
stateDiagram-v2
	[*] --> Rendered: view.render()

	Rendered --> CheckingSession: CheckSessionOnLoad = true
	Rendered --> ShowingForm: CheckSessionOnLoad = false

	CheckingSession --> ShowingForm: no session
	CheckingSession --> ShowingStatus: session restored

	ShowingForm --> Authenticating: user submits form
	Authenticating --> ShowingStatus: success
	Authenticating --> ShowingForm: failure (error shown)

	ShowingStatus --> LoggingOut: user clicks Log out
	LoggingOut --> ShowingForm: complete (even on network failure)

	note right of ShowingStatus
		authenticated = true
		sessionData populated
		AppData.Session set
	end note

	note right of ShowingForm
		authenticated = false
		sessionData = null
		AppData.Session cleared
	end note
```

## Login Request Flow

```mermaid
sequenceDiagram
	participant User
	participant Form as Login Form
	participant View as PictSectionLogin
	participant API as Auth API
	participant Manifest as fable.manifest
	participant App as PictApplication

	User->>Form: enter credentials + submit
	Form->>View: form submit handler
	View->>API: POST LoginEndpoint { UserName, Password }
	alt LoginMethod = GET
		View->>API: GET LoginEndpoint/:username/:password
	end
	API-->>View: { LoggedIn, UserID, UserRecord }
	alt LoggedIn = true
		View->>View: authenticated = true
		View->>View: sessionData = response
		View->>Manifest: setValueByHash(SessionDataAddress, sessionData)
		View->>View: render status bar, hide form
		View->>View: onLoginSuccess(sessionData)  [override hook]
		View->>App: PictApplication.solve()  [if present]
	else LoggedIn = false / error
		View->>View: render error message
		View->>View: onLoginFailed(error)  [override hook]
	end
```

## Initial Render Flow

```mermaid
sequenceDiagram
	participant App as PictApplication
	participant View as PictSectionLogin
	participant CSS as CSSMap
	participant TP as TemplateProvider
	participant DOM
	participant API as Auth API

	App->>View: render()
	View->>View: onBeforeInitialize()
	View->>TP: register templates from default_configuration
	View->>View: onAfterRender()
	View->>CSS: injectCSS() (first call)
	View->>TP: parseTemplateByHash('Pict-Login-Template-Form')
	View->>DOM: assignContent('#pict-login-form-area', form)
	View->>View: onAfterInitialRender()
	alt CheckSessionOnLoad = true
		View->>API: GET CheckSessionEndpoint
		API-->>View: { LoggedIn, ... }
		alt LoggedIn = true
			View->>View: render status bar instead of form
		end
		View->>View: onSessionChecked(sessionData)
	end
	alt ShowOAuthProviders = true
		View->>API: GET OAuthProvidersEndpoint
		API-->>View: { Providers: [...] }
		View->>DOM: render OAuth button row
	end
```

## State Members

`PictSectionLogin` carries a small amount of instance state:

| Member | Type | Description |
|---|---|---|
| `this.authenticated` | `boolean` | Whether a session is currently active. `true` after a successful `login` or `checkSession`. |
| `this.sessionData` | `object \| null` | The most recent session object returned from the backend. Mirrored to `options.SessionDataAddress`. |
| `this.oauthProviders` | `array` | The provider list fetched from `OAuthProvidersEndpoint`. Empty until `loadOAuthProviders` completes. |
| `this.initialRenderComplete` | `boolean` | Internal flag; `true` after `onAfterInitialRender` has run once. |

## Session Data Shape

The view treats the backend response as opaque except for a few keys:

| Key | Purpose |
|---|---|
| `LoggedIn` | Required. `true` means authenticated, anything else is treated as a failure. |
| `UserID` | Displayed in the status bar. |
| `UserRecord` | Optional object; `UserRecord.FullName` / `UserRecord.LoginID` are displayed. |

Any other fields are preserved verbatim in `this.sessionData` and at `SessionDataAddress`. You can include roles, feature flags, tenant ids, or anything else your backend returns.

## File Layout

```
pict-section-login/
├── README.md
├── package.json
├── source/
│   ├── Pict-Section-Login.js                     # main class
│   └── Pict-Section-Login-DefaultConfiguration.js # templates + CSS + defaults
├── test/
│   ├── Pict-Section-Login_tests.js               # Mocha TDD unit tests
│   └── Browser_Integration_tests.js              # Puppeteer headless tests
├── example_applications/
│   ├── orator_login/                             # minimal orator-authentication
│   ├── custom_login/                             # custom endpoints + hooks
│   ├── oauth_login/                              # OAuth providers
│   └── harness_app/                              # full login + router app
└── docs/
	├── README.md, _cover.md, _sidebar.md, _topbar.md
	├── quickstart.md
	├── architecture.md
	├── configuration.md
	├── api-reference.md
	├── code-snippets.md
	├── embedding-guide.md
	├── router-integration.md
	└── templates-and-styling.md
```

## Session Storage Policy

The view does not store tokens in `localStorage`, `sessionStorage`, or any browser storage. The backend is assumed to maintain the session via HTTP-only cookies (or any other credentialed mechanism that the browser carries automatically), and the view verifies that session via `CheckSessionEndpoint` on load.

Consequences:

- Refreshing the page works transparently if cookies are set correctly -- `checkSession` restores the session.
- XSS in the host application cannot steal tokens from storage because there are none.
- Cross-tab behavior is consistent -- both tabs see the same server-side session.
- Logging out in one tab does not automatically log out in another; call `checkSession` periodically if you need cross-tab coordination.
