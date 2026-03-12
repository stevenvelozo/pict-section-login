const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "HarnessApp-Dashboard",

	DefaultRenderable: "HarnessApp-Dashboard-Content",
	DefaultDestinationAddress: "#HarnessApp-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.harnessapp-dashboard h1
		{
			font-size: 1.8rem;
			margin: 0 0 0.5rem 0;
			color: #264653;
		}
		.harnessapp-dashboard p
		{
			font-size: 1rem;
			line-height: 1.6;
			color: #555;
			max-width: 640px;
			margin: 0 0 1.5rem 0;
		}
		.harnessapp-dashboard-cards
		{
			display: flex;
			gap: 1.25rem;
			flex-wrap: wrap;
		}
		.harnessapp-dashboard-card
		{
			flex: 1;
			min-width: 220px;
			background: #fff;
			border: 1px solid #D4A373;
			border-top: 4px solid #E76F51;
			border-radius: 6px;
			padding: 1.25rem;
			cursor: pointer;
			transition: box-shadow 0.15s, transform 0.15s;
			box-shadow: 0 2px 8px rgba(38,70,83,0.08);
		}
		.harnessapp-dashboard-card:hover
		{
			box-shadow: 0 4px 16px rgba(38,70,83,0.15);
			transform: translateY(-2px);
		}
		.harnessapp-dashboard-card h3
		{
			margin: 0 0 0.5rem;
			color: #E76F51;
			font-size: 1.05rem;
		}
		.harnessapp-dashboard-card p
		{
			margin: 0;
			font-size: 0.9rem;
			color: #666;
		}
		.harnessapp-dashboard-session-info
		{
			background: #264653;
			color: #FAEDCD;
			border-radius: 6px;
			padding: 0.8rem 1rem;
			font-size: 0.85rem;
			margin-bottom: 1.5rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
		.harnessapp-dashboard-session-info .badge
		{
			background: #E76F51;
			color: #fff;
			font-size: 0.7rem;
			font-weight: 700;
			padding: 0.15rem 0.5rem;
			border-radius: 9999px;
		}
	`,

	Templates:
	[
		{
			Hash: "HarnessApp-Dashboard-Template",
			Template: /*html*/`
<div class="harnessapp-dashboard">
	<h1>Dashboard</h1>
	<div class="harnessapp-dashboard-session-info" id="HarnessApp-Dashboard-SessionInfo"></div>
	<p>
		Welcome to the Bookstore Harness.  This application demonstrates
		<strong>pict-section-login</strong> combined with <strong>pict-router</strong>
		for route-based navigation with authentication.
	</p>
	<div class="harnessapp-dashboard-cards">
		<div class="harnessapp-dashboard-card" onclick="{~P~}.PictApplication.navigateTo('/Books')">
			<h3>Books</h3>
			<p>Browse the book catalog from the Meadow ORM.</p>
		</div>
		<div class="harnessapp-dashboard-card" onclick="{~P~}.PictApplication.navigateTo('/Users')">
			<h3>Users</h3>
			<p>View registered users in the system.</p>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "HarnessApp-Dashboard-Content",
			TemplateHash: "HarnessApp-Dashboard-Template",
			DestinationAddress: "#HarnessApp-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class HarnessAppDashboardView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Populate session info banner
		let tmpSession = this.pict.AppData.Session;
		let tmpInfoElements = this.services.ContentAssignment.getElement('#HarnessApp-Dashboard-SessionInfo');
		if (tmpInfoElements && tmpInfoElements.length > 0 && tmpSession && tmpSession.UserRecord)
		{
			let tmpUser = tmpSession.UserRecord;
			let tmpHTML = 'Logged in as <strong>' + (tmpUser.FullName || tmpUser.LoginID || '') + '</strong>';
			if (tmpUser.IDUser)
			{
				tmpHTML += ' <span class="badge">ID ' + tmpUser.IDUser + '</span>';
			}
			if (tmpUser.Email)
			{
				tmpHTML += '&nbsp;&nbsp;' + tmpUser.Email;
			}
			tmpInfoElements[0].innerHTML = tmpHTML;
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = HarnessAppDashboardView;

module.exports.default_configuration = _ViewConfiguration;
