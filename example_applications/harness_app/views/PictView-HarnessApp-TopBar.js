const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "HarnessApp-TopBar",

	DefaultRenderable: "HarnessApp-TopBar-Content",
	DefaultDestinationAddress: "#HarnessApp-TopBar-Container",

	AutoRender: false,

	CSS: /*css*/`
		.harnessapp-topbar
		{
			display: flex;
			align-items: center;
			justify-content: space-between;
			background: #264653;
			color: #FAEDCD;
			padding: 0 1.25rem;
			height: 52px;
			border-bottom: 3px solid #E76F51;
		}
		.harnessapp-topbar-brand
		{
			font-size: 1.15rem;
			font-weight: 700;
			color: #E76F51;
			text-decoration: none;
			cursor: pointer;
			letter-spacing: 0.02em;
		}
		.harnessapp-topbar-brand:hover
		{
			color: #F4845F;
		}
		.harnessapp-topbar-nav
		{
			display: flex;
			align-items: center;
			gap: 0.15rem;
		}
		.harnessapp-topbar-nav a
		{
			color: #D4A373;
			text-decoration: none;
			padding: 0.4rem 0.75rem;
			border-radius: 4px;
			font-size: 0.85rem;
			cursor: pointer;
			transition: background-color 0.15s, color 0.15s;
		}
		.harnessapp-topbar-nav a:hover
		{
			background: #1A3340;
			color: #FAEDCD;
		}
		.harnessapp-topbar-session
		{
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-size: 0.8rem;
			color: #D4A373;
		}
		.harnessapp-topbar-session .dot
		{
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: #2A9D8F;
			box-shadow: 0 0 4px rgba(42,157,143,0.5);
		}
		.harnessapp-topbar-logout
		{
			background: #E76F51;
			color: #fff;
			border: none;
			padding: 0.3rem 0.8rem;
			border-radius: 4px;
			font-size: 0.75rem;
			font-weight: 600;
			cursor: pointer;
			margin-left: 0.25rem;
		}
		.harnessapp-topbar-logout:hover
		{
			background: #C45A3E;
		}
	`,

	Templates:
	[
		{
			Hash: "HarnessApp-TopBar-Template",
			Template: /*html*/`
<div class="harnessapp-topbar">
	<a class="harnessapp-topbar-brand" onclick="{~P~}.PictApplication.navigateTo('/Dashboard')">Bookstore</a>
	<div class="harnessapp-topbar-nav">
		<a onclick="{~P~}.PictApplication.navigateTo('/Dashboard')">Dashboard</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/Books')">Books</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/Users')">Users</a>
	</div>
	<div class="harnessapp-topbar-session">
		<span class="dot"></span>
		<span id="HarnessApp-TopBar-UserName"></span>
		<button class="harnessapp-topbar-logout" type="button" onclick="{~P~}.PictApplication.doLogout()">Log out</button>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "HarnessApp-TopBar-Content",
			TemplateHash: "HarnessApp-TopBar-Template",
			DestinationAddress: "#HarnessApp-TopBar-Container",
			RenderMethod: "replace"
		}
	]
};

class HarnessAppTopBarView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Populate the user name from session data
		let tmpSession = this.pict.AppData.Session;
		let tmpDisplayName = '';

		if (tmpSession && tmpSession.UserRecord)
		{
			tmpDisplayName = tmpSession.UserRecord.FullName
				|| tmpSession.UserRecord.LoginID
				|| '';
		}

		let tmpUserNameElements = this.services.ContentAssignment.getElement('#HarnessApp-TopBar-UserName');
		if (tmpUserNameElements && tmpUserNameElements.length > 0)
		{
			tmpUserNameElements[0].textContent = tmpDisplayName;
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = HarnessAppTopBarView;

module.exports.default_configuration = _ViewConfiguration;
