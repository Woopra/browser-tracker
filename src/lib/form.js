const TYPE_BUTTON = 'button';
const TYPE_SUBMIT = 'submit';
const TYPE_RESET = 'reset';

// https://code.google.com/p/form-serialize/
// modified to return an object
export function serializeForm(form, options = {}) {
  if (!form || form.nodeName !== 'FORM') {
    return;
  }

  const exclude = options.exclude || [];
  const data = {};

  for (let i = form.elements.length - 1; i >= 0; i = i - 1) {
    if (
      form.elements[i].name === '' ||
      exclude.indexOf(form.elements[i].name) > -1
    ) {
      continue;
    }
    switch (form.elements[i].nodeName) {
      case 'INPUT':
        switch (form.elements[i].type) {
          case 'text':
          case 'hidden':
          case TYPE_BUTTON:
          case TYPE_RESET:
          case TYPE_SUBMIT:
            data[form.elements[i].name] = form.elements[i].value;
            break;
          case 'checkbox':
          case 'radio':
            if (form.elements[i].checked) {
              data[form.elements[i].name] = form.elements[i].value;
            }
            break;
          case 'file':
            break;
        }
        break;
      case 'TEXTAREA':
        data[form.elements[i].name] = form.elements[i].value;
        break;
      case 'SELECT':
        switch (form.elements[i].type) {
          case 'select-one':
            data[form.elements[i].name] = form.elements[i].value;
            break;
          case 'select-multiple':
            for (
              let j = form.elements[i].options.length - 1;
              j >= 0;
              j = j - 1
            ) {
              if (form.elements[i].options[j].selected) {
                data[form.elements[i].name] = form.elements[i].options[j].value;
              }
            }
            break;
        }
        break;
      case 'BUTTON':
        switch (form.elements[i].type) {
          case TYPE_RESET:
          case TYPE_SUBMIT:
          case TYPE_BUTTON:
            data[form.elements[i].name] = form.elements[i].value;
            break;
        }
        break;
    }
  }
  return data;
}
