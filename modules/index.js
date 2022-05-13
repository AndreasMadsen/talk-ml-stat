
const modules = {
  'd3': require('d3/dist/d3.js'),
  'distributions': require('distributions'),
  'jstat': require('jstat'),
  'summary': require('summary'),
  'ttest': require('ttest'),
  './student_t_custom': require('./student_t_custom.js'),
  './manage_state': require('./manage_state.js')
};

window.require = function (name) {
  if (modules.hasOwnProperty(name)) {
    return modules[name];
  }

  throw new Error('module ' + name + ' not bundled');
};
