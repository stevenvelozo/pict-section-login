const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "HarnessApp-Users",

	DefaultRenderable: "HarnessApp-Users-Content",
	DefaultDestinationAddress: "#HarnessApp-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.harnessapp-users h1
		{
			font-size: 1.8rem;
			margin: 0 0 1rem 0;
			color: #264653;
		}
		.harnessapp-users-grid
		{
			display: flex;
			gap: 1rem;
			flex-wrap: wrap;
		}
		.harnessapp-user-card
		{
			background: #fff;
			border: 1px solid #D4A373;
			border-radius: 6px;
			padding: 1rem 1.25rem;
			min-width: 200px;
			flex: 0 0 auto;
			box-shadow: 0 2px 8px rgba(38,70,83,0.08);
			display: flex;
			align-items: center;
			gap: 0.75rem;
		}
		.harnessapp-user-card-avatar
		{
			width: 36px;
			height: 36px;
			border-radius: 50%;
			background: #264653;
			color: #FAEDCD;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: 700;
			font-size: 0.85rem;
			flex-shrink: 0;
		}
		.harnessapp-user-card-info
		{
			font-size: 0.85rem;
			color: #264653;
		}
		.harnessapp-user-card-info .login-id
		{
			font-weight: 600;
			font-size: 0.9rem;
		}
		.harnessapp-user-card-info .full-name
		{
			color: #888;
			font-size: 0.8rem;
		}
		.harnessapp-user-card-info .user-id
		{
			background: #264653;
			color: #FAEDCD;
			font-size: 0.65rem;
			font-weight: 700;
			padding: 0.1rem 0.4rem;
			border-radius: 9999px;
			margin-left: 0.25rem;
		}
		.harnessapp-users-loading
		{
			padding: 2rem;
			text-align: center;
			color: #999;
			font-size: 0.9rem;
		}
	`,

	Templates:
	[
		{
			Hash: "HarnessApp-Users-Template",
			Template: /*html*/`
<div class="harnessapp-users">
	<h1>Users</h1>
	<div id="HarnessApp-Users-GridContainer">
		<div class="harnessapp-users-loading">Loading users&hellip;</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "HarnessApp-Users-Content",
			TemplateHash: "HarnessApp-Users-Template",
			DestinationAddress: "#HarnessApp-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class HarnessAppUsersView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this._loadUsers();
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	_loadUsers()
	{
		fetch('/1.0/Demo/Users')
			.then((pResponse) =>
			{
				return pResponse.json();
			})
			.then((pData) =>
			{
				let tmpUsers = (pData && Array.isArray(pData.Users)) ? pData.Users : [];
				this._renderGrid(tmpUsers);
			})
			.catch((pError) =>
			{
				this.log.error('Failed to load users: ' + pError.message);
				let tmpContainer = this.services.ContentAssignment.getElement('#HarnessApp-Users-GridContainer');
				if (tmpContainer && tmpContainer.length > 0)
				{
					tmpContainer[0].innerHTML = '<div class="harnessapp-users-loading">Failed to load users. Is the server running?</div>';
				}
			});
	}

	_renderGrid(pUsers)
	{
		let tmpContainer = this.services.ContentAssignment.getElement('#HarnessApp-Users-GridContainer');
		if (!tmpContainer || tmpContainer.length < 1)
		{
			return;
		}

		if (pUsers.length < 1)
		{
			tmpContainer[0].innerHTML = '<div class="harnessapp-users-loading">No users found.</div>';
			return;
		}

		let tmpHTML = '<div class="harnessapp-users-grid">';

		for (let i = 0; i < pUsers.length; i++)
		{
			let tmpUser = pUsers[i];
			let tmpInitial = (tmpUser.LoginID || '?').charAt(0).toUpperCase();

			tmpHTML += '<div class="harnessapp-user-card">';
			tmpHTML += '<div class="harnessapp-user-card-avatar">' + tmpInitial + '</div>';
			tmpHTML += '<div class="harnessapp-user-card-info">';
			tmpHTML += '<div class="login-id">' + (tmpUser.LoginID || '') + ' <span class="user-id">ID ' + (tmpUser.IDUser || '') + '</span></div>';
			if (tmpUser.FullName)
			{
				tmpHTML += '<div class="full-name">' + tmpUser.FullName + '</div>';
			}
			tmpHTML += '</div>';
			tmpHTML += '</div>';
		}

		tmpHTML += '</div>';
		tmpContainer[0].innerHTML = tmpHTML;
	}
}

module.exports = HarnessAppUsersView;

module.exports.default_configuration = _ViewConfiguration;
