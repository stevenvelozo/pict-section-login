const libPictApplication = require('pict-application');
const libPictRouter = require('pict-router');

// Views
const libViewLogin = require('./views/PictView-HarnessApp-Login.js');
const libViewLayout = require('./views/PictView-HarnessApp-Layout.js');
const libViewTopBar = require('./views/PictView-HarnessApp-TopBar.js');
const libViewDashboard = require('./views/PictView-HarnessApp-Dashboard.js');
const libViewBooks = require('./views/PictView-HarnessApp-Books.js');
const libViewUsers = require('./views/PictView-HarnessApp-Users.js');

class HarnessAppApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Router provider — SkipRouteResolveOnAdd is set in the config JSON
		// so routes only resolve after the layout renders (not during construction).
		this.pict.addProvider('PictRouter',
			require('./providers/PictRouter-HarnessApp.json'),
			libPictRouter);

		// Login view (extends pict-section-login)
		this.pict.addView('HarnessApp-Login', libViewLogin.default_configuration, libViewLogin);

		// Layout shell (top bar + content area)
		this.pict.addView('HarnessApp-Layout', libViewLayout.default_configuration, libViewLayout);

		// Top bar navigation
		this.pict.addView('HarnessApp-TopBar', libViewTopBar.default_configuration, libViewTopBar);

		// Content views (rendered into the content area by the router)
		this.pict.addView('HarnessApp-Dashboard', libViewDashboard.default_configuration, libViewDashboard);
		this.pict.addView('HarnessApp-Books', libViewBooks.default_configuration, libViewBooks);
		this.pict.addView('HarnessApp-Users', libViewUsers.default_configuration, libViewUsers);
	}

	onAfterInitializeAsync(fCallback)
	{
		// Render the login form first
		this.pict.views['HarnessApp-Login'].render();

		// Inject CSS so the login section styling is applied immediately
		this.pict.CSSMap.injectCSS();

		// Check if a session already exists (e.g. cookie from a previous visit).
		// The login view's onSessionChecked hook will call showProtectedApp()
		// if a valid session is found.
		this.pict.views['HarnessApp-Login'].checkSession();

		return super.onAfterInitializeAsync(fCallback);
	}

	// ===== Application-Level Navigation =====

	/**
	 * Switch from the login screen to the protected application.
	 * Called by the login view after a successful login or session check.
	 */
	showProtectedApp()
	{
		// Hide the login container
		let tmpLoginElements = this.pict.ContentAssignment.getElement('#HarnessApp-Login-Container');
		if (tmpLoginElements && tmpLoginElements.length > 0)
		{
			tmpLoginElements[0].style.display = 'none';
		}

		// Show the protected app container
		let tmpAppElements = this.pict.ContentAssignment.getElement('#HarnessApp-Container');
		if (tmpAppElements && tmpAppElements.length > 0)
		{
			tmpAppElements[0].style.display = 'block';
		}

		// Render the layout shell (triggers TopBar, Dashboard, CSS injection, and router resolve)
		this.pict.views['HarnessApp-Layout'].render();
	}

	/**
	 * Switch from the protected application back to the login screen.
	 * Called by the doLogout() method after the session is destroyed.
	 */
	showLogin()
	{
		// Clear session data
		this.pict.AppData.Session = null;

		// Hide the protected app container
		let tmpAppElements = this.pict.ContentAssignment.getElement('#HarnessApp-Container');
		if (tmpAppElements && tmpAppElements.length > 0)
		{
			tmpAppElements[0].style.display = 'none';
		}

		// Show the login container and re-render
		let tmpLoginElements = this.pict.ContentAssignment.getElement('#HarnessApp-Login-Container');
		if (tmpLoginElements && tmpLoginElements.length > 0)
		{
			tmpLoginElements[0].style.display = 'block';
		}

		// Reset the login view state and re-render
		let tmpLoginView = this.pict.views['HarnessApp-Login'];
		if (tmpLoginView)
		{
			tmpLoginView.authenticated = false;
			tmpLoginView.sessionData = null;
			tmpLoginView.initialRenderComplete = false;
			tmpLoginView.render();
		}
	}

	/**
	 * Render a specific content view into the content container.
	 * Called by the router when a route template matches.
	 *
	 * @param {string} pViewIdentifier - The view identifier to render
	 */
	showView(pViewIdentifier)
	{
		if (pViewIdentifier in this.pict.views)
		{
			this.pict.views[pViewIdentifier].render();
		}
		else
		{
			this.pict.log.warn('View [' + pViewIdentifier + '] not found; falling back to Dashboard.');
			this.pict.views['HarnessApp-Dashboard'].render();
		}
	}

	/**
	 * Navigate to a route using pict-router.
	 *
	 * @param {string} pRoute - The route path (e.g. '/Dashboard', '/Books')
	 */
	navigateTo(pRoute)
	{
		this.pict.providers.PictRouter.navigate(pRoute);
	}

	/**
	 * Log out and return to the login screen.
	 * Called from the TopBar logout button.
	 */
	doLogout()
	{
		let tmpLoginView = this.pict.views['HarnessApp-Login'];
		if (tmpLoginView)
		{
			tmpLoginView.logout(() =>
			{
				this.showLogin();
			});
		}
		else
		{
			this.showLogin();
		}
	}
}

module.exports = HarnessAppApplication;

module.exports.default_configuration = require('./Harness-App-Configuration.json');
