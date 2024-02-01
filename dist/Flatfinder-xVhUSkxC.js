const r={kind:"Document",definitions:[{kind:"FragmentDefinition",name:{kind:"Name",value:"FlatfinderBase"},typeCondition:{kind:"NamedType",name:{kind:"Name",value:"Flatfinder"}},directives:[],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"},arguments:[],directives:[]},{kind:"Field",name:{kind:"Name",value:"name"},arguments:[],directives:[]},{kind:"Field",name:{kind:"Name",value:"isEntry"},arguments:[],directives:[]},{kind:"Field",name:{kind:"Name",value:"image"},arguments:[],directives:[],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"url"},arguments:[],directives:[]},{kind:"Field",name:{kind:"Name",value:"dimensions"},arguments:[],directives:[]}]}},{kind:"Field",name:{kind:"Name",value:"parent"},arguments:[],directives:[],selectionSet:{kind:"SelectionSet",selections:[{kind:"Field",name:{kind:"Name",value:"id"},arguments:[],directives:[]}]}}]}}],loc:{start:0,end:153}};r.loc.source={body:`
                fragment FlatfinderBase on Flatfinder {
  id
  name
  isEntry
  image {
    url
    dimensions
  }
  parent {
    id
  }
}

            `,name:"GraphQL request",locationOffset:{line:1,column:1}};function s(e,i){if(e.kind==="FragmentSpread")i.add(e.name.value);else if(e.kind==="VariableDefinition"){const n=e.type;n.kind==="NamedType"&&i.add(n.name.value)}e.selectionSet&&e.selectionSet.selections.forEach(function(n){s(n,i)}),e.variableDefinitions&&e.variableDefinitions.forEach(function(n){s(n,i)}),e.definitions&&e.definitions.forEach(function(n){s(n,i)})}const l={};(function(){r.definitions.forEach(function(e){if(e.name){const i=new Set;s(e,i),l[e.name.value]=i}})})();function f(e,i){for(let n=0;n<e.definitions.length;n++){const a=e.definitions[n];if(a.name&&a.name.value==i)return a}}function u(e,i){const n={kind:e.kind,definitions:[f(e,i)]};e.hasOwnProperty("loc")&&(n.loc=e.loc);const a=l[i]||new Set,c=new Set;let d=new Set;for(a.forEach(function(o){d.add(o)});d.size>0;){const o=d;d=new Set,o.forEach(function(t){c.has(t)||(c.add(t),(l[t]||new Set).forEach(function(m){d.add(m)}))})}return c.forEach(function(o){const t=f(e,o);t&&n.definitions.push(t)}),n}u(r,"FlatfinderBase");export{r as default};
