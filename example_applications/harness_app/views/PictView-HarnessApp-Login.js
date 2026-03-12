const libPictSectionLogin = require('../../../source/Pict-Section-Login.js');

const _ViewConfiguration =
{
	ViewIdentifier: "HarnessApp-Login",

	DefaultRenderable: "Login-Container",
	DefaultDestinationAddress: "#Pict-Login-Container",
	TargetElementAddress: "#HarnessApp-Login-Container",

	AutoRender: false,

	// The application controls when to check the session,
	// so we disable the auto-check built into the section.
	CheckSessionOnLoad: false,
	ShowOAuthProviders: false,

	// orator-authentication endpoints (defaults match, but shown for clarity)
	LoginEndpoint: "/1.0/Authenticate",
	LoginMethod: "POST",
	LogoutEndpoint: "/1.0/Deauthenticate",
	CheckSessionEndpoint: "/1.0/CheckSession",

	SessionDataAddress: "AppData.Session"
};

class HarnessAppLoginView extends libPictSectionLogin
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onLoginSuccess(pSessionData)
	{
		this.log.info('Login succeeded, switching to protected app.');
		if (this.pict.PictApplication && typeof (this.pict.PictApplication.showProtectedApp) === 'function')
		{
			this.pict.PictApplication.showProtectedApp();
		}
	}

	onSessionChecked(pSessionData)
	{
		if (pSessionData && pSessionData.LoggedIn)
		{
			this.log.info('Existing session found, switching to protected app.');
			if (this.pict.PictApplication && typeof (this.pict.PictApplication.showProtectedApp) === 'function')
			{
				this.pict.PictApplication.showProtectedApp();
			}
		}
	}
}

module.exports = HarnessAppLoginView;

module.exports.default_configuration = _ViewConfiguration;
