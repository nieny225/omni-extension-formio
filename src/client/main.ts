//import './css/bootstrap-icons_font_bootstrap-icons.css'
import {OmniSDKClient} from 'omni-sdk';
const sdk = new OmniSDKClient("omni-extension-formio").init();
import './reset.css'
import './node_modules/bootstrap/dist/css/bootstrap.min.css'
import './node_modules/@formio/js/dist/formio.full.min.css'
import './style.css'
//@ts-ignore
import { Formio } from '@formio/js';
declare global {
  interface Window {
    ace: any;
    Ace: any;
  }
}


// ---------------------------------------------------------------------------------------------
// @formio/js downloads ACE if it's not found locally. Since we don't want to be internet
// dependent, we bundle it here.
// ---------------------------------------------------------------------------------------------
const Ace = require("ace-builds/src-noconflict/ace");
const modeHtmlFile = require("ace-builds/src-noconflict/mode-html.js");

Ace.config.setModuleUrl("ace/mode/html", modeHtmlFile);

const modeJsonFile = require("ace-builds/src-noconflict/mode-json.js");
Ace.config.setModuleUrl("ace/mode/json", modeJsonFile);

const xcodeFile = require("ace-builds/src-noconflict/theme-xcode.js");
Ace.config.setModuleUrl("ace/theme/xcode", xcodeFile);

const htmlWorkerFile = require("ace-builds/src-noconflict/worker-html.js");
Ace.config.setModuleUrl("ace/mode/html_worker", htmlWorkerFile);

const jsonWorkerFile = require("ace-builds/src-noconflict/worker-json.js");
Ace.config.setModuleUrl("ace/mode/json_worker", jsonWorkerFile);

Ace.config.set("basePath", "ace/");
Ace.config.set("loadWorkerFromBlob", false);

window.ace = Ace;
window.Ace = Ace;

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

const boot = async () =>
{
  const result =  (await sdk.runExtensionScript('recipe',  {recipe:sdk.args.recipe}))

  const ui:any = Object.values(result.recipe.rete.nodes).find((n:any) => n.name === 'omni-extension-formio:formio.auto_ui')
  const myForm:any =  {

  }
  myForm.components = JSON.parse( ui.data.source || "[]")


Object.values(myForm.components).forEach((v:any) =>
  {
    form.builder.custom.components[v.key] =
    {
      title: v.label,
      key: v.key,
      icon: 'terminal',
      schema: v
    }
  }
)

//@ts-ignore
Formio.builder(document.getElementById('builder'), myForm,form).then(function(builder) {
  builder.on('saveComponent', async function() {


    const result =  (await sdk.runExtensionScript('saveEdits',  {schema:builder.schema}))

    console.log(builder.schema);
  });
});
}

boot()