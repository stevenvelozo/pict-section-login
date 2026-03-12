const libPictApplication = require('pict-application');
const libPictSectionLogin = require('../../source/Pict-Section-Login.js');

/**
 * Standard orator-authentication login.
 *
 * All endpoint defaults already match orator-authentication, so we only
 * need to specify the view identifier and target element.  This is the
 * minimal configuration for a production-style integration.
 */
class OratorLoginView extends libPictSectionLogin
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

const _OratorLoginViewConfiguration = (
{
	"ViewIdentifier": "OratorLogin",
	"TargetElementAddress": "#Pict-Login-Container"
	// All other settings use defaults that match orator-authentication:
	//   LoginEndpoint:        "/1.0/Authenticate"    (POST)
	//   LogoutEndpoint:       "/1.0/Deauthenticate"
	//   CheckSessionEndpoint: "/1.0/CheckSession"
	//   CheckSessionOnLoad:   true
});

class OratorLoginApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('OratorLogin', _OratorLoginViewConfiguration, OratorLoginView);
	}

	onAfterInitialize()
	{
		super.onAfterInitialize();
		let tmpView = this.pict.views.OratorLogin;
		if (tmpView)
		{
			tmpView.render();
		}
	}
}

module.exports = OratorLoginApplication;

module.exports.default_configuration = (
{
	"Name": "Orator Login Example",
	"Hash": "OratorLoginExample",
	"MainViewportViewIdentifier": "OratorLogin",
	"pict_configuration":
	{
		"Product": "OratorLogin-Example"
	}
});
