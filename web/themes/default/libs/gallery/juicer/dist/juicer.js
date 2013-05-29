define("gallery/juicer/0.6.4/juicer",[],function(a,b,c){(function(){var a=function(){var b=[].slice.call(arguments);return b.push(a.options),b[0].match(/^\s*#([\w:\-\.]+)\s*$/gim)&&b[0].replace(/^\s*#([\w:\-\.]+)\s*$/gim,function(a,c){var d=document,e=d&&d.getElementById(c);b[0]=e?e.value||e.innerHTML:a}),1==arguments.length?a.compile.apply(a,b):arguments.length>=2?a.to_html.apply(a,b):void 0},b={escapehash:{"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#x27;","/":"&#x2f;"},escapereplace:function(a){return b.escapehash[a]},escaping:function(a){return"string"!=typeof a?a:a.replace(/[&<>"]/gim,this.escapereplace)},detection:function(a){return a===void 0?"":a}},d=function(a){if("undefined"!=typeof console){if(console.warn)return console.warn(a),void 0;if(console.log)return console.log(a),void 0}throw a},e=function(a,b){if(a=a!==Object(a)?{}:a,a.__proto__)return a.__proto__=b,a;var c=function(){},d=Object.create?Object.create(b):new(c.prototype=b,c);for(var e in a)a.hasOwnProperty(e)&&(d[e]=a[e]);return d};a.__cache={},a.version="0.6.4-stable",a.settings={},a.tags={operationOpen:"{@",operationClose:"}",interpolateOpen:"\\${",interpolateClose:"}",noneencodeOpen:"\\$\\${",noneencodeClose:"}",commentOpen:"\\{#",commentClose:"\\}"},a.options={cache:!0,strip:!0,errorhandling:!0,detection:!0,_method:e({__escapehtml:b,__throw:d,__juicer:a},{})},a.tagInit=function(){var b=a.tags.operationOpen+"each\\s*([^}]*?)\\s*as\\s*(\\w*?)\\s*(,\\s*\\w*?)?"+a.tags.operationClose,c=a.tags.operationOpen+"\\/each"+a.tags.operationClose,d=a.tags.operationOpen+"if\\s*([^}]*?)"+a.tags.operationClose,e=a.tags.operationOpen+"\\/if"+a.tags.operationClose,f=a.tags.operationOpen+"else"+a.tags.operationClose,g=a.tags.operationOpen+"else if\\s*([^}]*?)"+a.tags.operationClose,h=a.tags.interpolateOpen+"([\\s\\S]+?)"+a.tags.interpolateClose,i=a.tags.noneencodeOpen+"([\\s\\S]+?)"+a.tags.noneencodeClose,j=a.tags.commentOpen+"[^}]*?"+a.tags.commentClose,k=a.tags.operationOpen+"each\\s*(\\w*?)\\s*in\\s*range\\(([^}]+?)\\s*,\\s*([^}]+?)\\)"+a.tags.operationClose,l=a.tags.operationOpen+"include\\s*([^}]*?)\\s*,\\s*([^}]*?)"+a.tags.operationClose;a.settings.forstart=RegExp(b,"igm"),a.settings.forend=RegExp(c,"igm"),a.settings.ifstart=RegExp(d,"igm"),a.settings.ifend=RegExp(e,"igm"),a.settings.elsestart=RegExp(f,"igm"),a.settings.elseifstart=RegExp(g,"igm"),a.settings.interpolate=RegExp(h,"igm"),a.settings.noneencode=RegExp(i,"igm"),a.settings.inlinecomment=RegExp(j,"igm"),a.settings.rangestart=RegExp(k,"igm"),a.settings.include=RegExp(l,"igm")},a.tagInit(),a.set=function(a,b){var c=this,d=function(a){return a.replace(/[\$\(\)\[\]\+\^\{\}\?\*\|\.]/gim,function(a){return"\\"+a})},e=function(a,b){var e=a.match(/^tag::(.*)$/i);return e?(c.tags[e[1]]=d(b),c.tagInit(),void 0):(c.options[a]=b,void 0)};if(2===arguments.length)return e(a,b),void 0;if(a===Object(a))for(var f in a)a.hasOwnProperty(f)&&e(f,a[f])},a.register=function(a,b){var c=this.options._method;return c.hasOwnProperty(a)?!1:c[a]=b},a.unregister=function(a){var b=this.options._method;return b.hasOwnProperty(a)?delete b[a]:void 0},a.template=function(b){var c=this;this.options=b,this.__interpolate=function(a,b,c){var f,d=a.split("|"),e=d[0]||"";return d.length>1&&(a=d.shift(),f=d.shift().split(","),e="_method."+f.shift()+".call({}, "+[a].concat(f)+")"),"<%= "+(b?"_method.__escapehtml.escaping":"")+"("+(c&&c.detection===!1?"":"_method.__escapehtml.detection")+"("+e+")"+")"+" %>"},this.__removeShell=function(b,d){var e=0;return b=b.replace(a.settings.forstart,function(a,b,c,d){var c=c||"value",d=d&&d.substr(1),f="i"+e++;return"<% ~function() {for(var "+f+" in "+b+") {"+"if("+b+".hasOwnProperty("+f+")) {"+"var "+c+"="+b+"["+f+"];"+(d?"var "+d+"="+f+";":"")+" %>"}).replace(a.settings.forend,"<% }}}(); %>").replace(a.settings.ifstart,function(a,b){return"<% if("+b+") { %>"}).replace(a.settings.ifend,"<% } %>").replace(a.settings.elsestart,function(){return"<% } else { %>"}).replace(a.settings.elseifstart,function(a,b){return"<% } else if("+b+") { %>"}).replace(a.settings.noneencode,function(a,b){return c.__interpolate(b,!1,d)}).replace(a.settings.interpolate,function(a,b){return c.__interpolate(b,!0,d)}).replace(a.settings.inlinecomment,"").replace(a.settings.rangestart,function(a,b,c,d){var f="j"+e++;return"<% ~function() {for(var "+f+"="+c+";"+f+"<"+d+";"+f+"++) {{"+"var "+b+"="+f+";"+" %>"}).replace(a.settings.include,function(a,b,c){return"<%= _method.__juicer("+b+", "+c+"); %>"}),d&&d.errorhandling===!1||(b="<% try { %>"+b,b+='<% } catch(e) {_method.__throw("Juicer Render Exception: "+e.message);} %>'),b},this.__toNative=function(a,b){return this.__convert(a,!b||b.strip)},this.__lexicalAnalyze=function(b){var c=[],d=[],e="",f=["if","each","_","_method","console","break","case","catch","continue","debugger","default","delete","do","finally","for","function","in","instanceof","new","return","switch","this","throw","try","typeof","var","void","while","with","null","typeof","class","enum","export","extends","import","super","implements","interface","let","package","private","protected","public","static","yield","const","arguments","true","false","undefined","NaN"],g=function(a,b){if(Array.prototype.indexOf&&a.indexOf===Array.prototype.indexOf)return a.indexOf(b);for(var c=0;a.length>c;c++)if(a[c]===b)return c;return-1},h=function(b,e){if(e=e.match(/\w+/gim)[0],-1===g(c,e)&&-1===g(f,e)&&-1===g(d,e)){if("undefined"!=typeof window&&"function"==typeof window[e]&&(""+window[e]).match(/^\s*?function \w+\(\) \{\s*?\[native code\]\s*?\}\s*?$/i))return b;if("undefined"!=typeof global&&"function"==typeof global[e]&&(""+global[e]).match(/^\s*?function \w+\(\) \{\s*?\[native code\]\s*?\}\s*?$/i))return b;if("function"==typeof a.options._method[e])return d.push(e),b;c.push(e)}return b};b.replace(a.settings.forstart,h).replace(a.settings.interpolate,h).replace(a.settings.ifstart,h).replace(a.settings.elseifstart,h).replace(a.settings.include,h).replace(/[\+\-\*\/%!\?\|\^&~<>=,\(\)]\s*([A-Za-z_]+)/gim,h);for(var i=0;c.length>i;i++)e+="var "+c[i]+"=_."+c[i]+";";for(var i=0;d.length>i;i++)e+="var "+d[i]+"=_method."+d[i]+";";return"<% "+e+" %>"},this.__convert=function(a,b){var c=[].join("");return c+="'use strict';",c+="var _=_||{};",c+="var _out='';_out+='",c+=b!==!1?a.replace(/\\/g,"\\\\").replace(/[\r\t\n]/g," ").replace(/'(?=[^%]*%>)/g,"	").split("'").join("\\'").split("	").join("'").replace(/<%=(.+?)%>/g,"';_out+=$1;_out+='").split("<%").join("';").split("%>").join("_out+='")+"';return _out;":a.replace(/\\/g,"\\\\").replace(/[\r]/g,"\\r").replace(/[\t]/g,"\\t").replace(/[\n]/g,"\\n").replace(/'(?=[^%]*%>)/g,"	").split("'").join("\\'").split("	").join("'").replace(/<%=(.+?)%>/g,"';_out+=$1;_out+='").split("<%").join("';").split("%>").join("_out+='")+"';return _out.replace(/[\\r\\n]\\s+[\\r\\n]/g, '\\r\\n');"},this.parse=function(a,b){var d=this;return b&&b.loose===!1||(a=this.__lexicalAnalyze(a)+a),a=this.__removeShell(a,b),a=this.__toNative(a,b),this._render=Function("_, _method",a),this.render=function(a,b){return b&&b===c.options._method||(b=e(b,c.options._method)),d._render.call(this,a,b)},this}},a.compile=function(a,b){b&&b===this.options||(b=e(b,this.options));try{var c=this.__cache[a]?this.__cache[a]:new this.template(this.options).parse(a,b);return b&&b.cache===!1||(this.__cache[a]=c),c}catch(f){return d("Juicer Compile Exception: "+f.message),{render:function(){}}}},a.to_html=function(a,b,c){return c&&c===this.options||(c=e(c,this.options)),this.compile(a,c).render(b,c._method)},c!==void 0&&c.exports?c.exports=a:this.juicer=a})()});