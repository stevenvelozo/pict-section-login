const libPictApplication = require('pict-application');
const libPictSectionLogin = require('../../source/Pict-Section-Login.js');

/**
 * orator-authentication with OAuth.
 *
 * Enables ShowOAuthProviders so the section fetches the provider list
 * from /1.0/OAuth/Providers and renders branded sign-in buttons for
 * Google, Microsoft, etc.  Standard username/password login is still
 * available alongside the OAuth buttons.
 */
class OAuthLoginView extends libPictSectionLogin
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onLoginSuccess(pSessionData)
	{
		this.log.info('Authenticated (standard):', pSessionData);
	}

	onSessionChecked(pSessionData)
	{
		if (pSessionData && pSessionData.LoggedIn)
		{
			this.log.info('Active session found:', pSessionData);
		}
	}
}

const _OAuthLoginViewConfiguration = (
{
	"ViewIdentifier": "OAuthLogin",
	"TargetElementAddress": "#Pict-Login-Container",
	"ShowOAuthProviders": true
	// All endpoint defaults match orator-authentication:
	//   LoginEndpoint:          "/1.0/Authenticate"      (POST)
	//   LogoutEndpoint:         "/1.0/Deauthenticate"
	//   CheckSessionEndpoint:   "/1.0/CheckSession"
	//   OAuthProvidersEndpoint: "/1.0/OAuth/Providers"
	//   OAuthBeginEndpoint:     "/1.0/OAuth/Begin"
	//   CheckSessionOnLoad:     true
});

class OAuthLoginApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('OAuthLogin', _OAuthLoginViewConfiguration, OAuthLoginView);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
		let tmpView = this.pict.views.OAuthLogin;
		if (tmpView)
		{
			tmpView.render();
		}
	}
}

module.exports = OAuthLoginApplication;

module.exports.default_configuration = (
{
	"Name": "OAuth Login Example",
	"Hash": "OAuthLoginExample",
	"MainViewportViewIdentifier": "OAuthLogin",
	"pict_configuration":
	{
		"Product": "OAuthLogin-Example"
	}
});
