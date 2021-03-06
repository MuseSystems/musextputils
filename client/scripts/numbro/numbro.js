/*!
 * numbro.js
 * version : 1.11.0
 * author : Företagsplatsen AB
 * license : MIT
 * http://www.foretagsplatsen.se
 */
(function(){"use strict";/************************************
        Constructors
    ************************************/
// Numbro prototype object
function a(a){this._value=a}function b(a){return 0===a?1:Math.floor(Math.log(Math.abs(a))/Math.LN10)+1}function c(a){var b,c="";for(b=0;a>b;b++)c+="0";return c}/**
     * Implementation of toFixed() for numbers with exponents
     * This function may return negative representations for zero values e.g. "-0.0"
     */
function d(a,b){var d,e,f,g,h,i,j,k;
// exponent is positive - add zeros after the numbers
// exponent is negative
// tack on the decimal point if needed
// substring off the end to satisfy the precision
// only add percision 0's if the exponent is positive
return k=a.toString(),d=k.split("e")[0],g=k.split("e")[1],e=d.split(".")[0],f=d.split(".")[1]||"",+g>0?k=e+f+c(g-f.length):(h=0>+e?"-0":"0",b>0&&(h+="."),j=c(-1*g-1),i=(j+Math.abs(e)+f).substr(0,b),k=h+i),+g>0&&b>0&&(k+="."+c(b)),k}/**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
     * problems for accounting- and finance-related software.
     *
     * Also removes negative signs for zero-formatted numbers. e.g. -0.01 w/ precision 1 -> 0.0
     */
function e(a,b,c,e){var f,g,h=Math.pow(10,b);
// toFixed returns scientific notation for numbers above 1e21 and below 1e-7
// remove the leading negative sign if it exists and should not be present (e.g. -0.00)
// Multiply up by precision, round accurately, then divide and use native toFixed():
return a.toString().indexOf("e")>-1?(g=d(a,b),"-"===g.charAt(0)&&+g>=0&&(g=g.substr(1))):g=(c(a+"e+"+b)/h).toFixed(b),e&&(f=new RegExp("0{1,"+e+"}$"),g=g.replace(f,"")),g}/************************************
        Formatting
    ************************************/
// determine what type of formatting we need to do
function f(a,b,c){var d,e=b.replace(/\{[^\{\}]*\}/g,"");
// return string
// figure out what kind of format we are dealing with
// currency!!!!!
return d=e.indexOf("$")>-1?h(a,z[B].currency.symbol,b,c):e.indexOf("%")>-1?j(a,b,c):e.indexOf(":")>-1?k(a,b):n(a._value,b,c)}
// revert to number
function g(a,b){var c,d,e,f,g,h=b,i=!1;if(b.indexOf(":")>-1)a._value=l(b);else if(b===C)a._value=0;else{
// see if bytes are there so that we can multiply to the correct number
for("."!==z[B].delimiters.decimal&&(b=b.replace(/\./g,"").replace(z[B].delimiters.decimal,".")),c=new RegExp("[^a-zA-Z]"+z[B].abbreviations.thousand+"(?:\\)|(\\"+z[B].currency.symbol+")?(?:\\))?)?$"),d=new RegExp("[^a-zA-Z]"+z[B].abbreviations.million+"(?:\\)|(\\"+z[B].currency.symbol+")?(?:\\))?)?$"),e=new RegExp("[^a-zA-Z]"+z[B].abbreviations.billion+"(?:\\)|(\\"+z[B].currency.symbol+")?(?:\\))?)?$"),f=new RegExp("[^a-zA-Z]"+z[B].abbreviations.trillion+"(?:\\)|(\\"+z[B].currency.symbol+")?(?:\\))?)?$"),g=1;g<v.length&&!i;++g)b.indexOf(v[g])>-1?i=Math.pow(1024,g):b.indexOf(w[g])>-1&&(i=Math.pow(1e3,g));var j=b.replace(/[^0-9\.]+/g,"");""===j?
// An empty string is not a number.
a._value=NaN:(
// do some math to create our number
a._value=(i?i:1)*(h.match(c)?Math.pow(10,3):1)*(h.match(d)?Math.pow(10,6):1)*(h.match(e)?Math.pow(10,9):1)*(h.match(f)?Math.pow(10,12):1)*(b.indexOf("%")>-1?.01:1)*((b.split("-").length+Math.min(b.split("(").length-1,b.split(")").length-1))%2?1:-1)*Number(j),
// round if we are talking about bytes
a._value=i?Math.ceil(a._value):a._value)}return a._value}function h(a,b,c,d){var e,f,g=c,h=g.indexOf("$"),i=g.indexOf("("),j=g.indexOf("+"),k=g.indexOf("-"),l="",m="";if(-1===g.indexOf("$")?
// Use defaults instead of the format provided
"infix"===z[B].currency.position?(m=b,z[B].currency.spaceSeparated&&(m=" "+m+" ")):z[B].currency.spaceSeparated&&(l=" "):g.indexOf(" $")>-1?(l=" ",g=g.replace(" $","")):g.indexOf("$ ")>-1?(l=" ",g=g.replace("$ ","")):g=g.replace("$",""),f=n(a._value,g,d,m),-1===c.indexOf("$"))
// Use defaults instead of the format provided
switch(z[B].currency.position){case"postfix":f.indexOf(")")>-1?(f=f.split(""),f.splice(-1,0,l+b),f=f.join("")):f=f+l+b;break;case"infix":break;case"prefix":f.indexOf("(")>-1||f.indexOf("-")>-1?(f=f.split(""),e=Math.max(i,k)+1,f.splice(e,0,b+l),f=f.join("")):f=b+l+f;break;default:throw Error('Currency position should be among ["prefix", "infix", "postfix"]')}else
// position the symbol
1>=h?f.indexOf("(")>-1||f.indexOf("+")>-1||f.indexOf("-")>-1?(f=f.split(""),e=1,(i>h||j>h||k>h)&&(e=0),f.splice(e,0,b+l),f=f.join("")):f=b+l+f:f.indexOf(")")>-1?(f=f.split(""),f.splice(-1,0,l+b),f=f.join("")):f=f+l+b;return f}function i(a,b,c,d){return h(a,b,c,d)}function j(a,b,c){var d,e="",f=100*a._value;
// check for space before %
return b.indexOf(" %")>-1?(e=" ",b=b.replace(" %","")):b=b.replace("%",""),d=n(f,b,c),d.indexOf(")")>-1?(d=d.split(""),d.splice(-1,0,e+"%"),d=d.join("")):d=d+e+"%",d}function k(a){var b=Math.floor(a._value/60/60),c=Math.floor((a._value-60*b*60)/60),d=Math.round(a._value-60*b*60-60*c);return b+":"+(10>c?"0"+c:c)+":"+(10>d?"0"+d:d)}function l(a){var b=a.split(":"),c=0;
// turn hours and minutes into seconds and add them all up
// hours
// minutes
// seconds
// minutes
// seconds
return 3===b.length?(c+=60*Number(b[0])*60,c+=60*Number(b[1]),c+=Number(b[2])):2===b.length&&(c+=60*Number(b[0]),c+=Number(b[1])),Number(c)}function m(a,b,c){var d,e,f,g=b[0],h=Math.abs(a);if(h>=c){for(d=1;d<b.length;++d)if(e=Math.pow(c,d),f=Math.pow(c,d+1),h>=e&&f>h){g=b[d],a/=e;break}
// values greater than or equal to [scale] YB never set the suffix
g===b[0]&&(a/=Math.pow(c,b.length-1),g=b[b.length-1])}return{value:a,suffix:g}}function n(a,d,f,g){var h,i,j,k,l,n,o,p,q,r,s,t,u,v,w,x,A=!1,D=!1,E=!1,F="",G=!1,// force abbreviation to thousands
H=!1,// force abbreviation to millions
I=!1,// force abbreviation to billions
J=!1,// force abbreviation to trillions
K=!1,// force abbreviation
L="",M="",N=Math.abs(a),O="",P=!1,Q=!1,R="";
// check if number is zero and a custom zero format has been set
if(0===a&&null!==C)return C;if(!isFinite(a))return""+a;if(0===d.indexOf("{")){var S=d.indexOf("}");if(-1===S)throw Error('Format should also contain a "}"');r=d.slice(1,S),d=d.slice(S+1)}else r="";if(d.indexOf("}")===d.length-1&&d.length){var T=d.indexOf("{");if(-1===T)throw Error('Format should also contain a "{"');s=d.slice(T+1,-1),d=d.slice(0,T+1)}else s="";
// check for min length
var U;
// see if we are formatting
//   binary-decimal bytes (1024 MB), binary bytes (1024 MiB), or decimal bytes (1000 MB)
for(U=-1===d.indexOf(".")?d.match(/([0-9]+).*/):d.match(/([0-9]+)\..*/),w=null===U?-1:U[1].length,-1!==d.indexOf("-")&&(P=!0),d.indexOf("(")>-1?(A=!0,d=d.slice(1,-1)):d.indexOf("+")>-1&&(D=!0,d=d.replace(/\+/g,"")),d.indexOf("a")>-1&&(p=d.split(".")[0].match(/[0-9]+/g)||["0"],p=parseInt(p[0],10),G=d.indexOf("aK")>=0,H=d.indexOf("aM")>=0,I=d.indexOf("aB")>=0,J=d.indexOf("aT")>=0,K=G||H||I||J,d.indexOf(" a")>-1?(F=" ",d=d.replace(" a","")):d=d.replace("a",""),j=b(a),l=j%3,l=0===l?3:l,p&&0!==N&&(n=3*~~((Math.min(p,j)-l)/3),N/=Math.pow(10,n)),j!==p&&(N>=Math.pow(10,12)&&!K||J?(F+=z[B].abbreviations.trillion,a/=Math.pow(10,12)):N<Math.pow(10,12)&&N>=Math.pow(10,9)&&!K||I?(F+=z[B].abbreviations.billion,a/=Math.pow(10,9)):N<Math.pow(10,9)&&N>=Math.pow(10,6)&&!K||H?(F+=z[B].abbreviations.million,a/=Math.pow(10,6)):(N<Math.pow(10,6)&&N>=Math.pow(10,3)&&!K||G)&&(F+=z[B].abbreviations.thousand,a/=Math.pow(10,3))),k=b(a),p&&p>k&&-1===d.indexOf(".")&&(d+="[.]",d+=c(p-k))),x=0;x<y.length;++x)if(h=y[x],d.indexOf(h.marker)>-1){
// check for space before
d.indexOf(" "+h.marker)>-1&&(L=" "),
// remove the marker (with the space if it had one)
d=d.replace(L+h.marker,""),i=m(a,h.suffixes,h.scale),a=i.value,L+=i.suffix;break}if(
// see if ordinal is wanted
d.indexOf("o")>-1&&(
// check for space before
d.indexOf(" o")>-1?(M=" ",d=d.replace(" o","")):d=d.replace("o",""),z[B].ordinal&&(M+=z[B].ordinal(a))),d.indexOf("[.]")>-1&&(E=!0,d=d.replace("[.]",".")),q=d.split(".")[1],t=d.indexOf(","),q){var V=[];if(-1!==q.indexOf("*")?(O=a.toString(),V=O.split("."),V.length>1&&(O=e(a,V[1].length,f))):q.indexOf("[")>-1?(q=q.replace("]",""),q=q.split("["),O=e(a,q[0].length+q[1].length,f,q[1].length)):O=e(a,q.length,f),V=O.split("."),o=V[0],V.length>1&&V[1].length){var W=g?F+g:z[B].delimiters.decimal;O=W+V[1]}else O="";E&&0===Number(O.slice(1))&&(O="")}else o=e(a,0,f);
// format number
return o.indexOf("-")>-1&&(o=o.slice(1),Q=!0),o.length<w&&(o=c(w-o.length)+o),t>-1&&(o=o.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1"+z[B].delimiters.thousands)),0===d.indexOf(".")&&(o=""),u=d.indexOf("("),v=d.indexOf("-"),R=v>u?(A&&Q?"(":"")+(P&&Q||!A&&Q?"-":""):(P&&Q||!A&&Q?"-":"")+(A&&Q?"(":""),r+R+(!Q&&D&&0!==a?"+":"")+o+O+(M?M:"")+(F&&!g?F:"")+(L?L:"")+(A&&Q?")":"")+s}/************************************
        Helpers
    ************************************/
function o(a,b){z[a]=b}function p(a){B=a;var b=z[a].defaults;b&&b.format&&t.defaultFormat(b.format),b&&b.currencyFormat&&t.defaultCurrencyFormat(b.currencyFormat)}function q(){return"undefined"!=typeof process&&void 0===process.browser&&process.title&&(-1!==process.title.indexOf("node")||process.title.indexOf("meteor-tool")>0||"grunt"===process.title||"gulp"===process.title)&&"undefined"!=typeof require}/**
     * Computes the multiplier necessary to make x >= 1,
     * effectively eliminating miscalculations caused by
     * finite precision.
     */
function r(a){var b=a.toString().split(".");return b.length<2?1:Math.pow(10,b[1].length)}/**
     * Given a variable number of arguments, returns the maximum
     * multiplier that must be used to normalize an operation involving
     * all of them.
     */
function s(){var a=Array.prototype.slice.call(arguments);return a.reduce(function(a,b){var c=r(a),d=r(b);return c>d?c:d},-(1/0))}/************************************
        Constants
    ************************************/
var t,u="1.11.0",v=["B","KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"],w=["B","KB","MB","GB","TB","PB","EB","ZB","YB"],x={general:{scale:1024,suffixes:w,marker:"bd"},binary:{scale:1024,suffixes:v,marker:"b"},decimal:{scale:1e3,suffixes:w,marker:"d"}},
// general must be before the others because it reuses their characters!
y=[x.general,x.binary,x.decimal],
// internal storage for culture config files
z={},
// Todo: Remove in 2.0.0
A=z,B="en-US",C=null,D="0,0",E="0$",
// check for nodeJS
F="undefined"!=typeof module&&module.exports,
// default culture
G={delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(a){var b=a%10;return 1===~~(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th"},currency:{symbol:"$",position:"prefix"},defaults:{currencyFormat:",0000 a"},formats:{fourDigits:"0000 a",fullWithTwoDecimals:"$ ,0.00",fullWithTwoDecimalsNoCurrency:",0.00"}};t=function(b){return b=t.isNumbro(b)?b.value():"string"==typeof b||"number"==typeof b?t.fn.unformat(b):NaN,new a(Number(b))},t.version=u,t.isNumbro=function(b){return b instanceof a},t.setLanguage=function(a,b){console.warn("`setLanguage` is deprecated since version 1.6.0. Use `setCulture` instead");var c=a,d=a.split("-")[0],e=null;A[c]||(Object.keys(A).forEach(function(a){e||a.split("-")[0]!==d||(e=a)}),c=e||b||"en-US"),p(c)},t.setCulture=function(a,b){var c=a,d=a.split("-")[1],e=null;z[c]||(d&&Object.keys(z).forEach(function(a){e||a.split("-")[1]!==d||(e=a)}),c=e||b||"en-US"),p(c)},t.language=function(a,b){if(console.warn("`language` is deprecated since version 1.6.0. Use `culture` instead"),!a)return B;if(a&&!b){if(!A[a])throw new Error("Unknown language : "+a);p(a)}return!b&&A[a]||o(a,b),t},t.culture=function(a,b){if(!a)return B;if(a&&!b){if(!z[a])throw new Error("Unknown culture : "+a);p(a)}return!b&&z[a]||o(a,b),t},t.languageData=function(a){if(console.warn("`languageData` is deprecated since version 1.6.0. Use `cultureData` instead"),!a)return A[B];if(!A[a])throw new Error("Unknown language : "+a);return A[a]},t.cultureData=function(a){if(!a)return z[B];if(!z[a])throw new Error("Unknown culture : "+a);return z[a]},t.culture("en-US",G),t.languages=function(){return console.warn("`languages` is deprecated since version 1.6.0. Use `cultures` instead"),A},t.cultures=function(){return z},t.zeroFormat=function(a){C="string"==typeof a?a:null},t.defaultFormat=function(a){D="string"==typeof a?a:"0.0"},t.defaultCurrencyFormat=function(a){E="string"==typeof a?a:"0$"},t.validate=function(a,b){var c,d,e,f,g,h,i,j;if("string"!=typeof a&&(a+="",console.warn&&console.warn("Numbro.js: Value is not string. It has been co-erced to: ",a)),a=a.trim(),a=a.replace(/^[+-]?/,""),a.match(/^\d+$/))return!0;if(""===a)return!1;try{i=t.cultureData(b)}catch(k){i=t.cultureData(t.culture())}return e=i.currency.symbol,g=i.abbreviations,c=i.delimiters.decimal,d="."===i.delimiters.thousands?"\\.":i.delimiters.thousands,j=a.match(/^[^\d\.\,]+/),null!==j&&(a=a.substr(1),j[0]!==e)?!1:(j=a.match(/[^\d]+$/),null!==j&&(a=a.slice(0,-1),j[0]!==g.thousand&&j[0]!==g.million&&j[0]!==g.billion&&j[0]!==g.trillion)?!1:(h=new RegExp(d+"{2}"),a.match(/[^\d.,]/g)?!1:(f=a.split(c),f.length>2?!1:f.length<2?!!f[0].match(/^\d+.*\d$/)&&!f[0].match(h):""===f[0]?!f[0].match(h)&&!!f[1].match(/^\d+$/):1===f[0].length?!!f[0].match(/^\d+$/)&&!f[0].match(h)&&!!f[1].match(/^\d+$/):!!f[0].match(/^\d+.*\d$/)&&!f[0].match(h)&&!!f[1].match(/^\d+$/))))},t.loadLanguagesInNode=function(){console.warn("`loadLanguagesInNode` is deprecated since version 1.6.0. Use `loadCulturesInNode` instead"),t.loadCulturesInNode()},t.loadCulturesInNode=function(){var a=require("./languages");for(var b in a)b&&t.culture(b,a[b])},"function"!=typeof Array.prototype.reduce&&(Array.prototype.reduce=function(a,b){if(null===this||"undefined"==typeof this)throw new TypeError("Array.prototype.reduce called on null or undefined");if("function"!=typeof a)throw new TypeError(a+" is not a function");var c,d,e=this.length>>>0,f=!1;for(1<arguments.length&&(d=b,f=!0),c=0;e>c;++c)this.hasOwnProperty(c)&&(f?d=a(d,this[c],c,this):(d=this[c],f=!0));if(!f)throw new TypeError("Reduce of empty array with no initial value");return d}),t.fn=a.prototype={clone:function(){return t(this)},format:function(a,b){return f(this,a?a:D,void 0!==b?b:Math.round)},formatCurrency:function(a,b){return h(this,z[B].currency.symbol,a?a:E,void 0!==b?b:Math.round)},formatForeignCurrency:function(a,b,c){return i(this,a,b?b:E,void 0!==c?c:Math.round)},unformat:function(a){if("number"==typeof a)return a;if("string"==typeof a){var b=g(this,a);return isNaN(b)?void 0:b}},binaryByteUnits:function(){return m(this._value,x.binary.suffixes,x.binary.scale).suffix},byteUnits:function(){return m(this._value,x.general.suffixes,x.general.scale).suffix},decimalByteUnits:function(){return m(this._value,x.decimal.suffixes,x.decimal.scale).suffix},value:function(){return this._value},valueOf:function(){return this._value},set:function(a){return this._value=Number(a),this},add:function(a){function b(a,b){return a+c*b}var c=s.call(null,this._value,a);return this._value=[this._value,a].reduce(b,0)/c,this},subtract:function(a){function b(a,b){return a-c*b}var c=s.call(null,this._value,a);return this._value=[a].reduce(b,this._value*c)/c,this},multiply:function(a){function b(a,b){var c=s(a,b),d=a*c;return d*=b*c,d/=c*c}return this._value=[this._value,a].reduce(b,1),this},divide:function(a){function b(a,b){var c=s(a,b);return a*c/(b*c)}return this._value=[this._value,a].reduce(b),this},difference:function(a){return Math.abs(t(this._value).subtract(a).value())}},q()&&t.loadCulturesInNode(),F?module.exports=t:("undefined"==typeof ender&&(this.numbro=t),"function"==typeof define&&define.amd&&define([],function(){return t}))}).call("undefined"==typeof window?this:window);