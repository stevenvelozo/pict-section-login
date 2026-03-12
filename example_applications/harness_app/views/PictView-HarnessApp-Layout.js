const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "HarnessApp-Layout",

	DefaultRenderable: "HarnessApp-Layout-Shell",
	DefaultDestinationAddress: "#HarnessApp-Container",

	AutoRender: false,

	CSS: /*css*/`
		#HarnessApp-Container
		{
			display: flex;
			flex-direction: column;
			min-height: 100vh;
		}
		#HarnessApp-TopBar-Container
		{
			flex-shrink: 0;
		}
		#HarnessApp-Content-Container
		{
			flex: 1;
			padding: 1.5rem;
			max-width: 1100px;
			width: 100%;
			margin: 0 auto;
			box-sizing: border-box;
		}
	`,

	Templates:
	[
		{
			Hash: "HarnessApp-Layout-Shell-Template",
			Template: /*html*/`
<div id="HarnessApp-TopBar-Container"></div>
<div id="HarnessApp-Content-Container"></div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "HarnessApp-Layout-Shell",
			TemplateHash: "HarnessApp-Layout-Shell-Template",
			DestinationAddress: "#HarnessApp-Container",
			RenderMethod: "replace"
		}
	]
};

class HarnessAppLayoutView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Render the top bar
		this.pict.views['HarnessApp-TopBar'].render();

		// Inject all CSS
		this.pict.CSSMap.injectCSS();

		// If the URL contains a deep-link hash route (e.g. #/Books from a
		// pasted bookmark), navigateCurrent() will navigate to it.
		// Otherwise, show Dashboard as the default content and resolve.
		if (this.pict.providers.PictRouter && !this.pict.providers.PictRouter.navigateCurrent())
		{
			this.pict.views['HarnessApp-Dashboard'].render();
			this.pict.providers.PictRouter.resolve();
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = HarnessAppLayoutView;

module.exports.default_configuration = _ViewConfiguration;
