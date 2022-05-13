
const modules = {
  'd3': require('d3/dist/d3.js'),
  'cephes': require('cephes'),
  'distributions': require('distributions'),
  'jstat': require('jstat'),
  'summary': require('summary'),
  'ttest': require('ttest'),
  './student_t_custom': require('./student_t_custom.js'),
  './beta': require('./beta.js'),
  './manage_state': require('./manage_state.js'),
  './plot': require('./plot.js')
};

window.require = function (name) {
  if (modules.hasOwnProperty(name)) {
    return modules[name];
  }

  throw new Error('module ' + name + ' not bundled');
};
