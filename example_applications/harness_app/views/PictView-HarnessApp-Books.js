const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "HarnessApp-Books",

	DefaultRenderable: "HarnessApp-Books-Content",
	DefaultDestinationAddress: "#HarnessApp-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.harnessapp-books h1
		{
			font-size: 1.8rem;
			margin: 0 0 1rem 0;
			color: #264653;
		}
		.harnessapp-books-table
		{
			width: 100%;
			border-collapse: collapse;
			background: #fff;
			border: 1px solid #D4A373;
			border-radius: 6px;
			overflow: hidden;
			box-shadow: 0 2px 8px rgba(38,70,83,0.08);
		}
		.harnessapp-books-table th
		{
			background: #264653;
			color: #FAEDCD;
			padding: 0.6rem 0.75rem;
			text-align: left;
			font-size: 0.8rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.04em;
		}
		.harnessapp-books-table td
		{
			padding: 0.55rem 0.75rem;
			border-bottom: 1px solid #E8D9C0;
			font-size: 0.85rem;
			color: #264653;
		}
		.harnessapp-books-table tr:nth-child(even) td
		{
			background: #FFF9F0;
		}
		.harnessapp-books-table tr:hover td
		{
			background: #FAEDCD;
		}
		.harnessapp-books-loading
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
			Hash: "HarnessApp-Books-Template",
			Template: /*html*/`
<div class="harnessapp-books">
	<h1>Books</h1>
	<div id="HarnessApp-Books-TableContainer">
		<div class="harnessapp-books-loading">Loading books&hellip;</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "HarnessApp-Books-Content",
			TemplateHash: "HarnessApp-Books-Template",
			DestinationAddress: "#HarnessApp-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class HarnessAppBooksView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this._loadBooks();
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	_loadBooks()
	{
		fetch('/1.0/Books/FilteredTo/Title~ILK~a/0/25')
			.then((pResponse) =>
			{
				return pResponse.json();
			})
			.then((pData) =>
			{
				let tmpRecords = [];
				if (Array.isArray(pData))
				{
					tmpRecords = pData;
				}
				else if (pData && Array.isArray(pData.Records))
				{
					tmpRecords = pData.Records;
				}

				this._renderTable(tmpRecords);
			})
			.catch((pError) =>
			{
				this.log.error('Failed to load books: ' + pError.message);
				let tmpContainer = this.services.ContentAssignment.getElement('#HarnessApp-Books-TableContainer');
				if (tmpContainer && tmpContainer.length > 0)
				{
					tmpContainer[0].innerHTML = '<div class="harnessapp-books-loading">Failed to load books. Is the server running?</div>';
				}
			});
	}

	_renderTable(pRecords)
	{
		let tmpContainer = this.services.ContentAssignment.getElement('#HarnessApp-Books-TableContainer');
		if (!tmpContainer || tmpContainer.length < 1)
		{
			return;
		}

		if (pRecords.length < 1)
		{
			tmpContainer[0].innerHTML = '<div class="harnessapp-books-loading">No books found.</div>';
			return;
		}

		let tmpHTML = '<table class="harnessapp-books-table">';
		tmpHTML += '<thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Language</th><th>Year</th></tr></thead>';
		tmpHTML += '<tbody>';

		for (let i = 0; i < pRecords.length; i++)
		{
			let tmpBook = pRecords[i];
			tmpHTML += '<tr>';
			tmpHTML += '<td>' + (tmpBook.IDBook || '') + '</td>';
			tmpHTML += '<td>' + (tmpBook.Title || '') + '</td>';
			tmpHTML += '<td>' + (tmpBook.Type || '') + '</td>';
			tmpHTML += '<td>' + (tmpBook.Language || '') + '</td>';
			tmpHTML += '<td>' + (tmpBook.PublishDate || '') + '</td>';
			tmpHTML += '</tr>';
		}

		tmpHTML += '</tbody></table>';
		tmpContainer[0].innerHTML = tmpHTML;
	}
}

module.exports = HarnessAppBooksView;

module.exports.default_configuration = _ViewConfiguration;
