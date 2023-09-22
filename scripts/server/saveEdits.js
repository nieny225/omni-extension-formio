
const script = {
  name: 'get',

  exec: async function (ctx, payload) {


    if (payload.schema)
    {

      const integration = ctx.app.integrations.get('workflow')
      const recipe = await integration.getWorkflow(payload.recipe.id, payload.recipe.version, ctx.userId, true)
      const ui = Object.values(recipe.rete.nodes).find((n) => n.name === 'omni-extension-formio:formio.auto_ui')
      ui.data.source = JSON.stringify(payload.schema)

      await integration.updateWorkflow (
        payload.recipe.id,
        { rete: recipe.rete },
        ctx.userId
      )

      return {ok: true, recipe: recipe}
    }
    return {ok: false, error: 'missing parameter'}
  }
};

export default script;
