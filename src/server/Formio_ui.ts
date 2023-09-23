/**
 * Copyright (c) 2023 MERCENARIES.AI PTE. LTD.
 * All rights reserved.
 */
//@ts-ignore
import {  OAIBaseComponent, WorkerContext, OmniComponentMacroTypes, OmniComponentFlags, BlockCategory as Category,type OmniIO } from 'omni-sockets'
//@ts-ignore
import { Workflow } from 'omni-shared'
// Define base conversion function for shared properties
function baseConvert(omniIO: Partial<OmniIO>) {
  return {
      "label": omniIO.title || omniIO.name,
      "description": omniIO.description,
      "key": omniIO.name,
      "input": true,
      "defaultValue": omniIO.default
  };
}

// Process OmniIO choices into Formio select values format
function processChoices(choices:any) {
  if (Array.isArray(choices)) {
      // Array of strings or objects with {value, title, description}
      return choices.map(choice => {
          if (typeof choice === 'string') {
              return { "label": choice, "value": choice };
          } else {
              return { "label": choice.title || choice.value, "value": choice.value };
          }
      });
  } else {
      // Handle the block/map/cache structure if necessary
      throw new Error('Complex choice structures not yet supported.');
  }
}

// Handle type-specific properties
function typeSpecificConvert(omniIO: Partial<OmniIO>) {
  if (omniIO.choices) {
      return {
          "type": "select",
          "widget": "choicesjs",
          "tableView": true,
          "data": {
              "values": processChoices(omniIO.choices)
          }
      };
  }
  let type:any = null
  if (omniIO.customSocket)
  {
    switch(omniIO.customSocket) {
      case 'image':
      {
        type = 'textfield'
      }

    }
  }

  switch (omniIO.type) {
      case 'integer':
      case 'float':
      case 'number':
          return {
              "type": "number",
              "validate": {
                  "min": omniIO.minimum,
                  "max": omniIO.maximum
              }
          };
      case 'string':
          return {
              "type": "textarea"
          };
      case 'boolean':
          return {
              "type": "checkbox"
          };
      default:
          if (type)
          {
            return {type}
          }
          throw new Error(`No converter found for type: ${omniIO.type}`);
  }
}

// Main conversion function
function convertOmniIOToFormio(omniIO: Partial<OmniIO>) {
  return {
      ...baseConvert(omniIO),
      ...typeSpecificConvert(omniIO)
  };
}



// The outputs will be Formio structures for 'select' and 'checkbox' types.


let component = OAIBaseComponent
  .create('formio', 'auto_ui')
  .fromScratch()
  .set('description', `This **input block** auto-generates a custom user interface for your recipe using Form.io.
    To add UI elements into the interface, connect any input from other blocks to the *UI Connector* output of this block.
    Build the UI, press the Generate Button. You can also toggle on **Edit Mode**, giving you access to a full form-builder for any connected inputs.
    Please note that adding any new connectors will reset the entire block."`)
  .set('title', 'Form.io Auto UI')
  .set('category', Category.USER_INTERFACE)
  .setFlag(OmniComponentFlags.NO_EXECUTE, true)
  .setFlag(OmniComponentFlags.UNIQUE_PER_WORKFLOW, true)
  .setMethod('X-CUSTOM')
  .setRenderTemplate('simple')


  component.addControl(
    component.createControl('editMode', 'boolean')
    .set('title', 'Edit Form')
    .set('description', 'Enable editing of the form')
    .setControlType('AlpineToggleComponent')
    .toOmniControl()
  )

  component
  .addControl(
    component.createControl('source', 'object')
      .set('title', "Template")
      .set('description', ' ')
      .setRequired(true)
      .setControlType('AlpineCodeMirrorComponent')
      .toOmniControl())

   .addOutput(
    component.createOutput('any', 'object', 'any', {array: true})
      .set('title', 'UI Connector')
      .set('description', 'Connect this socket to any input to create a UI element for it.')
      .toOmniIO()
   )

   .addControl(component.createControl('button')
    .set('title', 'Generate Interface')
    .setControlType('AlpineButtonComponent')
    .setCustom('buttonAction', 'script')
    .setCustom('buttonValue', 'save')
    .set('description', 'Regenerates the interface.')
    .toOmniControl())






   .setMacro(OmniComponentMacroTypes.EXEC, async (payload: any, ctx: WorkerContext) => {
    const input = Object.assign({}, payload, ctx.args || {})

    console.log(
      input
    )

    await ctx.app.emit('component:x-input', input)
    return { ...input } // Include JSON output if applicable
  })


    // The custom_ui block scans for all inputs attached to the any output and creates a
    // custom input for each one.  The custom input is stored in the x-omni-dynamicInputs
    // property of the node data.

   .setMacro(OmniComponentMacroTypes.ON_SAVE, async (node: any,  recipe: Workflow, ctx: {app: any, userId: string}) => {

    const source = node.data.source
    let output = node.outputs["any"]
    if (output.connections.length === 0)
    {
      return
    }

    Object.keys(node.data).forEach((key) => (!key.startsWith('x-omni-') && delete node.data[key]))

    let customInputs:any = {}
    let customOutputs:any = {}

    const components:any = {}
    const inputComponents:any = {}
    const outputComponents:any = {}
    /*if (recipe.meta.pictureUrl)
    {
      newSource += `![Custom UI](/${recipe.meta.pictureUrl})  \n`
    }
    else
    {
      newSource += `### {{ RECIPE recipe.meta.name }} \n`
    }

    newSource += `*{{ RECIPE recipe.meta.description "banner" }}*\n`*/

   /* for (const key in node.outputs)
    {
      if (key !== 'any')
      {
        if (node.outputs[key].connections.length === 0)
        {
          delete node.outputs[key]
          delete node.data["x-omni-dynamicOutputs"]?.[key]
        }
        else
        {
          components[key] = {key}

          //newSource = newSource + `{{ INPUT inputs.${key} }}\n`
        }

      }
    }

    if (output.connections.length === 0)
    {
      //node.data["x-omni-dynamicInputs"] =  customInputs
      //node.data["x-omni-dynamicInputs"] =  customInputs
      //node.data["x-omni-dynamicOutputs"] =  customOutupts

      if (source.length === 0)
      {
        node.data.source = JSON.stringify(components)
      }
      return true
    }*/

    components['x-title'] =
    {
      "label": "Recipe Title",
      "tag": "h3",
      "attrs": [
          {
              "attr": "",
              "value": ""
          }
      ],
      "content": recipe.meta.name,
      "refreshOnChange": false,
      "key": "x-title",
      "type": "htmlelement",
      "input": false,
      "tableView": false
  }

    components['x-desc'] =
    {
      "label": "Recipe Description",
      "tag": "p",
      "attrs": [
          {
              "attr": "",
              "value": ""
          }
      ],
      "content": recipe.meta.description ,
      "refreshOnChange": false,
      "key": "x-desc",
      "type": "htmlelement",
      "input": false,
      "tableView": false
  }



    for (const conn in output.connections) {
      const connection = output.connections[conn]
      const targetNode = recipe.rete.nodes[connection.node]
      const targetBlock = await ctx.app.blocks.getInstance(targetNode.name)


      if (targetBlock)
      {
        let targetIO = targetBlock.inputs[connection.input]
        if (!targetIO)
        {

          if (targetNode.inputs[connection.input] && targetNode.data["x-omni-dynamicInputs"]?.[connection.input])
          {
            targetIO = targetNode.data["x-omni-dynamicInputs"][connection.input]
          }
        }

        if (targetIO)
        {
          const {title, name, type,  customSocket, socketOpts, description, minimum, maximum, step,choices} = targetIO
          const defaultValue = targetIO.default

          inputComponents[name] = {
            ...convertOmniIOToFormio({...targetIO, default: defaultValue}),
          }


          let matchingConn = targetNode.inputs[connection.input]?.connections.find((e:any)=>e.node === node.id && e.output ==='any')
          if (matchingConn)
          {
            matchingConn.output = name
          }

          node.outputs[name] = {}
          node.outputs[name].connections = [{node: targetNode.id, input: name}]


          customOutputs[name] = customInputs[name] =
          {
            title,
            name,
            type,
            default: defaultValue,
            defaultValue,
            description,
            minimum,
            maximum,
            step,
            choices,
            customSocket,
            socketOpts,
            control:
            {
              type: 'AlpineLabelControl'
            }
          }
          node.outputs[name]
        }
      }
    }



    output.connections = []

    node.data["x-omni-dynamicInputs"] =  customInputs
    node.data["x-omni-dynamicOutputs"] =  customOutputs

    outputComponents["outputContent"] = {
        "label": "HTML",
        "tag": "div",
        "content": "Results will show up here!",
        "attrs": [
            {
                "attr": "id",
                "value": "outputContent"
            }
        ],
        "refreshOnChange": false,
        "key": "outputContent",
        "type": "htmlelement",
        "input": false,
        "tableView": false
    }

    const finalTree:any = {}
    finalTree.components = Object.values(components)
    finalTree.components.push(
      {
        "input": false,
        "key": "tabs",
        "label": "Tabs",
        "tableView": false,
        "type": "tabs",
        components: [
          {
            components: Object.values(inputComponents),
            "key": "inputs",
            "label": "Inputs"
          },
          {
            components: Object.values(outputComponents),
            "key": "outputs",
            "label": "Outputs"
          }
        ]
      })
    finalTree.components.push(
     {
        "label": "HTML",
        "tag": "div",
        "content": "&nbsp;",
        "attrs": [
            {
                "attr": "",
                "value": ""
            }
        ],
        "refreshOnChange": false,
        "key": "html",
        "type": "htmlelement",
        "input": false,
        "tableView": false

    },
      {
        "label": "Run Recipe",
        "showValidations": false,
        "disableOnInvalid": true,
        "tableView": true,
        "key": "submit",
        "type": "button",
        "input": true,
      }
    )
    node.data.source = finalTree
    return true

   })



const CustomUIComponent = component.toJSON()
export default CustomUIComponent
