//import './css/bootstrap-icons_font_bootstrap-icons.css'
import {OmniSDKClient} from 'omni-sdk';
const sdk = new OmniSDKClient("omni-extension-formio").init();
import './reset.css'
import './node_modules/bootstrap/dist/css/bootstrap.min.css'
import './node_modules/@formio/js/dist/formio.form.min.js'
import './node_modules/@formio/js/dist/formio.form.min.css'
import './style.css'

//@ts-ignore
import { Formio } from '@formio/js';
declare global {
  interface Window {

  }
}



 const form:any =  {
  builder: {
    premium: false,
    data: false,
    custom: {
      default: true,
      title: 'Recipe Inputs',
      weight: 0,
      components: {

      }
    },
    layout: {
      components: {
        table: true
      }
    }
  },
  editForm: {
    textfield: [
      {
        key: 'api',
        ignore: true
      }
    ]
  }
}




//const myForm = JSON.parse(window.localStorage.getItem('test-form') || "{}")


const build = async () => {

  const result =  (await sdk.runExtensionScript('recipe',  {recipe:sdk.args.recipe}))

  const ui:any = Object.values(result.recipe.rete.nodes).find((n:any) => n.name === 'omni-extension-formio:formio.auto_ui')
  const myForm: any =  {
    alerts: {
      submitMessage: ''
    }


  }
  myForm.components = JSON.parse( ui.data.source.trim() || "[]")
  const theForm = await Formio.createForm(document.getElementById('formio'), myForm);

  theForm.on('submit', async (ev) => {

    const args = ev.data
    delete args.submit

    const payload:any = {
      action: 'run',
      args: args
    }
    if (sdk.args.recipe)  payload.recipe = { id: sdk.args.recipe.id, version: sdk.args.recipe.version }
    if (sdk.args.block)  payload.block = { id: sdk.args.block.name}
    //this.busy = true
    const result = await sdk.runExtensionScript('run',  payload)

    //this.busy = false
    console.log(JSON.stringify(ev,null, 2))
    //reset the form
    theForm.submission = {data: args}
    theForm.emit('submitDone');


  });
}

build()