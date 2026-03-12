module.exports = (
{
	"RenderOnLoad": true,

	"DefaultRenderable": "Login-Container",
	"DefaultDestinationAddress": "#Pict-Login-Container",

	"TargetElementAddress": "#Pict-Login-Container",

	// ----- Endpoint Configuration -----
	// Defaults match orator-authentication routes.
	// Override these to point at any custom backend.
	"LoginEndpoint": "/1.0/Authenticate",
	// "POST" sends JSON body { UserName, Password }.
	// "GET"  appends /:username/:password to LoginEndpoint.
	"LoginMethod": "POST",
	"LogoutEndpoint": "/1.0/Deauthenticate",
	"CheckSessionEndpoint": "/1.0/CheckSession",
	"OAuthProvidersEndpoint": "/1.0/OAuth/Providers",
	"OAuthBeginEndpoint": "/1.0/OAuth/Begin",

	// ----- Behavior -----
	"CheckSessionOnLoad": true,
	"ShowOAuthProviders": false,

	// ----- Data Address -----
	// Where session state is stored in the Pict address space.
	"SessionDataAddress": "AppData.Session",

	// ----- Templates -----
	"Templates":
	[
		{
			"Hash": "Pict-Login-Template-Wrapper",
			"Template": "<div class=\"pict-login-card\"><div id=\"pict-login-error\" class=\"pict-login-error\" style=\"display:none\"></div><div id=\"pict-login-form-area\"></div><div id=\"pict-login-oauth-area\"></div><div id=\"pict-login-status-area\" style=\"display:none\"></div></div>"
		},
		{
			"Hash": "Pict-Login-Template-Form",
			"Template": "<form id=\"pict-login-form\" class=\"pict-login-form\"><label class=\"pict-login-label\" for=\"pict-login-username\">Username</label><input class=\"pict-login-input\" type=\"text\" id=\"pict-login-username\" name=\"username\" autocomplete=\"username\" placeholder=\"Enter username\" /><label class=\"pict-login-label\" for=\"pict-login-password\">Password</label><input class=\"pict-login-input\" type=\"password\" id=\"pict-login-password\" name=\"password\" autocomplete=\"current-password\" placeholder=\"Enter password\" /><button class=\"pict-login-submit\" type=\"submit\">Log In</button></form>"
		},
		{
			"Hash": "Pict-Login-Template-Status",
			"Template": "<div class=\"pict-login-status\"><span class=\"pict-login-dot pict-login-dot--on\"></span><span class=\"pict-login-user-label\">Logged in as <strong id=\"pict-login-display-name\"></strong></span><span class=\"pict-login-user-id\" id=\"pict-login-display-id\"></span><button class=\"pict-login-logout-btn\" id=\"pict-login-logout\" type=\"button\">Log out</button></div>"
		},
		{
			"Hash": "Pict-Login-Template-OAuthProviders",
			"Template": "<div class=\"pict-login-oauth\"><div class=\"pict-login-oauth-divider\"><span>or sign in with</span></div><div class=\"pict-login-oauth-buttons\" id=\"pict-login-oauth-buttons\"></div></div>"
		},
		{
			"Hash": "Pict-Login-Template-Error",
			"Template": "<div class=\"pict-login-error-message\">{~D:Record.Message~}</div>"
		}
	],

	// ----- Renderables -----
	"Renderables":
	[
		{
			"RenderableHash": "Login-Container",
			"TemplateHash": "Pict-Login-Template-Wrapper",
			"DestinationAddress": "#Pict-Login-Container"
		}
	],

	// ----- CSS -----
	"CSS": `.pict-login-card
{
	max-width: 400px;
	margin: 2rem auto;
	background: #fff;
	border: 1px solid #D4A373;
	border-top: 4px solid #E76F51;
	border-radius: 6px;
	padding: 1.5rem;
	box-shadow: 0 2px 8px rgba(38,70,83,0.08);
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	color: #264653;
}

/* ----- Form ----- */
.pict-login-form
{
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}
.pict-login-label
{
	font-weight: 600;
	font-size: 0.85rem;
	color: #264653;
}
.pict-login-input
{
	border: 1px solid #D4C4A8;
	background: #FFFCF7;
	padding: 0.55rem 0.7rem;
	border-radius: 4px;
	font-size: 0.9rem;
	color: #264653;
	width: 100%;
	box-sizing: border-box;
}
.pict-login-input:focus
{
	outline: none;
	border-color: #E76F51;
	box-shadow: 0 0 0 2px rgba(231,111,81,0.15);
}
.pict-login-submit
{
	background: #E76F51;
	color: #fff;
	border: none;
	padding: 0.6rem 1.25rem;
	border-radius: 4px;
	font-size: 0.9rem;
	font-weight: 600;
	cursor: pointer;
	margin-top: 0.25rem;
}
.pict-login-submit:hover
{
	background: #C45A3E;
}
.pict-login-submit:disabled
{
	opacity: 0.6;
	cursor: not-allowed;
}

/* ----- Error ----- */
.pict-login-error
{
	background: #FDECEA;
	border: 1px solid #E76F51;
	color: #8B2500;
	border-radius: 4px;
	padding: 0.6rem 0.8rem;
	font-size: 0.85rem;
	margin-bottom: 0.75rem;
}

/* ----- Logged-In Status ----- */
.pict-login-status
{
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex-wrap: wrap;
}
.pict-login-dot
{
	width: 10px;
	height: 10px;
	border-radius: 50%;
	flex-shrink: 0;
}
.pict-login-dot--on
{
	background: #2A9D8F;
	box-shadow: 0 0 4px rgba(42,157,143,0.5);
}
.pict-login-dot--off
{
	background: #999;
}
.pict-login-user-label
{
	font-size: 0.9rem;
}
.pict-login-user-id
{
	background: #264653;
	color: #FAEDCD;
	font-size: 0.7rem;
	font-weight: 700;
	padding: 0.15rem 0.5rem;
	border-radius: 9999px;
}
.pict-login-logout-btn
{
	margin-left: auto;
	background: #264653;
	color: #FAEDCD;
	border: none;
	padding: 0.4rem 1rem;
	border-radius: 4px;
	font-size: 0.8rem;
	font-weight: 600;
	cursor: pointer;
}
.pict-login-logout-btn:hover
{
	background: #1A3340;
}

/* ----- OAuth ----- */
.pict-login-oauth
{
	margin-top: 1rem;
}
.pict-login-oauth-divider
{
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
	color: #999;
	font-size: 0.8rem;
}
.pict-login-oauth-divider::before,
.pict-login-oauth-divider::after
{
	content: '';
	flex: 1;
	height: 1px;
	background: #D4C4A8;
}
.pict-login-oauth-buttons
{
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
.pict-login-oauth-btn
{
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.55rem 1rem;
	border-radius: 4px;
	font-size: 0.85rem;
	font-weight: 600;
	cursor: pointer;
	text-decoration: none;
	border: 1px solid #D4C4A8;
	background: #fff;
	color: #264653;
}
.pict-login-oauth-btn:hover
{
	background: #F5F0E8;
}
.pict-login-oauth-btn--google
{
	border-color: #4285F4;
	color: #4285F4;
}
.pict-login-oauth-btn--google:hover
{
	background: #EBF2FE;
}
.pict-login-oauth-btn--microsoft
{
	border-color: #00A4EF;
	color: #00A4EF;
}
.pict-login-oauth-btn--microsoft:hover
{
	background: #E6F6FE;
}
`
});
