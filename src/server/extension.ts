import FormioBuilderComponent from "./Formio_ui.js";

let components = [FormioBuilderComponent];

export default {
  createComponents: () => ({
    blocks: components,
    patches: []
  })
}