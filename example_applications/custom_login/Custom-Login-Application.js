const libPictApplication = require('pict-application');
const libPictSectionLogin = require('../../source/Pict-Section-Login.js');

/**
 * A custom login view that demonstrates pointing the section at an
 * arbitrary endpoint.  The HTML page mocks window.fetch so this works
 * entirely client-side with no server.
 */
class CustomLoginView extends libPictSectionLogin
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onLoginSuccess(pSessionData)
	{
		this.log.info('Custom login succeeded!', pSessionData);
	}

	onLoginFailed(pError)
	{
		this.log.warn('Custom login failed: ' + pError);
	}

	onLogout()
	{
		this.log.info('Custom logout complete.');
	}
}

const _CustomLoginViewConfiguration = (
{
	"ViewIdentifier": "CustomLogin",
	"TargetElementAddress": "#Pict-Login-Container",
	"LoginEndpoint": "/api/custom-auth",
	"LoginMethod": "POST",
	"LogoutEndpoint": "/api/custom-logout",
	"CheckSessionEndpoint": "/api/custom-session",
	"CheckSessionOnLoad": false,
	"ShowOAuthProviders": false
});

class CustomLoginApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('CustomLogin', _CustomLoginViewConfiguration, CustomLoginView);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
		let tmpView = this.pict.views.CustomLogin;
		if (tmpView)
		{
			tmpView.render();
		}
	}
}

module.exports = CustomLoginApplication;

module.exports.default_configuration = (
{
	"Name": "Custom Login Example",
	"Hash": "CustomLoginExample",
	"MainViewportViewIdentifier": "CustomLogin",
	"pict_configuration":
	{
		"Product": "CustomLogin-Example"
	}
});
