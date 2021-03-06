/*http://www.script-tutorials.com/animated-jquery-progressbar/*/
$(document).ready(function(){
    jQuery.fn.anim_progressbar = function (aOptions) {
        // def values
        var iCms = 1000;
        var iMms = 60 * iCms;
        var iHms = 3600 * iCms;
        var iDms = 24 * 3600 * iCms;

        // def options
        var aDefOpts = {
            start: new Date(), // now
            finish: new Date().setTime(new Date().getTime() + 60 * iCms), // now + 60 sec
            interval: 1
        }
        var aOpts = jQuery.extend(aDefOpts, aOptions);
        var vPb = this;

        // each progress bar
        return this.each(
            function() {
                var iDuration = aOpts.finish - aOpts.start;

                // calling original progressbar
                $(vPb).children('.pbar').progressbar();

                // looping process
                var vInterval = setInterval(
                    function(){
                        var iLeftMs = aOpts.finish - new Date(); // left time in MS
                        var iElapsedMs = new Date() - aOpts.start, // elapsed time in MS
                            iDays = parseInt(iLeftMs / iDms), // elapsed days
                            iHours = parseInt((iLeftMs - (iDays * iDms)) / iHms), // elapsed hours
                            iMin = parseInt((iLeftMs - (iDays * iDms) - (iHours * iHms)) / iMms), // elapsed minutes
                            iSec = parseInt((iLeftMs - (iDays * iDms) - (iMin * iMms) - (iHours * iHms)) / iCms), // elapsed seconds
                            iPerc = (iElapsedMs > 0) ? iElapsedMs / iDuration * 100 : 0; // percentages

                        // display current positions and progress
                        $(vPb).children('.percent1').html('<b>'+iPerc.toFixed(1)+'%</b>');
                        $(vPb).children('.elapsed').html(iDays+' days '+iHours+'h:'+iMin+'m:'+iSec+'s</b>');
                        $(vPb).children('.pbar').children('.ui-progressbar-value').css('width', iPerc+'%');

                        // in case of Finish
                        if (iPerc >= 100) {
                            clearInterval(vInterval);
                            $(vPb).children('.percent1').html('<b>100%</b>');
                            $(vPb).children('.elapsed').html('Finished');
                        }
                    } ,aOpts.interval
                );
            }
        );
    }

});
;
/**
 * Farbtastic Color Picker 1.2
 * © 2008 Steven Wittens
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

jQuery.fn.farbtastic = function (callback) {
  $.farbtastic(this, callback);
  return this;
};

jQuery.farbtastic = function (container, callback) {
  var container = $(container).get(0);
  return container.farbtastic || (container.farbtastic = new jQuery._farbtastic(container, callback));
}

jQuery._farbtastic = function (container, callback) {
  // Store farbtastic object
  var fb = this;

  // Insert markup
  $(container).html('<div class="farbtastic"><div class="color"></div><div class="wheel"></div><div class="overlay"></div><div class="h-marker marker"></div><div class="sl-marker marker"></div></div>');
  var e = $('.farbtastic', container);
  fb.wheel = $('.wheel', container).get(0);
  // Dimensions
  fb.radius = 84;
  fb.square = 100;
  fb.width = 194;

  // Fix background PNGs in IE6
  if (navigator.appVersion.match(/MSIE [0-6]\./)) {
    $('*', e).each(function () {
      if (this.currentStyle.backgroundImage != 'none') {
        var image = this.currentStyle.backgroundImage;
        image = this.currentStyle.backgroundImage.substring(5, image.length - 2);
        $(this).css({
          'backgroundImage': 'none',
          'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
        });
      }
    });
  }

  /**
   * Link to the given element(s) or callback.
   */
  fb.linkTo = function (callback) {
    // Unbind previous nodes
    if (typeof fb.callback == 'object') {
      $(fb.callback).unbind('keyup', fb.updateValue);
    }

    // Reset color
    fb.color = null;

    // Bind callback or elements
    if (typeof callback == 'function') {
      fb.callback = callback;
    }
    else if (typeof callback == 'object' || typeof callback == 'string') {
      fb.callback = $(callback);
      fb.callback.bind('keyup', fb.updateValue);
      if (fb.callback.get(0).value) {
        fb.setColor(fb.callback.get(0).value);
      }
    }
    return this;
  }
  fb.updateValue = function (event) {
    if (this.value && this.value != fb.color) {
      fb.setColor(this.value);
    }
  }

  /**
   * Change color with HTML syntax #123456
   */
  fb.setColor = function (color) {
    var unpack = fb.unpack(color);
    if (fb.color != color && unpack) {
      fb.color = color;
      fb.rgb = unpack;
      fb.hsl = fb.RGBToHSL(fb.rgb);
      fb.updateDisplay();
    }
    return this;
  }

  /**
   * Change color with HSL triplet [0..1, 0..1, 0..1]
   */
  fb.setHSL = function (hsl) {
    fb.hsl = hsl;
    fb.rgb = fb.HSLToRGB(hsl);
    fb.color = fb.pack(fb.rgb);
    fb.updateDisplay();
    return this;
  }

  /////////////////////////////////////////////////////

  /**
   * Retrieve the coordinates of the given event relative to the center
   * of the widget.
   */
  fb.widgetCoords = function (event) {
    var x, y;
    var el = event.target || event.srcElement;
    var reference = fb.wheel;

    if (typeof event.offsetX != 'undefined') {
      // Use offset coordinates and find common offsetParent
      var pos = { x: event.offsetX, y: event.offsetY };

      // Send the coordinates upwards through the offsetParent chain.
      var e = el;
      while (e) {
        e.mouseX = pos.x;
        e.mouseY = pos.y;
        pos.x += e.offsetLeft;
        pos.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Look for the coordinates starting from the wheel widget.
      var e = reference;
      var offset = { x: 0, y: 0 }
      while (e) {
        if (typeof e.mouseX != 'undefined') {
          x = e.mouseX - offset.x;
          y = e.mouseY - offset.y;
          break;
        }
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Reset stored coordinates
      e = el;
      while (e) {
        e.mouseX = undefined;
        e.mouseY = undefined;
        e = e.offsetParent;
      }
    }
    else {
      // Use absolute coordinates
      var pos = fb.absolutePosition(reference);
      x = (event.pageX || 0*(event.clientX + $('html').get(0).scrollLeft)) - pos.x;
      y = (event.pageY || 0*(event.clientY + $('html').get(0).scrollTop)) - pos.y;
    }
    // Subtract distance to middle
    return { x: x - fb.width / 2, y: y - fb.width / 2 };
  }

  /**
   * Mousedown handler
   */
  fb.mousedown = function (event) {
    // Capture mouse
    if (!document.dragging) {
      $(document).bind('mousemove', fb.mousemove).bind('mouseup', fb.mouseup);
      document.dragging = true;
    }

    // Check which area is being dragged
    var pos = fb.widgetCoords(event);
    fb.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) * 2 > fb.square;

    // Process
    fb.mousemove(event);
    return false;
  }

  /**
   * Mousemove handler
   */
  fb.mousemove = function (event) {
    // Get coordinates relative to color picker center
    var pos = fb.widgetCoords(event);

    // Set new HSL parameters
    if (fb.circleDrag) {
      var hue = Math.atan2(pos.x, -pos.y) / 6.28;
      if (hue < 0) hue += 1;
      fb.setHSL([hue, fb.hsl[1], fb.hsl[2]]);
    }
    else {
      var sat = Math.max(0, Math.min(1, -(pos.x / fb.square) + .5));
      var lum = Math.max(0, Math.min(1, -(pos.y / fb.square) + .5));
      fb.setHSL([fb.hsl[0], sat, lum]);
    }
    return false;
  }

  /**
   * Mouseup handler
   */
  fb.mouseup = function () {
    // Uncapture mouse
    $(document).unbind('mousemove', fb.mousemove);
    $(document).unbind('mouseup', fb.mouseup);
    document.dragging = false;
  }

  /**
   * Update the markers and styles
   */
  fb.updateDisplay = function () {
    // Markers
    var angle = fb.hsl[0] * 6.28;
    $('.h-marker', e).css({
      left: Math.round(Math.sin(angle) * fb.radius + fb.width / 2) + 'px',
      top: Math.round(-Math.cos(angle) * fb.radius + fb.width / 2) + 'px'
    });

    $('.sl-marker', e).css({
      left: Math.round(fb.square * (.5 - fb.hsl[1]) + fb.width / 2) + 'px',
      top: Math.round(fb.square * (.5 - fb.hsl[2]) + fb.width / 2) + 'px'
    });

    // Saturation/Luminance gradient
    $('.color', e).css('backgroundColor', fb.pack(fb.HSLToRGB([fb.hsl[0], 1, 0.5])));

    // Linked elements or callback
    if (typeof fb.callback == 'object') {
      // Set background/foreground color
      $(fb.callback).css({
        backgroundColor: fb.color,
        color: fb.hsl[2] > 0.5 ? '#000' : '#fff'
      });

      // Change linked value
      $(fb.callback).each(function() {
        if (this.value && this.value != fb.color) {
          this.value = fb.color;
        }
      });
    }
    else if (typeof fb.callback == 'function') {
      fb.callback.call(fb, fb.color);
    }
  }

  /**
   * Get absolute position of element
   */
  fb.absolutePosition = function (el) {
    var r = { x: el.offsetLeft, y: el.offsetTop };
    // Resolve relative to offsetParent
    if (el.offsetParent) {
      var tmp = fb.absolutePosition(el.offsetParent);
      r.x += tmp.x;
      r.y += tmp.y;
    }
    return r;
  };

  /* Various color utility functions */
  fb.pack = function (rgb) {
    var r = Math.round(rgb[0] * 255);
    var g = Math.round(rgb[1] * 255);
    var b = Math.round(rgb[2] * 255);
    return '#' + (r < 16 ? '0' : '') + r.toString(16) +
           (g < 16 ? '0' : '') + g.toString(16) +
           (b < 16 ? '0' : '') + b.toString(16);
  }

  fb.unpack = function (color) {
    if (color.length == 7) {
      return [parseInt('0x' + color.substring(1, 3)) / 255,
        parseInt('0x' + color.substring(3, 5)) / 255,
        parseInt('0x' + color.substring(5, 7)) / 255];
    }
    else if (color.length == 4) {
      return [parseInt('0x' + color.substring(1, 2)) / 15,
        parseInt('0x' + color.substring(2, 3)) / 15,
        parseInt('0x' + color.substring(3, 4)) / 15];
    }
  }

  fb.HSLToRGB = function (hsl) {
    var m1, m2, r, g, b;
    var h = hsl[0], s = hsl[1], l = hsl[2];
    m2 = (l <= 0.5) ? l * (s + 1) : l + s - l*s;
    m1 = l * 2 - m2;
    return [this.hueToRGB(m1, m2, h+0.33333),
        this.hueToRGB(m1, m2, h),
        this.hueToRGB(m1, m2, h-0.33333)];
  }

  fb.hueToRGB = function (m1, m2, h) {
    h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (0.66666 - h) * 6;
    return m1;
  }

  fb.RGBToHSL = function (rgb) {
    var min, max, delta, h, s, l;
    var r = rgb[0], g = rgb[1], b = rgb[2];
    min = Math.min(r, Math.min(g, b));
    max = Math.max(r, Math.max(g, b));
    delta = max - min;
    l = (min + max) / 2;
    s = 0;
    if (l > 0 && l < 1) {
      s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    }
    h = 0;
    if (delta > 0) {
      if (max == r && max != g) h += (g - b) / delta;
      if (max == g && max != b) h += (2 + (b - r) / delta);
      if (max == b && max != r) h += (4 + (r - g) / delta);
      h /= 6;
    }
    return [h, s, l];
  }

  // Install mousedown handler (the others are set on the document on-demand)
  $('*', e).mousedown(fb.mousedown);

    // Init color
  fb.setColor('#000000');

  // Set linked elements/callback
  if (callback) {
    fb.linkTo(callback);
  }
}
;
/*
 * File:        jquery.dataTables.min.js
 * Version:     1.9.3
 * Author:      Allan Jardine (www.sprymedia.co.uk)
 * Info:        www.datatables.net
 * 
 * Copyright 2008-2012 Allan Jardine, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license, available at:
 *   http://datatables.net/license_gpl2
 *   http://datatables.net/license_bsd
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 */
(function(i,O,l,n){var j=function(e){function o(a,b){var c=j.defaults.columns,d=a.aoColumns.length,c=i.extend({},j.models.oColumn,c,{sSortingClass:a.oClasses.sSortable,sSortingClassJUI:a.oClasses.sSortJUI,nTh:b?b:l.createElement("th"),sTitle:c.sTitle?c.sTitle:b?b.innerHTML:"",aDataSort:c.aDataSort?c.aDataSort:[d],mData:c.mData?c.oDefaults:d});a.aoColumns.push(c);if(a.aoPreSearchCols[d]===n||null===a.aoPreSearchCols[d])a.aoPreSearchCols[d]=i.extend({},j.models.oSearch);else if(c=a.aoPreSearchCols[d],
c.bRegex===n&&(c.bRegex=!0),c.bSmart===n&&(c.bSmart=!0),c.bCaseInsensitive===n)c.bCaseInsensitive=!0;r(a,d,null)}function r(a,b,c){var d=a.aoColumns[b];c!==n&&null!==c&&(c.mDataProp&&!c.mData&&(c.mData=c.mDataProp),c.sType!==n&&(d.sType=c.sType,d._bAutoType=!1),i.extend(d,c),p(d,c,"sWidth","sWidthOrig"),c.iDataSort!==n&&(d.aDataSort=[c.iDataSort]),p(d,c,"aDataSort"));var h=d.mRender?S(d.mRender):null,f=S(d.mData);d.fnGetData=function(a,b){var c=f(a,b);return d.mRender&&b&&""!==b?h(c,b,a):c};d.fnSetData=
ta(d.mData);a.oFeatures.bSort||(d.bSortable=!1);!d.bSortable||-1==i.inArray("asc",d.asSorting)&&-1==i.inArray("desc",d.asSorting)?(d.sSortingClass=a.oClasses.sSortableNone,d.sSortingClassJUI=""):d.bSortable||-1==i.inArray("asc",d.asSorting)&&-1==i.inArray("desc",d.asSorting)?(d.sSortingClass=a.oClasses.sSortable,d.sSortingClassJUI=a.oClasses.sSortJUI):-1!=i.inArray("asc",d.asSorting)&&-1==i.inArray("desc",d.asSorting)?(d.sSortingClass=a.oClasses.sSortableAsc,d.sSortingClassJUI=a.oClasses.sSortJUIAscAllowed):
-1==i.inArray("asc",d.asSorting)&&-1!=i.inArray("desc",d.asSorting)&&(d.sSortingClass=a.oClasses.sSortableDesc,d.sSortingClassJUI=a.oClasses.sSortJUIDescAllowed)}function k(a){if(!1===a.oFeatures.bAutoWidth)return!1;ca(a);for(var b=0,c=a.aoColumns.length;b<c;b++)a.aoColumns[b].nTh.style.width=a.aoColumns[b].sWidth}function G(a,b){var c=v(a,"bVisible");return"number"===typeof c[b]?c[b]:null}function t(a,b){var c=v(a,"bVisible"),c=i.inArray(b,c);return-1!==c?c:null}function w(a){return v(a,"bVisible").length}
function v(a,b){var c=[];i.map(a.aoColumns,function(a,h){a[b]&&c.push(h)});return c}function D(a){for(var b=j.ext.aTypes,c=b.length,d=0;d<c;d++){var h=b[d](a);if(null!==h)return h}return"string"}function y(a,b){for(var c=b.split(","),d=[],h=0,f=a.aoColumns.length;h<f;h++)for(var g=0;g<f;g++)if(a.aoColumns[h].sName==c[g]){d.push(g);break}return d}function H(a){for(var b="",c=0,d=a.aoColumns.length;c<d;c++)b+=a.aoColumns[c].sName+",";return b.length==d?"":b.slice(0,-1)}function ua(a,b,c,d){var h,f,
g,e,s;if(b)for(h=b.length-1;0<=h;h--){var m=b[h].aTargets;i.isArray(m)||E(a,1,"aTargets must be an array of targets, not a "+typeof m);f=0;for(g=m.length;f<g;f++)if("number"===typeof m[f]&&0<=m[f]){for(;a.aoColumns.length<=m[f];)o(a);d(m[f],b[h])}else if("number"===typeof m[f]&&0>m[f])d(a.aoColumns.length+m[f],b[h]);else if("string"===typeof m[f]){e=0;for(s=a.aoColumns.length;e<s;e++)("_all"==m[f]||i(a.aoColumns[e].nTh).hasClass(m[f]))&&d(e,b[h])}}if(c){h=0;for(a=c.length;h<a;h++)d(h,c[h])}}function J(a,
b){var c;c=i.isArray(b)?b.slice():i.extend(!0,{},b);var d=a.aoData.length,h=i.extend(!0,{},j.models.oRow);h._aData=c;a.aoData.push(h);for(var f,h=0,g=a.aoColumns.length;h<g;h++)c=a.aoColumns[h],"function"===typeof c.fnRender&&c.bUseRendered&&null!==c.mData?I(a,d,h,T(a,d,h)):I(a,d,h,x(a,d,h)),c._bAutoType&&"string"!=c.sType&&(f=x(a,d,h,"type"),null!==f&&""!==f&&(f=D(f),null===c.sType?c.sType=f:c.sType!=f&&"html"!=c.sType&&(c.sType="string")));a.aiDisplayMaster.push(d);a.oFeatures.bDeferRender||da(a,
d);return d}function va(a){var b,c,d,h,f,g,e,s,m;if(a.bDeferLoading||null===a.sAjaxSource){e=a.nTBody.childNodes;b=0;for(c=e.length;b<c;b++)if("TR"==e[b].nodeName.toUpperCase()){s=a.aoData.length;e[b]._DT_RowIndex=s;a.aoData.push(i.extend(!0,{},j.models.oRow,{nTr:e[b]}));a.aiDisplayMaster.push(s);g=e[b].childNodes;d=f=0;for(h=g.length;d<h;d++)if(m=g[d].nodeName.toUpperCase(),"TD"==m||"TH"==m)I(a,s,f,i.trim(g[d].innerHTML)),f++}}e=U(a);g=[];b=0;for(c=e.length;b<c;b++){d=0;for(h=e[b].childNodes.length;d<
h;d++)f=e[b].childNodes[d],m=f.nodeName.toUpperCase(),("TD"==m||"TH"==m)&&g.push(f)}h=0;for(e=a.aoColumns.length;h<e;h++){m=a.aoColumns[h];null===m.sTitle&&(m.sTitle=m.nTh.innerHTML);f=m._bAutoType;s="function"===typeof m.fnRender;var o=null!==m.sClass,k=m.bVisible,r,n;if(f||s||o||!k){b=0;for(c=a.aoData.length;b<c;b++)d=a.aoData[b],r=g[b*e+h],f&&"string"!=m.sType&&(n=x(a,b,h,"type"),""!==n&&(n=D(n),null===m.sType?m.sType=n:m.sType!=n&&"html"!=m.sType&&(m.sType="string"))),"function"===typeof m.mData&&
(r.innerHTML=x(a,b,h,"display")),s&&(n=T(a,b,h),r.innerHTML=n,m.bUseRendered&&I(a,b,h,n)),o&&(r.className+=" "+m.sClass),k?d._anHidden[h]=null:(d._anHidden[h]=r,r.parentNode.removeChild(r)),m.fnCreatedCell&&m.fnCreatedCell.call(a.oInstance,r,x(a,b,h,"display"),d._aData,b,h)}}if(0!==a.aoRowCreatedCallback.length){b=0;for(c=a.aoData.length;b<c;b++)d=a.aoData[b],C(a,"aoRowCreatedCallback",null,[d.nTr,d._aData,b])}}function K(a,b){return b._DT_RowIndex!==n?b._DT_RowIndex:null}function ea(a,b,c){for(var b=
L(a,b),d=0,a=a.aoColumns.length;d<a;d++)if(b[d]===c)return d;return-1}function Y(a,b,c,d){for(var h=[],f=0,g=d.length;f<g;f++)h.push(x(a,b,d[f],c));return h}function x(a,b,c,d){var h=a.aoColumns[c];if((c=h.fnGetData(a.aoData[b]._aData,d))===n)return a.iDrawError!=a.iDraw&&null===h.sDefaultContent&&(E(a,0,"Requested unknown parameter "+("function"==typeof h.mData?"{mData function}":"'"+h.mData+"'")+" from the data source for row "+b),a.iDrawError=a.iDraw),h.sDefaultContent;if(null===c&&null!==h.sDefaultContent)c=
h.sDefaultContent;else if("function"===typeof c)return c();return"display"==d&&null===c?"":c}function I(a,b,c,d){a.aoColumns[c].fnSetData(a.aoData[b]._aData,d)}function S(a){if(null===a)return function(){return null};if("function"===typeof a)return function(b,d,h){return a(b,d,h)};if("string"===typeof a&&(-1!==a.indexOf(".")||-1!==a.indexOf("["))){var b=function(a,d,h){var f=h.split("."),g;if(""!==h){var e=0;for(g=f.length;e<g;e++){if(h=f[e].match(V)){f[e]=f[e].replace(V,"");""!==f[e]&&(a=a[f[e]]);
g=[];f.splice(0,e+1);for(var f=f.join("."),e=0,i=a.length;e<i;e++)g.push(b(a[e],d,f));a=h[0].substring(1,h[0].length-1);a=""===a?g:g.join(a);break}if(null===a||a[f[e]]===n)return n;a=a[f[e]]}}return a};return function(c,d){return b(c,d,a)}}return function(b){return b[a]}}function ta(a){if(null===a)return function(){};if("function"===typeof a)return function(b,d){a(b,"set",d)};if("string"===typeof a&&(-1!==a.indexOf(".")||-1!==a.indexOf("["))){var b=function(a,d,h){var h=h.split("."),f,g,e=0;for(g=
h.length-1;e<g;e++){if(f=h[e].match(V)){h[e]=h[e].replace(V,"");a[h[e]]=[];f=h.slice();f.splice(0,e+1);g=f.join(".");for(var i=0,m=d.length;i<m;i++)f={},b(f,d[i],g),a[h[e]].push(f);return}if(null===a[h[e]]||a[h[e]]===n)a[h[e]]={};a=a[h[e]]}a[h[h.length-1].replace(V,"")]=d};return function(c,d){return b(c,d,a)}}return function(b,d){b[a]=d}}function Z(a){for(var b=[],c=a.aoData.length,d=0;d<c;d++)b.push(a.aoData[d]._aData);return b}function fa(a){a.aoData.splice(0,a.aoData.length);a.aiDisplayMaster.splice(0,
a.aiDisplayMaster.length);a.aiDisplay.splice(0,a.aiDisplay.length);A(a)}function ga(a,b){for(var c=-1,d=0,h=a.length;d<h;d++)a[d]==b?c=d:a[d]>b&&a[d]--; -1!=c&&a.splice(c,1)}function T(a,b,c){var d=a.aoColumns[c];return d.fnRender({iDataRow:b,iDataColumn:c,oSettings:a,aData:a.aoData[b]._aData,mDataProp:d.mData},x(a,b,c,"display"))}function da(a,b){var c=a.aoData[b],d;if(null===c.nTr){c.nTr=l.createElement("tr");c.nTr._DT_RowIndex=b;c._aData.DT_RowId&&(c.nTr.id=c._aData.DT_RowId);c._aData.DT_RowClass&&
i(c.nTr).addClass(c._aData.DT_RowClass);for(var h=0,f=a.aoColumns.length;h<f;h++){var g=a.aoColumns[h];d=l.createElement(g.sCellType);d.innerHTML="function"===typeof g.fnRender&&(!g.bUseRendered||null===g.mData)?T(a,b,h):x(a,b,h,"display");null!==g.sClass&&(d.className=g.sClass);g.bVisible?(c.nTr.appendChild(d),c._anHidden[h]=null):c._anHidden[h]=d;g.fnCreatedCell&&g.fnCreatedCell.call(a.oInstance,d,x(a,b,h,"display"),c._aData,b,h)}C(a,"aoRowCreatedCallback",null,[c.nTr,c._aData,b])}}function wa(a){var b,
c,d;if(0!==a.nTHead.getElementsByTagName("th").length){b=0;for(d=a.aoColumns.length;b<d;b++)if(c=a.aoColumns[b].nTh,c.setAttribute("role","columnheader"),a.aoColumns[b].bSortable&&(c.setAttribute("tabindex",a.iTabIndex),c.setAttribute("aria-controls",a.sTableId)),null!==a.aoColumns[b].sClass&&i(c).addClass(a.aoColumns[b].sClass),a.aoColumns[b].sTitle!=c.innerHTML)c.innerHTML=a.aoColumns[b].sTitle}else{var h=l.createElement("tr");b=0;for(d=a.aoColumns.length;b<d;b++)c=a.aoColumns[b].nTh,c.innerHTML=
a.aoColumns[b].sTitle,c.setAttribute("tabindex","0"),null!==a.aoColumns[b].sClass&&i(c).addClass(a.aoColumns[b].sClass),h.appendChild(c);i(a.nTHead).html("")[0].appendChild(h);W(a.aoHeader,a.nTHead)}i(a.nTHead).children("tr").attr("role","row");if(a.bJUI){b=0;for(d=a.aoColumns.length;b<d;b++){c=a.aoColumns[b].nTh;h=l.createElement("div");h.className=a.oClasses.sSortJUIWrapper;i(c).contents().appendTo(h);var f=l.createElement("span");f.className=a.oClasses.sSortIcon;h.appendChild(f);c.appendChild(h)}}if(a.oFeatures.bSort)for(b=
0;b<a.aoColumns.length;b++)!1!==a.aoColumns[b].bSortable?ha(a,a.aoColumns[b].nTh,b):i(a.aoColumns[b].nTh).addClass(a.oClasses.sSortableNone);""!==a.oClasses.sFooterTH&&i(a.nTFoot).children("tr").children("th").addClass(a.oClasses.sFooterTH);if(null!==a.nTFoot){c=P(a,null,a.aoFooter);b=0;for(d=a.aoColumns.length;b<d;b++)c[b]&&(a.aoColumns[b].nTf=c[b],a.aoColumns[b].sClass&&i(c[b]).addClass(a.aoColumns[b].sClass))}}function X(a,b,c){var d,h,f,g=[],e=[],i=a.aoColumns.length,m;c===n&&(c=!1);d=0;for(h=
b.length;d<h;d++){g[d]=b[d].slice();g[d].nTr=b[d].nTr;for(f=i-1;0<=f;f--)!a.aoColumns[f].bVisible&&!c&&g[d].splice(f,1);e.push([])}d=0;for(h=g.length;d<h;d++){if(a=g[d].nTr)for(;f=a.firstChild;)a.removeChild(f);f=0;for(b=g[d].length;f<b;f++)if(m=i=1,e[d][f]===n){a.appendChild(g[d][f].cell);for(e[d][f]=1;g[d+i]!==n&&g[d][f].cell==g[d+i][f].cell;)e[d+i][f]=1,i++;for(;g[d][f+m]!==n&&g[d][f].cell==g[d][f+m].cell;){for(c=0;c<i;c++)e[d+c][f+m]=1;m++}g[d][f].cell.rowSpan=i;g[d][f].cell.colSpan=m}}}function z(a){var b=
C(a,"aoPreDrawCallback","preDraw",[a]);if(-1!==i.inArray(!1,b))F(a,!1);else{var c,d,b=[],h=0,f=a.asStripeClasses.length;c=a.aoOpenRows.length;a.bDrawing=!0;a.iInitDisplayStart!==n&&-1!=a.iInitDisplayStart&&(a._iDisplayStart=a.oFeatures.bServerSide?a.iInitDisplayStart:a.iInitDisplayStart>=a.fnRecordsDisplay()?0:a.iInitDisplayStart,a.iInitDisplayStart=-1,A(a));if(a.bDeferLoading)a.bDeferLoading=!1,a.iDraw++;else if(a.oFeatures.bServerSide){if(!a.bDestroying&&!xa(a))return}else a.iDraw++;if(0!==a.aiDisplay.length){var g=
a._iDisplayStart;d=a._iDisplayEnd;a.oFeatures.bServerSide&&(g=0,d=a.aoData.length);for(;g<d;g++){var e=a.aoData[a.aiDisplay[g]];null===e.nTr&&da(a,a.aiDisplay[g]);var s=e.nTr;if(0!==f){var m=a.asStripeClasses[h%f];e._sRowStripe!=m&&(i(s).removeClass(e._sRowStripe).addClass(m),e._sRowStripe=m)}C(a,"aoRowCallback",null,[s,a.aoData[a.aiDisplay[g]]._aData,h,g]);b.push(s);h++;if(0!==c)for(e=0;e<c;e++)if(s==a.aoOpenRows[e].nParent){b.push(a.aoOpenRows[e].nTr);break}}}else b[0]=l.createElement("tr"),a.asStripeClasses[0]&&
(b[0].className=a.asStripeClasses[0]),c=a.oLanguage,f=c.sZeroRecords,1==a.iDraw&&null!==a.sAjaxSource&&!a.oFeatures.bServerSide?f=c.sLoadingRecords:c.sEmptyTable&&0===a.fnRecordsTotal()&&(f=c.sEmptyTable),c=l.createElement("td"),c.setAttribute("valign","top"),c.colSpan=w(a),c.className=a.oClasses.sRowEmpty,c.innerHTML=ia(a,f),b[h].appendChild(c);C(a,"aoHeaderCallback","header",[i(a.nTHead).children("tr")[0],Z(a),a._iDisplayStart,a.fnDisplayEnd(),a.aiDisplay]);C(a,"aoFooterCallback","footer",[i(a.nTFoot).children("tr")[0],
Z(a),a._iDisplayStart,a.fnDisplayEnd(),a.aiDisplay]);h=l.createDocumentFragment();c=l.createDocumentFragment();if(a.nTBody){f=a.nTBody.parentNode;c.appendChild(a.nTBody);if(!a.oScroll.bInfinite||!a._bInitComplete||a.bSorted||a.bFiltered)for(;c=a.nTBody.firstChild;)a.nTBody.removeChild(c);c=0;for(d=b.length;c<d;c++)h.appendChild(b[c]);a.nTBody.appendChild(h);null!==f&&f.appendChild(a.nTBody)}C(a,"aoDrawCallback","draw",[a]);a.bSorted=!1;a.bFiltered=!1;a.bDrawing=!1;a.oFeatures.bServerSide&&(F(a,!1),
a._bInitComplete||$(a))}}function aa(a){a.oFeatures.bSort?Q(a,a.oPreviousSearch):a.oFeatures.bFilter?M(a,a.oPreviousSearch):(A(a),z(a))}function ya(a){var b=i("<div></div>")[0];a.nTable.parentNode.insertBefore(b,a.nTable);a.nTableWrapper=i('<div id="'+a.sTableId+'_wrapper" class="'+a.oClasses.sWrapper+'" role="grid"></div>')[0];a.nTableReinsertBefore=a.nTable.nextSibling;for(var c=a.nTableWrapper,d=a.sDom.split(""),h,f,g,e,s,m,o,k=0;k<d.length;k++){f=0;g=d[k];if("<"==g){e=i("<div></div>")[0];s=d[k+
1];if("'"==s||'"'==s){m="";for(o=2;d[k+o]!=s;)m+=d[k+o],o++;"H"==m?m=a.oClasses.sJUIHeader:"F"==m&&(m=a.oClasses.sJUIFooter);-1!=m.indexOf(".")?(s=m.split("."),e.id=s[0].substr(1,s[0].length-1),e.className=s[1]):"#"==m.charAt(0)?e.id=m.substr(1,m.length-1):e.className=m;k+=o}c.appendChild(e);c=e}else if(">"==g)c=c.parentNode;else if("l"==g&&a.oFeatures.bPaginate&&a.oFeatures.bLengthChange)h=za(a),f=1;else if("f"==g&&a.oFeatures.bFilter)h=Aa(a),f=1;else if("r"==g&&a.oFeatures.bProcessing)h=Ba(a),f=
1;else if("t"==g)h=Ca(a),f=1;else if("i"==g&&a.oFeatures.bInfo)h=Da(a),f=1;else if("p"==g&&a.oFeatures.bPaginate)h=Ea(a),f=1;else if(0!==j.ext.aoFeatures.length){e=j.ext.aoFeatures;o=0;for(s=e.length;o<s;o++)if(g==e[o].cFeature){(h=e[o].fnInit(a))&&(f=1);break}}1==f&&null!==h&&("object"!==typeof a.aanFeatures[g]&&(a.aanFeatures[g]=[]),a.aanFeatures[g].push(h),c.appendChild(h))}b.parentNode.replaceChild(a.nTableWrapper,b)}function W(a,b){var c=i(b).children("tr"),d,h,f,g,e,s,m,j;a.splice(0,a.length);
h=0;for(s=c.length;h<s;h++)a.push([]);h=0;for(s=c.length;h<s;h++){f=0;for(m=c[h].childNodes.length;f<m;f++)if(d=c[h].childNodes[f],"TD"==d.nodeName.toUpperCase()||"TH"==d.nodeName.toUpperCase()){var o=1*d.getAttribute("colspan"),k=1*d.getAttribute("rowspan"),o=!o||0===o||1===o?1:o,k=!k||0===k||1===k?1:k;for(g=0;a[h][g];)g++;j=g;for(e=0;e<o;e++)for(g=0;g<k;g++)a[h+g][j+e]={cell:d,unique:1==o?!0:!1},a[h+g].nTr=c[h]}}}function P(a,b,c){var d=[];c||(c=a.aoHeader,b&&(c=[],W(c,b)));for(var b=0,h=c.length;b<
h;b++)for(var f=0,g=c[b].length;f<g;f++)if(c[b][f].unique&&(!d[f]||!a.bSortCellsTop))d[f]=c[b][f].cell;return d}function xa(a){if(a.bAjaxDataGet){a.iDraw++;F(a,!0);var b=Fa(a);ja(a,b);a.fnServerData.call(a.oInstance,a.sAjaxSource,b,function(b){Ga(a,b)},a);return!1}return!0}function Fa(a){var b=a.aoColumns.length,c=[],d,h,f,g;c.push({name:"sEcho",value:a.iDraw});c.push({name:"iColumns",value:b});c.push({name:"sColumns",value:H(a)});c.push({name:"iDisplayStart",value:a._iDisplayStart});c.push({name:"iDisplayLength",
value:!1!==a.oFeatures.bPaginate?a._iDisplayLength:-1});for(f=0;f<b;f++)d=a.aoColumns[f].mData,c.push({name:"mDataProp_"+f,value:"function"===typeof d?"function":d});if(!1!==a.oFeatures.bFilter){c.push({name:"sSearch",value:a.oPreviousSearch.sSearch});c.push({name:"bRegex",value:a.oPreviousSearch.bRegex});for(f=0;f<b;f++)c.push({name:"sSearch_"+f,value:a.aoPreSearchCols[f].sSearch}),c.push({name:"bRegex_"+f,value:a.aoPreSearchCols[f].bRegex}),c.push({name:"bSearchable_"+f,value:a.aoColumns[f].bSearchable})}if(!1!==
a.oFeatures.bSort){var e=0;d=null!==a.aaSortingFixed?a.aaSortingFixed.concat(a.aaSorting):a.aaSorting.slice();for(f=0;f<d.length;f++){h=a.aoColumns[d[f][0]].aDataSort;for(g=0;g<h.length;g++)c.push({name:"iSortCol_"+e,value:h[g]}),c.push({name:"sSortDir_"+e,value:d[f][1]}),e++}c.push({name:"iSortingCols",value:e});for(f=0;f<b;f++)c.push({name:"bSortable_"+f,value:a.aoColumns[f].bSortable})}return c}function ja(a,b){C(a,"aoServerParams","serverParams",[b])}function Ga(a,b){if(b.sEcho!==n){if(1*b.sEcho<
a.iDraw)return;a.iDraw=1*b.sEcho}(!a.oScroll.bInfinite||a.oScroll.bInfinite&&(a.bSorted||a.bFiltered))&&fa(a);a._iRecordsTotal=parseInt(b.iTotalRecords,10);a._iRecordsDisplay=parseInt(b.iTotalDisplayRecords,10);var c=H(a),c=b.sColumns!==n&&""!==c&&b.sColumns!=c,d;c&&(d=y(a,b.sColumns));for(var h=S(a.sAjaxDataProp)(b),f=0,g=h.length;f<g;f++)if(c){for(var e=[],i=0,m=a.aoColumns.length;i<m;i++)e.push(h[f][d[i]]);J(a,e)}else J(a,h[f]);a.aiDisplay=a.aiDisplayMaster.slice();a.bAjaxDataGet=!1;z(a);a.bAjaxDataGet=
!0;F(a,!1)}function Aa(a){var b=a.oPreviousSearch,c=a.oLanguage.sSearch,c=-1!==c.indexOf("_INPUT_")?c.replace("_INPUT_",'<input type="text" />'):""===c?'<input type="text" />':c+' <input type="text" />',d=l.createElement("div");d.className=a.oClasses.sFilter;d.innerHTML="<label>"+c+"</label>";a.aanFeatures.f||(d.id=a.sTableId+"_filter");c=i('input[type="text"]',d);d._DT_Input=c[0];c.val(b.sSearch.replace('"',"&quot;"));c.bind("keyup.DT",function(){for(var c=a.aanFeatures.f,d=this.value===""?"":this.value,
g=0,e=c.length;g<e;g++)c[g]!=i(this).parents("div.dataTables_filter")[0]&&i(c[g]._DT_Input).val(d);d!=b.sSearch&&M(a,{sSearch:d,bRegex:b.bRegex,bSmart:b.bSmart,bCaseInsensitive:b.bCaseInsensitive})});c.attr("aria-controls",a.sTableId).bind("keypress.DT",function(a){if(a.keyCode==13)return false});return d}function M(a,b,c){var d=a.oPreviousSearch,h=a.aoPreSearchCols,f=function(a){d.sSearch=a.sSearch;d.bRegex=a.bRegex;d.bSmart=a.bSmart;d.bCaseInsensitive=a.bCaseInsensitive};if(a.oFeatures.bServerSide)f(b);
else{Ha(a,b.sSearch,c,b.bRegex,b.bSmart,b.bCaseInsensitive);f(b);for(b=0;b<a.aoPreSearchCols.length;b++)Ia(a,h[b].sSearch,b,h[b].bRegex,h[b].bSmart,h[b].bCaseInsensitive);Ja(a)}a.bFiltered=!0;i(a.oInstance).trigger("filter",a);a._iDisplayStart=0;A(a);z(a);ka(a,0)}function Ja(a){for(var b=j.ext.afnFiltering,c=v(a,"bSearchable"),d=0,h=b.length;d<h;d++)for(var f=0,g=0,e=a.aiDisplay.length;g<e;g++){var i=a.aiDisplay[g-f];b[d](a,Y(a,i,"filter",c),i)||(a.aiDisplay.splice(g-f,1),f++)}}function Ia(a,b,c,
d,h,f){if(""!==b)for(var g=0,b=la(b,d,h,f),d=a.aiDisplay.length-1;0<=d;d--)h=Ka(x(a,a.aiDisplay[d],c,"filter"),a.aoColumns[c].sType),b.test(h)||(a.aiDisplay.splice(d,1),g++)}function Ha(a,b,c,d,h,f){d=la(b,d,h,f);h=a.oPreviousSearch;c||(c=0);0!==j.ext.afnFiltering.length&&(c=1);if(0>=b.length)a.aiDisplay.splice(0,a.aiDisplay.length),a.aiDisplay=a.aiDisplayMaster.slice();else if(a.aiDisplay.length==a.aiDisplayMaster.length||h.sSearch.length>b.length||1==c||0!==b.indexOf(h.sSearch)){a.aiDisplay.splice(0,
a.aiDisplay.length);ka(a,1);for(b=0;b<a.aiDisplayMaster.length;b++)d.test(a.asDataSearch[b])&&a.aiDisplay.push(a.aiDisplayMaster[b])}else for(b=c=0;b<a.asDataSearch.length;b++)d.test(a.asDataSearch[b])||(a.aiDisplay.splice(b-c,1),c++)}function ka(a,b){if(!a.oFeatures.bServerSide){a.asDataSearch=[];for(var c=v(a,"bSearchable"),d=1===b?a.aiDisplayMaster:a.aiDisplay,h=0,f=d.length;h<f;h++)a.asDataSearch[h]=ma(a,Y(a,d[h],"filter",c))}}function ma(a,b){var c=b.join("  ");-1!==c.indexOf("&")&&(c=i("<div>").html(c).text());
return c.replace(/[\n\r]/g," ")}function la(a,b,c,d){if(c)return a=b?a.split(" "):na(a).split(" "),a="^(?=.*?"+a.join(")(?=.*?")+").*$",RegExp(a,d?"i":"");a=b?a:na(a);return RegExp(a,d?"i":"")}function Ka(a,b){return"function"===typeof j.ext.ofnSearch[b]?j.ext.ofnSearch[b](a):null===a?"":"html"==b?a.replace(/[\r\n]/g," ").replace(/<.*?>/g,""):"string"===typeof a?a.replace(/[\r\n]/g," "):a}function na(a){return a.replace(RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\|\\$|\\^|\\-)","g"),
"\\$1")}function Da(a){var b=l.createElement("div");b.className=a.oClasses.sInfo;a.aanFeatures.i||(a.aoDrawCallback.push({fn:La,sName:"information"}),b.id=a.sTableId+"_info");a.nTable.setAttribute("aria-describedby",a.sTableId+"_info");return b}function La(a){if(a.oFeatures.bInfo&&0!==a.aanFeatures.i.length){var b=a.oLanguage,c=a._iDisplayStart+1,d=a.fnDisplayEnd(),h=a.fnRecordsTotal(),f=a.fnRecordsDisplay(),g;g=0===f&&f==h?b.sInfoEmpty:0===f?b.sInfoEmpty+" "+b.sInfoFiltered:f==h?b.sInfo:b.sInfo+
" "+b.sInfoFiltered;g+=b.sInfoPostFix;g=ia(a,g);null!==b.fnInfoCallback&&(g=b.fnInfoCallback.call(a.oInstance,a,c,d,h,f,g));a=a.aanFeatures.i;b=0;for(c=a.length;b<c;b++)i(a[b]).html(g)}}function ia(a,b){var c=a.fnFormatNumber(a._iDisplayStart+1),d=a.fnDisplayEnd(),d=a.fnFormatNumber(d),h=a.fnRecordsDisplay(),h=a.fnFormatNumber(h),f=a.fnRecordsTotal(),f=a.fnFormatNumber(f);a.oScroll.bInfinite&&(c=a.fnFormatNumber(1));return b.replace("_START_",c).replace("_END_",d).replace("_TOTAL_",h).replace("_MAX_",
f)}function ba(a){var b,c,d=a.iInitDisplayStart;if(!1===a.bInitialised)setTimeout(function(){ba(a)},200);else{ya(a);wa(a);X(a,a.aoHeader);a.nTFoot&&X(a,a.aoFooter);F(a,!0);a.oFeatures.bAutoWidth&&ca(a);b=0;for(c=a.aoColumns.length;b<c;b++)null!==a.aoColumns[b].sWidth&&(a.aoColumns[b].nTh.style.width=q(a.aoColumns[b].sWidth));a.oFeatures.bSort?Q(a):a.oFeatures.bFilter?M(a,a.oPreviousSearch):(a.aiDisplay=a.aiDisplayMaster.slice(),A(a),z(a));null!==a.sAjaxSource&&!a.oFeatures.bServerSide?(c=[],ja(a,
c),a.fnServerData.call(a.oInstance,a.sAjaxSource,c,function(c){var f=a.sAjaxDataProp!==""?S(a.sAjaxDataProp)(c):c;for(b=0;b<f.length;b++)J(a,f[b]);a.iInitDisplayStart=d;if(a.oFeatures.bSort)Q(a);else{a.aiDisplay=a.aiDisplayMaster.slice();A(a);z(a)}F(a,false);$(a,c)},a)):a.oFeatures.bServerSide||(F(a,!1),$(a))}}function $(a,b){a._bInitComplete=!0;C(a,"aoInitComplete","init",[a,b])}function oa(a){var b=j.defaults.oLanguage;!a.sEmptyTable&&(a.sZeroRecords&&"No data available in table"===b.sEmptyTable)&&
p(a,a,"sZeroRecords","sEmptyTable");!a.sLoadingRecords&&(a.sZeroRecords&&"Loading..."===b.sLoadingRecords)&&p(a,a,"sZeroRecords","sLoadingRecords")}function za(a){if(a.oScroll.bInfinite)return null;var b='<select size="1" '+('name="'+a.sTableId+'_length"')+">",c,d,h=a.aLengthMenu;if(2==h.length&&"object"===typeof h[0]&&"object"===typeof h[1]){c=0;for(d=h[0].length;c<d;c++)b+='<option value="'+h[0][c]+'">'+h[1][c]+"</option>"}else{c=0;for(d=h.length;c<d;c++)b+='<option value="'+h[c]+'">'+h[c]+"</option>"}b+=
"</select>";h=l.createElement("div");a.aanFeatures.l||(h.id=a.sTableId+"_length");h.className=a.oClasses.sLength;h.innerHTML="<label>"+a.oLanguage.sLengthMenu.replace("_MENU_",b)+"</label>";i('select option[value="'+a._iDisplayLength+'"]',h).attr("selected",!0);i("select",h).bind("change.DT",function(){var b=i(this).val(),h=a.aanFeatures.l;c=0;for(d=h.length;c<d;c++)h[c]!=this.parentNode&&i("select",h[c]).val(b);a._iDisplayLength=parseInt(b,10);A(a);if(a.fnDisplayEnd()==a.fnRecordsDisplay()){a._iDisplayStart=
a.fnDisplayEnd()-a._iDisplayLength;if(a._iDisplayStart<0)a._iDisplayStart=0}if(a._iDisplayLength==-1)a._iDisplayStart=0;z(a)});i("select",h).attr("aria-controls",a.sTableId);return h}function A(a){a._iDisplayEnd=!1===a.oFeatures.bPaginate?a.aiDisplay.length:a._iDisplayStart+a._iDisplayLength>a.aiDisplay.length||-1==a._iDisplayLength?a.aiDisplay.length:a._iDisplayStart+a._iDisplayLength}function Ea(a){if(a.oScroll.bInfinite)return null;var b=l.createElement("div");b.className=a.oClasses.sPaging+a.sPaginationType;
j.ext.oPagination[a.sPaginationType].fnInit(a,b,function(a){A(a);z(a)});a.aanFeatures.p||a.aoDrawCallback.push({fn:function(a){j.ext.oPagination[a.sPaginationType].fnUpdate(a,function(a){A(a);z(a)})},sName:"pagination"});return b}function pa(a,b){var c=a._iDisplayStart;if("number"===typeof b)a._iDisplayStart=b*a._iDisplayLength,a._iDisplayStart>a.fnRecordsDisplay()&&(a._iDisplayStart=0);else if("first"==b)a._iDisplayStart=0;else if("previous"==b)a._iDisplayStart=0<=a._iDisplayLength?a._iDisplayStart-
a._iDisplayLength:0,0>a._iDisplayStart&&(a._iDisplayStart=0);else if("next"==b)0<=a._iDisplayLength?a._iDisplayStart+a._iDisplayLength<a.fnRecordsDisplay()&&(a._iDisplayStart+=a._iDisplayLength):a._iDisplayStart=0;else if("last"==b)if(0<=a._iDisplayLength){var d=parseInt((a.fnRecordsDisplay()-1)/a._iDisplayLength,10)+1;a._iDisplayStart=(d-1)*a._iDisplayLength}else a._iDisplayStart=0;else E(a,0,"Unknown paging action: "+b);i(a.oInstance).trigger("page",a);return c!=a._iDisplayStart}function Ba(a){var b=
l.createElement("div");a.aanFeatures.r||(b.id=a.sTableId+"_processing");b.innerHTML=a.oLanguage.sProcessing;b.className=a.oClasses.sProcessing;a.nTable.parentNode.insertBefore(b,a.nTable);return b}function F(a,b){if(a.oFeatures.bProcessing)for(var c=a.aanFeatures.r,d=0,h=c.length;d<h;d++)c[d].style.visibility=b?"visible":"hidden";i(a.oInstance).trigger("processing",[a,b])}function Ca(a){if(""===a.oScroll.sX&&""===a.oScroll.sY)return a.nTable;var b=l.createElement("div"),c=l.createElement("div"),d=
l.createElement("div"),h=l.createElement("div"),f=l.createElement("div"),g=l.createElement("div"),e=a.nTable.cloneNode(!1),j=a.nTable.cloneNode(!1),m=a.nTable.getElementsByTagName("thead")[0],o=0===a.nTable.getElementsByTagName("tfoot").length?null:a.nTable.getElementsByTagName("tfoot")[0],k=a.oClasses;c.appendChild(d);f.appendChild(g);h.appendChild(a.nTable);b.appendChild(c);b.appendChild(h);d.appendChild(e);e.appendChild(m);null!==o&&(b.appendChild(f),g.appendChild(j),j.appendChild(o));b.className=
k.sScrollWrapper;c.className=k.sScrollHead;d.className=k.sScrollHeadInner;h.className=k.sScrollBody;f.className=k.sScrollFoot;g.className=k.sScrollFootInner;a.oScroll.bAutoCss&&(c.style.overflow="hidden",c.style.position="relative",f.style.overflow="hidden",h.style.overflow="auto");c.style.border="0";c.style.width="100%";f.style.border="0";d.style.width=""!==a.oScroll.sXInner?a.oScroll.sXInner:"100%";e.removeAttribute("id");e.style.marginLeft="0";a.nTable.style.marginLeft="0";null!==o&&(j.removeAttribute("id"),
j.style.marginLeft="0");d=i(a.nTable).children("caption");0<d.length&&(d=d[0],"top"===d._captionSide?e.appendChild(d):"bottom"===d._captionSide&&o&&j.appendChild(d));""!==a.oScroll.sX&&(c.style.width=q(a.oScroll.sX),h.style.width=q(a.oScroll.sX),null!==o&&(f.style.width=q(a.oScroll.sX)),i(h).scroll(function(){c.scrollLeft=this.scrollLeft;if(o!==null)f.scrollLeft=this.scrollLeft}));""!==a.oScroll.sY&&(h.style.height=q(a.oScroll.sY));a.aoDrawCallback.push({fn:Ma,sName:"scrolling"});a.oScroll.bInfinite&&
i(h).scroll(function(){if(!a.bDrawing&&i(this).scrollTop()!==0&&i(this).scrollTop()+i(this).height()>i(a.nTable).height()-a.oScroll.iLoadGap&&a.fnDisplayEnd()<a.fnRecordsDisplay()){pa(a,"next");A(a);z(a)}});a.nScrollHead=c;a.nScrollFoot=f;return b}function Ma(a){var b=a.nScrollHead.getElementsByTagName("div")[0],c=b.getElementsByTagName("table")[0],d=a.nTable.parentNode,h,f,g,e,j,m,o,k,r=[],n=null!==a.nTFoot?a.nScrollFoot.getElementsByTagName("div")[0]:null,p=null!==a.nTFoot?n.getElementsByTagName("table")[0]:
null,l=a.oBrowser.bScrollOversize;i(a.nTable).children("thead, tfoot").remove();g=i(a.nTHead).clone()[0];a.nTable.insertBefore(g,a.nTable.childNodes[0]);null!==a.nTFoot&&(j=i(a.nTFoot).clone()[0],a.nTable.insertBefore(j,a.nTable.childNodes[1]));""===a.oScroll.sX&&(d.style.width="100%",b.parentNode.style.width="100%");var t=P(a,g);h=0;for(f=t.length;h<f;h++)o=G(a,h),t[h].style.width=a.aoColumns[o].sWidth;null!==a.nTFoot&&N(function(a){a.style.width=""},j.getElementsByTagName("tr"));a.oScroll.bCollapse&&
""!==a.oScroll.sY&&(d.style.height=d.offsetHeight+a.nTHead.offsetHeight+"px");h=i(a.nTable).outerWidth();if(""===a.oScroll.sX){if(a.nTable.style.width="100%",l&&(i("tbody",d).height()>d.offsetHeight||"scroll"==i(d).css("overflow-y")))a.nTable.style.width=q(i(a.nTable).outerWidth()-a.oScroll.iBarWidth)}else""!==a.oScroll.sXInner?a.nTable.style.width=q(a.oScroll.sXInner):h==i(d).width()&&i(d).height()<i(a.nTable).height()?(a.nTable.style.width=q(h-a.oScroll.iBarWidth),i(a.nTable).outerWidth()>h-a.oScroll.iBarWidth&&
(a.nTable.style.width=q(h))):a.nTable.style.width=q(h);h=i(a.nTable).outerWidth();f=a.nTHead.getElementsByTagName("tr");g=g.getElementsByTagName("tr");N(function(a,b){m=a.style;m.paddingTop="0";m.paddingBottom="0";m.borderTopWidth="0";m.borderBottomWidth="0";m.height=0;k=i(a).width();b.style.width=q(k);r.push(k)},g,f);i(g).height(0);null!==a.nTFoot&&(e=j.getElementsByTagName("tr"),j=a.nTFoot.getElementsByTagName("tr"),N(function(a,b){m=a.style;m.paddingTop="0";m.paddingBottom="0";m.borderTopWidth=
"0";m.borderBottomWidth="0";m.height=0;k=i(a).width();b.style.width=q(k);r.push(k)},e,j),i(e).height(0));N(function(a){a.innerHTML="";a.style.width=q(r.shift())},g);null!==a.nTFoot&&N(function(a){a.innerHTML="";a.style.width=q(r.shift())},e);if(i(a.nTable).outerWidth()<h){e=d.scrollHeight>d.offsetHeight||"scroll"==i(d).css("overflow-y")?h+a.oScroll.iBarWidth:h;if(l&&(d.scrollHeight>d.offsetHeight||"scroll"==i(d).css("overflow-y")))a.nTable.style.width=q(e-a.oScroll.iBarWidth);d.style.width=q(e);b.parentNode.style.width=
q(e);null!==a.nTFoot&&(n.parentNode.style.width=q(e));""===a.oScroll.sX?E(a,1,"The table cannot fit into the current element which will cause column misalignment. The table has been drawn at its minimum possible width."):""!==a.oScroll.sXInner&&E(a,1,"The table cannot fit into the current element which will cause column misalignment. Increase the sScrollXInner value or remove it to allow automatic calculation")}else d.style.width=q("100%"),b.parentNode.style.width=q("100%"),null!==a.nTFoot&&(n.parentNode.style.width=
q("100%"));""===a.oScroll.sY&&l&&(d.style.height=q(a.nTable.offsetHeight+a.oScroll.iBarWidth));""!==a.oScroll.sY&&a.oScroll.bCollapse&&(d.style.height=q(a.oScroll.sY),l=""!==a.oScroll.sX&&a.nTable.offsetWidth>d.offsetWidth?a.oScroll.iBarWidth:0,a.nTable.offsetHeight<d.offsetHeight&&(d.style.height=q(a.nTable.offsetHeight+l)));l=i(a.nTable).outerWidth();c.style.width=q(l);b.style.width=q(l);c=i(a.nTable).height()>d.clientHeight||"scroll"==i(d).css("overflow-y");b.style.paddingRight=c?a.oScroll.iBarWidth+
"px":"0px";null!==a.nTFoot&&(p.style.width=q(l),n.style.width=q(l),n.style.paddingRight=c?a.oScroll.iBarWidth+"px":"0px");i(d).scroll();if(a.bSorted||a.bFiltered)d.scrollTop=0}function N(a,b,c){for(var d=0,h=b.length;d<h;d++)for(var f=0,g=b[d].childNodes.length;f<g;f++)1==b[d].childNodes[f].nodeType&&(c?a(b[d].childNodes[f],c[d].childNodes[f]):a(b[d].childNodes[f]))}function Na(a,b){if(!a||null===a||""===a)return 0;b||(b=l.getElementsByTagName("body")[0]);var c,d=l.createElement("div");d.style.width=
q(a);b.appendChild(d);c=d.offsetWidth;b.removeChild(d);return c}function ca(a){var b=0,c,d=0,h=a.aoColumns.length,f,g=i("th",a.nTHead),e=a.nTable.getAttribute("width");for(f=0;f<h;f++)a.aoColumns[f].bVisible&&(d++,null!==a.aoColumns[f].sWidth&&(c=Na(a.aoColumns[f].sWidthOrig,a.nTable.parentNode),null!==c&&(a.aoColumns[f].sWidth=q(c)),b++));if(h==g.length&&0===b&&d==h&&""===a.oScroll.sX&&""===a.oScroll.sY)for(f=0;f<a.aoColumns.length;f++)c=i(g[f]).width(),null!==c&&(a.aoColumns[f].sWidth=q(c));else{b=
a.nTable.cloneNode(!1);f=a.nTHead.cloneNode(!0);d=l.createElement("tbody");c=l.createElement("tr");b.removeAttribute("id");b.appendChild(f);null!==a.nTFoot&&(b.appendChild(a.nTFoot.cloneNode(!0)),N(function(a){a.style.width=""},b.getElementsByTagName("tr")));b.appendChild(d);d.appendChild(c);d=i("thead th",b);0===d.length&&(d=i("tbody tr:eq(0)>td",b));g=P(a,f);for(f=d=0;f<h;f++){var j=a.aoColumns[f];j.bVisible&&null!==j.sWidthOrig&&""!==j.sWidthOrig?g[f-d].style.width=q(j.sWidthOrig):j.bVisible?g[f-
d].style.width="":d++}for(f=0;f<h;f++)a.aoColumns[f].bVisible&&(d=Oa(a,f),null!==d&&(d=d.cloneNode(!0),""!==a.aoColumns[f].sContentPadding&&(d.innerHTML+=a.aoColumns[f].sContentPadding),c.appendChild(d)));h=a.nTable.parentNode;h.appendChild(b);""!==a.oScroll.sX&&""!==a.oScroll.sXInner?b.style.width=q(a.oScroll.sXInner):""!==a.oScroll.sX?(b.style.width="",i(b).width()<h.offsetWidth&&(b.style.width=q(h.offsetWidth))):""!==a.oScroll.sY?b.style.width=q(h.offsetWidth):e&&(b.style.width=q(e));b.style.visibility=
"hidden";Pa(a,b);h=i("tbody tr:eq(0)",b).children();0===h.length&&(h=P(a,i("thead",b)[0]));if(""!==a.oScroll.sX){for(f=d=c=0;f<a.aoColumns.length;f++)a.aoColumns[f].bVisible&&(c=null===a.aoColumns[f].sWidthOrig?c+i(h[d]).outerWidth():c+(parseInt(a.aoColumns[f].sWidth.replace("px",""),10)+(i(h[d]).outerWidth()-i(h[d]).width())),d++);b.style.width=q(c);a.nTable.style.width=q(c)}for(f=d=0;f<a.aoColumns.length;f++)a.aoColumns[f].bVisible&&(c=i(h[d]).width(),null!==c&&0<c&&(a.aoColumns[f].sWidth=q(c)),
d++);h=i(b).css("width");a.nTable.style.width=-1!==h.indexOf("%")?h:q(i(b).outerWidth());b.parentNode.removeChild(b)}e&&(a.nTable.style.width=q(e))}function Pa(a,b){""===a.oScroll.sX&&""!==a.oScroll.sY?(i(b).width(),b.style.width=q(i(b).outerWidth()-a.oScroll.iBarWidth)):""!==a.oScroll.sX&&(b.style.width=q(i(b).outerWidth()))}function Oa(a,b){var c=Qa(a,b);if(0>c)return null;if(null===a.aoData[c].nTr){var d=l.createElement("td");d.innerHTML=x(a,c,b,"");return d}return L(a,c)[b]}function Qa(a,b){for(var c=
-1,d=-1,h=0;h<a.aoData.length;h++){var f=x(a,h,b,"display")+"",f=f.replace(/<.*?>/g,"");f.length>c&&(c=f.length,d=h)}return d}function q(a){if(null===a)return"0px";if("number"==typeof a)return 0>a?"0px":a+"px";var b=a.charCodeAt(a.length-1);return 48>b||57<b?a:a+"px"}function Ra(){var a=l.createElement("p"),b=a.style;b.width="100%";b.height="200px";b.padding="0px";var c=l.createElement("div"),b=c.style;b.position="absolute";b.top="0px";b.left="0px";b.visibility="hidden";b.width="200px";b.height="150px";
b.padding="0px";b.overflow="hidden";c.appendChild(a);l.body.appendChild(c);b=a.offsetWidth;c.style.overflow="scroll";a=a.offsetWidth;b==a&&(a=c.clientWidth);l.body.removeChild(c);return b-a}function Q(a,b){var c,d,h,f,g,e,o=[],m=[],k=j.ext.oSort,r=a.aoData,l=a.aoColumns,p=a.oLanguage.oAria;if(!a.oFeatures.bServerSide&&(0!==a.aaSorting.length||null!==a.aaSortingFixed)){o=null!==a.aaSortingFixed?a.aaSortingFixed.concat(a.aaSorting):a.aaSorting.slice();for(c=0;c<o.length;c++)if(d=o[c][0],h=t(a,d),f=
a.aoColumns[d].sSortDataType,j.ext.afnSortData[f])if(g=j.ext.afnSortData[f].call(a.oInstance,a,d,h),g.length===r.length){h=0;for(f=r.length;h<f;h++)I(a,h,d,g[h])}else E(a,0,"Returned data sort array (col "+d+") is the wrong length");c=0;for(d=a.aiDisplayMaster.length;c<d;c++)m[a.aiDisplayMaster[c]]=c;var q=o.length,G;c=0;for(d=r.length;c<d;c++)for(h=0;h<q;h++){G=l[o[h][0]].aDataSort;g=0;for(e=G.length;g<e;g++)f=l[G[g]].sType,f=k[(f?f:"string")+"-pre"],r[c]._aSortData[G[g]]=f?f(x(a,c,G[g],"sort")):
x(a,c,G[g],"sort")}a.aiDisplayMaster.sort(function(a,b){var c,d,h,f,g;for(c=0;c<q;c++){g=l[o[c][0]].aDataSort;d=0;for(h=g.length;d<h;d++)if(f=l[g[d]].sType,f=k[(f?f:"string")+"-"+o[c][1]](r[a]._aSortData[g[d]],r[b]._aSortData[g[d]]),0!==f)return f}return k["numeric-asc"](m[a],m[b])})}(b===n||b)&&!a.oFeatures.bDeferRender&&R(a);c=0;for(d=a.aoColumns.length;c<d;c++)f=l[c].sTitle.replace(/<.*?>/g,""),h=l[c].nTh,h.removeAttribute("aria-sort"),h.removeAttribute("aria-label"),l[c].bSortable?0<o.length&&
o[0][0]==c?(h.setAttribute("aria-sort","asc"==o[0][1]?"ascending":"descending"),h.setAttribute("aria-label",f+("asc"==(l[c].asSorting[o[0][2]+1]?l[c].asSorting[o[0][2]+1]:l[c].asSorting[0])?p.sSortAscending:p.sSortDescending))):h.setAttribute("aria-label",f+("asc"==l[c].asSorting[0]?p.sSortAscending:p.sSortDescending)):h.setAttribute("aria-label",f);a.bSorted=!0;i(a.oInstance).trigger("sort",a);a.oFeatures.bFilter?M(a,a.oPreviousSearch,1):(a.aiDisplay=a.aiDisplayMaster.slice(),a._iDisplayStart=0,
A(a),z(a))}function ha(a,b,c,d){Sa(b,{},function(b){if(!1!==a.aoColumns[c].bSortable){var f=function(){var d,f;if(b.shiftKey){for(var e=!1,i=0;i<a.aaSorting.length;i++)if(a.aaSorting[i][0]==c){e=!0;d=a.aaSorting[i][0];f=a.aaSorting[i][2]+1;a.aoColumns[d].asSorting[f]?(a.aaSorting[i][1]=a.aoColumns[d].asSorting[f],a.aaSorting[i][2]=f):a.aaSorting.splice(i,1);break}!1===e&&a.aaSorting.push([c,a.aoColumns[c].asSorting[0],0])}else 1==a.aaSorting.length&&a.aaSorting[0][0]==c?(d=a.aaSorting[0][0],f=a.aaSorting[0][2]+
1,a.aoColumns[d].asSorting[f]||(f=0),a.aaSorting[0][1]=a.aoColumns[d].asSorting[f],a.aaSorting[0][2]=f):(a.aaSorting.splice(0,a.aaSorting.length),a.aaSorting.push([c,a.aoColumns[c].asSorting[0],0]));Q(a)};a.oFeatures.bProcessing?(F(a,!0),setTimeout(function(){f();a.oFeatures.bServerSide||F(a,!1)},0)):f();"function"==typeof d&&d(a)}})}function R(a){var b,c,d,h,f,e=a.aoColumns.length,j=a.oClasses;for(b=0;b<e;b++)a.aoColumns[b].bSortable&&i(a.aoColumns[b].nTh).removeClass(j.sSortAsc+" "+j.sSortDesc+
" "+a.aoColumns[b].sSortingClass);h=null!==a.aaSortingFixed?a.aaSortingFixed.concat(a.aaSorting):a.aaSorting.slice();for(b=0;b<a.aoColumns.length;b++)if(a.aoColumns[b].bSortable){f=a.aoColumns[b].sSortingClass;d=-1;for(c=0;c<h.length;c++)if(h[c][0]==b){f="asc"==h[c][1]?j.sSortAsc:j.sSortDesc;d=c;break}i(a.aoColumns[b].nTh).addClass(f);a.bJUI&&(c=i("span."+j.sSortIcon,a.aoColumns[b].nTh),c.removeClass(j.sSortJUIAsc+" "+j.sSortJUIDesc+" "+j.sSortJUI+" "+j.sSortJUIAscAllowed+" "+j.sSortJUIDescAllowed),
c.addClass(-1==d?a.aoColumns[b].sSortingClassJUI:"asc"==h[d][1]?j.sSortJUIAsc:j.sSortJUIDesc))}else i(a.aoColumns[b].nTh).addClass(a.aoColumns[b].sSortingClass);f=j.sSortColumn;if(a.oFeatures.bSort&&a.oFeatures.bSortClasses){d=L(a);if(a.oFeatures.bDeferRender)i(d).removeClass(f+"1 "+f+"2 "+f+"3");else if(d.length>=e)for(b=0;b<e;b++)if(-1!=d[b].className.indexOf(f+"1")){c=0;for(a=d.length/e;c<a;c++)d[e*c+b].className=i.trim(d[e*c+b].className.replace(f+"1",""))}else if(-1!=d[b].className.indexOf(f+
"2")){c=0;for(a=d.length/e;c<a;c++)d[e*c+b].className=i.trim(d[e*c+b].className.replace(f+"2",""))}else if(-1!=d[b].className.indexOf(f+"3")){c=0;for(a=d.length/e;c<a;c++)d[e*c+b].className=i.trim(d[e*c+b].className.replace(" "+f+"3",""))}var j=1,o;for(b=0;b<h.length;b++){o=parseInt(h[b][0],10);c=0;for(a=d.length/e;c<a;c++)d[e*c+o].className+=" "+f+j;3>j&&j++}}}function qa(a){if(a.oFeatures.bStateSave&&!a.bDestroying){var b,c;b=a.oScroll.bInfinite;var d={iCreate:(new Date).getTime(),iStart:b?0:a._iDisplayStart,
iEnd:b?a._iDisplayLength:a._iDisplayEnd,iLength:a._iDisplayLength,aaSorting:i.extend(!0,[],a.aaSorting),oSearch:i.extend(!0,{},a.oPreviousSearch),aoSearchCols:i.extend(!0,[],a.aoPreSearchCols),abVisCols:[]};b=0;for(c=a.aoColumns.length;b<c;b++)d.abVisCols.push(a.aoColumns[b].bVisible);C(a,"aoStateSaveParams","stateSaveParams",[a,d]);a.fnStateSave.call(a.oInstance,a,d)}}function Ta(a,b){if(a.oFeatures.bStateSave){var c=a.fnStateLoad.call(a.oInstance,a);if(c){var d=C(a,"aoStateLoadParams","stateLoadParams",
[a,c]);if(-1===i.inArray(!1,d)){a.oLoadedState=i.extend(!0,{},c);a._iDisplayStart=c.iStart;a.iInitDisplayStart=c.iStart;a._iDisplayEnd=c.iEnd;a._iDisplayLength=c.iLength;a.aaSorting=c.aaSorting.slice();a.saved_aaSorting=c.aaSorting.slice();i.extend(a.oPreviousSearch,c.oSearch);i.extend(!0,a.aoPreSearchCols,c.aoSearchCols);b.saved_aoColumns=[];for(d=0;d<c.abVisCols.length;d++)b.saved_aoColumns[d]={},b.saved_aoColumns[d].bVisible=c.abVisCols[d];C(a,"aoStateLoaded","stateLoaded",[a,c])}}}}function Ua(a){for(var b=
O.location.pathname.split("/"),a=a+"_"+b[b.length-1].replace(/[\/:]/g,"").toLowerCase()+"=",b=l.cookie.split(";"),c=0;c<b.length;c++){for(var d=b[c];" "==d.charAt(0);)d=d.substring(1,d.length);if(0===d.indexOf(a))return decodeURIComponent(d.substring(a.length,d.length))}return null}function u(a){for(var b=0;b<j.settings.length;b++)if(j.settings[b].nTable===a)return j.settings[b];return null}function U(a){for(var b=[],a=a.aoData,c=0,d=a.length;c<d;c++)null!==a[c].nTr&&b.push(a[c].nTr);return b}function L(a,
b){var c=[],d,h,f,e,i,j;h=0;var o=a.aoData.length;b!==n&&(h=b,o=b+1);for(f=h;f<o;f++)if(j=a.aoData[f],null!==j.nTr){h=[];e=0;for(i=j.nTr.childNodes.length;e<i;e++)d=j.nTr.childNodes[e].nodeName.toLowerCase(),("td"==d||"th"==d)&&h.push(j.nTr.childNodes[e]);e=d=0;for(i=a.aoColumns.length;e<i;e++)a.aoColumns[e].bVisible?c.push(h[e-d]):(c.push(j._anHidden[e]),d++)}return c}function E(a,b,c){a=null===a?"DataTables warning: "+c:"DataTables warning (table id = '"+a.sTableId+"'): "+c;if(0===b)if("alert"==
j.ext.sErrMode)alert(a);else throw Error(a);else O.console&&console.log&&console.log(a)}function p(a,b,c,d){d===n&&(d=c);b[c]!==n&&(a[d]=b[c])}function Va(a,b){var c,d;for(d in b)b.hasOwnProperty(d)&&(c=b[d],"object"===typeof e[d]&&null!==c&&!1===i.isArray(c)?i.extend(!0,a[d],c):a[d]=c);return a}function Sa(a,b,c){i(a).bind("click.DT",b,function(b){a.blur();c(b)}).bind("keypress.DT",b,function(a){13===a.which&&c(a)}).bind("selectstart.DT",function(){return!1})}function B(a,b,c,d){c&&a[b].push({fn:c,
sName:d})}function C(a,b,c,d){for(var b=a[b],h=[],e=b.length-1;0<=e;e--)h.push(b[e].fn.apply(a.oInstance,d));null!==c&&i(a.oInstance).trigger(c,d);return h}function Wa(a){var b=i('<div style="position:absolute; top:0; left:0; height:1px; width:1px; overflow:hidden"><div style="position:absolute; top:1px; left:1px; width:100px; height:50px; overflow:scroll;"><div id="DT_BrowserTest" style="width:100%; height:10px;"></div></div></div>')[0];l.body.appendChild(b);a.oBrowser.bScrollOversize=100===i("#DT_BrowserTest",
b)[0].offsetWidth?!0:!1;l.body.removeChild(b)}function Xa(a){return function(){var b=[u(this[j.ext.iApiIndex])].concat(Array.prototype.slice.call(arguments));return j.ext.oApi[a].apply(this,b)}}var V=/\[.*?\]$/,Ya=O.JSON?JSON.stringify:function(a){var b=typeof a;if("object"!==b||null===a)return"string"===b&&(a='"'+a+'"'),a+"";var c,d,h=[],e=i.isArray(a);for(c in a)d=a[c],b=typeof d,"string"===b?d='"'+d+'"':"object"===b&&null!==d&&(d=Ya(d)),h.push((e?"":'"'+c+'":')+d);return(e?"[":"{")+h+(e?"]":"}")};
this.$=function(a,b){var c,d,h=[],e;d=u(this[j.ext.iApiIndex]);var g=d.aoData,o=d.aiDisplay,k=d.aiDisplayMaster;b||(b={});b=i.extend({},{filter:"none",order:"current",page:"all"},b);if("current"==b.page){c=d._iDisplayStart;for(d=d.fnDisplayEnd();c<d;c++)(e=g[o[c]].nTr)&&h.push(e)}else if("current"==b.order&&"none"==b.filter){c=0;for(d=k.length;c<d;c++)(e=g[k[c]].nTr)&&h.push(e)}else if("current"==b.order&&"applied"==b.filter){c=0;for(d=o.length;c<d;c++)(e=g[o[c]].nTr)&&h.push(e)}else if("original"==
b.order&&"none"==b.filter){c=0;for(d=g.length;c<d;c++)(e=g[c].nTr)&&h.push(e)}else if("original"==b.order&&"applied"==b.filter){c=0;for(d=g.length;c<d;c++)e=g[c].nTr,-1!==i.inArray(c,o)&&e&&h.push(e)}else E(d,1,"Unknown selection options");h=i(h);c=h.filter(a);h=h.find(a);return i([].concat(i.makeArray(c),i.makeArray(h)))};this._=function(a,b){var c=[],d,e,f=this.$(a,b);d=0;for(e=f.length;d<e;d++)c.push(this.fnGetData(f[d]));return c};this.fnAddData=function(a,b){if(0===a.length)return[];var c=[],
d,e=u(this[j.ext.iApiIndex]);if("object"===typeof a[0]&&null!==a[0])for(var f=0;f<a.length;f++){d=J(e,a[f]);if(-1==d)return c;c.push(d)}else{d=J(e,a);if(-1==d)return c;c.push(d)}e.aiDisplay=e.aiDisplayMaster.slice();(b===n||b)&&aa(e);return c};this.fnAdjustColumnSizing=function(a){var b=u(this[j.ext.iApiIndex]);k(b);a===n||a?this.fnDraw(!1):(""!==b.oScroll.sX||""!==b.oScroll.sY)&&this.oApi._fnScrollDraw(b)};this.fnClearTable=function(a){var b=u(this[j.ext.iApiIndex]);fa(b);(a===n||a)&&z(b)};this.fnClose=
function(a){for(var b=u(this[j.ext.iApiIndex]),c=0;c<b.aoOpenRows.length;c++)if(b.aoOpenRows[c].nParent==a)return(a=b.aoOpenRows[c].nTr.parentNode)&&a.removeChild(b.aoOpenRows[c].nTr),b.aoOpenRows.splice(c,1),0;return 1};this.fnDeleteRow=function(a,b,c){var d=u(this[j.ext.iApiIndex]),e,f,a="object"===typeof a?K(d,a):a,g=d.aoData.splice(a,1);e=0;for(f=d.aoData.length;e<f;e++)null!==d.aoData[e].nTr&&(d.aoData[e].nTr._DT_RowIndex=e);e=i.inArray(a,d.aiDisplay);d.asDataSearch.splice(e,1);ga(d.aiDisplayMaster,
a);ga(d.aiDisplay,a);"function"===typeof b&&b.call(this,d,g);d._iDisplayStart>=d.fnRecordsDisplay()&&(d._iDisplayStart-=d._iDisplayLength,0>d._iDisplayStart&&(d._iDisplayStart=0));if(c===n||c)A(d),z(d);return g};this.fnDestroy=function(a){var b=u(this[j.ext.iApiIndex]),c=b.nTableWrapper.parentNode,d=b.nTBody,e,f,a=a===n?!1:!0;b.bDestroying=!0;C(b,"aoDestroyCallback","destroy",[b]);e=0;for(f=b.aoColumns.length;e<f;e++)!1===b.aoColumns[e].bVisible&&this.fnSetColumnVis(e,!0);i(b.nTableWrapper).find("*").andSelf().unbind(".DT");
i("tbody>tr>td."+b.oClasses.sRowEmpty,b.nTable).parent().remove();b.nTable!=b.nTHead.parentNode&&(i(b.nTable).children("thead").remove(),b.nTable.appendChild(b.nTHead));b.nTFoot&&b.nTable!=b.nTFoot.parentNode&&(i(b.nTable).children("tfoot").remove(),b.nTable.appendChild(b.nTFoot));b.nTable.parentNode.removeChild(b.nTable);i(b.nTableWrapper).remove();b.aaSorting=[];b.aaSortingFixed=[];R(b);i(U(b)).removeClass(b.asStripeClasses.join(" "));i("th, td",b.nTHead).removeClass([b.oClasses.sSortable,b.oClasses.sSortableAsc,
b.oClasses.sSortableDesc,b.oClasses.sSortableNone].join(" "));b.bJUI&&(i("th span."+b.oClasses.sSortIcon+", td span."+b.oClasses.sSortIcon,b.nTHead).remove(),i("th, td",b.nTHead).each(function(){var a=i("div."+b.oClasses.sSortJUIWrapper,this),c=a.contents();i(this).append(c);a.remove()}));!a&&b.nTableReinsertBefore?c.insertBefore(b.nTable,b.nTableReinsertBefore):a||c.appendChild(b.nTable);e=0;for(f=b.aoData.length;e<f;e++)null!==b.aoData[e].nTr&&d.appendChild(b.aoData[e].nTr);!0===b.oFeatures.bAutoWidth&&
(b.nTable.style.width=q(b.sDestroyWidth));i(d).children("tr:even").addClass(b.asDestroyStripes[0]);i(d).children("tr:odd").addClass(b.asDestroyStripes[1]);e=0;for(f=j.settings.length;e<f;e++)j.settings[e]==b&&j.settings.splice(e,1);b=null};this.fnDraw=function(a){var b=u(this[j.ext.iApiIndex]);!1===a?(A(b),z(b)):aa(b)};this.fnFilter=function(a,b,c,d,e,f){var g=u(this[j.ext.iApiIndex]);if(g.oFeatures.bFilter){if(c===n||null===c)c=!1;if(d===n||null===d)d=!0;if(e===n||null===e)e=!0;if(f===n||null===
f)f=!0;if(b===n||null===b){if(M(g,{sSearch:a+"",bRegex:c,bSmart:d,bCaseInsensitive:f},1),e&&g.aanFeatures.f){b=g.aanFeatures.f;c=0;for(d=b.length;c<d;c++)i(b[c]._DT_Input).val(a)}}else i.extend(g.aoPreSearchCols[b],{sSearch:a+"",bRegex:c,bSmart:d,bCaseInsensitive:f}),M(g,g.oPreviousSearch,1)}};this.fnGetData=function(a,b){var c=u(this[j.ext.iApiIndex]);if(a!==n){var d=a;if("object"===typeof a){var e=a.nodeName.toLowerCase();"tr"===e?d=K(c,a):"td"===e&&(d=K(c,a.parentNode),b=ea(c,d,a))}return b!==
n?x(c,d,b,""):c.aoData[d]!==n?c.aoData[d]._aData:null}return Z(c)};this.fnGetNodes=function(a){var b=u(this[j.ext.iApiIndex]);return a!==n?b.aoData[a]!==n?b.aoData[a].nTr:null:U(b)};this.fnGetPosition=function(a){var b=u(this[j.ext.iApiIndex]),c=a.nodeName.toUpperCase();return"TR"==c?K(b,a):"TD"==c||"TH"==c?(c=K(b,a.parentNode),a=ea(b,c,a),[c,t(b,a),a]):null};this.fnIsOpen=function(a){for(var b=u(this[j.ext.iApiIndex]),c=0;c<b.aoOpenRows.length;c++)if(b.aoOpenRows[c].nParent==a)return!0;return!1};
this.fnOpen=function(a,b,c){var d=u(this[j.ext.iApiIndex]),e=U(d);if(-1!==i.inArray(a,e)){this.fnClose(a);var e=l.createElement("tr"),f=l.createElement("td");e.appendChild(f);f.className=c;f.colSpan=w(d);"string"===typeof b?f.innerHTML=b:i(f).html(b);b=i("tr",d.nTBody);-1!=i.inArray(a,b)&&i(e).insertAfter(a);d.aoOpenRows.push({nTr:e,nParent:a});return e}};this.fnPageChange=function(a,b){var c=u(this[j.ext.iApiIndex]);pa(c,a);A(c);(b===n||b)&&z(c)};this.fnSetColumnVis=function(a,b,c){var d=u(this[j.ext.iApiIndex]),
e,f,g=d.aoColumns,i=d.aoData,o,m;if(g[a].bVisible!=b){if(b){for(e=f=0;e<a;e++)g[e].bVisible&&f++;m=f>=w(d);if(!m)for(e=a;e<g.length;e++)if(g[e].bVisible){o=e;break}e=0;for(f=i.length;e<f;e++)null!==i[e].nTr&&(m?i[e].nTr.appendChild(i[e]._anHidden[a]):i[e].nTr.insertBefore(i[e]._anHidden[a],L(d,e)[o]))}else{e=0;for(f=i.length;e<f;e++)null!==i[e].nTr&&(o=L(d,e)[a],i[e]._anHidden[a]=o,o.parentNode.removeChild(o))}g[a].bVisible=b;X(d,d.aoHeader);d.nTFoot&&X(d,d.aoFooter);e=0;for(f=d.aoOpenRows.length;e<
f;e++)d.aoOpenRows[e].nTr.colSpan=w(d);if(c===n||c)k(d),z(d);qa(d)}};this.fnSettings=function(){return u(this[j.ext.iApiIndex])};this.fnSort=function(a){var b=u(this[j.ext.iApiIndex]);b.aaSorting=a;Q(b)};this.fnSortListener=function(a,b,c){ha(u(this[j.ext.iApiIndex]),a,b,c)};this.fnUpdate=function(a,b,c,d,e){var f=u(this[j.ext.iApiIndex]),b="object"===typeof b?K(f,b):b;if(i.isArray(a)&&c===n){f.aoData[b]._aData=a.slice();for(c=0;c<f.aoColumns.length;c++)this.fnUpdate(x(f,b,c),b,c,!1,!1)}else if(i.isPlainObject(a)&&
c===n){f.aoData[b]._aData=i.extend(!0,{},a);for(c=0;c<f.aoColumns.length;c++)this.fnUpdate(x(f,b,c),b,c,!1,!1)}else{I(f,b,c,a);var a=x(f,b,c,"display"),g=f.aoColumns[c];null!==g.fnRender&&(a=T(f,b,c),g.bUseRendered&&I(f,b,c,a));null!==f.aoData[b].nTr&&(L(f,b)[c].innerHTML=a)}c=i.inArray(b,f.aiDisplay);f.asDataSearch[c]=ma(f,Y(f,b,"filter",v(f,"bSearchable")));(e===n||e)&&k(f);(d===n||d)&&aa(f);return 0};this.fnVersionCheck=j.ext.fnVersionCheck;this.oApi={_fnExternApiFunc:Xa,_fnInitialise:ba,_fnInitComplete:$,
_fnLanguageCompat:oa,_fnAddColumn:o,_fnColumnOptions:r,_fnAddData:J,_fnCreateTr:da,_fnGatherData:va,_fnBuildHead:wa,_fnDrawHead:X,_fnDraw:z,_fnReDraw:aa,_fnAjaxUpdate:xa,_fnAjaxParameters:Fa,_fnAjaxUpdateDraw:Ga,_fnServerParams:ja,_fnAddOptionsHtml:ya,_fnFeatureHtmlTable:Ca,_fnScrollDraw:Ma,_fnAdjustColumnSizing:k,_fnFeatureHtmlFilter:Aa,_fnFilterComplete:M,_fnFilterCustom:Ja,_fnFilterColumn:Ia,_fnFilter:Ha,_fnBuildSearchArray:ka,_fnBuildSearchRow:ma,_fnFilterCreateSearch:la,_fnDataToSearch:Ka,_fnSort:Q,
_fnSortAttachListener:ha,_fnSortingClasses:R,_fnFeatureHtmlPaginate:Ea,_fnPageChange:pa,_fnFeatureHtmlInfo:Da,_fnUpdateInfo:La,_fnFeatureHtmlLength:za,_fnFeatureHtmlProcessing:Ba,_fnProcessingDisplay:F,_fnVisibleToColumnIndex:G,_fnColumnIndexToVisible:t,_fnNodeToDataIndex:K,_fnVisbleColumns:w,_fnCalculateEnd:A,_fnConvertToWidth:Na,_fnCalculateColumnWidths:ca,_fnScrollingWidthAdjust:Pa,_fnGetWidestNode:Oa,_fnGetMaxLenString:Qa,_fnStringToCss:q,_fnDetectType:D,_fnSettingsFromNode:u,_fnGetDataMaster:Z,
_fnGetTrNodes:U,_fnGetTdNodes:L,_fnEscapeRegex:na,_fnDeleteIndex:ga,_fnReOrderIndex:y,_fnColumnOrdering:H,_fnLog:E,_fnClearTable:fa,_fnSaveState:qa,_fnLoadState:Ta,_fnCreateCookie:function(a,b,c,d,e){var f=new Date;f.setTime(f.getTime()+1E3*c);var c=O.location.pathname.split("/"),a=a+"_"+c.pop().replace(/[\/:]/g,"").toLowerCase(),g;null!==e?(g="function"===typeof i.parseJSON?i.parseJSON(b):eval("("+b+")"),b=e(a,g,f.toGMTString(),c.join("/")+"/")):b=a+"="+encodeURIComponent(b)+"; expires="+f.toGMTString()+
"; path="+c.join("/")+"/";e="";f=9999999999999;if(4096<(null!==Ua(a)?l.cookie.length:b.length+l.cookie.length)+10){for(var a=l.cookie.split(";"),j=0,o=a.length;j<o;j++)if(-1!=a[j].indexOf(d)){var k=a[j].split("=");try{g=eval("("+decodeURIComponent(k[1])+")")}catch(r){continue}g.iCreate&&g.iCreate<f&&(e=k[0],f=g.iCreate)}""!==e&&(l.cookie=e+"=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path="+c.join("/")+"/")}l.cookie=b},_fnReadCookie:Ua,_fnDetectHeader:W,_fnGetUniqueThs:P,_fnScrollBarWidth:Ra,_fnApplyToChildren:N,
_fnMap:p,_fnGetRowData:Y,_fnGetCellData:x,_fnSetCellData:I,_fnGetObjectDataFn:S,_fnSetObjectDataFn:ta,_fnApplyColumnDefs:ua,_fnBindAction:Sa,_fnExtend:Va,_fnCallbackReg:B,_fnCallbackFire:C,_fnJsonString:Ya,_fnRender:T,_fnNodeToColumnIndex:ea,_fnInfoMacros:ia,_fnBrowserDetect:Wa,_fnGetColumns:v};i.extend(j.ext.oApi,this.oApi);for(var ra in j.ext.oApi)ra&&(this[ra]=Xa(ra));var sa=this;return this.each(function(){var a=0,b,c,d;c=this.getAttribute("id");var h=!1,f=!1;if("table"!=this.nodeName.toLowerCase())E(null,
0,"Attempted to initialise DataTables on a node which is not a table: "+this.nodeName);else{a=0;for(b=j.settings.length;a<b;a++){if(j.settings[a].nTable==this){if(e===n||e.bRetrieve)return j.settings[a].oInstance;if(e.bDestroy){j.settings[a].oInstance.fnDestroy();break}else{E(j.settings[a],0,"Cannot reinitialise DataTable.\n\nTo retrieve the DataTables object for this table, pass no arguments or see the docs for bRetrieve and bDestroy");return}}if(j.settings[a].sTableId==this.id){j.settings.splice(a,
1);break}}if(null===c||""===c)this.id=c="DataTables_Table_"+j.ext._oExternConfig.iNextUnique++;var g=i.extend(!0,{},j.models.oSettings,{nTable:this,oApi:sa.oApi,oInit:e,sDestroyWidth:i(this).width(),sInstance:c,sTableId:c});j.settings.push(g);g.oInstance=1===sa.length?sa:i(this).dataTable();e||(e={});e.oLanguage&&oa(e.oLanguage);e=Va(i.extend(!0,{},j.defaults),e);p(g.oFeatures,e,"bPaginate");p(g.oFeatures,e,"bLengthChange");p(g.oFeatures,e,"bFilter");p(g.oFeatures,e,"bSort");p(g.oFeatures,e,"bInfo");
p(g.oFeatures,e,"bProcessing");p(g.oFeatures,e,"bAutoWidth");p(g.oFeatures,e,"bSortClasses");p(g.oFeatures,e,"bServerSide");p(g.oFeatures,e,"bDeferRender");p(g.oScroll,e,"sScrollX","sX");p(g.oScroll,e,"sScrollXInner","sXInner");p(g.oScroll,e,"sScrollY","sY");p(g.oScroll,e,"bScrollCollapse","bCollapse");p(g.oScroll,e,"bScrollInfinite","bInfinite");p(g.oScroll,e,"iScrollLoadGap","iLoadGap");p(g.oScroll,e,"bScrollAutoCss","bAutoCss");p(g,e,"asStripeClasses");p(g,e,"asStripClasses","asStripeClasses");
p(g,e,"fnServerData");p(g,e,"fnFormatNumber");p(g,e,"sServerMethod");p(g,e,"aaSorting");p(g,e,"aaSortingFixed");p(g,e,"aLengthMenu");p(g,e,"sPaginationType");p(g,e,"sAjaxSource");p(g,e,"sAjaxDataProp");p(g,e,"iCookieDuration");p(g,e,"sCookiePrefix");p(g,e,"sDom");p(g,e,"bSortCellsTop");p(g,e,"iTabIndex");p(g,e,"oSearch","oPreviousSearch");p(g,e,"aoSearchCols","aoPreSearchCols");p(g,e,"iDisplayLength","_iDisplayLength");p(g,e,"bJQueryUI","bJUI");p(g,e,"fnCookieCallback");p(g,e,"fnStateLoad");p(g,e,
"fnStateSave");p(g.oLanguage,e,"fnInfoCallback");B(g,"aoDrawCallback",e.fnDrawCallback,"user");B(g,"aoServerParams",e.fnServerParams,"user");B(g,"aoStateSaveParams",e.fnStateSaveParams,"user");B(g,"aoStateLoadParams",e.fnStateLoadParams,"user");B(g,"aoStateLoaded",e.fnStateLoaded,"user");B(g,"aoRowCallback",e.fnRowCallback,"user");B(g,"aoRowCreatedCallback",e.fnCreatedRow,"user");B(g,"aoHeaderCallback",e.fnHeaderCallback,"user");B(g,"aoFooterCallback",e.fnFooterCallback,"user");B(g,"aoInitComplete",
e.fnInitComplete,"user");B(g,"aoPreDrawCallback",e.fnPreDrawCallback,"user");g.oFeatures.bServerSide&&g.oFeatures.bSort&&g.oFeatures.bSortClasses?B(g,"aoDrawCallback",R,"server_side_sort_classes"):g.oFeatures.bDeferRender&&B(g,"aoDrawCallback",R,"defer_sort_classes");e.bJQueryUI?(i.extend(g.oClasses,j.ext.oJUIClasses),e.sDom===j.defaults.sDom&&"lfrtip"===j.defaults.sDom&&(g.sDom='<"H"lfr>t<"F"ip>')):i.extend(g.oClasses,j.ext.oStdClasses);i(this).addClass(g.oClasses.sTable);if(""!==g.oScroll.sX||""!==
g.oScroll.sY)g.oScroll.iBarWidth=Ra();g.iInitDisplayStart===n&&(g.iInitDisplayStart=e.iDisplayStart,g._iDisplayStart=e.iDisplayStart);e.bStateSave&&(g.oFeatures.bStateSave=!0,Ta(g,e),B(g,"aoDrawCallback",qa,"state_save"));null!==e.iDeferLoading&&(g.bDeferLoading=!0,a=i.isArray(e.iDeferLoading),g._iRecordsDisplay=a?e.iDeferLoading[0]:e.iDeferLoading,g._iRecordsTotal=a?e.iDeferLoading[1]:e.iDeferLoading);null!==e.aaData&&(f=!0);""!==e.oLanguage.sUrl?(g.oLanguage.sUrl=e.oLanguage.sUrl,i.getJSON(g.oLanguage.sUrl,
null,function(a){oa(a);i.extend(true,g.oLanguage,e.oLanguage,a);ba(g)}),h=!0):i.extend(!0,g.oLanguage,e.oLanguage);null===e.asStripeClasses&&(g.asStripeClasses=[g.oClasses.sStripeOdd,g.oClasses.sStripeEven]);c=!1;d=i(this).children("tbody").children("tr");a=0;for(b=g.asStripeClasses.length;a<b;a++)if(d.filter(":lt(2)").hasClass(g.asStripeClasses[a])){c=!0;break}c&&(g.asDestroyStripes=["",""],i(d[0]).hasClass(g.oClasses.sStripeOdd)&&(g.asDestroyStripes[0]+=g.oClasses.sStripeOdd+" "),i(d[0]).hasClass(g.oClasses.sStripeEven)&&
(g.asDestroyStripes[0]+=g.oClasses.sStripeEven),i(d[1]).hasClass(g.oClasses.sStripeOdd)&&(g.asDestroyStripes[1]+=g.oClasses.sStripeOdd+" "),i(d[1]).hasClass(g.oClasses.sStripeEven)&&(g.asDestroyStripes[1]+=g.oClasses.sStripeEven),d.removeClass(g.asStripeClasses.join(" ")));c=[];a=this.getElementsByTagName("thead");0!==a.length&&(W(g.aoHeader,a[0]),c=P(g));if(null===e.aoColumns){d=[];a=0;for(b=c.length;a<b;a++)d.push(null)}else d=e.aoColumns;a=0;for(b=d.length;a<b;a++)e.saved_aoColumns!==n&&e.saved_aoColumns.length==
b&&(null===d[a]&&(d[a]={}),d[a].bVisible=e.saved_aoColumns[a].bVisible),o(g,c?c[a]:null);ua(g,e.aoColumnDefs,d,function(a,b){r(g,a,b)});a=0;for(b=g.aaSorting.length;a<b;a++){g.aaSorting[a][0]>=g.aoColumns.length&&(g.aaSorting[a][0]=0);var k=g.aoColumns[g.aaSorting[a][0]];g.aaSorting[a][2]===n&&(g.aaSorting[a][2]=0);e.aaSorting===n&&g.saved_aaSorting===n&&(g.aaSorting[a][1]=k.asSorting[0]);c=0;for(d=k.asSorting.length;c<d;c++)if(g.aaSorting[a][1]==k.asSorting[c]){g.aaSorting[a][2]=c;break}}R(g);Wa(g);
a=i(this).children("caption").each(function(){this._captionSide=i(this).css("caption-side")});b=i(this).children("thead");0===b.length&&(b=[l.createElement("thead")],this.appendChild(b[0]));g.nTHead=b[0];b=i(this).children("tbody");0===b.length&&(b=[l.createElement("tbody")],this.appendChild(b[0]));g.nTBody=b[0];g.nTBody.setAttribute("role","alert");g.nTBody.setAttribute("aria-live","polite");g.nTBody.setAttribute("aria-relevant","all");b=i(this).children("tfoot");if(0===b.length&&0<a.length&&(""!==
g.oScroll.sX||""!==g.oScroll.sY))b=[l.createElement("tfoot")],this.appendChild(b[0]);0<b.length&&(g.nTFoot=b[0],W(g.aoFooter,g.nTFoot));if(f)for(a=0;a<e.aaData.length;a++)J(g,e.aaData[a]);else va(g);g.aiDisplay=g.aiDisplayMaster.slice();g.bInitialised=!0;!1===h&&ba(g)}})};j.fnVersionCheck=function(e){for(var i=function(e,i){for(;e.length<i;)e+="0";return e},r=j.ext.sVersion.split("."),e=e.split("."),k="",l="",n=0,w=e.length;n<w;n++)k+=i(r[n],3),l+=i(e[n],3);return parseInt(k,10)>=parseInt(l,10)};
j.fnIsDataTable=function(e){for(var i=j.settings,r=0;r<i.length;r++)if(i[r].nTable===e||i[r].nScrollHead===e||i[r].nScrollFoot===e)return!0;return!1};j.fnTables=function(e){var o=[];jQuery.each(j.settings,function(j,k){(!e||!0===e&&i(k.nTable).is(":visible"))&&o.push(k.nTable)});return o};j.version="1.9.3";j.settings=[];j.models={};j.models.ext={afnFiltering:[],afnSortData:[],aoFeatures:[],aTypes:[],fnVersionCheck:j.fnVersionCheck,iApiIndex:0,ofnSearch:{},oApi:{},oStdClasses:{},oJUIClasses:{},oPagination:{},
oSort:{},sVersion:j.version,sErrMode:"alert",_oExternConfig:{iNextUnique:0}};j.models.oSearch={bCaseInsensitive:!0,sSearch:"",bRegex:!1,bSmart:!0};j.models.oRow={nTr:null,_aData:[],_aSortData:[],_anHidden:[],_sRowStripe:""};j.models.oColumn={aDataSort:null,asSorting:null,bSearchable:null,bSortable:null,bUseRendered:null,bVisible:null,_bAutoType:!0,fnCreatedCell:null,fnGetData:null,fnRender:null,fnSetData:null,mData:null,mRender:null,nTh:null,nTf:null,sClass:null,sContentPadding:null,sDefaultContent:null,
sName:null,sSortDataType:"std",sSortingClass:null,sSortingClassJUI:null,sTitle:null,sType:null,sWidth:null,sWidthOrig:null};j.defaults={aaData:null,aaSorting:[[0,"asc"]],aaSortingFixed:null,aLengthMenu:[10,25,50,100],aoColumns:null,aoColumnDefs:null,aoSearchCols:[],asStripeClasses:null,bAutoWidth:!0,bDeferRender:!1,bDestroy:!1,bFilter:!0,bInfo:!0,bJQueryUI:!1,bLengthChange:!0,bPaginate:!0,bProcessing:!1,bRetrieve:!1,bScrollAutoCss:!0,bScrollCollapse:!1,bScrollInfinite:!1,bServerSide:!1,bSort:!0,bSortCellsTop:!1,
bSortClasses:!0,bStateSave:!1,fnCookieCallback:null,fnCreatedRow:null,fnDrawCallback:null,fnFooterCallback:null,fnFormatNumber:function(e){if(1E3>e)return e;for(var i=e+"",e=i.split(""),j="",i=i.length,k=0;k<i;k++)0===k%3&&0!==k&&(j=this.oLanguage.sInfoThousands+j),j=e[i-k-1]+j;return j},fnHeaderCallback:null,fnInfoCallback:null,fnInitComplete:null,fnPreDrawCallback:null,fnRowCallback:null,fnServerData:function(e,j,n,k){k.jqXHR=i.ajax({url:e,data:j,success:function(e){e.sError&&k.oApi._fnLog(k,0,
e.sError);i(k.oInstance).trigger("xhr",[k,e]);n(e)},dataType:"json",cache:!1,type:k.sServerMethod,error:function(e,i){"parsererror"==i&&k.oApi._fnLog(k,0,"DataTables warning: JSON data from server could not be parsed. This is caused by a JSON formatting error.")}})},fnServerParams:null,fnStateLoad:function(e){var e=this.oApi._fnReadCookie(e.sCookiePrefix+e.sInstance),j;try{j="function"===typeof i.parseJSON?i.parseJSON(e):eval("("+e+")")}catch(n){j=null}return j},fnStateLoadParams:null,fnStateLoaded:null,
fnStateSave:function(e,i){this.oApi._fnCreateCookie(e.sCookiePrefix+e.sInstance,this.oApi._fnJsonString(i),e.iCookieDuration,e.sCookiePrefix,e.fnCookieCallback)},fnStateSaveParams:null,iCookieDuration:7200,iDeferLoading:null,iDisplayLength:10,iDisplayStart:0,iScrollLoadGap:100,iTabIndex:0,oLanguage:{oAria:{sSortAscending:": activate to sort column ascending",sSortDescending:": activate to sort column descending"},oPaginate:{sFirst:"First",sLast:"Last",sNext:"Next",sPrevious:"Previous"},sEmptyTable:"No data available in table",
sInfo:"Showing _START_ to _END_ of _TOTAL_ entries",sInfoEmpty:"Showing 0 to 0 of 0 entries",sInfoFiltered:"(filtered from _MAX_ total entries)",sInfoPostFix:"",sInfoThousands:",",sLengthMenu:"Show _MENU_ entries",sLoadingRecords:"Loading...",sProcessing:"Processing...",sSearch:"Search:",sUrl:"",sZeroRecords:"No matching records found"},oSearch:i.extend({},j.models.oSearch),sAjaxDataProp:"aaData",sAjaxSource:null,sCookiePrefix:"SpryMedia_DataTables_",sDom:"lfrtip",sPaginationType:"two_button",sScrollX:"",
sScrollXInner:"",sScrollY:"",sServerMethod:"GET"};j.defaults.columns={aDataSort:null,asSorting:["asc","desc"],bSearchable:!0,bSortable:!0,bUseRendered:!0,bVisible:!0,fnCreatedCell:null,fnRender:null,iDataSort:-1,mData:null,mRender:null,sCellType:"td",sClass:"",sContentPadding:"",sDefaultContent:null,sName:"",sSortDataType:"std",sTitle:null,sType:null,sWidth:null};j.models.oSettings={oFeatures:{bAutoWidth:null,bDeferRender:null,bFilter:null,bInfo:null,bLengthChange:null,bPaginate:null,bProcessing:null,
bServerSide:null,bSort:null,bSortClasses:null,bStateSave:null},oScroll:{bAutoCss:null,bCollapse:null,bInfinite:null,iBarWidth:0,iLoadGap:null,sX:null,sXInner:null,sY:null},oLanguage:{fnInfoCallback:null},oBrowser:{bScrollOversize:!1},aanFeatures:[],aoData:[],aiDisplay:[],aiDisplayMaster:[],aoColumns:[],aoHeader:[],aoFooter:[],asDataSearch:[],oPreviousSearch:{},aoPreSearchCols:[],aaSorting:null,aaSortingFixed:null,asStripeClasses:null,asDestroyStripes:[],sDestroyWidth:0,aoRowCallback:[],aoHeaderCallback:[],
aoFooterCallback:[],aoDrawCallback:[],aoRowCreatedCallback:[],aoPreDrawCallback:[],aoInitComplete:[],aoStateSaveParams:[],aoStateLoadParams:[],aoStateLoaded:[],sTableId:"",nTable:null,nTHead:null,nTFoot:null,nTBody:null,nTableWrapper:null,bDeferLoading:!1,bInitialised:!1,aoOpenRows:[],sDom:null,sPaginationType:"two_button",iCookieDuration:0,sCookiePrefix:"",fnCookieCallback:null,aoStateSave:[],aoStateLoad:[],oLoadedState:null,sAjaxSource:null,sAjaxDataProp:null,bAjaxDataGet:!0,jqXHR:null,fnServerData:null,
aoServerParams:[],sServerMethod:null,fnFormatNumber:null,aLengthMenu:null,iDraw:0,bDrawing:!1,iDrawError:-1,_iDisplayLength:10,_iDisplayStart:0,_iDisplayEnd:10,_iRecordsTotal:0,_iRecordsDisplay:0,bJUI:null,oClasses:{},bFiltered:!1,bSorted:!1,bSortCellsTop:null,oInit:null,aoDestroyCallback:[],fnRecordsTotal:function(){return this.oFeatures.bServerSide?parseInt(this._iRecordsTotal,10):this.aiDisplayMaster.length},fnRecordsDisplay:function(){return this.oFeatures.bServerSide?parseInt(this._iRecordsDisplay,
10):this.aiDisplay.length},fnDisplayEnd:function(){return this.oFeatures.bServerSide?!1===this.oFeatures.bPaginate||-1==this._iDisplayLength?this._iDisplayStart+this.aiDisplay.length:Math.min(this._iDisplayStart+this._iDisplayLength,this._iRecordsDisplay):this._iDisplayEnd},oInstance:null,sInstance:null,iTabIndex:0,nScrollHead:null,nScrollFoot:null};j.ext=i.extend(!0,{},j.models.ext);i.extend(j.ext.oStdClasses,{sTable:"dataTable",sPagePrevEnabled:"paginate_enabled_previous",sPagePrevDisabled:"paginate_disabled_previous",
sPageNextEnabled:"paginate_enabled_next",sPageNextDisabled:"paginate_disabled_next",sPageJUINext:"",sPageJUIPrev:"",sPageButton:"paginate_button",sPageButtonActive:"paginate_active",sPageButtonStaticDisabled:"paginate_button paginate_button_disabled",sPageFirst:"first",sPagePrevious:"previous",sPageNext:"next",sPageLast:"last",sStripeOdd:"odd",sStripeEven:"even",sRowEmpty:"dataTables_empty",sWrapper:"dataTables_wrapper",sFilter:"dataTables_filter",sInfo:"dataTables_info",sPaging:"dataTables_paginate paging_",
sLength:"dataTables_length",sProcessing:"dataTables_processing",sSortAsc:"sorting_asc",sSortDesc:"sorting_desc",sSortable:"sorting",sSortableAsc:"sorting_asc_disabled",sSortableDesc:"sorting_desc_disabled",sSortableNone:"sorting_disabled",sSortColumn:"sorting_",sSortJUIAsc:"",sSortJUIDesc:"",sSortJUI:"",sSortJUIAscAllowed:"",sSortJUIDescAllowed:"",sSortJUIWrapper:"",sSortIcon:"",sScrollWrapper:"dataTables_scroll",sScrollHead:"dataTables_scrollHead",sScrollHeadInner:"dataTables_scrollHeadInner",sScrollBody:"dataTables_scrollBody",
sScrollFoot:"dataTables_scrollFoot",sScrollFootInner:"dataTables_scrollFootInner",sFooterTH:"",sJUIHeader:"",sJUIFooter:""});i.extend(j.ext.oJUIClasses,j.ext.oStdClasses,{sPagePrevEnabled:"fg-button ui-button ui-state-default ui-corner-left",sPagePrevDisabled:"fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",sPageNextEnabled:"fg-button ui-button ui-state-default ui-corner-right",sPageNextDisabled:"fg-button ui-button ui-state-default ui-corner-right ui-state-disabled",sPageJUINext:"ui-icon ui-icon-circle-arrow-e",
sPageJUIPrev:"ui-icon ui-icon-circle-arrow-w",sPageButton:"fg-button ui-button ui-state-default",sPageButtonActive:"fg-button ui-button ui-state-default ui-state-disabled",sPageButtonStaticDisabled:"fg-button ui-button ui-state-default ui-state-disabled",sPageFirst:"first ui-corner-tl ui-corner-bl",sPageLast:"last ui-corner-tr ui-corner-br",sPaging:"dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi ui-buttonset-multi paging_",sSortAsc:"ui-state-default",sSortDesc:"ui-state-default",
sSortable:"ui-state-default",sSortableAsc:"ui-state-default",sSortableDesc:"ui-state-default",sSortableNone:"ui-state-default",sSortJUIAsc:"css_right ui-icon ui-icon-triangle-1-n",sSortJUIDesc:"css_right ui-icon ui-icon-triangle-1-s",sSortJUI:"css_right ui-icon ui-icon-carat-2-n-s",sSortJUIAscAllowed:"css_right ui-icon ui-icon-carat-1-n",sSortJUIDescAllowed:"css_right ui-icon ui-icon-carat-1-s",sSortJUIWrapper:"DataTables_sort_wrapper",sSortIcon:"DataTables_sort_icon",sScrollHead:"dataTables_scrollHead ui-state-default",
sScrollFoot:"dataTables_scrollFoot ui-state-default",sFooterTH:"ui-state-default",sJUIHeader:"fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix",sJUIFooter:"fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix"});i.extend(j.ext.oPagination,{two_button:{fnInit:function(e,j,n){var k=e.oLanguage.oPaginate,l=function(i){e.oApi._fnPageChange(e,i.data.action)&&n(e)},k=!e.bJUI?'<a class="'+e.oClasses.sPagePrevDisabled+'" tabindex="'+e.iTabIndex+
'" role="button">'+k.sPrevious+'</a><a class="'+e.oClasses.sPageNextDisabled+'" tabindex="'+e.iTabIndex+'" role="button">'+k.sNext+"</a>":'<a class="'+e.oClasses.sPagePrevDisabled+'" tabindex="'+e.iTabIndex+'" role="button"><span class="'+e.oClasses.sPageJUIPrev+'"></span></a><a class="'+e.oClasses.sPageNextDisabled+'" tabindex="'+e.iTabIndex+'" role="button"><span class="'+e.oClasses.sPageJUINext+'"></span></a>';i(j).append(k);var t=i("a",j),k=t[0],t=t[1];e.oApi._fnBindAction(k,{action:"previous"},
l);e.oApi._fnBindAction(t,{action:"next"},l);e.aanFeatures.p||(j.id=e.sTableId+"_paginate",k.id=e.sTableId+"_previous",t.id=e.sTableId+"_next",k.setAttribute("aria-controls",e.sTableId),t.setAttribute("aria-controls",e.sTableId))},fnUpdate:function(e){if(e.aanFeatures.p)for(var i=e.oClasses,j=e.aanFeatures.p,k=0,n=j.length;k<n;k++)0!==j[k].childNodes.length&&(j[k].childNodes[0].className=0===e._iDisplayStart?i.sPagePrevDisabled:i.sPagePrevEnabled,j[k].childNodes[1].className=e.fnDisplayEnd()==e.fnRecordsDisplay()?
i.sPageNextDisabled:i.sPageNextEnabled)}},iFullNumbersShowPages:5,full_numbers:{fnInit:function(e,j,n){var k=e.oLanguage.oPaginate,l=e.oClasses,t=function(i){e.oApi._fnPageChange(e,i.data.action)&&n(e)};i(j).append('<a  tabindex="'+e.iTabIndex+'" class="'+l.sPageButton+" "+l.sPageFirst+'">'+k.sFirst+'</a><a  tabindex="'+e.iTabIndex+'" class="'+l.sPageButton+" "+l.sPagePrevious+'">'+k.sPrevious+'</a><span></span><a tabindex="'+e.iTabIndex+'" class="'+l.sPageButton+" "+l.sPageNext+'">'+k.sNext+'</a><a tabindex="'+
e.iTabIndex+'" class="'+l.sPageButton+" "+l.sPageLast+'">'+k.sLast+"</a>");var w=i("a",j),k=w[0],l=w[1],v=w[2],w=w[3];e.oApi._fnBindAction(k,{action:"first"},t);e.oApi._fnBindAction(l,{action:"previous"},t);e.oApi._fnBindAction(v,{action:"next"},t);e.oApi._fnBindAction(w,{action:"last"},t);e.aanFeatures.p||(j.id=e.sTableId+"_paginate",k.id=e.sTableId+"_first",l.id=e.sTableId+"_previous",v.id=e.sTableId+"_next",w.id=e.sTableId+"_last")},fnUpdate:function(e,o){if(e.aanFeatures.p){var l=j.ext.oPagination.iFullNumbersShowPages,
k=Math.floor(l/2),n=Math.ceil(e.fnRecordsDisplay()/e._iDisplayLength),t=Math.ceil(e._iDisplayStart/e._iDisplayLength)+1,w="",v,D=e.oClasses,y,H=e.aanFeatures.p,O=function(i){e.oApi._fnBindAction(this,{page:i+v-1},function(i){e.oApi._fnPageChange(e,i.data.page);o(e);i.preventDefault()})};-1===e._iDisplayLength?t=k=v=1:n<l?(v=1,k=n):t<=k?(v=1,k=l):t>=n-k?(v=n-l+1,k=n):(v=t-Math.ceil(l/2)+1,k=v+l-1);for(l=v;l<=k;l++)w+=t!==l?'<a tabindex="'+e.iTabIndex+'" class="'+D.sPageButton+'">'+e.fnFormatNumber(l)+
"</a>":'<a tabindex="'+e.iTabIndex+'" class="'+D.sPageButtonActive+'">'+e.fnFormatNumber(l)+"</a>";l=0;for(k=H.length;l<k;l++)0!==H[l].childNodes.length&&(i("span:eq(0)",H[l]).html(w).children("a").each(O),y=H[l].getElementsByTagName("a"),y=[y[0],y[1],y[y.length-2],y[y.length-1]],i(y).removeClass(D.sPageButton+" "+D.sPageButtonActive+" "+D.sPageButtonStaticDisabled),i([y[0],y[1]]).addClass(1==t?D.sPageButtonStaticDisabled:D.sPageButton),i([y[2],y[3]]).addClass(0===n||t===n||-1===e._iDisplayLength?
D.sPageButtonStaticDisabled:D.sPageButton))}}}});i.extend(j.ext.oSort,{"string-pre":function(e){"string"!=typeof e&&(e=null!==e&&e.toString?e.toString():"");return e.toLowerCase()},"string-asc":function(e,i){return e<i?-1:e>i?1:0},"string-desc":function(e,i){return e<i?1:e>i?-1:0},"html-pre":function(e){return e.replace(/<.*?>/g,"").toLowerCase()},"html-asc":function(e,i){return e<i?-1:e>i?1:0},"html-desc":function(e,i){return e<i?1:e>i?-1:0},"date-pre":function(e){e=Date.parse(e);if(isNaN(e)||""===
e)e=Date.parse("01/01/1970 00:00:00");return e},"date-asc":function(e,i){return e-i},"date-desc":function(e,i){return i-e},"numeric-pre":function(e){return"-"==e||""===e?0:1*e},"numeric-asc":function(e,i){return e-i},"numeric-desc":function(e,i){return i-e}});i.extend(j.ext.aTypes,[function(e){if("number"===typeof e)return"numeric";if("string"!==typeof e)return null;var i,j=!1;i=e.charAt(0);if(-1=="0123456789-".indexOf(i))return null;for(var k=1;k<e.length;k++){i=e.charAt(k);if(-1=="0123456789.".indexOf(i))return null;
if("."==i){if(j)return null;j=!0}}return"numeric"},function(e){var i=Date.parse(e);return null!==i&&!isNaN(i)||"string"===typeof e&&0===e.length?"date":null},function(e){return"string"===typeof e&&-1!=e.indexOf("<")&&-1!=e.indexOf(">")?"html":null}]);i.fn.DataTable=j;i.fn.dataTable=j;i.fn.dataTableSettings=j.settings;i.fn.dataTableExt=j.ext})(jQuery,window,document,void 0);

;
/**
*	@name							Elastic
*	@descripton						Elastic is jQuery plugin that grow and shrink your textareas automatically
*	@version						1.6.11
*	@requires						jQuery 1.2.6+
*
*	@author							Jan Jarfalk
*	@author-email					jan.jarfalk@unwrongest.com
*	@author-website					http://www.unwrongest.com
*
*	@licence						MIT License - http://www.opensource.org/licenses/mit-license.php
*/

(function($){ 
	jQuery.fn.extend({  
		elastic: function() {
		
			//	We will create a div clone of the textarea
			//	by copying these attributes from the textarea to the div.
			var mimics = [
				'paddingTop',
				'paddingRight',
				'paddingBottom',
				'paddingLeft',
				'fontSize',
				'lineHeight',
				'fontFamily',
				'width',
				'fontWeight',
				'border-top-width',
				'border-right-width',
				'border-bottom-width',
				'border-left-width',
				'borderTopStyle',
				'borderTopColor',
				'borderRightStyle',
				'borderRightColor',
				'borderBottomStyle',
				'borderBottomColor',
				'borderLeftStyle',
				'borderLeftColor'
				];
			
			return this.each( function() {

				// Elastic only works on textareas
				if ( this.type !== 'textarea' ) {
					return false;
				}
					
			var $textarea	= jQuery(this),
				$twin		= jQuery('<div />').css({
					'position'		: 'absolute',
					'display'		: 'none',
					'word-wrap'		: 'break-word',
					'white-space'	:'pre-wrap'
				}),
				lineHeight	= parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
				minheight	= parseInt($textarea.css('height'),10) || lineHeight*3,
				maxheight	= parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
				goalheight	= 0;
				
				// Opera returns max-height of -1 if not set
				if (maxheight < 0) { maxheight = Number.MAX_VALUE; }
					
				// Append the twin to the DOM
				// We are going to meassure the height of this, not the textarea.
				$twin.appendTo($textarea.parent());
				
				// Copy the essential styles (mimics) from the textarea to the twin
				var i = mimics.length;
				while(i--){
					$twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
				}
				
				// Updates the width of the twin. (solution for textareas with widths in percent)
				function setTwinWidth(){
					var curatedWidth = Math.floor(parseInt($textarea.width(),10));
					if($twin.width() !== curatedWidth){
						$twin.css({'width': curatedWidth + 'px'});
						
						// Update height of textarea
						update(true);
					}
				}
				
				// Sets a given height and overflow state on the textarea
				function setHeightAndOverflow(height, overflow){
				
					var curratedHeight = Math.floor(parseInt(height,10));
					if($textarea.height() !== curratedHeight){
						$textarea.css({'height': curratedHeight + 'px','overflow':overflow});
					}
				}
				
				// This function will update the height of the textarea if necessary 
				function update(forced) {
					
					// Get curated content from the textarea.
					var textareaContent = $textarea.val().replace(/&/g,'&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');
					
					// Compare curated content with curated twin.
					var twinContent = $twin.html().replace(/<br>/ig,'<br />');
					
					if(forced || textareaContent+'&nbsp;' !== twinContent){
					
						// Add an extra white space so new rows are added when you are at the end of a row.
						$twin.html(textareaContent+'&nbsp;');
						
						// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
						if(Math.abs($twin.height() + lineHeight - $textarea.height()) > 3){
							
							var goalheight = $twin.height()+lineHeight;
							if(goalheight >= maxheight) {
								setHeightAndOverflow(maxheight,'auto');
							} else if(goalheight <= minheight) {
								setHeightAndOverflow(minheight,'hidden');
							} else {
								setHeightAndOverflow(goalheight,'hidden');
							}
							
						}
						
					}
					
				}
				
				// Hide scrollbars
				$textarea.css({'overflow':'hidden'});
				
				// Update textarea size on keyup, change, cut and paste
				$textarea.bind('keyup change cut paste', function(){
					update(); 
				});
				
				// Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
				$(window).bind('resize', setTwinWidth);
				$textarea.bind('resize', setTwinWidth);
				$textarea.bind('update', update);
				
				// Compact textarea on blur
				$textarea.bind('blur',function(){
					if($twin.height() < maxheight){
						if($twin.height() > minheight) {
							$textarea.height($twin.height());
						} else {
							$textarea.height(minheight);
						}
					}
				});
				
				// And this line is to catch the browser paste event
				$textarea.bind('input paste',function(e){ setTimeout( update, 250); });				
				
				// Run update once when elastic is initialized
				update();
				
			});
			
        } 
    }); 
})(jQuery);
;
/*!
 * elFinder - file manager for web
 * Version 2.0 rc1 (2012-04-10)
 * http://elfinder.org
 * 
 * Copyright 2009-2012, Studio 42
 * Licensed under a 3 clauses BSD license
 */
(function(a){window.elFinder=function(b,c){this.time("load");var d=this,b=a(b),e=a("<div/>").append(b.contents()),f=b.attr("style"),g=b.attr("id")||"",h="elfinder-"+(g||Math.random().toString().substr(2,7)),i="mousedown."+h,j="keydown."+h,k="keypress."+h,l=!0,m=!0,n=["enable","disable","load","open","reload","select","add","remove","change","dblclick","getfile","lockfiles","unlockfiles","dragstart","dragstop"],o={},p="",q={path:"",url:"",tmbUrl:"",disabled:[],separator:"/",archives:[],extract:[],copyOverwrite:!0,tmb:!1},r={},s=[],t={},u={},v=[],w=[],x=[],y=new d.command(d),z="auto",A=400,B=a(document.createElement("audio")).hide().appendTo("body")[0],C,D=function(b){if(b.init)r={};else for(var c in r)r.hasOwnProperty(c)&&r[c].mime!="directory"&&r[c].phash==p&&a.inArray(c,w)===-1&&delete r[c];p=b.cwd.hash,E(b.files),r[p]||E([b.cwd]),d.lastDir(p)},E=function(a){var b=a.length,c;while(b--)c=a[b],c.name&&c.hash&&c.mime&&(r[c.hash]=c)},F=function(b){var c=b.keyCode,e=!!b.ctrlKey||!!b.metaKey;l&&(a.each(u,function(a,f){f.type==b.type&&f.keyCode==c&&f.shiftKey==b.shiftKey&&f.ctrlKey==e&&f.altKey==b.altKey&&(b.preventDefault(),b.stopPropagation(),f.callback(b,d),d.debug("shortcut-exec",a+" : "+f.description))}),c==9&&b.preventDefault())},G=new Date,H,I;this.api=null,this.newAPI=!1,this.oldAPI=!1,this.OS=navigator.userAgent.indexOf("Mac")!==-1?"mac":navigator.userAgent.indexOf("Win")!==-1?"win":"other",this.options=a.extend(!0,{},this._options,c||{}),c.ui&&(this.options.ui=c.ui),c.commands&&(this.options.commands=c.commands),c.uiOptions&&c.uiOptions.toolbar&&(this.options.uiOptions.toolbar=c.uiOptions.toolbar),a.extend(this.options.contextmenu,c.contextmenu),this.requestType=/^(get|post)$/i.test(this.options.requestType)?this.options.requestType.toLowerCase():"get",this.customData=a.isPlainObject(this.options.customData)?this.options.customData:{},this.id=g,this.uploadURL=c.urlUpload||c.url,this.namespace=h,this.lang=this.i18[this.options.lang]&&this.i18[this.options.lang].messages?this.options.lang:"en",I=this.lang=="en"?this.i18.en:a.extend(!0,{},this.i18.en,this.i18[this.lang]),this.direction=I.direction,this.messages=I.messages,this.dateFormat=this.options.dateFormat||I.dateFormat,this.fancyFormat=this.options.fancyDateFormat||I.fancyDateFormat,this.today=(new Date(G.getFullYear(),G.getMonth(),G.getDate())).getTime()/1e3,this.yesterday=this.today-86400,H=this.options.UTCDate?"UTC":"",this.getHours="get"+H+"Hours",this.getMinutes="get"+H+"Minutes",this.getSeconds="get"+H+"Seconds",this.getDate="get"+H+"Date",this.getDay="get"+H+"Day",this.getMonth="get"+H+"Month",this.getFullYear="get"+H+"FullYear",this.cssClass="ui-helper-reset ui-helper-clearfix ui-widget ui-widget-content ui-corner-all elfinder elfinder-"+(this.direction=="rtl"?"rtl":"ltr")+" "+this.options.cssClass,this.storage=function(){try{return"localStorage"in window&&window.localStorage!==null?d.localStorage:d.cookie}catch(a){return d.cookie}}(),this.notifyDelay=this.options.notifyDelay>0?parseInt(this.options.notifyDelay):500,this.draggable={appendTo:"body",addClasses:!0,delay:30,revert:!0,refreshPositions:!0,cursor:"move",cursorAt:{left:50,top:47},drag:function(a,b){b.helper.toggleClass("elfinder-drag-helper-plus",a.shiftKey||a.ctrlKey||a.metaKey)},stop:function(){d.trigger("focus").trigger("dragstop")},helper:function(b,c){var e=this.id?a(this):a(this).parents("[id]:first"),f=a('<div class="elfinder-drag-helper"><span class="elfinder-drag-helper-icon-plus"/></div>'),g=function(a){return'<div class="elfinder-cwd-icon '+d.mime2class(a)+' ui-corner-all"/>'},h,i;return d.trigger("dragstart",{target:e[0],originalEvent:b}),h=e.is("."+d.res("class","cwdfile"))?d.selected():[d.navId2Hash(e.attr("id"))],f.append(g(r[h[0]].mime)).data("files",h),(i=h.length)>1&&f.append(g(r[h[i-1]].mime)+'<span class="elfinder-drag-num">'+i+"</span>"),f}},this.droppable={tolerance:"pointer",accept:".elfinder-cwd-file-wrapper,.elfinder-navbar-dir,.elfinder-cwd-file",hoverClass:this.res("class","adroppable"),drop:function(b,c){var e=a(this),f=a.map(c.helper.data("files")||[],function(a){return a||null}),g=[],h="class",i,j,k,l;e.is("."+d.res(h,"cwd"))?j=p:e.is("."+d.res(h,"cwdfile"))?j=e.attr("id"):e.is("."+d.res(h,"navdir"))&&(j=d.navId2Hash(e.attr("id"))),i=f.length;while(i--)l=f[i],l!=j&&r[l].phash!=j&&g.push(l);g.length&&(c.helper.hide(),d.clipboard(g,!(b.ctrlKey||b.shiftKey||b.metaKey)),d.exec("paste",j).always(function(){d.clipboard([])}),d.trigger("drop",{files:f}))}},this.enabled=function(){return b.is(":visible")&&l},this.visible=function(){return b.is(":visible")},this.root=function(a){var b=r[a||p],c;while(b&&b.phash)b=r[b.phash];if(b)return b.hash;while(c in r&&r.hasOwnProperty(c)){b=r[c];if(!b.phash&&!b.mime=="directory"&&b.read)return b.hash}return""},this.cwd=function(){return r[p]||{}},this.option=function(a){return q[a]||""},this.file=function(a){return r[a]},this.files=function(){return a.extend(!0,{},r)},this.parents=function(a){var b=[],c;while(c=this.file(a))b.unshift(c.hash),a=c.phash;return b},this.path2array=function(a){var b,c=[];while(a&&(b=r[a])&&b.hash)c.unshift(b.name),a=b.phash;return c},this.path=function(a){return r[a]&&r[a].path?r[a].path:this.path2array(a).join(q.separator)},this.url=function(b){var c=r[b];if(!c||!c.read)return"";if(c.url)return c.url;if(q.url)return q.url+a.map(this.path2array(b),function(a){return encodeURIComponent(a)}).slice(1).join("/");var d=a.extend({},this.customData,{cmd:"file",target:c.hash});return this.oldAPI&&(d.cmd="open",d.current=c.phash),this.options.url+(this.options.url.indexOf("?")===-1?"?":"&")+a.param(d,!0)},this.tmb=function(b){var c=r[b],d=c&&c.tmb&&c.tmb!=1?q.tmbUrl+c.tmb:"";return d&&(a.browser.opera||a.browser.msie)&&(d+="?_="+(new Date).getTime()),d},this.selected=function(){return s.slice(0)},this.selectedFiles=function(){return a.map(s,function(a){return r[a]||null})},this.fileByName=function(a,b){var c;for(c in r)if(r.hasOwnProperty(c)&&r[c].phash==b&&r[c].name==a)return r[c]},this.validResponse=function(a,b){return b.error||this.rules[this.rules[a]?a:"defaults"](b)},this.request=function(b){var c=this,d=this.options,e=a.Deferred(),f=a.extend({},d.customData,{mimes:d.onlyMimes},b.data||b),g=f.cmd,h=!b.preventDefault&&!b.preventFail,i=!b.preventDefault&&!b.preventDone,j=a.extend({},b.notify),k=!!b.raw,l=b.syncOnFail,m,b=a.extend({url:d.url,async:!0,type:this.requestType,dataType:"json",cache:!1,data:f},b.options||{}),n=function(b){b.warning&&c.error(b.warning),g=="open"&&D(a.extend(!0,{},b)),b.removed&&b.removed.length&&c.remove(b),b.added&&b.added.length&&c.add(b),b.changed&&b.changed.length&&c.change(b),c.trigger(g,b),b.sync&&c.sync()},o=function(a,b){var c;switch(b){case"abort":c=a.quiet?"":["errConnect","errAbort"];break;case"timeout":c=["errConnect","errTimeout"];break;case"parsererror":c=["errResponse","errDataNotJSON"];break;default:a.status==403?c=["errConnect","errAccess"]:a.status==404?c=["errConnect","errNotFound"]:c="errConnect"}e.reject(c,a,b)},p=function(b){if(k)return e.resolve(b);if(!b)return e.reject(["errResponse","errDataEmpty"],r);if(!a.isPlainObject(b))return e.reject(["errResponse","errDataNotJSON"],r);if(b.error)return e.reject(b.error,r);if(!c.validResponse(g,b))return e.reject("errResponse",r);b=c.normalize(b),c.api||(c.api=b.api||1,c.newAPI=c.api>=2,c.oldAPI=!c.newAPI),b.options&&(q=a.extend({},q,b.options)),e.resolve(b),b.debug&&c.debug("backend-debug",b.debug)},r,s;i&&e.done(n),e.fail(function(a){a&&(h?c.error(a):c.debug("error",c.i18n(a)))});if(!g)return e.reject("errCmdReq");l&&e.fail(function(a){a&&c.sync()}),j.type&&j.cnt&&(m=setTimeout(function(){c.notify(j),e.always(function(){j.cnt=-(parseInt(j.cnt)||0),c.notify(j)})},c.notifyDelay),e.always(function(){clearTimeout(m)}));if(g=="open")while(s=x.pop())!s.isRejected()&&!s.isResolved()&&(s.quiet=!0,s.abort());return delete b.preventFail,r=this.transport.send(b).fail(o).done(p),g=="open"&&(x.unshift(r),e.always(function(){var b=a.inArray(r,x);b!==-1&&x.splice(b,1)})),e},this.diff=function(b){var c={},d=[],e=[],f=[],g=function(a){var b=f.length;while(b--)if(f[b].hash==a)return!0};return a.each(b,function(a,b){c[b.hash]=b}),a.each(r,function(a,b){!c[a]&&
e.push(a)}),a.each(c,function(b,c){var e=r[b];e?a.each(c,function(a){if(c[a]!=e[a])return f.push(c),!1}):d.push(c)}),a.each(e,function(b,d){var h=r[d],i=h.phash;i&&h.mime=="directory"&&a.inArray(i,e)===-1&&c[i]&&!g(i)&&f.push(c[i])}),{added:d,removed:e,changed:f}},this.sync=function(){var b=this,c=a.Deferred().done(function(){b.trigger("sync")}),d={data:{cmd:"open",init:1,target:p,tree:this.ui.tree?1:0},preventDefault:!0},e={data:{cmd:"parents",target:p},preventDefault:!0};return a.when(this.request(d),this.request(e)).fail(function(a){c.reject(a),a&&b.request({data:{cmd:"open",target:b.lastDir(""),tree:1,init:1},notify:{type:"open",cnt:1,hideCnt:!0}})}).done(function(a,d){var e=b.diff(a.files.concat(d&&d.tree?d.tree:[]));return e.removed.length&&b.remove(e),e.added.length&&b.add(e),e.changed.length&&b.change(e),c.resolve(e)}),c},this.upload=function(a){return this.transport.upload(a,this)},this.bind=function(a,b){var c;if(typeof b=="function"){a=(""+a).toLowerCase().split(/\s+/);for(c=0;c<a.length;c++)t[a[c]]===void 0&&(t[a[c]]=[]),t[a[c]].push(b)}return this},this.unbind=function(a,b){var c=t[(""+a).toLowerCase()]||[],d=c.indexOf(b);return d>-1&&c.splice(d,1),b=null,this},this.trigger=function(b,c){var b=b.toLowerCase(),d=t[b]||[],e,f;this.debug("event-"+b,c);if(d.length){b=a.Event(b);for(e=0;e<d.length;e++){b.data=a.extend(!0,{},c);try{if(d[e](b,this)===!1||b.isDefaultPrevented()){this.debug("event-stoped",b.type);break}}catch(g){window.console&&window.console.log&&window.console.log(g)}}}return this},this.shortcut=function(b){var c,d,e,f,g;if(this.options.allowShortcuts&&b.pattern&&a.isFunction(b.callback)){c=b.pattern.toUpperCase().split(/\s+/);for(f=0;f<c.length;f++)d=c[f],g=d.split("+"),e=(e=g.pop()).length==1?e>0?e:e.charCodeAt(0):a.ui.keyCode[e],e&&!u[d]&&(u[d]={keyCode:e,altKey:a.inArray("ALT",g)!=-1,ctrlKey:a.inArray("CTRL",g)!=-1,shiftKey:a.inArray("SHIFT",g)!=-1,type:b.type||"keydown",callback:b.callback,description:b.description,pattern:d})}return this},this.shortcuts=function(){var b=[];return a.each(u,function(a,c){b.push([c.pattern,d.i18n(c.description)])}),b},this.clipboard=function(b,c){var d=function(){return a.map(v,function(a){return a.hash})};return b!==void 0&&(v.length&&this.trigger("unlockfiles",{files:d()}),w=[],v=a.map(b||[],function(a){var b=r[a];return b?(w.push(a),{hash:a,phash:b.phash,name:b.name,mime:b.mime,read:b.read,locked:b.locked,cut:!!c}):null}),this.trigger("changeclipboard",{clipboard:v.slice(0,v.length)}),c&&this.trigger("lockfiles",{files:d()})),v.slice(0,v.length)},this.isCommandEnabled=function(b){return this._commands[b]?a.inArray(b,q.disabled)===-1:!1},this.exec=function(b,c,d){return this._commands[b]&&this.isCommandEnabled(b)?this._commands[b].exec(c,d):a.Deferred().reject("No such command")},this.dialog=function(c,d){return a("<div/>").append(c).appendTo(b).elfinderdialog(d)},this.getUI=function(a){return this.ui[a]||b},this.command=function(a){return a===void 0?this._commands:this._commands[a]},this.resize=function(a,c){b.css("width",a).height(c).trigger("resize"),this.trigger("resize",{width:b.width(),height:b.height()})},this.restoreSize=function(){this.resize(z,A)},this.show=function(){b.show(),this.enable().trigger("show")},this.hide=function(){this.disable().trigger("hide"),b.hide()},this.destroy=function(){b&&b[0].elfinder&&(this.trigger("destroy").disable(),t={},u={},a(document).add(b).unbind("."+this.namespace),d.trigger=function(){},b.children().remove(),b.append(e.contents()).removeClass(this.cssClass).attr("style",f),b[0].elfinder=null,C&&clearInterval(C))},this.setSort(this.options.sort,this.options.sortDirect);if(!(a.fn.selectable&&a.fn.draggable&&a.fn.droppable))return alert(this.i18n("errJqui"));if(!b.length)return alert(this.i18n("errNode"));if(!this.options.url)return alert(this.i18n("errURL"));a.extend(a.ui.keyCode,{F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120}),this.dragUpload=!1,this.xhrUpload=typeof XMLHttpRequestUpload!="undefined"&&typeof File!="undefined"&&typeof FormData!="undefined",this.transport={},typeof this.options.transport=="object"&&(this.transport=this.options.transport,typeof this.transport.init=="function"&&this.transport.init(this)),typeof this.transport.send!="function"&&(this.transport.send=function(b){return a.ajax(b)}),this.transport.upload=="iframe"?this.transport.upload=a.proxy(this.uploads.iframe,this):typeof this.transport.upload=="function"?this.dragUpload=!!this.options.dragUploadAllow:this.xhrUpload?(this.transport.upload=a.proxy(this.uploads.xhr,this),this.dragUpload=!0):this.transport.upload=a.proxy(this.uploads.iframe,this),this.error=function(){var a=arguments[0];return arguments.length==1&&typeof a=="function"?d.bind("error",a):d.trigger("error",{error:a})},a.each(["enable","disable","load","open","reload","select","add","remove","change","dblclick","getfile","lockfiles","unlockfiles","dragstart","dragstop","search","searchend","viewchange"],function(b,c){d[c]=function(){var b=arguments[0];return arguments.length==1&&typeof b=="function"?d.bind(c,b):d.trigger(c,a.isPlainObject(b)?b:{})}}),this.enable(function(){!l&&d.visible()&&d.ui.overlay.is(":hidden")&&(l=!0,a("texarea:focus,input:focus,button").blur(),b.removeClass("elfinder-disabled"))}).disable(function(){m=l,l=!1,b.addClass("elfinder-disabled")}).open(function(){s=[]}).select(function(b){s=a.map(b.data.selected||b.data.value||[],function(a){return r[a]?a:null})}).error(function(b){var c={cssClass:"elfinder-dialog-error",title:d.i18n(d.i18n("error")),resizable:!1,destroyOnClose:!0,buttons:{}};c.buttons[d.i18n(d.i18n("btnClose"))]=function(){a(this).elfinderdialog("close")},d.dialog('<span class="elfinder-dialog-icon elfinder-dialog-icon-error"/>'+d.i18n(b.data.error),c)}).bind("tree parents",function(a){E(a.data.tree||[])}).bind("tmb",function(b){a.each(b.data.images||[],function(a,b){r[a]&&(r[a].tmb=b)})}).add(function(a){E(a.data.added||[])}).change(function(b){a.each(b.data.changed||[],function(b,c){var d=c.hash;r[d]=r[d]?a.extend(r[d],c):c})}).remove(function(b){var c=b.data.removed||[],d=c.length,e=function(b){var c=r[b];c&&(c.mime=="directory"&&c.dirs&&a.each(r,function(a,c){c.phash==b&&e(a)}),delete r[b])};while(d--)e(c[d])}).bind("search",function(a){E(a.data.files)}).bind("rm",function(b){var c=B.canPlayType&&B.canPlayType('audio/wav; codecs="1"');c&&c!=""&&c!="no"&&a(B).html('<source src="./sounds/rm.wav" type="audio/wav">')[0].play()}),a.each(this.options.handlers,function(a,b){d.bind(a,b)}),this.history=new this.history(this),typeof this.options.getFileCallback=="function"&&this.commands.getfile&&(this.bind("dblclick",function(a){a.preventDefault(),d.exec("getfile").fail(function(){d.exec("open")})}),this.shortcut({pattern:"enter",description:this.i18n("cmdgetfile"),callback:function(){d.exec("getfile").fail(function(){d.exec(d.OS=="mac"?"rename":"open")})}}).shortcut({pattern:"ctrl+enter",description:this.i18n(this.OS=="mac"?"cmdrename":"cmdopen"),callback:function(){d.exec(d.OS=="mac"?"rename":"open")}})),this._commands={},a.isArray(this.options.commands)||(this.options.commands=[]),a.each(["open","reload","back","forward","up","home","info","quicklook","getfile","help"],function(b,c){a.inArray(c,d.options.commands)===-1&&d.options.commands.push(c)}),a.each(this.options.commands,function(b,c){var e=d.commands[c];a.isFunction(e)&&!d._commands[c]&&(e.prototype=y,d._commands[c]=new e,d._commands[c].setup(c,d.options.commandsOptions[c]||{}))}),b.addClass(this.cssClass).bind(i,function(){!l&&d.enable()}),this.ui={workzone:a("<div/>").appendTo(b).elfinderworkzone(this),navbar:a("<div/>").appendTo(b).elfindernavbar(this,this.options.uiOptions.navbar||{}),contextmenu:a("<div/>").appendTo(b).elfindercontextmenu(this),overlay:a("<div/>").appendTo(b).elfinderoverlay({show:function(){d.disable()},hide:function(){m&&d.enable()}}),cwd:a("<div/>").appendTo(b).elfindercwd(this),notify:this.dialog("",{cssClass:"elfinder-dialog-notify",position:{top:"12px",right:"12px"},resizable:!1,autoOpen:!1,title:"&nbsp;",width:280}),statusbar:a('<div class="ui-widget-header ui-helper-clearfix ui-corner-bottom elfinder-statusbar"/>').hide().appendTo(b)},a.each(this.options.ui||
[],function(c,e){var f="elfinder"+e,g=d.options.uiOptions[e]||{};!d.ui[e]&&a.fn[f]&&(d.ui[e]=a("<"+(g.tag||"div")+"/>").appendTo(b)[f](d,g))}),b[0].elfinder=this,this.options.resizable&&a.fn.resizable&&b.resizable({handles:"se",minWidth:300,minHeight:200}),this.options.width&&(z=this.options.width),this.options.height&&(A=parseInt(this.options.height)),d.resize(z,A),a(document).bind("click."+this.namespace,function(c){l&&!a(c.target).closest(b).length&&d.disable()}).bind(j+" "+k,F),this.trigger("init").request({data:{cmd:"open",target:d.lastDir(),init:1,tree:this.ui.tree?1:0},preventDone:!0,notify:{type:"open",cnt:1,hideCnt:!0},freeze:!0}).fail(function(){d.trigger("fail").disable().lastDir(""),t={},u={},a(document).add(b).unbind("."+this.namespace),d.trigger=function(){}}).done(function(b){d.load().debug("api",d.api),b=a.extend(!0,{},b),D(b),d.trigger("open",b)}),this.one("load",function(){b.trigger("resize"),d.options.sync>1e3&&(C=setInterval(function(){d.sync()},d.options.sync))})},elFinder.prototype={res:function(a,b){return this.resources[a]&&this.resources[a][b]},i18:{en:{translator:"",language:"English",direction:"ltr",dateFormat:"d.m.Y H:i",fancyDateFormat:"$1 H:i",messages:{}},months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]},kinds:{unknown:"Unknown",directory:"Folder",symlink:"Alias","symlink-broken":"AliasBroken","application/x-empty":"TextPlain","application/postscript":"Postscript","application/vnd.ms-office":"MsOffice","application/vnd.ms-word":"MsWord","application/vnd.ms-excel":"MsExcel","application/vnd.ms-powerpoint":"MsPP","application/pdf":"PDF","application/xml":"XML","application/vnd.oasis.opendocument.text":"OO","application/x-shockwave-flash":"AppFlash","application/flash-video":"Flash video","application/x-bittorrent":"Torrent","application/javascript":"JS","application/rtf":"RTF","application/rtfd":"RTF","application/x-font-ttf":"TTF","application/x-font-otf":"OTF","application/x-rpm":"RPM","application/x-web-config":"TextPlain","application/xhtml+xml":"HTML","application/docbook+xml":"DOCBOOK","application/x-awk":"AWK","application/x-gzip":"GZIP","application/x-bzip2":"BZIP","application/zip":"ZIP","application/x-zip":"ZIP","application/x-rar":"RAR","application/x-tar":"TAR","application/x-7z-compressed":"7z","application/x-jar":"JAR","text/plain":"TextPlain","text/x-php":"PHP","text/html":"HTML","text/javascript":"JS","text/css":"CSS","text/rtf":"RTF","text/rtfd":"RTF","text/x-c":"C","text/x-csrc":"C","text/x-chdr":"CHeader","text/x-c++":"CPP","text/x-c++src":"CPP","text/x-c++hdr":"CPPHeader","text/x-shellscript":"Shell","application/x-csh":"Shell","text/x-python":"Python","text/x-java":"Java","text/x-java-source":"Java","text/x-ruby":"Ruby","text/x-perl":"Perl","text/x-sql":"SQL","text/xml":"XML","text/x-comma-separated-values":"CSV","image/x-ms-bmp":"BMP","image/jpeg":"JPEG","image/gif":"GIF","image/png":"PNG","image/tiff":"TIFF","image/x-targa":"TGA","image/vnd.adobe.photoshop":"PSD","image/xbm":"XBITMAP","image/pxm":"PXM","audio/mpeg":"AudioMPEG","audio/midi":"AudioMIDI","audio/ogg":"AudioOGG","audio/mp4":"AudioMPEG4","audio/x-m4a":"AudioMPEG4","audio/wav":"AudioWAV","audio/x-mp3-playlist":"AudioPlaylist","video/x-dv":"VideoDV","video/mp4":"VideoMPEG4","video/mpeg":"VideoMPEG","video/x-msvideo":"VideoAVI","video/quicktime":"VideoMOV","video/x-ms-wmv":"VideoWM","video/x-flv":"VideoFlash","video/x-matroska":"VideoMKV","video/ogg":"VideoOGG"},rules:{defaults:function(b){return!b||b.added&&!a.isArray(b.added)||b.removed&&!a.isArray(b.removed)||b.changed&&!a.isArray(b.changed)?!1:!0},open:function(b){return b&&b.cwd&&b.files&&a.isPlainObject(b.cwd)&&a.isArray(b.files)},tree:function(b){return b&&b.tree&&a.isArray(b.tree)},parents:function(b){return b&&b.tree&&a.isArray(b.tree)},tmb:function(b){return b&&b.images&&(a.isPlainObject(b.images)||a.isArray(b.images))},upload:function(b){return b&&(a.isPlainObject(b.added)||a.isArray(b.added))},search:function(b){return b&&b.files&&a.isArray(b.files)}},sorts:{nameDirsFirst:1,kindDirsFirst:2,sizeDirsFirst:3,dateDirsFirst:4,name:5,kind:6,size:7,date:8},setSort:function(a,b){this.sort=this.sorts[a]||1,this.sortDirect=b=="asc"||b=="desc"?b:"asc",this.trigger("sortchange")},commands:{},parseUploadData:function(b){var c;if(!a.trim(b))return{error:["errResponse","errDataEmpty"]};try{c=a.parseJSON(b)}catch(d){return{error:["errResponse","errDataNotJSON"]}}return this.validResponse("upload",c)?(c=this.normalize(c),c.removed=a.map(c.added||[],function(a){return a.hash}),c):{error:["errResponse"]}},iframeCnt:0,uploads:{iframe:function(b,c){var d=c?c:this,e=b.input,f=a.Deferred().fail(function(a){a&&d.error(a)}).done(function(a){a.warning&&d.error(a.warning),a.removed&&d.remove(a),a.added&&d.add(a),a.changed&&d.change(a),d.trigger("upload",a),a.sync&&d.sync()}),g="iframe-"+d.namespace+ ++d.iframeCnt,h=a('<form action="'+d.uploadURL+'" method="post" enctype="multipart/form-data" encoding="multipart/form-data" target="'+g+'" style="display:none"><input type="hidden" name="cmd" value="upload" /></form>'),i=a.browser.msie,j=function(){o&&clearTimeout(o),n&&clearTimeout(n),m&&d.notify({type:"upload",cnt:-l}),setTimeout(function(){i&&a('<iframe src="javascript:false;"/>').appendTo(h),h.remove(),k.remove()},100)},k=a('<iframe src="'+(i?"javascript:false;":"about:blank")+'" name="'+g+'" style="position:absolute;left:-1000px;top:-1000px" />').bind("load",function(){k.unbind("load").bind("load",function(){var a=d.parseUploadData(k.contents().text());j(),a.error?f.reject(a.error):f.resolve(a)}),n=setTimeout(function(){m=!0,d.notify({type:"upload",cnt:l})},d.options.notifyDelay),d.options.iframeTimeout>0&&(o=setTimeout(function(){j(),f.reject([errors.connect,errors.timeout])},d.options.iframeTimeout)),h.submit()}),l,m,n,o;return e&&a(e).is(":file")&&a(e).val()?(h.append(e),l=e.files?e.files.length:1,h.append('<input type="hidden" name="'+(d.newAPI?"target":"current")+'" value="'+d.cwd().hash+'"/>').append('<input type="hidden" name="html" value="1"/>').append(a(e).attr("name","upload[]")),a.each(d.options.onlyMimes||[],function(a,b){h.append('<input type="hidden" name="mimes[]" value="'+b+'"/>')}),a.each(d.options.customData,function(a,b){h.append('<input type="hidden" name="'+a+'" value="'+b+'"/>')}),h.appendTo("body"),k.appendTo("body"),f):f.reject()},xhr:function(b,c){var d=c?c:this,e=a.Deferred().fail(function(a){a&&d.error(a)}).done(function(a){a.warning&&d.error(a.warning),a.removed&&d.remove(a),a.added&&d.add(a),a.changed&&d.change(a),d.trigger("upload",a),a.sync&&d.sync()}).always(function(){m&&clearTimeout(m),k&&d.notify({type:"upload",cnt:-i,progress:100*i})}),f=new XMLHttpRequest,g=new FormData,h=b.input?b.input.files:b.files,i=h.length,j=5,k=!1,l=function(){return setTimeout(function(){k=!0,d.notify({type:"upload",cnt:i,progress:j*i})},d.options.notifyDelay)},m;if(!i)return e.reject();f.addEventListener("error",function(){e.reject("errConnect")},!1),f.addEventListener("abort",function(){e.reject(["errConnect","errAbort"])},!1),f.addEventListener("load",function(){var a=f.status,b;if(a>500)return e.reject("errResponse");if(a!=200)return e.reject("errConnect");if(f.readyState!=4)return e.reject(["errConnect","errTimeout"]);if(!f.responseText)return e.reject(["errResponse","errDataEmpty"]);b=d.parseUploadData(f.responseText),b.error?e.reject(b.error):e.resolve(b)},!1),f.upload.addEventListener("progress",function(a){var b=j,c;a.lengthComputable&&(c=parseInt(a.loaded*100/a.total),c>0&&!m&&(m=l()),c-b>4&&(j=c,k&&d.notify({type:"upload",cnt:0,progress:(j-b)*i})))},!1),f.open("POST",d.uploadURL,!0),g.append("cmd","upload"),g.append(d.newAPI?"target":"current",d.cwd().hash),a.each(d.options.customData,function(a,b){g.append(a,b)}),a.each(d.options.onlyMimes,function(a,b){g.append("mimes["+a+"]",b)}),a.each(h,function(a,b){g.append("upload[]",b)}),f.onreadystatechange=function(){f.readyState==4&&f.status==0&&
e.reject(["errConnect","errAbort"])},f.send(g);if(!a.browser.safari||!b.files)m=l();return e}},one:function(b,c){var d=this,e=a.proxy(c,function(a){return setTimeout(function(){d.unbind(a.type,e)},3),c.apply(this,arguments)});return this.bind(b,e)},localStorage:function(a,b){var c=window.localStorage;return a="elfinder-"+a+this.id,b!==void 0&&c.setItem(a,b),c.getItem(a)||""},cookie:function(b,c){var d,e,f,g;b="elfinder-"+b+this.id;if(c===void 0){if(document.cookie&&document.cookie!=""){f=document.cookie.split(";"),b+="=";for(g=0;g<f.length;g++){f[g]=a.trim(f[g]);if(f[g].substring(0,b.length)==b)return decodeURIComponent(f[g].substring(b.length))}}return""}return e=a.extend({},this.options.cookie),c===null&&(c="",e.expires=-1),typeof e.expires=="number"&&(d=new Date,d.setTime(d.getTime()+e.expires*864e5),e.expires=d),document.cookie=b+"="+encodeURIComponent(c)+"; expires="+e.expires.toUTCString()+(e.path?"; path="+e.path:"")+(e.domain?"; domain="+e.domain:"")+(e.secure?"; secure":""),c},lastDir:function(a){return this.options.rememberLastDir?this.storage("lastdir",a):""},_node:a("<span/>"),escape:function(a){return this._node.text(a).html()},normalize:function(b){var c=function(a){return a&&a.hash&&a.name&&a.mime?(a.mime=="application/x-empty"&&(a.mime="text/plain"),a):null};return b.files&&(b.files=a.map(b.files,c)),b.tree&&(b.tree=a.map(b.tree,c)),b.added&&(b.added=a.map(b.added,c)),b.changed&&(b.changed=a.map(b.changed,c)),b.api&&(b.init=!0),b},compare:function(a,b){var c=this.sort,d=this.sortDirect=="asc",e=d?a:b,f=d?b:a,g=this.mime2kind(e.mime).toLowerCase(),h=this.mime2kind(f.mime).toLowerCase(),i=a.mime=="directory",j=b.mime=="directory",k=e.name.toLowerCase(),l=f.name.toLowerCase(),m=i?0:parseInt(e.size)||0,n=j?0:parseInt(f.size)||0,o=e.ts||e.date||"",p=f.ts||f.date||"";if(c<=4){if(i&&!j)return-1;if(!i&&j)return 1}return c!=2&&c!=6||g==h?c!=3&&c!=7||m==n?c!=4&&c!=8||o==p?e.name.localeCompare(f.name):o>p?1:-1:m>n?1:-1:g.localeCompare(h)},sortFiles:function(b){return b.sort(a.proxy(this.compare,this))},notify:function(b){var c=b.type,d=this.messages["ntf"+c]?this.i18n("ntf"+c):this.i18n("ntfsmth"),e=this.ui.notify,f=e.children(".elfinder-notify-"+c),g='<div class="elfinder-notify elfinder-notify-{type}"><span class="elfinder-dialog-icon elfinder-dialog-icon-{type}"/><span class="elfinder-notify-msg">{msg}</span> <span class="elfinder-notify-cnt"/><div class="elfinder-notify-progressbar"><div class="elfinder-notify-progress"/></div></div>',h=b.cnt,i=b.progress>=0&&b.progress<=100?b.progress:0,j,k,l;return c?(f.length||(f=a(g.replace(/\{type\}/g,c).replace(/\{msg\}/g,d)).appendTo(e).data("cnt",0),i&&f.data({progress:0,total:0})),j=h+parseInt(f.data("cnt")),j>0?(!b.hideCnt&&f.children(".elfinder-notify-cnt").text("("+j+")"),e.is(":hidden")&&e.elfinderdialog("open"),f.data("cnt",j),i<100&&(k=f.data("total"))>=0&&(l=f.data("progress"))>=0&&(k=h+parseInt(f.data("total")),l=i+l,i=parseInt(l/k),f.data({progress:l,total:k}),e.find(".elfinder-notify-progress").animate({width:(i<100?i:100)+"%"},20))):(f.remove(),!e.children().length&&e.elfinderdialog("close")),this):this},confirm:function(b){var c=!1,d={cssClass:"elfinder-dialog-confirm",modal:!0,resizable:!1,title:this.i18n(b.title||"confirmReq"),buttons:{},close:function(){!c&&b.cancel.callback(),a(this).elfinderdialog("destroy")}},e=this.i18n("apllyAll"),f,g;return b.reject&&(d.buttons[this.i18n(b.reject.label)]=function(){b.reject.callback(!!g&&!!g.prop("checked")),c=!0,a(this).elfinderdialog("close")}),d.buttons[this.i18n(b.accept.label)]=function(){b.accept.callback(!!g&&!!g.prop("checked")),c=!0,a(this).elfinderdialog("close")},d.buttons[this.i18n(b.cancel.label)]=function(){a(this).elfinderdialog("close")},b.all&&(b.reject&&(d.width=370),d.create=function(){g=a('<input type="checkbox" />'),a(this).next().children().before(a("<label>"+e+"</label>").prepend(g))},d.open=function(){var b=a(this).next(),c=parseInt(b.children(":first").outerWidth()+b.children(":last").outerWidth());c>parseInt(b.width())&&a(this).closest(".elfinder-dialog").width(c+30)}),this.dialog('<span class="elfinder-dialog-icon elfinder-dialog-icon-confirm"/>'+this.i18n(b.text),d)},uniqueName:function(a,b){var c=0,d="",e,f;a=this.i18n(a),b=b||this.cwd().hash,(e=a.indexOf(".txt"))!=-1&&(d=".txt",a=a.substr(0,e)),f=a+d;if(!this.fileByName(f,b))return f;while(c<1e4){f=a+" "+ ++c+d;if(!this.fileByName(f,b))return f}return a+Math.random()+d},i18n:function(){var b=this,c=this.messages,d=[],e=[],f=function(a){var c;if(a.indexOf("#")===0)if(c=b.file(a.substr(1)))return c.name;return a},g,h,i;for(g=0;g<arguments.length;g++){i=arguments[g];if(typeof i=="string")d.push(f(i));else if(a.isArray(i))for(h=0;h<i.length;h++)typeof i[h]=="string"&&d.push(f(i[h]))}for(g=0;g<d.length;g++){if(a.inArray(g,e)!==-1)continue;i=d[g],i=c[i]||i,i=i.replace(/\$(\d+)/g,function(a,b){return b=g+parseInt(b),b>0&&d[b]&&e.push(b),d[b]||""}),d[g]=i}return a.map(d,function(b,c){return a.inArray(c,e)===-1?b:null}).join("<br>")},mime2class:function(a){var b="elfinder-cwd-icon-";return a=a.split("/"),b+a[0]+(a[0]!="image"&&a[1]?" "+b+a[1].replace(/(\.|\+)/g,"-"):"")},mime2kind:function(a){var b=typeof a=="object"?a.mime:a,c;a.alias?c="Alias":this.kinds[b]?c=this.kinds[b]:b.indexOf("text")===0?c="Text":b.indexOf("image")===0?c="Image":b.indexOf("audio")===0?c="Audio":b.indexOf("video")===0?c="Video":b.indexOf("application")===0?c="App":c=b;return this.messages["kind"+c]?this.i18n("kind"+c):b;var b,c},formatDate:function(a,b){var c=this,b=b||a.ts,d=c.i18,e,f,g,h,i,j,k,l,m,n,o;return c.options.clientFormatDate&&b>0?(e=new Date(b*1e3),l=e[c.getHours](),m=l>12?l-12:l,n=e[c.getMinutes](),o=e[c.getSeconds](),h=e[c.getDate](),i=e[c.getDay](),j=e[c.getMonth]()+1,k=e[c.getFullYear](),f=b>=this.yesterday?this.fancyFormat:this.dateFormat,g=f.replace(/[a-z]/gi,function(a){switch(a){case"d":return h>9?h:"0"+h;case"j":return h;case"D":return c.i18n(d.daysShort[i]);case"l":return c.i18n(d.days[i]);case"m":return j>9?j:"0"+j;case"n":return j;case"M":return c.i18n(d.monthsShort[j-1]);case"F":return c.i18n(d.months[j-1]);case"Y":return k;case"y":return(""+k).substr(2);case"H":return l>9?l:"0"+l;case"G":return l;case"g":return m;case"h":return m>9?m:"0"+m;case"a":return l>12?"pm":"am";case"A":return l>12?"PM":"AM";case"i":return n>9?n:"0"+n;case"s":return o>9?o:"0"+o}return a}),b>=this.yesterday?g.replace("$1",this.i18n(b>=this.today?"Today":"Yesterday")):g):a.date?a.date.replace(/([a-z]+)\s/i,function(a,b){return c.i18n(b)+" "}):c.i18n("dateUnknown")},perms2class:function(a){var b="";return!a.read&&!a.write?b="elfinder-na":a.read?a.write||(b="elfinder-ro"):b="elfinder-wo",b},formatPermissions:function(a){var b=[];return a.read&&b.push(this.i18n("read")),a.write&&b.push(this.i18n("write")),b.length?b.join(" "+this.i18n("and")+" "):this.i18n("noaccess")},formatSize:function(a){var b=1,c="b";return a=="unknown"?this.i18n("unknown"):(a>1073741824?(b=1073741824,c="GB"):a>1048576?(b=1048576,c="MB"):a>1024&&(b=1024,c="KB"),(a>0?Math.round(a/b):0)+" "+c)},navHash2Id:function(a){return"nav-"+a},navId2Hash:function(a){return typeof a=="string"?a.substr(4):!1},log:function(a){return window.console&&window.console.log&&window.console.log(a),this},debug:function(b,c){var d=this.options.debug;return(d=="all"||d===!0||a.isArray(d)&&a.inArray(b,d)!=-1)&&window.console&&window.console.log&&window.console.log("elfinder debug: ["+b+"] ["+this.id+"]",c),this},time:function(a){window.console&&window.console.time&&window.console.time(a)},timeEnd:function(a){window.console&&window.console.timeEnd&&window.console.timeEnd(a)}},elFinder.prototype.version="2.0 rc1",a.fn.elfinder=function(a){return a=="instance"?this.getElFinder():this.each(function(){var b=typeof a=="string"?a:"";this.elfinder||new elFinder(this,typeof a=="object"?a:{});switch(b){case"close":case"hide":this.elfinder.hide();break;case"open":case"show":this.elfinder.show();break;case"destroy":this.elfinder.destroy()}})},a.fn.getElFinder=function(){var a;return this.each(function(){if(this.elfinder)return a=this.elfinder,!1}),a},elFinder.prototype._options={url:"",requestType:"get",transport:{},urlUpload:"",dragUploadAllow:"auto",iframeTimeout
:0,customData:{},handlers:{},lang:"en",cssClass:"",commands:["open","reload","home","up","back","forward","getfile","quicklook","download","rm","duplicate","rename","mkdir","mkfile","upload","copy","cut","paste","edit","extract","archive","search","info","view","help","resize","sort"],commandsOptions:{getfile:{onlyURL:!0,multiple:!1,folders:!1,oncomplete:""},upload:{ui:"uploadbutton"},quicklook:{autoplay:!0,jplayer:"extensions/jplayer"},edit:{mimes:[],editors:[]},help:{view:["about","shortcuts","help"]}},getFileCallback:null,ui:["toolbar","tree","path","stat"],uiOptions:{toolbar:[["back","forward"],["mkdir","mkfile","upload"],["open","download","getfile"],["info"],["quicklook"],["copy","cut","paste"],["rm"],["duplicate","rename","edit","resize"],["extract","archive"],["search"],["view","sort"],["help"]],tree:{openRootOnLoad:!0,syncTree:!0},navbar:{minWidth:150,maxWidth:500}},onlyMimes:[],sort:"nameDirsFirst",sortDirect:"asc",clientFormatDate:!0,UTCDate:!1,dateFormat:"",fancyDateFormat:"",width:"auto",height:400,resizable:!0,notifyDelay:500,allowShortcuts:!0,rememberLastDir:!0,showFiles:30,showThreshold:50,validName:!1,sync:0,loadTmbs:5,cookie:{expires:30,domain:"",path:"/",secure:!1},contextmenu:{navbar:["open","|","copy","cut","paste","duplicate","|","rm","|","info"],cwd:["reload","back","|","upload","mkdir","mkfile","paste","|","sort","|","info"],files:["getfile","|","open","quicklook","|","download","|","copy","cut","paste","duplicate","|","rm","|","edit","rename","resize","|","archive","extract","|","info"]},debug:["error","warning","event-destroy"]},elFinder.prototype.history=function(b){var c=this,d=!0,e=[],f,g=function(){e=[b.cwd().hash],f=0,d=!0},h=function(h){return h&&c.canForward()||!h&&c.canBack()?(d=!1,b.exec("open",e[h?++f:--f]).fail(g)):a.Deferred().reject()};this.canBack=function(){return f>0},this.canForward=function(){return f<e.length-1},this.back=h,this.forward=function(){return h(!0)},b.open(function(a){var c=e.length,g=b.cwd().hash;d&&(f>=0&&c>f+1&&e.splice(f+1),e[e.length-1]!=g&&e.push(g),f=e.length-1),d=!0}).reload(g)},elFinder.prototype.command=function(b){this.fm=b,this.name="",this.title="",this.state=-1,this.alwaysEnabled=!1,this._disabled=!1,this.disableOnSearch=!1,this.updateOnSelect=!0,this._handlers={enable:function(){this.update(void 0,this.value)},disable:function(){this.update(-1,this.value)},"open reload load":function(a){this._disabled=!this.alwaysEnabled&&!this.fm.isCommandEnabled(this.name),this.update(void 0,this.value),this.change()}},this.handlers={},this.shortcuts=[],this.options={ui:"button"},this.setup=function(b,c){var d=this,e=this.fm,f,g;this.name=b,this.title=e.messages["cmd"+b]?e.i18n("cmd"+b):b,this.options=a.extend({},this.options,c),this.listeners=[],this.updateOnSelect&&(this._handlers.select=function(){this.update(void 0,this.value)}),a.each(a.extend({},d._handlers,d.handlers),function(b,c){e.bind(b,a.proxy(c,d))});for(f=0;f<this.shortcuts.length;f++)g=this.shortcuts[f],g.callback=a.proxy(g.callback||function(){this.exec()},this),!g.description&&(g.description=this.title),e.shortcut(g);this.disableOnSearch&&e.bind("search searchend",function(a){d._disabled=a.type=="search",d.update(void 0,d.value)}),this.init()},this.init=function(){},this.exec=function(b,c){return a.Deferred().reject()},this.disabled=function(){return this.state<0},this.enabled=function(){return this.state>-1},this.active=function(){return this.state>0},this.getstate=function(){return-1},this.update=function(a,b){var c=this.state,d=this.value;this._disabled?this.state=-1:this.state=a!==void 0?a:this.getstate(),this.value=b,(c!=this.state||d!=this.value)&&this.change()},this.change=function(a){var b,c;if(typeof a=="function")this.listeners.push(a);else for(c=0;c<this.listeners.length;c++){b=this.listeners[c];try{b(this.state,this.value)}catch(d){this.fm.debug("error",d)}}return this},this.hashes=function(c){return c?a.map(a.isArray(c)?c:[c],function(a){return b.file(a)?a:null}):b.selected()},this.files=function(b){var c=this.fm;return b?a.map(a.isArray(b)?b:[b],function(a){return c.file(a)||null}):c.selectedFiles()}},elFinder.prototype.resources={"class":{hover:"ui-state-hover",active:"ui-state-active",disabled:"ui-state-disabled",draggable:"ui-draggable",droppable:"ui-droppable",adroppable:"elfinder-droppable-active",cwdfile:"elfinder-cwd-file",cwd:"elfinder-cwd",tree:"elfinder-tree",treeroot:"elfinder-navbar-root",navdir:"elfinder-navbar-dir",navdirwrap:"elfinder-navbar-dir-wrapper",navarrow:"elfinder-navbar-arrow",navsubtree:"elfinder-navbar-subtree",navcollapse:"elfinder-navbar-collapsed",navexpand:"elfinder-navbar-expanded",treedir:"elfinder-tree-dir",placedir:"elfinder-place-dir",searchbtn:"elfinder-button-search"},tpl:{perms:'<span class="elfinder-perms"/>',symlink:'<span class="elfinder-symlink"/>',navicon:'<span class="elfinder-nav-icon"/>',navspinner:'<span class="elfinder-navbar-spinner"/>',navdir:'<div class="elfinder-navbar-wrapper"><span id="{id}" class="ui-corner-all elfinder-navbar-dir {cssclass}"><span class="elfinder-navbar-arrow"/><span class="elfinder-navbar-icon"/>{symlink}{permissions}{name}</span><div class="elfinder-navbar-subtree"/></div>'},mimes:{text:["application/x-empty","application/javascript","application/xhtml+xml","audio/x-mp3-playlist","application/x-web-config","application/docbook+xml","application/x-php","application/x-perl","application/x-awk","application/x-config","application/x-csh","application/xml"]},mixin:{make:function(){var b=this.fm,c=this.name,d=b.getUI("cwd"),e=a.Deferred().fail(function(a){a&&b.error(a)}).always(function(){k.remove(),j.remove(),b.enable()}),f="tmp_"+parseInt(Math.random()*1e5),g=b.cwd().hash,h=new Date,i={hash:f,name:b.uniqueName(this.prefix),mime:this.mime,read:!0,write:!0,date:"Today "+h.getHours()+":"+h.getMinutes()},j=d.trigger("create."+b.namespace,i).find("#"+f),k=a('<input type="text"/>').keydown(function(b){b.stopImmediatePropagation(),b.keyCode==a.ui.keyCode.ESCAPE?e.reject():b.keyCode==a.ui.keyCode.ENTER&&k.blur()}).mousedown(function(a){a.stopPropagation()}).blur(function(){var d=a.trim(k.val()),h=k.parent();if(h.length){if(!d)return e.reject("errInvName");if(b.fileByName(d,g))return e.reject(["errExists",d]);h.html(b.escape(d)),b.lockfiles({files:[f]}),b.request({data:{cmd:c,name:d,target:g},notify:{type:c,cnt:1},preventFail:!0,syncOnFail:!0}).fail(function(a){e.reject(a)}).done(function(a){e.resolve(a)})}});return this.disabled()||!j.length?e.reject():(b.disable(),j.find(".elfinder-cwd-filename").empty("").append(k.val(i.name)),k.select().focus(),e)}}},a.fn.dialogelfinder=function(b){var c="elfinderPosition",d="elfinderDestroyOnClose";this.not(".elfinder").each(function(){var e=a(document),f=a('<div class="ui-widget-header dialogelfinder-drag ui-corner-top">'+(b.title||"Files")+"</div>"),g=a('<a href="#" class="dialogelfinder-drag-close ui-corner-all"><span class="ui-icon ui-icon-closethick"/></a>').appendTo(f).click(function(a){a.preventDefault(),h.dialogelfinder("close")}),h=a(this).addClass("dialogelfinder").css("position","absolute").hide().appendTo("body").draggable({handle:".dialogelfinder-drag",containment:"parent"}).elfinder(b).prepend(f),i=h.elfinder("instance");h.width(parseInt(h.width())||840).data(d,!!b.destroyOnClose).find(".elfinder-toolbar").removeClass("ui-corner-top"),b.position&&h.data(c,b.position),b.autoOpen!==!1&&a(this).dialogelfinder("open")});if(b=="open"){var e=a(this),f=e.data(c)||{top:parseInt(a(document).scrollTop()+(a(window).height()<e.height()?2:(a(window).height()-e.height())/2)),left:parseInt(a(document).scrollLeft()+(a(window).width()<e.width()?2:(a(window).width()-e.width())/2))},g=100;e.is(":hidden")&&(a("body").find(":visible").each(function(){var b=a(this),c;this!==e[0]&&b.css("position")=="absolute"&&(c=parseInt(b.zIndex()))>g&&(g=c+1)}),e.zIndex(g).css(f).show().trigger("resize"),setTimeout(function(){e.trigger("resize").mousedown()},200))}else if(b=="close"){var e=a(this);e.is(":visible")&&(e.data(d)?e.elfinder("destroy").remove():e.elfinder("close"))}else if(b=="instance")return a(this).getElFinder();return this},elFinder&&elFinder.prototype&&typeof elFinder.prototype.i18=="object"&&(elFinder.prototype
.i18.en={translator:"Troex Nevelin &lt;troex@fury.scancode.ru&gt;",language:"English",direction:"ltr",dateFormat:"M d, Y h:i A",fancyDateFormat:"$1 h:i A",messages:{error:"Error",errUnknown:"Unknown error.",errUnknownCmd:"Unknown command.",errJqui:"Invalid jQuery UI configuration. Selectable, draggable and droppable components must be included.",errNode:"elFinder requires DOM Element to be created.",errURL:"Invalid elFinder configuration! URL option is not set.",errAccess:"Access denied.",errConnect:"Unable to connect to backend.",errAbort:"Connection aborted.",errTimeout:"Connection timeout.",errNotFound:"Backend not found.",errResponse:"Invalid backend response.",errConf:"Invalid backend configuration.",errJSON:"PHP JSON module not installed.",errNoVolumes:"Readable volumes not available.",errCmdParams:'Invalid parameters for command "$1".',errDataNotJSON:"Data is not JSON.",errDataEmpty:"Data is empty.",errCmdReq:"Backend request requires command name.",errOpen:'Unable to open "$1".',errNotFolder:"Object is not a folder.",errNotFile:"Object is not a file.",errRead:'Unable to read "$1".',errWrite:'Unable to write into "$1".',errPerm:"Permission denied.",errLocked:'"$1" is locked and can not be renamed, moved or removed.',errExists:'File named "$1" already exists.',errInvName:"Invalid file name.",errFolderNotFound:"Folder not found.",errFileNotFound:"File not found.",errTrgFolderNotFound:'Target folder "$1" not found.',errPopup:"Browser prevented opening popup window. To open file enable it in browser options.",errMkdir:'Unable to create folder "$1".',errMkfile:'Unable to create file "$1".',errRename:'Unable to rename "$1".',errCopyFrom:'Copying files from volume "$1" not allowed.',errCopyTo:'Copying files to volume "$1" not allowed.',errUpload:"Upload error.",errUploadFile:'Unable to upload "$1".',errUploadNoFiles:"No files found for upload.",errUploadTotalSize:"Data exceeds the maximum allowed size.",errUploadFileSize:"File exceeds maximum allowed size.",errUploadMime:"File type not allowed.",errUploadTransfer:'"$1" transfer error.',errNotReplace:'Object "$1" already exists at this location and can not be replaced by object with another type.',errReplace:'Unable to replace "$1".',errSave:'Unable to save "$1".',errCopy:'Unable to copy "$1".',errMove:'Unable to move "$1".',errCopyInItself:'Unable to copy "$1" into itself.',errRm:'Unable to remove "$1".',errRmSrc:"Unable remove source file(s).",errExtract:'Unable to extract files from "$1".',errArchive:"Unable to create archive.",errArcType:"Unsupported archive type.",errNoArchive:"File is not archive or has unsupported archive type.",errCmdNoSupport:"Backend does not support this command.",errReplByChild:"The folder “$1” can’t be replaced by an item it contains.",errArcSymlinks:"For security reason denied to unpack archives contains symlinks.",errArcMaxSize:"Archive files exceeds maximum allowed size.",errResize:'Unable to resize "$1".',errUsupportType:"Unsupported file type.",errNotUTF8Content:'File "$1" is not in UTF-8 and cannot be edited.',cmdarchive:"Create archive",cmdback:"Back",cmdcopy:"Copy",cmdcut:"Cut",cmddownload:"Download",cmdduplicate:"Duplicate",cmdedit:"Edit file",cmdextract:"Extract files from archive",cmdforward:"Forward",cmdgetfile:"Select files",cmdhelp:"About this software",cmdhome:"Home",cmdinfo:"Get info",cmdmkdir:"New folder",cmdmkfile:"New text file",cmdopen:"Open",cmdpaste:"Paste",cmdquicklook:"Preview",cmdreload:"Reload",cmdrename:"Rename",cmdrm:"Delete",cmdsearch:"Find files",cmdup:"Go to parent directory",cmdupload:"Upload files",cmdview:"View",cmdresize:"Resize & Rotate",cmdsort:"Sort",btnClose:"Close",btnSave:"Save",btnRm:"Remove",btnApply:"Apply",btnCancel:"Cancel",btnNo:"No",btnYes:"Yes",ntfopen:"Open folder",ntffile:"Open file",ntfreload:"Reload folder content",ntfmkdir:"Creating directory",ntfmkfile:"Creating files",ntfrm:"Delete files",ntfcopy:"Copy files",ntfmove:"Move files",ntfprepare:"Prepare to copy files",ntfrename:"Rename files",ntfupload:"Uploading files",ntfdownload:"Downloading files",ntfsave:"Save files",ntfarchive:"Creating archive",ntfextract:"Extracting files from archive",ntfsearch:"Searching files",ntfresize:"Resizing images",ntfsmth:"Doing something >_<",ntfloadimg:"Loading image",dateUnknown:"unknown",Today:"Today",Yesterday:"Yesterday",Jan:"Jan",Feb:"Feb",Mar:"Mar",Apr:"Apr",May:"May",Jun:"Jun",Jul:"Jul",Aug:"Aug",Sep:"Sep",Oct:"Oct",Nov:"Nov",Dec:"Dec",sortnameDirsFirst:"by name (folders first)",sortkindDirsFirst:"by kind (folders first)",sortsizeDirsFirst:"by size (folders first)",sortdateDirsFirst:"by date (folders first)",sortname:"by name",sortkind:"by kind",sortsize:"by size",sortdate:"by date",confirmReq:"Confirmation required",confirmRm:"Are you sure you want to remove files?<br/>This cannot be undone!",confirmRepl:"Replace old file with new one?",apllyAll:"Apply to all",name:"Name",size:"Size",perms:"Permissions",modify:"Modified",kind:"Kind",read:"read",write:"write",noaccess:"no access",and:"and",unknown:"unknown",selectall:"Select all files",selectfiles:"Select file(s)",selectffile:"Select first file",selectlfile:"Select last file",viewlist:"List view",viewicons:"Icons view",places:"Places",calc:"Calculate",path:"Path",aliasfor:"Alias for",locked:"Locked",dim:"Dimensions",files:"Files",folders:"Folders",items:"Items",yes:"yes",no:"no",link:"Link",searcresult:"Search results",selected:"selected items",about:"About",shortcuts:"Shortcuts",help:"Help",webfm:"Web file manager",ver:"Version",protocol:"protocol version",homepage:"Project home",docs:"Documentation",github:"Fork us on Github",twitter:"Follow us on twitter",facebook:"Join us on facebook",team:"Team",chiefdev:"chief developer",developer:"developer",contributor:"contributor",maintainer:"maintainer",translator:"translator",icons:"Icons",dontforget:"and don't forget to take your towel",shortcutsof:"Shortcuts disabled",dropFiles:"Drop files here",or:"or",selectForUpload:"Select files to upload",moveFiles:"Move files",copyFiles:"Copy files",rmFromPlaces:"Remove from places",aspectRatio:"Aspect ratio",scale:"Scale",width:"Width",height:"Height",resize:"Resize",crop:"Crop",rotate:"Rotate","rotate-cw":"Rotate 90 degrees CW","rotate-ccw":"Rotate 90 degrees CCW",degree:"°",kindUnknown:"Unknown",kindFolder:"Folder",kindAlias:"Alias",kindAliasBroken:"Broken alias",kindApp:"Application",kindPostscript:"Postscript document",kindMsOffice:"Microsoft Office document",kindMsWord:"Microsoft Word document",kindMsExcel:"Microsoft Excel document",kindMsPP:"Microsoft Powerpoint presentation",kindOO:"Open Office document",kindAppFlash:"Flash application",kindPDF:"Portable Document Format (PDF)",kindTorrent:"Bittorrent file",kind7z:"7z archive",kindTAR:"TAR archive",kindGZIP:"GZIP archive",kindBZIP:"BZIP archive",kindZIP:"ZIP archive",kindRAR:"RAR archive",kindJAR:"Java JAR file",kindTTF:"True Type font",kindOTF:"Open Type font",kindRPM:"RPM package",kindText:"Text document",kindTextPlain:"Plain text",kindPHP:"PHP source",kindCSS:"Cascading style sheet",kindHTML:"HTML document",kindJS:"Javascript source",kindRTF:"Rich Text Format",kindC:"C source",kindCHeader:"C header source",kindCPP:"C++ source",kindCPPHeader:"C++ header source",kindShell:"Unix shell script",kindPython:"Python source",kindJava:"Java source",kindRuby:"Ruby source",kindPerl:"Perl script",kindSQL:"SQL source",kindXML:"XML document",kindAWK:"AWK source",kindCSV:"Comma separated values",kindDOCBOOK:"Docbook XML document",kindImage:"Image",kindBMP:"BMP image",kindJPEG:"JPEG image",kindGIF:"GIF Image",kindPNG:"PNG Image",kindTIFF:"TIFF image",kindTGA:"TGA image",kindPSD:"Adobe Photoshop image",kindXBITMAP:"X bitmap image",kindPXM:"Pixelmator image",kindAudio:"Audio media",kindAudioMPEG:"MPEG audio",kindAudioMPEG4:"MPEG-4 audio",kindAudioMIDI:"MIDI audio",kindAudioOGG:"Ogg Vorbis audio",kindAudioWAV:"WAV audio",AudioPlaylist:"MP3 playlist",kindVideo:"Video media",kindVideoDV:"DV movie",kindVideoMPEG:"MPEG movie",kindVideoMPEG4:"MPEG-4 movie",kindVideoAVI:"AVI movie",kindVideoMOV:"Quick Time movie",kindVideoWM:"Windows Media movie",kindVideoFlash:"Flash movie",kindVideoMKV:"Matroska movie",kindVideoOGG:"Ogg movie"}}),a.fn.elfinderbutton=
function(b){return this.each(function(){var c="class",d=b.fm,e=d.res(c,"disabled"),f=d.res(c,"active"),g=d.res(c,"hover"),h="elfinder-button-menu-item",i="elfinder-button-menu-item-selected",j,k=a(this).addClass("ui-state-default elfinder-button").attr("title",b.title).append('<span class="elfinder-button-icon elfinder-button-icon-'+b.name+'"/>').hover(function(a){!k.is("."+e)&&k[a.type=="mouseleave"?"removeClass":"addClass"](g)}).click(function(a){k.is("."+e)||(j&&b.variants.length>1?(j.is(":hidden")&&b.fm.getUI().click(),a.stopPropagation(),j.slideToggle(100)):b.exec())}),l=function(){j.hide()};a.isArray(b.variants)&&(k.addClass("elfinder-menubutton"),j=a('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>').hide().appendTo(k).zIndex(10+k.zIndex()).delegate("."+h,"hover",function(){a(this).toggleClass(g)}).delegate("."+h,"click",function(c){c.preventDefault(),c.stopPropagation(),k.removeClass(g),b.exec(b.fm.selected(),a(this).data("value"))}),b.fm.bind("disable select",l).getUI().click(l),b.change(function(){j.html(""),a.each(b.variants,function(c,d){j.append(a('<div class="'+h+'">'+d[1]+"</div>").data("value",d[0]).addClass(d[0]==b.value?i:""))})})),b.change(function(){b.disabled()?k.removeClass(f+" "+g).addClass(e):(k.removeClass(e),k[b.active()?"addClass":"removeClass"](f))}).change()})},a.fn.elfindercontextmenu=function(b){return this.each(function(){var c=a(this).addClass("ui-helper-reset ui-widget ui-state-default ui-corner-all elfinder-contextmenu elfinder-contextmenu-"+b.direction).hide().appendTo("body").delegate(".elfinder-contextmenu-item","hover",function(){a(this).toggleClass("ui-state-hover")}),d=b.direction=="ltr"?"left":"right",e=a.extend({},b.options.contextmenu),f='<div class="elfinder-contextmenu-item"><span class="elfinder-button-icon {icon} elfinder-contextmenu-icon"/><span>{label}</span></div>',g=function(b,c,d){return a(f.replace("{icon}",c?"elfinder-button-icon-"+c:"").replace("{label}",b)).click(function(a){a.stopPropagation(),a.stopPropagation(),d()})},h=function(e,f){var g=a(window),h=c.outerWidth(),i=c.outerHeight(),j=g.width(),k=g.height(),l=g.scrollTop(),m=g.scrollLeft(),n={top:(f+i<k?f:f-i>0?f-i:f)+l,left:(e+h<j?e:e-h)+m,"z-index":100+b.getUI("workzone").zIndex()};c.css(n).show(),n={"z-index":n["z-index"]+10},n[d]=parseInt(c.width()),c.find(".elfinder-contextmenu-sub").css(n)},i=function(){c.hide().empty()},j=function(d,f){var h=!1;a.each(e[d]||[],function(d,e){var j,k,l;if(e=="|"&&h){c.append('<div class="elfinder-contextmenu-separator"/>'),h=!1;return}j=b.command(e);if(j&&j.getstate(f)!=-1){if(j.variants){if(!j.variants.length)return;k=g(j.title,j.name,function(){}),l=a('<div class="ui-corner-all elfinder-contextmenu-sub"/>').appendTo(k.append('<span class="elfinder-contextmenu-arrow"/>')),k.addClass("elfinder-contextmenu-group").hover(function(){l.toggle()}),a.each(j.variants,function(b,c){l.append(a('<div class="elfinder-contextmenu-item"><span>'+c[1]+"</span></div>").click(function(a){a.stopPropagation(),i(),j.exec(f,c[0])}))})}else k=g(j.title,j.name,function(){i(),j.exec(f)});c.append(k),h=!0}})},k=function(b){a.each(b,function(a,b){var d;b.label&&typeof b.callback=="function"&&(d=g(b.label,b.icon,function(){i(),b.callback()}),c.append(d))})};b.one("load",function(){b.bind("contextmenu",function(a){var b=a.data;i(),b.type&&b.targets?j(b.type,b.targets):b.raw&&k(b.raw),c.children().length&&h(b.x,b.y)}).one("destroy",function(){c.remove()}).bind("disable select",i).getUI().click(i)})})},a.fn.elfindercwd=function(b){return this.not(".elfinder-cwd").each(function(){var c=b.storage("view")=="list",d="undefined",e="select."+b.namespace,f="unselect."+b.namespace,g="disable."+b.namespace,h="enable."+b.namespace,i="class",j=b.res(i,"cwdfile"),k="."+j,l="ui-selected",m=b.res(i,"disabled"),n=b.res(i,"draggable"),o=b.res(i,"droppable"),p=b.res(i,"hover"),q=b.res(i,"adroppable"),r=j+"-tmp",s=b.options.loadTmbs>0?b.options.loadTmbs:5,t="",u={icon:'<div id="{hash}" class="'+j+' {permsclass} {dirclass} ui-corner-all"><div class="elfinder-cwd-file-wrapper ui-corner-all"><div class="elfinder-cwd-icon {mime} ui-corner-all" unselectable="on" {style}/>{marker}</div><div class="elfinder-cwd-filename" title="{name}">{name}</div></div>',row:'<tr id="{hash}" class="'+j+' {permsclass} {dirclass}"><td><div class="elfinder-cwd-file-wrapper"><span class="elfinder-cwd-icon {mime}"/>{marker}<span class="elfinder-cwd-filename">{name}</span></div></td><td>{perms}</td><td>{date}</td><td>{size}</td><td>{kind}</td></tr>'},v=b.res("tpl","perms"),w=b.res("tpl","symlink"),x={permsclass:function(a){return b.perms2class(a)},perms:function(a){return b.formatPermissions(a)},dirclass:function(a){return a.mime=="directory"?"directory":""},mime:function(a){return b.mime2class(a.mime)},size:function(a){return b.formatSize(a.size)},date:function(a){return b.formatDate(a)},kind:function(a){return b.mime2kind(a)},marker:function(a){return(a.alias||a.mime=="symlink-broken"?w:"")+(!a.read||!a.write?v:"")}},y=function(a){return a.name=b.escape(a.name),u[c?"row":"icon"].replace(/\{([a-z]+)\}/g,function(b,c){return x[c]?x[c](a):a[c]?a[c]:""})},z=!1,A=function(b,d){function r(a,b){return a[b+"All"]("[id]:not(."+m+"):first")}var g=a.ui.keyCode,h=b==g.LEFT||b==g.UP,i=S.find("[id]."+l),j=h?"first":"last",k,n,o,p,q;if(i.length){k=i.filter(h?":first":":last"),o=r(k,h?"prev":"next");if(!o.length)n=k;else if(c||b==g.LEFT||b==g.RIGHT)n=o;else{p=k.position().top,q=k.position().left,n=k;if(h){do n=n.prev("[id]");while(n.length&&!(n.position().top<p&&n.position().left<=q));n.is("."+m)&&(n=r(n,"next"))}else{do n=n.next("[id]");while(n.length&&!(n.position().top>p&&n.position().left>=q));n.is("."+m)&&(n=r(n,"prev")),n.length||(o=S.find("[id]:not(."+m+"):last"),o.position().top>p&&(n=o))}}}else n=S.find("[id]:not(."+m+"):"+(h?"last":"first"));n&&n.length&&(d?n=k.add(k[h?"prevUntil":"nextUntil"]("#"+n.attr("id"))).add(n):i.trigger(f),n.trigger(e),F(n.filter(h?":first":":last")),E())},B=function(a){S.find("#"+a).trigger(e)},C=function(){S.find("[id]."+l).trigger(f)},D=function(){return a.map(S.find("[id]."+l),function(b){return b=a(b),b.is("."+m)?null:a(b).attr("id")})},E=function(){b.trigger("select",{selected:D()})},F=function(a){var b=a.position().top,c=a.outerHeight(!0),d=T.scrollTop(),e=T.innerHeight();b+c>d+e?T.scrollTop(parseInt(b+c-e)):b<d&&T.scrollTop(b)},G=[],H=function(a){var b=G.length;while(b--)if(G[b].hash==a)return b;return-1},I="scroll."+b.namespace,J=function(){var d=[],e=!1,f=[],g={},h=S.find("[id]:last"),i=!h.length,j=c?S.children("table").children("tbody"):S,k;if(!G.length)return T.unbind(I);while((!h.length||h.position().top<=T.height()+T.scrollTop()+b.options.showThreshold)&&(k=G.splice(0,b.options.showFiles)).length)d=a.map(k,function(a){return a.hash&&a.name?(a.mime=="directory"&&(e=!0),a.tmb&&(a.tmb===1?f.push(a.hash):g[a.hash]=a.tmb),y(a)):null}),j.append(d.join("")),h=S.find("[id]:last"),i&&S.scrollTop(0);M(g),f.length&&N(f),e&&L()},K=a.extend({},b.droppable,{over:function(c,d){var e=b.cwd().hash;a.each(d.helper.data("files"),function(a,c){if(b.file(c).phash==e)return S.removeClass(q),!1})}}),L=function(){setTimeout(function(){S.find(".directory:not(."+o+",.elfinder-na,.elfinder-ro)").droppable(b.droppable)},20)},M=function(c){var d=b.option("tmbUrl"),e=!0,f;return a.each(c,function(b,c){var g=S.find("#"+b);g.length?function(b,c){a("<img/>").load(function(){b.find(".elfinder-cwd-icon").css("background","url('"+c+"') center center no-repeat")}).attr("src",c)}(g,d+c):(e=!1,(f=H(b))!=-1&&(G[f].tmb=c))}),e},N=function(a){var c=[];if(b.oldAPI){b.request({data:{cmd:"tmb",current:b.cwd().hash},preventFail:!0}).done(function(a){M(a.images||[])&&a.tmb&&N()});return}c=c=a.splice(0,s),c.length&&b.request({data:{cmd:"tmb",targets:c},preventFail:!0}).done(function(b){M(b.images||[])&&N(a)})},O=function(a){var d=c?S.find("tbody"):S,e=a.length,f=[],g={},h=!1,i=function(a){var c=S.find("[id]:first"),d;while(c.length){d=b.file(c.attr("id"));if(d&&b.compare(a,d)<0)return c;c=c.next("[id]")}},j=function(a){var c=G.length,d;for(d=0;d<c;d++)if(b.compare(a,G[d])<0)return d;return c||-1},k,l,m,n;while(e--){k=a[e],l=k.hash;if(S.find("#"+l)
.length)continue;(m=i(k))&&m.length?m.before(y(k)):(n=j(k))>=0?G.splice(n,0,k):d.append(y(k)),S.find("#"+l).length&&(k.mime=="directory"?h=!0:k.tmb&&(k.tmb===1?f.push(l):g[l]=k.tmb))}M(g),f.length&&N(f),h&&L()},P=function(a){var c=a.length,d,e,f;while(c--){d=a[c];if((e=S.find("#"+d)).length)try{e.detach()}catch(g){b.debug("error",g)}else(f=H(d))!=-1&&G.splice(f,1)}},Q={name:b.i18n("name"),perm:b.i18n("perms"),mod:b.i18n("modify"),size:b.i18n("size"),kind:b.i18n("kind")},R=function(d,e){var f=b.cwd().hash;try{S.children("table,"+k).remove().end()}catch(g){S.html("")}S.removeClass("elfinder-cwd-view-icons elfinder-cwd-view-list").addClass("elfinder-cwd-view-"+(c?"list":"icons")),T[c?"addClass":"removeClass"]("elfinder-cwd-wrapper-list"),c&&S.html('<table><thead><tr class="ui-state-default"><td >'+Q.name+"</td><td>"+Q.perm+"</td><td>"+Q.mod+"</td><td>"+Q.size+"</td><td>"+Q.kind+"</td></tr></thead><tbody/></table>"),G=a.map(d,function(a){return e||a.phash==f?a:null}),G=b.sortFiles(G),T.bind(I,J).trigger(I),E()},S=a(this).addClass("ui-helper-clearfix elfinder-cwd").attr("unselectable","on").delegate(k,"click."+b.namespace,function(b){var c=this.id?a(this):a(this).parents("[id]:first"),d=c.prevAll("."+l+":first"),g=c.nextAll("."+l+":first"),h=d.length,i=g.length,j;b.stopImmediatePropagation(),b.shiftKey&&(h||i)?(j=h?c.prevUntil("#"+d.attr("id")):c.nextUntil("#"+g.attr("id")),j.add(c).trigger(e)):b.ctrlKey||b.metaKey?c.trigger(c.is("."+l)?f:e):(S.find("[id]."+l).trigger(f),c.trigger(e)),E()}).delegate(k,"dblclick."+b.namespace,function(a){b.dblclick({file:this.id})}).delegate(k,"mouseenter."+b.namespace,function(d){var e=a(this),f=c?e:e.children();!e.is("."+r)&&!f.is("."+n+",."+m)&&f.draggable(b.draggable)}).delegate(k,e,function(b){var c=a(this);!z&&!c.is("."+m)&&c.addClass(l).children().addClass(p)}).delegate(k,f,function(b){!z&&a(this).removeClass(l).children().removeClass(p)}).delegate(k,g,function(){var b=a(this).removeClass(l).addClass(m),d=(c?b:b.children()).removeClass(p);b.is("."+o)&&b.droppable("disable"),d.is("."+n)&&d.draggable("disable"),!c&&d.removeClass(m)}).delegate(k,h,function(){var b=a(this).removeClass(m),d=c?b:b.children();b.is("."+o)&&b.droppable("enable"),d.is("."+n)&&d.draggable("enable")}).delegate(k,"scrolltoview",function(){F(a(this))}).delegate(k,"hover",function(c){b.trigger("hover",{hash:a(this).attr("id"),type:c.type})}).bind("contextmenu."+b.namespace,function(c){var d=a(c.target).closest("."+j);d.length&&(c.stopPropagation(),c.preventDefault(),d.is("."+m)||(d.is("."+l)||(S.trigger("unselectall"),d.trigger(e),E()),b.trigger("contextmenu",{type:"files",targets:b.selected(),x:c.clientX,y:c.clientY})))}).selectable({filter:k,stop:E,selected:function(b,c){a(c.selected).trigger(e)},unselected:function(b,c){a(c.unselected).trigger(f)}}).droppable(K).bind("create."+b.namespace,function(b,d){var e=c?S.find("tbody"):S;S.trigger("unselectall"),e.prepend(a(y(d)).addClass(r)),S.scrollTop(0)}).bind("unselectall",function(){S.find("[id]."+l+"").trigger(f),E()}).bind("selectfile",function(a,b){S.find("#"+b).trigger(e),E()}),T=a('<div class="elfinder-cwd-wrapper"/>').bind("contextmenu",function(a){a.preventDefault(),b.trigger("contextmenu",{type:"cwd",targets:[b.cwd().hash],x:a.clientX,y:a.clientY})}),U=function(){var b=0;T.siblings(".elfinder-panel:visible").each(function(){b+=a(this).outerHeight(!0)}),T.height(W.height()-b)},V=a(this).parent().resize(U),W=V.children(".elfinder-workzone").append(T.append(this));b.dragUpload&&(T[0].addEventListener("dragenter",function(a){a.preventDefault(),a.stopPropagation(),T.addClass(q)},!1),T[0].addEventListener("dragleave",function(a){a.preventDefault(),a.stopPropagation(),a.target==S[0]&&T.removeClass(q)},!1),T[0].addEventListener("dragover",function(a){a.preventDefault(),a.stopPropagation()},!1),T[0].addEventListener("drop",function(a){a.preventDefault(),T.removeClass(q),a.dataTransfer&&a.dataTransfer.files&&a.dataTransfer.files.length&&b.exec("upload",{files:a.dataTransfer.files})},!1)),b.bind("open search",function(a){R(a.data.files,a.type=="search")}).bind("searchend sortchange",function(){t&&R(b.files())}).bind("searchstart",function(a){t=a.data.query}).bind("searchend",function(){t=""}).bind("viewchange",function(){var d=b.selected(),e=b.storage("view")=="list";e!=c&&(c=e,R(b.files()),a.each(d,function(a,b){B(b)}),E()),U()}).add(function(c){var d=b.cwd().hash,e=t?a.map(c.data.added||[],function(a){return a.name.indexOf(t)===-1?null:a}):a.map(c.data.added||[],function(a){return a.phash==d?a:null});O(e)}).change(function(c){var d=b.cwd().hash,e=b.selected(),f;t?a.each(c.data.changed||[],function(b,c){P([c.hash]),c.name.indexOf(t)!==-1&&(O([c]),a.inArray(c.hash,e)!==-1&&B(c.hash))}):a.each(a.map(c.data.changed||[],function(a){return a.phash==d?a:null}),function(b,c){P([c.hash]),O([c]),a.inArray(c.hash,e)!==-1&&B(c.hash)}),E()}).remove(function(a){P(a.data.removed||[]),E()}).bind("open add search searchend",function(){S.css("height","auto"),S.outerHeight(!0)<T.height()&&S.height(T.height()-(S.outerHeight(!0)-S.height())-2)}).dragstart(function(b){var c=a(b.data.target),d=b.data.originalEvent;c.is(k)&&(c.is("."+l)||(!(d.ctrlKey||d.metaKey||d.shiftKey)&&C(),c.trigger(e),E()),S.droppable("disable")),S.selectable("disable").removeClass(m),z=!0}).dragstop(function(){S.selectable("enable"),z=!1}).bind("lockfiles unlockfiles",function(a){var b=a.type=="lockfiles"?g:h,c=a.data.files||[],d=c.length;while(d--)S.find("#"+c[d]).trigger(b);E()}).bind("mkdir mkfile duplicate upload rename archive extract",function(c){var d=b.cwd().hash,e;S.trigger("unselectall"),a.each(c.data.added||[],function(a,b){b&&b.phash==d&&B(b.hash)}),E()}).shortcut({pattern:"ctrl+a",description:"selectall",callback:function(){var c=[],d;S.find("[id]:not(."+l+")").trigger(e),G.length?(d=b.cwd().hash,b.select({selected:a.map(b.files(),function(a){return a.phash==d?a.hash:null})})):E()}}).shortcut({pattern:"left right up down shift+left shift+right shift+up shift+down",description:"selectfiles",type:"keydown",callback:function(a){A(a.keyCode,a.shiftKey)}}).shortcut({pattern:"home",description:"selectffile",callback:function(a){C(),F(S.find("[id]:first").trigger(e)),E()}}).shortcut({pattern:"end",description:"selectlfile",callback:function(a){C(),F(S.find("[id]:last").trigger(e)),E()}})}),this},a.fn.elfinderdialog=function(b){var c;return typeof b=="string"&&(c=this.closest(".ui-dialog")).length&&(b=="open"&&c.is(":hidden")?c.fadeIn(120,function(){c.trigger("open")}):b=="close"&&c.is(":visible")?c.hide().trigger("close"):b=="destroy"?c.hide().remove():b=="toTop"&&c.trigger("totop")),b=a.extend({},a.fn.elfinderdialog.defaults,b),this.filter(":not(.ui-dialog-content)").each(function(){var c=a(this).addClass("ui-dialog-content ui-widget-content"),d=c.parent(),e="elfinder-dialog-active",f="elfinder-dialog",g="elfinder-dialog-notify",h="ui-state-hover",i=parseInt(Math.random()*1e6),j=d.children(".elfinder-overlay"),k=a('<div class="ui-dialog-buttonset"/>'),l=a('<div class=" ui-helper-clearfix ui-dialog-buttonpane ui-widget-content"/>').append(k),m=a('<div class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-draggable std42-dialog  '+f+" "+b.cssClass+'"/>').hide().append(c).appendTo(d).draggable({handle:".ui-dialog-titlebar",containment:a("body")}).css({width:b.width,height:b.height}).mousedown(function(b){b.stopPropagation(),a(document).mousedown(),m.is("."+e)||(d.find("."+f+":visible").removeClass(e),m.addClass(e).zIndex(n()+1))}).bind("open",function(){b.modal&&j.elfinderoverlay("show"),m.trigger("totop"),typeof b.open=="function"&&a.proxy(b.open,c[0])(),m.is("."+g)||d.find("."+f+":visible").not("."+g).each(function(){var b=a(this),c=parseInt(b.css("top")),d=parseInt(b.css("left")),e=parseInt(m.css("top")),f=parseInt(m.css("left"));b[0]!=m[0]&&(c==e||d==f)&&m.css({top:c+10+"px",left:d+10+"px"})})}).bind("close",function(){var e=d.find(".elfinder-dialog:visible"),f=n();b.modal&&j.elfinderoverlay("hide"),e.length?e.each(function(){var b=a(this);if(b.zIndex()>=f)return b.trigger("totop"),!1}):setTimeout(function(){d.mousedown().click()},10),typeof b.close=="function"?a.proxy(b.close,c[0])():b.destroyOnClose&&m.hide().remove()
}).bind("totop",function(){a(this).mousedown().find(".ui-button:first").focus().end().find(":text:first").focus()}),n=function(){var b=d.zIndex()+10;return d.find("."+f+":visible").each(function(){var c;this!=m[0]&&(c=a(this).zIndex(),c>b&&(b=c))}),b},o;b.position||(o=parseInt((d.height()-m.outerHeight())/2-42),b.position={top:(o>0?o:0)+"px",left:parseInt((d.width()-m.outerWidth())/2)+"px"}),m.css(b.position),b.closeOnEscape&&a(document).bind("keyup."+i,function(b){b.keyCode==a.ui.keyCode.ESCAPE&&m.is("."+e)&&(c.elfinderdialog("close"),a(document).unbind("keyup."+i))}),m.prepend(a('<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">'+b.title+"</div>").prepend(a('<a href="#" class="ui-dialog-titlebar-close ui-corner-all"><span class="ui-icon ui-icon-closethick"/></a>').mousedown(function(a){a.preventDefault(),c.elfinderdialog("close")}))),a.each(b.buttons,function(b,d){var e=a('<button type="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">'+b+"</span></button>").click(a.proxy(d,c[0])).hover(function(b){a(this)[b.type=="mouseenter"?"focus":"blur"]()}).focus(function(){a(this).addClass(h)}).blur(function(){a(this).removeClass(h)}).keydown(function(b){var c;b.keyCode==a.ui.keyCode.ENTER?a(this).click():b.keyCode==a.ui.keyCode.TAB&&(c=a(this).next(".ui-button"),c.length?c.focus():a(this).parent().children(".ui-button:first").focus())});k.append(e)}),k.children().length&&m.append(l),b.resizable&&a.fn.resizable&&m.resizable({minWidth:b.minWidth,minHeight:b.minHeight,alsoResize:this}),typeof b.create=="function"&&a.proxy(b.create,this)(),b.autoOpen&&c.elfinderdialog("open")}),this},a.fn.elfinderdialog.defaults={cssClass:"",title:"",modal:!1,resizable:!0,autoOpen:!0,closeOnEscape:!0,destroyOnClose:!1,buttons:{},position:null,width:320,height:"auto",minWidth:200,minHeight:110},a.fn.elfindernavbar=function(b,c){return this.not(".elfinder-navbar").each(function(){var d=a(this).addClass("ui-state-default elfinder-navbar"),e=d.parent().resize(function(){d.height(f.height()-g)}),f=e.children(".elfinder-workzone").append(d),g=d.outerHeight()-d.height(),h=b.direction=="ltr",i;a.fn.resizable&&(i=d.resizable({handles:h?"e":"w",minWidth:c.minWidth||150,maxWidth:c.maxWidth||500}).bind("resize scroll",function(){i.css({top:parseInt(d.scrollTop())+"px",left:parseInt(h?d.width()+d.scrollLeft()-i.width()-2:d.scrollLeft()+2)})}).find(".ui-resizable-handle").zIndex(d.zIndex()+10),h||d.resize(function(){d.css("left",null).css("right",0)}),b.one("open",function(){setTimeout(function(){d.trigger("resize")},150)}))}),this},a.fn.elfinderoverlay=function(b){this.filter(":not(.elfinder-overlay)").each(function(){b=a.extend({},b),a(this).addClass("ui-widget-overlay elfinder-overlay").hide().mousedown(function(a){a.preventDefault(),a.stopPropagation()}).data({cnt:0,show:typeof b.show=="function"?b.show:function(){},hide:typeof b.hide=="function"?b.hide:function(){}})});if(b=="show"){var c=this.eq(0),d=c.data("cnt")+1,e=c.data("show");c.data("cnt",d),c.is(":hidden")&&(c.zIndex(c.parent().zIndex()+1),c.show(),e())}if(b=="hide"){var c=this.eq(0),d=c.data("cnt")-1,f=c.data("hide");c.data("cnt",d),d==0&&c.is(":visible")&&(c.hide(),f())}return this},a.fn.elfinderpanel=function(b){return this.each(function(){var c=a(this).addClass("elfinder-panel ui-state-default ui-corner-all"),d="margin-"+(b.direction=="ltr"?"left":"right");b.one("load",function(a){var e=b.getUI("navbar");c.css(d,parseInt(e.outerWidth(!0))),e.bind("resize",function(){c.is(":visible")&&c.css(d,parseInt(e.outerWidth(!0)))})})})},a.fn.elfinderpath=function(b){return this.each(function(){var c=a(this).addClass("elfinder-path").html("&nbsp;").delegate("a","click",function(c){var d=a(this).attr("href").substr(1);c.preventDefault(),d!=b.cwd().hash&&b.exec("open",d)}).prependTo(b.getUI("statusbar").show());b.bind("open searchend",function(){var d=[];a.each(b.parents(b.cwd().hash),function(a,c){d.push('<a href="#'+c+'">'+b.escape(b.file(c).name)+"</a>")}),c.html(d.join(b.option("separator")))}).bind("search",function(){c.html(b.i18n("searcresult"))})})},a.fn.elfinderplaces=function(b,c){return this.each(function(){var d=[],e="class",f=b.res(e,"navdir"),g=b.res(e,"navcollapse"),h=b.res(e,"navexpand"),i=b.res(e,"hover"),j=b.res(e,"treeroot"),k=b.res("tpl","navdir"),l=b.res("tpl","perms"),m=a(b.res("tpl","navspinner")),n=function(a){return a.substr(6)},o=function(a){return"place-"+a},p=function(){b.storage("places",d.join(","))},q=function(c){return a(k.replace(/\{id\}/,o(c.hash)).replace(/\{name\}/,b.escape(c.name)).replace(/\{cssclass\}/,b.perms2class(c)).replace(/\{permissions\}/,!c.read||!c.write?l:"").replace(/\{symlink\}/,""))},r=function(c){var e=q(c);w.children().length&&a.each(w.children(),function(){var b=a(this);if(c.name.localeCompare(b.children("."+f).text())<0)return!e.insertBefore(b)}),d.push(c.hash),!e.parent().length&&w.append(e),v.addClass(g),e.draggable({appendTo:"body",revert:!1,helper:function(){var c=a(this);return c.children().removeClass("ui-state-hover"),a('<div class="elfinder-place-drag elfinder-'+b.direction+'"/>').append(c.clone()).data("hash",n(c.children(":first").attr("id")))},start:function(){a(this).hide()},stop:function(b,c){var d=x.offset().top,e=x.offset().left,f=x.width(),g=x.height(),h=b.clientX,i=b.clientY;h>e&&h<e+f&&i>d&&i<i+g?a(this).show():(s(c.helper.data("hash")),p())}})},s=function(b){var c=a.inArray(b,d);c!==-1&&(d.splice(c,1),w.find("#"+o(b)).parent().remove(),!w.children().length&&v.removeClass(g+" "+h))},t=function(){w.empty(),v.removeClass(g+" "+h)},u=q({hash:"root-"+b.namespace,name:b.i18n(c.name,"places"),read:!0,write:!0}),v=u.children("."+f).addClass(j).click(function(){v.is("."+g)&&(x.toggleClass(h),w.slideToggle(),b.storage("placesState",x.is("."+h)?1:0))}),w=u.children("."+b.res(e,"navsubtree")),x=a(this).addClass(b.res(e,"tree")+" elfinder-places ui-corner-all").hide().append(u).appendTo(b.getUI("navbar")).delegate("."+f,"hover",function(){a(this).toggleClass("ui-state-hover")}).delegate("."+f,"click",function(c){b.exec("open",a(this).attr("id").substr(6))}).delegate("."+f+":not(."+j+")","contextmenu",function(c){var d=a(this).attr("id").substr(6);c.preventDefault(),b.trigger("contextmenu",{raw:[{label:b.i18n("rmFromPlaces"),icon:"rm",callback:function(){s(d),p()}}],x:c.clientX,y:c.clientY})}).droppable({tolerance:"pointer",accept:".elfinder-cwd-file-wrapper,.elfinder-tree-dir,.elfinder-cwd-file",hoverClass:b.res("class","adroppable"),drop:function(c,e){var f=!0;a.each(e.helper.data("files"),function(c,e){var g=b.file(e);g&&g.mime=="directory"&&a.inArray(g.hash,d)===-1?r(g):f=!1}),p(),f&&e.helper.hide()}});b.one("load",function(){if(b.oldAPI)return;x.show().parent().show(),d=a.map(b.storage("places").split(","),function(a){return a||null}),d.length&&(v.prepend(m),b.request({data:{cmd:"info",targets:d},preventDefault:!0}).done(function(c){d=[],a.each(c.files,function(a,b){b.mime=="directory"&&r(b)}),p(),b.storage("placesState")>0&&v.click()}).always(function(){m.remove()})),b.remove(function(b){a.each(b.data.removed,function(a,b){s(b)}),p()}).change(function(b){a.each(b.data.changed,function(b,c){a.inArray(c.hash,d)!==-1&&(s(c.hash),c.mime=="directory"&&r(c))}),p()}).bind("sync",function(){d.length&&(v.prepend(m),b.request({data:{cmd:"info",targets:d},preventDefault:!0}).done(function(b){a.each(b.files||[],function(b,c){a.inArray(c.hash,d)===-1&&s(c.hash)}),p()}).always(function(){m.remove()}))})})})},a.fn.elfindersearchbutton=function(b){return this.each(function(){var c=!1,d=a(this).hide().addClass("ui-widget-content elfinder-button "+b.fm.res("class","searchbtn")+""),e=function(){b.exec(a.trim(g.val())).done(function(){c=!0,g.focus()})},f=function(){g.val(""),c&&(c=!1,b.fm.trigger("searchend"))},g=a('<input type="text" size="42"/>').appendTo(d).keypress(function(a){a.stopPropagation()}).keydown(function(a){a.stopPropagation(),a.keyCode==13&&e(),a.keyCode==27&&(a.preventDefault(),f())});a('<span class="ui-icon ui-icon-search" title="'+b.title+'"/>').appendTo(d).click(e),a('<span class="ui-icon ui-icon-close"/>').appendTo(d).click(f),setTimeout(function(){d.parent().
detach(),b.fm.getUI("toolbar").prepend(d.show());if(a.browser.msie){var c=d.children(b.fm.direction=="ltr"?".ui-icon-close":".ui-icon-search");c.css({right:"",left:parseInt(d.width())-c.outerWidth(!0)})}},200),b.fm.error(function(){g.unbind("keydown")}).select(function(){g.blur()}).bind("searchend",function(){g.val("")}).viewchange(f).shortcut({pattern:"ctrl+f f3",description:b.title,callback:function(){g.select().focus()}})})},a.fn.elfindersortbutton=function(b){return this.each(function(){var c="class",d=b.fm,e=d.res(c,"disabled"),f=d.res(c,"active"),g=d.res(c,"hover"),h="elfinder-button-menu-item",i="elfinder-button-menu-item-selected",j,k=a(this).addClass("ui-state-default elfinder-button elfiner-button-"+b.name).attr("title",b.title).append('<span class="elfinder-button-icon elfinder-button-icon-'+b.name+'"/>').hover(function(a){!k.is("."+e)&&k.toggleClass(g)}).click(function(a){k.is("."+e)||(j&&b.variants.length>1?(j.is(":hidden")&&b.fm.getUI().click(),a.stopPropagation(),j.slideToggle(100)):b.exec())}),l=function(){j.hide()};a.isArray(b.variants)&&(k.addClass("elfinder-menubutton"),j=a('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>').hide().appendTo(k).zIndex(10+k.zIndex()).delegate("."+h,"hover",function(){a(this).toggleClass(g)}).delegate("."+h,"click",function(c){c.preventDefault(),c.stopPropagation(),k.removeClass(g),b.exec(b.fm.selected(),a(this).data("value"))}),b.fm.bind("disable select",l).getUI().click(l),b.change(function(){j.html(""),a.each(b.variants,function(c,d){j.append(a('<div class="'+h+" "+(d[0]==b.value?i:"")+" elfinder-menu-item-sort-"+b.fm.sortDirect+'"><span class="elfinder-menu-item-sort-dir"/>'+d[1]+"</div>").data("value",d[0]))})})),b.change(function(){b.disabled()?k.removeClass(f+" "+g).addClass(e):(k.removeClass(e),k[b.active()?"addClass":"removeClass"](f))}).change()})},a.fn.elfinderstat=function(b){return this.each(function(){var c=a(this).addClass("elfinder-stat-size"),d=a('<div class="elfinder-stat-selected"/>'),e=b.i18n("size").toLowerCase(),f=b.i18n("items").toLowerCase(),g=b.i18n("selected"),h=function(d,g){var h=0,i=0;a.each(d,function(a,b){if(!g||b.phash==g)h++,i+=parseInt(b.size)||0}),c.html(f+": "+h+", "+e+": "+b.formatSize(i))};b.getUI("statusbar").prepend(c).append(d).show(),b.bind("open reload add remove change searchend",function(){h(b.files(),b.cwd().hash)}).search(function(a){h(a.data.files)}).select(function(){var c=0,f=0,h=b.selectedFiles();if(h.length==1){c=h[0].size,d.html(b.escape(h[0].name)+(c>0?", "+b.formatSize(c):""));return}a.each(h,function(a,b){f++,c+=parseInt(b.size)||0}),d.html(f?g+": "+f+", "+e+": "+b.formatSize(c):"&nbsp;")})})},a.fn.elfindertoolbar=function(b,c){return this.not(".elfinder-toolbar").each(function(){var d=b._commands,e=a(this).addClass("ui-helper-clearfix ui-widget-header ui-corner-top elfinder-toolbar"),f=c||[],g=f.length,h,i,j,k;e.prev().length&&e.parent().prepend(this);while(g--)if(f[g]){j=a('<div class="ui-widget-content ui-corner-all elfinder-buttonset"/>'),h=f[g].length;while(h--)if(i=d[f[g][h]])k="elfinder"+i.options.ui,a.fn[k]&&j.prepend(a("<div/>")[k](i));j.children().length&&e.prepend(j),j.children(":not(:last),:not(:first):not(:last)").after('<span class="ui-widget-content elfinder-toolbar-button-separator"/>')}e.children().length&&e.show()}),this},a.fn.elfindertree=function(b,c){var d=b.res("class","tree");return this.not("."+d).each(function(){var e="class",f=b.res(e,"treeroot"),g=c.openRootOnLoad,h=b.res(e,"navsubtree"),i=b.res(e,"treedir"),j=b.res(e,"navcollapse"),k=b.res(e,"navexpand"),l="elfinder-subtree-loaded",m=b.res(e,"navarrow"),n=b.res(e,"active"),o=b.res(e,"adroppable"),p=b.res(e,"hover"),q=b.res(e,"disabled"),r=b.res(e,"draggable"),s=b.res(e,"droppable"),t=a.extend({},b.droppable,{hoverClass:p+" "+o,over:function(){var b=a(this);b.is("."+j+":not(."+k+")")&&setTimeout(function(){b.is("."+o)&&b.children("."+m).click()},500)}}),u=a(b.res("tpl","navspinner")),v=b.res("tpl","navdir"),w=b.res("tpl","perms"),x=b.res("tpl","symlink"),y={id:function(a){return b.navHash2Id(a.hash)},cssclass:function(a){return(a.phash?"":f)+" "+i+" "+b.perms2class(a)+" "+(a.dirs&&!a.link?j:"")},permissions:function(a){return!a.read||!a.write?w:""},symlink:function(a){return a.alias?x:""}},z=function(a){return a.name=b.escape(a.name),v.replace(/(?:\{([a-z]+)\})/ig,function(b,c){return a[c]||(y[c]?y[c](a):"")})},A=function(b){return a.map(b||[],function(a){return a.mime=="directory"?a:null})},B=function(a){return a?H.find("#"+b.navHash2Id(a)).next("."+h):H},C=function(c,d){var e=c.children(":first"),f;while(e.length){if((f=b.file(b.navId2Hash(e.children("[id]").attr("id"))))&&d.name.localeCompare(f.name)<0)return e;e=e.next()}return a("")},D=function(a){var c=a.length,d=[],e,f,g,h,i;for(e=0;e<c;e++){f=a[e];if(H.find("#"+b.navHash2Id(f.hash)).length)continue;(h=B(f.phash)).length?(g=z(f),f.phash&&(i=C(h,f)).length?i.before(g):h.append(g)):d.push(f)}if(d.length&&d.length<c)return D(d);F()},E=function(){var a=b.cwd().hash,d=H.find("#"+b.navHash2Id(a)),e;g&&(e=H.find("#"+b.navHash2Id(b.root())),e.is("."+l)&&e.addClass(k).next("."+h).show(),g=!1),d.is("."+n)||(H.find("."+i+"."+n).removeClass(n),d.addClass(n)),c.syncTree&&(d.length?d.parentsUntil("."+f).filter("."+h).show().prev("."+i).addClass(k):b.newAPI&&b.request({data:{cmd:"parents",target:a},preventFail:!0}).done(function(c){var d=A(c.tree);D(d),G(d,l),a==b.cwd().hash&&E()}))},F=function(){H.find("."+i+":not(."+s+",.elfinder-ro,.elfinder-na)").droppable(t)},G=function(c,d){var e=d==l?"."+j+":not(."+l+")":":not(."+j+")";a.each(c,function(c,f){H.find("#"+b.navHash2Id(f.phash)+e).filter(function(){return a(this).next("."+h).children().length>0}).addClass(d)})},H=a(this).addClass(d).delegate("."+i,"hover",function(c){var d=a(this),e=c.type=="mouseenter";d.is("."+o+" ,."+q)||(e&&!d.is("."+f+",."+r+",.elfinder-na,.elfinder-wo")&&d.draggable(b.draggable),d.toggleClass(p,e))}).delegate("."+i,"dropover dropout drop",function(b){a(this)[b.type=="dropover"?"addClass":"removeClass"](o+" "+p)}).delegate("."+i,"click",function(c){var d=a(this),e=b.navId2Hash(d.attr("id")),f=b.file(e);b.trigger("searchend"),e!=b.cwd().hash&&!d.is("."+q)?b.exec("open",f.thash||e):d.is("."+j)&&d.children("."+m).click()}).delegate("."+i+"."+j+" ."+m,"click",function(c){var d=a(this),e=d.parent("."+i),f=e.next("."+h);c.stopPropagation(),e.is("."+l)?(e.toggleClass(k),f.slideToggle()):(u.insertBefore(d),e.removeClass(j),b.request({cmd:"tree",target:b.navId2Hash(e.attr("id"))}).done(function(a){D(A(a.tree)),f.children().length&&(e.addClass(j+" "+k),f.slideDown()),E()}).always(function(a){u.remove(),e.addClass(l)}))}).delegate("."+i,"contextmenu",function(c){c.preventDefault(),b.trigger("contextmenu",{type:"navbar",targets:[b.navId2Hash(a(this).attr("id"))],x:c.clientX,y:c.clientY})});H.parent().find(".elfinder-navbar").append(H).show(),b.open(function(a){var b=a.data,c=A(b.files);b.init&&H.empty(),c.length&&(D(c),G(c,l)),E()}).add(function(a){var b=A(a.data.added);b.length&&(D(b),G(b,j))}).change(function(c){var d=A(c.data.changed),e=d.length,f,g,j,m,n,o,p,q,r;while(e--){f=d[e];if((g=H.find("#"+b.navHash2Id(f.hash))).length){if(f.phash){m=g.closest("."+h),n=B(f.phash),o=g.parent().next(),p=C(n,f);if(!n.length)continue;if(n[0]!==m[0]||o.get(0)!==p.get(0))p.length?p.before(g):n.append(g)}q=g.is("."+k),r=g.is("."+l),j=a(z(f)),g.replaceWith(j.children("."+i)),f.dirs&&(q||r)&&(g=H.find("#"+b.navHash2Id(f.hash)))&&g.next("."+h).children().length&&(q&&g.addClass(k),r&&g.addClass(l))}}E(),F()}).remove(function(a){var c=a.data.removed,d=c.length,e,f;while(d--)(e=H.find("#"+b.navHash2Id(c[d]))).length&&(f=e.closest("."+h),e.parent().detach(),f.children().length||f.hide().prev("."+i).removeClass(j+" "+k+" "+l))}).bind("search searchend",function(a){H.find("#"+b.navHash2Id(b.cwd().hash))[a.type=="search"?"removeClass":"addClass"](n)}).bind("lockfiles unlockfiles",function(c){var d=c.type=="lockfiles",e=d?"disable":"enable",f=a.map(c.data.files||[],function(a){var c=b.file(a);return c&&c.mime=="directory"?a:null});a.each(f,function(a,c){var f=H.find("#"+b.navHash2Id(c));f.length&&(f.is("."+r)&&f.draggable(e),f.is("."+s)&&f.droppable
(n),f[d?"addClass":"removeClass"](q))})})}),this},a.fn.elfinderuploadbutton=function(b){return this.each(function(){var c=a(this).elfinderbutton(b).unbind("click"),d=a("<form/>").appendTo(c),e=a('<input type="file" multiple="true"/>').change(function(){var c=a(this);c.val()&&(b.exec({input:c.remove()[0]}),e.clone(!0).appendTo(d))});d.append(e.clone(!0)),b.change(function(){d[b.disabled()?"hide":"show"]()}).change()})},a.fn.elfinderviewbutton=function(b){return this.each(function(){var c=a(this).elfinderbutton(b),d=c.children(".elfinder-button-icon");b.change(function(){var a=b.value=="icons";d.toggleClass("elfinder-button-icon-view-list",a),c.attr("title",b.fm.i18n(a?"viewlist":"viewicons"))})})},a.fn.elfinderworkzone=function(b){var c="elfinder-workzone";return this.not("."+c).each(function(){var b=a(this).addClass(c),d=b.outerHeight(!0)-b.height(),e=b.parent();e.add(window).bind("resize",function(){var f=e.height();e.children(":visible:not(."+c+")").each(function(){var b=a(this);b.css("position")!="absolute"&&(f-=b.outerHeight(!0))}),b.height(f-d)})}),this},elFinder.prototype.commands.archive=function(){var b=this,c=b.fm,d=[];this.variants=[],this.disableOnSearch=!0,c.bind("open reload",function(){b.variants=[],a.each(d=c.option("archivers").create||[],function(a,d){b.variants.push([d,c.mime2kind(d)])}),b.change()}),this.getstate=function(){return!this._disabled&&d.length&&c.selected().length&&c.cwd().write?0:-1},this.exec=function(b,e){var f=this.files(b),g=f.length,h=e||d[0],i=c.cwd(),j=["errArchive","errPerm"],k=a.Deferred().fail(function(a){a&&c.error(a)}),l;if(!(this.enabled()&&g&&d.length&&a.inArray(h,d)!==-1))return k.reject();if(!i.write)return k.reject(j);for(l=0;l<g;l++)if(!f[l].read)return k.reject(j);return c.request({data:{cmd:"archive",targets:this.hashes(b),type:h},notify:{type:"archive",cnt:1},syncOnFail:!0})}},elFinder.prototype.commands.back=function(){this.alwaysEnabled=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+left backspace"}],this.getstate=function(){return this.fm.history.canBack()?0:-1},this.exec=function(){return this.fm.history.back()}},elFinder.prototype.commands.copy=function(){this.shortcuts=[{pattern:"ctrl+c ctrl+insert"}],this.getstate=function(b){var b=this.files(b),c=b.length;return c&&a.map(b,function(a){return a.phash&&a.read?a:null}).length==c?0:-1},this.exec=function(b){var c=this.fm,d=a.Deferred().fail(function(a){c.error(a)});return a.each(this.files(b),function(a,b){if(!b.read||!b.phash)return!d.reject(["errCopy",b.name,"errPerm"])}),d.isRejected()?d:d.resolve(c.clipboard(this.hashes(b)))}},elFinder.prototype.commands.cut=function(){this.shortcuts=[{pattern:"ctrl+x shift+insert"}],this.getstate=function(b){var b=this.files(b),c=b.length;return c&&a.map(b,function(a){return a.phash&&a.read&&!a.locked?a:null}).length==c?0:-1},this.exec=function(b){var c=this.fm,d=a.Deferred().fail(function(a){c.error(a)});return a.each(this.files(b),function(a,b){if(!b.read||!b.phash)return!d.reject(["errCopy",b.name,"errPerm"]);if(b.locked)return!d.reject(["errLocked",b.name])}),d.isRejected()?d:d.resolve(c.clipboard(this.hashes(b),!0))}},elFinder.prototype.commands.download=function(){var b=this,c=this.fm,d=function(c){return a.map(b.files(c),function(a){return a.mime=="directory"?null:a})};this.shortcuts=[{pattern:"shift+enter"}],this.getstate=function(){var b=this.fm.selected(),c=b.length;return!this._disabled&&c&&(!a.browser.msie||c==1)&&c==d(b).length?0:-1},this.exec=function(b){var c=this.fm,e=c.options.url,f=d(b),g=a.Deferred(),h="",i="",j,k;if(this.disabled())return g.reject();if(c.oldAPI)return c.error("errCmdNoSupport"),g.reject();a.each(c.options.customData||{},function(a,b){i+="&"+a+"="+b}),e+=e.indexOf("?")===-1?"?":"&";for(j=0;j<f.length;j++)h+='<iframe class="downloader" id="downloader-'+f[j].hash+'" style="display:none" src="'+e+"cmd=file&target="+f[j].hash+"&download=1"+i+'"/>';return a(h).appendTo("body").ready(function(){setTimeout(function(){a(h).each(function(){a("#"+a(this).attr("id")).remove()})},a.browser.mozilla?2e4+1e4*j:1e3)}),c.trigger("download",{files:f}),g.resolve(b)}},elFinder.prototype.commands.duplicate=function(){var b=this.fm;this.getstate=function(c){var c=this.files(c),d=c.length;return!this._disabled&&d&&b.cwd().write&&a.map(c,function(a){return a.phash&&a.read?a:null}).length==d?0:-1},this.exec=function(b){var c=this.fm,d=this.files(b),e=d.length,f=a.Deferred().fail(function(a){a&&c.error(a)}),g=[];return!e||this._disabled?f.reject():(a.each(d,function(a,b){if(!b.read||!c.file(b.phash).write)return!f.reject(["errCopy",b.name,"errPerm"])}),f.isRejected()?f:c.request({data:{cmd:"duplicate",targets:this.hashes(b)},notify:{type:"copy",cnt:e}}))}},elFinder.prototype.commands.edit=function(){var b=this,c=this.fm,d=c.res("mimes","text")||[],e=function(c){return a.map(c,function(c){return(c.mime.indexOf("text/")===0||a.inArray(c.mime,d)!==-1)&&c.mime.indexOf("text/rtf")&&(!b.onlyMimes.length||a.inArray(c.mime,b.onlyMimes)!==-1)&&c.read&&c.write?c:null})},f=function(d,e,f){var g=a.Deferred(),h=a('<textarea class="elfinder-file-edit" rows="20" id="'+d+'-ta">'+c.escape(f)+"</textarea>"),i=function(){h.editor&&h.editor.save(h[0],h.editor.instance),g.resolve(h.getContent()),h.elfinderdialog("close")},j=function(){g.reject(),h.elfinderdialog("close")},k={title:e.name,width:b.options.dialogWidth||450,buttons:{},close:function(){h.editor&&h.editor.close(h[0],h.editor.instance),a(this).elfinderdialog("destroy")},open:function(){c.disable(),h.focus(),h[0].setSelectionRange&&h[0].setSelectionRange(0,0),h.editor&&h.editor.load(h[0])}};return h.getContent=function(){return h.val()},a.each(b.options.editors||[],function(b,c){if(a.inArray(e.mime,c.mimes||[])!==-1&&typeof c.load=="function"&&typeof c.save=="function")return h.editor={load:c.load,save:c.save,close:typeof c.close=="function"?c.close:function(){},instance:null},!1}),h.editor||h.keydown(function(a){var b=a.keyCode,c,d;a.stopPropagation(),b==9&&(a.preventDefault(),this.setSelectionRange&&(c=this.value,d=this.selectionStart,this.value=c.substr(0,d)+"	"+c.substr(this.selectionEnd),d+=1,this.setSelectionRange(d,d)));if(a.ctrlKey||a.metaKey){if(b==81||b==87)a.preventDefault(),j();b==83&&(a.preventDefault(),i())}}),k.buttons[c.i18n("Save")]=i,k.buttons[c.i18n("Cancel")]=j,c.dialog(h,k).attr("id",d),g.promise()},g=function(b){var d=b.hash,e=c.options,g=a.Deferred(),h={cmd:"file",target:d},i=c.url(d)||c.options.url,j="edit-"+c.namespace+"-"+b.hash,k=c.getUI().find("#"+j),l;return k.length?(k.elfinderdialog("toTop"),g.resolve()):!b.read||!b.write?(l=["errOpen",b.name,"errPerm"],c.error(l),g.reject(l)):(c.request({data:{cmd:"get",target:d},notify:{type:"openfile",cnt:1},syncOnFail:!0}).done(function(a){f(j,b,a.content).done(function(a){c.request({options:{type:"post"},data:{cmd:"put",target:d,content:a},notify:{type:"save",cnt:1},syncOnFail:!0}).fail(function(a){g.reject(a)}).done(function(a){a.changed&&a.changed.length&&c.change(a),g.resolve(a)})})}).fail(function(a){g.reject(a)}),g.promise())};this.shortcuts=[{pattern:"ctrl+e"}],this.init=function(){this.onlyMimes=this.options.mimes||[]},this.getstate=function(a){var a=this.files(a),b=a.length;return!this._disabled&&b&&e(a).length==b?0:-1},this.exec=function(b){var c=e(this.files(b)),d=[],f;if(this.disabled())return a.Deferred().reject();while(f=c.shift())d.push(g(f));return d.length?a.when.apply(null,d):a.Deferred().reject()}},elFinder.prototype.commands.extract=function(){var b=this,c=b.fm,d=[],e=function(b){return a.map(b,function(b){return b.read&&a.inArray(b.mime,d)!==-1?b:null})};this.disableOnSearch=!0,c.bind("open reload",function(){d=c.option("archivers").extract||[],b.change()}),this.getstate=function(a){var a=this.files(a),b=a.length;return!this._disabled&&b&&e(a).length==b?0:-1},this.exec=function(b){var e=this.files(b),f=a.Deferred(),g=e.length,h=g,i,j,k;if(!(this.enabled()&&g&&d.length))return f.reject();for(i=0;i<g;i++){j=e[i];if(!j.read||!c.file(j.phash).write)return k=["errExtract",j.name,"errPerm"],c.error(k),f.reject(k);if(a.inArray(j.mime,d)===-1)return k=["errExtract",j.name,"errNoArchive"],c.error(k),f.reject(k);c.request({data:{cmd:"extract",target:j.hash}
,notify:{type:"extract",cnt:1},syncOnFail:!0}).fail(function(a){f.isRejected()||f.reject(a)}).done(function(){h--,h==0&&f.resolve()})}return f}},elFinder.prototype.commands.forward=function(){this.alwaysEnabled=!0,this.updateOnSelect=!0,this.shortcuts=[{pattern:"ctrl+right"}],this.getstate=function(){return this.fm.history.canForward()?0:-1},this.exec=function(){return this.fm.history.forward()}},elFinder.prototype.commands.getfile=function(){var b=this,c=this.fm,d=function(c){var d=b.options;return c=a.map(c,function(a){return a.mime!="directory"||d.folders?a:null}),d.multiple||c.length==1?c:[]};this.alwaysEnabled=!0,this.callback=c.options.getFileCallback,this._disabled=typeof this.callback=="function",this.getstate=function(a){var a=this.files(a),b=a.length;return this.callback&&b&&d(a).length==b?0:-1},this.exec=function(c){var d=this.fm,e=this.options,f=this.files(c),g=f.length,h=d.option("url"),i=d.option("tmbUrl"),j=a.Deferred().done(function(a){d.trigger("getfile",{files:a}),b.callback(a,d),e.oncomplete=="close"?d.hide():e.oncomplete=="destroy"&&d.destroy()}),k=function(b){return e.onlyURL?e.multiple?a.map(f,function(a){return a.url}):f[0].url:e.multiple?f:f[0]},l=[],m,n,o;if(this.getstate()==-1)return j.reject();for(m=0;m<g;m++){n=f[m];if(n.mime=="directory"&&!e.folders)return j.reject();n.baseUrl=h,n.url=d.url(n.hash),n.path=d.path(n.hash),n.tmb&&n.tmb!=1&&(n.tmb=i+n.tmb),!n.width&&!n.height&&(n.dim?(o=n.dim.split("x"),n.width=o[0],n.height=o[1]):n.mime.indexOf("image")!==-1&&l.push(d.request({data:{cmd:"dim",target:n.hash},preventDefault:!0}).done(a.proxy(function(a){a.dim&&(o=a.dim.split("x"),this.width=o[0],this.height=o[1]),this.dim=a.dim},f[m]))))}return l.length?(a.when.apply(null,l).always(function(){j.resolve(k(f))}),j):j.resolve(k(f))}},elFinder.prototype.commands.help=function(){var b=this.fm,c=this,d='<div class="elfinder-help-link"> <a href="{url}">{link}</a></div>',e='<div class="elfinder-help-team"><div>{author}</div>{work}</div>',f=/\{url\}/,g=/\{link\}/,h=/\{author\}/,i=/\{work\}/,j="replace",k="ui-priority-primary",l="ui-priority-secondary",m="elfinder-help-license",n='<li class="ui-state-default ui-corner-top"><a href="#{id}">{title}</a></li>',o=['<div class="ui-tabs ui-widget ui-widget-content ui-corner-all elfinder-help">','<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">'],p='<div class="elfinder-help-shortcut"><div class="elfinder-help-shortcut-pattern">{pattern}</div> {descrip}</div>',q='<div class="elfinder-help-separator"/>',r=function(){o.push('<div id="about" class="ui-tabs-panel ui-widget-content ui-corner-bottom"><div class="elfinder-help-logo"/>'),o.push("<h3>elFinder</h3>"),o.push('<div class="'+k+'">'+b.i18n("webfm")+"</div>"),o.push('<div class="'+l+'">'+b.i18n("ver")+": "+b.version+", "+b.i18n("protocol")+": "+b.api+"</div>"),o.push('<div class="'+l+'">jQuery/jQuery UI: '+a().jquery+"/"+a.ui.version+"</div>"),o.push(q),o.push(d[j](f,"http://elfinder.org/")[j](g,b.i18n("homepage"))),o.push(d[j](f,"https://github.com/Studio-42/elFinder/wiki")[j](g,b.i18n("docs"))),o.push(d[j](f,"https://github.com/Studio-42/elFinder")[j](g,b.i18n("github"))),o.push(d[j](f,"http://twitter.com/elrte_elfinder")[j](g,b.i18n("twitter"))),o.push(q),o.push('<div class="'+k+'">'+b.i18n("team")+"</div>"),o.push(e[j](h,'Dmitry "dio" Levashov &lt;dio@std42.ru&gt;')[j](i,b.i18n("chiefdev"))),o.push(e[j](h,"Troex Nevelin &lt;troex@fury.scancode.ru&gt;")[j](i,b.i18n("maintainer"))),o.push(e[j](h,"Alexey Sukhotin &lt;strogg@yandex.ru&gt;")[j](i,b.i18n("contributor"))),o.push(e[j](h,"Naoki Sawada &lt;hypweb@gmail.com&gt;")[j](i,b.i18n("contributor"))),b.i18[b.lang].translator&&o.push(e[j](h,b.i18[b.lang].translator)[j](i,b.i18n("translator")+" ("+b.i18[b.lang].language+")")),o.push(q),o.push('<div class="'+m+'">'+b.i18n("icons")+': <a href="http://pixelmixer.ru/" target="_blank">Pixelmixer</a>, <a href="http://p.yusukekamiyamane.com" target="_blank">Fugue</a></div>'),o.push(q),o.push('<div class="'+m+'">Licence: BSD Licence</div>'),o.push('<div class="'+m+'">Copyright © 2009-2011, Studio 42</div>'),o.push('<div class="'+m+'">„ …'+b.i18n("dontforget")+" ”</div>"),o.push("</div>")},s=function(){var c=b.shortcuts();o.push('<div id="shortcuts" class="ui-tabs-panel ui-widget-content ui-corner-bottom">'),c.length?(o.push('<div class="ui-widget-content elfinder-help-shortcuts">'),a.each(c,function(a,b){o.push(p.replace(/\{pattern\}/,b[0]).replace(/\{descrip\}/,b[1]))}),o.push("</div>")):o.push('<div class="elfinder-help-disabled">'+b.i18n("shortcutsof")+"</div>"),o.push("</div>")},t=function(){o.push('<div id="help" class="ui-tabs-panel ui-widget-content ui-corner-bottom">'),o.push('<a href="http://elfinder.org/forum/" target="_blank" class="elfinder-dont-panic"><span>DON\'T PANIC</span></a>'),o.push("</div>")},u;this.alwaysEnabled=!0,this.updateOnSelect=!1,this.state=0,this.shortcuts=[{pattern:"f1",description:this.title}],setTimeout(function(){var d=c.options.view||["about","shortcuts","help"];a.each(d,function(a,c){o.push(n[j](/\{id\}/,c)[j](/\{title\}/,b.i18n(c)))}),o.push("</ul>"),a.inArray("about",d)!==-1&&r(),a.inArray("shortcuts",d)!==-1&&s(),a.inArray("help",d)!==-1&&t(),o.push("</div>"),u=a(o.join("")),u.find(".ui-tabs-nav li").hover(function(){a(this).toggleClass("ui-state-hover")}).children().click(function(b){var c=a(this);b.preventDefault(),b.stopPropagation(),c.is(".ui-tabs-selected")||(c.parent().addClass("ui-tabs-selected ui-state-active").siblings().removeClass("ui-tabs-selected").removeClass("ui-state-active"),u.find(".ui-tabs-panel").hide().filter(c.attr("href")).show())}).filter(":first").click()},200),this.getstate=function(){return 0},this.exec=function(){this.dialog||(this.dialog=this.fm.dialog(u,{title:this.title,width:530,autoOpen:!1,destroyOnClose:!1})),this.dialog.elfinderdialog("open").find(".ui-tabs-nav li a:first").click()}},elFinder.prototype.commands.home=function(){this.title="Home",this.alwaysEnabled=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+home ctrl+shift+up",description:"Home"}],this.getstate=function(){var a=this.fm.root(),b=this.fm.cwd().hash;return a&&b&&a!=b?0:-1},this.exec=function(){return this.fm.exec("open",this.fm.root())}},elFinder.prototype.commands.info=function(){var b="msg",c=this.fm,d="elfinder-info-spinner",e={calc:c.i18n("calc"),size:c.i18n("size"),unknown:c.i18n("unknown"),path:c.i18n("path"),aliasfor:c.i18n("aliasfor"),modify:c.i18n("modify"),perms:c.i18n("perms"),locked:c.i18n("locked"),dim:c.i18n("dim"),kind:c.i18n("kind"),files:c.i18n("files"),folders:c.i18n("folders"),items:c.i18n("items"),yes:c.i18n("yes"),no:c.i18n("no"),link:c.i18n("link")};this.tpl={main:'<div class="ui-helper-clearfix elfinder-info-title"><span class="elfinder-cwd-icon {class} ui-corner-all"/>{title}</div><table class="elfinder-info-tb">{content}</table>',itemTitle:'<strong>{name}</strong><span class="elfinder-info-kind">{kind}</span>',groupTitle:"<strong>{items}: {num}</strong>",row:"<tr><td>{label} : </td><td>{value}</td></tr>",spinner:'<span>{text}</span> <span class="'+d+'"/>'},this.alwaysEnabled=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+i"}],this.init=function(){a.each(e,function(a,b){e[a]=c.i18n(b)})},this.getstate=function(){return 0},this.exec=function(b){var c=this,f=this.fm,g=this.tpl,h=g.row,i=this.files(b),j=i.length,k=[],l=g.main,m="{label}",n="{value}",o={title:this.title,width:"auto",close:function(){a(this).elfinderdialog("destroy")}},p=[],q=function(a){s.find("."+d).parent().text(a)},r=f.namespace+"-info-"+a.map(i,function(a){return a.hash}).join("-"),s=f.getUI().find("#"+r),t,u,v,w,x;if(!j)return a.Deferred().reject();if(s.length)return s.elfinderdialog("toTop"),a.Deferred().resolve();j==1?(v=i[0],l=l.replace("{class}",f.mime2class(v.mime)),w=g.itemTitle.replace("{name}",v.name).replace("{kind}",f.mime2kind(v)),v.tmb&&(u=f.option("tmbUrl")+v.tmb),v.read?v.mime!="directory"||v.alias?t=f.formatSize(v.size):(t=g.spinner.replace("{text}",e.calc),p.push(v.hash)):t=e.unknown,k.push(h.replace(m,e.size).replace(n,t)),v.alias&&k.push(h.replace(m,e.aliasfor).replace(n,v.alias)),k.push(h.replace(m,e.path).replace(n,f.escape(f.path
(v.hash)))),v.read&&k.push(h.replace(m,e.link).replace(n,'<a href="'+f.url(v.hash)+'" target="_blank">'+v.name+"</a>")),v.dim?k.push(h.replace(m,e.dim).replace(n,v.dim)):v.mime.indexOf("image")!==-1&&(v.width&&v.height?k.push(h.replace(m,e.dim).replace(n,v.width+"x"+v.height)):(k.push(h.replace(m,e.dim).replace(n,g.spinner.replace("{text}",e.calc))),f.request({data:{cmd:"dim",target:v.hash},preventDefault:!0}).fail(function(){q(e.unknown)}).done(function(a){q(a.dim||e.unknown)}))),k.push(h.replace(m,e.modify).replace(n,f.formatDate(v))),k.push(h.replace(m,e.perms).replace(n,f.formatPermissions(v))),k.push(h.replace(m,e.locked).replace(n,v.locked?e.yes:e.no))):(l=l.replace("{class}","elfinder-cwd-icon-group"),w=g.groupTitle.replace("{items}",e.items).replace("{num}",j),x=a.map(i,function(a){return a.mime=="directory"?1:null}).length,x?(k.push(h.replace(m,e.kind).replace(n,x==j?e.folders:e.folders+" "+x+", "+e.files+" "+(j-x))),k.push(h.replace(m,e.size).replace(n,g.spinner.replace("{text}",e.calc))),p=a.map(i,function(a){return a.hash})):(t=0,a.each(i,function(a,b){var c=parseInt(b.size);c>=0&&t>=0?t+=c:t="unknown"}),k.push(h.replace(m,e.kind).replace(n,e.files)),k.push(h.replace(m,e.size).replace(n,f.formatSize(t))))),l=l.replace("{title}",w).replace("{content}",k.join("")),s=f.dialog(l,o),s.attr("id",r),u&&a("<img/>").load(function(){s.find(".elfinder-cwd-icon").css("background",'url("'+u+'") center center no-repeat')}).attr("src",u),p.length&&f.request({data:{cmd:"size",targets:p},preventDefault:!0}).fail(function(){q(e.unknown)}).done(function(a){var b=parseInt(a.size);f.log(a.size),q(b>=0?f.formatSize(b):e.unknown)})}},elFinder.prototype.commands.mkdir=function(){this.disableOnSearch=!0,this.updateOnSelect=!1,this.mime="directory",this.prefix="untitled folder",this.exec=a.proxy(this.fm.res("mixin","make"),this),this.shortcuts=[{pattern:"ctrl+shift+n"}],this.getstate=function(){return!this._disabled&&this.fm.cwd().write?0:-1}},elFinder.prototype.commands.mkfile=function(){this.disableOnSearch=!0,this.updateOnSelect=!1,this.mime="text/plain",this.prefix="untitled file.txt",this.exec=a.proxy(this.fm.res("mixin","make"),this),this.getstate=function(){return!this._disabled&&this.fm.cwd().write?0:-1}},elFinder.prototype.commands.open=function(){this.alwaysEnabled=!0,this._handlers={dblclick:function(a){a.preventDefault(),this.exec()},"select enable disable reload":function(a){this.update(a.type=="disable"?-1:void 0)}},this.shortcuts=[{pattern:"ctrl+down numpad_enter"+(this.fm.OS!="mac"&&" enter")}],this.getstate=function(b){var b=this.files(b),c=b.length;return c==1?0:c?a.map(b,function(a){return a.mime=="directory"?null:a}).length==c?0:-1:-1},this.exec=function(b){var c=this.fm,d=a.Deferred().fail(function(a){a&&c.error(a)}),e=this.files(b),f=e.length,g,h,i,j;if(!f)return d.reject();if(f==1&&(g=e[0])&&g.mime=="directory")return g&&!g.read?d.reject(["errOpen",g.name,"errPerm"]):c.request({data:{cmd:"open",target:g.thash||g.hash},notify:{type:"open",cnt:1,hideCnt:!0},syncOnFail:!0});e=a.map(e,function(a){return a.mime!="directory"?a:null});if(f!=e.length)return d.reject();f=e.length;while(f--){g=e[f];if(!g.read)return d.reject(["errOpen",g.name,"errPerm"]);(h=c.url(g.hash))||(h=c.options.url,h=h+(h.indexOf("?")===-1?"?":"&")+(c.oldAPI?"cmd=open&current="+g.phash:"cmd=file")+"&target="+g.hash),j="",g.dim&&(i=g.dim.split("x"),j="width="+(parseInt(i[0])+20)+",height="+(parseInt(i[1])+20));if(!window.open(h,"_blank",j+",top=50,left=50,scrollbars=yes,resizable=yes"))return d.reject("errPopup")}return d.resolve(b)}},elFinder.prototype.commands.paste=function(){this.disableOnSearch=!0,this.updateOnSelect=!1,this.handlers={changeclipboard:function(){this.update()}},this.shortcuts=[{pattern:"ctrl+v shift+insert"}],this.getstate=function(b){if(this._disabled)return-1;if(b){if(a.isArray(b)){if(b.length!=1)return-1;b=this.fm.file(b[0])}}else b=this.fm.cwd();return this.fm.clipboard().length&&b.mime=="directory"&&b.write?0:-1},this.exec=function(b){var c=this,d=c.fm,b=b?this.files(b)[0]:d.cwd(),e=d.clipboard(),f=e.length,g=f?e[0].cut:!1,h=g?"errMove":"errCopy",i=[],j=[],k=a.Deferred().fail(function(a){a&&d.error(a)}),l=function(b){return b.length&&d._commands.duplicate?d.exec("duplicate",b):a.Deferred().resolve()},m=function(e){var f=a.Deferred(),h=[],i=function(b,c){var d=[],e=b.length;while(e--)a.inArray(b[e].name,c)!==-1&&d.unshift(e);return d},j=function(a){var b=h[a],c=e[b],i=a==h.length-1;if(!c)return;d.confirm({title:d.i18n(g?"moveFiles":"copyFiles"),text:d.i18n(["errExists",c.name,"confirmRepl"]),all:!i,accept:{label:"btnYes",callback:function(b){!i&&!b?j(++a):l(e)}},reject:{label:"btnNo",callback:function(b){var c;if(b){c=h.length;while(a<c--)e[h[c]].remove=!0}else e[h[a]].remove=!0;!i&&!b?j(++a):l(e)}},cancel:{label:"btnCancel",callback:function(){f.resolve()}}})},k=function(a){h=i(e,a),h.length?j(0):l(e)},l=function(c){var c=a.map(c,function(a){return a.remove?null:a}),e=c.length,h={},i=[],j;if(!e)return f.resolve();j=c[0].phash,c=a.map(c,function(a){return a.hash}),d.request({data:{cmd:"paste",dst:b.hash,targets:c,cut:g?1:0,src:j},notify:{type:g?"move":"copy",cnt:e}}).always(function(){d.unlockfiles({files:c})})};return c._disabled||!e.length?f.resolve():(d.oldAPI?l(e):d.option("copyOverwrite")?b.hash==d.cwd().hash?k(a.map(d.files(),function(a){return a.phash==b.hash?a.name:null})):d.request({data:{cmd:"ls",target:b.hash},notify:{type:"prepare",cnt:1,hideCnt:!0},preventFail:!0}).always(function(a){k(a.list||[])}):l(e),f)},n,o;return!f||!b||b.mime!="directory"?k.reject():b.write?(n=d.parents(b.hash),a.each(e,function(c,f){if(!f.read)return!k.reject([h,e[0].name,"errPerm"]);if(g&&f.locked)return!k.reject(["errLocked",f.name]);if(a.inArray(f.hash,n)!==-1)return!k.reject(["errCopyInItself",f.name]);o=d.parents(f.hash);if(a.inArray(b.hash,o)!==-1&&a.map(o,function(a){var c=d.file(a);return c.phash==b.hash&&c.name==f.name?c:null}).length)return!k.reject(["errReplByChild",f.name]);f.phash==b.hash?j.push(f.hash):i.push({hash:f.hash,phash:f.phash,name:f.name})}),k.isRejected()?k:a.when(l(j),m(i)).always(function(){g&&d.clipboard([])})):k.reject([h,e[0].name,"errPerm"])}},elFinder.prototype.commands.quicklook=function(){var b=this,c=b.fm,d=0,e=1,f=2,g=d,h="elfinder-quicklook-navbar-icon",i="elfinder-quicklook-fullscreen",j=function(b){a(document).trigger(a.Event("keydown",{keyCode:b,ctrlKey:!1,shiftKey:!1,altKey:!1,metaKey:!1}))},k=function(a){return{opacity:0,width:20,height:c.view=="list"?1:20,top:a.offset().top+"px",left:a.offset().left+"px"}},l=function(){var b=a(window);return{opacity:1,width:n,height:o,top:parseInt((b.height()-o)/2+b.scrollTop()),left:parseInt((b.width()-n)/2+b.scrollLeft())}},m=function(a){var b=document.createElement(a.substr(0,a.indexOf("/"))),c=b.canPlayType&&b.canPlayType(a);return c&&c!==""&&c!="no"},n,o,p,q,r=a('<div class="elfinder-quicklook-title"/>'),s=a("<div/>"),t=a('<div class="elfinder-quicklook-info"/>'),u=a('<div class="'+h+" "+h+'-fullscreen"/>').mousedown(function(d){var e=b.window,f=e.is("."+i),g="scroll."+c.namespace,j=a(window);d.stopPropagation(),f?(e.css(e.data("position")).unbind("mousemove"),j.unbind(g).trigger(b.resize).unbind(b.resize),v.unbind("mouseenter").unbind("mousemove")):(e.data("position",{left:e.css("left"),top:e.css("top"),width:e.width(),height:e.height()}).css({width:"100%",height:"100%"}),a(window).bind(g,function(){e.css({left:parseInt(a(window).scrollLeft())+"px",top:parseInt(a(window).scrollTop())+"px"})}).bind(b.resize,function(a){b.preview.trigger("changesize")}).trigger(g).trigger(b.resize),e.bind("mousemove",function(a){v.stop(!0,!0).show().delay(3e3).fadeOut("slow")}).mousemove(),v.mouseenter(function(){v.stop(!0,!0).show()}).mousemove(function(a){a.stopPropagation()})),v.attr("style","").draggable(f?"destroy":{}),e.toggleClass(i),a(this).toggleClass(h+"-fullscreen-off"),a.fn.resizable&&p.add(e).resizable(f?"enable":"disable").removeClass("ui-state-disabled")}),v=a('<div class="elfinder-quicklook-navbar"/>').append(a('<div class="'+h+" "+h+'-prev"/>').mousedown(function(){j(37)})).append(u).append(a('<div class="'+h+" "+h+'-next"/>').mousedown(function(){j(39)})).append('<div class="elfinder-quicklook-navbar-separator"/>'
).append(a('<div class="'+h+" "+h+'-close"/>').mousedown(function(){b.window.trigger("close")}));this.resize="resize."+c.namespace,this.info=a('<div class="elfinder-quicklook-info-wrapper"/>').append(s).append(t),this.preview=a('<div class="elfinder-quicklook-preview ui-helper-clearfix"/>').bind("change",function(a){b.info.attr("style","").hide(),s.removeAttr("class").attr("style",""),t.html("")}).bind("update",function(c){var d=b.fm,e=b.preview,f=c.file,g='<div class="elfinder-quicklook-info-data">{value}</div>',h;f?(!f.read&&c.stopImmediatePropagation(),b.window.data("hash",f.hash),b.preview.unbind("changesize").trigger("change").children().remove(),r.html(d.escape(f.name)),t.html(g.replace(/\{value\}/,f.name)+g.replace(/\{value\}/,d.mime2kind(f))+(f.mime=="directory"?"":g.replace(/\{value\}/,d.formatSize(f.size)))+g.replace(/\{value\}/,d.i18n("modify")+": "+d.formatDate(f.date))),s.addClass("elfinder-cwd-icon ui-corner-all "+d.mime2class(f.mime)),f.tmb&&a("<img/>").hide().appendTo(b.preview).load(function(){s.css("background",'url("'+h+'") center center no-repeat'),a(this).remove()}).attr("src",h=d.tmb(f.hash)),b.info.delay(100).fadeIn(10)):c.stopImmediatePropagation()}),this.window=a('<div class="ui-helper-reset ui-widget elfinder-quicklook" style="position:absolute"/>').click(function(a){a.stopPropagation()}).append(a('<div class="elfinder-quicklook-titlebar"/>').append(r).append(a('<span class="ui-icon ui-icon-circle-close"/>').mousedown(function(a){a.stopPropagation(),b.window.trigger("close")}))).append(this.preview.add(v)).append(b.info.hide()).draggable({handle:"div.elfinder-quicklook-titlebar"}).bind("open",function(a){var c=b.window,d=b.value,h;b.closed()&&d&&(h=q.find("#"+d.hash)).length&&(g=e,h.trigger("scrolltoview"),c.css(k(h)).show().animate(l(),550,function(){g=f,b.update(1,b.value)}))}).bind("close",function(a){var c=b.window,f=b.preview.trigger("change"),h=b.value,j=q.find("#"+c.data("hash")),l=function(){g=d,c.hide(),f.children().remove(),b.update(0,b.value)};b.opened()&&(g=e,c.is("."+i)&&u.mousedown(),j.length?c.animate(k(j),500,l):l())}),this.alwaysEnabled=!0,this.value=null,this.handlers={select:function(){this.update(void 0,this.fm.selectedFiles()[0])},error:function(){b.window.is(":visible")&&b.window.data("hash","").trigger("close")},"searchshow searchhide":function(){this.opened()&&this.window.trigger("close")}},this.shortcuts=[{pattern:"space"}],this.support={audio:{ogg:m('audio/ogg; codecs="vorbis"'),mp3:m("audio/mpeg;"),wav:m('audio/wav; codecs="1"'),m4a:m("audio/x-m4a;")||m("audio/aac;")},video:{ogg:m('video/ogg; codecs="theora"'),webm:m('video/webm; codecs="vp8, vorbis"'),mp4:m('video/mp4; codecs="avc1.42E01E"')||m('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')}},this.closed=function(){return g==d},this.opened=function(){return g==f},this.init=function(){var d=this.options,e=this.window,f=this.preview,g,h;n=d.width>0?parseInt(d.width):450,o=d.height>0?parseInt(d.height):300,c.one("load",function(){p=c.getUI(),q=c.getUI("cwd"),e.appendTo("body").zIndex(100+p.zIndex()),a(document).keydown(function(a){a.keyCode==27&&b.opened()&&e.trigger("close")}),a.fn.resizable&&e.resizable({handles:"se",minWidth:350,minHeight:120,resize:function(){f.trigger("changesize")}}),b.change(function(){b.opened()&&(b.value?f.trigger(a.Event("update",{file:b.value})):e.trigger("close"))}),a.each(c.commands.quicklook.plugins||[],function(a,c){typeof c=="function"&&new c(b)}),f.bind("update",function(){b.info.show()})})},this.getstate=function(){return this.fm.selected().length==1?g==f?1:0:-1},this.exec=function(){this.enabled()&&this.window.trigger(this.opened()?"close":"open")},this.hideinfo=function(){this.info.stop(!0).hide()}},elFinder.prototype.commands.quicklook.plugins=[function(b){var c=["image/jpeg","image/png","image/gif"],d=b.preview;a.each(navigator.mimeTypes,function(b,d){var e=d.type;e.indexOf("image/")===0&&a.inArray(e,c)&&c.push(e)}),d.bind("update",function(e){var f=e.file,g;a.inArray(f.mime,c)!==-1&&(e.stopImmediatePropagation(),g=a("<img/>").hide().appendTo(d).load(function(){setTimeout(function(){var a=(g.width()/g.height()).toFixed(2);d.bind("changesize",function(){var b=parseInt(d.width()),c=parseInt(d.height()),e,f;a<(b/c).toFixed(2)?(f=c,e=Math.floor(f*a)):(e=b,f=Math.floor(e/a)),g.width(e).height(f).css("margin-top",f<c?Math.floor((c-f)/2):0)}).trigger("changesize"),b.hideinfo(),g.fadeIn(100)},1)}).attr("src",b.fm.url(f.hash)))})},function(b){var c=["text/html","application/xhtml+xml"],d=b.preview,e=b.fm;d.bind("update",function(f){var g=f.file,h;a.inArray(g.mime,c)!==-1&&(f.stopImmediatePropagation(),d.one("change",function(){!h.isResolved()&&!h.isRejected()&&h.reject()}),h=e.request({data:{cmd:"get",target:g.hash,current:g.phash},preventDefault:!0}).done(function(c){b.hideinfo(),doc=a('<iframe class="elfinder-quicklook-preview-html"/>').appendTo(d)[0].contentWindow.document,doc.open(),doc.write(c.content),doc.close()}))})},function(b){var c=b.fm,d=c.res("mimes","text"),e=b.preview;e.bind("update",function(f){var g=f.file,h=g.mime,i;if(h.indexOf("text/")===0||a.inArray(h,d)!==-1)f.stopImmediatePropagation(),e.one("change",function(){!i.isResolved()&&!i.isRejected()&&i.reject()}),i=c.request({data:{cmd:"get",target:g.hash},preventDefault:!0}).done(function(d){b.hideinfo(),a('<div class="elfinder-quicklook-preview-text-wrapper"><pre class="elfinder-quicklook-preview-text">'+c.escape(d.content)+"</pre></div>").appendTo(e)})})},function(b){var c=b.fm,d="application/pdf",e=b.preview,f=!1;a.browser.safari&&navigator.platform.indexOf("Mac")!=-1||a.browser.msie?f=!0:a.each(navigator.plugins,function(b,c){a.each(c,function(a,b){if(b.type==d)return!(f=!0)})}),f&&e.bind("update",function(f){var g=f.file,h;g.mime==d&&(f.stopImmediatePropagation(),e.one("change",function(){h.unbind("load").remove()}),h=a('<iframe class="elfinder-quicklook-preview-pdf"/>').hide().appendTo(e).load(function(){b.hideinfo(),h.show()}).attr("src",c.url(g.hash)))})},function(b){var c=b.fm,d="application/x-shockwave-flash",e=b.preview,f=!1;a.each(navigator.plugins,function(b,c){a.each(c,function(a,b){if(b.type==d)return!(f=!0)})}),f&&e.bind("update",function(f){var g=f.file,h;g.mime==d&&(f.stopImmediatePropagation(),b.hideinfo(),e.append(h=a('<embed class="elfinder-quicklook-preview-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" src="'+c.url(g.hash)+'" quality="high" type="application/x-shockwave-flash" />')))})},function(b){var c=b.preview,d=!!b.options.autoplay,e={"audio/mpeg":"mp3","audio/mpeg3":"mp3","audio/mp3":"mp3","audio/x-mpeg3":"mp3","audio/x-mp3":"mp3","audio/x-wav":"wav","audio/wav":"wav","audio/x-m4a":"m4a","audio/aac":"m4a","audio/mp4":"m4a","audio/x-mp4":"m4a","audio/ogg":"ogg"},f;c.bind("update",function(g){var h=g.file,i=e[h.mime];b.support.audio[i]&&(g.stopImmediatePropagation(),f=a('<audio class="elfinder-quicklook-preview-audio" controls preload="auto" autobuffer><source src="'+b.fm.url(h.hash)+'" /></audio>').appendTo(c),d&&f[0].play())}).bind("change",function(){f&&f.parent().length&&(f[0].pause(),f.remove(),f=null)})},function(b){var c=b.preview,d=!!b.options.autoplay,e={"video/mp4":"mp4","video/x-m4v":"mp4","video/ogg":"ogg","application/ogg":"ogg","video/webm":"webm"},f;c.bind("update",function(g){var h=g.file,i=e[h.mime];b.support.video[i]&&(g.stopImmediatePropagation(),b.hideinfo(),f=a('<video class="elfinder-quicklook-preview-video" controls preload="auto" autobuffer><source src="'+b.fm.url(h.hash)+'" /></video>').appendTo(c),d&&f[0].play())}).bind("change",function(){f&&f.parent().length&&(f[0].pause(),f.remove(),f=null)})},function(b){var c=b.preview,d=[],e;a.each(navigator.plugins,function(b,c){a.each(c,function(a,b){(b.type.indexOf("audio/")===0||b.type.indexOf("video/")===0)&&d.push(b.type)})}),c.bind("update",function(f){var g=f.file,h=g.mime,i;a.inArray(g.mime,d)!==-1&&(f.stopImmediatePropagation(),(i=h.indexOf("video/")===0)&&b.hideinfo(),e=a('<embed src="'+b.fm.url(g.hash)+'" type="'+h+'" class="elfinder-quicklook-preview-'+(i?"video":"audio")+'"/>').appendTo(c))}).bind("change",function(){e&&e.parent().length&&(e.remove(),e=null)})}],elFinder.prototype.commands.reload=function(){this.alwaysEnabled=!0
,this.updateOnSelect=!0,this.shortcuts=[{pattern:"ctrl+shift+r f5"}],this.getstate=function(){return 0},this.exec=function(){var a=this.fm,b=a.sync(),c=setTimeout(function(){a.notify({type:"reload",cnt:1,hideCnt:!0}),b.always(function(){a.notify({type:"reload",cnt:-1})})},a.notifyDelay);return b.always(function(){clearTimeout(c),a.trigger("reload")})}},elFinder.prototype.commands.rename=function(){this.shortcuts=[{pattern:"f2"+(this.fm.OS=="mac"?" enter":"")}],this.getstate=function(){var a=this.fm.selectedFiles();return!this._disabled&&a.length==1&&a[0].phash&&!a[0].locked?0:-1},this.exec=function(){var b=this.fm,c=b.getUI("cwd"),d=b.selected(),e=d.length,f=b.file(d.shift()),g=".elfinder-cwd-filename",h=a.Deferred().fail(function(a){var d=i.parent(),e=b.escape(f.name);d.length?(i.remove(),d.html(e)):(c.find("#"+f.hash).find(g).html(e),setTimeout(function(){c.find("#"+f.hash).click()},50)),a&&b.error(a)}).always(function(){b.enable()}),i=a('<input type="text"/>').keydown(function(b){b.stopPropagation(),b.stopImmediatePropagation(),b.keyCode==a.ui.keyCode.ESCAPE?h.reject():b.keyCode==a.ui.keyCode.ENTER&&i.blur()}).mousedown(function(a){a.stopPropagation()}).dblclick(function(a){a.stopPropagation(),a.preventDefault()}).blur(function(){var c=a.trim(i.val()),d=i.parent();if(d.length){i[0].setSelectionRange&&i[0].setSelectionRange(0,0);if(c==f.name)return h.reject();if(!c)return h.reject("errInvName");if(b.fileByName(c,f.phash))return h.reject(["errExists",c]);d.html(b.escape(c)),b.lockfiles({files:[f.hash]}),b.request({data:{cmd:"rename",target:f.hash,name:c},notify:{type:"rename",cnt:1}}).fail(function(a){h.reject(),b.sync()}).done(function(a){h.resolve(a)}).always(function(){b.unlockfiles({files:[f.hash]})})}}),j=c.find("#"+f.hash).find(g).empty().append(i.val(f.name)),k=i.val().replace(/\.((tar\.(gz|bz|bz2|z|lzo))|cpio\.gz|ps\.gz|xcf\.(gz|bz2)|[a-z0-9]{1,4})$/ig,"");return this.disabled()?h.reject():!f||e>1||!j.length?h.reject("errCmdParams",this.title):f.locked?h.reject(["errLocked",f.name]):(b.one("select",function(){i.parent().length&&f&&a.inArray(f.hash,b.selected())===-1&&i.blur()}),i.select().focus(),i[0].setSelectionRange&&i[0].setSelectionRange(0,k.length),h)}},elFinder.prototype.commands.resize=function(){this.updateOnSelect=!1,this.getstate=function(){var a=this.fm.selectedFiles();return!this._disabled&&a.length==1&&a[0].read&&a[0].write&&a[0].mime.indexOf("image/")!==-1?0:-1},this.exec=function(b){var c=this.fm,d=this.files(b),e=a.Deferred(),f=function(b,d){var f=a('<div class="elfinder-dialog-resize"/>'),g='<input type="text" size="5"/>',h='<div class="elfinder-resize-row"/>',i='<div class="elfinder-resize-label"/>',j=a('<div class="elfinder-resize-control"/>'),k=a('<div class="elfinder-resize-preview"/>'),l=a('<div class="elfinder-resize-spinner">'+c.i18n("ntfloadimg")+"</div>"),m=a('<div class="elfinder-resize-handle"/>'),n=a('<div class="elfinder-resize-handle"/>'),o=a('<div class="elfinder-resize-uiresize"/>'),p=a('<div class="elfinder-resize-uicrop"/>'),q='<div class="ui-widget-content ui-corner-all elfinder-buttonset"/>',r='<div class="ui-state-default elfinder-button"/>',s='<span class="ui-widget-content elfinder-toolbar-button-separator"/>',t=a('<div class="elfinder-resize-rotate"/>'),u=a(r).attr("title",c.i18n("rotate-cw")).append(a('<span class="elfinder-button-icon elfinder-button-icon-rotate-l"/>').click(function(){S-=90,ab.update(S)})),v=a(r).attr("title",c.i18n("rotate-ccw")).append(a('<span class="elfinder-button-icon elfinder-button-icon-rotate-r"/>').click(function(){S+=90,ab.update(S)})),w=a("<span />"),x=a('<div class="ui-state-default ui-corner-all elfinder-resize-reset"><span class="ui-icon ui-icon-arrowreturnthick-1-w"/></div>'),y=a('<div class="elfinder-resize-type"/>').append('<input type="radio" name="type" id="type-resize" value="resize" checked="checked" /><label for="type-resize">'+c.i18n("resize")+"</label>").append('<input type="radio" name="type" id="type-crop"   value="crop"/><label for="type-crop">'+c.i18n("crop")+"</label>").append('<input type="radio" name="type" id="type-rotate" value="rotate"/><label for="type-rotate">'+c.i18n("rotate")+"</label>"),z=a("input",y).change(function(){var b=a("input:checked",y).val();Y(),bb(!0),cb(!0),db(!0),b=="resize"?(o.show(),t.hide(),p.hide(),bb()):b=="crop"?(t.hide(),o.hide(),p.show(),cb()):b=="rotate"&&(o.hide(),p.hide(),t.show(),db())}),A=a('<input type="checkbox" checked="checked"/>').change(function(){N=!!A.prop("checked"),Z.fixHeight(),bb(!0),bb()}),B=a(g).change(function(){var a=parseInt(B.val()),b=parseInt(N?a/J:C.val());a>0&&b>0&&(Z.updateView(a,b),C.val(b))}),C=a(g).change(function(){var a=parseInt(C.val()),b=parseInt(N?a*J:B.val());b>0&&a>0&&(Z.updateView(b,a),B.val(b))}),D=a(g),E=a(g),F=a(g),G=a(g),H=a('<input type="text" size="3" maxlength="3" value="0" />').change(function(){ab.update()}),I=a('<div class="elfinder-resize-rotate-slider"/>').slider({min:0,max:359,value:H.val(),animate:!0,change:function(a,b){b.value!=I.slider("value")&&ab.update(b.value)},slide:function(a,b){ab.update(b.value,!1)}}),J=1,K=1,L=0,M=0,N=!0,O=0,P=0,Q=0,R=0,S=0,T=a("<img/>").load(function(){l.remove(),L=T.width(),M=T.height(),J=L/M,Z.updateView(L,M),m.append(T.show()).show(),B.val(L),C.val(M);var b=Math.min(O,P)/Math.sqrt(Math.pow(L,2)+Math.pow(M,2));Q=L*b,R=M*b,j.find("input,select").removeAttr("disabled").filter(":text").keydown(function(b){var c=b.keyCode,d;b.stopPropagation();if(c>=37&&c<=40||c==a.ui.keyCode.BACKSPACE||c==a.ui.keyCode.DELETE||c==65&&(b.ctrlKey||b.metaKey)||c==27)return;c==9&&(d=a(this).parent()[b.shiftKey?"prev":"next"](".elfinder-resize-row").children(":text"),d.length&&d.focus());if(c==13){eb();return}(c<48||c>57)&&b.preventDefault()}).filter(":first").focus(),bb(),x.hover(function(){x.toggleClass("ui-state-hover")}).click(Y)}).error(function(){l.text("Unable to load image").css("background","transparent")}),U=a("<div/>"),V=a("<img/>"),W=a("<div/>"),X=a("<img/>"),Y=function(){B.val(L),C.val(M),Z.updateView(L,M)},Z={update:function(){B.val(parseInt(T.width()/K)),C.val(parseInt(T.height()/K))},updateView:function(a,b){a>O||b>P?a/O>b/P?T.width(O).height(Math.ceil(T.width()/J)):T.height(P).width(Math.ceil(T.height()*J)):T.width(a).height(b),K=T.width()/a,w.text("1 : "+(1/K).toFixed(2)),Z.updateHandle()},updateHandle:function(){m.width(T.width()).height(T.height())},fixWidth:function(){var a,b;N&&(b=C.val(),b=parseInt(b*J),Z.updateView(a,b),B.val(a))},fixHeight:function(){var a,b;N&&(a=B.val(),b=parseInt(a/J),Z.updateView(a,b),C.val(b))}},_={update:function(){F.val(parseInt(n.width()/K)),G.val(parseInt(n.height()/K)),D.val(parseInt((n.offset().left-V.offset().left)/K)),E.val(parseInt((n.offset().top-V.offset().top)/K))},resize_update:function(){_.update(),W.width(n.width()),W.height(n.height())}},ab={mouseStartAngle:0,imageStartAngle:0,imageBeingRotated:!1,update:function(b,c){typeof b=="undefined"&&(S=b=parseInt(H.val())),typeof c=="undefined"&&(c=!0),!c||a.browser.opera||a.browser.msie&&parseInt(a.browser.version)<9?X.rotate(b):X.animate({rotate:b+"deg"}),b%=360,b<0&&(b+=360),H.val(parseInt(b)),I.slider("value",H.val())},execute:function(a){if(!ab.imageBeingRotated)return;var b=ab.getCenter(X),c=a.pageX-b[0],d=a.pageY-b[1],e=Math.atan2(d,c),f=e-ab.mouseStartAngle+ab.imageStartAngle;return f=Math.round(parseFloat(f)*180/Math.PI),a.shiftKey&&(f=Math.round((f+6)/15)*15),X.rotate(f),f%=360,f<0&&(f+=360),H.val(f),I.slider("value",H.val()),!1},start:function(b){ab.imageBeingRotated=!0;var c=ab.getCenter(X),d=b.pageX-c[0],e=b.pageY-c[1];return ab.mouseStartAngle=Math.atan2(e,d),ab.imageStartAngle=parseFloat(X.rotate())*Math.PI/180,a(document).mousemove(ab.execute),!1},stop:function(b){if(!ab.imageBeingRotated)return;return a(document).unbind("mousemove",ab.execute),setTimeout(function(){ab.imageBeingRotated=!1},10),!1},getCenter:function(a){var b=X.rotate();X.rotate(0);var c=X.offset(),d=c.left+X.width()/2,e=c.top+X.height()/2;return X.rotate(b),Array(d,e)}},bb=function(b){a.fn.resizable&&(b?(m.resizable("destroy"),m.hide()):(m.show(),m.resizable({alsoResize:T,aspectRatio:N,resize:Z.update,stop:Z.fixHeight})))},cb=function(b){a.fn.draggable&&a.fn.resizable&&
(b?(n.resizable("destroy"),n.draggable("destroy"),U.hide()):(V.width(T.width()).height(T.height()),W.width(T.width()).height(T.height()),n.width(V.width()).height(V.height()).offset(V.offset()).resizable({containment:U,resize:_.resize_update,handles:"all"}).draggable({handle:n,containment:V,drag:_.update}),U.show().width(T.width()).height(T.height()),_.update()))},db=function(b){a.fn.draggable&&a.fn.resizable&&(b?X.hide():X.show().width(Q).height(R).css("margin-top",(P-R)/2+"px").css("margin-left",(O-Q)/2+"px"))},eb=function(){var d,g,h,i,j,k=a("input:checked",y).val();B.add(C).change();if(k=="resize")d=parseInt(B.val())||0,g=parseInt(C.val())||0;else if(k=="crop")d=parseInt(F.val())||0,g=parseInt(G.val())||0,h=parseInt(D.val())||0,i=parseInt(E.val())||0;else if(k="rotate"){d=L,g=M,j=parseInt(H.val())||0;if(j<0||j>360)return c.error("Invalid rotate degree");if(j==0||j==360)return c.error("Image dose not rotated")}if(k!="rotate"){if(d<=0||g<=0)return c.error("Invalid image size");if(d==L&&g==M)return c.error("Image size not changed")}f.elfinderdialog("close"),c.request({data:{cmd:"resize",target:b.hash,width:d,height:g,x:h,y:i,degree:j,mode:k},notify:{type:"resize",cnt:1}}).fail(function(a){e.reject(a)}).done(function(){e.resolve()})},fb={},gb="elfinder-resize-handle-hline",hb="elfinder-resize-handle-vline",ib="elfinder-resize-handle-point",jb=c.url(b.hash);X.mousedown(ab.start),a(document).mouseup(ab.stop),o.append(a(h).append(a(i).text(c.i18n("width"))).append(B).append(x)).append(a(h).append(a(i).text(c.i18n("height"))).append(C)).append(a(h).append(a("<label/>").text(c.i18n("aspectRatio")).prepend(A))).append(a(h).append(c.i18n("scale")+" ").append(w)),p.append(a(h).append(a(i).text("X")).append(D)).append(a(h).append(a(i).text("Y")).append(E)).append(a(h).append(a(i).text(c.i18n("width"))).append(F)).append(a(h).append(a(i).text(c.i18n("height"))).append(G)),t.append(a(h).append(a(i).text(c.i18n("rotate"))).append(a('<div style="float:left; width: 130px;">').append(a('<div style="float:left;">').append(H).append(a("<span/>").text(c.i18n("degree")))).append(a(q).append(u).append(a(s)).append(v))).append(I)),f.append(y),j.append(a(h)).append(o).append(p.hide()).append(t.hide()).find("input,select").attr("disabled","disabled"),m.append('<div class="'+gb+" "+gb+'-top"/>').append('<div class="'+gb+" "+gb+'-bottom"/>').append('<div class="'+hb+" "+hb+'-left"/>').append('<div class="'+hb+" "+hb+'-right"/>').append('<div class="'+ib+" "+ib+'-e"/>').append('<div class="'+ib+" "+ib+'-se"/>').append('<div class="'+ib+" "+ib+'-s"/>'),k.append(l).append(m.hide()).append(T.hide()),n.css("position","absolute").append('<div class="'+gb+" "+gb+'-top"/>').append('<div class="'+gb+" "+gb+'-bottom"/>').append('<div class="'+hb+" "+hb+'-left"/>').append('<div class="'+hb+" "+hb+'-right"/>').append('<div class="'+ib+" "+ib+'-n"/>').append('<div class="'+ib+" "+ib+'-e"/>').append('<div class="'+ib+" "+ib+'-s"/>').append('<div class="'+ib+" "+ib+'-w"/>').append('<div class="'+ib+" "+ib+'-ne"/>').append('<div class="'+ib+" "+ib+'-se"/>').append('<div class="'+ib+" "+ib+'-sw"/>').append('<div class="'+ib+" "+ib+'-nw"/>'),k.append(U.css("position","absolute").hide().append(V).append(n.append(W))),k.append(X.hide()),k.css("overflow","hidden"),f.append(k).append(j),fb[c.i18n("btnCancel")]=function(){f.elfinderdialog("close")},fb[c.i18n("btnApply")]=eb,c.dialog(f,{title:b.name,width:650,resizable:!1,destroyOnClose:!0,buttons:fb,open:function(){k.zIndex(1+a(this).parent().zIndex())}}).attr("id",d),a.browser.msie&&parseInt(a.browser.version)<9&&a(".elfinder-dialog").css("filter",""),x.css("left",B.position().left+B.width()+12),W.css({opacity:.2,"background-color":"#fff",position:"absolute"}),n.css("cursor","move"),n.find(".elfinder-resize-handle-point").css({"background-color":"#fff",opacity:.5,"border-color":"#000"}),X.css("cursor","pointer"),y.buttonset(),O=k.width()-(m.outerWidth()-m.width()),P=k.height()-(m.outerHeight()-m.height()),T.attr("src",jb+(jb.indexOf("?")===-1?"?":"&")+"_="+Math.random()),V.attr("src",T.attr("src")),X.attr("src",T.attr("src"))},g,h;return!d.length||d[0].mime.indexOf("image/")===-1?e.reject():(g="resize-"+c.namespace+"-"+d[0].hash,h=c.getUI().find("#"+g),h.length?(h.elfinderdialog("toTop"),e.resolve()):(f(d[0],g),e))}},function(a){var b=function(a,b){var c=0;for(c in b)if(typeof a[b[c]]!="undefined")return b[c];return a[b[c]]="",b[c]};a.cssHooks.rotate={get:function(b,c,d){return a(b).rotate()},set:function(b,c){return a(b).rotate(c),c}},a.cssHooks.transform={get:function(a,c,d){var e=b(a.style,["WebkitTransform","MozTransform","OTransform","msTransform","transform"]);return a.style[e]},set:function(a,c){var d=b(a.style,["WebkitTransform","MozTransform","OTransform","msTransform","transform"]);return a.style[d]=c,c}},a.fn.rotate=function(b){if(typeof b=="undefined"){if(a.browser.opera){var c=this.css("transform").match(/rotate\((.*?)\)/);return c&&c[1]?Math.round(parseFloat(c[1])*180/Math.PI):0}var c=this.css("transform").match(/rotate\((.*?)\)/);return c&&c[1]?parseInt(c[1]):0}return this.css("transform",this.css("transform").replace(/none|rotate\(.*?\)/,"")+"rotate("+parseInt(b)+"deg)"),this},a.fx.step.rotate=function(b){b.state==0&&(b.start=a(b.elem).rotate(),b.now=b.start),a(b.elem).rotate(b.now)};if(a.browser.msie&&parseInt(a.browser.version)<9){var c=function(a){var b=a,c=b.offsetLeft,d=b.offsetTop;while(b.offsetParent){b=b.offsetParent;if(b!=document.body&&b.currentStyle["position"]!="static")break;b!=document.body&&b!=document.documentElement&&(c-=b.scrollLeft,d-=b.scrollTop),c+=b.offsetLeft,d+=b.offsetTop}return{x:c,y:d}},d=function(a){if(a.currentStyle["position"]!="static")return;var b=c(a);a.style.position="absolute",a.style.left=b.x+"px",a.style.top=b.y+"px"},e=function(a,b){var c,e=1,f=1,g=1,h=1;if(typeof a.style["msTransform"]!="undefined")return!0;d(a),c=b.match(/rotate\((.*?)\)/);var i=c&&c[1]?parseInt(c[1]):0;i%=360,i<0&&(i=360+i);var j=i*Math.PI/180,k=Math.cos(j),l=Math.sin(j);e*=k,f*=-l,g*=l,h*=k,a.style.filter=(a.style.filter||"").replace(/progid:DXImageTransform\.Microsoft\.Matrix\([^)]*\)/,"")+("progid:DXImageTransform.Microsoft.Matrix(M11="+e+",M12="+f+",M21="+g+",M22="+h+",FilterType='bilinear',sizingMethod='auto expand')");var m=parseInt(a.style.width||a.width||0),n=parseInt(a.style.height||a.height||0),j=i*Math.PI/180,o=Math.abs(Math.cos(j)),p=Math.abs(Math.sin(j)),q=(m-(m*o+n*p))/2,r=(n-(m*p+n*o))/2;return a.style.marginLeft=Math.floor(q)+"px",a.style.marginTop=Math.floor(r)+"px",!0},f=a.cssHooks.transform.set;a.cssHooks.transform.set=function(a,b){return f.apply(this,[a,b]),e(a,b),b}}}(jQuery),elFinder.prototype.commands.rm=function(){this.shortcuts=[{pattern:"delete ctrl+backspace"}],this.getstate=function(b){var c=this.fm;return b=b||c.selected(),!this._disabled&&b.length&&a.map(b,function(a){var b=c.file(a);return b&&b.phash&&!b.locked?a:null}).length==b.length?0:-1},this.exec=function(b){var c=this,d=this.fm,e=a.Deferred().fail(function(a){a&&d.error(a)}),f=this.files(b),g=f.length,h=d.cwd().hash,i=!1;return!g||this._disabled?e.reject():(a.each(f,function(a,b){if(!b.phash)return!e.reject(["errRm",b.name,"errPerm"]);if(b.locked)return!e.reject(["errLocked",b.name]);b.hash==h&&(i=d.root(b.hash))}),e.isRejected()||(f=this.hashes(b),d.confirm({title:c.title,text:"confirmRm",accept:{label:"btnRm",callback:function(){d.lockfiles({files:f}),d.request({data:{cmd:"rm",targets:f},notify:{type:"rm",cnt:g},preventFail:!0}).fail(function(a){e.reject(a)}).done(function(a){e.done(a),i&&d.exec("open",i)}).always(function(){d.unlockfiles({files:f})})}},cancel:{label:"btnCancel",callback:function(){e.reject()}}})),e)}},elFinder.prototype.commands.search=function(){this.title="Find files",this.options={ui:"searchbutton"},this.alwaysEnabled=!0,this.updateOnSelect=!1,this.getstate=function(){return 0},this.exec=function(b){var c=this.fm;return typeof b=="string"&&b?(c.trigger("searchstart",{query:b}),c.request({data:{cmd:"search",q:b},notify:{type:"search",cnt:1,hideCnt:!0}})):(c.getUI("toolbar").find("."+c.res("class","searchbtn")+" :text").focus(),a.Deferred().reject())}},elFinder.prototype.commands.sort=function(){var b=
this,c=["nameDirsFirst","kindDirsFirst","sizeDirsFirst","dateDirsFirst","name","kind","size","date"],d;this.options={ui:"sortbutton"},this.value=1,this.variants=[];for(d=0;d<c.length;d++)this.variants.push([c[d],this.fm.i18n("sort"+c[d])]);this.disableOnSearch=!0,this.fm.bind("load sortchange",function(){b.value=c[b.fm.sort-1],b.change()}),this.getstate=function(){return 0},this.exec=function(b,d){var e=a.inArray(d,c)+1==this.fm.sort?this.fm.sortDirect=="asc"?"desc":"asc":this.fm.sortDirect;this.fm.setSort(d,e)}},elFinder.prototype.commands.up=function(){this.alwaysEnabled=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+up"}],this.getstate=function(){return this.fm.cwd().phash?0:-1},this.exec=function(){return this.fm.cwd().phash?this.fm.exec("open",this.fm.cwd().phash):a.Deferred().reject()}},elFinder.prototype.commands.upload=function(){var b=this.fm.res("class","hover");this.disableOnSearch=!0,this.updateOnSelect=!1,this.shortcuts=[{pattern:"ctrl+u"}],this.getstate=function(){return!this._disabled&&this.fm.cwd().write?0:-1},this.exec=function(c){var d=this.fm,e=function(a){g.elfinderdialog("close"),d.upload(a).fail(function(a){f.reject(a)}).done(function(a){f.resolve(a)})},f,g,h,i,j;return this.disabled()?a.Deferred().reject():c&&(c.input||c.files)?d.upload(c):(f=a.Deferred(),h=a('<input type="file" multiple="true"/>').change(function(){e({input:h[0]})}),i=a('<div class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only"><span class="ui-button-text">'+d.i18n("selectForUpload")+"</span></div>").append(a("<form/>").append(h)).hover(function(){i.toggleClass(b)}),g=a('<div class="elfinder-upload-dialog-wrapper"/>').append(i),d.dragUpload&&(j=a('<div class="ui-corner-all elfinder-upload-dropbox">'+d.i18n("dropFiles")+"</div>").prependTo(g).after('<div class="elfinder-upload-dialog-or">'+d.i18n("or")+"</div>")[0],j.addEventListener("dragenter",function(c){c.stopPropagation(),c.preventDefault(),a(j).addClass(b)},!1),j.addEventListener("dragleave",function(c){c.stopPropagation(),c.preventDefault(),a(j).removeClass(b)},!1),j.addEventListener("dragover",function(a){a.stopPropagation(),a.preventDefault()},!1),j.addEventListener("drop",function(a){a.stopPropagation(),a.preventDefault(),e({files:a.dataTransfer.files})},!1)),d.dialog(g,{title:this.title,modal:!0,resizable:!1,destroyOnClose:!0}),f)}},elFinder.prototype.commands.view=function(){this.value=this.fm.storage("view"),this.alwaysEnabled=!0,this.updateOnSelect=!1,this.options={ui:"viewbutton"},this.getstate=function(){return 0},this.exec=function(){var a=this.fm.storage("view",this.value=="list"?"icons":"list");this.fm.viewchange(),this.update(void 0,a)}}})(jQuery)
;
/*! Javascript plotting library for jQuery, v. 0.7.
 *
 * Released under the MIT license by IOLA, December 2007.
 *
 */

// first an inline dependency, jquery.colorhelpers.js, we inline it here
// for convenience

/* Plugin for jQuery for working with colors.
 * 
 * Version 1.1.
 * 
 * Inspiration from jQuery color animation plugin by John Resig.
 *
 * Released under the MIT license by Ole Laursen, October 2009.
 *
 * Examples:
 *
 *   $.color.parse("#fff").scale('rgb', 0.25).add('a', -0.5).toString()
 *   var c = $.color.extract($("#mydiv"), 'background-color');
 *   console.log(c.r, c.g, c.b, c.a);
 *   $.color.make(100, 50, 25, 0.4).toString() // returns "rgba(100,50,25,0.4)"
 *
 * Note that .scale() and .add() return the same modified object
 * instead of making a new one.
 *
 * V. 1.1: Fix error handling so e.g. parsing an empty string does
 * produce a color rather than just crashing.
 */ 
(function(B){B.color={};B.color.make=function(F,E,C,D){var G={};G.r=F||0;G.g=E||0;G.b=C||0;G.a=D!=null?D:1;G.add=function(J,I){for(var H=0;H<J.length;++H){G[J.charAt(H)]+=I}return G.normalize()};G.scale=function(J,I){for(var H=0;H<J.length;++H){G[J.charAt(H)]*=I}return G.normalize()};G.toString=function(){if(G.a>=1){return"rgb("+[G.r,G.g,G.b].join(",")+")"}else{return"rgba("+[G.r,G.g,G.b,G.a].join(",")+")"}};G.normalize=function(){function H(J,K,I){return K<J?J:(K>I?I:K)}G.r=H(0,parseInt(G.r),255);G.g=H(0,parseInt(G.g),255);G.b=H(0,parseInt(G.b),255);G.a=H(0,G.a,1);return G};G.clone=function(){return B.color.make(G.r,G.b,G.g,G.a)};return G.normalize()};B.color.extract=function(D,C){var E;do{E=D.css(C).toLowerCase();if(E!=""&&E!="transparent"){break}D=D.parent()}while(!B.nodeName(D.get(0),"body"));if(E=="rgba(0, 0, 0, 0)"){E="transparent"}return B.color.parse(E)};B.color.parse=function(F){var E,C=B.color.make;if(E=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(F)){return C(parseInt(E[1],10),parseInt(E[2],10),parseInt(E[3],10))}if(E=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(F)){return C(parseInt(E[1],10),parseInt(E[2],10),parseInt(E[3],10),parseFloat(E[4]))}if(E=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(F)){return C(parseFloat(E[1])*2.55,parseFloat(E[2])*2.55,parseFloat(E[3])*2.55)}if(E=/rgba\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\)/.exec(F)){return C(parseFloat(E[1])*2.55,parseFloat(E[2])*2.55,parseFloat(E[3])*2.55,parseFloat(E[4]))}if(E=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(F)){return C(parseInt(E[1],16),parseInt(E[2],16),parseInt(E[3],16))}if(E=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(F)){return C(parseInt(E[1]+E[1],16),parseInt(E[2]+E[2],16),parseInt(E[3]+E[3],16))}var D=B.trim(F).toLowerCase();if(D=="transparent"){return C(255,255,255,0)}else{E=A[D]||[0,0,0];return C(E[0],E[1],E[2])}};var A={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0]}})(jQuery);

// the actual Flot code
(function($) {
    function Plot(placeholder, data_, options_, plugins) {
        // data is on the form:
        //   [ series1, series2 ... ]
        // where series is either just the data as [ [x1, y1], [x2, y2], ... ]
        // or { data: [ [x1, y1], [x2, y2], ... ], label: "some label", ... }
        
        var series = [],
            options = {
                // the color theme used for graphs
                colors: ["#edc240", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
                legend: {
                    show: true,
                    noColumns: 1, // number of colums in legend table
                    labelFormatter: null, // fn: string -> string
                    labelBoxBorderColor: "#ccc", // border color for the little label boxes
                    container: null, // container (as jQuery object) to put legend in, null means default on top of graph
                    position: "ne", // position of default legend container within plot
                    margin: 5, // distance from grid edge to default legend container within plot
                    backgroundColor: null, // null means auto-detect
                    backgroundOpacity: 0.85 // set to 0 to avoid background
                },
                xaxis: {
                    show: null, // null = auto-detect, true = always, false = never
                    position: "bottom", // or "top"
                    mode: null, // null or "time"
                    color: null, // base color, labels, ticks
                    tickColor: null, // possibly different color of ticks, e.g. "rgba(0,0,0,0.15)"
                    transform: null, // null or f: number -> number to transform axis
                    inverseTransform: null, // if transform is set, this should be the inverse function
                    min: null, // min. value to show, null means set automatically
                    max: null, // max. value to show, null means set automatically
                    autoscaleMargin: null, // margin in % to add if auto-setting min/max
                    ticks: null, // either [1, 3] or [[1, "a"], 3] or (fn: axis info -> ticks) or app. number of ticks for auto-ticks
                    tickFormatter: null, // fn: number -> string
                    labelWidth: null, // size of tick labels in pixels
                    labelHeight: null,
                    reserveSpace: null, // whether to reserve space even if axis isn't shown
                    tickLength: null, // size in pixels of ticks, or "full" for whole line
                    alignTicksWithAxis: null, // axis number or null for no sync
                    
                    // mode specific options
                    tickDecimals: null, // no. of decimals, null means auto
                    tickSize: null, // number or [number, "unit"]
                    minTickSize: null, // number or [number, "unit"]
                    monthNames: null, // list of names of months
                    timeformat: null, // format string to use
                    twelveHourClock: false // 12 or 24 time in time mode
                },
                yaxis: {
                    autoscaleMargin: 0.02,
                    position: "left" // or "right"
                },
                xaxes: [],
                yaxes: [],
                series: {
                    points: {
                        show: false,
                        radius: 3,
                        lineWidth: 2, // in pixels
                        fill: true,
                        fillColor: "#ffffff",
                        symbol: "circle" // or callback
                    },
                    lines: {
                        // we don't put in show: false so we can see
                        // whether lines were actively disabled 
                        lineWidth: 2, // in pixels
                        fill: false,
                        fillColor: null,
                        steps: false
                    },
                    bars: {
                        show: false,
                        lineWidth: 2, // in pixels
                        barWidth: 1, // in units of the x axis
                        fill: true,
                        fillColor: null,
                        align: "left", // or "center" 
                        horizontal: false
                    },
                    shadowSize: 3
                },
                grid: {
                    show: true,
                    aboveData: false,
                    color: "#545454", // primary color used for outline and labels
                    backgroundColor: null, // null for transparent, else color
                    borderColor: null, // set if different from the grid color
                    tickColor: null, // color for the ticks, e.g. "rgba(0,0,0,0.15)"
                    labelMargin: 5, // in pixels
                    axisMargin: 8, // in pixels
                    borderWidth: 2, // in pixels
                    minBorderMargin: null, // in pixels, null means taken from points radius
                    markings: null, // array of ranges or fn: axes -> array of ranges
                    markingsColor: "#f4f4f4",
                    markingsLineWidth: 2,
                    // interactive stuff
                    clickable: false,
                    hoverable: false,
                    autoHighlight: true, // highlight in case mouse is near
                    mouseActiveRadius: 10 // how far the mouse can be away to activate an item
                },
                hooks: {}
            },
        canvas = null,      // the canvas for the plot itself
        overlay = null,     // canvas for interactive stuff on top of plot
        eventHolder = null, // jQuery object that events should be bound to
        ctx = null, octx = null,
        xaxes = [], yaxes = [],
        plotOffset = { left: 0, right: 0, top: 0, bottom: 0},
        canvasWidth = 0, canvasHeight = 0,
        plotWidth = 0, plotHeight = 0,
        hooks = {
            processOptions: [],
            processRawData: [],
            processDatapoints: [],
            drawSeries: [],
            draw: [],
            bindEvents: [],
            drawOverlay: [],
            shutdown: []
        },
        plot = this;

        // public functions
        plot.setData = setData;
        plot.setupGrid = setupGrid;
        plot.draw = draw;
        plot.getPlaceholder = function() { return placeholder; };
        plot.getCanvas = function() { return canvas; };
        plot.getPlotOffset = function() { return plotOffset; };
        plot.width = function () { return plotWidth; };
        plot.height = function () { return plotHeight; };
        plot.offset = function () {
            var o = eventHolder.offset();
            o.left += plotOffset.left;
            o.top += plotOffset.top;
            return o;
        };
        plot.getData = function () { return series; };
        plot.getAxes = function () {
            var res = {}, i;
            $.each(xaxes.concat(yaxes), function (_, axis) {
                if (axis)
                    res[axis.direction + (axis.n != 1 ? axis.n : "") + "axis"] = axis;
            });
            return res;
        };
        plot.getXAxes = function () { return xaxes; };
        plot.getYAxes = function () { return yaxes; };
        plot.c2p = canvasToAxisCoords;
        plot.p2c = axisToCanvasCoords;
        plot.getOptions = function () { return options; };
        plot.highlight = highlight;
        plot.unhighlight = unhighlight;
        plot.triggerRedrawOverlay = triggerRedrawOverlay;
        plot.pointOffset = function(point) {
            return {
                left: parseInt(xaxes[axisNumber(point, "x") - 1].p2c(+point.x) + plotOffset.left),
                top: parseInt(yaxes[axisNumber(point, "y") - 1].p2c(+point.y) + plotOffset.top)
            };
        };
        plot.shutdown = shutdown;
        plot.resize = function () {
            getCanvasDimensions();
            resizeCanvas(canvas);
            resizeCanvas(overlay);
        };

        // public attributes
        plot.hooks = hooks;
        
        // initialize
        initPlugins(plot);
        parseOptions(options_);
        setupCanvases();
        setData(data_);
        setupGrid();
        draw();
        bindEvents();


        function executeHooks(hook, args) {
            args = [plot].concat(args);
            for (var i = 0; i < hook.length; ++i)
                hook[i].apply(this, args);
        }

        function initPlugins() {
            for (var i = 0; i < plugins.length; ++i) {
                var p = plugins[i];
                p.init(plot);
                if (p.options)
                    $.extend(true, options, p.options);
            }
        }
        
        function parseOptions(opts) {
            var i;
            
            $.extend(true, options, opts);
            
            if (options.xaxis.color == null)
                options.xaxis.color = options.grid.color;
            if (options.yaxis.color == null)
                options.yaxis.color = options.grid.color;
            
            if (options.xaxis.tickColor == null) // backwards-compatibility
                options.xaxis.tickColor = options.grid.tickColor;
            if (options.yaxis.tickColor == null) // backwards-compatibility
                options.yaxis.tickColor = options.grid.tickColor;

            if (options.grid.borderColor == null)
                options.grid.borderColor = options.grid.color;
            if (options.grid.tickColor == null)
                options.grid.tickColor = $.color.parse(options.grid.color).scale('a', 0.22).toString();
            
            // fill in defaults in axes, copy at least always the
            // first as the rest of the code assumes it'll be there
            for (i = 0; i < Math.max(1, options.xaxes.length); ++i)
                options.xaxes[i] = $.extend(true, {}, options.xaxis, options.xaxes[i]);
            for (i = 0; i < Math.max(1, options.yaxes.length); ++i)
                options.yaxes[i] = $.extend(true, {}, options.yaxis, options.yaxes[i]);

            // backwards compatibility, to be removed in future
            if (options.xaxis.noTicks && options.xaxis.ticks == null)
                options.xaxis.ticks = options.xaxis.noTicks;
            if (options.yaxis.noTicks && options.yaxis.ticks == null)
                options.yaxis.ticks = options.yaxis.noTicks;
            if (options.x2axis) {
                options.xaxes[1] = $.extend(true, {}, options.xaxis, options.x2axis);
                options.xaxes[1].position = "top";
            }
            if (options.y2axis) {
                options.yaxes[1] = $.extend(true, {}, options.yaxis, options.y2axis);
                options.yaxes[1].position = "right";
            }
            if (options.grid.coloredAreas)
                options.grid.markings = options.grid.coloredAreas;
            if (options.grid.coloredAreasColor)
                options.grid.markingsColor = options.grid.coloredAreasColor;
            if (options.lines)
                $.extend(true, options.series.lines, options.lines);
            if (options.points)
                $.extend(true, options.series.points, options.points);
            if (options.bars)
                $.extend(true, options.series.bars, options.bars);
            if (options.shadowSize != null)
                options.series.shadowSize = options.shadowSize;

            // save options on axes for future reference
            for (i = 0; i < options.xaxes.length; ++i)
                getOrCreateAxis(xaxes, i + 1).options = options.xaxes[i];
            for (i = 0; i < options.yaxes.length; ++i)
                getOrCreateAxis(yaxes, i + 1).options = options.yaxes[i];

            // add hooks from options
            for (var n in hooks)
                if (options.hooks[n] && options.hooks[n].length)
                    hooks[n] = hooks[n].concat(options.hooks[n]);

            executeHooks(hooks.processOptions, [options]);
        }

        function setData(d) {
            series = parseData(d);
            fillInSeriesOptions();
            processData();
        }
        
        function parseData(d) {
            var res = [];
            for (var i = 0; i < d.length; ++i) {
                var s = $.extend(true, {}, options.series);

                if (d[i].data != null) {
                    s.data = d[i].data; // move the data instead of deep-copy
                    delete d[i].data;

                    $.extend(true, s, d[i]);

                    d[i].data = s.data;
                }
                else
                    s.data = d[i];
                res.push(s);
            }

            return res;
        }
        
        function axisNumber(obj, coord) {
            var a = obj[coord + "axis"];
            if (typeof a == "object") // if we got a real axis, extract number
                a = a.n;
            if (typeof a != "number")
                a = 1; // default to first axis
            return a;
        }

        function allAxes() {
            // return flat array without annoying null entries
            return $.grep(xaxes.concat(yaxes), function (a) { return a; });
        }
        
        function canvasToAxisCoords(pos) {
            // return an object with x/y corresponding to all used axes 
            var res = {}, i, axis;
            for (i = 0; i < xaxes.length; ++i) {
                axis = xaxes[i];
                if (axis && axis.used)
                    res["x" + axis.n] = axis.c2p(pos.left);
            }

            for (i = 0; i < yaxes.length; ++i) {
                axis = yaxes[i];
                if (axis && axis.used)
                    res["y" + axis.n] = axis.c2p(pos.top);
            }
            
            if (res.x1 !== undefined)
                res.x = res.x1;
            if (res.y1 !== undefined)
                res.y = res.y1;

            return res;
        }
        
        function axisToCanvasCoords(pos) {
            // get canvas coords from the first pair of x/y found in pos
            var res = {}, i, axis, key;

            for (i = 0; i < xaxes.length; ++i) {
                axis = xaxes[i];
                if (axis && axis.used) {
                    key = "x" + axis.n;
                    if (pos[key] == null && axis.n == 1)
                        key = "x";

                    if (pos[key] != null) {
                        res.left = axis.p2c(pos[key]);
                        break;
                    }
                }
            }
            
            for (i = 0; i < yaxes.length; ++i) {
                axis = yaxes[i];
                if (axis && axis.used) {
                    key = "y" + axis.n;
                    if (pos[key] == null && axis.n == 1)
                        key = "y";

                    if (pos[key] != null) {
                        res.top = axis.p2c(pos[key]);
                        break;
                    }
                }
            }
            
            return res;
        }
        
        function getOrCreateAxis(axes, number) {
            if (!axes[number - 1])
                axes[number - 1] = {
                    n: number, // save the number for future reference
                    direction: axes == xaxes ? "x" : "y",
                    options: $.extend(true, {}, axes == xaxes ? options.xaxis : options.yaxis)
                };
                
            return axes[number - 1];
        }

        function fillInSeriesOptions() {
            var i;
            
            // collect what we already got of colors
            var neededColors = series.length,
                usedColors = [],
                assignedColors = [];
            for (i = 0; i < series.length; ++i) {
                var sc = series[i].color;
                if (sc != null) {
                    --neededColors;
                    if (typeof sc == "number")
                        assignedColors.push(sc);
                    else
                        usedColors.push($.color.parse(series[i].color));
                }
            }
            
            // we might need to generate more colors if higher indices
            // are assigned
            for (i = 0; i < assignedColors.length; ++i) {
                neededColors = Math.max(neededColors, assignedColors[i] + 1);
            }

            // produce colors as needed
            var colors = [], variation = 0;
            i = 0;
            while (colors.length < neededColors) {
                var c;
                if (options.colors.length == i) // check degenerate case
                    c = $.color.make(100, 100, 100);
                else
                    c = $.color.parse(options.colors[i]);

                // vary color if needed
                var sign = variation % 2 == 1 ? -1 : 1;
                c.scale('rgb', 1 + sign * Math.ceil(variation / 2) * 0.2)

                // FIXME: if we're getting to close to something else,
                // we should probably skip this one
                colors.push(c);
                
                ++i;
                if (i >= options.colors.length) {
                    i = 0;
                    ++variation;
                }
            }

            // fill in the options
            var colori = 0, s;
            for (i = 0; i < series.length; ++i) {
                s = series[i];
                
                // assign colors
                if (s.color == null) {
                    s.color = colors[colori].toString();
                    ++colori;
                }
                else if (typeof s.color == "number")
                    s.color = colors[s.color].toString();

                // turn on lines automatically in case nothing is set
                if (s.lines.show == null) {
                    var v, show = true;
                    for (v in s)
                        if (s[v] && s[v].show) {
                            show = false;
                            break;
                        }
                    if (show)
                        s.lines.show = true;
                }

                // setup axes
                s.xaxis = getOrCreateAxis(xaxes, axisNumber(s, "x"));
                s.yaxis = getOrCreateAxis(yaxes, axisNumber(s, "y"));
            }
        }
        
        function processData() {
            var topSentry = Number.POSITIVE_INFINITY,
                bottomSentry = Number.NEGATIVE_INFINITY,
                fakeInfinity = Number.MAX_VALUE,
                i, j, k, m, length,
                s, points, ps, x, y, axis, val, f, p;

            function updateAxis(axis, min, max) {
                if (min < axis.datamin && min != -fakeInfinity)
                    axis.datamin = min;
                if (max > axis.datamax && max != fakeInfinity)
                    axis.datamax = max;
            }

            $.each(allAxes(), function (_, axis) {
                // init axis
                axis.datamin = topSentry;
                axis.datamax = bottomSentry;
                axis.used = false;
            });
            
            for (i = 0; i < series.length; ++i) {
                s = series[i];
                s.datapoints = { points: [] };
                
                executeHooks(hooks.processRawData, [ s, s.data, s.datapoints ]);
            }
            
            // first pass: clean and copy data
            for (i = 0; i < series.length; ++i) {
                s = series[i];

                var data = s.data, format = s.datapoints.format;

                if (!format) {
                    format = [];
                    // find out how to copy
                    format.push({ x: true, number: true, required: true });
                    format.push({ y: true, number: true, required: true });

                    if (s.bars.show || (s.lines.show && s.lines.fill)) {
                        format.push({ y: true, number: true, required: false, defaultValue: 0 });
                        if (s.bars.horizontal) {
                            delete format[format.length - 1].y;
                            format[format.length - 1].x = true;
                        }
                    }
                    
                    s.datapoints.format = format;
                }

                if (s.datapoints.pointsize != null)
                    continue; // already filled in

                s.datapoints.pointsize = format.length;
                
                ps = s.datapoints.pointsize;
                points = s.datapoints.points;

                insertSteps = s.lines.show && s.lines.steps;
                s.xaxis.used = s.yaxis.used = true;
                
                for (j = k = 0; j < data.length; ++j, k += ps) {
                    p = data[j];

                    var nullify = p == null;
                    if (!nullify) {
                        for (m = 0; m < ps; ++m) {
                            val = p[m];
                            f = format[m];

                            if (f) {
                                if (f.number && val != null) {
                                    val = +val; // convert to number
                                    if (isNaN(val))
                                        val = null;
                                    else if (val == Infinity)
                                        val = fakeInfinity;
                                    else if (val == -Infinity)
                                        val = -fakeInfinity;
                                }

                                if (val == null) {
                                    if (f.required)
                                        nullify = true;
                                    
                                    if (f.defaultValue != null)
                                        val = f.defaultValue;
                                }
                            }
                            
                            points[k + m] = val;
                        }
                    }
                    
                    if (nullify) {
                        for (m = 0; m < ps; ++m) {
                            val = points[k + m];
                            if (val != null) {
                                f = format[m];
                                // extract min/max info
                                if (f.x)
                                    updateAxis(s.xaxis, val, val);
                                if (f.y)
                                    updateAxis(s.yaxis, val, val);
                            }
                            points[k + m] = null;
                        }
                    }
                    else {
                        // a little bit of line specific stuff that
                        // perhaps shouldn't be here, but lacking
                        // better means...
                        if (insertSteps && k > 0
                            && points[k - ps] != null
                            && points[k - ps] != points[k]
                            && points[k - ps + 1] != points[k + 1]) {
                            // copy the point to make room for a middle point
                            for (m = 0; m < ps; ++m)
                                points[k + ps + m] = points[k + m];

                            // middle point has same y
                            points[k + 1] = points[k - ps + 1];

                            // we've added a point, better reflect that
                            k += ps;
                        }
                    }
                }
            }

            // give the hooks a chance to run
            for (i = 0; i < series.length; ++i) {
                s = series[i];
                
                executeHooks(hooks.processDatapoints, [ s, s.datapoints]);
            }

            // second pass: find datamax/datamin for auto-scaling
            for (i = 0; i < series.length; ++i) {
                s = series[i];
                points = s.datapoints.points,
                ps = s.datapoints.pointsize;

                var xmin = topSentry, ymin = topSentry,
                    xmax = bottomSentry, ymax = bottomSentry;
                
                for (j = 0; j < points.length; j += ps) {
                    if (points[j] == null)
                        continue;

                    for (m = 0; m < ps; ++m) {
                        val = points[j + m];
                        f = format[m];
                        if (!f || val == fakeInfinity || val == -fakeInfinity)
                            continue;
                        
                        if (f.x) {
                            if (val < xmin)
                                xmin = val;
                            if (val > xmax)
                                xmax = val;
                        }
                        if (f.y) {
                            if (val < ymin)
                                ymin = val;
                            if (val > ymax)
                                ymax = val;
                        }
                    }
                }
                
                if (s.bars.show) {
                    // make sure we got room for the bar on the dancing floor
                    var delta = s.bars.align == "left" ? 0 : -s.bars.barWidth/2;
                    if (s.bars.horizontal) {
                        ymin += delta;
                        ymax += delta + s.bars.barWidth;
                    }
                    else {
                        xmin += delta;
                        xmax += delta + s.bars.barWidth;
                    }
                }
                
                updateAxis(s.xaxis, xmin, xmax);
                updateAxis(s.yaxis, ymin, ymax);
            }

            $.each(allAxes(), function (_, axis) {
                if (axis.datamin == topSentry)
                    axis.datamin = null;
                if (axis.datamax == bottomSentry)
                    axis.datamax = null;
            });
        }

        function makeCanvas(skipPositioning, cls) {
            var c = document.createElement('canvas');
            c.className = cls;
            c.width = canvasWidth;
            c.height = canvasHeight;
                    
            if (!skipPositioning)
                $(c).css({ position: 'absolute', left: 0, top: 0 });
                
            $(c).appendTo(placeholder);
                
            if (!c.getContext) // excanvas hack
                c = window.G_vmlCanvasManager.initElement(c);

            // used for resetting in case we get replotted
            c.getContext("2d").save();
            
            return c;
        }

        function getCanvasDimensions() {
            canvasWidth = placeholder.width();
            canvasHeight = placeholder.height();
            
            if (canvasWidth <= 0 || canvasHeight <= 0)
                throw "Invalid dimensions for plot, width = " + canvasWidth + ", height = " + canvasHeight;
        }

        function resizeCanvas(c) {
            // resizing should reset the state (excanvas seems to be
            // buggy though)
            if (c.width != canvasWidth)
                c.width = canvasWidth;

            if (c.height != canvasHeight)
                c.height = canvasHeight;

            // so try to get back to the initial state (even if it's
            // gone now, this should be safe according to the spec)
            var cctx = c.getContext("2d");
            cctx.restore();

            // and save again
            cctx.save();
        }
        
        function setupCanvases() {
            var reused,
                existingCanvas = placeholder.children("canvas.base"),
                existingOverlay = placeholder.children("canvas.overlay");

            if (existingCanvas.length == 0 || existingOverlay == 0) {
                // init everything
                
                placeholder.html(""); // make sure placeholder is clear
            
                placeholder.css({ padding: 0 }); // padding messes up the positioning
                
                if (placeholder.css("position") == 'static')
                    placeholder.css("position", "relative"); // for positioning labels and overlay

                getCanvasDimensions();
                
                canvas = makeCanvas(true, "base");
                overlay = makeCanvas(false, "overlay"); // overlay canvas for interactive features

                reused = false;
            }
            else {
                // reuse existing elements

                canvas = existingCanvas.get(0);
                overlay = existingOverlay.get(0);

                reused = true;
            }

            ctx = canvas.getContext("2d");
            octx = overlay.getContext("2d");

            // we include the canvas in the event holder too, because IE 7
            // sometimes has trouble with the stacking order
            eventHolder = $([overlay, canvas]);

            if (reused) {
                // run shutdown in the old plot object
                placeholder.data("plot").shutdown();

                // reset reused canvases
                plot.resize();
                
                // make sure overlay pixels are cleared (canvas is cleared when we redraw)
                octx.clearRect(0, 0, canvasWidth, canvasHeight);
                
                // then whack any remaining obvious garbage left
                eventHolder.unbind();
                placeholder.children().not([canvas, overlay]).remove();
            }

            // save in case we get replotted
            placeholder.data("plot", plot);
        }

        function bindEvents() {
            // bind events
            if (options.grid.hoverable) {
                eventHolder.mousemove(onMouseMove);
                eventHolder.mouseleave(onMouseLeave);
            }

            if (options.grid.clickable)
                eventHolder.click(onClick);

            executeHooks(hooks.bindEvents, [eventHolder]);
        }

        function shutdown() {
            if (redrawTimeout)
                clearTimeout(redrawTimeout);
            
            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("mouseleave", onMouseLeave);
            eventHolder.unbind("click", onClick);
            
            executeHooks(hooks.shutdown, [eventHolder]);
        }

        function setTransformationHelpers(axis) {
            // set helper functions on the axis, assumes plot area
            // has been computed already
            
            function identity(x) { return x; }
            
            var s, m, t = axis.options.transform || identity,
                it = axis.options.inverseTransform;
            
            // precompute how much the axis is scaling a point
            // in canvas space
            if (axis.direction == "x") {
                s = axis.scale = plotWidth / Math.abs(t(axis.max) - t(axis.min));
                m = Math.min(t(axis.max), t(axis.min));
            }
            else {
                s = axis.scale = plotHeight / Math.abs(t(axis.max) - t(axis.min));
                s = -s;
                m = Math.max(t(axis.max), t(axis.min));
            }

            // data point to canvas coordinate
            if (t == identity) // slight optimization
                axis.p2c = function (p) { return (p - m) * s; };
            else
                axis.p2c = function (p) { return (t(p) - m) * s; };
            // canvas coordinate to data point
            if (!it)
                axis.c2p = function (c) { return m + c / s; };
            else
                axis.c2p = function (c) { return it(m + c / s); };
        }

        function measureTickLabels(axis) {
            var opts = axis.options, i, ticks = axis.ticks || [], labels = [],
                l, w = opts.labelWidth, h = opts.labelHeight, dummyDiv;

            function makeDummyDiv(labels, width) {
                return $('<div style="position:absolute;top:-10000px;' + width + 'font-size:smaller">' +
                         '<div class="' + axis.direction + 'Axis ' + axis.direction + axis.n + 'Axis">'
                         + labels.join("") + '</div></div>')
                    .appendTo(placeholder);
            }
            
            if (axis.direction == "x") {
                // to avoid measuring the widths of the labels (it's slow), we
                // construct fixed-size boxes and put the labels inside
                // them, we don't need the exact figures and the
                // fixed-size box content is easy to center
                if (w == null)
                    w = Math.floor(canvasWidth / (ticks.length > 0 ? ticks.length : 1));

                // measure x label heights
                if (h == null) {
                    labels = [];
                    for (i = 0; i < ticks.length; ++i) {
                        l = ticks[i].label;
                        if (l)
                            labels.push('<div class="tickLabel" style="float:left;width:' + w + 'px">' + l + '</div>');
                    }

                    if (labels.length > 0) {
                        // stick them all in the same div and measure
                        // collective height
                        labels.push('<div style="clear:left"></div>');
                        dummyDiv = makeDummyDiv(labels, "width:10000px;");
                        h = dummyDiv.height();
                        dummyDiv.remove();
                    }
                }
            }
            else if (w == null || h == null) {
                // calculate y label dimensions
                for (i = 0; i < ticks.length; ++i) {
                    l = ticks[i].label;
                    if (l)
                        labels.push('<div class="tickLabel">' + l + '</div>');
                }
                
                if (labels.length > 0) {
                    dummyDiv = makeDummyDiv(labels, "");
                    if (w == null)
                        w = dummyDiv.children().width();
                    if (h == null)
                        h = dummyDiv.find("div.tickLabel").height();
                    dummyDiv.remove();
                }
            }

            if (w == null)
                w = 0;
            if (h == null)
                h = 0;

            axis.labelWidth = w;
            axis.labelHeight = h;
        }

        function allocateAxisBoxFirstPhase(axis) {
            // find the bounding box of the axis by looking at label
            // widths/heights and ticks, make room by diminishing the
            // plotOffset

            var lw = axis.labelWidth,
                lh = axis.labelHeight,
                pos = axis.options.position,
                tickLength = axis.options.tickLength,
                axismargin = options.grid.axisMargin,
                padding = options.grid.labelMargin,
                all = axis.direction == "x" ? xaxes : yaxes,
                index;

            // determine axis margin
            var samePosition = $.grep(all, function (a) {
                return a && a.options.position == pos && a.reserveSpace;
            });
            if ($.inArray(axis, samePosition) == samePosition.length - 1)
                axismargin = 0; // outermost

            // determine tick length - if we're innermost, we can use "full"
            if (tickLength == null)
                tickLength = "full";

            var sameDirection = $.grep(all, function (a) {
                return a && a.reserveSpace;
            });

            var innermost = $.inArray(axis, sameDirection) == 0;
            if (!innermost && tickLength == "full")
                tickLength = 5;
                
            if (!isNaN(+tickLength))
                padding += +tickLength;

            // compute box
            if (axis.direction == "x") {
                lh += padding;
                
                if (pos == "bottom") {
                    plotOffset.bottom += lh + axismargin;
                    axis.box = { top: canvasHeight - plotOffset.bottom, height: lh };
                }
                else {
                    axis.box = { top: plotOffset.top + axismargin, height: lh };
                    plotOffset.top += lh + axismargin;
                }
            }
            else {
                lw += padding;
                
                if (pos == "left") {
                    axis.box = { left: plotOffset.left + axismargin, width: lw };
                    plotOffset.left += lw + axismargin;
                }
                else {
                    plotOffset.right += lw + axismargin;
                    axis.box = { left: canvasWidth - plotOffset.right, width: lw };
                }
            }

             // save for future reference
            axis.position = pos;
            axis.tickLength = tickLength;
            axis.box.padding = padding;
            axis.innermost = innermost;
        }

        function allocateAxisBoxSecondPhase(axis) {
            // set remaining bounding box coordinates
            if (axis.direction == "x") {
                axis.box.left = plotOffset.left;
                axis.box.width = plotWidth;
            }
            else {
                axis.box.top = plotOffset.top;
                axis.box.height = plotHeight;
            }
        }
        
        function setupGrid() {
            var i, axes = allAxes();

            // first calculate the plot and axis box dimensions

            $.each(axes, function (_, axis) {
                axis.show = axis.options.show;
                if (axis.show == null)
                    axis.show = axis.used; // by default an axis is visible if it's got data
                
                axis.reserveSpace = axis.show || axis.options.reserveSpace;

                setRange(axis);
            });

            allocatedAxes = $.grep(axes, function (axis) { return axis.reserveSpace; });

            plotOffset.left = plotOffset.right = plotOffset.top = plotOffset.bottom = 0;
            if (options.grid.show) {
                $.each(allocatedAxes, function (_, axis) {
                    // make the ticks
                    setupTickGeneration(axis);
                    setTicks(axis);
                    snapRangeToTicks(axis, axis.ticks);

                    // find labelWidth/Height for axis
                    measureTickLabels(axis);
                });

                // with all dimensions in house, we can compute the
                // axis boxes, start from the outside (reverse order)
                for (i = allocatedAxes.length - 1; i >= 0; --i)
                    allocateAxisBoxFirstPhase(allocatedAxes[i]);

                // make sure we've got enough space for things that
                // might stick out
                var minMargin = options.grid.minBorderMargin;
                if (minMargin == null) {
                    minMargin = 0;
                    for (i = 0; i < series.length; ++i)
                        minMargin = Math.max(minMargin, series[i].points.radius + series[i].points.lineWidth/2);
                }
                    
                for (var a in plotOffset) {
                    plotOffset[a] += options.grid.borderWidth;
                    plotOffset[a] = Math.max(minMargin, plotOffset[a]);
                }
            }
            
            plotWidth = canvasWidth - plotOffset.left - plotOffset.right;
            plotHeight = canvasHeight - plotOffset.bottom - plotOffset.top;

            // now we got the proper plotWidth/Height, we can compute the scaling
            $.each(axes, function (_, axis) {
                setTransformationHelpers(axis);
            });

            if (options.grid.show) {
                $.each(allocatedAxes, function (_, axis) {
                    allocateAxisBoxSecondPhase(axis);
                });

                insertAxisLabels();
            }
            
            insertLegend();
        }
        
        function setRange(axis) {
            var opts = axis.options,
                min = +(opts.min != null ? opts.min : axis.datamin),
                max = +(opts.max != null ? opts.max : axis.datamax),
                delta = max - min;

            if (delta == 0.0) {
                // degenerate case
                var widen = max == 0 ? 1 : 0.01;

                if (opts.min == null)
                    min -= widen;
                // always widen max if we couldn't widen min to ensure we
                // don't fall into min == max which doesn't work
                if (opts.max == null || opts.min != null)
                    max += widen;
            }
            else {
                // consider autoscaling
                var margin = opts.autoscaleMargin;
                if (margin != null) {
                    if (opts.min == null) {
                        min -= delta * margin;
                        // make sure we don't go below zero if all values
                        // are positive
                        if (min < 0 && axis.datamin != null && axis.datamin >= 0)
                            min = 0;
                    }
                    if (opts.max == null) {
                        max += delta * margin;
                        if (max > 0 && axis.datamax != null && axis.datamax <= 0)
                            max = 0;
                    }
                }
            }
            axis.min = min;
            axis.max = max;
        }

        function setupTickGeneration(axis) {
            var opts = axis.options;
                
            // estimate number of ticks
            var noTicks;
            if (typeof opts.ticks == "number" && opts.ticks > 0)
                noTicks = opts.ticks;
            else
                // heuristic based on the model a*sqrt(x) fitted to
                // some data points that seemed reasonable
                noTicks = 0.3 * Math.sqrt(axis.direction == "x" ? canvasWidth : canvasHeight);

            var delta = (axis.max - axis.min) / noTicks,
                size, generator, unit, formatter, i, magn, norm;

            if (opts.mode == "time") {
                // pretty handling of time
                
                // map of app. size of time units in milliseconds
                var timeUnitSize = {
                    "second": 1000,
                    "minute": 60 * 1000,
                    "hour": 60 * 60 * 1000,
                    "day": 24 * 60 * 60 * 1000,
                    "month": 30 * 24 * 60 * 60 * 1000,
                    "year": 365.2425 * 24 * 60 * 60 * 1000
                };


                // the allowed tick sizes, after 1 year we use
                // an integer algorithm
                var spec = [
                    [1, "second"], [2, "second"], [5, "second"], [10, "second"],
                    [30, "second"], 
                    [1, "minute"], [2, "minute"], [5, "minute"], [10, "minute"],
                    [30, "minute"], 
                    [1, "hour"], [2, "hour"], [4, "hour"],
                    [8, "hour"], [12, "hour"],
                    [1, "day"], [2, "day"], [3, "day"],
                    [0.25, "month"], [0.5, "month"], [1, "month"],
                    [2, "month"], [3, "month"], [6, "month"],
                    [1, "year"]
                ];

                var minSize = 0;
                if (opts.minTickSize != null) {
                    if (typeof opts.tickSize == "number")
                        minSize = opts.tickSize;
                    else
                        minSize = opts.minTickSize[0] * timeUnitSize[opts.minTickSize[1]];
                }

                for (var i = 0; i < spec.length - 1; ++i)
                    if (delta < (spec[i][0] * timeUnitSize[spec[i][1]]
                                 + spec[i + 1][0] * timeUnitSize[spec[i + 1][1]]) / 2
                       && spec[i][0] * timeUnitSize[spec[i][1]] >= minSize)
                        break;
                size = spec[i][0];
                unit = spec[i][1];
                
                // special-case the possibility of several years
                if (unit == "year") {
                    magn = Math.pow(10, Math.floor(Math.log(delta / timeUnitSize.year) / Math.LN10));
                    norm = (delta / timeUnitSize.year) / magn;
                    if (norm < 1.5)
                        size = 1;
                    else if (norm < 3)
                        size = 2;
                    else if (norm < 7.5)
                        size = 5;
                    else
                        size = 10;

                    size *= magn;
                }

                axis.tickSize = opts.tickSize || [size, unit];
                
                generator = function(axis) {
                    var ticks = [],
                        tickSize = axis.tickSize[0], unit = axis.tickSize[1],
                        d = new Date(axis.min);
                    
                    var step = tickSize * timeUnitSize[unit];

                    if (unit == "second")
                        d.setUTCSeconds(floorInBase(d.getUTCSeconds(), tickSize));
                    if (unit == "minute")
                        d.setUTCMinutes(floorInBase(d.getUTCMinutes(), tickSize));
                    if (unit == "hour")
                        d.setUTCHours(floorInBase(d.getUTCHours(), tickSize));
                    if (unit == "month")
                        d.setUTCMonth(floorInBase(d.getUTCMonth(), tickSize));
                    if (unit == "year")
                        d.setUTCFullYear(floorInBase(d.getUTCFullYear(), tickSize));
                    
                    // reset smaller components
                    d.setUTCMilliseconds(0);
                    if (step >= timeUnitSize.minute)
                        d.setUTCSeconds(0);
                    if (step >= timeUnitSize.hour)
                        d.setUTCMinutes(0);
                    if (step >= timeUnitSize.day)
                        d.setUTCHours(0);
                    if (step >= timeUnitSize.day * 4)
                        d.setUTCDate(1);
                    if (step >= timeUnitSize.year)
                        d.setUTCMonth(0);


                    var carry = 0, v = Number.NaN, prev;
                    do {
                        prev = v;
                        v = d.getTime();
                        ticks.push(v);
                        if (unit == "month") {
                            if (tickSize < 1) {
                                // a bit complicated - we'll divide the month
                                // up but we need to take care of fractions
                                // so we don't end up in the middle of a day
                                d.setUTCDate(1);
                                var start = d.getTime();
                                d.setUTCMonth(d.getUTCMonth() + 1);
                                var end = d.getTime();
                                d.setTime(v + carry * timeUnitSize.hour + (end - start) * tickSize);
                                carry = d.getUTCHours();
                                d.setUTCHours(0);
                            }
                            else
                                d.setUTCMonth(d.getUTCMonth() + tickSize);
                        }
                        else if (unit == "year") {
                            d.setUTCFullYear(d.getUTCFullYear() + tickSize);
                        }
                        else
                            d.setTime(v + step);
                    } while (v < axis.max && v != prev);

                    return ticks;
                };

                formatter = function (v, axis) {
                    var d = new Date(v);

                    // first check global format
                    if (opts.timeformat != null)
                        return $.plot.formatDate(d, opts.timeformat, opts.monthNames);
                    
                    var t = axis.tickSize[0] * timeUnitSize[axis.tickSize[1]];
                    var span = axis.max - axis.min;
                    var suffix = (opts.twelveHourClock) ? " %p" : "";
                    
                    if (t < timeUnitSize.minute)
                        fmt = "%h:%M:%S" + suffix;
                    else if (t < timeUnitSize.day) {
                        if (span < 2 * timeUnitSize.day)
                            fmt = "%h:%M" + suffix;
                        else
                            fmt = "%b %d %h:%M" + suffix;
                    }
                    else if (t < timeUnitSize.month)
                        fmt = "%b %d";
                    else if (t < timeUnitSize.year) {
                        if (span < timeUnitSize.year)
                            fmt = "%b";
                        else
                            fmt = "%b %y";
                    }
                    else
                        fmt = "%y";
                    
                    return $.plot.formatDate(d, fmt, opts.monthNames);
                };
            }
            else {
                // pretty rounding of base-10 numbers
                var maxDec = opts.tickDecimals;
                var dec = -Math.floor(Math.log(delta) / Math.LN10);
                if (maxDec != null && dec > maxDec)
                    dec = maxDec;

                magn = Math.pow(10, -dec);
                norm = delta / magn; // norm is between 1.0 and 10.0
                
                if (norm < 1.5)
                    size = 1;
                else if (norm < 3) {
                    size = 2;
                    // special case for 2.5, requires an extra decimal
                    if (norm > 2.25 && (maxDec == null || dec + 1 <= maxDec)) {
                        size = 2.5;
                        ++dec;
                    }
                }
                else if (norm < 7.5)
                    size = 5;
                else
                    size = 10;

                size *= magn;
                
                if (opts.minTickSize != null && size < opts.minTickSize)
                    size = opts.minTickSize;

                axis.tickDecimals = Math.max(0, maxDec != null ? maxDec : dec);
                axis.tickSize = opts.tickSize || size;

                generator = function (axis) {
                    var ticks = [];

                    // spew out all possible ticks
                    var start = floorInBase(axis.min, axis.tickSize),
                        i = 0, v = Number.NaN, prev;
                    do {
                        prev = v;
                        v = start + i * axis.tickSize;
                        ticks.push(v);
                        ++i;
                    } while (v < axis.max && v != prev);
                    return ticks;
                };

                formatter = function (v, axis) {
                    return v.toFixed(axis.tickDecimals);
                };
            }

            if (opts.alignTicksWithAxis != null) {
                var otherAxis = (axis.direction == "x" ? xaxes : yaxes)[opts.alignTicksWithAxis - 1];
                if (otherAxis && otherAxis.used && otherAxis != axis) {
                    // consider snapping min/max to outermost nice ticks
                    var niceTicks = generator(axis);
                    if (niceTicks.length > 0) {
                        if (opts.min == null)
                            axis.min = Math.min(axis.min, niceTicks[0]);
                        if (opts.max == null && niceTicks.length > 1)
                            axis.max = Math.max(axis.max, niceTicks[niceTicks.length - 1]);
                    }
                    
                    generator = function (axis) {
                        // copy ticks, scaled to this axis
                        var ticks = [], v, i;
                        for (i = 0; i < otherAxis.ticks.length; ++i) {
                            v = (otherAxis.ticks[i].v - otherAxis.min) / (otherAxis.max - otherAxis.min);
                            v = axis.min + v * (axis.max - axis.min);
                            ticks.push(v);
                        }
                        return ticks;
                    };
                    
                    // we might need an extra decimal since forced
                    // ticks don't necessarily fit naturally
                    if (axis.mode != "time" && opts.tickDecimals == null) {
                        var extraDec = Math.max(0, -Math.floor(Math.log(delta) / Math.LN10) + 1),
                            ts = generator(axis);

                        // only proceed if the tick interval rounded
                        // with an extra decimal doesn't give us a
                        // zero at end
                        if (!(ts.length > 1 && /\..*0$/.test((ts[1] - ts[0]).toFixed(extraDec))))
                            axis.tickDecimals = extraDec;
                    }
                }
            }

            axis.tickGenerator = generator;
            if ($.isFunction(opts.tickFormatter))
                axis.tickFormatter = function (v, axis) { return "" + opts.tickFormatter(v, axis); };
            else
                axis.tickFormatter = formatter;
        }
        
        function setTicks(axis) {
            var oticks = axis.options.ticks, ticks = [];
            if (oticks == null || (typeof oticks == "number" && oticks > 0))
                ticks = axis.tickGenerator(axis);
            else if (oticks) {
                if ($.isFunction(oticks))
                    // generate the ticks
                    ticks = oticks({ min: axis.min, max: axis.max });
                else
                    ticks = oticks;
            }

            // clean up/labelify the supplied ticks, copy them over
            var i, v;
            axis.ticks = [];
            for (i = 0; i < ticks.length; ++i) {
                var label = null;
                var t = ticks[i];
                if (typeof t == "object") {
                    v = +t[0];
                    if (t.length > 1)
                        label = t[1];
                }
                else
                    v = +t;
                if (label == null)
                    label = axis.tickFormatter(v, axis);
                if (!isNaN(v))
                    axis.ticks.push({ v: v, label: label });
            }
        }

        function snapRangeToTicks(axis, ticks) {
            if (axis.options.autoscaleMargin && ticks.length > 0) {
                // snap to ticks
                if (axis.options.min == null)
                    axis.min = Math.min(axis.min, ticks[0].v);
                if (axis.options.max == null && ticks.length > 1)
                    axis.max = Math.max(axis.max, ticks[ticks.length - 1].v);
            }
        }
      
        function draw() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            var grid = options.grid;

            // draw background, if any
            if (grid.show && grid.backgroundColor)
                drawBackground();
            
            if (grid.show && !grid.aboveData)
                drawGrid();

            for (var i = 0; i < series.length; ++i) {
                executeHooks(hooks.drawSeries, [ctx, series[i]]);
                drawSeries(series[i]);
            }

            executeHooks(hooks.draw, [ctx]);
            
            if (grid.show && grid.aboveData)
                drawGrid();
        }

        function extractRange(ranges, coord) {
            var axis, from, to, key, axes = allAxes();

            for (i = 0; i < axes.length; ++i) {
                axis = axes[i];
                if (axis.direction == coord) {
                    key = coord + axis.n + "axis";
                    if (!ranges[key] && axis.n == 1)
                        key = coord + "axis"; // support x1axis as xaxis
                    if (ranges[key]) {
                        from = ranges[key].from;
                        to = ranges[key].to;
                        break;
                    }
                }
            }

            // backwards-compat stuff - to be removed in future
            if (!ranges[key]) {
                axis = coord == "x" ? xaxes[0] : yaxes[0];
                from = ranges[coord + "1"];
                to = ranges[coord + "2"];
            }

            // auto-reverse as an added bonus
            if (from != null && to != null && from > to) {
                var tmp = from;
                from = to;
                to = tmp;
            }
            
            return { from: from, to: to, axis: axis };
        }
        
        function drawBackground() {
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            ctx.fillStyle = getColorOrGradient(options.grid.backgroundColor, plotHeight, 0, "rgba(255, 255, 255, 0)");
            ctx.fillRect(0, 0, plotWidth, plotHeight);
            ctx.restore();
        }

        function drawGrid() {
            var i;
            
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            // draw markings
            var markings = options.grid.markings;
            if (markings) {
                if ($.isFunction(markings)) {
                    var axes = plot.getAxes();
                    // xmin etc. is backwards compatibility, to be
                    // removed in the future
                    axes.xmin = axes.xaxis.min;
                    axes.xmax = axes.xaxis.max;
                    axes.ymin = axes.yaxis.min;
                    axes.ymax = axes.yaxis.max;
                    
                    markings = markings(axes);
                }

                for (i = 0; i < markings.length; ++i) {
                    var m = markings[i],
                        xrange = extractRange(m, "x"),
                        yrange = extractRange(m, "y");

                    // fill in missing
                    if (xrange.from == null)
                        xrange.from = xrange.axis.min;
                    if (xrange.to == null)
                        xrange.to = xrange.axis.max;
                    if (yrange.from == null)
                        yrange.from = yrange.axis.min;
                    if (yrange.to == null)
                        yrange.to = yrange.axis.max;

                    // clip
                    if (xrange.to < xrange.axis.min || xrange.from > xrange.axis.max ||
                        yrange.to < yrange.axis.min || yrange.from > yrange.axis.max)
                        continue;

                    xrange.from = Math.max(xrange.from, xrange.axis.min);
                    xrange.to = Math.min(xrange.to, xrange.axis.max);
                    yrange.from = Math.max(yrange.from, yrange.axis.min);
                    yrange.to = Math.min(yrange.to, yrange.axis.max);

                    if (xrange.from == xrange.to && yrange.from == yrange.to)
                        continue;

                    // then draw
                    xrange.from = xrange.axis.p2c(xrange.from);
                    xrange.to = xrange.axis.p2c(xrange.to);
                    yrange.from = yrange.axis.p2c(yrange.from);
                    yrange.to = yrange.axis.p2c(yrange.to);
                    
                    if (xrange.from == xrange.to || yrange.from == yrange.to) {
                        // draw line
                        ctx.beginPath();
                        ctx.strokeStyle = m.color || options.grid.markingsColor;
                        ctx.lineWidth = m.lineWidth || options.grid.markingsLineWidth;
                        ctx.moveTo(xrange.from, yrange.from);
                        ctx.lineTo(xrange.to, yrange.to);
                        ctx.stroke();
                    }
                    else {
                        // fill area
                        ctx.fillStyle = m.color || options.grid.markingsColor;
                        ctx.fillRect(xrange.from, yrange.to,
                                     xrange.to - xrange.from,
                                     yrange.from - yrange.to);
                    }
                }
            }
            
            // draw the ticks
            var axes = allAxes(), bw = options.grid.borderWidth;

            for (var j = 0; j < axes.length; ++j) {
                var axis = axes[j], box = axis.box,
                    t = axis.tickLength, x, y, xoff, yoff;
                if (!axis.show || axis.ticks.length == 0)
                    continue
                
                ctx.strokeStyle = axis.options.tickColor || $.color.parse(axis.options.color).scale('a', 0.22).toString();
                ctx.lineWidth = 1;

                // find the edges
                if (axis.direction == "x") {
                    x = 0;
                    if (t == "full")
                        y = (axis.position == "top" ? 0 : plotHeight);
                    else
                        y = box.top - plotOffset.top + (axis.position == "top" ? box.height : 0);
                }
                else {
                    y = 0;
                    if (t == "full")
                        x = (axis.position == "left" ? 0 : plotWidth);
                    else
                        x = box.left - plotOffset.left + (axis.position == "left" ? box.width : 0);
                }
                
                // draw tick bar
                if (!axis.innermost) {
                    ctx.beginPath();
                    xoff = yoff = 0;
                    if (axis.direction == "x")
                        xoff = plotWidth;
                    else
                        yoff = plotHeight;
                    
                    if (ctx.lineWidth == 1) {
                        x = Math.floor(x) + 0.5;
                        y = Math.floor(y) + 0.5;
                    }

                    ctx.moveTo(x, y);
                    ctx.lineTo(x + xoff, y + yoff);
                    ctx.stroke();
                }

                // draw ticks
                ctx.beginPath();
                for (i = 0; i < axis.ticks.length; ++i) {
                    var v = axis.ticks[i].v;
                    
                    xoff = yoff = 0;

                    if (v < axis.min || v > axis.max
                        // skip those lying on the axes if we got a border
                        || (t == "full" && bw > 0
                            && (v == axis.min || v == axis.max)))
                        continue;

                    if (axis.direction == "x") {
                        x = axis.p2c(v);
                        yoff = t == "full" ? -plotHeight : t;
                        
                        if (axis.position == "top")
                            yoff = -yoff;
                    }
                    else {
                        y = axis.p2c(v);
                        xoff = t == "full" ? -plotWidth : t;
                        
                        if (axis.position == "left")
                            xoff = -xoff;
                    }

                    if (ctx.lineWidth == 1) {
                        if (axis.direction == "x")
                            x = Math.floor(x) + 0.5;
                        else
                            y = Math.floor(y) + 0.5;
                    }

                    ctx.moveTo(x, y);
                    ctx.lineTo(x + xoff, y + yoff);
                }
                
                ctx.stroke();
            }
            
            
            // draw border
            if (bw) {
                ctx.lineWidth = bw;
                ctx.strokeStyle = options.grid.borderColor;
                ctx.strokeRect(-bw/2, -bw/2, plotWidth + bw, plotHeight + bw);
            }

            ctx.restore();
        }

        function insertAxisLabels() {
            placeholder.find(".tickLabels").remove();
            
            var html = ['<div class="tickLabels" style="font-size:smaller">'];

            var axes = allAxes();
            for (var j = 0; j < axes.length; ++j) {
                var axis = axes[j], box = axis.box;
                if (!axis.show)
                    continue;
                //debug: html.push('<div style="position:absolute;opacity:0.10;background-color:red;left:' + box.left + 'px;top:' + box.top + 'px;width:' + box.width +  'px;height:' + box.height + 'px"></div>')
                html.push('<div class="' + axis.direction + 'Axis ' + axis.direction + axis.n + 'Axis" style="color:' + axis.options.color + '">');
                for (var i = 0; i < axis.ticks.length; ++i) {
                    var tick = axis.ticks[i];
                    if (!tick.label || tick.v < axis.min || tick.v > axis.max)
                        continue;

                    var pos = {}, align;
                    
                    if (axis.direction == "x") {
                        align = "center";
                        pos.left = Math.round(plotOffset.left + axis.p2c(tick.v) - axis.labelWidth/2);
                        if (axis.position == "bottom")
                            pos.top = box.top + box.padding;
                        else
                            pos.bottom = canvasHeight - (box.top + box.height - box.padding);
                    }
                    else {
                        pos.top = Math.round(plotOffset.top + axis.p2c(tick.v) - axis.labelHeight/2);
                        if (axis.position == "left") {
                            pos.right = canvasWidth - (box.left + box.width - box.padding)
                            align = "right";
                        }
                        else {
                            pos.left = box.left + box.padding;
                            align = "left";
                        }
                    }

                    pos.width = axis.labelWidth;

                    var style = ["position:absolute", "text-align:" + align ];
                    for (var a in pos)
                        style.push(a + ":" + pos[a] + "px")
                    
                    html.push('<div class="tickLabel" style="' + style.join(';') + '">' + tick.label + '</div>');
                }
                html.push('</div>');
            }

            html.push('</div>');

            placeholder.append(html.join(""));
        }

        function drawSeries(series) {
            if (series.lines.show)
                drawSeriesLines(series);
            if (series.bars.show)
                drawSeriesBars(series);
            if (series.points.show)
                drawSeriesPoints(series);
        }
        
        function drawSeriesLines(series) {
            function plotLine(datapoints, xoffset, yoffset, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize,
                    prevx = null, prevy = null;
                
                ctx.beginPath();
                for (var i = ps; i < points.length; i += ps) {
                    var x1 = points[i - ps], y1 = points[i - ps + 1],
                        x2 = points[i], y2 = points[i + 1];
                    
                    if (x1 == null || x2 == null)
                        continue;

                    // clip with ymin
                    if (y1 <= y2 && y1 < axisy.min) {
                        if (y2 < axisy.min)
                            continue;   // line segment is outside
                        // compute new intersection point
                        x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.min;
                    }
                    else if (y2 <= y1 && y2 < axisy.min) {
                        if (y1 < axisy.min)
                            continue;
                        x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.min;
                    }

                    // clip with ymax
                    if (y1 >= y2 && y1 > axisy.max) {
                        if (y2 > axisy.max)
                            continue;
                        x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.max;
                    }
                    else if (y2 >= y1 && y2 > axisy.max) {
                        if (y1 > axisy.max)
                            continue;
                        x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.max;
                    }

                    // clip with xmin
                    if (x1 <= x2 && x1 < axisx.min) {
                        if (x2 < axisx.min)
                            continue;
                        y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.min;
                    }
                    else if (x2 <= x1 && x2 < axisx.min) {
                        if (x1 < axisx.min)
                            continue;
                        y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.min;
                    }

                    // clip with xmax
                    if (x1 >= x2 && x1 > axisx.max) {
                        if (x2 > axisx.max)
                            continue;
                        y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.max;
                    }
                    else if (x2 >= x1 && x2 > axisx.max) {
                        if (x1 > axisx.max)
                            continue;
                        y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.max;
                    }

                    if (x1 != prevx || y1 != prevy)
                        ctx.moveTo(axisx.p2c(x1) + xoffset, axisy.p2c(y1) + yoffset);
                    
                    prevx = x2;
                    prevy = y2;
                    ctx.lineTo(axisx.p2c(x2) + xoffset, axisy.p2c(y2) + yoffset);
                }
                ctx.stroke();
            }

            function plotLineArea(datapoints, axisx, axisy) {
                var points = datapoints.points,
                    ps = datapoints.pointsize,
                    bottom = Math.min(Math.max(0, axisy.min), axisy.max),
                    i = 0, top, areaOpen = false,
                    ypos = 1, segmentStart = 0, segmentEnd = 0;

                // we process each segment in two turns, first forward
                // direction to sketch out top, then once we hit the
                // end we go backwards to sketch the bottom
                while (true) {
                    if (ps > 0 && i > points.length + ps)
                        break;

                    i += ps; // ps is negative if going backwards

                    var x1 = points[i - ps],
                        y1 = points[i - ps + ypos],
                        x2 = points[i], y2 = points[i + ypos];

                    if (areaOpen) {
                        if (ps > 0 && x1 != null && x2 == null) {
                            // at turning point
                            segmentEnd = i;
                            ps = -ps;
                            ypos = 2;
                            continue;
                        }

                        if (ps < 0 && i == segmentStart + ps) {
                            // done with the reverse sweep
                            ctx.fill();
                            areaOpen = false;
                            ps = -ps;
                            ypos = 1;
                            i = segmentStart = segmentEnd + ps;
                            continue;
                        }
                    }

                    if (x1 == null || x2 == null)
                        continue;

                    // clip x values
                    
                    // clip with xmin
                    if (x1 <= x2 && x1 < axisx.min) {
                        if (x2 < axisx.min)
                            continue;
                        y1 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.min;
                    }
                    else if (x2 <= x1 && x2 < axisx.min) {
                        if (x1 < axisx.min)
                            continue;
                        y2 = (axisx.min - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.min;
                    }

                    // clip with xmax
                    if (x1 >= x2 && x1 > axisx.max) {
                        if (x2 > axisx.max)
                            continue;
                        y1 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x1 = axisx.max;
                    }
                    else if (x2 >= x1 && x2 > axisx.max) {
                        if (x1 > axisx.max)
                            continue;
                        y2 = (axisx.max - x1) / (x2 - x1) * (y2 - y1) + y1;
                        x2 = axisx.max;
                    }

                    if (!areaOpen) {
                        // open area
                        ctx.beginPath();
                        ctx.moveTo(axisx.p2c(x1), axisy.p2c(bottom));
                        areaOpen = true;
                    }
                    
                    // now first check the case where both is outside
                    if (y1 >= axisy.max && y2 >= axisy.max) {
                        ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.max));
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.max));
                        continue;
                    }
                    else if (y1 <= axisy.min && y2 <= axisy.min) {
                        ctx.lineTo(axisx.p2c(x1), axisy.p2c(axisy.min));
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(axisy.min));
                        continue;
                    }
                    
                    // else it's a bit more complicated, there might
                    // be a flat maxed out rectangle first, then a
                    // triangular cutout or reverse; to find these
                    // keep track of the current x values
                    var x1old = x1, x2old = x2;

                    // clip the y values, without shortcutting, we
                    // go through all cases in turn
                    
                    // clip with ymin
                    if (y1 <= y2 && y1 < axisy.min && y2 >= axisy.min) {
                        x1 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.min;
                    }
                    else if (y2 <= y1 && y2 < axisy.min && y1 >= axisy.min) {
                        x2 = (axisy.min - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.min;
                    }

                    // clip with ymax
                    if (y1 >= y2 && y1 > axisy.max && y2 <= axisy.max) {
                        x1 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y1 = axisy.max;
                    }
                    else if (y2 >= y1 && y2 > axisy.max && y1 <= axisy.max) {
                        x2 = (axisy.max - y1) / (y2 - y1) * (x2 - x1) + x1;
                        y2 = axisy.max;
                    }

                    // if the x value was changed we got a rectangle
                    // to fill
                    if (x1 != x1old) {
                        ctx.lineTo(axisx.p2c(x1old), axisy.p2c(y1));
                        // it goes to (x1, y1), but we fill that below
                    }
                    
                    // fill triangular section, this sometimes result
                    // in redundant points if (x1, y1) hasn't changed
                    // from previous line to, but we just ignore that
                    ctx.lineTo(axisx.p2c(x1), axisy.p2c(y1));
                    ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));

                    // fill the other rectangle if it's there
                    if (x2 != x2old) {
                        ctx.lineTo(axisx.p2c(x2), axisy.p2c(y2));
                        ctx.lineTo(axisx.p2c(x2old), axisy.p2c(y2));
                    }
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);
            ctx.lineJoin = "round";

            var lw = series.lines.lineWidth,
                sw = series.shadowSize;
            // FIXME: consider another form of shadow when filling is turned on
            if (lw > 0 && sw > 0) {
                // draw shadow as a thick and thin line with transparency
                ctx.lineWidth = sw;
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                // position shadow at angle from the mid of line
                var angle = Math.PI/18;
                plotLine(series.datapoints, Math.sin(angle) * (lw/2 + sw/2), Math.cos(angle) * (lw/2 + sw/2), series.xaxis, series.yaxis);
                ctx.lineWidth = sw/2;
                plotLine(series.datapoints, Math.sin(angle) * (lw/2 + sw/4), Math.cos(angle) * (lw/2 + sw/4), series.xaxis, series.yaxis);
            }

            ctx.lineWidth = lw;
            ctx.strokeStyle = series.color;
            var fillStyle = getFillStyle(series.lines, series.color, 0, plotHeight);
            if (fillStyle) {
                ctx.fillStyle = fillStyle;
                plotLineArea(series.datapoints, series.xaxis, series.yaxis);
            }

            if (lw > 0)
                plotLine(series.datapoints, 0, 0, series.xaxis, series.yaxis);
            ctx.restore();
        }

        function drawSeriesPoints(series) {
            function plotPoints(datapoints, radius, fillStyle, offset, shadow, axisx, axisy, symbol) {
                var points = datapoints.points, ps = datapoints.pointsize;

                for (var i = 0; i < points.length; i += ps) {
                    var x = points[i], y = points[i + 1];
                    if (x == null || x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
                        continue;
                    
                    ctx.beginPath();
                    x = axisx.p2c(x);
                    y = axisy.p2c(y) + offset;
                    if (symbol == "circle")
                        ctx.arc(x, y, radius, 0, shadow ? Math.PI : Math.PI * 2, false);
                    else
                        symbol(ctx, x, y, radius, shadow);
                    ctx.closePath();
                    
                    if (fillStyle) {
                        ctx.fillStyle = fillStyle;
                        ctx.fill();
                    }
                    ctx.stroke();
                }

            }
            
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            var lw = series.points.lineWidth,
                sw = series.shadowSize,
                radius = series.points.radius,
                symbol = series.points.symbol;
            if (lw > 0 && sw > 0) {
                // draw shadow in two steps
                var w = sw / 2;
                ctx.lineWidth = w;
                ctx.strokeStyle = "rgba(0,0,0,0.1)";
                plotPoints(series.datapoints, radius, null, w + w/2, true,
                           series.xaxis, series.yaxis, symbol);

                ctx.strokeStyle = "rgba(0,0,0,0.2)";
                plotPoints(series.datapoints, radius, null, w/2, true,
                           series.xaxis, series.yaxis, symbol);
            }

            ctx.lineWidth = lw;
            /*ctx.strokeStyle = series.color;*/
            ctx.strokeStyle = series.points.borderColor || series.color;
                       
            plotPoints(series.datapoints, radius,
                       getFillStyle(series.points, series.color), 0, false,
                       series.xaxis, series.yaxis, symbol);
            ctx.restore();
        }

        function drawBar(x, y, b, barLeft, barRight, offset, fillStyleCallback, axisx, axisy, c, horizontal, lineWidth) {
            var left, right, bottom, top,
                drawLeft, drawRight, drawTop, drawBottom,
                tmp;

            // in horizontal mode, we start the bar from the left
            // instead of from the bottom so it appears to be
            // horizontal rather than vertical
            if (horizontal) {
                drawBottom = drawRight = drawTop = true;
                drawLeft = false;
                left = b;
                right = x;
                top = y + barLeft;
                bottom = y + barRight;

                // account for negative bars
                if (right < left) {
                    tmp = right;
                    right = left;
                    left = tmp;
                    drawLeft = true;
                    drawRight = false;
                }
            }
            else {
                drawLeft = drawRight = drawTop = true;
                drawBottom = false;
                left = x + barLeft;
                right = x + barRight;
                bottom = b;
                top = y;

                // account for negative bars
                if (top < bottom) {
                    tmp = top;
                    top = bottom;
                    bottom = tmp;
                    drawBottom = true;
                    drawTop = false;
                }
            }
           
            // clip
            if (right < axisx.min || left > axisx.max ||
                top < axisy.min || bottom > axisy.max)
                return;
            
            if (left < axisx.min) {
                left = axisx.min;
                drawLeft = false;
            }

            if (right > axisx.max) {
                right = axisx.max;
                drawRight = false;
            }

            if (bottom < axisy.min) {
                bottom = axisy.min;
                drawBottom = false;
            }
            
            if (top > axisy.max) {
                top = axisy.max;
                drawTop = false;
            }

            left = axisx.p2c(left);
            bottom = axisy.p2c(bottom);
            right = axisx.p2c(right);
            top = axisy.p2c(top);
            
            // fill the bar
            if (fillStyleCallback) {
                c.beginPath();
                c.moveTo(left, bottom);
                c.lineTo(left, top);
                c.lineTo(right, top);
                c.lineTo(right, bottom);
                c.fillStyle = fillStyleCallback(bottom, top);
                c.fill();
            }

            // draw outline
            if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
                c.beginPath();

                // FIXME: inline moveTo is buggy with excanvas
                c.moveTo(left, bottom + offset);
                if (drawLeft)
                    c.lineTo(left, top + offset);
                else
                    c.moveTo(left, top + offset);
                if (drawTop)
                    c.lineTo(right, top + offset);
                else
                    c.moveTo(right, top + offset);
                if (drawRight)
                    c.lineTo(right, bottom + offset);
                else
                    c.moveTo(right, bottom + offset);
                if (drawBottom)
                    c.lineTo(left, bottom + offset);
                else
                    c.moveTo(left, bottom + offset);
                c.stroke();
            }
        }
        
        function drawSeriesBars(series) {
            function plotBars(datapoints, barLeft, barRight, offset, fillStyleCallback, axisx, axisy) {
                var points = datapoints.points, ps = datapoints.pointsize;
                
                for (var i = 0; i < points.length; i += ps) {
                    if (points[i] == null)
                        continue;
                    drawBar(points[i], points[i + 1], points[i + 2], barLeft, barRight, offset, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth);
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            // FIXME: figure out a way to add shadows (for instance along the right edge)
            ctx.lineWidth = series.bars.lineWidth;
            ctx.strokeStyle = series.color;
            var barLeft = series.bars.align == "left" ? 0 : -series.bars.barWidth/2;
            var fillStyleCallback = series.bars.fill ? function (bottom, top) { return getFillStyle(series.bars, series.color, bottom, top); } : null;
            plotBars(series.datapoints, barLeft, barLeft + series.bars.barWidth, 0, fillStyleCallback, series.xaxis, series.yaxis);
            ctx.restore();
        }

        function getFillStyle(filloptions, seriesColor, bottom, top) {
            var fill = filloptions.fill;
            if (!fill)
                return null;

            if (filloptions.fillColor)
                return getColorOrGradient(filloptions.fillColor, bottom, top, seriesColor);
            
            var c = $.color.parse(seriesColor);
            c.a = typeof fill == "number" ? fill : 0.4;
            c.normalize();
            return c.toString();
        }
        
        function insertLegend() {
            placeholder.find(".legend").remove();

            if (!options.legend.show)
                return;
            
            var fragments = [], rowStarted = false,
                lf = options.legend.labelFormatter, s, label;
            for (var i = 0; i < series.length; ++i) {
                s = series[i];
                label = s.label;
                if (!label)
                    continue;
                
                if (i % options.legend.noColumns == 0) {
                    if (rowStarted)
                        fragments.push('</tr>');
                    fragments.push('<tr>');
                    rowStarted = true;
                }

                if (lf)
                    label = lf(label, s);
                
                fragments.push(
                    '<td class="legendColorBox"><div style="border:1px solid ' + options.legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid ' + s.color + ';overflow:hidden"></div></div></td>' +
                    '<td class="legendLabel">' + label + '</td>');
            }
            if (rowStarted)
                fragments.push('</tr>');
            
            if (fragments.length == 0)
                return;

            var table = '<table style="font-size:smaller;color:' + options.grid.color + '">' + fragments.join("") + '</table>';
            if (options.legend.container != null)
                $(options.legend.container).html(table);
            else {
                var pos = "",
                    p = options.legend.position,
                    m = options.legend.margin;
                if (m[0] == null)
                    m = [m, m];
                if (p.charAt(0) == "n")
                    pos += 'top:' + (m[1] + plotOffset.top) + 'px;';
                else if (p.charAt(0) == "s")
                    pos += 'bottom:' + (m[1] + plotOffset.bottom) + 'px;';
                if (p.charAt(1) == "e")
                    pos += 'right:' + (m[0] + plotOffset.right) + 'px;';
                else if (p.charAt(1) == "w")
                    pos += 'left:' + (m[0] + plotOffset.left) + 'px;';
                var legend = $('<div class="legend">' + table.replace('style="', 'style="position:absolute;' + pos +';') + '</div>').appendTo(placeholder);
                if (options.legend.backgroundOpacity != 0.0) {
                    // put in the transparent background
                    // separately to avoid blended labels and
                    // label boxes
                    var c = options.legend.backgroundColor;
                    if (c == null) {
                        c = options.grid.backgroundColor;
                        if (c && typeof c == "string")
                            c = $.color.parse(c);
                        else
                            c = $.color.extract(legend, 'background-color');
                        c.a = 1;
                        c = c.toString();
                    }
                    var div = legend.children();
                    $('<div style="position:absolute;width:' + div.width() + 'px;height:' + div.height() + 'px;' + pos +'background-color:' + c + ';"> </div>').prependTo(legend).css('opacity', options.legend.backgroundOpacity);
                }
            }
        }


        // interactive features
        
        var highlights = [],
            redrawTimeout = null;
        
        // returns the data item the mouse is over, or null if none is found
        function findNearbyItem(mouseX, mouseY, seriesFilter) {
            var maxDistance = options.grid.mouseActiveRadius,
                smallestDistance = maxDistance * maxDistance + 1,
                item = null, foundPoint = false, i, j;

            for (i = series.length - 1; i >= 0; --i) {
                if (!seriesFilter(series[i]))
                    continue;
                
                var s = series[i],
                    axisx = s.xaxis,
                    axisy = s.yaxis,
                    points = s.datapoints.points,
                    ps = s.datapoints.pointsize,
                    mx = axisx.c2p(mouseX), // precompute some stuff to make the loop faster
                    my = axisy.c2p(mouseY),
                    maxx = maxDistance / axisx.scale,
                    maxy = maxDistance / axisy.scale;

                // with inverse transforms, we can't use the maxx/maxy
                // optimization, sadly
                if (axisx.options.inverseTransform)
                    maxx = Number.MAX_VALUE;
                if (axisy.options.inverseTransform)
                    maxy = Number.MAX_VALUE;
                
                if (s.lines.show || s.points.show) {
                    for (j = 0; j < points.length; j += ps) {
                        var x = points[j], y = points[j + 1];
                        if (x == null)
                            continue;
                        
                        // For points and lines, the cursor must be within a
                        // certain distance to the data point
                        if (x - mx > maxx || x - mx < -maxx ||
                            y - my > maxy || y - my < -maxy)
                            continue;

                        // We have to calculate distances in pixels, not in
                        // data units, because the scales of the axes may be different
                        var dx = Math.abs(axisx.p2c(x) - mouseX),
                            dy = Math.abs(axisy.p2c(y) - mouseY),
                            dist = dx * dx + dy * dy; // we save the sqrt

                        // use <= to ensure last point takes precedence
                        // (last generally means on top of)
                        if (dist < smallestDistance) {
                            smallestDistance = dist;
                            item = [i, j / ps];
                        }
                    }
                }
                    
                if (s.bars.show && !item) { // no other point can be nearby
                    var barLeft = s.bars.align == "left" ? 0 : -s.bars.barWidth/2,
                        barRight = barLeft + s.bars.barWidth;
                    
                    for (j = 0; j < points.length; j += ps) {
                        var x = points[j], y = points[j + 1], b = points[j + 2];
                        if (x == null)
                            continue;
  
                        // for a bar graph, the cursor must be inside the bar
                        if (series[i].bars.horizontal ? 
                            (mx <= Math.max(b, x) && mx >= Math.min(b, x) && 
                             my >= y + barLeft && my <= y + barRight) :
                            (mx >= x + barLeft && mx <= x + barRight &&
                             my >= Math.min(b, y) && my <= Math.max(b, y)))
                                item = [i, j / ps];
                    }
                }
            }

            if (item) {
                i = item[0];
                j = item[1];
                ps = series[i].datapoints.pointsize;
                
                return { datapoint: series[i].datapoints.points.slice(j * ps, (j + 1) * ps),
                         dataIndex: j,
                         series: series[i],
                         seriesIndex: i };
            }
            
            return null;
        }

        function onMouseMove(e) {
            if (options.grid.hoverable)
                triggerClickHoverEvent("plothover", e,
                                       function (s) { return s["hoverable"] != false; });
        }

        function onMouseLeave(e) {
            if (options.grid.hoverable)
                triggerClickHoverEvent("plothover", e,
                                       function (s) { return false; });
        }

        function onClick(e) {
            triggerClickHoverEvent("plotclick", e,
                                   function (s) { return s["clickable"] != false; });
        }

        // trigger click or hover event (they send the same parameters
        // so we share their code)
        function triggerClickHoverEvent(eventname, event, seriesFilter) {
            var offset = eventHolder.offset(),
                canvasX = event.pageX - offset.left - plotOffset.left,
                canvasY = event.pageY - offset.top - plotOffset.top,
            pos = canvasToAxisCoords({ left: canvasX, top: canvasY });

            pos.pageX = event.pageX;
            pos.pageY = event.pageY;

            var item = findNearbyItem(canvasX, canvasY, seriesFilter);

            if (item) {
                // fill in mouse pos for any listeners out there
                item.pageX = parseInt(item.series.xaxis.p2c(item.datapoint[0]) + offset.left + plotOffset.left);
                item.pageY = parseInt(item.series.yaxis.p2c(item.datapoint[1]) + offset.top + plotOffset.top);
            }

            if (options.grid.autoHighlight) {
                // clear auto-highlights
                for (var i = 0; i < highlights.length; ++i) {
                    var h = highlights[i];
                    if (h.auto == eventname &&
                        !(item && h.series == item.series &&
                          h.point[0] == item.datapoint[0] &&
                          h.point[1] == item.datapoint[1]))
                        unhighlight(h.series, h.point);
                }
                
                if (item)
                    highlight(item.series, item.datapoint, eventname);
            }
            
            placeholder.trigger(eventname, [ pos, item ]);
        }

        function triggerRedrawOverlay() {
            if (!redrawTimeout)
                redrawTimeout = setTimeout(drawOverlay, 30);
        }

        function drawOverlay() {
            redrawTimeout = null;

            // draw highlights
            octx.save();
            octx.clearRect(0, 0, canvasWidth, canvasHeight);
            octx.translate(plotOffset.left, plotOffset.top);
            
            var i, hi;
            for (i = 0; i < highlights.length; ++i) {
                hi = highlights[i];

                if (hi.series.bars.show)
                    drawBarHighlight(hi.series, hi.point);
                else
                    drawPointHighlight(hi.series, hi.point);
            }
            octx.restore();
            
            executeHooks(hooks.drawOverlay, [octx]);
        }
        
        function highlight(s, point, auto) {
            if (typeof s == "number")
                s = series[s];

            if (typeof point == "number") {
                var ps = s.datapoints.pointsize;
                point = s.datapoints.points.slice(ps * point, ps * (point + 1));
            }

            var i = indexOfHighlight(s, point);
            if (i == -1) {
                highlights.push({ series: s, point: point, auto: auto });

                triggerRedrawOverlay();
            }
            else if (!auto)
                highlights[i].auto = false;
        }
            
        function unhighlight(s, point) {
            if (s == null && point == null) {
                highlights = [];
                triggerRedrawOverlay();
            }
            
            if (typeof s == "number")
                s = series[s];

            if (typeof point == "number")
                point = s.data[point];

            var i = indexOfHighlight(s, point);
            if (i != -1) {
                highlights.splice(i, 1);

                triggerRedrawOverlay();
            }
        }
        
        function indexOfHighlight(s, p) {
            for (var i = 0; i < highlights.length; ++i) {
                var h = highlights[i];
                if (h.series == s && h.point[0] == p[0]
                    && h.point[1] == p[1])
                    return i;
            }
            return -1;
        }
        
        function drawPointHighlight(series, point) {
            var x = point[0], y = point[1],
                axisx = series.xaxis, axisy = series.yaxis;
            
            if (x < axisx.min || x > axisx.max || y < axisy.min || y > axisy.max)
                return;
            
            var pointRadius = series.points.radius + series.points.lineWidth / 2;
            octx.lineWidth = pointRadius;
            octx.strokeStyle = $.color.parse(series.color).scale('a', 0.5).toString();
            var radius = 1.5 * pointRadius,
                x = axisx.p2c(x),
                y = axisy.p2c(y);
            
            octx.beginPath();
            if (series.points.symbol == "circle")
                octx.arc(x, y, radius, 0, 2 * Math.PI, false);
            else
                series.points.symbol(octx, x, y, radius, false);
            octx.closePath();
            octx.stroke();
        }

        function drawBarHighlight(series, point) {
            octx.lineWidth = series.bars.lineWidth;
            octx.strokeStyle = $.color.parse(series.color).scale('a', 0.5).toString();
            var fillStyle = $.color.parse(series.color).scale('a', 0.5).toString();
            var barLeft = series.bars.align == "left" ? 0 : -series.bars.barWidth/2;
            drawBar(point[0], point[1], point[2] || 0, barLeft, barLeft + series.bars.barWidth,
                    0, function () { return fillStyle; }, series.xaxis, series.yaxis, octx, series.bars.horizontal, series.bars.lineWidth);
        }

        function getColorOrGradient(spec, bottom, top, defaultColor) {
            if (typeof spec == "string")
                return spec;
            else {
                // assume this is a gradient spec; IE currently only
                // supports a simple vertical gradient properly, so that's
                // what we support too
                var gradient = ctx.createLinearGradient(0, top, 0, bottom);
                
                for (var i = 0, l = spec.colors.length; i < l; ++i) {
                    var c = spec.colors[i];
                    if (typeof c != "string") {
                        var co = $.color.parse(defaultColor);
                        if (c.brightness != null)
                            co = co.scale('rgb', c.brightness)
                        if (c.opacity != null)
                            co.a *= c.opacity;
                        c = co.toString();
                    }
                    gradient.addColorStop(i / (l - 1), c);
                }
                
                return gradient;
            }
        }
    }

    $.plot = function(placeholder, data, options) {
        //var t0 = new Date();
        var plot = new Plot($(placeholder), data, options, $.plot.plugins);
        //(window.console ? console.log : alert)("time used (msecs): " + ((new Date()).getTime() - t0.getTime()));
        return plot;
    };

    $.plot.version = "0.7";
    
    $.plot.plugins = [];

    // returns a string with the date d formatted according to fmt
    $.plot.formatDate = function(d, fmt, monthNames) {
        var leftPad = function(n) {
            n = "" + n;
            return n.length == 1 ? "0" + n : n;
        };
        
        var r = [];
        var escape = false, padNext = false;
        var hours = d.getUTCHours();
        var isAM = hours < 12;
        if (monthNames == null)
            monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        if (fmt.search(/%p|%P/) != -1) {
            if (hours > 12) {
                hours = hours - 12;
            } else if (hours == 0) {
                hours = 12;
            }
        }
        for (var i = 0; i < fmt.length; ++i) {
            var c = fmt.charAt(i);
            
            if (escape) {
                switch (c) {
                case 'h': c = "" + hours; break;
                case 'H': c = leftPad(hours); break;
                case 'M': c = leftPad(d.getUTCMinutes()); break;
                case 'S': c = leftPad(d.getUTCSeconds()); break;
                case 'd': c = "" + d.getUTCDate(); break;
                case 'm': c = "" + (d.getUTCMonth() + 1); break;
                case 'y': c = "" + d.getUTCFullYear(); break;
                case 'b': c = "" + monthNames[d.getUTCMonth()]; break;
                case 'p': c = (isAM) ? ("" + "am") : ("" + "pm"); break;
                case 'P': c = (isAM) ? ("" + "AM") : ("" + "PM"); break;
                case '0': c = ""; padNext = true; break;
                }
                if (c && padNext) {
                    c = leftPad(c);
                    padNext = false;
                }
                r.push(c);
                if (!padNext)
                    escape = false;
            }
            else {
                if (c == "%")
                    escape = true;
                else
                    r.push(c);
            }
        }
        return r.join("");
    };
    
    // round to nearby lower multiple of base
    function floorInBase(n, base) {
        return base * Math.floor(n / base);
    }
    
})(jQuery);

;
/*
 * The MIT License

Copyright (c) 2010 by Juergen Marsch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function ($)
{	 var options =
     {	series: {
	 	grow: {
	 		active: true,
			valueIndex: 1,
	 		stepDelay: 20,
			steps:100,
	 		stepMode: "linear",
			stepDirection: "up"
	 	}
	 }
    };
    function init(plot) {
		var done = false;
		var growfunc;
		var plt = plot;
		var data = null;
		var opt = null;
		var valueIndex;
		plot.hooks.bindEvents.push(processbindEvents);
		plot.hooks.drawSeries.push(processSeries);
		function processSeries(plot, canvascontext, series)
		{   opt = plot.getOptions();
		    valueIndex = opt.series.grow.valueIndex;
			if(opt.series.grow.active == true)
			{	if (done == false)
				{	data = plot.getData();
					data.actualStep = 0;
					for (var j = 0; j < data.length; j++)
					{	data[j].dataOrg = clone(data[j].data);
						for (var i = 0; i < data[j].data.length; i++)
							data[j].data[i][valueIndex] = 0;
					}
					plot.setData(data);
					done = true;
				}
			}
		}
		function processbindEvents(plot,eventHolder)
		{	opt = plot.getOptions();
			if (opt.series.grow.active == true)
			{	var d = plot.getData();
				for (var j = 0; j < data.length; j++) {
					opt.series.grow.steps = Math.max(opt.series.grow.steps, d[j].grow.steps);
				}
				if(opt.series.grow.stepDelay == 0) opt.series.grow.stepDelay++;
				growfunc = window.setInterval(growing, opt.series.grow.stepDelay);
			}
		}
		function growing()
		{	if (data.actualStep < opt.series.grow.steps)
			{	data.actualStep++;
				for(var j = 0; j < data.length; j++)
				{ if (typeof data[j].grow.stepMode == "function")
					{	data[j].grow.stepMode(data[j],data.actualStep,valueIndex); }
					else
					{	if (data[j].grow.stepMode == "linear") growLinear();
						else if (data[j].grow.stepMode == "maximum") growMaximum();
						else if (data[j].grow.stepMode == "delay") growDelay();
						else growNone();
					}
				}
				plt.setData(data);
				plt.draw();
			}
			else
			{	window.clearInterval(growfunc); }
			function growNone()
			{	if (data.actualStep == 1)
				{	for (var i = 0; i < data[j].data.length; i++)
					{	data[j].data[i][valueIndex] = data[j].dataOrg[i][valueIndex]; }
				}
			}
			function growLinear()
			{	if (data.actualStep <= data[j].grow.steps)
				{	for (var i = 0; i < data[j].data.length; i++)
					{	if (data[j].grow.stepDirection == "up")
						{	data[j].data[i][valueIndex] = data[j].dataOrg[i][valueIndex] / data[j].grow.steps * data.actualStep;}
						else if(data[j].grow.stepDirection == "down")
						{	data[j].data[i][valueIndex] = data[j].dataOrg[i][valueIndex] + (data[j].yaxis.max - data[j].dataOrg[i][valueIndex]) / data[j].grow.steps * (data[j].grow.steps - data.actualStep); }
					}
				}
			}
			function growMaximum()
			{	if (data.actualStep <= data[j].grow.steps)
				{	for (var i = 0; i < data[j].data.length; i++)
					{	if (data[j].grow.stepDirection == "up")
						{	data[j].data[i][valueIndex] = Math.min(data[j].dataOrg[i][valueIndex], data[j].yaxis.max / data[j].grow.steps * data.actualStep); }
						else if (data[j].grow.stepDirection == "down")
						{	data[j].data[i][valueIndex] = Math.max(data[j].dataOrg[i][valueIndex], data[j].yaxis.max / data[j].grow.steps * (data[j].grow.steps - data.actualStep) ); }
					}
				}
			}
			function growDelay()
			{	if (data.actualStep == data[j].grow.steps)
				{	for (var i = 0; i < data[j].data.length; i++)
					{	data[j].data[i][valueIndex] = data[j].dataOrg[i][valueIndex]; }
				}
			}
		}
		function clone(obj)
		{	if(obj == null || typeof(obj) != 'object') return obj;
			var temp = new obj.constructor();
			for(var key in obj)	temp[key] = clone(obj[key]);
			return temp;
		}
    }

	$.plot.plugins.push({
      init: init,
      options: options,
      name: 'grow',
      version: '0.2'
    });
})(jQuery);
;
/*
Flot plugin for rendering pie charts. The plugin assumes the data is 
coming is as a single data value for each series, and each of those 
values is a positive value or zero (negative numbers don't make 
any sense and will cause strange effects). The data values do 
NOT need to be passed in as percentage values because it 
internally calculates the total and percentages.

* Created by Brian Medendorp, June 2009
* Updated November 2009 with contributions from: btburnett3, Anthony Aragues and Xavi Ivars

* Changes:
	2009-10-22: lineJoin set to round
	2009-10-23: IE full circle fix, donut
	2009-11-11: Added basic hover from btburnett3 - does not work in IE, and center is off in Chrome and Opera
	2009-11-17: Added IE hover capability submitted by Anthony Aragues
	2009-11-18: Added bug fix submitted by Xavi Ivars (issues with arrays when other JS libraries are included as well)
		

Available options are:
series: {
	pie: {
		show: true/false
		radius: 0-1 for percentage of fullsize, or a specified pixel length, or 'auto'
		innerRadius: 0-1 for percentage of fullsize or a specified pixel length, for creating a donut effect
		startAngle: 0-2 factor of PI used for starting angle (in radians) i.e 3/2 starts at the top, 0 and 2 have the same result
		tilt: 0-1 for percentage to tilt the pie, where 1 is no tilt, and 0 is completely flat (nothing will show)
		offset: {
			top: integer value to move the pie up or down
			left: integer value to move the pie left or right, or 'auto'
		},
		stroke: {
			color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#FFF')
			width: integer pixel width of the stroke
		},
		label: {
			show: true/false, or 'auto'
			formatter:  a user-defined function that modifies the text/style of the label text
			radius: 0-1 for percentage of fullsize, or a specified pixel length
			background: {
				color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#000')
				opacity: 0-1
			},
			threshold: 0-1 for the percentage value at which to hide labels (if they're too small)
		},
		combine: {
			threshold: 0-1 for the percentage value at which to combine slices (if they're too small)
			color: any hexidecimal color value (other formats may or may not work, so best to stick with something like '#CCC'), if null, the plugin will automatically use the color of the first slice to be combined
			label: any text value of what the combined slice should be labeled
		}
		highlight: {
			opacity: 0-1
		}
	}
}

More detail and specific examples can be found in the included HTML file.

*/

(function ($) 
{
	function init(plot) // this is the "body" of the plugin
	{
		var canvas = null;
		var target = null;
		var maxRadius = null;
		var centerLeft = null;
		var centerTop = null;
		var total = 0;
		var redraw = true;
		var redrawAttempts = 10;
		var shrink = 0.95;
		var legendWidth = 0;
		var processed = false;
		var raw = false;
		
		// interactive variables	
		var highlights = [];	
	
		// add hook to determine if pie plugin in enabled, and then perform necessary operations
		plot.hooks.processOptions.push(checkPieEnabled);
		plot.hooks.bindEvents.push(bindEvents);	

		// check to see if the pie plugin is enabled
		function checkPieEnabled(plot, options)
		{
			if (options.series.pie.show)
			{
				//disable grid
				options.grid.show = false;
				
				// set labels.show
				if (options.series.pie.label.show=='auto')
					if (options.legend.show)
						options.series.pie.label.show = false;
					else
						options.series.pie.label.show = true;
				
				// set radius
				if (options.series.pie.radius=='auto')
					if (options.series.pie.label.show)
						options.series.pie.radius = 3/4;
					else
						options.series.pie.radius = 1;
						
				// ensure sane tilt
				if (options.series.pie.tilt>1)
					options.series.pie.tilt=1;
				if (options.series.pie.tilt<0)
					options.series.pie.tilt=0;
			
				// add processData hook to do transformations on the data
				plot.hooks.processDatapoints.push(processDatapoints);
				plot.hooks.drawOverlay.push(drawOverlay);	
				
				// add draw hook
				plot.hooks.draw.push(draw);
			}
		}
	
		// bind hoverable events
		function bindEvents(plot, eventHolder) 		
		{		
			var options = plot.getOptions();
			
			if (options.series.pie.show && options.grid.hoverable)
				eventHolder.unbind('mousemove').mousemove(onMouseMove);
				
			if (options.series.pie.show && options.grid.clickable)
				eventHolder.unbind('click').click(onClick);
		}	
		

		// debugging function that prints out an object
		function alertObject(obj)
		{
			var msg = '';
			function traverse(obj, depth)
			{
				if (!depth)
					depth = 0;
				for (var i = 0; i < obj.length; ++i)
				{
					for (var j=0; j<depth; j++)
						msg += '\t';
				
					if( typeof obj[i] == "object")
					{	// its an object
						msg += ''+i+':\n';
						traverse(obj[i], depth+1);
					}
					else
					{	// its a value
						msg += ''+i+': '+obj[i]+'\n';
					}
				}
			}
			traverse(obj);
			alert(msg);
		}
		
		function calcTotal(data)
		{
			for (var i = 0; i < data.length; ++i)
			{
				var item = parseFloat(data[i].data[0][1]);
				if (item)
					total += item;
			}
		}	
		
		function processDatapoints(plot, series, data, datapoints) 
		{	
			if (!processed)
			{
				processed = true;
			
				canvas = plot.getCanvas();
				target = $(canvas).parent();
				options = plot.getOptions();
			
				plot.setData(combine(plot.getData()));
			}
		}
		
		function setupPie()
		{
			legendWidth = target.children().filter('.legend').children().width();
		
			// calculate maximum radius and center point
			maxRadius =  Math.min(canvas.width,(canvas.height/options.series.pie.tilt))/2;
			centerTop = (canvas.height/2)+options.series.pie.offset.top;
			centerLeft = (canvas.width/2);
			
			if (options.series.pie.offset.left=='auto')
				if (options.legend.position.match('w'))
					centerLeft += legendWidth/2;
				else
					centerLeft -= legendWidth/2;
			else
				centerLeft += options.series.pie.offset.left;
					
			if (centerLeft<maxRadius)
				centerLeft = maxRadius;
			else if (centerLeft>canvas.width-maxRadius)
				centerLeft = canvas.width-maxRadius;
		}
		
		function fixData(data)
		{
			for (var i = 0; i < data.length; ++i)
			{
				if (typeof(data[i].data)=='number')
					data[i].data = [[1,data[i].data]];
				else if (typeof(data[i].data)=='undefined' || typeof(data[i].data[0])=='undefined')
				{
					if (typeof(data[i].data)!='undefined' && typeof(data[i].data.label)!='undefined')
						data[i].label = data[i].data.label; // fix weirdness coming from flot
					data[i].data = [[1,0]];
					
				}
			}
			return data;
		}
		
		function combine(data)
		{
			data = fixData(data);
			calcTotal(data);
			var combined = 0;
			var numCombined = 0;
			var color = options.series.pie.combine.color;
			
			var newdata = [];
			for (var i = 0; i < data.length; ++i)
			{
				// make sure its a number
				data[i].data[0][1] = parseFloat(data[i].data[0][1]);
				if (!data[i].data[0][1])
					data[i].data[0][1] = 0;
					
				if (data[i].data[0][1]/total<=options.series.pie.combine.threshold)
				{
					combined += data[i].data[0][1];
					numCombined++;
					if (!color)
						color = data[i].color;
				}				
				else
				{
					newdata.push({
						data: [[1,data[i].data[0][1]]], 
						color: data[i].color, 
						label: data[i].label,
						angle: (data[i].data[0][1]*(Math.PI*2))/total,
						percent: (data[i].data[0][1]/total*100)
					});
				}
			}
			if (numCombined>0)
				newdata.push({
					data: [[1,combined]], 
					color: color, 
					label: options.series.pie.combine.label,
					angle: (combined*(Math.PI*2))/total,
					percent: (combined/total*100)
				});
			return newdata;
		}		
		
		function draw(plot, newCtx)
		{
			if (!target) return; // if no series were passed
			ctx = newCtx;
		
			setupPie();
			var slices = plot.getData();
		
			var attempts = 0;
			while (redraw && attempts<redrawAttempts)
			{
				redraw = false;
				if (attempts>0)
					maxRadius *= shrink;
				attempts += 1;
				clear();
				if (options.series.pie.tilt<=0.8)
					drawShadow();
				drawPie();
			}
			if (attempts >= redrawAttempts) {
				clear();
				target.prepend('<div class="error">Could not draw pie with labels contained inside canvas</div>');
			}
			
			if ( plot.setSeries && plot.insertLegend )
			{
				plot.setSeries(slices);
				plot.insertLegend();
			}
			
			// we're actually done at this point, just defining internal functions at this point
			
			function clear()
			{
				ctx.clearRect(0,0,canvas.width,canvas.height);
				target.children().filter('.pieLabel, .pieLabelBackground').remove();
			}
			
			function drawShadow()
			{
				var shadowLeft = 5;
				var shadowTop = 15;
				var edge = 10;
				var alpha = 0.02;
			
				// set radius
				if (options.series.pie.radius>1)
					var radius = options.series.pie.radius;
				else
					var radius = maxRadius * options.series.pie.radius;
					
				if (radius>=(canvas.width/2)-shadowLeft || radius*options.series.pie.tilt>=(canvas.height/2)-shadowTop || radius<=edge)
					return;	// shadow would be outside canvas, so don't draw it
			
				ctx.save();
				ctx.translate(shadowLeft,shadowTop);
				ctx.globalAlpha = alpha;
				ctx.fillStyle = '#000';

				// center and rotate to starting position
				ctx.translate(centerLeft,centerTop);
				ctx.scale(1, options.series.pie.tilt);
				
				//radius -= edge;
				for (var i=1; i<=edge; i++)
				{
					ctx.beginPath();
					ctx.arc(0,0,radius,0,Math.PI*2,false);
					ctx.fill();
					radius -= i;
				}	
				
				ctx.restore();
			}
			
			function drawPie()
			{
				startAngle = Math.PI*options.series.pie.startAngle;
				
				// set radius
				if (options.series.pie.radius>1)
					var radius = options.series.pie.radius;
				else
					var radius = maxRadius * options.series.pie.radius;
				
				// center and rotate to starting position
				ctx.save();
				ctx.translate(centerLeft,centerTop);
				ctx.scale(1, options.series.pie.tilt);
				//ctx.rotate(startAngle); // start at top; -- This doesn't work properly in Opera
				
				// draw slices
				ctx.save();
				var currentAngle = startAngle;
				for (var i = 0; i < slices.length; ++i)
				{
					slices[i].startAngle = currentAngle;
					drawSlice(slices[i].angle, slices[i].color, true);
				}
				ctx.restore();
				
				// draw slice outlines
				ctx.save();
				ctx.lineWidth = options.series.pie.stroke.width;
				currentAngle = startAngle;
				for (var i = 0; i < slices.length; ++i)
					drawSlice(slices[i].angle, options.series.pie.stroke.color, false);
				ctx.restore();
					
				// draw donut hole
				drawDonutHole(ctx);
				
				// draw labels
				if (options.series.pie.label.show)
					drawLabels();
				
				// restore to original state
				ctx.restore();
				
				function drawSlice(angle, color, fill)
				{	
					if (angle<=0)
						return;
				
					if (fill)
						ctx.fillStyle = color;
					else
					{
						ctx.strokeStyle = color;
						ctx.lineJoin = 'round';
					}
						
					ctx.beginPath();
					if (Math.abs(angle - Math.PI*2) > 0.000000001)
						ctx.moveTo(0,0); // Center of the pie
					else if ($.browser.msie)
						angle -= 0.0001;
					//ctx.arc(0,0,radius,0,angle,false); // This doesn't work properly in Opera
					ctx.arc(0,0,radius,currentAngle,currentAngle+angle,false);
					ctx.closePath();
					//ctx.rotate(angle); // This doesn't work properly in Opera
					currentAngle += angle;
					
					if (fill)
						ctx.fill();
					else
						ctx.stroke();
				}
				
				function drawLabels()
				{
					var currentAngle = startAngle;
					
					// set radius
					if (options.series.pie.label.radius>1)
						var radius = options.series.pie.label.radius;
					else
						var radius = maxRadius * options.series.pie.label.radius;
					
					for (var i = 0; i < slices.length; ++i)
					{
						if (slices[i].percent >= options.series.pie.label.threshold*100)
							drawLabel(slices[i], currentAngle, i);
						currentAngle += slices[i].angle;
					}
					
					function drawLabel(slice, startAngle, index)
					{
						if (slice.data[0][1]==0)
							return;
							
						// format label text
						var lf = options.legend.labelFormatter, text, plf = options.series.pie.label.formatter;
						if (lf)
							text = lf(slice.label, slice);
						else
							text = slice.label;
						if (plf)
							text = plf(text, slice);
							
						var halfAngle = ((startAngle+slice.angle) + startAngle)/2;
						var x = centerLeft + Math.round(Math.cos(halfAngle) * radius);
						var y = centerTop + Math.round(Math.sin(halfAngle) * radius) * options.series.pie.tilt;
						
						var html = '<span class="pieLabel" id="pieLabel'+index+'" style="position:absolute;top:' + y + 'px;left:' + x + 'px;">' + text + "</span>";
						target.append(html);
						var label = target.children('#pieLabel'+index);
						var labelTop = (y - label.height()/2);
						var labelLeft = (x - label.width()/2);
						label.css('top', labelTop);
						label.css('left', labelLeft);
						
						// check to make sure that the label is not outside the canvas
						if (0-labelTop>0 || 0-labelLeft>0 || canvas.height-(labelTop+label.height())<0 || canvas.width-(labelLeft+label.width())<0)
							redraw = true;
						
						if (options.series.pie.label.background.opacity != 0) {
							// put in the transparent background separately to avoid blended labels and label boxes
							var c = options.series.pie.label.background.color;
							if (c == null) {
								c = slice.color;
							}
							var pos = 'top:'+labelTop+'px;left:'+labelLeft+'px;';
							$('<div class="pieLabelBackground" style="position:absolute;width:' + label.width() + 'px;height:' + label.height() + 'px;' + pos +'background-color:' + c + ';"> </div>').insertBefore(label).css('opacity', options.series.pie.label.background.opacity);
						}
					} // end individual label function
				} // end drawLabels function
			} // end drawPie function
		} // end draw function
		
		// Placed here because it needs to be accessed from multiple locations 
		function drawDonutHole(layer)
		{
			// draw donut hole
			if(options.series.pie.innerRadius > 0)
			{
				// subtract the center
				layer.save();
				innerRadius = options.series.pie.innerRadius > 1 ? options.series.pie.innerRadius : maxRadius * options.series.pie.innerRadius;
				layer.globalCompositeOperation = 'destination-out'; // this does not work with excanvas, but it will fall back to using the stroke color
				layer.beginPath();
				layer.fillStyle = options.series.pie.stroke.color;
				layer.arc(0,0,innerRadius,0,Math.PI*2,false);
				layer.fill();
				layer.closePath();
				layer.restore();
				
				// add inner stroke
				layer.save();
				layer.beginPath();
				layer.strokeStyle = options.series.pie.stroke.color;
				layer.arc(0,0,innerRadius,0,Math.PI*2,false);
				layer.stroke();
				layer.closePath();
				layer.restore();
				// TODO: add extra shadow inside hole (with a mask) if the pie is tilted.
			}
		}
		
		//-- Additional Interactive related functions --
		
		function isPointInPoly(poly, pt)
		{
			for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
				((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1]< poly[i][1]))
				&& (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
				&& (c = !c);
			return c;
		}
		
		function findNearbySlice(mouseX, mouseY)
		{
			var slices = plot.getData(),
				options = plot.getOptions(),
				radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;
			
			for (var i = 0; i < slices.length; ++i) 
			{
				var s = slices[i];	
				
				if(s.pie.show)
				{
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(0,0); // Center of the pie
					//ctx.scale(1, options.series.pie.tilt);	// this actually seems to break everything when here.
					ctx.arc(0,0,radius,s.startAngle,s.startAngle+s.angle,false);
					ctx.closePath();
					x = mouseX-centerLeft;
					y = mouseY-centerTop;
					if(ctx.isPointInPath)
					{
						if (ctx.isPointInPath(mouseX-centerLeft, mouseY-centerTop))
						{
							//alert('found slice!');
							ctx.restore();
							return {datapoint: [s.percent, s.data], dataIndex: 0, series: s, seriesIndex: i};
						}
					}
					else
					{
						// excanvas for IE doesn;t support isPointInPath, this is a workaround. 
						p1X = (radius * Math.cos(s.startAngle));
						p1Y = (radius * Math.sin(s.startAngle));
						p2X = (radius * Math.cos(s.startAngle+(s.angle/4)));
						p2Y = (radius * Math.sin(s.startAngle+(s.angle/4)));
						p3X = (radius * Math.cos(s.startAngle+(s.angle/2)));
						p3Y = (radius * Math.sin(s.startAngle+(s.angle/2)));
						p4X = (radius * Math.cos(s.startAngle+(s.angle/1.5)));
						p4Y = (radius * Math.sin(s.startAngle+(s.angle/1.5)));
						p5X = (radius * Math.cos(s.startAngle+s.angle));
						p5Y = (radius * Math.sin(s.startAngle+s.angle));
						arrPoly = [[0,0],[p1X,p1Y],[p2X,p2Y],[p3X,p3Y],[p4X,p4Y],[p5X,p5Y]];
						arrPoint = [x,y];
						// TODO: perhaps do some mathmatical trickery here with the Y-coordinate to compensate for pie tilt?
						if(isPointInPoly(arrPoly, arrPoint))
						{
							ctx.restore();
							return {datapoint: [s.percent, s.data], dataIndex: 0, series: s, seriesIndex: i};
						}			
					}
					ctx.restore();
				}
			}
			
			return null;
		}

		function onMouseMove(e) 
		{
			triggerClickHoverEvent('plothover', e);
		}
		
        function onClick(e) 
		{
			triggerClickHoverEvent('plotclick', e);
        }

		// trigger click or hover event (they send the same parameters so we share their code)
		function triggerClickHoverEvent(eventname, e) 
		{
			var offset = plot.offset(),
				canvasX = parseInt(e.pageX - offset.left),
				canvasY =  parseInt(e.pageY - offset.top),
				item = findNearbySlice(canvasX, canvasY);
			
			if (options.grid.autoHighlight) 
			{
				// clear auto-highlights
				for (var i = 0; i < highlights.length; ++i) 
				{
					var h = highlights[i];
					if (h.auto == eventname && !(item && h.series == item.series))
						unhighlight(h.series);
				}
			}
			
			// highlight the slice
			if (item) 
			    highlight(item.series, eventname);
				
			// trigger any hover bind events
			var pos = { pageX: e.pageX, pageY: e.pageY };
			target.trigger(eventname, [ pos, item ]);	
		}

		function highlight(s, auto) 
		{
			if (typeof s == "number")
				s = series[s];

			var i = indexOfHighlight(s);
			if (i == -1) 
			{
				highlights.push({ series: s, auto: auto });
				plot.triggerRedrawOverlay();
			}
			else if (!auto)
				highlights[i].auto = false;
		}

		function unhighlight(s) 
		{
			if (s == null) 
			{
				highlights = [];
				plot.triggerRedrawOverlay();
			}
			
			if (typeof s == "number")
				s = series[s];

			var i = indexOfHighlight(s);
			if (i != -1) 
			{
				highlights.splice(i, 1);
				plot.triggerRedrawOverlay();
			}
		}

		function indexOfHighlight(s) 
		{
			for (var i = 0; i < highlights.length; ++i) 
			{
				var h = highlights[i];
				if (h.series == s)
					return i;
			}
			return -1;
		}

		function drawOverlay(plot, octx) 
		{
			//alert(options.series.pie.radius);
			var options = plot.getOptions();
			//alert(options.series.pie.radius);
			
			var radius = options.series.pie.radius > 1 ? options.series.pie.radius : maxRadius * options.series.pie.radius;

			octx.save();
			octx.translate(centerLeft, centerTop);
			octx.scale(1, options.series.pie.tilt);
			
			for (i = 0; i < highlights.length; ++i) 
				drawHighlight(highlights[i].series);
			
			drawDonutHole(octx);

			octx.restore();

			function drawHighlight(series) 
			{
				if (series.angle < 0) return;
				
				//octx.fillStyle = parseColor(options.series.pie.highlight.color).scale(null, null, null, options.series.pie.highlight.opacity).toString();
				octx.fillStyle = "rgba(255, 255, 255, "+options.series.pie.highlight.opacity+")"; // this is temporary until we have access to parseColor
				
				octx.beginPath();
				if (Math.abs(series.angle - Math.PI*2) > 0.000000001)
					octx.moveTo(0,0); // Center of the pie
				octx.arc(0,0,radius,series.startAngle,series.startAngle+series.angle,false);
				octx.closePath();
				octx.fill();
			}
			
		}	
		
	} // end init (plugin body)
	
	// define pie specific options and their default values
	var options = {
		series: {
			pie: {
				show: false,
				radius: 'auto',	// actual radius of the visible pie (based on full calculated radius if <=1, or hard pixel value)
				innerRadius:0, /* for donut */
				startAngle: 3/2,
				tilt: 1,
				offset: {
					top: 0,
					left: 'auto'
				},
				stroke: {
					color: '#FFF',
					width: 1
				},
				label: {
					show: 'auto',
					formatter: function(label, slice){
						return '<div style="font-size:x-small;text-align:center;padding:2px;color:'+slice.color+';">'+label+'<br/>'+Math.round(slice.percent)+'%</div>';
					},	// formatter function
					radius: 1,	// radius at which to place the labels (based on full calculated radius if <=1, or hard pixel value)
					background: {
						color: null,
						opacity: 0
					},
					threshold: 0	// percentage at which to hide the label (i.e. the slice is too narrow)
				},
				combine: {
					threshold: -1,	// percentage at which to combine little slices into one larger slice
					color: null,	// color to give the new slice (auto-generated if null)
					label: 'Other'	// label to give the new slice
				},
				highlight: {
					//color: '#FFF',		// will add this functionality once parseColor is available
					opacity: 0.5
				}
			}
		}
	};
    
	$.plot.plugins.push({
		init: init,
		options: options,
		name: "pie",
		version: "1.0"
	});
})(jQuery);

;
/*
Flot plugin for automatically redrawing plots when the placeholder
size changes, e.g. on window resizes.

It works by listening for changes on the placeholder div (through the
jQuery resize event plugin) - if the size changes, it will redraw the
plot.

There are no options. If you need to disable the plugin for some
plots, you can just fix the size of their placeholders.
*/


/* Inline dependency: 
 * jQuery resize event - v1.2 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,h,c){var a=$([]),e=$.resize=$.extend($.resize,{}),i,k="setTimeout",j="resize",d=j+"-special-event",b="delay",f="throttleWindow";e[b]=250;e[f]=true;$.event.special[j]={setup:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.add(l);$.data(this,d,{w:l.width(),h:l.height()});if(a.length===1){g()}},teardown:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.not(l);l.removeData(d);if(!a.length){clearTimeout(i)}},add:function(l){if(!e[f]&&this[k]){return false}var n;function m(s,o,p){var q=$(this),r=$.data(this,d);r.w=o!==c?o:q.width();r.h=p!==c?p:q.height();n.apply(this,arguments)}if($.isFunction(l)){n=l;return m}else{n=l.handler;l.handler=m}}};function g(){i=h[k](function(){a.each(function(){var n=$(this),m=n.width(),l=n.height(),o=$.data(this,d);if(m!==o.w||l!==o.h){n.trigger(j,[o.w=m,o.h=l])}});g()},e[b])}})(jQuery,this);


(function ($) {
    var redrawing = 0;
    var options = { }; // no options

    function init(plot) {
        function bindEvents(plot, eventHolder) {
            if (!redrawing)
                plot.getPlaceholder().resize(onResize);

            function onResize() {
                var placeholder = plot.getPlaceholder();

                // somebody might have hidden us and we can't plot
                // when we don't have the dimensions
                if (placeholder.width() == 0 || placeholder.height() == 0)
                    return;
                
                ++redrawing;
                $.plot(placeholder, plot.getData(), plot.getOptions());
                --redrawing;
            }
        }
        
        plot.hooks.bindEvents.push(bindEvents);
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'resize',
        version: '1.0'
    });
})(jQuery);

;
/*
 * jquery.flot.tooltip
 *
 * desc:	create tooltip with values of hovered point on the graph, 
			support many series, time mode, stacking
			you can set custom tip content (also with use of HTML tags) and precision of values
 * version:	0.4.4
 * author: 	Krzysztof Urbas @krzysu [myviews.pl]
 * modify:  SKELETON9@9#, https://github.com/skeleton9/flot.tooltip
 * website:	https://github.com/krzysu/flot.tooltip
 * 
 * released under MIT License, 2012
*/

(function ($) {
    var options = {
		tooltip: false, //boolean
		tooltipOpts: {
			content: "%s | X: %x | Y: %y.2", //%s -> series label, %x -> X value, %y -> Y value, %x.2 -> precision of X value, %p.2 -> percentage of pie or stacked with precision
			dateFormat: "%y-%0m-%0d",
			shifts: {
				x: 10,
				y: 20
			},
			defaultTheme: true,
			labelRegex: null      //use regex to process label
		}
	};
	
    var init = function(plot) {
		var adjustLabel = null;
		var tipPosition = {x: 0, y: 0};
		var opts = plot.getOptions();
		var processed = false;
		var stackSums = {};
		
		var updateTooltipPosition = function(pos) {
			tipPosition.x = pos.x;
			tipPosition.y = pos.y;
		};
		
		var onMouseMove = function(e) {
            
			var pos = {x: 0, y: 0};
			pos.x = e.pageX;
			pos.y = e.pageY;
			
			updateTooltipPosition(pos);
        };
		
		var timestampToDate = function(tmst) {

			var theDate = new Date(tmst);
			
			return $.plot.formatDate(theDate, opts.tooltipOpts.dateFormat);
		};
		
		plot.hooks.processOptions.push(function(plot, options)
		{
			if(options.tooltipOpts.labelRegex)
			{
				adjustLabel = options.tooltipOpts.labelRegex;
			}
			if(options.series.stack) // support percentage for stacked chart, add by skeleton9
			{
				plot.hooks.processRawData.push(processRawData);
			}
		});
		
		plot.hooks.bindEvents.push(function (plot, eventHolder) {
            
			var to = opts.tooltipOpts;
			var placeholder = plot.getPlaceholder();
			var $tip;
			
			if (opts.tooltip === false) return;

			if( $('#flotTip').length > 0 ){
				$tip = $('#flotTip');
			}
			else {
				$tip = $('<div />').attr('id', 'flotTip');
				$tip.appendTo('body').hide().css({position: 'absolute'});
			
				if(to.defaultTheme) {
					$tip.css({
						'background': 'rgba(0, 0, 0, .87)',
						'z-index': '10000',
						'padding': '0.4em 0.6em',
						'border-radius': '2px',
						'font-size': '11px',
						'border': '0px solid transparent',
						'text-shadow': '0 1px black;',
						'color' : '#fff'
					});
				}
			}
			
			$(placeholder).bind("plothover", function (event, pos, item) {
				if (item) {					
					var tipText;

					if(opts.xaxis.mode === "time" || opts.xaxes[0].mode === "time") {
						tipText = stringFormat(to.content, item, timestampToDate);
					}
					else {
						tipText = stringFormat(to.content, item);						
					}
					
					$tip.html( tipText ).css({left: tipPosition.x + to.shifts.x, top: tipPosition.y + to.shifts.y}).show();
				}
				else {
					$tip.hide().html('');
				}
			});
			
            eventHolder.mousemove(onMouseMove);
        });
		
		var stringFormat = function(content, item, fnct) {
		
			var seriesPattern = /%s/;
			var xPattern = /%x\.{0,1}(\d{0,})/;
			var yPattern = /%y\.{0,1}(\d{0,})/;
			var pPattern = /%p\.{0,1}(\d{0,})/; //add by skeleton9 to support percentage in pie/stacked
			
			//series match
			if( typeof(item.series.label) !== 'undefined' ) {
				var label = item.series.label;
				if(adjustLabel)
				{
					label = label.match(adjustLabel)[0]
				}
				content = content.replace(seriesPattern, label);
			}
			// xVal match
			if( typeof(fnct) === 'function' ) {
				content = content.replace(xPattern, fnct(item.series.data[item.dataIndex][0]) );
			}
			else {
				content = adjustValPrecision(xPattern, content, item.series.data[item.dataIndex][0]);
			}
			// yVal match
			content = adjustValPrecision(yPattern, content, item.series.data[item.dataIndex][1]);
			
			//add by skeleton9 to support percentage in pie
			if(item.series.percent)
			{
				content = adjustValPrecision(pPattern, content, item.series.percent);
			}
			else if(item.series.percents) //support for stacked percentage
			{
				content = adjustValPrecision(pPattern, content, item.series.percents[item.dataIndex])
			}

			return content;
		};
		
		var adjustValPrecision = function(pattern, content, value) {
		
			var precision;
			if( content.match(pattern) !== 'null' ) {
				if(RegExp.$1 !== '') {
					precision = RegExp.$1;
					value = value.toFixed(precision)
				}
				content = content.replace(pattern, value);
			}
		
			return content;
		};
		
		//set percentage for stacked chart
		function processRawData(plot, series, data, datapoints) 
		{	
			if (!processed)
			{
				processed = true;
				stackSums = getStackSums(plot.getData());
			}
			var num = data.length;
			series.percents = [];
			for(var j=0;j<num;j++)
			{
				var sum = stackSums[data[j][0]+""];
				if(sum>0)
				{
					series.percents.push(data[j][1]*100/sum);
				}
			}
		}
		
		//calculate summary
		function getStackSums(_data)
		{
			var data_len = _data.length;
			var sums = {};
			if(data_len > 0)
			{
				//caculate summary
				for(var i=0;i<data_len;i++)
				{
					_data[i].percents = [];
					var num = _data[i].data.length;
					for(var j=0;j<num;j++)
					{
						if(sums[_data[i].data[j][0]+""])
						{
							sums[_data[i].data[j][0]+""] += _data[i].data[j][1];
						}
						else
						{
							sums[_data[i].data[j][0]+""] = _data[i].data[j][1];
						}
						 
					}
				}
			}
			return sums;
		}
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'tooltip',
        version: '0.4.4'
    });
})(jQuery);

;
/*
 * Flot plugin to order bars side by side.
 * 
 * Released under the MIT license by Benjamin BUFFET, 20-Sep-2010.
 *
 * This plugin is an alpha version.
 *
 * To activate the plugin you must specify the parameter "order" for the specific serie :
 *
 *  $.plot($("#placeholder"), [{ data: [ ... ], bars :{ order = null or integer }])
 *
 * If 2 series have the same order param, they are ordered by the position in the array;
 *
 * The plugin adjust the point by adding a value depanding of the barwidth
 * Exemple for 3 series (barwidth : 0.1) :
 *
 *          first bar décalage : -0.15
 *          second bar décalage : -0.05
 *          third bar décalage : 0.05
 *
 */

(function($){
    function init(plot){
        var orderedBarSeries;
        var nbOfBarsToOrder;
        var borderWidth;
        var borderWidthInXabsWidth;
        var pixelInXWidthEquivalent = 1;
        var isHorizontal = false;

        /*
         * This method add shift to x values
         */
        function reOrderBars(plot, serie, datapoints){
            var shiftedPoints = null;
            
            if(serieNeedToBeReordered(serie)){                
                checkIfGraphIsHorizontal(serie);
                calculPixel2XWidthConvert(plot);
                retrieveBarSeries(plot);
                calculBorderAndBarWidth(serie);
                
                if(nbOfBarsToOrder >= 2){  
                    var position = findPosition(serie);
                    var decallage = 0;
                    
                    var centerBarShift = calculCenterBarShift();

                    if (isBarAtLeftOfCenter(position)){
                        decallage = -1*(sumWidth(orderedBarSeries,position-1,Math.floor(nbOfBarsToOrder / 2)-1)) - centerBarShift;
                    }else{
                        decallage = sumWidth(orderedBarSeries,Math.ceil(nbOfBarsToOrder / 2),position-2) + centerBarShift + borderWidthInXabsWidth*2;
                    }

                    shiftedPoints = shiftPoints(datapoints,serie,decallage);
                    datapoints.points = shiftedPoints;
               }
           }
           return shiftedPoints;
        }

        function serieNeedToBeReordered(serie){
            return serie.bars != null
                && serie.bars.show
                && serie.bars.order != null;
        }

        function calculPixel2XWidthConvert(plot){
            var gridDimSize = isHorizontal ? plot.getPlaceholder().innerHeight() : plot.getPlaceholder().innerWidth();
            var minMaxValues = isHorizontal ? getAxeMinMaxValues(plot.getData(),1) : getAxeMinMaxValues(plot.getData(),0);
            var AxeSize = minMaxValues[1] - minMaxValues[0];
            pixelInXWidthEquivalent = AxeSize / gridDimSize;
        }

        function getAxeMinMaxValues(series,AxeIdx){
            var minMaxValues = new Array();
            for(var i = 0; i < series.length; i++){
                minMaxValues[0] = series[i].data[0][AxeIdx];
                minMaxValues[1] = series[i].data[series[i].data.length - 1][AxeIdx];
            }
            return minMaxValues;
        }

        function retrieveBarSeries(plot){
            orderedBarSeries = findOthersBarsToReOrders(plot.getData());
            nbOfBarsToOrder = orderedBarSeries.length;
        }

        function findOthersBarsToReOrders(series){
            var retSeries = new Array();

            for(var i = 0; i < series.length; i++){
                if(series[i].bars.order != null && series[i].bars.show){
                    retSeries.push(series[i]);
                }
            }

            return retSeries.sort(sortByOrder);
        }

        function sortByOrder(serie1,serie2){
            var x = serie1.bars.order;
            var y = serie2.bars.order;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }

        function  calculBorderAndBarWidth(serie){
            borderWidth = serie.bars.lineWidth ? serie.bars.lineWidth  : 2;
            borderWidthInXabsWidth = borderWidth * pixelInXWidthEquivalent;
        }
        
        function checkIfGraphIsHorizontal(serie){
            if(serie.bars.horizontal){
                isHorizontal = true;
            }
        }

        function findPosition(serie){
            var pos = 0
            for (var i = 0; i < orderedBarSeries.length; ++i) {
                if (serie == orderedBarSeries[i]){
                    pos = i;
                    break;
                }
            }

            return pos+1;
        }

        function calculCenterBarShift(){
            var width = 0;

            if(nbOfBarsToOrder%2 != 0)
                width = (orderedBarSeries[Math.ceil(nbOfBarsToOrder / 2)].bars.barWidth)/2;

            return width;
        }

        function isBarAtLeftOfCenter(position){
            return position <= Math.ceil(nbOfBarsToOrder / 2);
        }

        function sumWidth(series,start,end){
            var totalWidth = 0;

            for(var i = start; i <= end; i++){
                totalWidth += series[i].bars.barWidth+borderWidthInXabsWidth*2;
            }

            return totalWidth;
        }

        function shiftPoints(datapoints,serie,dx){
            var ps = datapoints.pointsize;
            var points = datapoints.points;
            var j = 0;           
            for(var i = isHorizontal ? 1 : 0;i < points.length; i += ps){
                points[i] += dx;
                //Adding the new x value in the serie to be abble to display the right tooltip value,
                //using the index 3 to not overide the third index.
                serie.data[j][3] = points[i];
                j++;
            }

            return points;
        }

        plot.hooks.processDatapoints.push(reOrderBars);

    }

    var options = {
        series : {
            bars: {order: null} // or number/string
        }
    };

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "orderBars",
        version: "0.2"
    });

})(jQuery)


;
/**
 * jQuery jPages v0.6
 * Client side pagination with jQuery
 * http://luis-almeida.github.com/jPages
 *
 * Licensed under the MIT license.
 * Copyright 2012 Luís Almeida
 * https://github.com/luis-almeida
 */
 
;(function ( $, window, document, undefined ) {

    var name = "jPages",
        instance = null,
        defaults = {
            containerID  : "",
            first        : false,
            previous     : "&#8592; previous",
            next         : "next &#8594;",
            last         : false,
            links        : "numeric", // blank || title
            startPage    : 1,
            perPage      : 10,
            midRange     : 5,
            startRange   : 1,
            endRange     : 1,
            keyBrowse    : false,
            scrollBrowse : false,
            pause        : 0,
            clickStop    : false,
            delay        : 50,
            direction    : "forward", // backwards || auto || random ||
            animation    : "", // http://daneden.me/animate/ - any entrance animations
            fallback     : 400,
            minHeight    : true,
            callback     : undefined // function( pages, items ) { }
        };


    function Plugin( element, options ) {
        this.options = $.extend( {}, defaults, options );
        
        this._container = $( "#" + this.options.containerID );
        if ( !this._container.length ) { 
            return; 
        }

        this.jQwindow = $(window);
        this.jQdocument = $(document);
        
        this._holder = $( element );
        this._nav = {};

        this._first = $( this.options.first );
        this._previous = $( this.options.previous );
        this._next = $( this.options.next );
        this._last = $( this.options.last );
        
        /* only visible items! */
        this._items = this._container.children(":visible");
        this._itemsShowing = $([]);
        this._itemsHiding = $([]);

        this._numPages = Math.ceil( this._items.length / this.options.perPage );
        this._currentPageNum = this.options.startPage;

        this._clicked = false;
        this._cssAnimSupport = this.getCSSAnimationSupport();

        this.init();
        
    }

    Plugin.prototype.getCSSAnimationSupport = function () {
        var animation = false,
            animationstring = 'animation',
            keyframeprefix = '',
            domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
            pfx  = '',
            elm = this._container.get(0);

        if( elm.style.animationName ) { animation = true; } 

        if( animation === false ) {
            for( var i = 0; i < domPrefixes.length; i++ ) {
                if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
                    pfx = domPrefixes[ i ];
                    animationstring = pfx + 'Animation';
                    keyframeprefix = '-' + pfx.toLowerCase() + '-';
                    animation = true;
                    break;
                }
            }
        }

        return animation;
    };

    Plugin.prototype.init = function () {
        this.setStyles();
        this.setNav();
        this.paginate( this._currentPageNum );
        this.setMinHeight();
    };

    Plugin.prototype.setStyles = function () {

        var requiredStyles = "<style>" + 
        ".jp-invisible { visibility: hidden !important; } " +
        ".jp-hidden { display: none !important; }" + 
        "</style>";

        $( requiredStyles ).appendTo("head");

        if ( this._cssAnimSupport && this.options.animation.length ) { 
            this._items.addClass("animated jp-hidden");
        } else {
            this._items.hide();
        }
        
    };

    Plugin.prototype.setNav = function () {
        var navhtml = this.writeNav();

        this._holder.each( this.bind( function( index, element ) {
            var holder = $( element );
            holder.html( navhtml );
            this.cacheNavElements( holder, index );
            this.bindNavHandlers( index );
            this.disableNavSelection( element );
        }, this) );

        if ( this.options.keyBrowse ) this.bindNavKeyBrowse(); 
        if ( this.options.scrollBrowse ) this.bindNavScrollBrowse();
    };

    Plugin.prototype.writeNav = function () {
        var i = 1, navhtml;

        navhtml = this.writeBtn( "first" ) + this.writeBtn( "previous" );

        for ( ; i <= this._numPages; i++ ) {

            if ( i === 1 && this.options.startRange === 0 ) {
                navhtml += "<span>...</span>";
            }

            if ( i > this.options.startRange && i <= this._numPages - this.options.endRange ) {
                navhtml += "<a href='#' class='jp-hidden'>";
            } else {
                navhtml += "<a>";
            }

            switch ( this.options.links ) {
                case "numeric" :
                    navhtml += i;
                    break;
                case "blank" :
                    break;
                case "title" :
                    var title = this._items.eq(i-1).attr("data-title");
                    navhtml += title !== undefined ? title : "";
                    break;
            }

            navhtml += "</a>";

            if ( i === this.options.startRange || i === this._numPages - this.options.endRange ) {
                navhtml += "<span>...</span>";
            }
        }
        
        navhtml += this.writeBtn( "next" ) + this.writeBtn( "last" ) + "</div>";

        return navhtml;
    };

    Plugin.prototype.writeBtn = function ( which ) {

        return this.options[which] !== false && !$( this[ "_" + which ] ).length ? 
            "<a class='jp-" + which + "'>" + this.options[which] + "</a>" : "";

    };

    Plugin.prototype.cacheNavElements = function ( holder, index ) {
        this._nav[index] = {};

        this._nav[index].holder = holder;

        this._nav[index].first = this._first.length ? this._first : this._nav[index].holder.find("a.jp-first");
        this._nav[index].previous = this._previous.length ? this._previous : this._nav[index].holder.find("a.jp-previous");
        this._nav[index].next = this._next.length ? this._next : this._nav[index].holder.find("a.jp-next");
        this._nav[index].last = this._last.length ? this._last : this._nav[index].holder.find("a.jp-last");

        this._nav[index].fstBreak = this._nav[index].holder.find("span:first");
        this._nav[index].lstBreak = this._nav[index].holder.find("span:last");

        this._nav[index].pages = this._nav[index].holder.find("a").not(".jp-first, .jp-previous, .jp-next, .jp-last");
        this._nav[index].permPages = this._nav[index].pages.slice(0, this.options.startRange)
            .add( this._nav[index].pages.slice(this._numPages - this.options.endRange, this._numPages) );
        this._nav[index].pagesShowing = $([]);
        this._nav[index].currentPage = $([]);
    };

    Plugin.prototype.bindNavHandlers = function ( index ) {
        var nav = this._nav[index];

        // default nav
        nav.holder.bind( "click.jPages", this.bind( function( evt ) {
            var newPage = this.getNewPage( nav, $(evt.target) );
            if ( this.validNewPage( newPage ) ) {
                this._clicked = true;
                this.paginate( newPage );
            }
            evt.preventDefault();
        }, this ) );

        // custom first
        if ( this._first.length ) {
            this._first.bind( "click.jPages", this.bind( function() {
                if ( this.validNewPage( 1 ) ) {
                    this._clicked = true;
                    this.paginate( 1 );
                }
            }, this ) );
        }

        // custom previous
        if ( this._previous.length ) {
            this._previous.bind( "click.jPages", this.bind( function() {
                var newPage = this._currentPageNum - 1;
                if ( this.validNewPage( newPage ) ) {
                    this._clicked = true;
                    this.paginate( newPage );
                }
            }, this ) );
        }

        // custom next
        if ( this._next.length ) {
            this._next.bind( "click.jPages", this.bind( function() {
                var newPage = this._currentPageNum + 1;
                if ( this.validNewPage( newPage ) ) {
                    this._clicked = true;
                    this.paginate( newPage );
                }
            }, this ) );
        }

        // custom last
        if ( this._last.length ) {
            this._last.bind( "click.jPages", this.bind( function() {
                if ( this.validNewPage( this._numPages ) ) {
                    this._clicked = true;
                    this.paginate( this._numPages );
                }
            }, this ) );
        }

    };

    Plugin.prototype.disableNavSelection = function ( element ) {
        if ( typeof element.onselectstart != "undefined" ) {
            element.onselectstart = function() { 
                return false; 
            };
        } else if (typeof element.style.MozUserSelect != "undefined") {
            element.style.MozUserSelect = "none";
        } else {
            element.onmousedown = function() { 
                return false; 
            };
        }
    };

    Plugin.prototype.bindNavKeyBrowse = function () {
        this.jQdocument.bind( "keydown.jPages", this.bind( function( evt ) {
            var target = evt.target.nodeName.toLowerCase();
            if ( this.elemScrolledIntoView() && target !== "input" && target != "textarea" ) {
                var newPage = this._currentPageNum;
                
                if ( evt.which == 37 ) newPage = this._currentPageNum - 1;
                if ( evt.which == 39 ) newPage = this._currentPageNum + 1;

                if ( this.validNewPage( newPage ) ) {
                    this._clicked = true;
                    this.paginate( newPage );
                }
            }
        }, this ) );
    };

    Plugin.prototype.elemScrolledIntoView = function () {
        var docViewTop, docViewBottom, elemTop, elemBottom;

        docViewTop = this.jQwindow.scrollTop();
        docViewBottom = docViewTop + this.jQwindow.height();

        elemTop = this._container.offset().top;
        elemBottom = elemTop + this._container.height();

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom));

        // comment above and uncomment below if you want keyBrowse to happen 
        // only when container is completely visible in the page 

        /*return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom) && 
            (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );*/
    };

    Plugin.prototype.bindNavScrollBrowse = function () {

        this._container.bind( "mousewheel.jPages DOMMouseScroll.jPages", this.bind(function( evt ) {
            var newPage = ( evt.originalEvent.wheelDelta || -evt.originalEvent.detail ) > 0 ? 
                ( this._currentPageNum - 1 ) : ( this._currentPageNum + 1 );

            if ( this.validNewPage( newPage ) ) {
                this._clicked = true;
                this.paginate( newPage );
            }
            
            evt.preventDefault();
            return false;

        }, this) );

    };

    Plugin.prototype.getNewPage = function ( nav, target ) {

        if ( target.is( nav.currentPage ) ) return this._currentPageNum;
        if ( target.is( nav.pages ) ) return nav.pages.index(target) + 1;
        if ( target.is( nav.first ) ) return 1;
        if ( target.is( nav.last ) ) return this._numPages;
        if ( target.is( nav.previous ) ) return nav.pages.index(nav.currentPage);
        if ( target.is( nav.next ) ) return nav.pages.index(nav.currentPage) + 2;

    };

    Plugin.prototype.validNewPage = function ( newPage ) {
        return newPage !== this._currentPageNum && newPage > 0 && newPage <= this._numPages ? 
            true : false;
    };

    Plugin.prototype.paginate = function ( page ) {
        var itemRange, pageInterval;

        itemRange = this.updateItems( page );
        pageInterval = this.updatePages( page );

        this._currentPageNum = page;
        
        if ( $.isFunction( this.options.callback ) ) {
            this.callback( page, itemRange, pageInterval );
        }
        
        this.updatePause();
    };

    Plugin.prototype.updateItems = function ( page ) {
        var range = this.getItemRange( page );

        this._itemsHiding = this._itemsShowing;
        this._itemsShowing = this._items.slice(range.start, range.end);
        
        if ( this._cssAnimSupport && this.options.animation.length ) { 
            this.cssAnimations( page );
        } else {
            this.jQAnimations( page );
        }

        return range;
    };

    Plugin.prototype.getItemRange = function ( page ) {
        var range = {};

        range.start = ( page - 1 ) * this.options.perPage;
        range.end = range.start + this.options.perPage;
        
        if ( range.end > this._items.length ) {
            range.end = this._items.length;
        }

        return range;
    };

    Plugin.prototype.cssAnimations = function ( page ) {
        clearInterval( this._delay );

        this._itemsHiding
            .removeClass( this.options.animation + " jp-invisible" )
            .addClass("jp-hidden");

        this._itemsShowing
            .removeClass("jp-hidden")
            .addClass("jp-invisible");
        
        this._itemsOriented = this.getDirectedItems( page );
        this._index = 0;

        this._delay = setInterval( this.bind( function() {

            if ( this._index === this._itemsOriented.length ) {
                clearInterval( this._delay );
            } else {
                this._itemsOriented
                    .eq(this._index)
                    .removeClass("jp-invisible")
                    .addClass(this.options.animation);
            }

            this._index = this._index + 1;

        }, this ), this.options.delay );
    };


    Plugin.prototype.jQAnimations = function ( page ) {
        clearInterval( this._delay );

        this._itemsHiding.addClass("jp-hidden");
        this._itemsShowing.fadeTo(0, 0).removeClass("jp-hidden");

        this._itemsOriented = this.getDirectedItems( page );
        this._index = 0;

        this._delay = setInterval( this.bind( function() {

            if ( this._index === this._itemsOriented.length ) {
                clearInterval( this._delay );
            } else {
                this._itemsOriented
                    .eq(this._index)
                    .fadeTo(this.options.fallback, 1);
            }

            this._index = this._index + 1;

        }, this ), this.options.delay );
    };

    Plugin.prototype.getDirectedItems = function ( page ) {
        var itemsToShow;

        switch ( this.options.direction ) {
            case "backwards" : 
                itemsToShow = $( this._itemsShowing.get().reverse() );
                break;
            case "random" :
                itemsToShow = $( this._itemsShowing.get().sort( function() { 
                    return ( Math.round( Math.random() ) - 0.5 );
                } ) );
                break;
            case "auto" :
                itemsToShow = page >= this._currentPageNum ? 
                    this._itemsShowing : $( this._itemsShowing.get().reverse() );
                break;
            default :
                itemsToShow = this._itemsShowing;
        }

        return itemsToShow;
    };

    Plugin.prototype.updatePages = function ( page ) {
        var interval, index, nav;

        interval = this.getInterval( page );

        for( index in this._nav ) {
            if ( this._nav.hasOwnProperty( index ) ) {
                nav = this._nav[index];
                this.updateBtns( nav, page );
                this.updateCurrentPage( nav, page );
                this.updatePagesShowing( nav, interval );
                this.updateBreaks( nav, interval );
            }
        }

        return interval;
    };

    Plugin.prototype.getInterval = function ( page ) {
        var neHalf, upperLimit, start, end;
        
        neHalf = Math.ceil( this.options.midRange / 2 );
        upperLimit = this._numPages - this.options.midRange;
        start = page > neHalf ? Math.max( Math.min( page - neHalf, upperLimit ), 0 ) : 0;
        end = page > neHalf ? Math.min( page + neHalf - ( this.options.midRange % 2 > 0 ? 1 : 0 ), this._numPages ) : Math.min( this.options.midRange, this._numPages );
        
        return { start: start, end: end };
    };

    Plugin.prototype.updateBtns = function ( nav, page ) {
        
        if ( page === 1 ) {
            nav.first.addClass("jp-disabled");
            nav.previous.addClass("jp-disabled");
        }

        if ( page === this._numPages ) {
            nav.next.addClass("jp-disabled");
            nav.last.addClass("jp-disabled");
        }

        if ( this._currentPageNum === 1 && page > 1 ) {
            nav.first.removeClass("jp-disabled");
            nav.previous.removeClass("jp-disabled");
        }

        if ( this._currentPageNum === this._numPages && page < this._numPages ) {
            nav.next.removeClass("jp-disabled");
            nav.last.removeClass("jp-disabled");
        }
        
    };

    Plugin.prototype.updateCurrentPage = function ( nav, page ) {

        nav.currentPage.removeClass("jp-current");
        nav.currentPage = nav.pages.eq( page - 1 ).addClass("jp-current");
    
    };

    Plugin.prototype.updatePagesShowing = function ( nav, interval ) {
        var newRange = nav.pages.slice( interval.start, interval.end ).not( nav.permPages );

        nav.pagesShowing.not( newRange ).addClass("jp-hidden");
        newRange.not( nav.pagesShowing ).removeClass("jp-hidden");
        
        nav.pagesShowing = newRange;

    };

    Plugin.prototype.updateBreaks = function ( nav, interval ) {

        if ( interval.start > this.options.startRange || ( this.options.startRange === 0 && interval.start > 0 ) ) { 
            nav.fstBreak.removeClass("jp-hidden");
        } else { 
            nav.fstBreak.addClass("jp-hidden");
        }
        
        if ( interval.end < this._numPages - this.options.endRange ) {
            nav.lstBreak.removeClass("jp-hidden");
        } else { 
            nav.lstBreak.addClass("jp-hidden");
        }
        
    };

    Plugin.prototype.callback = function ( page, itemRange, pageInterval ) {
        var pages = {
            current  : page,
            interval : pageInterval,
            count    : this._numPages
        },
        items = {
            showing  : this._itemsShowing,
            oncoming : this._items.slice( itemRange.start + this.options.perPage, itemRange.end + this.options.perPage ),
            range    : itemRange,
            count    : this._items.length
        };

        pages.interval.start = pages.interval.start + 1;
        items.range.start = items.range.start + 1;

        this.options.callback( pages, items );
    };

    Plugin.prototype.updatePause = function () {
        if ( this.options.pause && this._numPages > 1) { 
            clearTimeout( this._pause );
            if ( this.options.clickStop && this._clicked ) {
                return;
            } else {
                this._pause = setTimeout( this.bind( function() {
                    this.paginate( this._currentPageNum !== this._numPages ? this._currentPageNum + 1 : 1 );
                }, this ), this.options.pause );
            }
        }
    };

    Plugin.prototype.setMinHeight = function () {
        if ( this.options.minHeight && !this._container.is("table, tbody") ) { 
            setTimeout( this.bind( function() {
                this._container.css({
                    "min-height" : this._container.css("height")
                });
            }, this ), 1000 );
        }
    };

    Plugin.prototype.bind = function ( fn, me ) {
        return function () { 
            return fn.apply(me, arguments);
        }; 
    };

    Plugin.prototype.destroy = function () {
        this.jQdocument.unbind("keydown.jPages");
        this._container.unbind( "mousewheel.jPages DOMMouseScroll.jPages");

        if ( this.options.minHeight ) {
            this._container.css("min-height", "");
        }

        if ( this._cssAnimSupport && this.options.animation.length ) { 
            this._items.removeClass("animated jp-hidden jp-invisible " + this.options.animation);
        } else {    
            this._items.removeClass("jp-hidden").fadeTo(0, 1);
        }

        this._holder.unbind("click.jPages").empty();
    };



    $.fn[name] = function ( arg ) {
        var type = $.type( arg );

        if ( type === "object" ) {
            if ( this.length && !$.data( this, name ) ) {
                instance = new Plugin( this, arg );
                this.each( function() {
                    $.data( this, name, instance );
                } );
            }
            return this;
        }

        if ( type === "string" && arg === "destroy" ) {
            instance.destroy();
            this.each( function() {
                $.removeData( this, name );
            } );
            return this;
        }

        if ( type === 'number' && arg % 1 === 0 ) {
            if ( instance.validNewPage( arg ) ) {
                instance.paginate( arg );
            }
            return this;
        }

        return this;
    };

})( jQuery, window, document );
;
/*

 FullCalendar v1.5.4
 http://arshaw.com/fullcalendar/

 Use fullcalendar.css for basic styling.
 For event drag & drop, requires jQuery UI draggable.
 For event resizing, requires jQuery UI resizable.

 Copyright (c) 2011 Adam Shaw
 Dual licensed under the MIT and GPL licenses, located in
 MIT-LICENSE.txt and GPL-LICENSE.txt respectively.

 Date: Tue Sep 4 23:38:33 2012 -0700

*/
(function(m,ma){function wb(a){m.extend(true,Ya,a)}function Yb(a,b,e){function d(k){if(E){u();q();na();S(k)}else f()}function f(){B=b.theme?"ui":"fc";a.addClass("fc");b.isRTL&&a.addClass("fc-rtl");b.theme&&a.addClass("ui-widget");E=m("<div class='fc-content' style='position:relative'/>").prependTo(a);C=new Zb(X,b);(P=C.render())&&a.prepend(P);y(b.defaultView);m(window).resize(oa);t()||g()}function g(){setTimeout(function(){!n.start&&t()&&S()},0)}function l(){m(window).unbind("resize",oa);C.destroy();
E.remove();a.removeClass("fc fc-rtl ui-widget")}function j(){return i.offsetWidth!==0}function t(){return m("body")[0].offsetWidth!==0}function y(k){if(!n||k!=n.name){F++;pa();var D=n,Z;if(D){(D.beforeHide||xb)();Za(E,E.height());D.element.hide()}else Za(E,1);E.css("overflow","hidden");if(n=Y[k])n.element.show();else n=Y[k]=new Ja[k](Z=s=m("<div class='fc-view fc-view-"+k+"' style='position:absolute'/>").appendTo(E),X);D&&C.deactivateButton(D.name);C.activateButton(k);S();E.css("overflow","");D&&
Za(E,1);Z||(n.afterShow||xb)();F--}}function S(k){if(j()){F++;pa();o===ma&&u();var D=false;if(!n.start||k||r<n.start||r>=n.end){n.render(r,k||0);fa(true);D=true}else if(n.sizeDirty){n.clearEvents();fa();D=true}else if(n.eventsDirty){n.clearEvents();D=true}n.sizeDirty=false;n.eventsDirty=false;ga(D);W=a.outerWidth();C.updateTitle(n.title);k=new Date;k>=n.start&&k<n.end?C.disableButton("today"):C.enableButton("today");F--;n.trigger("viewDisplay",i)}}function Q(){q();if(j()){u();fa();pa();n.clearEvents();
n.renderEvents(J);n.sizeDirty=false}}function q(){m.each(Y,function(k,D){D.sizeDirty=true})}function u(){o=b.contentHeight?b.contentHeight:b.height?b.height-(P?P.height():0)-Sa(E):Math.round(E.width()/Math.max(b.aspectRatio,0.5))}function fa(k){F++;n.setHeight(o,k);if(s){s.css("position","relative");s=null}n.setWidth(E.width(),k);F--}function oa(){if(!F)if(n.start){var k=++v;setTimeout(function(){if(k==v&&!F&&j())if(W!=(W=a.outerWidth())){F++;Q();n.trigger("windowResize",i);F--}},200)}else g()}function ga(k){if(!b.lazyFetching||
ya(n.visStart,n.visEnd))ra();else k&&da()}function ra(){K(n.visStart,n.visEnd)}function sa(k){J=k;da()}function ha(k){da(k)}function da(k){na();if(j()){n.clearEvents();n.renderEvents(J,k);n.eventsDirty=false}}function na(){m.each(Y,function(k,D){D.eventsDirty=true})}function ua(k,D,Z){n.select(k,D,Z===ma?true:Z)}function pa(){n&&n.unselect()}function U(){S(-1)}function ca(){S(1)}function ka(){gb(r,-1);S()}function qa(){gb(r,1);S()}function G(){r=new Date;S()}function p(k,D,Z){if(k instanceof Date)r=
N(k);else yb(r,k,D,Z);S()}function L(k,D,Z){k!==ma&&gb(r,k);D!==ma&&hb(r,D);Z!==ma&&ba(r,Z);S()}function c(){return N(r)}function z(){return n}function H(k,D){if(D===ma)return b[k];if(k=="height"||k=="contentHeight"||k=="aspectRatio"){b[k]=D;Q()}}function T(k,D){if(b[k])return b[k].apply(D||i,Array.prototype.slice.call(arguments,2))}var X=this;X.options=b;X.render=d;X.destroy=l;X.refetchEvents=ra;X.reportEvents=sa;X.reportEventChange=ha;X.rerenderEvents=da;X.changeView=y;X.select=ua;X.unselect=pa;
X.prev=U;X.next=ca;X.prevYear=ka;X.nextYear=qa;X.today=G;X.gotoDate=p;X.incrementDate=L;X.formatDate=function(k,D){return Oa(k,D,b)};X.formatDates=function(k,D,Z){return ib(k,D,Z,b)};X.getDate=c;X.getView=z;X.option=H;X.trigger=T;$b.call(X,b,e);var ya=X.isFetchNeeded,K=X.fetchEvents,i=a[0],C,P,E,B,n,Y={},W,o,s,v=0,F=0,r=new Date,J=[],M;yb(r,b.year,b.month,b.date);b.droppable&&m(document).bind("dragstart",function(k,D){var Z=k.target,ja=m(Z);if(!ja.parents(".fc").length){var ia=b.dropAccept;if(m.isFunction(ia)?
ia.call(Z,ja):ja.is(ia)){M=Z;n.dragStart(M,k,D)}}}).bind("dragstop",function(k,D){if(M){n.dragStop(M,k,D);M=null}})}function Zb(a,b){function e(){q=b.theme?"ui":"fc";if(b.header)return Q=m("<table class='fc-header' style='width:100%'/>").append(m("<tr/>").append(f("left")).append(f("center")).append(f("right")))}function d(){Q.remove()}function f(u){var fa=m("<td class='fc-header-"+u+"'/>");(u=b.header[u])&&m.each(u.split(" "),function(oa){oa>0&&fa.append("<span class='fc-header-space'/>");var ga;
m.each(this.split(","),function(ra,sa){if(sa=="title"){fa.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>");ga&&ga.addClass(q+"-corner-right");ga=null}else{var ha;if(a[sa])ha=a[sa];else if(Ja[sa])ha=function(){na.removeClass(q+"-state-hover");a.changeView(sa)};if(ha){ra=b.theme?jb(b.buttonIcons,sa):null;var da=jb(b.buttonText,sa),na=m("<span class='fc-button fc-button-"+sa+" "+q+"-state-default'><span class='fc-button-inner'><span class='fc-button-content'>"+(ra?"<span class='fc-icon-wrap'><span class='ui-icon ui-icon-"+
ra+"'/></span>":da)+"</span><span class='fc-button-effect'><span></span></span></span></span>");if(na){na.click(function(){na.hasClass(q+"-state-disabled")||ha()}).mousedown(function(){na.not("."+q+"-state-active").not("."+q+"-state-disabled").addClass(q+"-state-down")}).mouseup(function(){na.removeClass(q+"-state-down")}).hover(function(){na.not("."+q+"-state-active").not("."+q+"-state-disabled").addClass(q+"-state-hover")},function(){na.removeClass(q+"-state-hover").removeClass(q+"-state-down")}).appendTo(fa);
ga||na.addClass(q+"-corner-left");ga=na}}}});ga&&ga.addClass(q+"-corner-right")});return fa}function g(u){Q.find("h2").html(u)}function l(u){Q.find("span.fc-button-"+u).addClass(q+"-state-active")}function j(u){Q.find("span.fc-button-"+u).removeClass(q+"-state-active")}function t(u){Q.find("span.fc-button-"+u).addClass(q+"-state-disabled")}function y(u){Q.find("span.fc-button-"+u).removeClass(q+"-state-disabled")}var S=this;S.render=e;S.destroy=d;S.updateTitle=g;S.activateButton=l;S.deactivateButton=
j;S.disableButton=t;S.enableButton=y;var Q=m([]),q}function $b(a,b){function e(c,z){return!ca||c<ca||z>ka}function d(c,z){ca=c;ka=z;L=[];c=++qa;G=z=U.length;for(var H=0;H<z;H++)f(U[H],c)}function f(c,z){g(c,function(H){if(z==qa){if(H){for(var T=0;T<H.length;T++){H[T].source=c;oa(H[T])}L=L.concat(H)}G--;G||ua(L)}})}function g(c,z){var H,T=Aa.sourceFetchers,X;for(H=0;H<T.length;H++){X=T[H](c,ca,ka,z);if(X===true)return;else if(typeof X=="object"){g(X,z);return}}if(H=c.events)if(m.isFunction(H)){u();
H(N(ca),N(ka),function(C){z(C);fa()})}else m.isArray(H)?z(H):z();else if(c.url){var ya=c.success,K=c.error,i=c.complete;H=m.extend({},c.data||{});T=Ta(c.startParam,a.startParam);X=Ta(c.endParam,a.endParam);if(T)H[T]=Math.round(+ca/1E3);if(X)H[X]=Math.round(+ka/1E3);u();m.ajax(m.extend({},ac,c,{data:H,success:function(C){C=C||[];var P=$a(ya,this,arguments);if(m.isArray(P))C=P;z(C)},error:function(){$a(K,this,arguments);z()},complete:function(){$a(i,this,arguments);fa()}}))}else z()}function l(c){if(c=
j(c)){G++;f(c,qa)}}function j(c){if(m.isFunction(c)||m.isArray(c))c={events:c};else if(typeof c=="string")c={url:c};if(typeof c=="object"){ga(c);U.push(c);return c}}function t(c){U=m.grep(U,function(z){return!ra(z,c)});L=m.grep(L,function(z){return!ra(z.source,c)});ua(L)}function y(c){var z,H=L.length,T,X=na().defaultEventEnd,ya=c.start-c._start,K=c.end?c.end-(c._end||X(c)):0;for(z=0;z<H;z++){T=L[z];if(T._id==c._id&&T!=c){T.start=new Date(+T.start+ya);T.end=c.end?T.end?new Date(+T.end+K):new Date(+X(T)+
K):null;T.title=c.title;T.url=c.url;T.allDay=c.allDay;T.className=c.className;T.editable=c.editable;T.color=c.color;T.backgroudColor=c.backgroudColor;T.borderColor=c.borderColor;T.textColor=c.textColor;oa(T)}}oa(c);ua(L)}function S(c,z){oa(c);if(!c.source){if(z){pa.events.push(c);c.source=pa}L.push(c)}ua(L)}function Q(c){if(c){if(!m.isFunction(c)){var z=c+"";c=function(T){return T._id==z}}L=m.grep(L,c,true);for(H=0;H<U.length;H++)if(m.isArray(U[H].events))U[H].events=m.grep(U[H].events,c,true)}else{L=
[];for(var H=0;H<U.length;H++)if(m.isArray(U[H].events))U[H].events=[]}ua(L)}function q(c){if(m.isFunction(c))return m.grep(L,c);else if(c){c+="";return m.grep(L,function(z){return z._id==c})}return L}function u(){p++||da("loading",null,true)}function fa(){--p||da("loading",null,false)}function oa(c){var z=c.source||{},H=Ta(z.ignoreTimezone,a.ignoreTimezone);c._id=c._id||(c.id===ma?"_fc"+bc++:c.id+"");if(c.date){if(!c.start)c.start=c.date;delete c.date}c._start=N(c.start=kb(c.start,H));c.end=kb(c.end,
H);if(c.end&&c.end<=c.start)c.end=null;c._end=c.end?N(c.end):null;if(c.allDay===ma)c.allDay=Ta(z.allDayDefault,a.allDayDefault);if(c.className){if(typeof c.className=="string")c.className=c.className.split(/\s+/)}else c.className=[]}function ga(c){if(c.className){if(typeof c.className=="string")c.className=c.className.split(/\s+/)}else c.className=[];for(var z=Aa.sourceNormalizers,H=0;H<z.length;H++)z[H](c)}function ra(c,z){return c&&z&&sa(c)==sa(z)}function sa(c){return(typeof c=="object"?c.events||
c.url:"")||c}var ha=this;ha.isFetchNeeded=e;ha.fetchEvents=d;ha.addEventSource=l;ha.removeEventSource=t;ha.updateEvent=y;ha.renderEvent=S;ha.removeEvents=Q;ha.clientEvents=q;ha.normalizeEvent=oa;var da=ha.trigger,na=ha.getView,ua=ha.reportEvents,pa={events:[]},U=[pa],ca,ka,qa=0,G=0,p=0,L=[];for(ha=0;ha<b.length;ha++)j(b[ha])}function gb(a,b,e){a.setFullYear(a.getFullYear()+b);e||Ka(a);return a}function hb(a,b,e){if(+a){b=a.getMonth()+b;var d=N(a);d.setDate(1);d.setMonth(b);a.setMonth(b);for(e||Ka(a);a.getMonth()!=
d.getMonth();)a.setDate(a.getDate()+(a<d?1:-1))}return a}function ba(a,b,e){if(+a){b=a.getDate()+b;var d=N(a);d.setHours(9);d.setDate(b);a.setDate(b);e||Ka(a);lb(a,d)}return a}function lb(a,b){if(+a)for(;a.getDate()!=b.getDate();)a.setTime(+a+(a<b?1:-1)*cc)}function xa(a,b){a.setMinutes(a.getMinutes()+b);return a}function Ka(a){a.setHours(0);a.setMinutes(0);a.setSeconds(0);a.setMilliseconds(0);return a}function N(a,b){if(b)return Ka(new Date(+a));return new Date(+a)}function zb(){var a=0,b;do b=new Date(1970,
a++,1);while(b.getHours());return b}function Fa(a,b,e){for(b=b||1;!a.getDay()||e&&a.getDay()==1||!e&&a.getDay()==6;)ba(a,b);return a}function Ca(a,b){return Math.round((N(a,true)-N(b,true))/Ab)}function yb(a,b,e,d){if(b!==ma&&b!=a.getFullYear()){a.setDate(1);a.setMonth(0);a.setFullYear(b)}if(e!==ma&&e!=a.getMonth()){a.setDate(1);a.setMonth(e)}d!==ma&&a.setDate(d)}function kb(a,b){if(typeof a=="object")return a;if(typeof a=="number")return new Date(a*1E3);if(typeof a=="string"){if(a.match(/^\d+(\.\d+)?$/))return new Date(parseFloat(a)*
1E3);if(b===ma)b=true;return Bb(a,b)||(a?new Date(a):null)}return null}function Bb(a,b){a=a.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);if(!a)return null;var e=new Date(a[1],0,1);if(b||!a[13]){b=new Date(a[1],0,1,9,0);if(a[3]){e.setMonth(a[3]-1);b.setMonth(a[3]-1)}if(a[5]){e.setDate(a[5]);b.setDate(a[5])}lb(e,b);a[7]&&e.setHours(a[7]);a[8]&&e.setMinutes(a[8]);a[10]&&e.setSeconds(a[10]);a[12]&&e.setMilliseconds(Number("0."+
a[12])*1E3);lb(e,b)}else{e.setUTCFullYear(a[1],a[3]?a[3]-1:0,a[5]||1);e.setUTCHours(a[7]||0,a[8]||0,a[10]||0,a[12]?Number("0."+a[12])*1E3:0);if(a[14]){b=Number(a[16])*60+(a[18]?Number(a[18]):0);b*=a[15]=="-"?1:-1;e=new Date(+e+b*60*1E3)}}return e}function mb(a){if(typeof a=="number")return a*60;if(typeof a=="object")return a.getHours()*60+a.getMinutes();if(a=a.match(/(\d+)(?::(\d+))?\s*(\w+)?/)){var b=parseInt(a[1],10);if(a[3]){b%=12;if(a[3].toLowerCase().charAt(0)=="p")b+=12}return b*60+(a[2]?parseInt(a[2],
10):0)}}function Oa(a,b,e){return ib(a,null,b,e)}function ib(a,b,e,d){d=d||Ya;var f=a,g=b,l,j=e.length,t,y,S,Q="";for(l=0;l<j;l++){t=e.charAt(l);if(t=="'")for(y=l+1;y<j;y++){if(e.charAt(y)=="'"){if(f){Q+=y==l+1?"'":e.substring(l+1,y);l=y}break}}else if(t=="(")for(y=l+1;y<j;y++){if(e.charAt(y)==")"){l=Oa(f,e.substring(l+1,y),d);if(parseInt(l.replace(/\D/,""),10))Q+=l;l=y;break}}else if(t=="[")for(y=l+1;y<j;y++){if(e.charAt(y)=="]"){t=e.substring(l+1,y);l=Oa(f,t,d);if(l!=Oa(g,t,d))Q+=l;l=y;break}}else if(t==
"{"){f=b;g=a}else if(t=="}"){f=a;g=b}else{for(y=j;y>l;y--)if(S=dc[e.substring(l,y)]){if(f)Q+=S(f,d);l=y-1;break}if(y==l)if(f)Q+=t}}return Q}function Ua(a){return a.end?ec(a.end,a.allDay):ba(N(a.start),1)}function ec(a,b){a=N(a);return b||a.getHours()||a.getMinutes()?ba(a,1):Ka(a)}function fc(a,b){return(b.msLength-a.msLength)*100+(a.event.start-b.event.start)}function Cb(a,b){return a.end>b.start&&a.start<b.end}function nb(a,b,e,d){var f=[],g,l=a.length,j,t,y,S,Q;for(g=0;g<l;g++){j=a[g];t=j.start;
y=b[g];if(y>e&&t<d){if(t<e){t=N(e);S=false}else{t=t;S=true}if(y>d){y=N(d);Q=false}else{y=y;Q=true}f.push({event:j,start:t,end:y,isStart:S,isEnd:Q,msLength:y-t})}}return f.sort(fc)}function ob(a){var b=[],e,d=a.length,f,g,l,j;for(e=0;e<d;e++){f=a[e];for(g=0;;){l=false;if(b[g])for(j=0;j<b[g].length;j++)if(Cb(b[g][j],f)){l=true;break}if(l)g++;else break}if(b[g])b[g].push(f);else b[g]=[f]}return b}function Db(a,b,e){a.unbind("mouseover").mouseover(function(d){for(var f=d.target,g;f!=this;){g=f;f=f.parentNode}if((f=
g._fci)!==ma){g._fci=ma;g=b[f];e(g.event,g.element,g);m(d.target).trigger(d)}d.stopPropagation()})}function Va(a,b,e){for(var d=0,f;d<a.length;d++){f=m(a[d]);f.width(Math.max(0,b-pb(f,e)))}}function Eb(a,b,e){for(var d=0,f;d<a.length;d++){f=m(a[d]);f.height(Math.max(0,b-Sa(f,e)))}}function pb(a,b){return gc(a)+hc(a)+(b?ic(a):0)}function gc(a){return(parseFloat(m.css(a[0],"paddingLeft",true))||0)+(parseFloat(m.css(a[0],"paddingRight",true))||0)}function ic(a){return(parseFloat(m.css(a[0],"marginLeft",
true))||0)+(parseFloat(m.css(a[0],"marginRight",true))||0)}function hc(a){return(parseFloat(m.css(a[0],"borderLeftWidth",true))||0)+(parseFloat(m.css(a[0],"borderRightWidth",true))||0)}function Sa(a,b){return jc(a)+kc(a)+(b?Fb(a):0)}function jc(a){return(parseFloat(m.css(a[0],"paddingTop",true))||0)+(parseFloat(m.css(a[0],"paddingBottom",true))||0)}function Fb(a){return(parseFloat(m.css(a[0],"marginTop",true))||0)+(parseFloat(m.css(a[0],"marginBottom",true))||0)}function kc(a){return(parseFloat(m.css(a[0],
"borderTopWidth",true))||0)+(parseFloat(m.css(a[0],"borderBottomWidth",true))||0)}function Za(a,b){b=typeof b=="number"?b+"px":b;a.each(function(e,d){d.style.cssText+=";min-height:"+b+";_height:"+b})}function xb(){}function Gb(a,b){return a-b}function Hb(a){return Math.max.apply(Math,a)}function Pa(a){return(a<10?"0":"")+a}function jb(a,b){if(a[b]!==ma)return a[b];b=b.split(/(?=[A-Z])/);for(var e=b.length-1,d;e>=0;e--){d=a[b[e].toLowerCase()];if(d!==ma)return d}return a[""]}function Qa(a){return a.replace(/&/g,
"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#039;").replace(/"/g,"&quot;").replace(/\n/g,"<br />")}function Ib(a){return a.id+"/"+a.className+"/"+a.style.cssText.replace(/(^|;)\s*(top|left|width|height)\s*:[^;]*/ig,"")}function qb(a){a.attr("unselectable","on").css("MozUserSelect","none").bind("selectstart.ui",function(){return false})}function ab(a){a.children().removeClass("fc-first fc-last").filter(":first-child").addClass("fc-first").end().filter(":last-child").addClass("fc-last")}
function rb(a,b){a.each(function(e,d){d.className=d.className.replace(/^fc-\w*/,"fc-"+lc[b.getDay()])})}function Jb(a,b){var e=a.source||{},d=a.color,f=e.color,g=b("eventColor"),l=a.backgroundColor||d||e.backgroundColor||f||b("eventBackgroundColor")||g;d=a.borderColor||d||e.borderColor||f||b("eventBorderColor")||g;a=a.textColor||e.textColor||b("eventTextColor");b=[];l&&b.push("background-color:"+l);d&&b.push("border-color:"+d);a&&b.push("color:"+a);return b.join(";")}function $a(a,b,e){if(m.isFunction(a))a=
[a];if(a){var d,f;for(d=0;d<a.length;d++)f=a[d].apply(b,e)||f;return f}}function Ta(){for(var a=0;a<arguments.length;a++)if(arguments[a]!==ma)return arguments[a]}function mc(a,b){function e(j,t){if(t){hb(j,t);j.setDate(1)}j=N(j,true);j.setDate(1);t=hb(N(j),1);var y=N(j),S=N(t),Q=f("firstDay"),q=f("weekends")?0:1;if(q){Fa(y);Fa(S,-1,true)}ba(y,-((y.getDay()-Math.max(Q,q)+7)%7));ba(S,(7-S.getDay()+Math.max(Q,q))%7);Q=Math.round((S-y)/(Ab*7));if(f("weekMode")=="fixed"){ba(S,(6-Q)*7);Q=6}d.title=l(j,
f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(6,Q,q?5:7,true)}var d=this;d.render=e;sb.call(d,a,b,"month");var f=d.opt,g=d.renderBasic,l=b.formatDate}function nc(a,b){function e(j,t){t&&ba(j,t*7);j=ba(N(j),-((j.getDay()-f("firstDay")+7)%7));t=ba(N(j),7);var y=N(j),S=N(t),Q=f("weekends");if(!Q){Fa(y);Fa(S,-1,true)}d.title=l(y,ba(N(S),-1),f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(1,1,Q?7:5,false)}var d=this;d.render=e;sb.call(d,a,b,"basicWeek");var f=d.opt,g=d.renderBasic,
l=b.formatDates}function oc(a,b){function e(j,t){if(t){ba(j,t);f("weekends")||Fa(j,t<0?-1:1)}d.title=l(j,f("titleFormat"));d.start=d.visStart=N(j,true);d.end=d.visEnd=ba(N(d.start),1);g(1,1,1,false)}var d=this;d.render=e;sb.call(d,a,b,"basicDay");var f=d.opt,g=d.renderBasic,l=b.formatDate}function sb(a,b,e){function d(w,I,R,V){v=I;F=R;f();(I=!C)?g(w,V):z();l(I)}function f(){if(k=L("isRTL")){D=-1;Z=F-1}else{D=1;Z=0}ja=L("firstDay");ia=L("weekends")?0:1;la=L("theme")?"ui":"fc";$=L("columnFormat")}function g(w,
I){var R,V=la+"-widget-header",ea=la+"-widget-content",aa;R="<table class='fc-border-separate' style='width:100%' cellspacing='0'><thead><tr>";for(aa=0;aa<F;aa++)R+="<th class='fc- "+V+"'/>";R+="</tr></thead><tbody>";for(aa=0;aa<w;aa++){R+="<tr class='fc-week"+aa+"'>";for(V=0;V<F;V++)R+="<td class='fc- "+ea+" fc-day"+(aa*F+V)+"'><div>"+(I?"<div class='fc-day-number'/>":"")+"<div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></div></td>";R+="</tr>"}R+="</tbody></table>";w=
m(R).appendTo(a);K=w.find("thead");i=K.find("th");C=w.find("tbody");P=C.find("tr");E=C.find("td");B=E.filter(":first-child");n=P.eq(0).find("div.fc-day-content div");ab(K.add(K.find("tr")));ab(P);P.eq(0).addClass("fc-first");y(E);Y=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(a)}function l(w){var I=w||v==1,R=p.start.getMonth(),V=Ka(new Date),ea,aa,va;I&&i.each(function(wa,Ga){ea=m(Ga);aa=ca(wa);ea.html(ya(aa,$));rb(ea,aa)});E.each(function(wa,Ga){ea=m(Ga);aa=ca(wa);aa.getMonth()==
R?ea.removeClass("fc-other-month"):ea.addClass("fc-other-month");+aa==+V?ea.addClass(la+"-state-highlight fc-today"):ea.removeClass(la+"-state-highlight fc-today");ea.find("div.fc-day-number").text(aa.getDate());I&&rb(ea,aa)});P.each(function(wa,Ga){va=m(Ga);if(wa<v){va.show();wa==v-1?va.addClass("fc-last"):va.removeClass("fc-last")}else va.hide()})}function j(w){o=w;w=o-K.height();var I,R,V;if(L("weekMode")=="variable")I=R=Math.floor(w/(v==1?2:6));else{I=Math.floor(w/v);R=w-I*(v-1)}B.each(function(ea,
aa){if(ea<v){V=m(aa);Za(V.find("> div"),(ea==v-1?R:I)-Sa(V))}})}function t(w){W=w;M.clear();s=Math.floor(W/F);Va(i.slice(0,-1),s)}function y(w){w.click(S).mousedown(X)}function S(w){if(!L("selectable")){var I=parseInt(this.className.match(/fc\-day(\d+)/)[1]);I=ca(I);c("dayClick",this,I,true,w)}}function Q(w,I,R){R&&r.build();R=N(p.visStart);for(var V=ba(N(R),F),ea=0;ea<v;ea++){var aa=new Date(Math.max(R,w)),va=new Date(Math.min(V,I));if(aa<va){var wa;if(k){wa=Ca(va,R)*D+Z+1;aa=Ca(aa,R)*D+Z+1}else{wa=
Ca(aa,R);aa=Ca(va,R)}y(q(ea,wa,ea,aa-1))}ba(R,7);ba(V,7)}}function q(w,I,R,V){w=r.rect(w,I,R,V,a);return H(w,a)}function u(w){return N(w)}function fa(w,I){Q(w,ba(N(I),1),true)}function oa(){T()}function ga(w,I,R){var V=ua(w);c("dayClick",E[V.row*F+V.col],w,I,R)}function ra(w,I){J.start(function(R){T();R&&q(R.row,R.col,R.row,R.col)},I)}function sa(w,I,R){var V=J.stop();T();if(V){V=pa(V);c("drop",w,V,true,I,R)}}function ha(w){return N(w.start)}function da(w){return M.left(w)}function na(w){return M.right(w)}
function ua(w){return{row:Math.floor(Ca(w,p.visStart)/7),col:ka(w.getDay())}}function pa(w){return U(w.row,w.col)}function U(w,I){return ba(N(p.visStart),w*7+I*D+Z)}function ca(w){return U(Math.floor(w/F),w%F)}function ka(w){return(w-Math.max(ja,ia)+F)%F*D+Z}function qa(w){return P.eq(w)}function G(){return{left:0,right:W}}var p=this;p.renderBasic=d;p.setHeight=j;p.setWidth=t;p.renderDayOverlay=Q;p.defaultSelectionEnd=u;p.renderSelection=fa;p.clearSelection=oa;p.reportDayClick=ga;p.dragStart=ra;p.dragStop=
sa;p.defaultEventEnd=ha;p.getHoverListener=function(){return J};p.colContentLeft=da;p.colContentRight=na;p.dayOfWeekCol=ka;p.dateCell=ua;p.cellDate=pa;p.cellIsAllDay=function(){return true};p.allDayRow=qa;p.allDayBounds=G;p.getRowCnt=function(){return v};p.getColCnt=function(){return F};p.getColWidth=function(){return s};p.getDaySegmentContainer=function(){return Y};Kb.call(p,a,b,e);Lb.call(p);Mb.call(p);pc.call(p);var L=p.opt,c=p.trigger,z=p.clearEvents,H=p.renderOverlay,T=p.clearOverlays,X=p.daySelectionMousedown,
ya=b.formatDate,K,i,C,P,E,B,n,Y,W,o,s,v,F,r,J,M,k,D,Z,ja,ia,la,$;qb(a.addClass("fc-grid"));r=new Nb(function(w,I){var R,V,ea;i.each(function(aa,va){R=m(va);V=R.offset().left;if(aa)ea[1]=V;ea=[V];I[aa]=ea});ea[1]=V+R.outerWidth();P.each(function(aa,va){if(aa<v){R=m(va);V=R.offset().top;if(aa)ea[1]=V;ea=[V];w[aa]=ea}});ea[1]=V+R.outerHeight()});J=new Ob(r);M=new Pb(function(w){return n.eq(w)})}function pc(){function a(U,ca){S(U);ua(e(U),ca)}function b(){Q();ga().empty()}function e(U){var ca=da(),ka=
na(),qa=N(g.visStart);ka=ba(N(qa),ka);var G=m.map(U,Ua),p,L,c,z,H,T,X=[];for(p=0;p<ca;p++){L=ob(nb(U,G,qa,ka));for(c=0;c<L.length;c++){z=L[c];for(H=0;H<z.length;H++){T=z[H];T.row=p;T.level=c;X.push(T)}}ba(qa,7);ba(ka,7)}return X}function d(U,ca,ka){t(U)&&f(U,ca);ka.isEnd&&y(U)&&pa(U,ca,ka);q(U,ca)}function f(U,ca){var ka=ra(),qa;ca.draggable({zIndex:9,delay:50,opacity:l("dragOpacity"),revertDuration:l("dragRevertDuration"),start:function(G,p){j("eventDragStart",ca,U,G,p);fa(U,ca);ka.start(function(L,
c,z,H){ca.draggable("option","revert",!L||!z&&!H);ha();if(L){qa=z*7+H*(l("isRTL")?-1:1);sa(ba(N(U.start),qa),ba(Ua(U),qa))}else qa=0},G,"drag")},stop:function(G,p){ka.stop();ha();j("eventDragStop",ca,U,G,p);if(qa)oa(this,U,qa,0,U.allDay,G,p);else{ca.css("filter","");u(U,ca)}}})}var g=this;g.renderEvents=a;g.compileDaySegs=e;g.clearEvents=b;g.bindDaySeg=d;Qb.call(g);var l=g.opt,j=g.trigger,t=g.isEventDraggable,y=g.isEventResizable,S=g.reportEvents,Q=g.reportEventClear,q=g.eventElementHandlers,u=g.showEvents,
fa=g.hideEvents,oa=g.eventDrop,ga=g.getDaySegmentContainer,ra=g.getHoverListener,sa=g.renderDayOverlay,ha=g.clearOverlays,da=g.getRowCnt,na=g.getColCnt,ua=g.renderDaySegs,pa=g.resizableDayEvent}function qc(a,b){function e(j,t){t&&ba(j,t*7);j=ba(N(j),-((j.getDay()-f("firstDay")+7)%7));t=ba(N(j),7);var y=N(j),S=N(t),Q=f("weekends");if(!Q){Fa(y);Fa(S,-1,true)}d.title=l(y,ba(N(S),-1),f("titleFormat"));d.start=j;d.end=t;d.visStart=y;d.visEnd=S;g(Q?7:5)}var d=this;d.render=e;Rb.call(d,a,b,"agendaWeek");
var f=d.opt,g=d.renderAgenda,l=b.formatDates}function rc(a,b){function e(j,t){if(t){ba(j,t);f("weekends")||Fa(j,t<0?-1:1)}t=N(j,true);var y=ba(N(t),1);d.title=l(j,f("titleFormat"));d.start=d.visStart=t;d.end=d.visEnd=y;g(1)}var d=this;d.render=e;Rb.call(d,a,b,"agendaDay");var f=d.opt,g=d.renderAgenda,l=b.formatDate}function Rb(a,b,e){function d(h){Ba=h;f();v?P():g();l()}function f(){Wa=i("theme")?"ui":"fc";Sb=i("weekends")?0:1;Tb=i("firstDay");if(Ub=i("isRTL")){Ha=-1;Ia=Ba-1}else{Ha=1;Ia=0}La=mb(i("minTime"));
bb=mb(i("maxTime"));Vb=i("columnFormat")}function g(){var h=Wa+"-widget-header",O=Wa+"-widget-content",x,A,ta,za,Da,Ea=i("slotMinutes")%15==0;x="<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'><thead><tr><th class='fc-agenda-axis "+h+"'>&nbsp;</th>";for(A=0;A<Ba;A++)x+="<th class='fc- fc-col"+A+" "+h+"'/>";x+="<th class='fc-agenda-gutter "+h+"'>&nbsp;</th></tr></thead><tbody><tr><th class='fc-agenda-axis "+h+"'>&nbsp;</th>";for(A=0;A<Ba;A++)x+="<td class='fc- fc-col"+
A+" "+O+"'><div><div class='fc-day-content'><div style='position:relative'>&nbsp;</div></div></div></td>";x+="<td class='fc-agenda-gutter "+O+"'>&nbsp;</td></tr></tbody></table>";v=m(x).appendTo(a);F=v.find("thead");r=F.find("th").slice(1,-1);J=v.find("tbody");M=J.find("td").slice(0,-1);k=M.find("div.fc-day-content div");D=M.eq(0);Z=D.find("> div");ab(F.add(F.find("tr")));ab(J.add(J.find("tr")));aa=F.find("th:first");va=v.find(".fc-agenda-gutter");ja=m("<div style='position:absolute;z-index:2;left:0;width:100%'/>").appendTo(a);
if(i("allDaySlot")){ia=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(ja);x="<table style='width:100%' class='fc-agenda-allday' cellspacing='0'><tr><th class='"+h+" fc-agenda-axis'>"+i("allDayText")+"</th><td><div class='fc-day-content'><div style='position:relative'/></div></td><th class='"+h+" fc-agenda-gutter'>&nbsp;</th></tr></table>";la=m(x).appendTo(ja);$=la.find("tr");q($.find("td"));aa=aa.add(la.find("th:first"));va=va.add(la.find("th.fc-agenda-gutter"));ja.append("<div class='fc-agenda-divider "+
h+"'><div class='fc-agenda-divider-inner'/></div>")}else ia=m([]);w=m("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>").appendTo(ja);I=m("<div style='position:relative;width:100%;overflow:hidden'/>").appendTo(w);R=m("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(I);x="<table class='fc-agenda-slots' style='width:100%' cellspacing='0'><tbody>";ta=zb();za=xa(N(ta),bb);xa(ta,La);for(A=tb=0;ta<za;A++){Da=ta.getMinutes();x+="<tr class='fc-slot"+A+" "+
(!Da?"":"fc-minor")+"'><th class='fc-agenda-axis "+h+"'>"+(!Ea||!Da?s(ta,i("axisFormat")):"&nbsp;")+"</th><td class='"+O+"'><div style='position:relative'>&nbsp;</div></td></tr>";xa(ta,i("slotMinutes"));tb++}x+="</tbody></table>";V=m(x).appendTo(I);ea=V.find("div:first");u(V.find("td"));aa=aa.add(V.find("th:first"))}function l(){var h,O,x,A,ta=Ka(new Date);for(h=0;h<Ba;h++){A=ua(h);O=r.eq(h);O.html(s(A,Vb));x=M.eq(h);+A==+ta?x.addClass(Wa+"-state-highlight fc-today"):x.removeClass(Wa+"-state-highlight fc-today");
rb(O.add(x),A)}}function j(h,O){if(h===ma)h=Wb;Wb=h;ub={};var x=J.position().top,A=w.position().top;h=Math.min(h-x,V.height()+A+1);Z.height(h-Sa(D));ja.css("top",x);w.height(h-A-1);Xa=ea.height()+1;O&&y()}function t(h){Ga=h;cb.clear();Ma=0;Va(aa.width("").each(function(O,x){Ma=Math.max(Ma,m(x).outerWidth())}),Ma);h=w[0].clientWidth;if(vb=w.width()-h){Va(va,vb);va.show().prev().removeClass("fc-last")}else va.hide().prev().addClass("fc-last");db=Math.floor((h-Ma)/Ba);Va(r.slice(0,-1),db)}function y(){function h(){w.scrollTop(A)}
var O=zb(),x=N(O);x.setHours(i("firstHour"));var A=ca(O,x)+1;h();setTimeout(h,0)}function S(){Xb=w.scrollTop()}function Q(){w.scrollTop(Xb)}function q(h){h.click(fa).mousedown(W)}function u(h){h.click(fa).mousedown(H)}function fa(h){if(!i("selectable")){var O=Math.min(Ba-1,Math.floor((h.pageX-v.offset().left-Ma)/db)),x=ua(O),A=this.parentNode.className.match(/fc-slot(\d+)/);if(A){A=parseInt(A[1])*i("slotMinutes");var ta=Math.floor(A/60);x.setHours(ta);x.setMinutes(A%60+La);C("dayClick",M[O],x,false,
h)}else C("dayClick",M[O],x,true,h)}}function oa(h,O,x){x&&Na.build();var A=N(K.visStart);if(Ub){x=Ca(O,A)*Ha+Ia+1;h=Ca(h,A)*Ha+Ia+1}else{x=Ca(h,A);h=Ca(O,A)}x=Math.max(0,x);h=Math.min(Ba,h);x<h&&q(ga(0,x,0,h-1))}function ga(h,O,x,A){h=Na.rect(h,O,x,A,ja);return E(h,ja)}function ra(h,O){for(var x=N(K.visStart),A=ba(N(x),1),ta=0;ta<Ba;ta++){var za=new Date(Math.max(x,h)),Da=new Date(Math.min(A,O));if(za<Da){var Ea=ta*Ha+Ia;Ea=Na.rect(0,Ea,0,Ea,I);za=ca(x,za);Da=ca(x,Da);Ea.top=za;Ea.height=Da-za;u(E(Ea,
I))}ba(x,1);ba(A,1)}}function sa(h){return cb.left(h)}function ha(h){return cb.right(h)}function da(h){return{row:Math.floor(Ca(h,K.visStart)/7),col:U(h.getDay())}}function na(h){var O=ua(h.col);h=h.row;i("allDaySlot")&&h--;h>=0&&xa(O,La+h*i("slotMinutes"));return O}function ua(h){return ba(N(K.visStart),h*Ha+Ia)}function pa(h){return i("allDaySlot")&&!h.row}function U(h){return(h-Math.max(Tb,Sb)+Ba)%Ba*Ha+Ia}function ca(h,O){h=N(h,true);if(O<xa(N(h),La))return 0;if(O>=xa(N(h),bb))return V.height();
h=i("slotMinutes");O=O.getHours()*60+O.getMinutes()-La;var x=Math.floor(O/h),A=ub[x];if(A===ma)A=ub[x]=V.find("tr:eq("+x+") td div")[0].offsetTop;return Math.max(0,Math.round(A-1+Xa*(O%h/h)))}function ka(){return{left:Ma,right:Ga-vb}}function qa(){return $}function G(h){var O=N(h.start);if(h.allDay)return O;return xa(O,i("defaultEventMinutes"))}function p(h,O){if(O)return N(h);return xa(N(h),i("slotMinutes"))}function L(h,O,x){if(x)i("allDaySlot")&&oa(h,ba(N(O),1),true);else c(h,O)}function c(h,O){var x=
i("selectHelper");Na.build();if(x){var A=Ca(h,K.visStart)*Ha+Ia;if(A>=0&&A<Ba){A=Na.rect(0,A,0,A,I);var ta=ca(h,h),za=ca(h,O);if(za>ta){A.top=ta;A.height=za-ta;A.left+=2;A.width-=5;if(m.isFunction(x)){if(h=x(h,O)){A.position="absolute";A.zIndex=8;wa=m(h).css(A).appendTo(I)}}else{A.isStart=true;A.isEnd=true;wa=m(o({title:"",start:h,end:O,className:["fc-select-helper"],editable:false},A));wa.css("opacity",i("dragOpacity"))}if(wa){u(wa);I.append(wa);Va(wa,A.width,true);Eb(wa,A.height,true)}}}}else ra(h,
O)}function z(){B();if(wa){wa.remove();wa=null}}function H(h){if(h.which==1&&i("selectable")){Y(h);var O;Ra.start(function(x,A){z();if(x&&x.col==A.col&&!pa(x)){A=na(A);x=na(x);O=[A,xa(N(A),i("slotMinutes")),x,xa(N(x),i("slotMinutes"))].sort(Gb);c(O[0],O[3])}else O=null},h);m(document).one("mouseup",function(x){Ra.stop();if(O){+O[0]==+O[1]&&T(O[0],false,x);n(O[0],O[3],false,x)}})}}function T(h,O,x){C("dayClick",M[U(h.getDay())],h,O,x)}function X(h,O){Ra.start(function(x){B();if(x)if(pa(x))ga(x.row,
x.col,x.row,x.col);else{x=na(x);var A=xa(N(x),i("defaultEventMinutes"));ra(x,A)}},O)}function ya(h,O,x){var A=Ra.stop();B();A&&C("drop",h,na(A),pa(A),O,x)}var K=this;K.renderAgenda=d;K.setWidth=t;K.setHeight=j;K.beforeHide=S;K.afterShow=Q;K.defaultEventEnd=G;K.timePosition=ca;K.dayOfWeekCol=U;K.dateCell=da;K.cellDate=na;K.cellIsAllDay=pa;K.allDayRow=qa;K.allDayBounds=ka;K.getHoverListener=function(){return Ra};K.colContentLeft=sa;K.colContentRight=ha;K.getDaySegmentContainer=function(){return ia};
K.getSlotSegmentContainer=function(){return R};K.getMinMinute=function(){return La};K.getMaxMinute=function(){return bb};K.getBodyContent=function(){return I};K.getRowCnt=function(){return 1};K.getColCnt=function(){return Ba};K.getColWidth=function(){return db};K.getSlotHeight=function(){return Xa};K.defaultSelectionEnd=p;K.renderDayOverlay=oa;K.renderSelection=L;K.clearSelection=z;K.reportDayClick=T;K.dragStart=X;K.dragStop=ya;Kb.call(K,a,b,e);Lb.call(K);Mb.call(K);sc.call(K);var i=K.opt,C=K.trigger,
P=K.clearEvents,E=K.renderOverlay,B=K.clearOverlays,n=K.reportSelection,Y=K.unselect,W=K.daySelectionMousedown,o=K.slotSegHtml,s=b.formatDate,v,F,r,J,M,k,D,Z,ja,ia,la,$,w,I,R,V,ea,aa,va,wa,Ga,Wb,Ma,db,vb,Xa,Xb,Ba,tb,Na,Ra,cb,ub={},Wa,Tb,Sb,Ub,Ha,Ia,La,bb,Vb;qb(a.addClass("fc-agenda"));Na=new Nb(function(h,O){function x(eb){return Math.max(Ea,Math.min(tc,eb))}var A,ta,za;r.each(function(eb,uc){A=m(uc);ta=A.offset().left;if(eb)za[1]=ta;za=[ta];O[eb]=za});za[1]=ta+A.outerWidth();if(i("allDaySlot")){A=
$;ta=A.offset().top;h[0]=[ta,ta+A.outerHeight()]}for(var Da=I.offset().top,Ea=w.offset().top,tc=Ea+w.outerHeight(),fb=0;fb<tb;fb++)h.push([x(Da+Xa*fb),x(Da+Xa*(fb+1))])});Ra=new Ob(Na);cb=new Pb(function(h){return k.eq(h)})}function sc(){function a(o,s){sa(o);var v,F=o.length,r=[],J=[];for(v=0;v<F;v++)o[v].allDay?r.push(o[v]):J.push(o[v]);if(u("allDaySlot")){L(e(r),s);na()}g(d(J),s)}function b(){ha();ua().empty();pa().empty()}function e(o){o=ob(nb(o,m.map(o,Ua),q.visStart,q.visEnd));var s,v=o.length,
F,r,J,M=[];for(s=0;s<v;s++){F=o[s];for(r=0;r<F.length;r++){J=F[r];J.row=0;J.level=s;M.push(J)}}return M}function d(o){var s=z(),v=ka(),F=ca(),r=xa(N(q.visStart),v),J=m.map(o,f),M,k,D,Z,ja,ia,la=[];for(M=0;M<s;M++){k=ob(nb(o,J,r,xa(N(r),F-v)));vc(k);for(D=0;D<k.length;D++){Z=k[D];for(ja=0;ja<Z.length;ja++){ia=Z[ja];ia.col=M;ia.level=D;la.push(ia)}}ba(r,1,true)}return la}function f(o){return o.end?N(o.end):xa(N(o.start),u("defaultEventMinutes"))}function g(o,s){var v,F=o.length,r,J,M,k,D,Z,ja,ia,la,
$="",w,I,R={},V={},ea=pa(),aa;v=z();if(w=u("isRTL")){I=-1;aa=v-1}else{I=1;aa=0}for(v=0;v<F;v++){r=o[v];J=r.event;M=qa(r.start,r.start);k=qa(r.start,r.end);D=r.col;Z=r.level;ja=r.forward||0;ia=G(D*I+aa);la=p(D*I+aa)-ia;la=Math.min(la-6,la*0.95);D=Z?la/(Z+ja+1):ja?(la/(ja+1)-6)*2:la;Z=ia+la/(Z+ja+1)*Z*I+(w?la-D:0);r.top=M;r.left=Z;r.outerWidth=D;r.outerHeight=k-M;$+=l(J,r)}ea[0].innerHTML=$;w=ea.children();for(v=0;v<F;v++){r=o[v];J=r.event;$=m(w[v]);I=fa("eventRender",J,J,$);if(I===false)$.remove();
else{if(I&&I!==true){$.remove();$=m(I).css({position:"absolute",top:r.top,left:r.left}).appendTo(ea)}r.element=$;if(J._id===s)t(J,$,r);else $[0]._fci=v;ya(J,$)}}Db(ea,o,t);for(v=0;v<F;v++){r=o[v];if($=r.element){J=R[s=r.key=Ib($[0])];r.vsides=J===ma?(R[s]=Sa($,true)):J;J=V[s];r.hsides=J===ma?(V[s]=pb($,true)):J;s=$.find("div.fc-event-content");if(s.length)r.contentTop=s[0].offsetTop}}for(v=0;v<F;v++){r=o[v];if($=r.element){$[0].style.width=Math.max(0,r.outerWidth-r.hsides)+"px";R=Math.max(0,r.outerHeight-
r.vsides);$[0].style.height=R+"px";J=r.event;if(r.contentTop!==ma&&R-r.contentTop<10){$.find("div.fc-event-time").text(Y(J.start,u("timeFormat"))+" - "+J.title);$.find("div.fc-event-title").remove()}fa("eventAfterRender",J,J,$)}}}function l(o,s){var v="<",F=o.url,r=Jb(o,u),J=r?" style='"+r+"'":"",M=["fc-event","fc-event-skin","fc-event-vert"];oa(o)&&M.push("fc-event-draggable");s.isStart&&M.push("fc-corner-top");s.isEnd&&M.push("fc-corner-bottom");M=M.concat(o.className);if(o.source)M=M.concat(o.source.className||
[]);v+=F?"a href='"+Qa(o.url)+"'":"div";v+=" class='"+M.join(" ")+"' style='position:absolute;z-index:8;top:"+s.top+"px;left:"+s.left+"px;"+r+"'><div class='fc-event-inner fc-event-skin'"+J+"><div class='fc-event-head fc-event-skin'"+J+"><div class='fc-event-time'>"+Qa(W(o.start,o.end,u("timeFormat")))+"</div></div><div class='fc-event-content'><div class='fc-event-title'>"+Qa(o.title)+"</div></div><div class='fc-event-bg'></div></div>";if(s.isEnd&&ga(o))v+="<div class='ui-resizable-handle ui-resizable-s'>=</div>";
v+="</"+(F?"a":"div")+">";return v}function j(o,s,v){oa(o)&&y(o,s,v.isStart);v.isEnd&&ga(o)&&c(o,s,v);da(o,s)}function t(o,s,v){var F=s.find("div.fc-event-time");oa(o)&&S(o,s,F);v.isEnd&&ga(o)&&Q(o,s,F);da(o,s)}function y(o,s,v){function F(){if(!M){s.width(r).height("").draggable("option","grid",null);M=true}}var r,J,M=true,k,D=u("isRTL")?-1:1,Z=U(),ja=H(),ia=T(),la=ka();s.draggable({zIndex:9,opacity:u("dragOpacity","month"),revertDuration:u("dragRevertDuration"),start:function($,w){fa("eventDragStart",
s,o,$,w);i(o,s);r=s.width();Z.start(function(I,R,V,ea){B();if(I){J=false;k=ea*D;if(I.row)if(v){if(M){s.width(ja-10);Eb(s,ia*Math.round((o.end?(o.end-o.start)/wc:u("defaultEventMinutes"))/u("slotMinutes")));s.draggable("option","grid",[ja,1]);M=false}}else J=true;else{E(ba(N(o.start),k),ba(Ua(o),k));F()}J=J||M&&!k}else{F();J=true}s.draggable("option","revert",J)},$,"drag")},stop:function($,w){Z.stop();B();fa("eventDragStop",s,o,$,w);if(J){F();s.css("filter","");K(o,s)}else{var I=0;M||(I=Math.round((s.offset().top-
X().offset().top)/ia)*u("slotMinutes")+la-(o.start.getHours()*60+o.start.getMinutes()));C(this,o,k,I,M,$,w)}}})}function S(o,s,v){function F(I){var R=xa(N(o.start),I),V;if(o.end)V=xa(N(o.end),I);v.text(W(R,V,u("timeFormat")))}function r(){if(M){v.css("display","");s.draggable("option","grid",[$,w]);M=false}}var J,M=false,k,D,Z,ja=u("isRTL")?-1:1,ia=U(),la=z(),$=H(),w=T();s.draggable({zIndex:9,scroll:false,grid:[$,w],axis:la==1?"y":false,opacity:u("dragOpacity"),revertDuration:u("dragRevertDuration"),
start:function(I,R){fa("eventDragStart",s,o,I,R);i(o,s);J=s.position();D=Z=0;ia.start(function(V,ea,aa,va){s.draggable("option","revert",!V);B();if(V){k=va*ja;if(u("allDaySlot")&&!V.row){if(!M){M=true;v.hide();s.draggable("option","grid",null)}E(ba(N(o.start),k),ba(Ua(o),k))}else r()}},I,"drag")},drag:function(I,R){D=Math.round((R.position.top-J.top)/w)*u("slotMinutes");if(D!=Z){M||F(D);Z=D}},stop:function(I,R){var V=ia.stop();B();fa("eventDragStop",s,o,I,R);if(V&&(k||D||M))C(this,o,k,M?0:D,M,I,R);
else{r();s.css("filter","");s.css(J);F(0);K(o,s)}}})}function Q(o,s,v){var F,r,J=T();s.resizable({handles:{s:"div.ui-resizable-s"},grid:J,start:function(M,k){F=r=0;i(o,s);s.css("z-index",9);fa("eventResizeStart",this,o,M,k)},resize:function(M,k){F=Math.round((Math.max(J,s.height())-k.originalSize.height)/J);if(F!=r){v.text(W(o.start,!F&&!o.end?null:xa(ra(o),u("slotMinutes")*F),u("timeFormat")));r=F}},stop:function(M,k){fa("eventResizeStop",this,o,M,k);if(F)P(this,o,0,u("slotMinutes")*F,M,k);else{s.css("z-index",
8);K(o,s)}}})}var q=this;q.renderEvents=a;q.compileDaySegs=e;q.clearEvents=b;q.slotSegHtml=l;q.bindDaySeg=j;Qb.call(q);var u=q.opt,fa=q.trigger,oa=q.isEventDraggable,ga=q.isEventResizable,ra=q.eventEnd,sa=q.reportEvents,ha=q.reportEventClear,da=q.eventElementHandlers,na=q.setHeight,ua=q.getDaySegmentContainer,pa=q.getSlotSegmentContainer,U=q.getHoverListener,ca=q.getMaxMinute,ka=q.getMinMinute,qa=q.timePosition,G=q.colContentLeft,p=q.colContentRight,L=q.renderDaySegs,c=q.resizableDayEvent,z=q.getColCnt,
H=q.getColWidth,T=q.getSlotHeight,X=q.getBodyContent,ya=q.reportEventElement,K=q.showEvents,i=q.hideEvents,C=q.eventDrop,P=q.eventResize,E=q.renderDayOverlay,B=q.clearOverlays,n=q.calendar,Y=n.formatDate,W=n.formatDates}function vc(a){var b,e,d,f,g,l;for(b=a.length-1;b>0;b--){f=a[b];for(e=0;e<f.length;e++){g=f[e];for(d=0;d<a[b-1].length;d++){l=a[b-1][d];if(Cb(g,l))l.forward=Math.max(l.forward||0,(g.forward||0)+1)}}}}function Kb(a,b,e){function d(G,p){G=qa[G];if(typeof G=="object")return jb(G,p||e);
return G}function f(G,p){return b.trigger.apply(b,[G,p||da].concat(Array.prototype.slice.call(arguments,2),[da]))}function g(G){return j(G)&&!d("disableDragging")}function l(G){return j(G)&&!d("disableResizing")}function j(G){return Ta(G.editable,(G.source||{}).editable,d("editable"))}function t(G){U={};var p,L=G.length,c;for(p=0;p<L;p++){c=G[p];if(U[c._id])U[c._id].push(c);else U[c._id]=[c]}}function y(G){return G.end?N(G.end):na(G)}function S(G,p){ca.push(p);if(ka[G._id])ka[G._id].push(p);else ka[G._id]=
[p]}function Q(){ca=[];ka={}}function q(G,p){p.click(function(L){if(!p.hasClass("ui-draggable-dragging")&&!p.hasClass("ui-resizable-resizing"))return f("eventClick",this,G,L)}).hover(function(L){f("eventMouseover",this,G,L)},function(L){f("eventMouseout",this,G,L)})}function u(G,p){oa(G,p,"show")}function fa(G,p){oa(G,p,"hide")}function oa(G,p,L){G=ka[G._id];var c,z=G.length;for(c=0;c<z;c++)if(!p||G[c][0]!=p[0])G[c][L]()}function ga(G,p,L,c,z,H,T){var X=p.allDay,ya=p._id;sa(U[ya],L,c,z);f("eventDrop",
G,p,L,c,z,function(){sa(U[ya],-L,-c,X);pa(ya)},H,T);pa(ya)}function ra(G,p,L,c,z,H){var T=p._id;ha(U[T],L,c);f("eventResize",G,p,L,c,function(){ha(U[T],-L,-c);pa(T)},z,H);pa(T)}function sa(G,p,L,c){L=L||0;for(var z,H=G.length,T=0;T<H;T++){z=G[T];if(c!==ma)z.allDay=c;xa(ba(z.start,p,true),L);if(z.end)z.end=xa(ba(z.end,p,true),L);ua(z,qa)}}function ha(G,p,L){L=L||0;for(var c,z=G.length,H=0;H<z;H++){c=G[H];c.end=xa(ba(y(c),p,true),L);ua(c,qa)}}var da=this;da.element=a;da.calendar=b;da.name=e;da.opt=
d;da.trigger=f;da.isEventDraggable=g;da.isEventResizable=l;da.reportEvents=t;da.eventEnd=y;da.reportEventElement=S;da.reportEventClear=Q;da.eventElementHandlers=q;da.showEvents=u;da.hideEvents=fa;da.eventDrop=ga;da.eventResize=ra;var na=da.defaultEventEnd,ua=b.normalizeEvent,pa=b.reportEventChange,U={},ca=[],ka={},qa=b.options}function Qb(){function a(i,C){var P=z(),E=pa(),B=U(),n=0,Y,W,o=i.length,s,v;P[0].innerHTML=e(i);d(i,P.children());f(i);g(i,P,C);l(i);j(i);t(i);C=y();for(P=0;P<E;P++){Y=[];for(W=
0;W<B;W++)Y[W]=0;for(;n<o&&(s=i[n]).row==P;){W=Hb(Y.slice(s.startCol,s.endCol));s.top=W;W+=s.outerHeight;for(v=s.startCol;v<s.endCol;v++)Y[v]=W;n++}C[P].height(Hb(Y))}Q(i,S(C))}function b(i,C,P){var E=m("<div/>"),B=z(),n=i.length,Y;E[0].innerHTML=e(i);E=E.children();B.append(E);d(i,E);l(i);j(i);t(i);Q(i,S(y()));E=[];for(B=0;B<n;B++)if(Y=i[B].element){i[B].row===C&&Y.css("top",P);E.push(Y[0])}return m(E)}function e(i){var C=fa("isRTL"),P,E=i.length,B,n,Y,W;P=ka();var o=P.left,s=P.right,v,F,r,J,M,k=
"";for(P=0;P<E;P++){B=i[P];n=B.event;W=["fc-event","fc-event-skin","fc-event-hori"];ga(n)&&W.push("fc-event-draggable");if(C){B.isStart&&W.push("fc-corner-right");B.isEnd&&W.push("fc-corner-left");v=p(B.end.getDay()-1);F=p(B.start.getDay());r=B.isEnd?qa(v):o;J=B.isStart?G(F):s}else{B.isStart&&W.push("fc-corner-left");B.isEnd&&W.push("fc-corner-right");v=p(B.start.getDay());F=p(B.end.getDay()-1);r=B.isStart?qa(v):o;J=B.isEnd?G(F):s}W=W.concat(n.className);if(n.source)W=W.concat(n.source.className||
[]);Y=n.url;M=Jb(n,fa);k+=Y?"<a href='"+Qa(Y)+"'":"<div";k+=" class='"+W.join(" ")+"' style='position:absolute;z-index:8;left:"+r+"px;"+M+"'><div class='fc-event-inner fc-event-skin'"+(M?" style='"+M+"'":"")+">";if(!n.allDay&&B.isStart)k+="<span class='fc-event-time'>"+Qa(T(n.start,n.end,fa("timeFormat")))+"</span>";k+="<span class='fc-event-title'>"+Qa(n.title)+"</span></div>";if(B.isEnd&&ra(n))k+="<div class='ui-resizable-handle ui-resizable-"+(C?"w":"e")+"'>&nbsp;&nbsp;&nbsp;</div>";k+="</"+(Y?
"a":"div")+">";B.left=r;B.outerWidth=J-r;B.startCol=v;B.endCol=F+1}return k}function d(i,C){var P,E=i.length,B,n,Y;for(P=0;P<E;P++){B=i[P];n=B.event;Y=m(C[P]);n=oa("eventRender",n,n,Y);if(n===false)Y.remove();else{if(n&&n!==true){n=m(n).css({position:"absolute",left:B.left});Y.replaceWith(n);Y=n}B.element=Y}}}function f(i){var C,P=i.length,E,B;for(C=0;C<P;C++){E=i[C];(B=E.element)&&ha(E.event,B)}}function g(i,C,P){var E,B=i.length,n,Y,W;for(E=0;E<B;E++){n=i[E];if(Y=n.element){W=n.event;if(W._id===
P)H(W,Y,n);else Y[0]._fci=E}}Db(C,i,H)}function l(i){var C,P=i.length,E,B,n,Y,W={};for(C=0;C<P;C++){E=i[C];if(B=E.element){n=E.key=Ib(B[0]);Y=W[n];if(Y===ma)Y=W[n]=pb(B,true);E.hsides=Y}}}function j(i){var C,P=i.length,E,B;for(C=0;C<P;C++){E=i[C];if(B=E.element)B[0].style.width=Math.max(0,E.outerWidth-E.hsides)+"px"}}function t(i){var C,P=i.length,E,B,n,Y,W={};for(C=0;C<P;C++){E=i[C];if(B=E.element){n=E.key;Y=W[n];if(Y===ma)Y=W[n]=Fb(B);E.outerHeight=B[0].offsetHeight+Y}}}function y(){var i,C=pa(),
P=[];for(i=0;i<C;i++)P[i]=ca(i).find("td:first div.fc-day-content > div");return P}function S(i){var C,P=i.length,E=[];for(C=0;C<P;C++)E[C]=i[C][0].offsetTop;return E}function Q(i,C){var P,E=i.length,B,n;for(P=0;P<E;P++){B=i[P];if(n=B.element){n[0].style.top=C[B.row]+(B.top||0)+"px";B=B.event;oa("eventAfterRender",B,B,n)}}}function q(i,C,P){var E=fa("isRTL"),B=E?"w":"e",n=C.find("div.ui-resizable-"+B),Y=false;qb(C);C.mousedown(function(W){W.preventDefault()}).click(function(W){if(Y){W.preventDefault();
W.stopImmediatePropagation()}});n.mousedown(function(W){function o(ia){oa("eventResizeStop",this,i,ia);m("body").css("cursor","");s.stop();ya();k&&ua(this,i,k,0,ia);setTimeout(function(){Y=false},0)}if(W.which==1){Y=true;var s=u.getHoverListener(),v=pa(),F=U(),r=E?-1:1,J=E?F-1:0,M=C.css("top"),k,D,Z=m.extend({},i),ja=L(i.start);K();m("body").css("cursor",B+"-resize").one("mouseup",o);oa("eventResizeStart",this,i,W);s.start(function(ia,la){if(ia){var $=Math.max(ja.row,ia.row);ia=ia.col;if(v==1)$=0;
if($==ja.row)ia=E?Math.min(ja.col,ia):Math.max(ja.col,ia);k=$*7+ia*r+J-(la.row*7+la.col*r+J);la=ba(sa(i),k,true);if(k){Z.end=la;$=D;D=b(c([Z]),P.row,M);D.find("*").css("cursor",B+"-resize");$&&$.remove();na(i)}else if(D){da(i);D.remove();D=null}ya();X(i.start,ba(N(la),1))}},W)}})}var u=this;u.renderDaySegs=a;u.resizableDayEvent=q;var fa=u.opt,oa=u.trigger,ga=u.isEventDraggable,ra=u.isEventResizable,sa=u.eventEnd,ha=u.reportEventElement,da=u.showEvents,na=u.hideEvents,ua=u.eventResize,pa=u.getRowCnt,
U=u.getColCnt,ca=u.allDayRow,ka=u.allDayBounds,qa=u.colContentLeft,G=u.colContentRight,p=u.dayOfWeekCol,L=u.dateCell,c=u.compileDaySegs,z=u.getDaySegmentContainer,H=u.bindDaySeg,T=u.calendar.formatDates,X=u.renderDayOverlay,ya=u.clearOverlays,K=u.clearSelection}function Mb(){function a(Q,q,u){b();q||(q=j(Q,u));t(Q,q,u);e(Q,q,u)}function b(Q){if(S){S=false;y();l("unselect",null,Q)}}function e(Q,q,u,fa){S=true;l("select",null,Q,q,u,fa)}function d(Q){var q=f.cellDate,u=f.cellIsAllDay,fa=f.getHoverListener(),
oa=f.reportDayClick;if(Q.which==1&&g("selectable")){b(Q);var ga;fa.start(function(ra,sa){y();if(ra&&u(ra)){ga=[q(sa),q(ra)].sort(Gb);t(ga[0],ga[1],true)}else ga=null},Q);m(document).one("mouseup",function(ra){fa.stop();if(ga){+ga[0]==+ga[1]&&oa(ga[0],true,ra);e(ga[0],ga[1],true,ra)}})}}var f=this;f.select=a;f.unselect=b;f.reportSelection=e;f.daySelectionMousedown=d;var g=f.opt,l=f.trigger,j=f.defaultSelectionEnd,t=f.renderSelection,y=f.clearSelection,S=false;g("selectable")&&g("unselectAuto")&&m(document).mousedown(function(Q){var q=
g("unselectCancel");if(q)if(m(Q.target).parents(q).length)return;b(Q)})}function Lb(){function a(g,l){var j=f.shift();j||(j=m("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>"));j[0].parentNode!=l[0]&&j.appendTo(l);d.push(j.css(g).show());return j}function b(){for(var g;g=d.shift();)f.push(g.hide().unbind())}var e=this;e.renderOverlay=a;e.clearOverlays=b;var d=[],f=[]}function Nb(a){var b=this,e,d;b.build=function(){e=[];d=[];a(e,d)};b.cell=function(f,g){var l=e.length,j=d.length,
t,y=-1,S=-1;for(t=0;t<l;t++)if(g>=e[t][0]&&g<e[t][1]){y=t;break}for(t=0;t<j;t++)if(f>=d[t][0]&&f<d[t][1]){S=t;break}return y>=0&&S>=0?{row:y,col:S}:null};b.rect=function(f,g,l,j,t){t=t.offset();return{top:e[f][0]-t.top,left:d[g][0]-t.left,width:d[j][1]-d[g][0],height:e[l][1]-e[f][0]}}}function Ob(a){function b(j){xc(j);j=a.cell(j.pageX,j.pageY);if(!j!=!l||j&&(j.row!=l.row||j.col!=l.col)){if(j){g||(g=j);f(j,g,j.row-g.row,j.col-g.col)}else f(j,g);l=j}}var e=this,d,f,g,l;e.start=function(j,t,y){f=j;
g=l=null;a.build();b(t);d=y||"mousemove";m(document).bind(d,b)};e.stop=function(){m(document).unbind(d,b);return l}}function xc(a){if(a.pageX===ma){a.pageX=a.originalEvent.pageX;a.pageY=a.originalEvent.pageY}}function Pb(a){function b(l){return d[l]=d[l]||a(l)}var e=this,d={},f={},g={};e.left=function(l){return f[l]=f[l]===ma?b(l).position().left:f[l]};e.right=function(l){return g[l]=g[l]===ma?e.left(l)+b(l).width():g[l]};e.clear=function(){d={};f={};g={}}}var Ya={defaultView:"month",aspectRatio:1.35,
header:{left:"title",center:"",right:"today prev,next"},weekends:true,allDayDefault:true,ignoreTimezone:true,lazyFetching:true,startParam:"start",endParam:"end",titleFormat:{month:"MMMM yyyy",week:"MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",day:"dddd, MMM d, yyyy"},columnFormat:{month:"ddd",week:"ddd M/d",day:"dddd M/d"},timeFormat:{"":"h(:mm)t"},isRTL:false,firstDay:0,monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],monthNamesShort:["Jan",
"Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],buttonText:{prev:"&nbsp;&#9668;&nbsp;",next:"&nbsp;&#9658;&nbsp;",prevYear:"&nbsp;&lt;&lt;&nbsp;",nextYear:"&nbsp;&gt;&gt;&nbsp;",today:"today",month:"month",week:"week",day:"day"},theme:false,buttonIcons:{prev:"circle-triangle-w",next:"circle-triangle-e"},unselectAuto:true,dropAccept:"*"},yc=
{header:{left:"next,prev today",center:"",right:"title"},buttonText:{prev:"&nbsp;&#9658;&nbsp;",next:"&nbsp;&#9668;&nbsp;",prevYear:"&nbsp;&gt;&gt;&nbsp;",nextYear:"&nbsp;&lt;&lt;&nbsp;"},buttonIcons:{prev:"circle-triangle-e",next:"circle-triangle-w"}},Aa=m.fullCalendar={version:"1.5.4"},Ja=Aa.views={};m.fn.fullCalendar=function(a){if(typeof a=="string"){var b=Array.prototype.slice.call(arguments,1),e;this.each(function(){var f=m.data(this,"fullCalendar");if(f&&m.isFunction(f[a])){f=f[a].apply(f,
b);if(e===ma)e=f;a=="destroy"&&m.removeData(this,"fullCalendar")}});if(e!==ma)return e;return this}var d=a.eventSources||[];delete a.eventSources;if(a.events){d.push(a.events);delete a.events}a=m.extend(true,{},Ya,a.isRTL||a.isRTL===ma&&Ya.isRTL?yc:{},a);this.each(function(f,g){f=m(g);g=new Yb(f,a,d);f.data("fullCalendar",g);g.render()});return this};Aa.sourceNormalizers=[];Aa.sourceFetchers=[];var ac={dataType:"json",cache:false},bc=1;Aa.addDays=ba;Aa.cloneDate=N;Aa.parseDate=kb;Aa.parseISO8601=
Bb;Aa.parseTime=mb;Aa.formatDate=Oa;Aa.formatDates=ib;var lc=["sun","mon","tue","wed","thu","fri","sat"],Ab=864E5,cc=36E5,wc=6E4,dc={s:function(a){return a.getSeconds()},ss:function(a){return Pa(a.getSeconds())},m:function(a){return a.getMinutes()},mm:function(a){return Pa(a.getMinutes())},h:function(a){return a.getHours()%12||12},hh:function(a){return Pa(a.getHours()%12||12)},H:function(a){return a.getHours()},HH:function(a){return Pa(a.getHours())},d:function(a){return a.getDate()},dd:function(a){return Pa(a.getDate())},
ddd:function(a,b){return b.dayNamesShort[a.getDay()]},dddd:function(a,b){return b.dayNames[a.getDay()]},M:function(a){return a.getMonth()+1},MM:function(a){return Pa(a.getMonth()+1)},MMM:function(a,b){return b.monthNamesShort[a.getMonth()]},MMMM:function(a,b){return b.monthNames[a.getMonth()]},yy:function(a){return(a.getFullYear()+"").substring(2)},yyyy:function(a){return a.getFullYear()},t:function(a){return a.getHours()<12?"a":"p"},tt:function(a){return a.getHours()<12?"am":"pm"},T:function(a){return a.getHours()<
12?"A":"P"},TT:function(a){return a.getHours()<12?"AM":"PM"},u:function(a){return Oa(a,"yyyy-MM-dd'T'HH:mm:ss'Z'")},S:function(a){a=a.getDate();if(a>10&&a<20)return"th";return["st","nd","rd"][a%10-1]||"th"}};Aa.applyAll=$a;Ja.month=mc;Ja.basicWeek=nc;Ja.basicDay=oc;wb({weekMode:"fixed"});Ja.agendaWeek=qc;Ja.agendaDay=rc;wb({allDaySlot:true,allDayText:"all-day",firstHour:6,slotMinutes:30,defaultEventMinutes:120,axisFormat:"h(:mm)tt",timeFormat:{agenda:"h:mm{ - h:mm}"},dragOpacity:{agenda:0.5},minTime:0,
maxTime:24})})(jQuery);

;
/*
 * iButton jQuery Plug-in
 *
 * Copyright 2011 Giva, Inc. (http://www.givainc.com/labs/) 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * 	http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Date: 2011-07-26
 * Rev:  1.0.03
 */
(function(E){E.iButton={version:"1.0.03",setDefaults:function(G){E.extend(F,G)}};E.fn.iButton=function(J){var K=typeof arguments[0]=="string"&&arguments[0];var I=K&&Array.prototype.slice.call(arguments,1)||arguments;var H=(this.length==0)?null:E.data(this[0],"iButton");if(H&&K&&this.length){if(K.toLowerCase()=="object"){return H}else{if(H[K]){var G;this.each(function(L){var M=E.data(this,"iButton")[K].apply(H,I);if(L==0&&M){if(!!M.jquery){G=E([]).add(M)}else{G=M;return false}}else{if(!!M&&!!M.jquery){G=G.add(M)}}});return G||this}else{return this}}}else{return this.each(function(){new C(this,J)})}};var A=0;E.browser.iphone=(navigator.userAgent.toLowerCase().indexOf("iphone")>-1);var C=function(N,I){var S=this,H=E(N),T=++A,K=false,U={},O={dragging:false,clicked:null},W={position:null,offset:null,time:null},I=E.extend({},F,I,(!!E.metadata?H.metadata():{})),Y=(I.labelOn==B&&I.labelOff==D),Z=":checkbox, :radio";if(!H.is(Z)){return H.find(Z).iButton(I)}else{if(E.data(H[0],"iButton")){return }}E.data(H[0],"iButton",S);if(I.resizeHandle=="auto"){I.resizeHandle=!Y}if(I.resizeContainer=="auto"){I.resizeContainer=!Y}this.toggle=function(b){var a=(arguments.length>0)?b:!H[0].checked;H.attr("checked",a).trigger("change")};this.disable=function(b){var a=(arguments.length>0)?b:!K;K=a;H.attr("disabled",a);V[a?"addClass":"removeClass"](I.classDisabled);if(E.isFunction(I.disable)){I.disable.apply(S,[K,H,I])}};this.repaint=function(){X()};this.destroy=function(){E([H[0],V[0]]).unbind(".iButton");E(document).unbind(".iButton_"+T);V.after(H).remove();E.data(H[0],"iButton",null);if(E.isFunction(I.destroy)){I.destroy.apply(S,[H,I])}};H.wrap('<div class="'+E.trim(I.classContainer+" "+I.className)+'" />').after('<div class="'+I.classHandle+'"><div class="'+I.classHandleRight+'"><div class="'+I.classHandleMiddle+'" /></div></div><div class="'+I.classLabelOff+'"><span><label>'+I.labelOff+'</label></span></div><div class="'+I.classLabelOn+'"><span><label>'+I.labelOn+'</label></span></div><div class="'+I.classPaddingLeft+'"></div><div class="'+I.classPaddingRight+'"></div>');var V=H.parent(),G=H.siblings("."+I.classHandle),P=H.siblings("."+I.classLabelOff),M=P.children("span"),J=H.siblings("."+I.classLabelOn),L=J.children("span");if(I.resizeHandle||I.resizeContainer){U.onspan=L.outerWidth();U.offspan=M.outerWidth()}if(I.resizeHandle){U.handle=Math.min(U.onspan,U.offspan);G.css("width",U.handle)}else{U.handle=G.width()}if(I.resizeContainer){U.container=(Math.max(U.onspan,U.offspan)+U.handle+20);V.css("width",U.container);P.css("width",U.container-5)}else{U.container=V.width()}var R=U.container-U.handle-6;var X=function(b){var c=H[0].checked,a=(c)?R:0,b=(arguments.length>0)?arguments[0]:true;if(b&&I.enableFx){G.stop().animate({left:a},I.duration,I.easing);J.stop().animate({width:a+4},I.duration,I.easing);L.stop().animate({marginLeft:a-R},I.duration,I.easing);M.stop().animate({marginRight:-a},I.duration,I.easing)}else{G.css("left",a);J.css("width",a+4);L.css("marginLeft",a-R);M.css("marginRight",-a)}};X(false);var Q=function(a){return a.pageX||((a.originalEvent.changedTouches)?a.originalEvent.changedTouches[0].pageX:0)};V.bind("mousedown.iButton touchstart.iButton",function(a){if(E(a.target).is(Z)||K||(!I.allowRadioUncheck&&H.is(":radio:checked"))){return }a.preventDefault();O.clicked=G;W.position=Q(a);W.offset=W.position-(parseInt(G.css("left"),10)||0);W.time=(new Date()).getTime();return false});if(I.enableDrag){E(document).bind("mousemove.iButton_"+T+" touchmove.iButton_"+T,function(c){if(O.clicked!=G){return }c.preventDefault();var a=Q(c);if(a!=W.offset){O.dragging=true;V.addClass(I.classHandleActive)}var b=Math.min(1,Math.max(0,(a-W.offset)/R));G.css("left",b*R);J.css("width",b*R+4);M.css("marginRight",-b*R);L.css("marginLeft",-(1-b)*R);return false})}E(document).bind("mouseup.iButton_"+T+" touchend.iButton_"+T,function(d){if(O.clicked!=G){return false}d.preventDefault();var f=true;if(!O.dragging||(((new Date()).getTime()-W.time)<I.clickOffset)){var b=H[0].checked;H.attr("checked",!b);if(E.isFunction(I.click)){I.click.apply(S,[!b,H,I])}}else{var a=Q(d);var c=(a-W.offset)/R;var b=(c>=0.5);if(H[0].checked==b){f=false}H.attr("checked",b)}V.removeClass(I.classHandleActive);O.clicked=null;O.dragging=null;if(f){H.trigger("change")}else{X()}return false});H.bind("change.iButton",function(){X();if(H.is(":radio")){var b=H[0];var a=E(b.form?b.form[b.name]:":radio[name="+b.name+"]");a.filter(":not(:checked)").iButton("repaint")}if(E.isFunction(I.change)){I.change.apply(S,[H,I])}}).bind("focus.iButton",function(){V.addClass(I.classFocus)}).bind("blur.iButton",function(){V.removeClass(I.classFocus)});if(E.isFunction(I.click)){H.bind("click.iButton",function(){I.click.apply(S,[H[0].checked,H,I])})}if(H.is(":disabled")){this.disable(true)}if(E.browser.msie){V.find("*").andSelf().attr("unselectable","on");H.bind("click.iButton",function(){H.triggerHandler("change.iButton")})}if(E.isFunction(I.init)){I.init.apply(S,[H,I])}};var F={duration:200,easing:"swing",labelOn:"ON",labelOff:"OFF",resizeHandle:"auto",resizeContainer:"auto",enableDrag:true,enableFx:true,allowRadioUncheck:false,clickOffset:120,className:"",classContainer:"ibutton-container",classDisabled:"ibutton-disabled",classFocus:"ibutton-focus",classLabelOn:"ibutton-label-on",classLabelOff:"ibutton-label-off",classHandle:"ibutton-handle",classHandleMiddle:"ibutton-handle-middle",classHandleRight:"ibutton-handle-right",classHandleActive:"ibutton-active-handle",classPaddingLeft:"ibutton-padding-left",classPaddingRight:"ibutton-padding-right",init:null,change:null,click:null,disable:null,destroy:null},B=F.labelOn,D=F.labelOff})(jQuery);
;
(function($){$.fn.inputlimiter=function(options){var opts=$.extend({},$.fn.inputlimiter.defaults,options),$elements=$(this);if(opts.boxAttach&&!$('#'+opts.boxId).length){$('<div/>').appendTo("body").attr({id:opts.boxId,'class':opts.boxClass}).css({'position':'absolute'}).hide();if($.fn.bgiframe){$('#'+opts.boxId).bgiframe();}}
var inputlimiterKeyup=function(e){var $this=$(this),count=counter($this.val());if(!opts.allowExceed&&count>opts.limit){$this.val(truncater($this.val()));}
if(opts.boxAttach){$('#'+opts.boxId).css({'width':$this.outerWidth()-($('#'+opts.boxId).outerWidth()-$('#'+opts.boxId).width())+'px','left':$this.offset().left+'px','top':($this.offset().top+$this.outerHeight())-1+'px','z-index':2000});}
var charsRemaining=(opts.limit-count>0?opts.limit-count:0),remText=opts.remTextFilter(opts,charsRemaining),limitText=opts.limitTextFilter(opts);if(opts.limitTextShow){$('#'+opts.boxId).html(remText+' '+limitText);var textWidth=$("<span/>").appendTo("body").attr({id:'19cc9195583bfae1fad88e19d443be7a','class':opts.boxClass}).html(remText+' '+limitText).innerWidth();$("#19cc9195583bfae1fad88e19d443be7a").remove();if(textWidth>$('#'+opts.boxId).innerWidth()){$('#'+opts.boxId).html(remText+'<br />'+limitText);}
$('#'+opts.boxId).show();}else{$('#'+opts.boxId).html(remText).show();}},inputlimiterKeypress=function(e){var count=counter($(this).val());if(!opts.allowExceed&&count>opts.limit){var modifierKeyPressed=e.ctrlKey||e.altKey||e.metaKey;if(!modifierKeyPressed&&(e.which>=32&&e.which<=122)&&this.selectionStart===this.selectionEnd){return false;}}},inputlimiterBlur=function(){var $this=$(this);count=counter($this.val());if(!opts.allowExceed&&count>opts.limit){$this.val(truncater($this.val()));}
if(opts.boxAttach){$('#'+opts.boxId).fadeOut('fast');}else if(opts.remTextHideOnBlur){var limitText=opts.limitText;limitText=limitText.replace(/\%n/g,opts.limit);limitText=limitText.replace(/\%s/g,(opts.limit===1?'':'s'));$('#'+opts.boxId).html(limitText);}},counter=function(value){if(opts.limitBy.toLowerCase()==="words"){return(value.length>0?$.trim(value).replace(/\ +(?= )/g,'').split(' ').length:0);}
return value.length;},truncater=function(value){if(opts.limitBy.toLowerCase()==="words"){return $.trim(value).replace(/\ +(?= )/g,'').split(' ').splice(0,opts.limit).join(' ')+' ';}
return value.substring(0,opts.limit);};$(this).each(function(i){var $this=$(this);if((!options||!options.limit)&&opts.useMaxlength&&parseInt($this.attr('maxlength'))>0&&parseInt($this.attr('maxlength'))!=opts.limit){$this.inputlimiter($.extend({},opts,{limit:parseInt($this.attr('maxlength'))}));}else{if(!opts.allowExceed&&opts.useMaxlength&&opts.limitBy.toLowerCase()==="characters"){$this.attr('maxlength',opts.limit);}
$this.unbind('.inputlimiter');$this.bind('keyup.inputlimiter',inputlimiterKeyup);$this.bind('keypress.inputlimiter',inputlimiterKeypress);$this.bind('blur.inputlimiter',inputlimiterBlur);}});};$.fn.inputlimiter.remtextfilter=function(opts,charsRemaining){var remText=opts.remText;if(charsRemaining===0&&opts.remFullText!==null){remText=opts.remFullText;}
remText=remText.replace(/\%n/g,charsRemaining);remText=remText.replace(/\%s/g,(opts.zeroPlural?(charsRemaining===1?'':'s'):(charsRemaining<=1?'':'s')));return remText;};$.fn.inputlimiter.limittextfilter=function(opts){var limitText=opts.limitText;limitText=limitText.replace(/\%n/g,opts.limit);limitText=limitText.replace(/\%s/g,(opts.limit<=1?'':'s'));return limitText;};$.fn.inputlimiter.defaults={limit:255,boxAttach:true,boxId:'limiterBox',boxClass:'limiterBox',remText:'%n character%s remaining.',remTextFilter:$.fn.inputlimiter.remtextfilter,remTextHideOnBlur:true,remFullText:null,limitTextShow:true,limitText:'Field limited to %n character%s.',limitTextFilter:$.fn.inputlimiter.limittextfilter,zeroPlural:true,allowExceed:false,useMaxlength:true,limitBy:'characters'};})(jQuery);
;
/*! A fix for the iOS orientationchange zoom bug.
 Script by @scottjehl, rebound by @wilto.
 MIT / GPLv2 License.
*/
(function(w){
	
	// This fix addresses an iOS bug, so return early if the UA claims it's something else.
	var ua = navigator.userAgent;
	if( !( /iPhone|iPad|iPod/.test( navigator.platform ) && /OS [1-5]_[0-9_]* like Mac OS X/i.test(ua) && ua.indexOf( "AppleWebKit" ) > -1 ) ){
		return;
	}

    var doc = w.document;

    if( !doc.querySelector ){ return; }

    var meta = doc.querySelector( "meta[name=viewport]" ),
        initialContent = meta && meta.getAttribute( "content" ),
        disabledZoom = initialContent + ",maximum-scale=1",
        enabledZoom = initialContent + ",maximum-scale=10",
        enabled = true,
		x, y, z, aig;

    if( !meta ){ return; }

    function restoreZoom(){
        meta.setAttribute( "content", enabledZoom );
        enabled = true;
    }

    function disableZoom(){
        meta.setAttribute( "content", disabledZoom );
        enabled = false;
    }
	
    function checkTilt( e ){
		aig = e.accelerationIncludingGravity;
		x = Math.abs( aig.x );
		y = Math.abs( aig.y );
		z = Math.abs( aig.z );
				
		// If portrait orientation and in one of the danger zones
        if( (!w.orientation || w.orientation === 180) && ( x > 7 || ( ( z > 6 && y < 8 || z < 8 && y > 6 ) && x > 5 ) ) ){
			if( enabled ){
				disableZoom();
			}        	
        }
		else if( !enabled ){
			restoreZoom();
        }
    }
	
	w.addEventListener( "orientationchange", restoreZoom, false );
	w.addEventListener( "devicemotion", checkTilt, false );

})( this );
;
/*
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2012 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.8.0
 *
 */
(function(a,b){var c=a(b);a.fn.lazyload=function(d){function h(){var b=0;e.each(function(){var c=a(this);if(g.skip_invisible&&!c.is(":visible"))return;if(!a.abovethetop(this,g)&&!a.leftofbegin(this,g))if(!a.belowthefold(this,g)&&!a.rightoffold(this,g))c.trigger("appear");else if(++b>g.failure_limit)return!1})}var e=this,f,g={threshold:0,failure_limit:0,event:"scroll",effect:"show",container:b,data_attribute:"original",skip_invisible:!0,appear:null,load:null};return d&&(undefined!==d.failurelimit&&(d.failure_limit=d.failurelimit,delete d.failurelimit),undefined!==d.effectspeed&&(d.effect_speed=d.effectspeed,delete d.effectspeed),a.extend(g,d)),f=g.container===undefined||g.container===b?c:a(g.container),0===g.event.indexOf("scroll")&&f.bind(g.event,function(a){return h()}),this.each(function(){var b=this,c=a(b);b.loaded=!1,c.one("appear",function(){if(!this.loaded){if(g.appear){var d=e.length;g.appear.call(b,d,g)}a("<img />").bind("load",function(){c.hide().attr("src",c.data(g.data_attribute))[g.effect](g.effect_speed),b.loaded=!0;var d=a.grep(e,function(a){return!a.loaded});e=a(d);if(g.load){var f=e.length;g.load.call(b,f,g)}}).attr("src",c.data(g.data_attribute))}}),0!==g.event.indexOf("scroll")&&c.bind(g.event,function(a){b.loaded||c.trigger("appear")})}),c.bind("resize",function(a){h()}),h(),this},a.belowthefold=function(d,e){var f;return e.container===undefined||e.container===b?f=c.height()+c.scrollTop():f=a(e.container).offset().top+a(e.container).height(),f<=a(d).offset().top-e.threshold},a.rightoffold=function(d,e){var f;return e.container===undefined||e.container===b?f=c.width()+c.scrollLeft():f=a(e.container).offset().left+a(e.container).width(),f<=a(d).offset().left-e.threshold},a.abovethetop=function(d,e){var f;return e.container===undefined||e.container===b?f=c.scrollTop():f=a(e.container).offset().top,f>=a(d).offset().top+e.threshold+a(d).height()},a.leftofbegin=function(d,e){var f;return e.container===undefined||e.container===b?f=c.scrollLeft():f=a(e.container).offset().left,f>=a(d).offset().left+e.threshold+a(d).width()},a.inviewport=function(b,c){return!a.rightofscreen(b,c)&&!a.leftofscreen(b,c)&&!a.belowthefold(b,c)&&!a.abovethetop(b,c)},a.extend(a.expr[":"],{"below-the-fold":function(b){return a.belowthefold(b,{threshold:0})},"above-the-top":function(b){return!a.belowthefold(b,{threshold:0})},"right-of-screen":function(b){return a.rightoffold(b,{threshold:0})},"left-of-screen":function(b){return!a.rightoffold(b,{threshold:0})},"in-viewport":function(b){return!a.inviewport(b,{threshold:0})},"above-the-fold":function(b){return!a.belowthefold(b,{threshold:0})},"right-of-fold":function(b){return a.rightoffold(b,{threshold:0})},"left-of-fold":function(b){return!a.rightoffold(b,{threshold:0})}})})(jQuery,window)

;
/**
 * Knob - jQuery Plugin
 * Downward compatible, touchable dial
 *
 * Version: 1.1.2 (22/05/2012)
 * Requires: jQuery v1.7+
 *
 * Copyright (c) 2011 Anthony Terrien
 * Under MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to vor, eskimoblood, spiffistan
 */
$(function () {

    // Dial logic
    var Dial = function (c, opt) {

        var v = null
            ,ctx = c[0].getContext("2d")
            ,PI2 = 2 * Math.PI
            ,mx ,my ,x ,y
            ,self = this;

        this.onChange = function () {};
        this.onCancel = function () {};
        this.onRelease = function () {};

        this.val = function (nv) {
            if (null != nv) {
                opt.stopper && (nv = Math.max(Math.min(nv, opt.max), opt.min));
                v = nv;
                this.onChange(nv);
                if(opt.dynamicDraw) this.dynamicDraw(nv);
                else this.draw(nv);
            } else {
                var b, a;
                b = a = Math.atan2(mx - x, -(my - y - opt.width / 2)) - opt.angleOffset;
                (a < 0) && (b = a + PI2);
                nv = Math.round(b * (opt.max - opt.min) / PI2) + opt.min;
                return (nv > opt.max) ? opt.max : nv;
            }
        };

        this.change = function (nv) {
            opt.stopper && (nv = Math.max(Math.min(nv, opt.max), opt.min));
            this.onChange(nv);
            this.draw(nv);
        };

        this.angle = function (nv) {
            return (nv - opt.min) * PI2 / (opt.max - opt.min);
        };

        this.draw = function (nv) {

            var a = this.angle(nv)                      // Angle
                ,sa = 1.5 * Math.PI + opt.angleOffset   // Previous start angle
                ,sat = sa                               // Start angle
                ,ea = sa + this.angle(v)                // Previous end angle
                ,eat = sat + a                          // End angle
                ,r = opt.width / 2                      // Radius
                ,lw = r * opt.thickness                 // Line width
                ,cgcolor = Dial.getCgColor(opt.cgColor)
                ,tick
                ;

            ctx.clearRect(0, 0, opt.width, opt.width);
            ctx.lineWidth = lw;

            // Hook draw
            if (opt.draw(a, v, opt, ctx)) { return; }

            for (tick = 0; tick < opt.ticks; tick++) {

                ctx.beginPath();

                if (a > (((2 * Math.PI) / opt.ticks) * tick) && opt.tickColorizeValues) {
                    ctx.strokeStyle = opt.fgColor;
                } else {
                    ctx.strokeStyle = opt.tickColor;
                }

                var tick_sa = (((2 * Math.PI) / opt.ticks) * tick) - (0.5 * Math.PI);
                ctx.arc( r, r, r-lw-opt.tickLength, tick_sa, tick_sa+opt.tickWidth , false);
                ctx.stroke();
            }

            opt.cursor
                && (sa = ea - 0.3)
                && (ea = ea + 0.3)
                && (sat = eat - 0.3)
                && (eat = eat + 0.3);

            switch (opt.skin) {

                case 'default' :

                    ctx.beginPath();
                    ctx.strokeStyle = opt.bgColor;
                    ctx.arc(r, r, r - lw / 2, 0, PI2, true);
                    ctx.stroke();

                    if (opt.displayPrevious) {
                        ctx.beginPath();
                        ctx.strokeStyle = (v == nv) ? opt.fgColor : cgcolor;
                        ctx.arc(r, r, r - lw / 2, sa, ea, false);
                        ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.strokeStyle = opt.fgColor;
                    ctx.arc(r, r, r - lw / 2, sat, eat, false);
                    ctx.stroke();

                    break;

                case 'tron' :

                    if (opt.displayPrevious) {
                        ctx.beginPath();
                        ctx.strokeStyle = (v == nv) ? opt.fgColor : cgcolor;
                        ctx.arc( r, r, r - lw, sa, ea, false);
                        ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.strokeStyle = opt.fgColor;
                    ctx.arc( r, r, r - lw, sat, eat, false);
                    ctx.stroke();

                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.strokeStyle = opt.fgColor;
                    ctx.arc( r, r, r - lw + 1 + lw * 2 / 3, 0, 2 * Math.PI, false);
                    ctx.stroke();

                    break;
            }
        };
        
        var dynamicDrawIndex;
        var dynamicDrawInterval;
        this.dynamicDraw = function (nv) {
        	var instanceOfThis = this;
        	dynamicDrawIndex = opt.min;
        	dynamicDrawInterval = setInterval(function() {
        		instanceOfThis.animateDraw(nv);
            }, 20);
        };
        
        this.animateDraw = function () {
        	if(dynamicDrawIndex > v) {
        		clearInterval(dynamicDrawInterval);
        		v = dynamicDrawIndex;
        	} else {
        		this.draw(dynamicDrawIndex);
        		this.change(dynamicDrawIndex);
        		dynamicDrawIndex++;
        	}
        };

        this.capture = function (e) {
            switch (e.type) {
                case 'mousemove' :
                case 'mousedown' :
                    mx = e.pageX;
                    my = e.pageY;
                    break;
                case 'touchmove' :
                case 'touchstart' :
                    mx = e.originalEvent.touches[0].pageX;
                    my = e.originalEvent.touches[0].pageY;
                    break;
            }
            this.change( this.val() );
        };

        this.cancel = function () {
            self.val(v);
            self.onCancel();
        };

        this.startDrag = function (e) {

            var p = c.offset()
                ,$doc = $(document);

            x = p.left + (opt.width / 2);
            y = p.top;

            this.capture(e);

            // Listen mouse and touch events
            $doc.bind(
                    "mousemove.dial touchmove.dial"
                    ,function (e) {
                        self.capture(e);
                    }
                )
                .bind(
                    // Escape
                    "keyup.dial"
                    ,function (e) {
                        if(e.keyCode === 27) {
                            $doc.unbind("mouseup.dial mousemove.dial keyup.dial");
                            self.cancel();
                        }
                    }
                )
                .bind(
                    "mouseup.dial touchend.dial"
                    ,function (e) {
                        $doc.unbind('mousemove.dial touchmove.dial mouseup.dial touchend.dial keyup.dial');
                        self.val(self.val());
                        self.onRelease(v);
                    }
                );
        };
    };

    // Dial static func
    Dial.getCgColor = function (h) {
        h = h.substring(1,7);
        var rgb = [parseInt(h.substring(0,2),16)
                   ,parseInt(h.substring(2,4),16)
                   ,parseInt(h.substring(4,6),16)];
        return "rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+",.5)";
    };

    // jQuery plugin
    $.fn.knob = $.fn.dial = function (gopt) {

        return this.each(

            function () {

                var $this = $(this), opt;

                if ($this.data('dialed')) { return $this; }
                $this.data('dialed', true);

                opt = $.extend(
                    {
                        // Config
                        'min' : $this.data('min') || 0
                        ,'max' : $this.data('max') || 100
                        ,'stopper' : true
                        ,'readOnly' : $this.data('readonly')

                        // UI
                        ,'cursor' : $this.data('cursor')
                        ,'thickness' : $this.data('thickness') || 0.35
                        ,'width' : $this.data('width') || 200
                        ,'displayInput' : $this.data('displayinput') == null || $this.data('displayinput')
                        ,'displayPrevious' : $this.data('displayprevious')
                        ,'fgColor' : $this.data('fgcolor') || '#87CEEB'
                        ,'cgColor' : $this.data('cgcolor') || $this.data('fgcolor') || '#87CEEB'
                        ,'bgColor' : $this.data('bgcolor') || '#EEEEEE'
                        ,'tickColor' : $this.data('tickColor') || $this.data('fgcolor') || '#DDDDDD'
                        ,'ticks' : $this.data('ticks') || 0
                        ,'tickLength' : $this.data('tickLength') || 0
                        ,'tickWidth' : $this.data('tickWidth') || 0.02
                        ,'tickColorizeValues' : $this.data('tickColorizeValues') || true
                        ,'skin' : $this.data('skin') || 'default'
                        ,'angleOffset': degreeToRadians($this.data('angleoffset'))
                        ,'dynamicDraw': $this.data('dynamicdraw') || false

                        // Hooks
                        ,'draw' :
                                /**
                                 * @param int a angle
                                 * @param int v current value
                                 * @param array opt plugin options
                                 * @param context ctx Canvas context 2d
                                 * @return bool true:bypass default draw methode
                                 */
                                function (a, v, opt, ctx) {}
                        ,'change' :
                                /**
                                 * @param int v Current value
                                 */
                                function (v) {}
                        ,'release' :
                                /**
                                 * @param int v Current value
                                 * @param jQuery ipt Input
                                 */
                                function (v, ipt) {}
                    }
                    ,gopt
                );

                var c = $('<canvas width="' + opt.width + '" height="' + opt.width + '"></canvas>')
                    ,wd = $('<div style=width:' + opt.width + 'px;display:inline;"></div>')
                    ,k
                    ,vl = $this.val()
                    ,initStyle = function () {
                        opt.displayInput
                        && $this.css({
                                    'width' : opt.width / 2 + 'px'
                                    ,'position' : 'absolute'
                                    ,'margin-top' : (opt.width * 5 / 14) + 'px'
                                    ,'margin-left' : '-' + (opt.width * 3 / 4) + 'px'
                                    ,'font-size' : (opt.width / 4) + 'px'
                                    ,'border' : 'none'
                                    ,'background' : 'none'
                                    ,'font-family' : 'Arial'
                                    ,'font-weight' : 'bold'
                                    ,'text-align' : 'center'
                                    ,'color' : opt.fgColor
                                    ,'padding' : '0px'
                                    ,'-webkit-appearance': 'none'
                                    })
                        || $this.css({
                                    'width' : '0px'
                                    ,'visibility' : 'hidden'
                                    });
                    };

                // Canvas insert
                $this.wrap(wd).before(c);

                initStyle();

                // Invoke dial logic
                k = new Dial(c, opt);
                vl || (vl = opt.min);
                $this.val(vl);
                k.val(vl);

                k.onRelease = function (v) {
                                            opt.release(v, $this);
                                        };
                k.onChange = function (v) {
                                            $this.val(v);
                                            opt.change(v);
                                         };

                // bind change on input
                $this.bind(
                        'change'
                        ,function (e) {
                            k.val($this.val());
                        }
                    );

                if (!opt.readOnly) {

                    // canvas
                    c.bind(
                                    "mousedown touchstart"
                                    ,function (e) {
                                        e.preventDefault();
                                        k.startDrag(e);
                                    }
                          )
                     .bind(
                                    "mousewheel DOMMouseScroll"
                                    ,mw = function (e) {
                                        e.preventDefault();
                                        var ori = e.originalEvent
                                            ,deltaX = ori.detail || ori.wheelDeltaX
                                            ,deltaY = ori.detail || ori.wheelDeltaY
                                            ,val = parseInt($this.val()) + (deltaX>0 || deltaY>0 ? 1 : deltaX<0 || deltaY<0 ? -1 : 0);
                                        k.val(val);
                                    }
                        );

                    // input
                    var kval, val, to, m = 1, kv = {37:-1, 38:1, 39:1, 40:-1};
                    $this
                        .bind(
                                    "configure"
                                    ,function (e, aconf) {
                                        var kconf;
                                        for (kconf in aconf) { opt[kconf] = aconf[kconf]; }
                                        initStyle();
                                        k.val($this.val());
                                    }
                            )
                        .bind(
                                    "keydown"
                                    ,function (e) {
                                        var kc = e.keyCode;
                                        if (kc >= 96 && kc <= 105) kc -= 48; //numpad
                                        kval = parseInt(String.fromCharCode(kc));

                                        if (isNaN(kval)) {

                                            (kc !== 13)      // enter
                                            && (kc !== 8)    // bs
                                            && (kc !== 9)    // tab
                                            && (kc !== 189)  // -
                                            && e.preventDefault();

                                            // arrows
                                            if ($.inArray(kc,[37,38,39,40]) > -1) {
                                                k.change(parseInt($this.val()) + kv[kc] * m);

                                                // long time keydown speed-up
                                                to = window.setTimeout(
                                                        function () { m < 20 && m++; }
                                                        ,50
                                                        );

                                                e.preventDefault();
                                            }
                                        }
                                    }
                                )
                          .bind(
                                    "keyup"
                                    ,function(e) {
                                        if (isNaN(kval)) {
                                            if (to) {
                                                window.clearTimeout(to);
                                                to = null;
                                                m = 1;
                                                k.val($this.val());
                                                k.onRelease($this.val(), $this);
                                            } else {
                                                // enter
                                                (e.keyCode === 13)
                                                && k.onRelease($this.val(), $this);
                                            }
                                        } else {
                                            // kval postcond
                                            ($this.val() > opt.max && $this.val(opt.max))
                                            || ($this.val() < opt.min && $this.val(opt.min));
                                        }

                                    }
                                )
                           .bind(
                                    "mousewheel DOMMouseScroll"
                                    ,mw
                                );
                } else {
                    $this.attr('readonly', 'readonly');
                }
            }
        ).parent();
    };

    function degreeToRadians (angle) {
            return $.isNumeric(angle) ? angle * Math.PI / 180 : 0;
    }
});
;
/*
	Masked Input plugin for jQuery
	Copyright (c) 2007-2011 Josh Bush (digitalbush.com)
	Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license) 
	Version: 1.3
*/
(function(a){var b=(a.browser.msie?"paste":"input")+".mask",c=window.orientation!=undefined;a.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},dataName:"rawMaskFn"},a.fn.extend({caret:function(a,b){if(this.length!=0){if(typeof a=="number"){b=typeof b=="number"?b:a;return this.each(function(){if(this.setSelectionRange)this.setSelectionRange(a,b);else if(this.createTextRange){var c=this.createTextRange();c.collapse(!0),c.moveEnd("character",b),c.moveStart("character",a),c.select()}})}if(this[0].setSelectionRange)a=this[0].selectionStart,b=this[0].selectionEnd;else if(document.selection&&document.selection.createRange){var c=document.selection.createRange();a=0-c.duplicate().moveStart("character",-1e5),b=a+c.text.length}return{begin:a,end:b}}},unmask:function(){return this.trigger("unmask")},mask:function(d,e){if(!d&&this.length>0){var f=a(this[0]);return f.data(a.mask.dataName)()}e=a.extend({placeholder:"_",completed:null},e);var g=a.mask.definitions,h=[],i=d.length,j=null,k=d.length;a.each(d.split(""),function(a,b){b=="?"?(k--,i=a):g[b]?(h.push(new RegExp(g[b])),j==null&&(j=h.length-1)):h.push(null)});return this.trigger("unmask").each(function(){function v(a){var b=f.val(),c=-1;for(var d=0,g=0;d<k;d++)if(h[d]){l[d]=e.placeholder;while(g++<b.length){var m=b.charAt(g-1);if(h[d].test(m)){l[d]=m,c=d;break}}if(g>b.length)break}else l[d]==b.charAt(g)&&d!=i&&(g++,c=d);if(!a&&c+1<i)f.val(""),t(0,k);else if(a||c+1>=i)u(),a||f.val(f.val().substring(0,c+1));return i?d:j}function u(){return f.val(l.join("")).val()}function t(a,b){for(var c=a;c<b&&c<k;c++)h[c]&&(l[c]=e.placeholder)}function s(a){var b=a.which,c=f.caret();if(a.ctrlKey||a.altKey||a.metaKey||b<32)return!0;if(b){c.end-c.begin!=0&&(t(c.begin,c.end),p(c.begin,c.end-1));var d=n(c.begin-1);if(d<k){var g=String.fromCharCode(b);if(h[d].test(g)){q(d),l[d]=g,u();var i=n(d);f.caret(i),e.completed&&i>=k&&e.completed.call(f)}}return!1}}function r(a){var b=a.which;if(b==8||b==46||c&&b==127){var d=f.caret(),e=d.begin,g=d.end;g-e==0&&(e=b!=46?o(e):g=n(e-1),g=b==46?n(g):g),t(e,g),p(e,g-1);return!1}if(b==27){f.val(m),f.caret(0,v());return!1}}function q(a){for(var b=a,c=e.placeholder;b<k;b++)if(h[b]){var d=n(b),f=l[b];l[b]=c;if(d<k&&h[d].test(f))c=f;else break}}function p(a,b){if(!(a<0)){for(var c=a,d=n(b);c<k;c++)if(h[c]){if(d<k&&h[c].test(l[d]))l[c]=l[d],l[d]=e.placeholder;else break;d=n(d)}u(),f.caret(Math.max(j,a))}}function o(a){while(--a>=0&&!h[a]);return a}function n(a){while(++a<=k&&!h[a]);return a}var f=a(this),l=a.map(d.split(""),function(a,b){if(a!="?")return g[a]?e.placeholder:a}),m=f.val();f.data(a.mask.dataName,function(){return a.map(l,function(a,b){return h[b]&&a!=e.placeholder?a:null}).join("")}),f.attr("readonly")||f.one("unmask",function(){f.unbind(".mask").removeData(a.mask.dataName)}).bind("focus.mask",function(){m=f.val();var b=v();u();var c=function(){b==d.length?f.caret(0,b):f.caret(b)};(a.browser.msie?c:function(){setTimeout(c,0)})()}).bind("blur.mask",function(){v(),f.val()!=m&&f.change()}).bind("keydown.mask",r).bind("keypress.mask",s).bind(b,function(){setTimeout(function(){f.caret(v(!0))},0)}),v()})}})})(jQuery)
;
/*1.5.4*/
(function(){var f=0,k=[],m={},i={},a={"<":"lt",">":"gt","&":"amp",'"':"quot","'":"#39"},l=/[<>&\"\']/g,b,c=window.setTimeout,d={},e;function h(){this.returnValue=false}function j(){this.cancelBubble=true}(function(n){var o=n.split(/,/),p,r,q;for(p=0;p<o.length;p+=2){q=o[p+1].split(/ /);for(r=0;r<q.length;r++){i[q[r]]=o[p]}}})("application/msword,doc dot,application/pdf,pdf,application/pgp-signature,pgp,application/postscript,ps ai eps,application/rtf,rtf,application/vnd.ms-excel,xls xlb,application/vnd.ms-powerpoint,ppt pps pot,application/zip,zip,application/x-shockwave-flash,swf swfl,application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx,application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx,application/vnd.openxmlformats-officedocument.presentationml.template,potx,application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx,application/x-javascript,js,application/json,json,audio/mpeg,mpga mpega mp2 mp3,audio/x-wav,wav,audio/mp4,m4a,image/bmp,bmp,image/gif,gif,image/jpeg,jpeg jpg jpe,image/photoshop,psd,image/png,png,image/svg+xml,svg svgz,image/tiff,tiff tif,text/plain,asc txt text diff log,text/html,htm html xhtml,text/css,css,text/csv,csv,text/rtf,rtf,video/mpeg,mpeg mpg mpe,video/quicktime,qt mov,video/mp4,mp4,video/x-m4v,m4v,video/x-flv,flv,video/x-ms-wmv,wmv,video/avi,avi,video/webm,webm,video/vnd.rn-realvideo,rv,application/vnd.oasis.opendocument.formula-template,otf,application/octet-stream,exe");var g={VERSION:"1.5.4",STOPPED:1,STARTED:2,QUEUED:1,UPLOADING:2,FAILED:4,DONE:5,GENERIC_ERROR:-100,HTTP_ERROR:-200,IO_ERROR:-300,SECURITY_ERROR:-400,INIT_ERROR:-500,FILE_SIZE_ERROR:-600,FILE_EXTENSION_ERROR:-601,IMAGE_FORMAT_ERROR:-700,IMAGE_MEMORY_ERROR:-701,IMAGE_DIMENSIONS_ERROR:-702,mimeTypes:i,ua:(function(){var r=navigator,q=r.userAgent,s=r.vendor,o,n,p;o=/WebKit/.test(q);p=o&&s.indexOf("Apple")!==-1;n=window.opera&&window.opera.buildNumber;return{windows:navigator.platform.indexOf("Win")!==-1,ie:!o&&!n&&(/MSIE/gi).test(q)&&(/Explorer/gi).test(r.appName),webkit:o,gecko:!o&&/Gecko/.test(q),safari:p,opera:!!n}}()),typeOf:function(n){return({}).toString.call(n).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()},extend:function(n){g.each(arguments,function(o,p){if(p>0){g.each(o,function(r,q){n[q]=r})}});return n},cleanName:function(n){var o,p;p=[/[\300-\306]/g,"A",/[\340-\346]/g,"a",/\307/g,"C",/\347/g,"c",/[\310-\313]/g,"E",/[\350-\353]/g,"e",/[\314-\317]/g,"I",/[\354-\357]/g,"i",/\321/g,"N",/\361/g,"n",/[\322-\330]/g,"O",/[\362-\370]/g,"o",/[\331-\334]/g,"U",/[\371-\374]/g,"u"];for(o=0;o<p.length;o+=2){n=n.replace(p[o],p[o+1])}n=n.replace(/\s+/g,"_");n=n.replace(/[^a-z0-9_\-\.]+/gi,"");return n},addRuntime:function(n,o){o.name=n;k[n]=o;k.push(o);return o},guid:function(){var n=new Date().getTime().toString(32),o;for(o=0;o<5;o++){n+=Math.floor(Math.random()*65535).toString(32)}return(g.guidPrefix||"p")+n+(f++).toString(32)},buildUrl:function(o,n){var p="";g.each(n,function(r,q){p+=(p?"&":"")+encodeURIComponent(q)+"="+encodeURIComponent(r)});if(p){o+=(o.indexOf("?")>0?"&":"?")+p}return o},each:function(q,r){var p,o,n;if(q){p=q.length;if(p===b){for(o in q){if(q.hasOwnProperty(o)){if(r(q[o],o)===false){return}}}}else{for(n=0;n<p;n++){if(r(q[n],n)===false){return}}}}},formatSize:function(n){if(n===b||/\D/.test(n)){return g.translate("N/A")}if(n>1073741824){return Math.round(n/1073741824,1)+" GB"}if(n>1048576){return Math.round(n/1048576,1)+" MB"}if(n>1024){return Math.round(n/1024,1)+" KB"}return n+" b"},getPos:function(o,s){var t=0,r=0,v,u=document,p,q;o=o;s=s||u.body;function n(B){var z,A,w=0,C=0;if(B){A=B.getBoundingClientRect();z=u.compatMode==="CSS1Compat"?u.documentElement:u.body;w=A.left+z.scrollLeft;C=A.top+z.scrollTop}return{x:w,y:C}}if(o&&o.getBoundingClientRect&&((navigator.userAgent.indexOf("MSIE")>0)&&(u.documentMode<8))){p=n(o);q=n(s);return{x:p.x-q.x,y:p.y-q.y}}v=o;while(v&&v!=s&&v.nodeType){t+=v.offsetLeft||0;r+=v.offsetTop||0;v=v.offsetParent}v=o.parentNode;while(v&&v!=s&&v.nodeType){t-=v.scrollLeft||0;r-=v.scrollTop||0;v=v.parentNode}return{x:t,y:r}},getSize:function(n){return{w:n.offsetWidth||n.clientWidth,h:n.offsetHeight||n.clientHeight}},parseSize:function(n){var o;if(typeof(n)=="string"){n=/^([0-9]+)([mgk]?)$/.exec(n.toLowerCase().replace(/[^0-9mkg]/g,""));o=n[2];n=+n[1];if(o=="g"){n*=1073741824}if(o=="m"){n*=1048576}if(o=="k"){n*=1024}}return n},xmlEncode:function(n){return n?(""+n).replace(l,function(o){return a[o]?"&"+a[o]+";":o}):n},toArray:function(p){var o,n=[];for(o=0;o<p.length;o++){n[o]=p[o]}return n},inArray:function(p,q){if(q){if(Array.prototype.indexOf){return Array.prototype.indexOf.call(q,p)}for(var n=0,o=q.length;n<o;n++){if(q[n]===p){return n}}}return -1},addI18n:function(n){return g.extend(m,n)},translate:function(n){return m[n]||n},isEmptyObj:function(n){if(n===b){return true}for(var o in n){return false}return true},hasClass:function(p,o){var n;if(p.className==""){return false}n=new RegExp("(^|\\s+)"+o+"(\\s+|$)");return n.test(p.className)},addClass:function(o,n){if(!g.hasClass(o,n)){o.className=o.className==""?n:o.className.replace(/\s+$/,"")+" "+n}},removeClass:function(p,o){var n=new RegExp("(^|\\s+)"+o+"(\\s+|$)");p.className=p.className.replace(n,function(r,q,s){return q===" "&&s===" "?" ":""})},getStyle:function(o,n){if(o.currentStyle){return o.currentStyle[n]}else{if(window.getComputedStyle){return window.getComputedStyle(o,null)[n]}}},addEvent:function(s,n,t){var r,q,p,o;o=arguments[3];n=n.toLowerCase();if(e===b){e="Plupload_"+g.guid()}if(s.addEventListener){r=t;s.addEventListener(n,r,false)}else{if(s.attachEvent){r=function(){var u=window.event;if(!u.target){u.target=u.srcElement}u.preventDefault=h;u.stopPropagation=j;t(u)};s.attachEvent("on"+n,r)}}if(s[e]===b){s[e]=g.guid()}if(!d.hasOwnProperty(s[e])){d[s[e]]={}}q=d[s[e]];if(!q.hasOwnProperty(n)){q[n]=[]}q[n].push({func:r,orig:t,key:o})},removeEvent:function(s,n){var q,t,p;if(typeof(arguments[2])=="function"){t=arguments[2]}else{p=arguments[2]}n=n.toLowerCase();if(s[e]&&d[s[e]]&&d[s[e]][n]){q=d[s[e]][n]}else{return}for(var o=q.length-1;o>=0;o--){if(q[o].key===p||q[o].orig===t){if(s.removeEventListener){s.removeEventListener(n,q[o].func,false)}else{if(s.detachEvent){s.detachEvent("on"+n,q[o].func)}}q[o].orig=null;q[o].func=null;q.splice(o,1);if(t!==b){break}}}if(!q.length){delete d[s[e]][n]}if(g.isEmptyObj(d[s[e]])){delete d[s[e]];try{delete s[e]}catch(r){s[e]=b}}},removeAllEvents:function(o){var n=arguments[1];if(o[e]===b||!o[e]){return}g.each(d[o[e]],function(q,p){g.removeEvent(o,p,n)})}};g.Uploader=function(r){var o={},u,t=[],q,p=false;u=new g.QueueProgress();r=g.extend({chunk_size:0,multipart:true,multi_selection:true,file_data_name:"file",filters:[]},r);function s(){var w,x=0,v;if(this.state==g.STARTED){for(v=0;v<t.length;v++){if(!w&&t[v].status==g.QUEUED){w=t[v];w.status=g.UPLOADING;if(this.trigger("BeforeUpload",w)){this.trigger("UploadFile",w)}}else{x++}}if(x==t.length){this.stop();this.trigger("UploadComplete",t)}}}function n(){var w,v;u.reset();for(w=0;w<t.length;w++){v=t[w];if(v.size!==b){u.size+=v.size;u.loaded+=v.loaded}else{u.size=b}if(v.status==g.DONE){u.uploaded++}else{if(v.status==g.FAILED){u.failed++}else{u.queued++}}}if(u.size===b){u.percent=t.length>0?Math.ceil(u.uploaded/t.length*100):0}else{u.bytesPerSec=Math.ceil(u.loaded/((+new Date()-q||1)/1000));u.percent=u.size>0?Math.ceil(u.loaded/u.size*100):0}}g.extend(this,{state:g.STOPPED,runtime:"",features:{},files:t,settings:r,total:u,id:g.guid(),init:function(){var A=this,B,x,w,z=0,y;if(typeof(r.preinit)=="function"){r.preinit(A)}else{g.each(r.preinit,function(D,C){A.bind(C,D)})}r.page_url=r.page_url||document.location.pathname.replace(/\/[^\/]+$/g,"/");if(!/^(\w+:\/\/|\/)/.test(r.url)){r.url=r.page_url+r.url}r.chunk_size=g.parseSize(r.chunk_size);r.max_file_size=g.parseSize(r.max_file_size);A.bind("FilesAdded",function(C,F){var E,D,H=0,I,G=r.filters;if(G&&G.length){I=[];g.each(G,function(J){g.each(J.extensions.split(/,/),function(K){if(/^\s*\*\s*$/.test(K)){I.push("\\.*")}else{I.push("\\."+K.replace(new RegExp("["+("/^$.*+?|()[]{}\\".replace(/./g,"\\$&"))+"]","g"),"\\$&"))}})});I=new RegExp(I.join("|")+"$","i")}for(E=0;E<F.length;E++){D=F[E];D.loaded=0;D.percent=0;D.status=g.QUEUED;if(I&&!I.test(D.name)){C.trigger("Error",{code:g.FILE_EXTENSION_ERROR,message:g.translate("File extension error."),file:D});continue}if(D.size!==b&&D.size>r.max_file_size){C.trigger("Error",{code:g.FILE_SIZE_ERROR,message:g.translate("File size error."),file:D});continue}t.push(D);H++}if(H){c(function(){A.trigger("QueueChanged");A.refresh()},1)}else{return false}});if(r.unique_names){A.bind("UploadFile",function(C,D){var F=D.name.match(/\.([^.]+)$/),E="tmp";if(F){E=F[1]}D.target_name=D.id+"."+E})}A.bind("UploadProgress",function(C,D){D.percent=D.size>0?Math.ceil(D.loaded/D.size*100):100;n()});A.bind("StateChanged",function(C){if(C.state==g.STARTED){q=(+new Date())}else{if(C.state==g.STOPPED){for(B=C.files.length-1;B>=0;B--){if(C.files[B].status==g.UPLOADING){C.files[B].status=g.QUEUED;n()}}}}});A.bind("QueueChanged",n);A.bind("Error",function(C,D){if(D.file){D.file.status=g.FAILED;n();if(C.state==g.STARTED){c(function(){s.call(A)},1)}}});A.bind("FileUploaded",function(C,D){D.status=g.DONE;D.loaded=D.size;C.trigger("UploadProgress",D);c(function(){s.call(A)},1)});if(r.runtimes){x=[];y=r.runtimes.split(/\s?,\s?/);for(B=0;B<y.length;B++){if(k[y[B]]){x.push(k[y[B]])}}}else{x=k}function v(){var F=x[z++],E,C,D;if(F){E=F.getFeatures();C=A.settings.required_features;if(C){C=C.split(",");for(D=0;D<C.length;D++){if(!E[C[D]]){v();return}}}F.init(A,function(G){if(G&&G.success){A.features=E;A.runtime=F.name;A.trigger("Init",{runtime:F.name});A.trigger("PostInit");A.refresh()}else{v()}})}else{A.trigger("Error",{code:g.INIT_ERROR,message:g.translate("Init error.")})}}v();if(typeof(r.init)=="function"){r.init(A)}else{g.each(r.init,function(D,C){A.bind(C,D)})}},refresh:function(){this.trigger("Refresh")},start:function(){if(t.length&&this.state!=g.STARTED){this.state=g.STARTED;this.trigger("StateChanged");s.call(this)}},stop:function(){if(this.state!=g.STOPPED){this.state=g.STOPPED;this.trigger("CancelUpload");this.trigger("StateChanged")}},disableBrowse:function(){p=arguments[0]!==b?arguments[0]:true;this.trigger("DisableBrowse",p)},getFile:function(w){var v;for(v=t.length-1;v>=0;v--){if(t[v].id===w){return t[v]}}},removeFile:function(w){var v;for(v=t.length-1;v>=0;v--){if(t[v].id===w.id){return this.splice(v,1)[0]}}},splice:function(x,v){var w;w=t.splice(x===b?0:x,v===b?t.length:v);this.trigger("FilesRemoved",w);this.trigger("QueueChanged");return w},trigger:function(w){var y=o[w.toLowerCase()],x,v;if(y){v=Array.prototype.slice.call(arguments);v[0]=this;for(x=0;x<y.length;x++){if(y[x].func.apply(y[x].scope,v)===false){return false}}}return true},hasEventListener:function(v){return !!o[v.toLowerCase()]},bind:function(v,x,w){var y;v=v.toLowerCase();y=o[v]||[];y.push({func:x,scope:w||this});o[v]=y},unbind:function(v){v=v.toLowerCase();var y=o[v],w,x=arguments[1];if(y){if(x!==b){for(w=y.length-1;w>=0;w--){if(y[w].func===x){y.splice(w,1);break}}}else{y=[]}if(!y.length){delete o[v]}}},unbindAll:function(){var v=this;g.each(o,function(x,w){v.unbind(w)})},destroy:function(){this.stop();this.trigger("Destroy");this.unbindAll()}})};g.File=function(q,o,p){var n=this;n.id=q;n.name=o;n.size=p;n.loaded=0;n.percent=0;n.status=0};g.Runtime=function(){this.getFeatures=function(){};this.init=function(n,o){}};g.QueueProgress=function(){var n=this;n.size=0;n.loaded=0;n.uploaded=0;n.failed=0;n.queued=0;n.percent=0;n.bytesPerSec=0;n.reset=function(){n.size=n.loaded=n.uploaded=n.failed=n.queued=n.percent=n.bytesPerSec=0}};g.runtimes={};window.plupload=g})();
;
(function(d,a,b,c){function e(f){return a.getElementById(f)}b.runtimes.Html4=b.addRuntime("html4",{getFeatures:function(){return{multipart:true,triggerDialog:(b.ua.gecko&&d.FormData||b.ua.webkit)}},init:function(f,g){f.bind("Init",function(p){var j=a.body,n,h="javascript",k,x,q,z=[],r=/MSIE/.test(navigator.userAgent),t=[],m=p.settings.filters,o,l,s,w;no_type_restriction:for(o=0;o<m.length;o++){l=m[o].extensions.split(/,/);for(w=0;w<l.length;w++){if(l[w]==="*"){t=[];break no_type_restriction}s=b.mimeTypes[l[w]];if(s&&b.inArray(s,t)===-1){t.push(s)}}}t=t.join(",");function v(){var B,y,i,A;q=b.guid();z.push(q);B=a.createElement("form");B.setAttribute("id","form_"+q);B.setAttribute("method","post");B.setAttribute("enctype","multipart/form-data");B.setAttribute("encoding","multipart/form-data");B.setAttribute("target",p.id+"_iframe");B.style.position="absolute";y=a.createElement("input");y.setAttribute("id","input_"+q);y.setAttribute("type","file");y.setAttribute("accept",t);y.setAttribute("size",1);A=e(p.settings.browse_button);if(p.features.triggerDialog&&A){b.addEvent(e(p.settings.browse_button),"click",function(C){if(!y.disabled){y.click()}C.preventDefault()},p.id)}b.extend(y.style,{width:"100%",height:"100%",opacity:0,fontSize:"99px",cursor:"pointer"});b.extend(B.style,{overflow:"hidden"});i=p.settings.shim_bgcolor;if(i){B.style.background=i}if(r){b.extend(y.style,{filter:"alpha(opacity=0)"})}b.addEvent(y,"change",function(F){var D=F.target,C,E=[],G;if(D.value){e("form_"+q).style.top=-1048575+"px";C=D.value.replace(/\\/g,"/");C=C.substring(C.length,C.lastIndexOf("/")+1);E.push(new b.File(q,C));if(!p.features.triggerDialog){b.removeAllEvents(B,p.id)}else{b.removeEvent(A,"click",p.id)}b.removeEvent(y,"change",p.id);v();if(E.length){f.trigger("FilesAdded",E)}}},p.id);B.appendChild(y);j.appendChild(B);p.refresh()}function u(){var i=a.createElement("div");i.innerHTML='<iframe id="'+p.id+'_iframe" name="'+p.id+'_iframe" src="'+h+':&quot;&quot;" style="display:none"></iframe>';n=i.firstChild;j.appendChild(n);b.addEvent(n,"load",function(C){var D=C.target,B,y;if(!k){return}try{B=D.contentWindow.document||D.contentDocument||d.frames[D.id].document}catch(A){p.trigger("Error",{code:b.SECURITY_ERROR,message:b.translate("Security error."),file:k});return}y=B.body.innerHTML;if(y){k.status=b.DONE;k.loaded=1025;k.percent=100;p.trigger("UploadProgress",k);p.trigger("FileUploaded",k,{response:y})}},p.id)}if(p.settings.container){j=e(p.settings.container);if(b.getStyle(j,"position")==="static"){j.style.position="relative"}}p.bind("UploadFile",function(i,A){var B,y;if(A.status==b.DONE||A.status==b.FAILED||i.state==b.STOPPED){return}B=e("form_"+A.id);y=e("input_"+A.id);y.setAttribute("name",i.settings.file_data_name);B.setAttribute("action",i.settings.url);b.each(b.extend({name:A.target_name||A.name},i.settings.multipart_params),function(E,C){var D=a.createElement("input");b.extend(D,{type:"hidden",name:C,value:E});B.insertBefore(D,B.firstChild)});k=A;e("form_"+q).style.top=-1048575+"px";B.submit()});p.bind("FileUploaded",function(i){i.refresh()});p.bind("StateChanged",function(i){if(i.state==b.STARTED){u()}else{if(i.state==b.STOPPED){d.setTimeout(function(){b.removeEvent(n,"load",i.id);if(n.parentNode){n.parentNode.removeChild(n)}},0)}}b.each(i.files,function(A,y){if(A.status===b.DONE||A.status===b.FAILED){var B=e("form_"+A.id);if(B){B.parentNode.removeChild(B)}}})});p.bind("Refresh",function(y){var F,A,B,C,i,G,H,E,D;F=e(y.settings.browse_button);if(F){i=b.getPos(F,e(y.settings.container));G=b.getSize(F);H=e("form_"+q);E=e("input_"+q);b.extend(H.style,{top:i.y+"px",left:i.x+"px",width:G.w+"px",height:G.h+"px"});if(y.features.triggerDialog){if(b.getStyle(F,"position")==="static"){b.extend(F.style,{position:"relative"})}D=parseInt(F.style.zIndex,10);if(isNaN(D)){D=0}b.extend(F.style,{zIndex:D});b.extend(H.style,{zIndex:D-1})}B=y.settings.browse_button_hover;C=y.settings.browse_button_active;A=y.features.triggerDialog?F:H;if(B){b.addEvent(A,"mouseover",function(){b.addClass(F,B)},y.id);b.addEvent(A,"mouseout",function(){b.removeClass(F,B)},y.id)}if(C){b.addEvent(A,"mousedown",function(){b.addClass(F,C)},y.id);b.addEvent(a.body,"mouseup",function(){b.removeClass(F,C)},y.id)}}});f.bind("FilesRemoved",function(y,B){var A,C;for(A=0;A<B.length;A++){C=e("form_"+B[A].id);if(C){C.parentNode.removeChild(C)}}});f.bind("DisableBrowse",function(i,A){var y=a.getElementById("input_"+q);if(y){y.disabled=A}});f.bind("Destroy",function(i){var y,A,B,C={inputContainer:"form_"+q,inputFile:"input_"+q,browseButton:i.settings.browse_button};for(y in C){A=e(C[y]);if(A){b.removeAllEvents(A,i.id)}}b.removeAllEvents(a.body,i.id);b.each(z,function(E,D){B=e("form_"+E);if(B){j.removeChild(B)}})});v()});g({success:true})}})})(window,document,plupload);
;
(function(c){var d={};function a(e){return plupload.translate(e)||e}function b(f,e){e.contents().each(function(g,h){h=c(h);if(!h.is(".plupload")){h.remove()}});e.prepend('<div class="plupload_wrapper plupload_scroll"><div id="'+f+'_container" class="plupload_container"><div class="plupload"><div class="plupload_header"><div class="plupload_header_content"><div class="plupload_header_title">'+a("Select files")+'</div><div class="plupload_header_text">'+a("Add files to the upload queue and click the start button.")+'</div></div></div><div class="plupload_content"><div class="plupload_filelist_header"><div class="plupload_file_name">'+a("Filename")+'</div><div class="plupload_file_action">&nbsp;</div><div class="plupload_file_status"><span>'+a("Status")+'</span></div><div class="plupload_file_size">'+a("Size")+'</div><div class="plupload_clearer">&nbsp;</div></div><ul id="'+f+'_filelist" class="plupload_filelist"></ul><div class="plupload_filelist_footer"><div class="plupload_file_name"><div class="plupload_buttons"><a href="#" class="plupload_button plupload_add">'+a("Add files")+'</a><a href="#" class="plupload_button plupload_start">'+a("Start upload")+'</a></div><span class="plupload_upload_status"></span></div><div class="plupload_file_action"></div><div class="plupload_file_status"><span class="plupload_total_status">0%</span></div><div class="plupload_file_size"><span class="plupload_total_file_size">0 b</span></div><div class="plupload_progress"><div class="plupload_progress_container"><div class="plupload_progress_bar"></div></div></div><div class="plupload_clearer">&nbsp;</div></div></div></div></div><input type="hidden" id="'+f+'_count" name="'+f+'_count" value="0" /></div>')}c.fn.pluploadQueue=function(e){if(e){this.each(function(){var j,i,k;i=c(this);k=i.attr("id");if(!k){k=plupload.guid();i.attr("id",k)}j=new plupload.Uploader(c.extend({dragdrop:true,container:k},e));d[k]=j;function h(l){var n;if(l.status==plupload.DONE){n="plupload_done"}if(l.status==plupload.FAILED){n="plupload_failed"}if(l.status==plupload.QUEUED){n="plupload_delete"}if(l.status==plupload.UPLOADING){n="plupload_uploading"}var m=c("#"+l.id).attr("class",n).find("a").css("display","block");if(l.hint){m.attr("title",l.hint)}}function f(){c("span.plupload_total_status",i).html(j.total.percent+"%");c("div.plupload_progress_bar",i).css("width",j.total.percent+"%");c("span.plupload_upload_status",i).text(a("Uploaded %d/%d files").replace(/%d\/%d/,j.total.uploaded+"/"+j.files.length))}function g(){var m=c("ul.plupload_filelist",i).html(""),n=0,l;c.each(j.files,function(p,o){l="";if(o.status==plupload.DONE){if(o.target_name){l+='<input type="hidden" name="'+k+"_"+n+'_tmpname" value="'+plupload.xmlEncode(o.target_name)+'" />'}l+='<input type="hidden" name="'+k+"_"+n+'_name" value="'+plupload.xmlEncode(o.name)+'" />';l+='<input type="hidden" name="'+k+"_"+n+'_status" value="'+(o.status==plupload.DONE?"done":"failed")+'" />';n++;c("#"+k+"_count").val(n)}m.append('<li id="'+o.id+'"><div class="plupload_file_name"><span>'+o.name+'</span></div><div class="plupload_file_action"><a href="#"></a></div><div class="plupload_file_status">'+o.percent+'%</div><div class="plupload_file_size">'+plupload.formatSize(o.size)+'</div><div class="plupload_clearer">&nbsp;</div>'+l+"</li>");h(o);c("#"+o.id+".plupload_delete a").click(function(q){c("#"+o.id).remove();j.removeFile(o);q.preventDefault()})});c("span.plupload_total_file_size",i).html(plupload.formatSize(j.total.size));if(j.total.queued===0){c("span.plupload_add_text",i).text(a("Add files."))}else{c("span.plupload_add_text",i).text(j.total.queued+" files queued.")}c("a.plupload_start",i).toggleClass("plupload_disabled",j.files.length==(j.total.uploaded+j.total.failed));m[0].scrollTop=m[0].scrollHeight;f();if(!j.files.length&&j.features.dragdrop&&j.settings.dragdrop){c("#"+k+"_filelist").append('<li class="plupload_droptext">'+a("Drag files here.")+"</li>")}}j.bind("UploadFile",function(l,m){c("#"+m.id).addClass("plupload_current_file")});j.bind("Init",function(l,m){b(k,i);if(!e.unique_names&&e.rename){c("#"+k+"_filelist div.plupload_file_name span",i).live("click",function(s){var q=c(s.target),o,r,n,p="";o=l.getFile(q.parents("li")[0].id);n=o.name;r=/^(.+)(\.[^.]+)$/.exec(n);if(r){n=r[1];p=r[2]}q.hide().after('<input type="text" />');q.next().val(n).focus().blur(function(){q.show().next().remove()}).keydown(function(u){var t=c(this);if(u.keyCode==13){u.preventDefault();o.name=t.val()+p;q.text(o.name);t.blur()}})})}c("a.plupload_add",i).attr("id",k+"_browse");l.settings.browse_button=k+"_browse";if(l.features.dragdrop&&l.settings.dragdrop){l.settings.drop_element=k+"_filelist";c("#"+k+"_filelist").append('<li class="plupload_droptext">'+a("Drag files here.")+"</li>")}c("#"+k+"_container").attr("title","Using runtime: "+m.runtime);c("a.plupload_start",i).click(function(n){if(!c(this).hasClass("plupload_disabled")){j.start()}n.preventDefault()});c("a.plupload_stop",i).click(function(n){n.preventDefault();j.stop()});c("a.plupload_start",i).addClass("plupload_disabled")});j.init();j.bind("Error",function(l,o){var m=o.file,n;if(m){n=o.message;if(o.details){n+=" ("+o.details+")"}if(o.code==plupload.FILE_SIZE_ERROR){alert(a("Error: File too large: ")+m.name)}if(o.code==plupload.FILE_EXTENSION_ERROR){alert(a("Error: Invalid file extension: ")+m.name)}m.hint=n;c("#"+m.id).attr("class","plupload_failed").find("a").css("display","block").attr("title",n)}});j.bind("StateChanged",function(){if(j.state===plupload.STARTED){c("li.plupload_delete a,div.plupload_buttons",i).hide();c("span.plupload_upload_status,div.plupload_progress,a.plupload_stop",i).css("display","block");c("span.plupload_upload_status",i).text("Uploaded "+j.total.uploaded+"/"+j.files.length+" files");if(e.multiple_queues){c("span.plupload_total_status,span.plupload_total_file_size",i).show()}}else{g();c("a.plupload_stop,div.plupload_progress",i).hide();c("a.plupload_delete",i).css("display","block")}});j.bind("QueueChanged",g);j.bind("FileUploaded",function(l,m){h(m)});j.bind("UploadProgress",function(l,m){c("#"+m.id+" div.plupload_file_status",i).html(m.percent+"%");h(m);f();if(e.multiple_queues&&j.total.uploaded+j.total.failed==j.files.length){c(".plupload_buttons,.plupload_upload_status",i).css("display","inline");c(".plupload_start",i).addClass("plupload_disabled");c("span.plupload_total_status,span.plupload_total_file_size",i).hide()}});if(e.setup){e.setup(j)}});return this}else{return d[c(this[0]).attr("id")]}}})(jQuery);
;
/*
 * jQuery Pines Notify (pnotify) Plugin 1.2.0
 *
 * http://pinesframework.org/pnotify/
 * Copyright (c) 2009-2012 Hunter Perrin
 *
 * Triple license under the GPL, LGPL, and MPL:
 *	  http://www.gnu.org/licenses/gpl.html
 *	  http://www.gnu.org/licenses/lgpl.html
 *	  http://www.mozilla.org/MPL/MPL-1.1.html
 */
(function(d){var q,j,r,i=d(window),u={jqueryui:{container:"ui-widget ui-widget-content ui-corner-all",notice:"ui-state-highlight",notice_icon:"ui-icon ui-icon-info",info:"",info_icon:"ui-icon ui-icon-info",success:"ui-state-default",success_icon:"ui-icon ui-icon-circle-check",error:"ui-state-error",error_icon:"ui-icon ui-icon-alert",closer:"ui-icon ui-icon-close",pin_up:"ui-icon ui-icon-pin-w",pin_down:"ui-icon ui-icon-pin-s",hi_menu:"ui-state-default ui-corner-bottom",hi_btn:"ui-state-default ui-corner-all",
hi_btnhov:"ui-state-hover",hi_hnd:"ui-icon ui-icon-grip-dotted-horizontal"},bootstrap:{container:"alert",notice:"",notice_icon:"icon-exclamation-sign",info:"alert-info",info_icon:"icon-info-sign",success:"alert-success",success_icon:"icon-ok-sign",error:"alert-error",error_icon:"icon-warning-sign",closer:"icon-remove",pin_up:"icon-pause",pin_down:"icon-play",hi_menu:"well",hi_btn:"btn",hi_btnhov:"",hi_hnd:"icon-chevron-down"}},s=function(){r=d("body");i=d(window);i.bind("resize",function(){j&&clearTimeout(j);
j=setTimeout(d.pnotify_position_all,10)})};document.body?s():d(s);d.extend({pnotify_remove_all:function(){var e=i.data("pnotify");e&&e.length&&d.each(e,function(){this.pnotify_remove&&this.pnotify_remove()})},pnotify_position_all:function(){j&&clearTimeout(j);j=null;var e=i.data("pnotify");e&&e.length&&(d.each(e,function(){var d=this.opts.stack;if(d)d.nextpos1=d.firstpos1,d.nextpos2=d.firstpos2,d.addpos2=0,d.animation=true}),d.each(e,function(){this.pnotify_position()}))},pnotify:function(e){var g,
a;typeof e!="object"?(a=d.extend({},d.pnotify.defaults),a.text=e):a=d.extend({},d.pnotify.defaults,e);for(var p in a)typeof p=="string"&&p.match(/^pnotify_/)&&(a[p.replace(/^pnotify_/,"")]=a[p]);if(a.before_init&&a.before_init(a)===false)return null;var k,o=function(a,c){b.css("display","none");var f=document.elementFromPoint(a.clientX,a.clientY);b.css("display","block");var e=d(f),g=e.css("cursor");b.css("cursor",g!="auto"?g:"default");if(!k||k.get(0)!=f)k&&(n.call(k.get(0),"mouseleave",a.originalEvent),
n.call(k.get(0),"mouseout",a.originalEvent)),n.call(f,"mouseenter",a.originalEvent),n.call(f,"mouseover",a.originalEvent);n.call(f,c,a.originalEvent);k=e},f=u[a.styling],b=d("<div />",{"class":"ui-pnotify "+a.addclass,css:{display:"none"},mouseenter:function(l){a.nonblock&&l.stopPropagation();a.mouse_reset&&g=="out"&&(b.stop(true),g="in",b.css("height","auto").animate({width:a.width,opacity:a.nonblock?a.nonblock_opacity:a.opacity},"fast"));a.nonblock&&b.animate({opacity:a.nonblock_opacity},"fast");
a.hide&&a.mouse_reset&&b.pnotify_cancel_remove();a.sticker&&!a.nonblock&&b.sticker.trigger("pnotify_icon").css("visibility","visible");a.closer&&!a.nonblock&&b.closer.css("visibility","visible")},mouseleave:function(l){a.nonblock&&l.stopPropagation();k=null;b.css("cursor","auto");a.nonblock&&g!="out"&&b.animate({opacity:a.opacity},"fast");a.hide&&a.mouse_reset&&b.pnotify_queue_remove();a.sticker_hover&&b.sticker.css("visibility","hidden");a.closer_hover&&b.closer.css("visibility","hidden");d.pnotify_position_all()},
mouseover:function(b){a.nonblock&&b.stopPropagation()},mouseout:function(b){a.nonblock&&b.stopPropagation()},mousemove:function(b){a.nonblock&&(b.stopPropagation(),o(b,"onmousemove"))},mousedown:function(b){a.nonblock&&(b.stopPropagation(),b.preventDefault(),o(b,"onmousedown"))},mouseup:function(b){a.nonblock&&(b.stopPropagation(),b.preventDefault(),o(b,"onmouseup"))},click:function(b){a.nonblock&&(b.stopPropagation(),o(b,"onclick"))},dblclick:function(b){a.nonblock&&(b.stopPropagation(),o(b,"ondblclick"))}});
b.opts=a;b.container=d("<div />",{"class":f.container+" ui-pnotify-container "+(a.type=="error"?f.error:a.type=="info"?f.info:a.type=="success"?f.success:f.notice)}).appendTo(b);a.cornerclass!=""&&b.container.removeClass("ui-corner-all").addClass(a.cornerclass);a.shadow&&b.container.addClass("ui-pnotify-shadow");b.pnotify_version="1.2.0";b.pnotify=function(l){var c=a;typeof l=="string"?a.text=l:a=d.extend({},a,l);for(var e in a)typeof e=="string"&&e.match(/^pnotify_/)&&(a[e.replace(/^pnotify_/,"")]=
a[e]);b.opts=a;a.cornerclass!=c.cornerclass&&b.container.removeClass("ui-corner-all").addClass(a.cornerclass);a.shadow!=c.shadow&&(a.shadow?b.container.addClass("ui-pnotify-shadow"):b.container.removeClass("ui-pnotify-shadow"));a.addclass===false?b.removeClass(c.addclass):a.addclass!==c.addclass&&b.removeClass(c.addclass).addClass(a.addclass);a.title===false?b.title_container.slideUp("fast"):a.title!==c.title&&(a.title_escape?b.title_container.text(a.title).slideDown(200):b.title_container.html(a.title).slideDown(200));
a.text===false?b.text_container.slideUp("fast"):a.text!==c.text&&(a.text_escape?b.text_container.text(a.text).slideDown(200):b.text_container.html(a.insert_brs?String(a.text).replace(/\n/g,"<br />"):a.text).slideDown(200));b.pnotify_history=a.history;b.pnotify_hide=a.hide;a.type!=c.type&&b.container.removeClass(f.error+" "+f.notice+" "+f.success+" "+f.info).addClass(a.type=="error"?f.error:a.type=="info"?f.info:a.type=="success"?f.success:f.notice);if(a.icon!==c.icon||a.icon===true&&a.type!=c.type)b.container.find("div.ui-pnotify-icon").remove(),
a.icon!==false&&d("<div />",{"class":"ui-pnotify-icon"}).append(d("<span />",{"class":a.icon===true?a.type=="error"?f.error_icon:a.type=="info"?f.info_icon:a.type=="success"?f.success_icon:f.notice_icon:a.icon})).prependTo(b.container);a.width!==c.width&&b.animate({width:a.width});a.min_height!==c.min_height&&b.container.animate({minHeight:a.min_height});a.opacity!==c.opacity&&b.fadeTo(a.animate_speed,a.opacity);!a.closer||a.nonblock?b.closer.css("display","none"):b.closer.css("display","block");
!a.sticker||a.nonblock?b.sticker.css("display","none"):b.sticker.css("display","block");b.sticker.trigger("pnotify_icon");a.sticker_hover?b.sticker.css("visibility","hidden"):a.nonblock||b.sticker.css("visibility","visible");a.closer_hover?b.closer.css("visibility","hidden"):a.nonblock||b.closer.css("visibility","visible");a.hide?c.hide||b.pnotify_queue_remove():b.pnotify_cancel_remove();b.pnotify_queue_position();return b};b.pnotify_position=function(a){var c=b.opts.stack;if(c){if(!c.nextpos1)c.nextpos1=
c.firstpos1;if(!c.nextpos2)c.nextpos2=c.firstpos2;if(!c.addpos2)c.addpos2=0;var d=b.css("display")=="none";if(!d||a){var f,e={},g;switch(c.dir1){case "down":g="top";break;case "up":g="bottom";break;case "left":g="right";break;case "right":g="left"}a=parseInt(b.css(g));isNaN(a)&&(a=0);if(typeof c.firstpos1=="undefined"&&!d)c.firstpos1=a,c.nextpos1=c.firstpos1;var h;switch(c.dir2){case "down":h="top";break;case "up":h="bottom";break;case "left":h="right";break;case "right":h="left"}f=parseInt(b.css(h));
isNaN(f)&&(f=0);if(typeof c.firstpos2=="undefined"&&!d)c.firstpos2=f,c.nextpos2=c.firstpos2;if(c.dir1=="down"&&c.nextpos1+b.height()>i.height()||c.dir1=="up"&&c.nextpos1+b.height()>i.height()||c.dir1=="left"&&c.nextpos1+b.width()>i.width()||c.dir1=="right"&&c.nextpos1+b.width()>i.width())c.nextpos1=c.firstpos1,c.nextpos2+=c.addpos2+(typeof c.spacing2=="undefined"?25:c.spacing2),c.addpos2=0;if(c.animation&&c.nextpos2<f)switch(c.dir2){case "down":e.top=c.nextpos2+"px";break;case "up":e.bottom=c.nextpos2+
"px";break;case "left":e.right=c.nextpos2+"px";break;case "right":e.left=c.nextpos2+"px"}else b.css(h,c.nextpos2+"px");switch(c.dir2){case "down":case "up":if(b.outerHeight(true)>c.addpos2)c.addpos2=b.height();break;case "left":case "right":if(b.outerWidth(true)>c.addpos2)c.addpos2=b.width()}if(c.nextpos1)if(c.animation&&(a>c.nextpos1||e.top||e.bottom||e.right||e.left))switch(c.dir1){case "down":e.top=c.nextpos1+"px";break;case "up":e.bottom=c.nextpos1+"px";break;case "left":e.right=c.nextpos1+"px";
break;case "right":e.left=c.nextpos1+"px"}else b.css(g,c.nextpos1+"px");(e.top||e.bottom||e.right||e.left)&&b.animate(e,{duration:500,queue:false});switch(c.dir1){case "down":case "up":c.nextpos1+=b.height()+(typeof c.spacing1=="undefined"?25:c.spacing1);break;case "left":case "right":c.nextpos1+=b.width()+(typeof c.spacing1=="undefined"?25:c.spacing1)}}}};b.pnotify_queue_position=function(a){j&&clearTimeout(j);a||(a=10);j=setTimeout(d.pnotify_position_all,a)};b.pnotify_display=function(){b.parent().length||
b.appendTo(r);a.before_open&&a.before_open(b)===false||(a.stack.push!="top"&&b.pnotify_position(true),a.animation=="fade"||a.animation.effect_in=="fade"?b.show().fadeTo(0,0).hide():a.opacity!=1&&b.show().fadeTo(0,a.opacity).hide(),b.animate_in(function(){a.after_open&&a.after_open(b);b.pnotify_queue_position();a.hide&&b.pnotify_queue_remove()}))};b.pnotify_remove=function(){if(b.timer)window.clearTimeout(b.timer),b.timer=null;a.before_close&&a.before_close(b)===false||b.animate_out(function(){a.after_close&&
a.after_close(b)===false||(b.pnotify_queue_position(),a.remove&&b.detach())})};b.animate_in=function(d){g="in";var c;c=typeof a.animation.effect_in!="undefined"?a.animation.effect_in:a.animation;c=="none"?(b.show(),d()):c=="show"?b.show(a.animate_speed,d):c=="fade"?b.show().fadeTo(a.animate_speed,a.opacity,d):c=="slide"?b.slideDown(a.animate_speed,d):typeof c=="function"?c("in",d,b):b.show(c,typeof a.animation.options_in=="object"?a.animation.options_in:{},a.animate_speed,d)};b.animate_out=function(d){g=
"out";var c;c=typeof a.animation.effect_out!="undefined"?a.animation.effect_out:a.animation;c=="none"?(b.hide(),d()):c=="show"?b.hide(a.animate_speed,d):c=="fade"?b.fadeOut(a.animate_speed,d):c=="slide"?b.slideUp(a.animate_speed,d):typeof c=="function"?c("out",d,b):b.hide(c,typeof a.animation.options_out=="object"?a.animation.options_out:{},a.animate_speed,d)};b.pnotify_cancel_remove=function(){b.timer&&window.clearTimeout(b.timer)};b.pnotify_queue_remove=function(){b.pnotify_cancel_remove();b.timer=
window.setTimeout(function(){b.pnotify_remove()},isNaN(a.delay)?0:a.delay)};b.closer=d("<div />",{"class":"ui-pnotify-closer",css:{cursor:"pointer",visibility:a.closer_hover?"hidden":"visible"},click:function(){b.pnotify_remove();b.sticker.css("visibility","hidden");b.closer.css("visibility","hidden")}}).append(d("<span />",{"class":f.closer})).appendTo(b.container);(!a.closer||a.nonblock)&&b.closer.css("display","none");b.sticker=d("<div />",{"class":"ui-pnotify-sticker",css:{cursor:"pointer",visibility:a.sticker_hover?
"hidden":"visible"},click:function(){a.hide=!a.hide;a.hide?b.pnotify_queue_remove():b.pnotify_cancel_remove();d(this).trigger("pnotify_icon")}}).bind("pnotify_icon",function(){d(this).children().removeClass(f.pin_up+" "+f.pin_down).addClass(a.hide?f.pin_up:f.pin_down)}).append(d("<span />",{"class":f.pin_up})).appendTo(b.container);(!a.sticker||a.nonblock)&&b.sticker.css("display","none");a.icon!==false&&d("<div />",{"class":"ui-pnotify-icon"}).append(d("<span />",{"class":a.icon===true?a.type=="error"?
f.error_icon:a.type=="info"?f.info_icon:a.type=="success"?f.success_icon:f.notice_icon:a.icon})).prependTo(b.container);b.title_container=d("<h4 />",{"class":"ui-pnotify-title"}).appendTo(b.container);a.title===false?b.title_container.hide():a.title_escape?b.title_container.text(a.title):b.title_container.html(a.title);b.text_container=d("<div />",{"class":"ui-pnotify-text"}).appendTo(b.container);a.text===false?b.text_container.hide():a.text_escape?b.text_container.text(a.text):b.text_container.html(a.insert_brs?
String(a.text).replace(/\n/g,"<br />"):a.text);typeof a.width=="string"&&b.css("width",a.width);typeof a.min_height=="string"&&b.container.css("min-height",a.min_height);b.pnotify_history=a.history;b.pnotify_hide=a.hide;var h=i.data("pnotify");if(h==null||typeof h!="object")h=[];h=a.stack.push=="top"?d.merge([b],h):d.merge(h,[b]);i.data("pnotify",h);a.stack.push=="top"&&b.pnotify_queue_position(1);a.after_init&&a.after_init(b);if(a.history){var m=i.data("pnotify_history");typeof m=="undefined"&&(m=
d("<div />",{"class":"ui-pnotify-history-container "+f.hi_menu,mouseleave:function(){m.animate({top:"-"+q+"px"},{duration:100,queue:false})}}).append(d("<div />",{"class":"ui-pnotify-history-header",text:"Redisplay"})).append(d("<button />",{"class":"ui-pnotify-history-all "+f.hi_btn,text:"All",mouseenter:function(){d(this).addClass(f.hi_btnhov)},mouseleave:function(){d(this).removeClass(f.hi_btnhov)},click:function(){d.each(h,function(){this.pnotify_history&&(this.is(":visible")?this.pnotify_hide&&
this.pnotify_queue_remove():this.pnotify_display&&this.pnotify_display())});return false}})).append(d("<button />",{"class":"ui-pnotify-history-last "+f.hi_btn,text:"Last",mouseenter:function(){d(this).addClass(f.hi_btnhov)},mouseleave:function(){d(this).removeClass(f.hi_btnhov)},click:function(){var a=-1,b;do{b=a==-1?h.slice(a):h.slice(a,a+1);if(!b[0])break;a--}while(!b[0].pnotify_history||b[0].is(":visible"));if(!b[0])return false;b[0].pnotify_display&&b[0].pnotify_display();return false}})).appendTo(r),
q=d("<span />",{"class":"ui-pnotify-history-pulldown "+f.hi_hnd,mouseenter:function(){m.animate({top:"0"},{duration:100,queue:false})}}).appendTo(m).offset().top+2,m.css({top:"-"+q+"px"}),i.data("pnotify_history",m))}a.stack.animation=false;b.pnotify_display();return b}});var t=/^on/,v=/^(dbl)?click$|^mouse(move|down|up|over|out|enter|leave)$|^contextmenu$/,w=/^(focus|blur|select|change|reset)$|^key(press|down|up)$/,x=/^(scroll|resize|(un)?load|abort|error)$/,n=function(e,g){var a,e=e.toLowerCase();
document.createEvent&&this.dispatchEvent?(e=e.replace(t,""),e.match(v)?(d(this).offset(),a=document.createEvent("MouseEvents"),a.initMouseEvent(e,g.bubbles,g.cancelable,g.view,g.detail,g.screenX,g.screenY,g.clientX,g.clientY,g.ctrlKey,g.altKey,g.shiftKey,g.metaKey,g.button,g.relatedTarget)):e.match(w)?(a=document.createEvent("UIEvents"),a.initUIEvent(e,g.bubbles,g.cancelable,g.view,g.detail)):e.match(x)&&(a=document.createEvent("HTMLEvents"),a.initEvent(e,g.bubbles,g.cancelable)),a&&this.dispatchEvent(a)):
(e.match(t)||(e="on"+e),a=document.createEventObject(g),this.fireEvent(e,a))};d.pnotify.defaults={title:false,title_escape:false,text:false,text_escape:false,styling:"bootstrap",addclass:"",cornerclass:"",nonblock:false,nonblock_opacity:0.2,history:true,width:"300px",min_height:"16px",type:"notice",icon:true,animation:"fade",animate_speed:"slow",opacity:1,shadow:true,closer:true,closer_hover:true,sticker:true,sticker_hover:true,hide:true,delay:8E3,mouse_reset:true,remove:true,insert_brs:true,stack:{dir1:"down",
dir2:"left",push:"bottom",spacing1:25,spacing2:25}}})(jQuery);

;
// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview
 * some functions for browser-side pretty printing of code contained in html.
 *
 * <p>
 * For a fairly comprehensive set of languages see the
 * <a href="http://google-code-prettify.googlecode.com/svn/trunk/README.html#langs">README</a>
 * file that came with this source.  At a minimum, the lexer should work on a
 * number of languages including C and friends, Java, Python, Bash, SQL, HTML,
 * XML, CSS, Javascript, and Makefiles.  It works passably on Ruby, PHP and Awk
 * and a subset of Perl, but, because of commenting conventions, doesn't work on
 * Smalltalk, Lisp-like, or CAML-like languages without an explicit lang class.
 * <p>
 * Usage: <ol>
 * <li> include this source file in an html page via
 *   {@code <script type="text/javascript" src="/path/to/prettify.js"></script>}
 * <li> define style rules.  See the example page for examples.
 * <li> mark the {@code <pre>} and {@code <code>} tags in your source with
 *    {@code class=prettyprint.}
 *    You can also use the (html deprecated) {@code <xmp>} tag, but the pretty
 *    printer needs to do more substantial DOM manipulations to support that, so
 *    some css styles may not be preserved.
 * </ol>
 * That's it.  I wanted to keep the API as simple as possible, so there's no
 * need to specify which language the code is in, but if you wish, you can add
 * another class to the {@code <pre>} or {@code <code>} element to specify the
 * language, as in {@code <pre class="prettyprint lang-java">}.  Any class that
 * starts with "lang-" followed by a file extension, specifies the file type.
 * See the "lang-*.js" files in this directory for code that implements
 * per-language file handlers.
 * <p>
 * Change log:<br>
 * cbeust, 2006/08/22
 * <blockquote>
 *   Java annotations (start with "@") are now captured as literals ("lit")
 * </blockquote>
 * @requires console
 */

// JSLint declarations
/*global console, document, navigator, setTimeout, window */

/**
 * Split {@code prettyPrint} into multiple timeouts so as not to interfere with
 * UI events.
 * If set to {@code false}, {@code prettyPrint()} is synchronous.
 */
window['PR_SHOULD_USE_CONTINUATION'] = true;

(function () {
  // Keyword lists for various languages.
  // We use things that coerce to strings to make them compact when minified
  // and to defeat aggressive optimizers that fold large string constants.
  var FLOW_CONTROL_KEYWORDS = ["break,continue,do,else,for,if,return,while"];
  var C_KEYWORDS = [FLOW_CONTROL_KEYWORDS,"auto,case,char,const,default," + 
      "double,enum,extern,float,goto,int,long,register,short,signed,sizeof," +
      "static,struct,switch,typedef,union,unsigned,void,volatile"];
  var COMMON_KEYWORDS = [C_KEYWORDS,"catch,class,delete,false,import," +
      "new,operator,private,protected,public,this,throw,true,try,typeof"];
  var CPP_KEYWORDS = [COMMON_KEYWORDS,"alignof,align_union,asm,axiom,bool," +
      "concept,concept_map,const_cast,constexpr,decltype," +
      "dynamic_cast,explicit,export,friend,inline,late_check," +
      "mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast," +
      "template,typeid,typename,using,virtual,where"];
  var JAVA_KEYWORDS = [COMMON_KEYWORDS,
      "abstract,boolean,byte,extends,final,finally,implements,import," +
      "instanceof,null,native,package,strictfp,super,synchronized,throws," +
      "transient"];
  var CSHARP_KEYWORDS = [JAVA_KEYWORDS,
      "as,base,by,checked,decimal,delegate,descending,dynamic,event," +
      "fixed,foreach,from,group,implicit,in,interface,internal,into,is,lock," +
      "object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed," +
      "stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var"];
  var COFFEE_KEYWORDS = "all,and,by,catch,class,else,extends,false,finally," +
      "for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then," +
      "true,try,unless,until,when,while,yes";
  var JSCRIPT_KEYWORDS = [COMMON_KEYWORDS,
      "debugger,eval,export,function,get,null,set,undefined,var,with," +
      "Infinity,NaN"];
  var PERL_KEYWORDS = "caller,delete,die,do,dump,elsif,eval,exit,foreach,for," +
      "goto,if,import,last,local,my,next,no,our,print,package,redo,require," +
      "sub,undef,unless,until,use,wantarray,while,BEGIN,END";
  var PYTHON_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "and,as,assert,class,def,del," +
      "elif,except,exec,finally,from,global,import,in,is,lambda," +
      "nonlocal,not,or,pass,print,raise,try,with,yield," +
      "False,True,None"];
  var RUBY_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "alias,and,begin,case,class," +
      "def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo," +
      "rescue,retry,self,super,then,true,undef,unless,until,when,yield," +
      "BEGIN,END"];
  var SH_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "case,done,elif,esac,eval,fi," +
      "function,in,local,set,then,until"];
  var ALL_KEYWORDS = [
      CPP_KEYWORDS, CSHARP_KEYWORDS, JSCRIPT_KEYWORDS, PERL_KEYWORDS +
      PYTHON_KEYWORDS, RUBY_KEYWORDS, SH_KEYWORDS];
  var C_TYPES = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/;

  // token style names.  correspond to css classes
  /**
   * token style for a string literal
   * @const
   */
  var PR_STRING = 'str';
  /**
   * token style for a keyword
   * @const
   */
  var PR_KEYWORD = 'kwd';
  /**
   * token style for a comment
   * @const
   */
  var PR_COMMENT = 'com';
  /**
   * token style for a type
   * @const
   */
  var PR_TYPE = 'typ';
  /**
   * token style for a literal value.  e.g. 1, null, true.
   * @const
   */
  var PR_LITERAL = 'lit';
  /**
   * token style for a punctuation string.
   * @const
   */
  var PR_PUNCTUATION = 'pun';
  /**
   * token style for a punctuation string.
   * @const
   */
  var PR_PLAIN = 'pln';

  /**
   * token style for an sgml tag.
   * @const
   */
  var PR_TAG = 'tag';
  /**
   * token style for a markup declaration such as a DOCTYPE.
   * @const
   */
  var PR_DECLARATION = 'dec';
  /**
   * token style for embedded source.
   * @const
   */
  var PR_SOURCE = 'src';
  /**
   * token style for an sgml attribute name.
   * @const
   */
  var PR_ATTRIB_NAME = 'atn';
  /**
   * token style for an sgml attribute value.
   * @const
   */
  var PR_ATTRIB_VALUE = 'atv';

  /**
   * A class that indicates a section of markup that is not code, e.g. to allow
   * embedding of line numbers within code listings.
   * @const
   */
  var PR_NOCODE = 'nocode';



/**
 * A set of tokens that can precede a regular expression literal in
 * javascript
 * http://web.archive.org/web/20070717142515/http://www.mozilla.org/js/language/js20/rationale/syntax.html
 * has the full list, but I've removed ones that might be problematic when
 * seen in languages that don't support regular expression literals.
 *
 * <p>Specifically, I've removed any keywords that can't precede a regexp
 * literal in a syntactically legal javascript program, and I've removed the
 * "in" keyword since it's not a keyword in many languages, and might be used
 * as a count of inches.
 *
 * <p>The link a above does not accurately describe EcmaScript rules since
 * it fails to distinguish between (a=++/b/i) and (a++/b/i) but it works
 * very well in practice.
 *
 * @private
 * @const
 */
var REGEXP_PRECEDER_PATTERN = '(?:^^\\.?|[+-]|\\!|\\!=|\\!==|\\#|\\%|\\%=|&|&&|&&=|&=|\\(|\\*|\\*=|\\+=|\\,|\\-=|\\->|\\/|\\/=|:|::|\\;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\@|\\[|\\^|\\^=|\\^\\^|\\^\\^=|\\{|\\||\\|=|\\|\\||\\|\\|=|\\~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*';

// CAVEAT: this does not properly handle the case where a regular
// expression immediately follows another since a regular expression may
// have flags for case-sensitivity and the like.  Having regexp tokens
// adjacent is not valid in any language I'm aware of, so I'm punting.
// TODO: maybe style special characters inside a regexp as punctuation.


  /**
   * Given a group of {@link RegExp}s, returns a {@code RegExp} that globally
   * matches the union of the sets of strings matched by the input RegExp.
   * Since it matches globally, if the input strings have a start-of-input
   * anchor (/^.../), it is ignored for the purposes of unioning.
   * @param {Array.<RegExp>} regexs non multiline, non-global regexs.
   * @return {RegExp} a global regex.
   */
  function combinePrefixPatterns(regexs) {
    var capturedGroupIndex = 0;
  
    var needToFoldCase = false;
    var ignoreCase = false;
    for (var i = 0, n = regexs.length; i < n; ++i) {
      var regex = regexs[i];
      if (regex.ignoreCase) {
        ignoreCase = true;
      } else if (/[a-z]/i.test(regex.source.replace(
                     /\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
        needToFoldCase = true;
        ignoreCase = false;
        break;
      }
    }
  
    var escapeCharToCodeUnit = {
      'b': 8,
      't': 9,
      'n': 0xa,
      'v': 0xb,
      'f': 0xc,
      'r': 0xd
    };
  
    function decodeEscape(charsetPart) {
      var cc0 = charsetPart.charCodeAt(0);
      if (cc0 !== 92 /* \\ */) {
        return cc0;
      }
      var c1 = charsetPart.charAt(1);
      cc0 = escapeCharToCodeUnit[c1];
      if (cc0) {
        return cc0;
      } else if ('0' <= c1 && c1 <= '7') {
        return parseInt(charsetPart.substring(1), 8);
      } else if (c1 === 'u' || c1 === 'x') {
        return parseInt(charsetPart.substring(2), 16);
      } else {
        return charsetPart.charCodeAt(1);
      }
    }
  
    function encodeEscape(charCode) {
      if (charCode < 0x20) {
        return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
      }
      var ch = String.fromCharCode(charCode);
      if (ch === '\\' || ch === '-' || ch === '[' || ch === ']') {
        ch = '\\' + ch;
      }
      return ch;
    }
  
    function caseFoldCharset(charSet) {
      var charsetParts = charSet.substring(1, charSet.length - 1).match(
          new RegExp(
              '\\\\u[0-9A-Fa-f]{4}'
              + '|\\\\x[0-9A-Fa-f]{2}'
              + '|\\\\[0-3][0-7]{0,2}'
              + '|\\\\[0-7]{1,2}'
              + '|\\\\[\\s\\S]'
              + '|-'
              + '|[^-\\\\]',
              'g'));
      var groups = [];
      var ranges = [];
      var inverse = charsetParts[0] === '^';
      for (var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i) {
        var p = charsetParts[i];
        if (/\\[bdsw]/i.test(p)) {  // Don't muck with named groups.
          groups.push(p);
        } else {
          var start = decodeEscape(p);
          var end;
          if (i + 2 < n && '-' === charsetParts[i + 1]) {
            end = decodeEscape(charsetParts[i + 2]);
            i += 2;
          } else {
            end = start;
          }
          ranges.push([start, end]);
          // If the range might intersect letters, then expand it.
          // This case handling is too simplistic.
          // It does not deal with non-latin case folding.
          // It works for latin source code identifiers though.
          if (!(end < 65 || start > 122)) {
            if (!(end < 65 || start > 90)) {
              ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);
            }
            if (!(end < 97 || start > 122)) {
              ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);
            }
          }
        }
      }
  
      // [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
      // -> [[1, 12], [14, 14], [16, 17]]
      ranges.sort(function (a, b) { return (a[0] - b[0]) || (b[1]  - a[1]); });
      var consolidatedRanges = [];
      var lastRange = [NaN, NaN];
      for (var i = 0; i < ranges.length; ++i) {
        var range = ranges[i];
        if (range[0] <= lastRange[1] + 1) {
          lastRange[1] = Math.max(lastRange[1], range[1]);
        } else {
          consolidatedRanges.push(lastRange = range);
        }
      }
  
      var out = ['['];
      if (inverse) { out.push('^'); }
      out.push.apply(out, groups);
      for (var i = 0; i < consolidatedRanges.length; ++i) {
        var range = consolidatedRanges[i];
        out.push(encodeEscape(range[0]));
        if (range[1] > range[0]) {
          if (range[1] + 1 > range[0]) { out.push('-'); }
          out.push(encodeEscape(range[1]));
        }
      }
      out.push(']');
      return out.join('');
    }
  
    function allowAnywhereFoldCaseAndRenumberGroups(regex) {
      // Split into character sets, escape sequences, punctuation strings
      // like ('(', '(?:', ')', '^'), and runs of characters that do not
      // include any of the above.
      var parts = regex.source.match(
          new RegExp(
              '(?:'
              + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'  // a character set
              + '|\\\\u[A-Fa-f0-9]{4}'  // a unicode escape
              + '|\\\\x[A-Fa-f0-9]{2}'  // a hex escape
              + '|\\\\[0-9]+'  // a back-reference or octal escape
              + '|\\\\[^ux0-9]'  // other escape sequence
              + '|\\(\\?[:!=]'  // start of a non-capturing group
              + '|[\\(\\)\\^]'  // start/emd of a group, or line start
              + '|[^\\x5B\\x5C\\(\\)\\^]+'  // run of other characters
              + ')',
              'g'));
      var n = parts.length;
  
      // Maps captured group numbers to the number they will occupy in
      // the output or to -1 if that has not been determined, or to
      // undefined if they need not be capturing in the output.
      var capturedGroups = [];
  
      // Walk over and identify back references to build the capturedGroups
      // mapping.
      for (var i = 0, groupIndex = 0; i < n; ++i) {
        var p = parts[i];
        if (p === '(') {
          // groups are 1-indexed, so max group index is count of '('
          ++groupIndex;
        } else if ('\\' === p.charAt(0)) {
          var decimalValue = +p.substring(1);
          if (decimalValue && decimalValue <= groupIndex) {
            capturedGroups[decimalValue] = -1;
          }
        }
      }
  
      // Renumber groups and reduce capturing groups to non-capturing groups
      // where possible.
      for (var i = 1; i < capturedGroups.length; ++i) {
        if (-1 === capturedGroups[i]) {
          capturedGroups[i] = ++capturedGroupIndex;
        }
      }
      for (var i = 0, groupIndex = 0; i < n; ++i) {
        var p = parts[i];
        if (p === '(') {
          ++groupIndex;
          if (capturedGroups[groupIndex] === undefined) {
            parts[i] = '(?:';
          }
        } else if ('\\' === p.charAt(0)) {
          var decimalValue = +p.substring(1);
          if (decimalValue && decimalValue <= groupIndex) {
            parts[i] = '\\' + capturedGroups[groupIndex];
          }
        }
      }
  
      // Remove any prefix anchors so that the output will match anywhere.
      // ^^ really does mean an anchored match though.
      for (var i = 0, groupIndex = 0; i < n; ++i) {
        if ('^' === parts[i] && '^' !== parts[i + 1]) { parts[i] = ''; }
      }
  
      // Expand letters to groups to handle mixing of case-sensitive and
      // case-insensitive patterns if necessary.
      if (regex.ignoreCase && needToFoldCase) {
        for (var i = 0; i < n; ++i) {
          var p = parts[i];
          var ch0 = p.charAt(0);
          if (p.length >= 2 && ch0 === '[') {
            parts[i] = caseFoldCharset(p);
          } else if (ch0 !== '\\') {
            // TODO: handle letters in numeric escapes.
            parts[i] = p.replace(
                /[a-zA-Z]/g,
                function (ch) {
                  var cc = ch.charCodeAt(0);
                  return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';
                });
          }
        }
      }
  
      return parts.join('');
    }
  
    var rewritten = [];
    for (var i = 0, n = regexs.length; i < n; ++i) {
      var regex = regexs[i];
      if (regex.global || regex.multiline) { throw new Error('' + regex); }
      rewritten.push(
          '(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');
    }
  
    return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');
  }


  /**
   * Split markup into a string of source code and an array mapping ranges in
   * that string to the text nodes in which they appear.
   *
   * <p>
   * The HTML DOM structure:</p>
   * <pre>
   * (Element   "p"
   *   (Element "b"
   *     (Text  "print "))       ; #1
   *   (Text    "'Hello '")      ; #2
   *   (Element "br")            ; #3
   *   (Text    "  + 'World';")) ; #4
   * </pre>
   * <p>
   * corresponds to the HTML
   * {@code <p><b>print </b>'Hello '<br>  + 'World';</p>}.</p>
   *
   * <p>
   * It will produce the output:</p>
   * <pre>
   * {
   *   sourceCode: "print 'Hello '\n  + 'World';",
   *   //                 1         2
   *   //       012345678901234 5678901234567
   *   spans: [0, #1, 6, #2, 14, #3, 15, #4]
   * }
   * </pre>
   * <p>
   * where #1 is a reference to the {@code "print "} text node above, and so
   * on for the other text nodes.
   * </p>
   *
   * <p>
   * The {@code} spans array is an array of pairs.  Even elements are the start
   * indices of substrings, and odd elements are the text nodes (or BR elements)
   * that contain the text for those substrings.
   * Substrings continue until the next index or the end of the source.
   * </p>
   *
   * @param {Node} node an HTML DOM subtree containing source-code.
   * @return {Object} source code and the text nodes in which they occur.
   */
  function extractSourceSpans(node) {
    var nocode = /(?:^|\s)nocode(?:\s|$)/;
  
    var chunks = [];
    var length = 0;
    var spans = [];
    var k = 0;
  
    var whitespace;
    if (node.currentStyle) {
      whitespace = node.currentStyle.whiteSpace;
    } else if (window.getComputedStyle) {
      whitespace = document.defaultView.getComputedStyle(node, null)
          .getPropertyValue('white-space');
    }
    var isPreformatted = whitespace && 'pre' === whitespace.substring(0, 3);
  
    function walk(node) {
      switch (node.nodeType) {
        case 1:  // Element
          if (nocode.test(node.className)) { return; }
          for (var child = node.firstChild; child; child = child.nextSibling) {
            walk(child);
          }
          var nodeName = node.nodeName;
          if ('BR' === nodeName || 'LI' === nodeName) {
            chunks[k] = '\n';
            spans[k << 1] = length++;
            spans[(k++ << 1) | 1] = node;
          }
          break;
        case 3: case 4:  // Text
          var text = node.nodeValue;
          if (text.length) {
            if (!isPreformatted) {
              text = text.replace(/[ \t\r\n]+/g, ' ');
            } else {
              text = text.replace(/\r\n?/g, '\n');  // Normalize newlines.
            }
            // TODO: handle tabs here?
            chunks[k] = text;
            spans[k << 1] = length;
            length += text.length;
            spans[(k++ << 1) | 1] = node;
          }
          break;
      }
    }
  
    walk(node);
  
    return {
      sourceCode: chunks.join('').replace(/\n$/, ''),
      spans: spans
    };
  }


  /**
   * Apply the given language handler to sourceCode and add the resulting
   * decorations to out.
   * @param {number} basePos the index of sourceCode within the chunk of source
   *    whose decorations are already present on out.
   */
  function appendDecorations(basePos, sourceCode, langHandler, out) {
    if (!sourceCode) { return; }
    var job = {
      sourceCode: sourceCode,
      basePos: basePos
    };
    langHandler(job);
    out.push.apply(out, job.decorations);
  }

  var notWs = /\S/;

  /**
   * Given an element, if it contains only one child element and any text nodes
   * it contains contain only space characters, return the sole child element.
   * Otherwise returns undefined.
   * <p>
   * This is meant to return the CODE element in {@code <pre><code ...>} when
   * there is a single child element that contains all the non-space textual
   * content, but not to return anything where there are multiple child elements
   * as in {@code <pre><code>...</code><code>...</code></pre>} or when there
   * is textual content.
   */
  function childContentWrapper(element) {
    var wrapper = undefined;
    for (var c = element.firstChild; c; c = c.nextSibling) {
      var type = c.nodeType;
      wrapper = (type === 1)  // Element Node
          ? (wrapper ? element : c)
          : (type === 3)  // Text Node
          ? (notWs.test(c.nodeValue) ? element : wrapper)
          : wrapper;
    }
    return wrapper === element ? undefined : wrapper;
  }

  /** Given triples of [style, pattern, context] returns a lexing function,
    * The lexing function interprets the patterns to find token boundaries and
    * returns a decoration list of the form
    * [index_0, style_0, index_1, style_1, ..., index_n, style_n]
    * where index_n is an index into the sourceCode, and style_n is a style
    * constant like PR_PLAIN.  index_n-1 <= index_n, and style_n-1 applies to
    * all characters in sourceCode[index_n-1:index_n].
    *
    * The stylePatterns is a list whose elements have the form
    * [style : string, pattern : RegExp, DEPRECATED, shortcut : string].
    *
    * Style is a style constant like PR_PLAIN, or can be a string of the
    * form 'lang-FOO', where FOO is a language extension describing the
    * language of the portion of the token in $1 after pattern executes.
    * E.g., if style is 'lang-lisp', and group 1 contains the text
    * '(hello (world))', then that portion of the token will be passed to the
    * registered lisp handler for formatting.
    * The text before and after group 1 will be restyled using this decorator
    * so decorators should take care that this doesn't result in infinite
    * recursion.  For example, the HTML lexer rule for SCRIPT elements looks
    * something like ['lang-js', /<[s]cript>(.+?)<\/script>/].  This may match
    * '<script>foo()<\/script>', which would cause the current decorator to
    * be called with '<script>' which would not match the same rule since
    * group 1 must not be empty, so it would be instead styled as PR_TAG by
    * the generic tag rule.  The handler registered for the 'js' extension would
    * then be called with 'foo()', and finally, the current decorator would
    * be called with '<\/script>' which would not match the original rule and
    * so the generic tag rule would identify it as a tag.
    *
    * Pattern must only match prefixes, and if it matches a prefix, then that
    * match is considered a token with the same style.
    *
    * Context is applied to the last non-whitespace, non-comment token
    * recognized.
    *
    * Shortcut is an optional string of characters, any of which, if the first
    * character, gurantee that this pattern and only this pattern matches.
    *
    * @param {Array} shortcutStylePatterns patterns that always start with
    *   a known character.  Must have a shortcut string.
    * @param {Array} fallthroughStylePatterns patterns that will be tried in
    *   order if the shortcut ones fail.  May have shortcuts.
    *
    * @return {function (Object)} a
    *   function that takes source code and returns a list of decorations.
    */
  function createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns) {
    var shortcuts = {};
    var tokenizer;
    (function () {
      var allPatterns = shortcutStylePatterns.concat(fallthroughStylePatterns);
      var allRegexs = [];
      var regexKeys = {};
      for (var i = 0, n = allPatterns.length; i < n; ++i) {
        var patternParts = allPatterns[i];
        var shortcutChars = patternParts[3];
        if (shortcutChars) {
          for (var c = shortcutChars.length; --c >= 0;) {
            shortcuts[shortcutChars.charAt(c)] = patternParts;
          }
        }
        var regex = patternParts[1];
        var k = '' + regex;
        if (!regexKeys.hasOwnProperty(k)) {
          allRegexs.push(regex);
          regexKeys[k] = null;
        }
      }
      allRegexs.push(/[\0-\uffff]/);
      tokenizer = combinePrefixPatterns(allRegexs);
    })();

    var nPatterns = fallthroughStylePatterns.length;

    /**
     * Lexes job.sourceCode and produces an output array job.decorations of
     * style classes preceded by the position at which they start in
     * job.sourceCode in order.
     *
     * @param {Object} job an object like <pre>{
     *    sourceCode: {string} sourceText plain text,
     *    basePos: {int} position of job.sourceCode in the larger chunk of
     *        sourceCode.
     * }</pre>
     */
    var decorate = function (job) {
      var sourceCode = job.sourceCode, basePos = job.basePos;
      /** Even entries are positions in source in ascending order.  Odd enties
        * are style markers (e.g., PR_COMMENT) that run from that position until
        * the end.
        * @type {Array.<number|string>}
        */
      var decorations = [basePos, PR_PLAIN];
      var pos = 0;  // index into sourceCode
      var tokens = sourceCode.match(tokenizer) || [];
      var styleCache = {};

      for (var ti = 0, nTokens = tokens.length; ti < nTokens; ++ti) {
        var token = tokens[ti];
        var style = styleCache[token];
        var match = void 0;

        var isEmbedded;
        if (typeof style === 'string') {
          isEmbedded = false;
        } else {
          var patternParts = shortcuts[token.charAt(0)];
          if (patternParts) {
            match = token.match(patternParts[1]);
            style = patternParts[0];
          } else {
            for (var i = 0; i < nPatterns; ++i) {
              patternParts = fallthroughStylePatterns[i];
              match = token.match(patternParts[1]);
              if (match) {
                style = patternParts[0];
                break;
              }
            }

            if (!match) {  // make sure that we make progress
              style = PR_PLAIN;
            }
          }

          isEmbedded = style.length >= 5 && 'lang-' === style.substring(0, 5);
          if (isEmbedded && !(match && typeof match[1] === 'string')) {
            isEmbedded = false;
            style = PR_SOURCE;
          }

          if (!isEmbedded) { styleCache[token] = style; }
        }

        var tokenStart = pos;
        pos += token.length;

        if (!isEmbedded) {
          decorations.push(basePos + tokenStart, style);
        } else {  // Treat group 1 as an embedded block of source code.
          var embeddedSource = match[1];
          var embeddedSourceStart = token.indexOf(embeddedSource);
          var embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;
          if (match[2]) {
            // If embeddedSource can be blank, then it would match at the
            // beginning which would cause us to infinitely recurse on the
            // entire token, so we catch the right context in match[2].
            embeddedSourceEnd = token.length - match[2].length;
            embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;
          }
          var lang = style.substring(5);
          // Decorate the left of the embedded source
          appendDecorations(
              basePos + tokenStart,
              token.substring(0, embeddedSourceStart),
              decorate, decorations);
          // Decorate the embedded source
          appendDecorations(
              basePos + tokenStart + embeddedSourceStart,
              embeddedSource,
              langHandlerForExtension(lang, embeddedSource),
              decorations);
          // Decorate the right of the embedded section
          appendDecorations(
              basePos + tokenStart + embeddedSourceEnd,
              token.substring(embeddedSourceEnd),
              decorate, decorations);
        }
      }
      job.decorations = decorations;
    };
    return decorate;
  }

  /** returns a function that produces a list of decorations from source text.
    *
    * This code treats ", ', and ` as string delimiters, and \ as a string
    * escape.  It does not recognize perl's qq() style strings.
    * It has no special handling for double delimiter escapes as in basic, or
    * the tripled delimiters used in python, but should work on those regardless
    * although in those cases a single string literal may be broken up into
    * multiple adjacent string literals.
    *
    * It recognizes C, C++, and shell style comments.
    *
    * @param {Object} options a set of optional parameters.
    * @return {function (Object)} a function that examines the source code
    *     in the input job and builds the decoration list.
    */
  function sourceDecorator(options) {
    var shortcutStylePatterns = [], fallthroughStylePatterns = [];
    if (options['tripleQuotedStrings']) {
      // '''multi-line-string''', 'single-line-string', and double-quoted
      shortcutStylePatterns.push(
          [PR_STRING,  /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,
           null, '\'"']);
    } else if (options['multiLineStrings']) {
      // 'multi-line-string', "multi-line-string"
      shortcutStylePatterns.push(
          [PR_STRING,  /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,
           null, '\'"`']);
    } else {
      // 'single-line-string', "single-line-string"
      shortcutStylePatterns.push(
          [PR_STRING,
           /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,
           null, '"\'']);
    }
    if (options['verbatimStrings']) {
      // verbatim-string-literal production from the C# grammar.  See issue 93.
      fallthroughStylePatterns.push(
          [PR_STRING, /^@\"(?:[^\"]|\"\")*(?:\"|$)/, null]);
    }
    var hc = options['hashComments'];
    if (hc) {
      if (options['cStyleComments']) {
        if (hc > 1) {  // multiline hash comments
          shortcutStylePatterns.push(
              [PR_COMMENT, /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, null, '#']);
        } else {
          // Stop C preprocessor declarations at an unclosed open comment
          shortcutStylePatterns.push(
              [PR_COMMENT, /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/,
               null, '#']);
        }
        fallthroughStylePatterns.push(
            [PR_STRING,
             /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/,
             null]);
      } else {
        shortcutStylePatterns.push([PR_COMMENT, /^#[^\r\n]*/, null, '#']);
      }
    }
    if (options['cStyleComments']) {
      fallthroughStylePatterns.push([PR_COMMENT, /^\/\/[^\r\n]*/, null]);
      fallthroughStylePatterns.push(
          [PR_COMMENT, /^\/\*[\s\S]*?(?:\*\/|$)/, null]);
    }
    if (options['regexLiterals']) {
      /**
       * @const
       */
      var REGEX_LITERAL = (
          // A regular expression literal starts with a slash that is
          // not followed by * or / so that it is not confused with
          // comments.
          '/(?=[^/*])'
          // and then contains any number of raw characters,
          + '(?:[^/\\x5B\\x5C]'
          // escape sequences (\x5C),
          +    '|\\x5C[\\s\\S]'
          // or non-nesting character sets (\x5B\x5D);
          +    '|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
          // finally closed by a /.
          + '/');
      fallthroughStylePatterns.push(
          ['lang-regex',
           new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + REGEX_LITERAL + ')')
           ]);
    }

    var types = options['types'];
    if (types) {
      fallthroughStylePatterns.push([PR_TYPE, types]);
    }

    var keywords = ("" + options['keywords']).replace(/^ | $/g, '');
    if (keywords.length) {
      fallthroughStylePatterns.push(
          [PR_KEYWORD,
           new RegExp('^(?:' + keywords.replace(/[\s,]+/g, '|') + ')\\b'),
           null]);
    }

    shortcutStylePatterns.push([PR_PLAIN,       /^\s+/, null, ' \r\n\t\xA0']);
    fallthroughStylePatterns.push(
        // TODO(mikesamuel): recognize non-latin letters and numerals in idents
        [PR_LITERAL,     /^@[a-z_$][a-z_$@0-9]*/i, null],
        [PR_TYPE,        /^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/, null],
        [PR_PLAIN,       /^[a-z_$][a-z_$@0-9]*/i, null],
        [PR_LITERAL,
         new RegExp(
             '^(?:'
             // A hex number
             + '0x[a-f0-9]+'
             // or an octal or decimal number,
             + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
             // possibly in scientific notation
             + '(?:e[+\\-]?\\d+)?'
             + ')'
             // with an optional modifier like UL for unsigned long
             + '[a-z]*', 'i'),
         null, '0123456789'],
        // Don't treat escaped quotes in bash as starting strings.  See issue 144.
        [PR_PLAIN,       /^\\[\s\S]?/, null],
        [PR_PUNCTUATION, /^.[^\s\w\.$@\'\"\`\/\#\\]*/, null]);

    return createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns);
  }

  var decorateSource = sourceDecorator({
        'keywords': ALL_KEYWORDS,
        'hashComments': true,
        'cStyleComments': true,
        'multiLineStrings': true,
        'regexLiterals': true
      });

  /**
   * Given a DOM subtree, wraps it in a list, and puts each line into its own
   * list item.
   *
   * @param {Node} node modified in place.  Its content is pulled into an
   *     HTMLOListElement, and each line is moved into a separate list item.
   *     This requires cloning elements, so the input might not have unique
   *     IDs after numbering.
   */
  function numberLines(node, opt_startLineNum) {
    var nocode = /(?:^|\s)nocode(?:\s|$)/;
    var lineBreak = /\r\n?|\n/;
  
    var document = node.ownerDocument;
  
    var whitespace;
    if (node.currentStyle) {
      whitespace = node.currentStyle.whiteSpace;
    } else if (window.getComputedStyle) {
      whitespace = document.defaultView.getComputedStyle(node, null)
          .getPropertyValue('white-space');
    }
    // If it's preformatted, then we need to split lines on line breaks
    // in addition to <BR>s.
    var isPreformatted = whitespace && 'pre' === whitespace.substring(0, 3);
  
    var li = document.createElement('LI');
    while (node.firstChild) {
      li.appendChild(node.firstChild);
    }
    // An array of lines.  We split below, so this is initialized to one
    // un-split line.
    var listItems = [li];
  
    function walk(node) {
      switch (node.nodeType) {
        case 1:  // Element
          if (nocode.test(node.className)) { break; }
          if ('BR' === node.nodeName) {
            breakAfter(node);
            // Discard the <BR> since it is now flush against a </LI>.
            if (node.parentNode) {
              node.parentNode.removeChild(node);
            }
          } else {
            for (var child = node.firstChild; child; child = child.nextSibling) {
              walk(child);
            }
          }
          break;
        case 3: case 4:  // Text
          if (isPreformatted) {
            var text = node.nodeValue;
            var match = text.match(lineBreak);
            if (match) {
              var firstLine = text.substring(0, match.index);
              node.nodeValue = firstLine;
              var tail = text.substring(match.index + match[0].length);
              if (tail) {
                var parent = node.parentNode;
                parent.insertBefore(
                    document.createTextNode(tail), node.nextSibling);
              }
              breakAfter(node);
              if (!firstLine) {
                // Don't leave blank text nodes in the DOM.
                node.parentNode.removeChild(node);
              }
            }
          }
          break;
      }
    }
  
    // Split a line after the given node.
    function breakAfter(lineEndNode) {
      // If there's nothing to the right, then we can skip ending the line
      // here, and move root-wards since splitting just before an end-tag
      // would require us to create a bunch of empty copies.
      while (!lineEndNode.nextSibling) {
        lineEndNode = lineEndNode.parentNode;
        if (!lineEndNode) { return; }
      }
  
      function breakLeftOf(limit, copy) {
        // Clone shallowly if this node needs to be on both sides of the break.
        var rightSide = copy ? limit.cloneNode(false) : limit;
        var parent = limit.parentNode;
        if (parent) {
          // We clone the parent chain.
          // This helps us resurrect important styling elements that cross lines.
          // E.g. in <i>Foo<br>Bar</i>
          // should be rewritten to <li><i>Foo</i></li><li><i>Bar</i></li>.
          var parentClone = breakLeftOf(parent, 1);
          // Move the clone and everything to the right of the original
          // onto the cloned parent.
          var next = limit.nextSibling;
          parentClone.appendChild(rightSide);
          for (var sibling = next; sibling; sibling = next) {
            next = sibling.nextSibling;
            parentClone.appendChild(sibling);
          }
        }
        return rightSide;
      }
  
      var copiedListItem = breakLeftOf(lineEndNode.nextSibling, 0);
  
      // Walk the parent chain until we reach an unattached LI.
      for (var parent;
           // Check nodeType since IE invents document fragments.
           (parent = copiedListItem.parentNode) && parent.nodeType === 1;) {
        copiedListItem = parent;
      }
      // Put it on the list of lines for later processing.
      listItems.push(copiedListItem);
    }
  
    // Split lines while there are lines left to split.
    for (var i = 0;  // Number of lines that have been split so far.
         i < listItems.length;  // length updated by breakAfter calls.
         ++i) {
      walk(listItems[i]);
    }
  
    // Make sure numeric indices show correctly.
    if (opt_startLineNum === (opt_startLineNum|0)) {
      listItems[0].setAttribute('value', opt_startLineNum);
    }
  
    var ol = document.createElement('OL');
    ol.className = 'linenums';
    var offset = Math.max(0, ((opt_startLineNum - 1 /* zero index */)) | 0) || 0;
    for (var i = 0, n = listItems.length; i < n; ++i) {
      li = listItems[i];
      // Stick a class on the LIs so that stylesheets can
      // color odd/even rows, or any other row pattern that
      // is co-prime with 10.
      li.className = 'L' + ((i + offset) % 10);
      if (!li.firstChild) {
        li.appendChild(document.createTextNode('\xA0'));
      }
      ol.appendChild(li);
    }
  
    node.appendChild(ol);
  }

  /**
   * Breaks {@code job.sourceCode} around style boundaries in
   * {@code job.decorations} and modifies {@code job.sourceNode} in place.
   * @param {Object} job like <pre>{
   *    sourceCode: {string} source as plain text,
   *    spans: {Array.<number|Node>} alternating span start indices into source
   *       and the text node or element (e.g. {@code <BR>}) corresponding to that
   *       span.
   *    decorations: {Array.<number|string} an array of style classes preceded
   *       by the position at which they start in job.sourceCode in order
   * }</pre>
   * @private
   */
  function recombineTagsAndDecorations(job) {
    var isIE = /\bMSIE\b/.test(navigator.userAgent);
    var newlineRe = /\n/g;
  
    var source = job.sourceCode;
    var sourceLength = source.length;
    // Index into source after the last code-unit recombined.
    var sourceIndex = 0;
  
    var spans = job.spans;
    var nSpans = spans.length;
    // Index into spans after the last span which ends at or before sourceIndex.
    var spanIndex = 0;
  
    var decorations = job.decorations;
    var nDecorations = decorations.length;
    // Index into decorations after the last decoration which ends at or before
    // sourceIndex.
    var decorationIndex = 0;
  
    // Remove all zero-length decorations.
    decorations[nDecorations] = sourceLength;
    var decPos, i;
    for (i = decPos = 0; i < nDecorations;) {
      if (decorations[i] !== decorations[i + 2]) {
        decorations[decPos++] = decorations[i++];
        decorations[decPos++] = decorations[i++];
      } else {
        i += 2;
      }
    }
    nDecorations = decPos;
  
    // Simplify decorations.
    for (i = decPos = 0; i < nDecorations;) {
      var startPos = decorations[i];
      // Conflate all adjacent decorations that use the same style.
      var startDec = decorations[i + 1];
      var end = i + 2;
      while (end + 2 <= nDecorations && decorations[end + 1] === startDec) {
        end += 2;
      }
      decorations[decPos++] = startPos;
      decorations[decPos++] = startDec;
      i = end;
    }
  
    nDecorations = decorations.length = decPos;
  
    var decoration = null;
    while (spanIndex < nSpans) {
      var spanStart = spans[spanIndex];
      var spanEnd = spans[spanIndex + 2] || sourceLength;
  
      var decStart = decorations[decorationIndex];
      var decEnd = decorations[decorationIndex + 2] || sourceLength;
  
      var end = Math.min(spanEnd, decEnd);
  
      var textNode = spans[spanIndex + 1];
      var styledText;
      if (textNode.nodeType !== 1  // Don't muck with <BR>s or <LI>s
          // Don't introduce spans around empty text nodes.
          && (styledText = source.substring(sourceIndex, end))) {
        // This may seem bizarre, and it is.  Emitting LF on IE causes the
        // code to display with spaces instead of line breaks.
        // Emitting Windows standard issue linebreaks (CRLF) causes a blank
        // space to appear at the beginning of every line but the first.
        // Emitting an old Mac OS 9 line separator makes everything spiffy.
        if (isIE) { styledText = styledText.replace(newlineRe, '\r'); }
        textNode.nodeValue = styledText;
        var document = textNode.ownerDocument;
        var span = document.createElement('SPAN');
        span.className = decorations[decorationIndex + 1];
        var parentNode = textNode.parentNode;
        parentNode.replaceChild(span, textNode);
        span.appendChild(textNode);
        if (sourceIndex < spanEnd) {  // Split off a text node.
          spans[spanIndex + 1] = textNode
              // TODO: Possibly optimize by using '' if there's no flicker.
              = document.createTextNode(source.substring(end, spanEnd));
          parentNode.insertBefore(textNode, span.nextSibling);
        }
      }
  
      sourceIndex = end;
  
      if (sourceIndex >= spanEnd) {
        spanIndex += 2;
      }
      if (sourceIndex >= decEnd) {
        decorationIndex += 2;
      }
    }
  }


  /** Maps language-specific file extensions to handlers. */
  var langHandlerRegistry = {};
  /** Register a language handler for the given file extensions.
    * @param {function (Object)} handler a function from source code to a list
    *      of decorations.  Takes a single argument job which describes the
    *      state of the computation.   The single parameter has the form
    *      {@code {
    *        sourceCode: {string} as plain text.
    *        decorations: {Array.<number|string>} an array of style classes
    *                     preceded by the position at which they start in
    *                     job.sourceCode in order.
    *                     The language handler should assigned this field.
    *        basePos: {int} the position of source in the larger source chunk.
    *                 All positions in the output decorations array are relative
    *                 to the larger source chunk.
    *      } }
    * @param {Array.<string>} fileExtensions
    */
  function registerLangHandler(handler, fileExtensions) {
    for (var i = fileExtensions.length; --i >= 0;) {
      var ext = fileExtensions[i];
      if (!langHandlerRegistry.hasOwnProperty(ext)) {
        langHandlerRegistry[ext] = handler;
      } else if (window['console']) {
        console['warn']('cannot override language handler %s', ext);
      }
    }
  }
  function langHandlerForExtension(extension, source) {
    if (!(extension && langHandlerRegistry.hasOwnProperty(extension))) {
      // Treat it as markup if the first non whitespace character is a < and
      // the last non-whitespace character is a >.
      extension = /^\s*</.test(source)
          ? 'default-markup'
          : 'default-code';
    }
    return langHandlerRegistry[extension];
  }
  registerLangHandler(decorateSource, ['default-code']);
  registerLangHandler(
      createSimpleLexer(
          [],
          [
           [PR_PLAIN,       /^[^<?]+/],
           [PR_DECLARATION, /^<!\w[^>]*(?:>|$)/],
           [PR_COMMENT,     /^<\!--[\s\S]*?(?:-\->|$)/],
           // Unescaped content in an unknown language
           ['lang-',        /^<\?([\s\S]+?)(?:\?>|$)/],
           ['lang-',        /^<%([\s\S]+?)(?:%>|$)/],
           [PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/],
           ['lang-',        /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
           // Unescaped content in javascript.  (Or possibly vbscript).
           ['lang-js',      /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
           // Contains unescaped stylesheet content
           ['lang-css',     /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
           ['lang-in.tag',  /^(<\/?[a-z][^<>]*>)/i]
          ]),
      ['default-markup', 'htm', 'html', 'mxml', 'xhtml', 'xml', 'xsl']);
  registerLangHandler(
      createSimpleLexer(
          [
           [PR_PLAIN,        /^[\s]+/, null, ' \t\r\n'],
           [PR_ATTRIB_VALUE, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, null, '\"\'']
           ],
          [
           [PR_TAG,          /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
           [PR_ATTRIB_NAME,  /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
           ['lang-uq.val',   /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],
           [PR_PUNCTUATION,  /^[=<>\/]+/],
           ['lang-js',       /^on\w+\s*=\s*\"([^\"]+)\"/i],
           ['lang-js',       /^on\w+\s*=\s*\'([^\']+)\'/i],
           ['lang-js',       /^on\w+\s*=\s*([^\"\'>\s]+)/i],
           ['lang-css',      /^style\s*=\s*\"([^\"]+)\"/i],
           ['lang-css',      /^style\s*=\s*\'([^\']+)\'/i],
           ['lang-css',      /^style\s*=\s*([^\"\'>\s]+)/i]
           ]),
      ['in.tag']);
  registerLangHandler(
      createSimpleLexer([], [[PR_ATTRIB_VALUE, /^[\s\S]+/]]), ['uq.val']);
  registerLangHandler(sourceDecorator({
          'keywords': CPP_KEYWORDS,
          'hashComments': true,
          'cStyleComments': true,
          'types': C_TYPES
        }), ['c', 'cc', 'cpp', 'cxx', 'cyc', 'm']);
  registerLangHandler(sourceDecorator({
          'keywords': 'null,true,false'
        }), ['json']);
  registerLangHandler(sourceDecorator({
          'keywords': CSHARP_KEYWORDS,
          'hashComments': true,
          'cStyleComments': true,
          'verbatimStrings': true,
          'types': C_TYPES
        }), ['cs']);
  registerLangHandler(sourceDecorator({
          'keywords': JAVA_KEYWORDS,
          'cStyleComments': true
        }), ['java']);
  registerLangHandler(sourceDecorator({
          'keywords': SH_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true
        }), ['bsh', 'csh', 'sh']);
  registerLangHandler(sourceDecorator({
          'keywords': PYTHON_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'tripleQuotedStrings': true
        }), ['cv', 'py']);
  registerLangHandler(sourceDecorator({
          'keywords': PERL_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'regexLiterals': true
        }), ['perl', 'pl', 'pm']);
  registerLangHandler(sourceDecorator({
          'keywords': RUBY_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'regexLiterals': true
        }), ['rb']);
  registerLangHandler(sourceDecorator({
          'keywords': JSCRIPT_KEYWORDS,
          'cStyleComments': true,
          'regexLiterals': true
        }), ['js']);
  registerLangHandler(sourceDecorator({
          'keywords': COFFEE_KEYWORDS,
          'hashComments': 3,  // ### style block comments
          'cStyleComments': true,
          'multilineStrings': true,
          'tripleQuotedStrings': true,
          'regexLiterals': true
        }), ['coffee']);
  registerLangHandler(createSimpleLexer([], [[PR_STRING, /^[\s\S]+/]]), ['regex']);

  function applyDecorator(job) {
    var opt_langExtension = job.langExtension;

    try {
      // Extract tags, and convert the source code to plain text.
      var sourceAndSpans = extractSourceSpans(job.sourceNode);
      /** Plain text. @type {string} */
      var source = sourceAndSpans.sourceCode;
      job.sourceCode = source;
      job.spans = sourceAndSpans.spans;
      job.basePos = 0;

      // Apply the appropriate language handler
      langHandlerForExtension(opt_langExtension, source)(job);

      // Integrate the decorations and tags back into the source code,
      // modifying the sourceNode in place.
      recombineTagsAndDecorations(job);
    } catch (e) {
      if ('console' in window) {
        console['log'](e && e['stack'] ? e['stack'] : e);
      }
    }
  }

  /**
   * @param sourceCodeHtml {string} The HTML to pretty print.
   * @param opt_langExtension {string} The language name to use.
   *     Typically, a filename extension like 'cpp' or 'java'.
   * @param opt_numberLines {number|boolean} True to number lines,
   *     or the 1-indexed number of the first line in sourceCodeHtml.
   */
  function prettyPrintOne(sourceCodeHtml, opt_langExtension, opt_numberLines) {
    var container = document.createElement('PRE');
    // This could cause images to load and onload listeners to fire.
    // E.g. <img onerror="alert(1337)" src="nosuchimage.png">.
    // We assume that the inner HTML is from a trusted source.
    container.innerHTML = sourceCodeHtml;
    if (opt_numberLines) {
      numberLines(container, opt_numberLines);
    }

    var job = {
      langExtension: opt_langExtension,
      numberLines: opt_numberLines,
      sourceNode: container
    };
    applyDecorator(job);
    return container.innerHTML;
  }

  function prettyPrint(opt_whenDone) {
    function byTagName(tn) { return document.getElementsByTagName(tn); }
    // fetch a list of nodes to rewrite
    var codeSegments = [byTagName('pre'), byTagName('code'), byTagName('xmp')];
    var elements = [];
    for (var i = 0; i < codeSegments.length; ++i) {
      for (var j = 0, n = codeSegments[i].length; j < n; ++j) {
        elements.push(codeSegments[i][j]);
      }
    }
    codeSegments = null;

    var clock = Date;
    if (!clock['now']) {
      clock = { 'now': function () { return +(new Date); } };
    }

    // The loop is broken into a series of continuations to make sure that we
    // don't make the browser unresponsive when rewriting a large page.
    var k = 0;
    var prettyPrintingJob;

    var langExtensionRe = /\blang(?:uage)?-([\w.]+)(?!\S)/;
    var prettyPrintRe = /\bprettyprint\b/;

    function doWork() {
      var endTime = (window['PR_SHOULD_USE_CONTINUATION'] ?
                     clock['now']() + 250 /* ms */ :
                     Infinity);
      for (; k < elements.length && clock['now']() < endTime; k++) {
        var cs = elements[k];
        var className = cs.className;
        if (className.indexOf('prettyprint') >= 0) {
          // If the classes includes a language extensions, use it.
          // Language extensions can be specified like
          //     <pre class="prettyprint lang-cpp">
          // the language extension "cpp" is used to find a language handler as
          // passed to PR.registerLangHandler.
          // HTML5 recommends that a language be specified using "language-"
          // as the prefix instead.  Google Code Prettify supports both.
          // http://dev.w3.org/html5/spec-author-view/the-code-element.html
          var langExtension = className.match(langExtensionRe);
          // Support <pre class="prettyprint"><code class="language-c">
          var wrapper;
          if (!langExtension && (wrapper = childContentWrapper(cs))
              && "CODE" === wrapper.tagName) {
            langExtension = wrapper.className.match(langExtensionRe);
          }

          if (langExtension) {
            langExtension = langExtension[1];
          }

          // make sure this is not nested in an already prettified element
          var nested = false;
          for (var p = cs.parentNode; p; p = p.parentNode) {
            if ((p.tagName === 'pre' || p.tagName === 'code' ||
                 p.tagName === 'xmp') &&
                p.className && p.className.indexOf('prettyprint') >= 0) {
              nested = true;
              break;
            }
          }
          if (!nested) {
            // Look for a class like linenums or linenums:<n> where <n> is the
            // 1-indexed number of the first line.
            var lineNums = cs.className.match(/\blinenums\b(?::(\d+))?/);
            lineNums = lineNums
                  ? lineNums[1] && lineNums[1].length ? +lineNums[1] : true
                  : false;
            if (lineNums) { numberLines(cs, lineNums); }

            // do the pretty printing
            prettyPrintingJob = {
              langExtension: langExtension,
              sourceNode: cs,
              numberLines: lineNums
            };
            applyDecorator(prettyPrintingJob);
          }
        }
      }
      if (k < elements.length) {
        // finish up in a continuation
        setTimeout(doWork, 250);
      } else if (opt_whenDone) {
        opt_whenDone();
      }
    }

    doWork();
  }

   /**
    * Find all the {@code <pre>} and {@code <code>} tags in the DOM with
    * {@code class=prettyprint} and prettify them.
    *
    * @param {Function?} opt_whenDone if specified, called when the last entry
    *     has been finished.
    */
  window['prettyPrintOne'] = prettyPrintOne;
   /**
    * Pretty print a chunk of code.
    *
    * @param {string} sourceCodeHtml code as html
    * @return {string} code as html, but prettier
    */
  window['prettyPrint'] = prettyPrint;
   /**
    * Contains functions for creating and registering new language handlers.
    * @type {Object}
    */
  window['PR'] = {
        'createSimpleLexer': createSimpleLexer,
        'registerLangHandler': registerLangHandler,
        'sourceDecorator': sourceDecorator,
        'PR_ATTRIB_NAME': PR_ATTRIB_NAME,
        'PR_ATTRIB_VALUE': PR_ATTRIB_VALUE,
        'PR_COMMENT': PR_COMMENT,
        'PR_DECLARATION': PR_DECLARATION,
        'PR_KEYWORD': PR_KEYWORD,
        'PR_LITERAL': PR_LITERAL,
        'PR_NOCODE': PR_NOCODE,
        'PR_PLAIN': PR_PLAIN,
        'PR_PUNCTUATION': PR_PUNCTUATION,
        'PR_SOURCE': PR_SOURCE,
        'PR_STRING': PR_STRING,
        'PR_TAG': PR_TAG,
        'PR_TYPE': PR_TYPE
      };
})();

;
/* ------------------------------------------------------------------------
	Class: prettyPhoto
	Use: Lightbox clone for jQuery
	Author: Stephane Caron (http://www.no-margin-for-errors.com)
	Version: 3.1.4
------------------------------------------------------------------------- */

(function($){$.prettyPhoto={version:'3.1.4'};$.fn.prettyPhoto=function(pp_settings){pp_settings=jQuery.extend({hook:'rel',animation_speed:'fast',ajaxcallback:function(){},slideshow:5000,autoplay_slideshow:false,opacity:0.80,show_title:true,allow_resize:true,allow_expand:true,default_width:500,default_height:344,counter_separator_label:'/',theme:'pp_default',horizontal_padding:20,hideflash:false,wmode:'opaque',autoplay:true,modal:false,deeplinking:true,overlay_gallery:true,overlay_gallery_max:30,keyboard_shortcuts:true,changepicturecallback:function(){},callback:function(){},ie6_fallback:true,markup:'<div class="pp_pic_holder"> \
      <div class="ppt">&nbsp;</div> \
      <div class="pp_top"> \
       <div class="pp_left"></div> \
       <div class="pp_middle"></div> \
       <div class="pp_right"></div> \
      </div> \
      <div class="pp_content_container"> \
       <div class="pp_left"> \
       <div class="pp_right"> \
        <div class="pp_content"> \
         <div class="pp_loaderIcon"></div> \
         <div class="pp_fade"> \
          <a href="#" class="pp_expand" title="Expand the image">Expand</a> \
          <div class="pp_hoverContainer"> \
           <a class="pp_next" href="#">next</a> \
           <a class="pp_previous" href="#">previous</a> \
          </div> \
          <div id="pp_full_res"></div> \
          <div class="pp_details"> \
           <div class="pp_nav"> \
            <a href="#" class="pp_arrow_previous">Previous</a> \
            <p class="currentTextHolder">0/0</p> \
            <a href="#" class="pp_arrow_next">Next</a> \
           </div> \
           <p class="pp_description"></p> \
           <div class="pp_social">{pp_social}</div> \
           <a class="pp_close" href="#">Close</a> \
          </div> \
         </div> \
        </div> \
       </div> \
       </div> \
      </div> \
      <div class="pp_bottom"> \
       <div class="pp_left"></div> \
       <div class="pp_middle"></div> \
       <div class="pp_right"></div> \
      </div> \
     </div> \
     <div class="pp_overlay"></div>',gallery_markup:'<div class="pp_gallery"> \
        <a href="#" class="pp_arrow_previous">Previous</a> \
        <div> \
         <ul> \
          {gallery} \
         </ul> \
        </div> \
        <a href="#" class="pp_arrow_next">Next</a> \
       </div>',image_markup:'<img id="fullResImage" src="{path}" />',flash_markup:'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',quicktime_markup:'<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',iframe_markup:'<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',inline_markup:'<div class="pp_inline">{content}</div>',custom_markup:'',social_tools:'<div class="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href={location_href}&amp;layout=button_count&amp;show_faces=true&amp;width=500&amp;action=like&amp;font&amp;colorscheme=light&amp;height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div>'},pp_settings);var matchedObjects=this,percentBased=false,pp_dimensions,pp_open,pp_contentHeight,pp_contentWidth,pp_containerHeight,pp_containerWidth,windowHeight=$(window).height(),windowWidth=$(window).width(),pp_slideshow;doresize=true,scroll_pos=_get_scroll();$(window).unbind('resize.prettyphoto').bind('resize.prettyphoto',function(){_center_overlay();_resize_overlay();});if(pp_settings.keyboard_shortcuts){$(document).unbind('keydown.prettyphoto').bind('keydown.prettyphoto',function(e){if(typeof $pp_pic_holder!='undefined'){if($pp_pic_holder.is(':visible')){switch(e.keyCode){case 37:$.prettyPhoto.changePage('previous');e.preventDefault();break;case 39:$.prettyPhoto.changePage('next');e.preventDefault();break;case 27:if(!settings.modal)
$.prettyPhoto.close();e.preventDefault();break;};};};});};$.prettyPhoto.initialize=function(){settings=pp_settings;if(settings.theme=='pp_default')settings.horizontal_padding=16;if(settings.ie6_fallback&&$.browser.msie&&parseInt($.browser.version)==6)settings.theme="light_square";theRel=$(this).attr(settings.hook);galleryRegExp=/\[(?:.*)\]/;isSet=(galleryRegExp.exec(theRel))?true:false;pp_images=(isSet)?jQuery.map(matchedObjects,function(n,i){if($(n).attr(settings.hook).indexOf(theRel)!=-1)return $(n).attr('href');}):$.makeArray($(this).attr('href'));pp_titles=(isSet)?jQuery.map(matchedObjects,function(n,i){if($(n).attr(settings.hook).indexOf(theRel)!=-1)return($(n).find('img').attr('alt'))?$(n).find('img').attr('alt'):"";}):$.makeArray($(this).find('img').attr('alt'));pp_descriptions=(isSet)?jQuery.map(matchedObjects,function(n,i){if($(n).attr(settings.hook).indexOf(theRel)!=-1)return($(n).attr('title'))?$(n).attr('title'):"";}):$.makeArray($(this).attr('title'));if(pp_images.length>settings.overlay_gallery_max)settings.overlay_gallery=false;set_position=jQuery.inArray($(this).attr('href'),pp_images);rel_index=(isSet)?set_position:$("a["+settings.hook+"^='"+theRel+"']").index($(this));_build_overlay(this);if(settings.allow_resize)
$(window).bind('scroll.prettyphoto',function(){_center_overlay();});$.prettyPhoto.open();return false;}
$.prettyPhoto.open=function(event){if(typeof settings=="undefined"){settings=pp_settings;if($.browser.msie&&$.browser.version==6)settings.theme="light_square";pp_images=$.makeArray(arguments[0]);pp_titles=(arguments[1])?$.makeArray(arguments[1]):$.makeArray("");pp_descriptions=(arguments[2])?$.makeArray(arguments[2]):$.makeArray("");isSet=(pp_images.length>1)?true:false;set_position=(arguments[3])?arguments[3]:0;_build_overlay(event.target);}
if($.browser.msie&&$.browser.version==6)$('select').css('visibility','hidden');if(settings.hideflash)$('object,embed,iframe[src*=youtube],iframe[src*=vimeo]').css('visibility','hidden');_checkPosition($(pp_images).size());$('.pp_loaderIcon').show();if(settings.deeplinking)
setHashtag();if(settings.social_tools){facebook_like_link=settings.social_tools.replace('{location_href}',encodeURIComponent(location.href));$pp_pic_holder.find('.pp_social').html(facebook_like_link);}
if($ppt.is(':hidden'))$ppt.css('opacity',0).show();$pp_overlay.show().fadeTo(settings.animation_speed,settings.opacity);$pp_pic_holder.find('.currentTextHolder').text((set_position+1)+settings.counter_separator_label+$(pp_images).size());if(typeof pp_descriptions[set_position]!='undefined'&&pp_descriptions[set_position]!=""){$pp_pic_holder.find('.pp_description').show().html(unescape(pp_descriptions[set_position]));}else{$pp_pic_holder.find('.pp_description').hide();}
movie_width=(parseFloat(getParam('width',pp_images[set_position])))?getParam('width',pp_images[set_position]):settings.default_width.toString();movie_height=(parseFloat(getParam('height',pp_images[set_position])))?getParam('height',pp_images[set_position]):settings.default_height.toString();percentBased=false;if(movie_height.indexOf('%')!=-1){movie_height=parseFloat(($(window).height()*parseFloat(movie_height)/100)-150);percentBased=true;}
if(movie_width.indexOf('%')!=-1){movie_width=parseFloat(($(window).width()*parseFloat(movie_width)/100)-150);percentBased=true;}
$pp_pic_holder.fadeIn(function(){(settings.show_title&&pp_titles[set_position]!=""&&typeof pp_titles[set_position]!="undefined")?$ppt.html(unescape(pp_titles[set_position])):$ppt.html('&nbsp;');imgPreloader="";skipInjection=false;switch(_getFileType(pp_images[set_position])){case'image':imgPreloader=new Image();nextImage=new Image();if(isSet&&set_position<$(pp_images).size()-1)nextImage.src=pp_images[set_position+1];prevImage=new Image();if(isSet&&pp_images[set_position-1])prevImage.src=pp_images[set_position-1];$pp_pic_holder.find('#pp_full_res')[0].innerHTML=settings.image_markup.replace(/{path}/g,pp_images[set_position]);imgPreloader.onload=function(){pp_dimensions=_fitToViewport(imgPreloader.width,imgPreloader.height);_showContent();};imgPreloader.onerror=function(){alert('Image cannot be loaded. Make sure the path is correct and image exist.');$.prettyPhoto.close();};imgPreloader.src=pp_images[set_position];break;case'youtube':pp_dimensions=_fitToViewport(movie_width,movie_height);movie_id=getParam('v',pp_images[set_position]);if(movie_id==""){movie_id=pp_images[set_position].split('youtu.be/');movie_id=movie_id[1];if(movie_id.indexOf('?')>0)
movie_id=movie_id.substr(0,movie_id.indexOf('?'));if(movie_id.indexOf('&')>0)
movie_id=movie_id.substr(0,movie_id.indexOf('&'));}
movie='http://www.youtube.com/embed/'+movie_id;(getParam('rel',pp_images[set_position]))?movie+="?rel="+getParam('rel',pp_images[set_position]):movie+="?rel=1";if(settings.autoplay)movie+="&autoplay=1";toInject=settings.iframe_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);break;case'vimeo':pp_dimensions=_fitToViewport(movie_width,movie_height);movie_id=pp_images[set_position];var regExp=/http:\/\/(www\.)?vimeo.com\/(\d+)/;var match=movie_id.match(regExp);movie='http://player.vimeo.com/video/'+match[2]+'?title=0&amp;byline=0&amp;portrait=0';if(settings.autoplay)movie+="&autoplay=1;";vimeo_width=pp_dimensions['width']+'/embed/?moog_width='+pp_dimensions['width'];toInject=settings.iframe_markup.replace(/{width}/g,vimeo_width).replace(/{height}/g,pp_dimensions['height']).replace(/{path}/g,movie);break;case'quicktime':pp_dimensions=_fitToViewport(movie_width,movie_height);pp_dimensions['height']+=15;pp_dimensions['contentHeight']+=15;pp_dimensions['containerHeight']+=15;toInject=settings.quicktime_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,pp_images[set_position]).replace(/{autoplay}/g,settings.autoplay);break;case'flash':pp_dimensions=_fitToViewport(movie_width,movie_height);flash_vars=pp_images[set_position];flash_vars=flash_vars.substring(pp_images[set_position].indexOf('flashvars')+10,pp_images[set_position].length);filename=pp_images[set_position];filename=filename.substring(0,filename.indexOf('?'));toInject=settings.flash_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+'?'+flash_vars);break;case'iframe':pp_dimensions=_fitToViewport(movie_width,movie_height);frame_url=pp_images[set_position];frame_url=frame_url.substr(0,frame_url.indexOf('iframe')-1);toInject=settings.iframe_markup.replace(/{width}/g,pp_dimensions['width']).replace(/{height}/g,pp_dimensions['height']).replace(/{path}/g,frame_url);break;case'ajax':doresize=false;pp_dimensions=_fitToViewport(movie_width,movie_height);doresize=true;skipInjection=true;$.get(pp_images[set_position],function(responseHTML){toInject=settings.inline_markup.replace(/{content}/g,responseHTML);$pp_pic_holder.find('#pp_full_res')[0].innerHTML=toInject;_showContent();});break;case'custom':pp_dimensions=_fitToViewport(movie_width,movie_height);toInject=settings.custom_markup;break;case'inline':myClone=$(pp_images[set_position]).clone().append('<br clear="all" />').css({'width':settings.default_width}).wrapInner('<div id="pp_full_res"><div class="pp_inline"></div></div>').appendTo($('body')).show();doresize=false;pp_dimensions=_fitToViewport($(myClone).width(),$(myClone).height());doresize=true;$(myClone).remove();toInject=settings.inline_markup.replace(/{content}/g,$(pp_images[set_position]).html());break;};if(!imgPreloader&&!skipInjection){$pp_pic_holder.find('#pp_full_res')[0].innerHTML=toInject;_showContent();};});return false;};$.prettyPhoto.changePage=function(direction){currentGalleryPage=0;if(direction=='previous'){set_position--;if(set_position<0)set_position=$(pp_images).size()-1;}else if(direction=='next'){set_position++;if(set_position>$(pp_images).size()-1)set_position=0;}else{set_position=direction;};rel_index=set_position;if(!doresize)doresize=true;if(settings.allow_expand){$('.pp_contract').removeClass('pp_contract').addClass('pp_expand');}
_hideContent(function(){$.prettyPhoto.open();});};$.prettyPhoto.changeGalleryPage=function(direction){if(direction=='next'){currentGalleryPage++;if(currentGalleryPage>totalPage)currentGalleryPage=0;}else if(direction=='previous'){currentGalleryPage--;if(currentGalleryPage<0)currentGalleryPage=totalPage;}else{currentGalleryPage=direction;};slide_speed=(direction=='next'||direction=='previous')?settings.animation_speed:0;slide_to=currentGalleryPage*(itemsPerPage*itemWidth);$pp_gallery.find('ul').animate({left:-slide_to},slide_speed);};$.prettyPhoto.startSlideshow=function(){if(typeof pp_slideshow=='undefined'){$pp_pic_holder.find('.pp_play').unbind('click').removeClass('pp_play').addClass('pp_pause').click(function(){$.prettyPhoto.stopSlideshow();return false;});pp_slideshow=setInterval($.prettyPhoto.startSlideshow,settings.slideshow);}else{$.prettyPhoto.changePage('next');};}
$.prettyPhoto.stopSlideshow=function(){$pp_pic_holder.find('.pp_pause').unbind('click').removeClass('pp_pause').addClass('pp_play').click(function(){$.prettyPhoto.startSlideshow();return false;});clearInterval(pp_slideshow);pp_slideshow=undefined;}
$.prettyPhoto.close=function(){if($pp_overlay.is(":animated"))return;$.prettyPhoto.stopSlideshow();$pp_pic_holder.stop().find('object,embed').css('visibility','hidden');$('div.pp_pic_holder,div.ppt,.pp_fade').fadeOut(settings.animation_speed,function(){$(this).remove();});$pp_overlay.fadeOut(settings.animation_speed,function(){if($.browser.msie&&$.browser.version==6)$('select').css('visibility','visible');if(settings.hideflash)$('object,embed,iframe[src*=youtube],iframe[src*=vimeo]').css('visibility','visible');$(this).remove();$(window).unbind('scroll.prettyphoto');clearHashtag();settings.callback();doresize=true;pp_open=false;delete settings;});};function _showContent(){$('.pp_loaderIcon').hide();projectedTop=scroll_pos['scrollTop']+((windowHeight/2)-(pp_dimensions['containerHeight']/2));if(projectedTop<0)projectedTop=0;$ppt.fadeTo(settings.animation_speed,1);$pp_pic_holder.find('.pp_content').animate({height:pp_dimensions['contentHeight'],width:pp_dimensions['contentWidth']},settings.animation_speed);$pp_pic_holder.animate({'top':projectedTop,'left':((windowWidth/2)-(pp_dimensions['containerWidth']/2)<0)?0:(windowWidth/2)-(pp_dimensions['containerWidth']/2),width:pp_dimensions['containerWidth']},settings.animation_speed,function(){$pp_pic_holder.find('.pp_hoverContainer,#fullResImage').height(pp_dimensions['height']).width(pp_dimensions['width']);$pp_pic_holder.find('.pp_fade').fadeIn(settings.animation_speed);if(isSet&&_getFileType(pp_images[set_position])=="image"){$pp_pic_holder.find('.pp_hoverContainer').show();}else{$pp_pic_holder.find('.pp_hoverContainer').hide();}
if(settings.allow_expand){if(pp_dimensions['resized']){$('a.pp_expand,a.pp_contract').show();}else{$('a.pp_expand').hide();}}
if(settings.autoplay_slideshow&&!pp_slideshow&&!pp_open)$.prettyPhoto.startSlideshow();settings.changepicturecallback();pp_open=true;});_insert_gallery();pp_settings.ajaxcallback();};function _hideContent(callback){$pp_pic_holder.find('#pp_full_res object,#pp_full_res embed').css('visibility','hidden');$pp_pic_holder.find('.pp_fade').fadeOut(settings.animation_speed,function(){$('.pp_loaderIcon').show();callback();});};function _checkPosition(setCount){(setCount>1)?$('.pp_nav').show():$('.pp_nav').hide();};function _fitToViewport(width,height){resized=false;_getDimensions(width,height);imageWidth=width,imageHeight=height;if(((pp_containerWidth>windowWidth)||(pp_containerHeight>windowHeight))&&doresize&&settings.allow_resize&&!percentBased){resized=true,fitting=false;while(!fitting){if((pp_containerWidth>windowWidth)){imageWidth=(windowWidth-200);imageHeight=(height/width)*imageWidth;}else if((pp_containerHeight>windowHeight)){imageHeight=(windowHeight-200);imageWidth=(width/height)*imageHeight;}else{fitting=true;};pp_containerHeight=imageHeight,pp_containerWidth=imageWidth;};_getDimensions(imageWidth,imageHeight);if((pp_containerWidth>windowWidth)||(pp_containerHeight>windowHeight)){_fitToViewport(pp_containerWidth,pp_containerHeight)};};return{width:Math.floor(imageWidth),height:Math.floor(imageHeight),containerHeight:Math.floor(pp_containerHeight),containerWidth:Math.floor(pp_containerWidth)+(settings.horizontal_padding*2),contentHeight:Math.floor(pp_contentHeight),contentWidth:Math.floor(pp_contentWidth),resized:resized};};function _getDimensions(width,height){width=parseFloat(width);height=parseFloat(height);$pp_details=$pp_pic_holder.find('.pp_details');$pp_details.width(width);detailsHeight=parseFloat($pp_details.css('marginTop'))+parseFloat($pp_details.css('marginBottom'));$pp_details=$pp_details.clone().addClass(settings.theme).width(width).appendTo($('body')).css({'position':'absolute','top':-10000});detailsHeight+=$pp_details.height();detailsHeight=(detailsHeight<=34)?36:detailsHeight;if($.browser.msie&&$.browser.version==7)detailsHeight+=8;$pp_details.remove();$pp_title=$pp_pic_holder.find('.ppt');$pp_title.width(width);titleHeight=parseFloat($pp_title.css('marginTop'))+parseFloat($pp_title.css('marginBottom'));$pp_title=$pp_title.clone().appendTo($('body')).css({'position':'absolute','top':-10000});titleHeight+=$pp_title.height();$pp_title.remove();pp_contentHeight=height+detailsHeight;pp_contentWidth=width;pp_containerHeight=pp_contentHeight+titleHeight+$pp_pic_holder.find('.pp_top').height()+$pp_pic_holder.find('.pp_bottom').height();pp_containerWidth=width;}
function _getFileType(itemSrc){if(itemSrc.match(/youtube\.com\/watch/i)||itemSrc.match(/youtu\.be/i)){return'youtube';}else if(itemSrc.match(/vimeo\.com/i)){return'vimeo';}else if(itemSrc.match(/\b.mov\b/i)){return'quicktime';}else if(itemSrc.match(/\b.swf\b/i)){return'flash';}else if(itemSrc.match(/\biframe=true\b/i)){return'iframe';}else if(itemSrc.match(/\bajax=true\b/i)){return'ajax';}else if(itemSrc.match(/\bcustom=true\b/i)){return'custom';}else if(itemSrc.substr(0,1)=='#'){return'inline';}else{return'image';};};function _center_overlay(){if(doresize&&typeof $pp_pic_holder!='undefined'){scroll_pos=_get_scroll();contentHeight=$pp_pic_holder.height(),contentwidth=$pp_pic_holder.width();projectedTop=(windowHeight/2)+scroll_pos['scrollTop']-(contentHeight/2);if(projectedTop<0)projectedTop=0;if(contentHeight>windowHeight)
return;$pp_pic_holder.css({'top':projectedTop,'left':(windowWidth/2)+scroll_pos['scrollLeft']-(contentwidth/2)});};};function _get_scroll(){if(self.pageYOffset){return{scrollTop:self.pageYOffset,scrollLeft:self.pageXOffset};}else if(document.documentElement&&document.documentElement.scrollTop){return{scrollTop:document.documentElement.scrollTop,scrollLeft:document.documentElement.scrollLeft};}else if(document.body){return{scrollTop:document.body.scrollTop,scrollLeft:document.body.scrollLeft};};};function _resize_overlay(){windowHeight=$(window).height(),windowWidth=$(window).width();if(typeof $pp_overlay!="undefined")$pp_overlay.height($(document).height()).width(windowWidth);};function _insert_gallery(){if(isSet&&settings.overlay_gallery&&_getFileType(pp_images[set_position])=="image"&&(settings.ie6_fallback&&!($.browser.msie&&parseInt($.browser.version)==6))){itemWidth=52+5;navWidth=(settings.theme=="facebook"||settings.theme=="pp_default")?50:30;itemsPerPage=Math.floor((pp_dimensions['containerWidth']-100-navWidth)/itemWidth);itemsPerPage=(itemsPerPage<pp_images.length)?itemsPerPage:pp_images.length;totalPage=Math.ceil(pp_images.length/itemsPerPage)-1;if(totalPage==0){navWidth=0;$pp_gallery.find('.pp_arrow_next,.pp_arrow_previous').hide();}else{$pp_gallery.find('.pp_arrow_next,.pp_arrow_previous').show();};galleryWidth=itemsPerPage*itemWidth;fullGalleryWidth=pp_images.length*itemWidth;$pp_gallery.css('margin-left',-((galleryWidth/2)+(navWidth/2))).find('div:first').width(galleryWidth+5).find('ul').width(fullGalleryWidth).find('li.selected').removeClass('selected');goToPage=(Math.floor(set_position/itemsPerPage)<totalPage)?Math.floor(set_position/itemsPerPage):totalPage;$.prettyPhoto.changeGalleryPage(goToPage);$pp_gallery_li.filter(':eq('+set_position+')').addClass('selected');}else{$pp_pic_holder.find('.pp_content').unbind('mouseenter mouseleave');}}
function _build_overlay(caller){if(settings.social_tools)
facebook_like_link=settings.social_tools.replace('{location_href}',encodeURIComponent(location.href));settings.markup=settings.markup.replace('{pp_social}','');$('body').append(settings.markup);$pp_pic_holder=$('.pp_pic_holder'),$ppt=$('.ppt'),$pp_overlay=$('div.pp_overlay');if(isSet&&settings.overlay_gallery){currentGalleryPage=0;toInject="";for(var i=0;i<pp_images.length;i++){if(!pp_images[i].match(/\b(jpg|jpeg|png|gif)\b/gi)){classname='default';img_src='';}else{classname='';img_src=pp_images[i];}
toInject+="<li class='"+classname+"'><a href='#'><img src='"+img_src+"' width='50' alt='' /></a></li>";};toInject=settings.gallery_markup.replace(/{gallery}/g,toInject);$pp_pic_holder.find('#pp_full_res').after(toInject);$pp_gallery=$('.pp_pic_holder .pp_gallery'),$pp_gallery_li=$pp_gallery.find('li');$pp_gallery.find('.pp_arrow_next').click(function(){$.prettyPhoto.changeGalleryPage('next');$.prettyPhoto.stopSlideshow();return false;});$pp_gallery.find('.pp_arrow_previous').click(function(){$.prettyPhoto.changeGalleryPage('previous');$.prettyPhoto.stopSlideshow();return false;});$pp_pic_holder.find('.pp_content').hover(function(){$pp_pic_holder.find('.pp_gallery:not(.disabled)').fadeIn();},function(){$pp_pic_holder.find('.pp_gallery:not(.disabled)').fadeOut();});itemWidth=52+5;$pp_gallery_li.each(function(i){$(this).find('a').click(function(){$.prettyPhoto.changePage(i);$.prettyPhoto.stopSlideshow();return false;});});};if(settings.slideshow){$pp_pic_holder.find('.pp_nav').prepend('<a href="#" class="pp_play">Play</a>')
$pp_pic_holder.find('.pp_nav .pp_play').click(function(){$.prettyPhoto.startSlideshow();return false;});}
$pp_pic_holder.attr('class','pp_pic_holder '+settings.theme);$pp_overlay.css({'opacity':0,'height':$(document).height(),'width':$(window).width()}).bind('click',function(){if(!settings.modal)$.prettyPhoto.close();});$('a.pp_close').bind('click',function(){$.prettyPhoto.close();return false;});if(settings.allow_expand){$('a.pp_expand').bind('click',function(e){if($(this).hasClass('pp_expand')){$(this).removeClass('pp_expand').addClass('pp_contract');doresize=false;}else{$(this).removeClass('pp_contract').addClass('pp_expand');doresize=true;};_hideContent(function(){$.prettyPhoto.open();});return false;});}
$pp_pic_holder.find('.pp_previous, .pp_nav .pp_arrow_previous').bind('click',function(){$.prettyPhoto.changePage('previous');$.prettyPhoto.stopSlideshow();return false;});$pp_pic_holder.find('.pp_next, .pp_nav .pp_arrow_next').bind('click',function(){$.prettyPhoto.changePage('next');$.prettyPhoto.stopSlideshow();return false;});_center_overlay();};if(!pp_alreadyInitialized&&getHashtag()){pp_alreadyInitialized=true;hashIndex=getHashtag();hashRel=hashIndex;hashIndex=hashIndex.substring(hashIndex.indexOf('/')+1,hashIndex.length-1);hashRel=hashRel.substring(0,hashRel.indexOf('/'));setTimeout(function(){$("a["+pp_settings.hook+"^='"+hashRel+"']:eq("+hashIndex+")").trigger('click');},50);}
return this.unbind('click.prettyphoto').bind('click.prettyphoto',$.prettyPhoto.initialize);};function getHashtag(){url=location.href;hashtag=(url.indexOf('#prettyPhoto')!==-1)?decodeURI(url.substring(url.indexOf('#prettyPhoto')+1,url.length)):false;return hashtag;};function setHashtag(){if(typeof theRel=='undefined')return;location.hash=theRel+'/'+rel_index+'/';};function clearHashtag(){if(location.href.indexOf('#prettyPhoto')!==-1)location.hash="prettyPhoto";}
function getParam(name,url){name=name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var regexS="[\\?&]"+name+"=([^&#]*)";var regex=new RegExp(regexS);var results=regex.exec(url);return(results==null)?"":results[1];}})(jQuery);var pp_alreadyInitialized=false;
;
/*!
* qTip2 - Pretty powerful tooltips
* http://craigsworks.com/projects/qtip2/
*
* Version: nightly
* Copyright 2009-2010 Craig Michael Thompson - http://craigsworks.com
*
* Dual licensed under MIT or GPLv2 licenses
*   http://en.wikipedia.org/wiki/MIT_License
*   http://en.wikipedia.org/wiki/GNU_General_Public_License
*
* Date: Tue Jul  3 15:45:43.0000000000 2012
*//*jslint browser: true, onevar: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true *//*global window: false, jQuery: false, console: false, define: false */(function(a){typeof define==="function"&&define.amd?define(["jquery"],a):a(jQuery)})(function(a){function P(b){var c=this,d=b.elements,e=d.tooltip,f=".bgiframe-"+b.id;a.extend(c,{init:function(){d.bgiframe=a('<iframe class="ui-tooltip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';"  style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0); -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";"></iframe>'),d.bgiframe.appendTo(e),e.bind("tooltipmove"+f,c.adjust)},adjust:function(){var a=b.get("dimensions"),c=b.plugins.tip,f=d.tip,g,h;h=parseInt(e.css("border-left-width"),10)||0,h={left:-h,top:-h},c&&f&&(g=c.corner.precedance==="x"?["width","left"]:["height","top"],h[g[1]]-=f[g[0]]()),d.bgiframe.css(h).css(a)},destroy:function(){d.bgiframe.remove(),e.unbind(f)}}),c.init()}function O(o,p){function I(a){var b=a.precedance===g,c=x[b?h:i],d=x[b?i:h],e=a.string().indexOf(n)>-1,f=c*(e?.5:1),j=Math.pow,k=Math.round,l,m,o,p=Math.sqrt(j(f,2)+j(d,2)),q=[z/f*p,z/d*p];q[2]=Math.sqrt(j(q[0],2)-j(z,2)),q[3]=Math.sqrt(j(q[1],2)-j(z,2)),l=p+q[2]+q[3]+(e?0:q[0]),m=l/p,o=[k(m*d),k(m*c)];return{height:o[b?0:1],width:o[b?1:0]}}function H(b){var c=u.titlebar&&b.y===j,d=c?u.titlebar:u.content,e=a.browser.mozilla,f=e?"-moz-":a.browser.webkit?"-webkit-":"",g=b.y+(e?"":"-")+b.x,h=f+(e?"border-radius-"+g:"border-"+g+"-radius");return parseInt(d.css(h),10)||parseInt(v.css(h),10)||0}function G(a,b,c){b=b?b:a[a.precedance];var d=v.hasClass(C),e=u.titlebar&&a.y===j,f=e?u.titlebar:u.tooltip,g="border-"+b+"-width",h;v.addClass(C),h=parseInt(f.css(g),10),h=(c?h||parseInt(v.css(g),10):h)||0,v.toggleClass(C,d);return h}function F(a,d,h,i){if(u.tip){var p=r.corner.clone(),s=h.adjusted,v=o.options.position.adjust.method.split(" "),x=v[0],y=v[1]||v[0],z={left:c,top:c,x:0,y:0},A,B={},C;r.corner.fixed!==b&&(x===q&&p.precedance===f&&s.left&&p.y!==n?p.precedance=p.precedance===f?g:f:x!==q&&s.left&&(p.x=p.x===n?s.left>0?k:m:p.x===k?m:k),y===q&&p.precedance===g&&s.top&&p.x!==n?p.precedance=p.precedance===g?f:g:y!==q&&s.top&&(p.y=p.y===n?s.top>0?j:l:p.y===j?l:j),p.string()!==w.corner.string()&&(w.top!==s.top||w.left!==s.left)&&r.update(p,c)),A=r.position(p,s),A[p.x]+=G(p,p.x,b),A[p.y]+=G(p,p.y,b),A.right!==e&&(A.left=-A.right),A.bottom!==e&&(A.top=-A.bottom),A.user=Math.max(0,t.offset);if(z.left=x===q&&!!s.left)p.x===n?B["margin-left"]=z.x=A["margin-left"]-s.left:(C=A.right!==e?[s.left,-A.left]:[-s.left,A.left],(z.x=Math.max(C[0],C[1]))>C[0]&&(h.left-=s.left,z.left=c),B[A.right!==e?m:k]=z.x);if(z.top=y===q&&!!s.top)p.y===n?B["margin-top"]=z.y=A["margin-top"]-s.top:(C=A.bottom!==e?[s.top,-A.top]:[-s.top,A.top],(z.y=Math.max(C[0],C[1]))>C[0]&&(h.top-=s.top,z.top=c),B[A.bottom!==e?l:j]=z.y);u.tip.css(B).toggle(!(z.x&&z.y||p.x===n&&z.y||p.y===n&&z.x)),h.left-=A.left.charAt?A.user:x!==q||z.top||!z.left&&!z.top?A.left:0,h.top-=A.top.charAt?A.user:y!==q||z.left||!z.left&&!z.top?A.top:0,w.left=s.left,w.top=s.top,w.corner=p.clone()}}function E(){x.width=t.width,x.height=t.height}function D(){x.width=t.height,x.height=t.width}var r=this,t=o.options.style.tip,u=o.elements,v=u.tooltip,w={top:0,left:0},x={width:t.width,height:t.height},y={},z=t.border||0,A=".qtip-tip",B=!!(a("<canvas />")[0]||{}).getContext;r.mimic=r.corner=d,r.border=z,r.offset=t.offset,r.size=x,o.checks.tip={"^position.my|style.tip.(corner|mimic|border)$":function(){r.init()||r.destroy(),o.reposition()},"^style.tip.(height|width)$":function(){x={width:t.width,height:t.height},r.create(),r.update(),o.reposition()},"^content.title.text|style.(classes|widget)$":function(){u.tip&&u.tip.length&&r.update()}},a.extend(r,{init:function(){var b=r.detectCorner()&&(B||a.browser.msie);b&&(r.create(),r.update(),v.unbind(A).bind("tooltipmove"+A,F));return b},detectCorner:function(){var a=t.corner,d=o.options.position,e=d.at,f=d.my.string?d.my.string():d.my;if(a===c||f===c&&e===c)return c;a===b?r.corner=new s.Corner(f):a.string||(r.corner=new s.Corner(a),r.corner.fixed=b),w.corner=new s.Corner(r.corner.string());return r.corner.string()!=="centercenter"},detectColours:function(b){var c,d,e,f=u.tip.css("cssText",""),g=b||r.corner,h=g[g.precedance],i="border-"+h+"-color",k="border"+h.charAt(0)+h.substr(1)+"Color",l=/rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i,m="background-color",o="transparent",p=" !important",q=u.titlebar&&(g.y===j||g.y===n&&f.position().top+x.height/2+t.offset<u.titlebar.outerHeight(1)),s=q?u.titlebar:u.tooltip;v.addClass(C),y.fill=d=f.css(m),y.border=e=f[0].style[k]||f.css(i)||v.css(i);if(!d||l.test(d))y.fill=s.css(m)||o,l.test(y.fill)&&(y.fill=v.css(m)||d);if(!e||l.test(e)||e===a(document.body).css("color")){y.border=s.css(i)||o;if(l.test(y.border)||y.border===s.css("color"))y.border=v.css(i)||v.css(k)||e}a("*",f).add(f).css("cssText",m+":"+o+p+";border:0"+p+";"),v.removeClass(C)},create:function(){var b=x.width,c=x.height,d;u.tip&&u.tip.remove(),u.tip=a("<div />",{"class":"ui-tooltip-tip"}).css({width:b,height:c}).prependTo(v),B?a("<canvas />").appendTo(u.tip)[0].getContext("2d").save():(d='<vml:shape coordorigin="0,0" style="display:inline-block; position:absolute; behavior:url(#default#VML);"></vml:shape>',u.tip.html(d+d),a("*",u.tip).bind("click mousedown",function(a){a.stopPropagation()}))},update:function(e,h){var i=u.tip,o=i.children(),p=x.width,q=x.height,A="px solid ",C="px dashed transparent",F=t.mimic,H=Math.round,J,K,L,M,O;e||(e=w.corner||r.corner),F===c?F=e:(F=new s.Corner(F),F.precedance=e.precedance,F.x==="inherit"?F.x=e.x:F.y==="inherit"?F.y=e.y:F.x===F.y&&(F[e.precedance]=e[e.precedance])),J=F.precedance,e.precedance===f?D():E(),u.tip.css({width:p=x.width,height:q=x.height}),r.detectColours(e),y.border!=="transparent"?(z=G(e,d,b),t.border===0&&z>0&&(y.fill=y.border),r.border=z=t.border!==b?t.border:z):r.border=z=0,L=N(F,p,q),r.size=O=I(e),i.css(O),e.precedance===g?M=[H(F.x===k?z:F.x===m?O.width-p-z:(O.width-p)/2),H(F.y===j?O.height-q:0)]:M=[H(F.x===k?O.width-p:0),H(F.y===j?z:F.y===l?O.height-q-z:(O.height-q)/2)],B?(o.attr(O),K=o[0].getContext("2d"),K.restore(),K.save(),K.clearRect(0,0,3e3,3e3),K.fillStyle=y.fill,K.strokeStyle=y.border,K.lineWidth=z*2,K.lineJoin="miter",K.miterLimit=100,K.translate(M[0],M[1]),K.beginPath(),K.moveTo(L[0][0],L[0][1]),K.lineTo(L[1][0],L[1][1]),K.lineTo(L[2][0],L[2][1]),K.closePath(),z&&(v.css("background-clip")==="border-box"&&(K.strokeStyle=y.fill,K.stroke()),K.strokeStyle=y.border,K.stroke()),K.fill()):(L="m"+L[0][0]+","+L[0][1]+" l"+L[1][0]+","+L[1][1]+" "+L[2][0]+","+L[2][1]+" xe",M[2]=z&&/^(r|b)/i.test(e.string())?parseFloat(a.browser.version,10)===8?2:1:0,o.css({antialias:""+(F.string().indexOf(n)>-1),left:M[0]-M[2]*Number(J===f),top:M[1]-M[2]*Number(J===g),width:p+z,height:q+z}).each(function(b){var c=a(this);c[c.prop?"prop":"attr"]({coordsize:p+z+" "+(q+z),path:L,fillcolor:y.fill,filled:!!b,stroked:!b}).css({display:z||b?"block":"none"}),!b&&c.html()===""&&c.html('<vml:stroke weight="'+z*2+'px" color="'+y.border+'" miterlimit="1000" joinstyle="miter"  style="behavior:url(#default#VML); display:inline-block;" />')})),h!==c&&r.position(e)},position:function(b){var d=u.tip,e={},l=Math.max(0,t.offset),m,o,p;if(t.corner===c||!d)return c;b=b||r.corner,m=b.precedance,o=I(b),p=[b.x,b.y],m===f&&p.reverse(),a.each(p,function(a,c){var d,f;c===n?(d=m===g?k:j,e[d]="50%",e["margin-"+d]=-Math.round(o[m===g?h:i]/2)+l):(d=G(b,c),f=H(b),e[c]=a?0:l+(f>d?f:-d))}),e[b[m]]-=o[m===f?h:i],d.css({top:"",bottom:"",left:"",right:"",margin:""}).css(e);return e},destroy:function(){u.tip&&u.tip.remove(),u.tip=!1,v.unbind(A)}}),r.init()}function N(a,b,c){var d=Math.ceil(b/2),e=Math.ceil(c/2),f={bottomright:[[0,0],[b,c],[b,0]],bottomleft:[[0,0],[b,0],[0,c]],topright:[[0,c],[b,0],[b,c]],topleft:[[0,0],[0,c],[b,c]],topcenter:[[0,c],[d,0],[b,c]],bottomcenter:[[0,0],[b,0],[d,c]],rightcenter:[[0,0],[b,e],[0,c]],leftcenter:[[b,0],[b,c],[0,e]]};f.lefttop=f.bottomright,f.righttop=f.bottomleft,f.leftbottom=f.topright,f.rightbottom=f.topleft;return f[a.string()]}function M(d){function t(b){var d=a(b.target),e=d.closest(".qtip"),f;f=e.length<1?c:parseInt(e[0].style.zIndex,10)>parseInt(h[0].style.zIndex,10),!f&&a(b.target).closest(y)[0]!==h[0]&&r(d)}function r(a){o.length<1&&a.length?a.not("body").blur():o.first().focus()}function q(){o=a(n,h).not("[disabled]").map(function(){return typeof this.focus==="function"?this:null})}var e=this,f=d.options.show.modal,g=d.elements,h=g.tooltip,i="#qtip-overlay",j=".qtipmodal",k=j+d.id,l="is-modal-qtip",m=a(document.body),n=s.modal.focusable.join(","),o={},p;d.checks.modal={"^show.modal.(on|blur)$":function(){e.init(),g.overlay.toggle(h.is(":visible"))},"^content.text$":q},a.extend(e,{init:function(){if(!f.on)return e;p=e.create(),h.attr(l,b).css("z-index",s.modal.zindex+a(y+"["+l+"]").length).unbind(j).unbind(k).bind("tooltipshow"+j+" tooltiphide"+j,function(b,c,d){var f=b.originalEvent;if(b.target===h[0])if(f&&b.type==="tooltiphide"&&/mouse(leave|enter)/.test(f.type)&&a(f.relatedTarget).closest(p[0]).length)try{b.preventDefault()}catch(g){}else(!f||f&&!f.solo)&&e[b.type.replace("tooltip","")](b,d)}).bind("tooltipfocus"+j,function(b){if(!b.isDefaultPrevented()&&b.target===h[0]){var c=a(y).filter("["+l+"]"),d=s.modal.zindex+c.length,e=parseInt(h[0].style.zIndex,10);p[0].style.zIndex=d-2,c.each(function(){this.style.zIndex>e&&(this.style.zIndex-=1)}),c.end().filter("."+A).qtip("blur",b.originalEvent),h.addClass(A)[0].style.zIndex=d;try{b.preventDefault()}catch(f){}}}).bind("tooltiphide"+j,function(b){b.target===h[0]&&a("["+l+"]").filter(":visible").not(h).last().qtip("focus",b)}),f.escape&&a(document).unbind(k).bind("keydown"+k,function(a){a.keyCode===27&&h.hasClass(A)&&d.hide(a)}),f.blur&&g.overlay.unbind(k).bind("click"+k,function(a){h.hasClass(A)&&d.hide(a)}),q();return e},create:function(){function d(){p.css({height:a(window).height(),width:a(window).width()})}var b=a(i);if(b.length)return g.overlay=b.insertAfter(a(y).last());p=g.overlay=a("<div />",{id:i.substr(1),html:"<div></div>",mousedown:function(){return c}}).hide().insertAfter(a(y).last()),a(window).unbind(j).bind("resize"+j,d),d();return p},toggle:function(d,g,i){if(d&&d.isDefaultPrevented())return e;var j=f.effect,n=g?"show":"hide",o=p.is(":visible"),q=a("["+l+"]").filter(":visible").not(h),s;p||(p=e.create());if(p.is(":animated")&&o===g||!g&&q.length)return e;g?(p.css({left:0,top:0}),p.toggleClass("blurs",f.blur),f.stealfocus!==c&&(m.bind("focusin"+k,t),r(a("body *")))):m.unbind("focusin"+k),p.stop(b,c),a.isFunction(j)?j.call(p,g):j===c?p[n]():p.fadeTo(parseInt(i,10)||90,g?1:0,function(){g||a(this).hide()}),g||p.queue(function(a){p.css({left:"",top:""}),a()});return e},show:function(a,c){return e.toggle(a,b,c)},hide:function(a,b){return e.toggle(a,c,b)},destroy:function(){var b=p;b&&(b=a("["+l+"]").not(h).length<1,b?(g.overlay.remove(),a(document).unbind(j)):g.overlay.unbind(j+d.id),m.undelegate("*","focusin"+k));return h.removeAttr(l).unbind(j)}}),e.init()}function L(d){var e=this,f=d.elements.tooltip,g=d.options.content.ajax,h=r.defaults.content.ajax,i=".qtip-ajax",j=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,k=b,l=c,m;d.checks.ajax={"^content.ajax":function(a,b,c){b==="ajax"&&(g=c),b==="once"?e.init():g&&g.url?e.load():f.unbind(i)}},a.extend(e,{init:function(){g&&g.url&&f.unbind(i)[g.once?"one":"bind"]("tooltipshow"+i,e.load);return e},load:function(f){function t(a,b,c){!d.destroyed&&a.status!==0&&d.set("content.text",b+": "+c)}function s(b,c,e){var f;d.destroyed||(o&&(b=a("<div/>").append(b.replace(j,"")).find(o)),(f=h.success||g.success)&&a.isFunction(f)?f.call(g.context||d,b,c,e):d.set("content.text",b))}function r(){var e;d.destroyed||(k=c,p&&(l=b,d.show(f.originalEvent)),(e=h.complete||g.complete)&&a.isFunction(e)&&e.apply(g.context||d,arguments))}if(l)l=c;else{var i=g.url.indexOf(" "),n=g.url,o,p=!g.loading&&k;if(p)try{f.preventDefault()}catch(q){}else if(f&&f.isDefaultPrevented())return e;m&&m.abort&&m.abort(),i>-1&&(o=n.substr(i),n=n.substr(0,i)),m=a.ajax(a.extend({error:h.error||t,context:d},g,{url:n,success:s,complete:r}))}},destroy:function(){m&&m.abort&&m.abort(),d.destroyed=b}}),e.init()}function K(e,f){var g,h,i,j,k,l=a(this),m=a(document.body),n=this===document?m:l,o=l.metadata?l.metadata(f.metadata):d,p=f.metadata.type==="html5"&&o?o[f.metadata.name]:d,q=l.data(f.metadata.name||"qtipopts");try{q=typeof q==="string"?(new Function("return "+q))():q}catch(t){H("Unable to parse HTML5 attribute data: "+q)}j=a.extend(b,{},r.defaults,f,typeof q==="object"?I(q):d,I(p||o)),h=j.position,j.id=e;if("boolean"===typeof j.content.text){i=l.attr(j.content.attr);if(j.content.attr!==c&&i)j.content.text=i;else{H("Unable to locate content for tooltip! Aborting render of tooltip on element: ",l);return c}}h.container.length||(h.container=m),h.target===c&&(h.target=n),j.show.target===c&&(j.show.target=n),j.show.solo===b&&(j.show.solo=h.container.closest("body")),j.hide.target===c&&(j.hide.target=n),j.position.viewport===b&&(j.position.viewport=h.container),h.container=h.container.eq(0),h.at=new s.Corner(h.at),h.my=new s.Corner(h.my);if(a.data(this,"qtip"))if(j.overwrite)l.qtip("destroy");else if(j.overwrite===c)return c;j.suppress&&(k=a.attr(this,"title"))&&a(this).removeAttr("title").attr(F,k).attr("title",""),g=new J(l,j,e,!!i),a.data(this,"qtip",g),l.bind("remove.qtip-"+e+" removeqtip.qtip-"+e,function(){g.destroy()});return g}function J(f,g,o,p){function X(){var b=[g.show.target[0],g.hide.target[0],q.rendered&&M.tooltip[0],g.position.container[0],g.position.viewport[0],window,document];q.rendered?a([]).pushStack(a.grep(b,function(a){return typeof a==="object"})).unbind(L):g.show.target.unbind(L+"-create")}function W(){function m(a){q.rendered&&K[0].offsetWidth>0&&q.reposition(a)}function l(a){if(K.hasClass(x))return c;clearTimeout(q.timers.inactive),q.timers.inactive=setTimeout(function(){q.hide(a)},g.hide.inactive)}function k(b){if(K.hasClass(x)||H||J)return c;var f=a(b.relatedTarget||b.target),h=f.closest(y)[0]===K[0],i=f[0]===e.show[0];clearTimeout(q.timers.show),clearTimeout(q.timers.hide);if(d.target==="mouse"&&h||g.hide.fixed&&(/mouse(out|leave|move)/.test(b.type)&&(h||i)))try{b.preventDefault(),b.stopImmediatePropagation()}catch(j){}else g.hide.delay>0?q.timers.hide=setTimeout(function(){q.hide(b)},g.hide.delay):q.hide(b)}function j(a){if(K.hasClass(x))return c;clearTimeout(q.timers.show),clearTimeout(q.timers.hide);var d=function(){q.toggle(b,a)};g.show.delay>0?q.timers.show=setTimeout(d,g.show.delay):d()}var d=g.position,e={show:g.show.target,hide:g.hide.target,viewport:a(d.viewport),document:a(document),body:a(document.body),window:a(window)},h={show:a.trim(""+g.show.event).split(" "),hide:a.trim(""+g.hide.event).split(" ")},i=a.browser.msie&&parseInt(a.browser.version,10)===6;K.bind("mouseenter"+L+" mouseleave"+L,function(a){var b=a.type==="mouseenter";b&&q.focus(a),K.toggleClass(B,b)}),/mouse(out|leave)/i.test(g.hide.event)&&(g.hide.leave==="window"&&e.window.bind("mouseleave"+L+" blur"+L,function(a){!/select|option/.test(a.target.nodeName)&&!a.relatedTarget&&q.hide(a)})),g.hide.fixed?(e.hide=e.hide.add(K),K.bind("mouseover"+L,function(){K.hasClass(x)||clearTimeout(q.timers.hide)})):/mouse(over|enter)/i.test(g.show.event)&&e.hide.bind("mouseleave"+L,function(a){clearTimeout(q.timers.show)}),(""+g.hide.event).indexOf("unfocus")>-1&&d.container.closest("html").bind("mousedown"+L,function(b){var c=a(b.target),d=q.rendered&&!K.hasClass(x)&&K[0].offsetWidth>0,e=c.parents(y).filter(K[0]).length>0;c[0]!==f[0]&&c[0]!==K[0]&&!e&&!f.has(c[0]).length&&!c.attr("disabled")&&q.hide(b)}),"number"===typeof g.hide.inactive&&(e.show.bind("qtip-"+o+"-inactive",l),a.each(r.inactiveEvents,function(a,b){e.hide.add(M.tooltip).bind(b+L+"-inactive",l)})),a.each(h.hide,function(b,c){var d=a.inArray(c,h.show),f=a(e.hide);d>-1&&f.add(e.show).length===f.length||c==="unfocus"?(e.show.bind(c+L,function(a){K[0].offsetWidth>0?k(a):j(a)}),delete h.show[d]):e.hide.bind(c+L,k)}),a.each(h.show,function(a,b){e.show.bind(b+L,j)}),"number"===typeof g.hide.distance&&e.show.add(K).bind("mousemove"+L,function(a){var b=N.origin||{},c=g.hide.distance,d=Math.abs;(d(a.pageX-b.pageX)>=c||d(a.pageY-b.pageY)>=c)&&q.hide(a)}),d.target==="mouse"&&(e.show.bind("mousemove"+L,function(a){t={pageX:a.pageX,pageY:a.pageY,type:"mousemove"}}),d.adjust.mouse&&(g.hide.event&&(K.bind("mouseleave"+L,function(a){(a.relatedTarget||a.target)!==e.show[0]&&q.hide(a)}),M.target.bind("mouseenter"+L+" mouseleave"+L,function(a){N.onTarget=a.type==="mouseenter"})),e.document.bind("mousemove"+L,function(a){q.rendered&&N.onTarget&&!K.hasClass(x)&&K[0].offsetWidth>0&&q.reposition(a||t)}))),(d.adjust.resize||e.viewport.length)&&(a.event.special.resize?e.viewport:e.window).bind("resize"+L,m),(e.viewport.length||i&&K.css("position")==="fixed")&&e.viewport.bind("scroll"+L,m)}function V(b,d){function h(b){function i(e){e&&(delete h[e.src],clearTimeout(q.timers.img[e.src]),a(e).unbind(L)),a.isEmptyObject(h)&&(q.redraw(),d!==c&&q.reposition(N.event),b())}var f,h={};if((f=g.find("img[src]:not([height]):not([width])")).length===0)return i();f.each(function(b,c){if(h[c.src]===e){var d=0,f=3;(function g(){if(c.height||c.width||d>f)return i(c);d+=1,q.timers.img[c.src]=setTimeout(g,700)})(),a(c).bind("error"+L+" load"+L,function(){i(this)}),h[c.src]=c}})}var g=M.content;if(!q.rendered||!b)return c;a.isFunction(b)&&(b=b.call(f,N.event,q)||""),b.jquery&&b.length>0?g.empty().append(b.css({display:"block"})):g.html(b),q.rendered<0?K.queue("fx",h):(J=0,h(a.noop));return q}function U(b,d){var e=M.title;if(!q.rendered||!b)return c;a.isFunction(b)&&(b=b.call(f,N.event,q));if(b===c||!b&&b!=="")return Q(c);b.jquery&&b.length>0?e.empty().append(b.css({display:"block"})):e.html(b),q.redraw(),d!==c&&q.rendered&&K[0].offsetWidth>0&&q.reposition(N.event)}function T(a){var b=M.button,d=M.title;if(!q.rendered)return c;a?(d||S(),R()):b.remove()}function S(){var c=E+"-title";M.titlebar&&Q(),M.titlebar=a("<div />",{"class":v+"-titlebar "+(g.style.widget?"ui-widget-header":"")}).append(M.title=a("<div />",{id:c,"class":v+"-title","aria-atomic":b})).insertBefore(M.content).delegate(".ui-tooltip-close","mousedown keydown mouseup keyup mouseout",function(b){a(this).toggleClass("ui-state-active ui-state-focus",b.type.substr(-4)==="down")}).delegate(".ui-tooltip-close","mouseover mouseout",function(b){a(this).toggleClass("ui-state-hover",b.type==="mouseover")}),g.content.title.button?R():q.rendered&&q.redraw()}function R(){var b=g.content.title.button,d=typeof b==="string",e=d?b:"Close tooltip";M.button&&M.button.remove(),b.jquery?M.button=b:M.button=a("<a />",{"class":"ui-state-default ui-tooltip-close "+(g.style.widget?"":v+"-icon"),title:e,"aria-label":e}).prepend(a("<span />",{"class":"ui-icon ui-icon-close",html:"&times;"})),M.button.appendTo(M.titlebar).attr("role","button").click(function(a){K.hasClass(x)||q.hide(a);return c}),q.redraw()}function Q(a){M.title&&(M.titlebar.remove(),M.titlebar=M.title=M.button=d,a!==c&&q.reposition())}function P(){var a=g.style.widget;K.toggleClass(w,a).toggleClass(z,g.style.def&&!a),M.content.toggleClass(w+"-content",a),M.titlebar&&M.titlebar.toggleClass(w+"-header",a),M.button&&M.button.toggleClass(v+"-icon",!a)}function O(a){var b=0,c,d=g,e=a.split(".");while(d=d[e[b++]])b<e.length&&(c=d);return[c||g,e.pop()]}var q=this,D=document.body,E=v+"-"+o,H=0,J=0,K=a(),L=".qtip-"+o,M,N;q.id=o,q.destroyed=q.rendered=c,q.elements=M={target:f},q.timers={img:{}},q.options=g,q.checks={},q.plugins={},q.cache=N={event:{},target:a(),disabled:c,attr:p,onTarget:c,lastClass:""},q.checks.builtin={"^id$":function(d,e,f){var g=f===b?r.nextid:f,h=v+"-"+g;g!==c&&g.length>0&&!a("#"+h).length&&(K[0].id=h,M.content[0].id=h+"-content",M.title[0].id=h+"-title")},"^content.text$":function(a,b,c){V(c)},"^content.title.text$":function(a,b,c){if(!c)return Q();!M.title&&c&&S(),U(c)},"^content.title.button$":function(a,b,c){T(c)},"^position.(my|at)$":function(a,b,c){"string"===typeof c&&(a[b]=new s.Corner(c))},"^position.container$":function(a,b,c){q.rendered&&K.appendTo(c)},"^show.ready$":function(){q.rendered?q.toggle(b):q.render(1)},"^style.classes$":function(a,b,c){K.attr("class",v+" qtip ui-helper-reset "+c)},"^style.widget|content.title":P,"^events.(render|show|move|hide|focus|blur)$":function(b,c,d){K[(a.isFunction(d)?"":"un")+"bind"]("tooltip"+c,d)},"^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)":function(){var a=g.position;K.attr("tracking",a.target==="mouse"&&a.adjust.mouse),X(),W()}},a.extend(q,{render:function(d){if(q.rendered)return q;var e=g.content.text,h=g.content.title.text,i=g.position,j=a.Event("tooltiprender");a.attr(f[0],"aria-describedby",E),K=M.tooltip=a("<div/>",{id:E,"class":v+" qtip ui-helper-reset "+z+" "+g.style.classes+" "+v+"-pos-"+g.position.my.abbrev(),width:g.style.width||"",height:g.style.height||"",tracking:i.target==="mouse"&&i.adjust.mouse,role:"alert","aria-live":"polite","aria-atomic":c,"aria-describedby":E+"-content","aria-hidden":b}).toggleClass(x,N.disabled).data("qtip",q).appendTo(g.position.container).append(M.content=a("<div />",{"class":v+"-content",id:E+"-content","aria-atomic":b})),q.rendered=-1,H=J=1,h&&(S(),a.isFunction(h)||U(h,c)),a.isFunction(e)||V(e,c),q.rendered=b,P(),a.each(g.events,function(b,c){a.isFunction(c)&&K.bind(b==="toggle"?"tooltipshow tooltiphide":"tooltip"+b,c)}),a.each(s,function(){this.initialize==="render"&&this(q)}),W(),K.queue("fx",function(a){j.originalEvent=N.event,K.trigger(j,[q]),H=J=0,q.redraw(),(g.show.ready||d)&&q.toggle(b,N.event,c),a()});return q},get:function(a){var b,c;switch(a.toLowerCase()){case"dimensions":b={height:K.outerHeight(),width:K.outerWidth()};break;case"offset":b=s.offset(K,g.position.container);break;default:c=O(a.toLowerCase()),b=c[0][c[1]],b=b.precedance?b.string():b}return b},set:function(e,f){function n(a,b){var c,d,e;for(c in l)for(d in l[c])if(e=(new RegExp(d,"i")).exec(a))b.push(e),l[c][d].apply(q,b)}var h=/^position\.(my|at|adjust|target|container)|style|content|show\.ready/i,i=/^content\.(title|attr)|style/i,j=c,k=c,l=q.checks,m;"string"===typeof e?(m=e,e={},e[m]=f):e=a.extend(b,{},e),a.each(e,function(b,c){var d=O(b.toLowerCase()),f;f=d[0][d[1]],d[0][d[1]]="object"===typeof c&&c.nodeType?a(c):c,e[b]=[d[0],d[1],c,f],j=h.test(b)||j,k=i.test(b)||k}),I(g),H=J=1,a.each(e,n),H=J=0,q.rendered&&K[0].offsetWidth>0&&(j&&q.reposition(g.position.target==="mouse"?d:N.event),k&&q.redraw());return q},toggle:function(e,f){function u(){e?(a.browser.msie&&K[0].style.removeAttribute("filter"),K.css("overflow",""),"string"===typeof i.autofocus&&a(i.autofocus,K).focus(),i.target.trigger("qtip-"+o+"-inactive")):K.css({display:"",visibility:"",opacity:"",left:"",top:""}),s=a.Event("tooltip"+(e?"visible":"hidden")),s.originalEvent=f?N.event:d,K.trigger(s,[q])}if(!q.rendered)return e?q.render(1):q;var h=e?"show":"hide",i=g[h],j=g[e?"hide":"show"],k=g.position,l=g.content,m=K[0].offsetWidth>0,n=e||i.target.length===1,p=!f||i.target.length<2||N.target[0]===f.target,r,s;(typeof e).search("boolean|number")&&(e=!m);if(!K.is(":animated")&&m===e&&p)return q;if(f){if(/over|enter/.test(f.type)&&/out|leave/.test(N.event.type)&&g.show.target.add(f.target).length===g.show.target.length&&K.has(f.relatedTarget).length)return q;N.event=a.extend({},f)}s=a.Event("tooltip"+h),s.originalEvent=f?N.event:d,K.trigger(s,[q,90]);if(s.isDefaultPrevented())return q;a.attr(K[0],"aria-hidden",!e),e?(N.origin=a.extend({},t),q.focus(f),a.isFunction(l.text)&&V(l.text,c),a.isFunction(l.title.text)&&U(l.title.text,c),!G&&k.target==="mouse"&&k.adjust.mouse&&(a(document).bind("mousemove.qtip",function(a){t={pageX:a.pageX,pageY:a.pageY,type:"mousemove"}}),G=b),q.reposition(f,arguments[2]),(s.solo=!!i.solo)&&a(y,i.solo).not(K).qtip("hide",s)):(clearTimeout(q.timers.show),delete N.origin,G&&!a(y+'[tracking="true"]:visible',i.solo).not(K).length&&(a(document).unbind("mousemove.qtip"),G=c),q.blur(f)),i.effect===c||n===c?(K[h](),u.call(K)):a.isFunction(i.effect)?(K.stop(1,1),i.effect.call(K,q),K.queue("fx",function(a){u(),a()})):K.fadeTo(90,e?1:0,u),e&&i.target.trigger("qtip-"+o+"-inactive");return q},show:function(a){return q.toggle(b,a)},hide:function(a){return q.toggle(c,a)},focus:function(b){if(!q.rendered)return q;var c=a(y),d=parseInt(K[0].style.zIndex,10),e=r.zindex+c.length,f=a.extend({},b),g,h;K.hasClass(A)||(h=a.Event("tooltipfocus"),h.originalEvent=f,K.trigger(h,[q,e]),h.isDefaultPrevented()||(d!==e&&(c.each(function(){this.style.zIndex>d&&(this.style.zIndex=this.style.zIndex-1)}),c.filter("."+A).qtip("blur",f)),K.addClass(A)[0].style.zIndex=e));return q},blur:function(b){var c=a.extend({},b),d;K.removeClass(A),d=a.Event("tooltipblur"),d.originalEvent=c,K.trigger(d,[q]);return q},reposition:function(b,d){if(!q.rendered||H)return q;H=1;var e=g.position.target,f=g.position,h=f.my,i=f.at,o=f.adjust,p=o.method.split(" "),r=K.outerWidth(),u=K.outerHeight(),v=0,w=0,x=a.Event("tooltipmove"),y=K.css("position")==="fixed",z=f.viewport,A={left:0,top:0},B=f.container,C=K[0].offsetWidth>0,D,E,F;if(a.isArray(e)&&e.length===2)i={x:k,y:j},A={left:e[0],top:e[1]};else if(e==="mouse"&&(b&&b.pageX||N.event.pageX))i={x:k,y:j},b=(b&&(b.type==="resize"||b.type==="scroll")?N.event:b&&b.pageX&&b.type==="mousemove"?b:t&&t.pageX&&(o.mouse||!b||!b.pageX)?{pageX:t.pageX,pageY:t.pageY}:!o.mouse&&N.origin&&N.origin.pageX&&g.show.distance?N.origin:b)||b||N.event||t||{},A={top:b.pageY,left:b.pageX};else{e==="event"&&b&&b.target&&b.type!=="scroll"&&b.type!=="resize"?N.target=a(b.target):e!=="event"&&(N.target=a(e.jquery?e:M.target)),e=N.target,e=a(e).eq(0);if(e.length===0)return q;e[0]===document||e[0]===window?(v=s.iOS?window.innerWidth:e.width(),w=s.iOS?window.innerHeight:e.height(),e[0]===window&&(A={top:(z||e).scrollTop(),left:(z||e).scrollLeft()})):s.imagemap&&e.is("area")?D=s.imagemap(q,e,i,s.viewport?p:c):s.svg&&typeof e[0].xmlbase==="string"?D=s.svg(q,e,i,s.viewport?p:c):(v=e.outerWidth(),w=e.outerHeight(),A=s.offset(e,B)),D&&(v=D.width,w=D.height,E=D.offset,A=D.position);if(s.iOS>3.1&&s.iOS<4.1||s.iOS>=4.3&&s.iOS<4.33||!s.iOS&&y)F=a(window),A.left-=F.scrollLeft(),A.top-=F.scrollTop();A.left+=i.x===m?v:i.x===n?v/2:0,A.top+=i.y===l?w:i.y===n?w/2:0}A.left+=o.x+(h.x===m?-r:h.x===n?-r/2:0),A.top+=o.y+(h.y===l?-u:h.y===n?-u/2:0),s.viewport?(A.adjusted=s.viewport(q,A,f,v,w,r,u),E&&A.adjusted.left&&(A.left+=E.left),E&&A.adjusted.top&&(A.top+=E.top)):A.adjusted={left:0,top:0},x.originalEvent=a.extend({},b),K.trigger(x,[q,A,z.elem||z]);if(x.isDefaultPrevented())return q;delete A.adjusted,d===c||!C||isNaN(A.left)||isNaN(A.top)||e==="mouse"||!a.isFunction(f.effect)?K.css(A):a.isFunction(f.effect)&&(f.effect.call(K,q,a.extend({},A)),K.queue(function(b){a(this).css({opacity:"",height:""}),a.browser.msie&&this.style.removeAttribute("filter"),b()})),H=0;return q},redraw:function(){if(q.rendered<1||J)return q;var a=g.position.container,b,c,d,e;J=1,g.style.height&&K.css(i,g.style.height),g.style.width?K.css(h,g.style.width):(K.css(h,"").addClass(C),c=K.width()+1,d=K.css("max-width")||"",e=K.css("min-width")||"",b=(d+e).indexOf("%")>-1?a.width()/100:0,d=(d.indexOf("%")>-1?b:1)*parseInt(d,10)||c,e=(e.indexOf("%")>-1?b:1)*parseInt(e,10)||0,c=d+e?Math.min(Math.max(c,e),d):c,K.css(h,Math.round(c)).removeClass(C)),J=0;return q},disable:function(b){"boolean"!==typeof b&&(b=!K.hasClass(x)&&!N.disabled),q.rendered?(K.toggleClass(x,b),a.attr(K[0],"aria-disabled",b)):N.disabled=!!b;return q},enable:function(){return q.disable(c)},destroy:function(){var c=f[0],d=a.attr(c,F),e=f.data("qtip");q.destroyed=b,q.rendered&&(K.stop(1,0).remove(),a.each(q.plugins,function(){this.destroy&&this.destroy()})),clearTimeout(q.timers.show),clearTimeout(q.timers.hide),X();if(!e||q===e)a.removeData(c,"qtip"),g.suppress&&d&&(a.attr(c,"title",d),f.removeAttr(F)),f.removeAttr("aria-describedby");f.unbind(".qtip-"+o),delete u[q.id];return f}})}function I(b){var e;if(!b||"object"!==typeof b)return c;if(b.metadata===d||"object"!==typeof b.metadata)b.metadata={type:b.metadata};if("content"in b){if(b.content===d||"object"!==typeof b.content||b.content.jquery)b.content={text:b.content};e=b.content.text||c,!a.isFunction(e)&&(!e&&!e.attr||e.length<1||"object"===typeof e&&!e.jquery)&&(b.content.text=c);if("title"in b.content){if(b.content.title===d||"object"!==typeof b.content.title)b.content.title={text:b.content.title};e=b.content.title.text||c,!a.isFunction(e)&&(!e&&!e.attr||e.length<1||"object"===typeof e&&!e.jquery)&&(b.content.title.text=c)}}if("position"in b)if(b.position===d||"object"!==typeof b.position)b.position={my:b.position,at:b.position};if("show"in b)if(b.show===d||"object"!==typeof b.show)b.show.jquery?b.show={target:b.show}:b.show={event:b.show};if("hide"in b)if(b.hide===d||"object"!==typeof b.hide)b.hide.jquery?b.hide={target:b.hide}:b.hide={event:b.hide};if("style"in b)if(b.style===d||"object"!==typeof b.style)b.style={classes:b.style};a.each(s,function(){this.sanitize&&this.sanitize(b)});return b}function H(){H.history=H.history||[],H.history.push(arguments);if("object"===typeof console){var a=console[console.warn?"warn":"log"],b=Array.prototype.slice.call(arguments),c;typeof arguments[0]==="string"&&(b[0]="qTip2: "+b[0]),c=a.apply?a.apply(console,b):a(b)}}"use strict";var b=!0,c=!1,d=null,e,f="x",g="y",h="width",i="height",j="top",k="left",l="bottom",m="right",n="center",o="flip",p="flipinvert",q="shift",r,s,t,u={},v="ui-tooltip",w="ui-widget",x="ui-state-disabled",y="div.qtip."+v,z=v+"-default",A=v+"-focus",B=v+"-hover",C=v+"-fluid",D="-31000px",E="_replacedByqTip",F="oldtitle",G;r=a.fn.qtip=function(f,g,h){var i=(""+f).toLowerCase(),j=d,k=a.makeArray(arguments).slice(1),l=k[k.length-1],m=this[0]?a.data(this[0],"qtip"):d;if(!arguments.length&&m||i==="api")return m;if("string"===typeof f){this.each(function(){var d=a.data(this,"qtip");if(!d)return b;l&&l.timeStamp&&(d.cache.event=l);if(i!=="option"&&i!=="options"||!g)d[i]&&d[i].apply(d[i],k);else if(a.isPlainObject(g)||h!==e)d.set(g,h);else{j=d.get(g);return c}});return j!==d?j:this}if("object"===typeof f||!arguments.length){m=I(a.extend(b,{},f));return r.bind.call(this,m,l)}},r.bind=function(d,f){return this.each(function(g){function n(b){function d(){l.render(typeof b==="object"||h.show.ready),i.show.add(i.hide).unbind(k)}if(l.cache.disabled)return c;l.cache.event=a.extend({},b),l.cache.target=b?a(b.target):[e],h.show.delay>0?(clearTimeout(l.timers.show),l.timers.show=setTimeout(d,h.show.delay),j.show!==j.hide&&i.hide.bind(j.hide,function(){clearTimeout(l.timers.show)})):d()}var h,i,j,k,l,m;m=a.isArray(d.id)?d.id[g]:d.id,m=!m||m===c||m.length<1||u[m]?r.nextid++:u[m]=m,k=".qtip-"+m+"-create",l=K.call(this,m,d);if(l===c)return b;h=l.options,a.each(s,function(){this.initialize==="initialize"&&this(l)}),i={show:h.show.target,hide:h.hide.target},j={show:a.trim(""+h.show.event).replace(/ /g,k+" ")+k,hide:a.trim(""+h.hide.event).replace(/ /g,k+" ")+k},/mouse(over|enter)/i.test(j.show)&&!/mouse(out|leave)/i.test(j.hide)&&(j.hide+=" mouseleave"+k),i.show.bind("mousemove"+k,function(a){t={pageX:a.pageX,pageY:a.pageY,type:"mousemove"},l.cache.onTarget=b}),i.show.bind(j.show,n),(h.show.ready||h.prerender)&&n(f)})},s=r.plugins={Corner:function(a){a=(""+a).replace(/([A-Z])/," $1").replace(/middle/gi,n).toLowerCase(),this.x=(a.match(/left|right/i)||a.match(/center/)||["inherit"])[0].toLowerCase(),this.y=(a.match(/top|bottom|center/i)||["inherit"])[0].toLowerCase();var b=a.charAt(0);this.precedance=b==="t"||b==="b"?g:f,this.string=function(){return this.precedance===g?this.y+this.x:this.x+this.y},this.abbrev=function(){var a=this.x.substr(0,1),b=this.y.substr(0,1);return a===b?a:this.precedance===g?b+a:a+b},this.invertx=function(a){this.x=this.x===k?m:this.x===m?k:a||this.x},this.inverty=function(a){this.y=this.y===j?l:this.y===l?j:a||this.y},this.clone=function(){return{x:this.x,y:this.y,precedance:this.precedance,string:this.string,abbrev:this.abbrev,clone:this.clone,invertx:this.invertx,inverty:this.inverty}}},offset:function(b,c){function j(a,b){d.left+=b*a.scrollLeft(),d.top+=b*a.scrollTop()}var d=b.offset(),e=b.closest("body")[0],f=c,g,h,i;if(f){do f.css("position")!=="static"&&(h=f.position(),d.left-=h.left+(parseInt(f.css("borderLeftWidth"),10)||0)+(parseInt(f.css("marginLeft"),10)||0),d.top-=h.top+(parseInt(f.css("borderTopWidth"),10)||0)+(parseInt(f.css("marginTop"),10)||0),!g&&(i=f.css("overflow"))!=="hidden"&&i!=="visible"&&(g=f));while((f=a(f[0].offsetParent)).length);g&&g[0]!==e&&j(g,1)}return d},iOS:parseFloat((""+(/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent)||[0,""])[1]).replace("undefined","3_2").replace("_",".").replace("_",""))||c,fn:{attr:function(b,c){if(this.length){var d=this[0],e="title",f=a.data(d,"qtip");if(b===e&&f&&"object"===typeof f&&f.options.suppress){if(arguments.length<2)return a.attr(d,F);f&&f.options.content.attr===e&&f.cache.attr&&f.set("content.text",c);return this.attr(F,c)}}return a.fn["attr"+E].apply(this,arguments)},clone:function(b){var c=a([]),d="title",e=a.fn["clone"+E].apply(this,arguments);b||e.filter("["+F+"]").attr("title",function(){return a.attr(this,F)}).removeAttr(F);return e}}},a.each(s.fn,function(c,d){if(!d||a.fn[c+E])return b;var e=a.fn[c+E]=a.fn[c];a.fn[c]=function(){return d.apply(this,arguments)||e.apply(this,arguments)}}),a.ui||(a["cleanData"+E]=a.cleanData,a.cleanData=function(b){for(var c=0,d;(d=b[c])!==e;c++)try{a(d).triggerHandler("removeqtip")}catch(f){}a["cleanData"+E](b)}),r.version="nightly",r.nextid=0,r.inactiveEvents="click dblclick mousedown mouseup mousemove mouseleave mouseenter".split(" "),r.zindex=15e3,r.defaults={prerender:c,id:c,overwrite:b,suppress:b,content:{text:b,attr:"title",title:{text:c,button:c}},position:{my:"top left",at:"bottom right",target:c,container:c,viewport:c,adjust:{x:0,y:0,mouse:b,resize:b,method:"flip flip"},effect:function(b,d,e){a(this).animate(d,{duration:200,queue:c})}},show:{target:c,event:"mouseenter",effect:b,delay:90,solo:c,ready:c,autofocus:c},hide:{target:c,event:"mouseleave",effect:b,delay:0,fixed:c,inactive:c,leave:"window",distance:c},style:{classes:"",widget:c,width:c,height:c,def:b},events:{render:d,move:d,show:d,hide:d,toggle:d,visible:d,hidden:d,focus:d,blur:d}},s.ajax=function(a){var b=a.plugins.ajax;return"object"===typeof b?b:a.plugins.ajax=new L(a)},s.ajax.initialize="render",s.ajax.sanitize=function(a){var b=a.content,c;b&&"ajax"in b&&(c=b.ajax,typeof c!=="object"&&(c=a.content.ajax={url:c}),"boolean"!==typeof c.once&&c.once&&(c.once=!!c.once))},a.extend(b,r.defaults,{content:{ajax:{loading:b,once:b}}}),s.viewport=function(a,b,c,d,o,r,s){function K(a,c,d,f,g,h,i,j,k){var l=b[g],m=w[a],o=x[a],r=d===q,s=-D.offset[g]+C.offset[g]+C["scroll"+g],t=m===g?k:m===h?-k:-k/2,u=o===g?j:o===h?-j:-j/2,v=F&&F.size?F.size[i]||0:0,y=F&&F.corner&&F.corner.precedance===a&&!r?v:0,z=s-l+y,A=l+k-C[i]-s+y,B=t-(w.precedance===a||m===w[c]?u:0)-(o===n?j/2:0);r?(y=F&&F.corner&&F.corner.precedance===c?v:0,B=(m===g?1:-1)*t-y,b[g]+=z>0?z:A>0?-A:0,b[g]=Math.max(-D.offset[g]+C.offset[g]+(y&&F.corner[a]===n?F.offset:0),l-B,Math.min(Math.max(-D.offset[g]+C.offset[g]+C[i],l+B),b[g]))):(f*=d===p?2:0,z>0&&(m!==g||A>0)?(b[g]-=B+f,I["invert"+a](g)):A>0&&(m!==h||z>0)&&(b[g]-=(m===n?-B:B)+f,I["invert"+a](h)),b[g]<s&&-b[g]>A&&(b[g]=l,I=e));return b[g]-l}var t=c.target,u=a.elements.tooltip,w=c.my,x=c.at,y=c.adjust,z=y.method.split(" "),A=z[0],B=z[1]||z[0],C=c.viewport,D=c.container,E=a.cache,F=a.plugins.tip,G={left:0,top:0},H,I,J;if(!C.jquery||t[0]===window||t[0]===document.body||y.method==="none")return G;H=u.css("position")==="fixed",C={elem:C,height:C[(C[0]===window?"h":"outerH")+"eight"](),width:C[(C[0]===window?"w":"outerW")+"idth"](),scrollleft:H?0:C.scrollLeft(),scrolltop:H?0:C.scrollTop(),offset:C.offset()||{left:0,top:0}},D={elem:D,scrollLeft:D.scrollLeft(),scrollTop:D.scrollTop(),offset:D.offset()||{left:0,top:0}};if(A!=="shift"||B!=="shift")I=w.clone();G={left:A!=="none"?K(f,g,A,y.x,k,m,h,d,r):0,top:B!=="none"?K(g,f,B,y.y,j,l,i,o,s):0},I&&E.lastClass!==(J=v+"-pos-"+I.abbrev())&&u.removeClass(a.cache.lastClass).addClass(a.cache.lastClass=J);return G},s.modal=function(a){var b=a.plugins.modal;return"object"===typeof b?b:a.plugins.modal=new M(a)},s.modal.initialize="render",s.modal.sanitize=function(a){a.show&&(typeof a.show.modal!=="object"?a.show.modal={on:!!a.show.modal}:typeof a.show.modal.on==="undefined"&&(a.show.modal.on=b))},s.modal.zindex=r.zindex+1e3,s.modal.focusable=["a[href]","area[href]","input","select","textarea","button","iframe","object","embed","[tabindex]","[contenteditable]"],a.extend(b,r.defaults,{show:{modal:{on:c,effect:b,blur:b,stealfocus:b,escape:b}}}),s.imagemap=function(b,c,d,e){function v(a,b,c){var d=0,e=1,f=1,g=0,h=0,i=a.width,o=a.height;while(i>0&&o>0&&e>0&&f>0){i=Math.floor(i/2),o=Math.floor(o/2),c.x===k?e=i:c.x===m?e=a.width-i:e+=Math.floor(i/2),c.y===j?f=o:c.y===l?f=a.height-o:f+=Math.floor(o/2),d=b.length;while(d--){if(b.length<2)break;g=b[d][0]-a.position.left,h=b[d][1]-a.position.top,(c.x===k&&g>=e||c.x===m&&g<=e||c.x===n&&(g<e||g>a.width-e)||c.y===j&&h>=f||c.y===l&&h<=f||c.y===n&&(h<f||h>a.height-f))&&b.splice(d,1)}}return{left:b[0][0],top:b[0][1]}}c.jquery||(c=a(c));var f=b.cache.areas={},g=(c[0].shape||c.attr("shape")).toLowerCase(),h=c[0].coords||c.attr("coords"),i=h.split(","),o=[],p=a('img[usemap="#'+c.parent("map").attr("name")+'"]'),q=p.offset(),r={width:0,height:0,position:{top:1e10,right:0,bottom:0,left:1e10}},s=0,t=0,u;q.left+=Math.ceil((p.outerWidth()-p.width())/2),q.top+=Math.ceil((p.outerHeight()-p.height())/2);if(g==="poly"){s=i.length;while(s--)t=[parseInt(i[--s],10),parseInt(i[s+1],10)],t[0]>r.position.right&&(r.position.right=t[0]),t[0]<r.position.left&&(r.position.left=t[0]),t[1]>r.position.bottom&&(r.position.bottom=t[1]),t[1]<r.position.top&&(r.position.top=t[1]),o.push(t)}else{s=-1;while(s++<i)o.push(parseInt(i[s],10))}switch(g){case"rect":r={width:Math.abs(o[2]-o[0]),height:Math.abs(o[3]-o[1]),position:{left:Math.min(o[0],o[2]),top:Math.min(o[1],o[3])}};break;case"circle":r={width:o[2]+2,height:o[2]+2,position:{left:o[0],top:o[1]}};break;case"poly":r.width=Math.abs(r.position.right-r.position.left),r.height=Math.abs(r.position.bottom-r.position.top),d.abbrev()==="c"?r.position={left:r.position.left+r.width/2,top:r.position.top+r.height/2}:(f[d+h]||(r.position=v(r,o.slice(),d),e&&(e[0]==="flip"||e[1]==="flip")&&(r.offset=v(r,o.slice(),{x:d.x===k?m:d.x===m?k:n,y:d.y===j?l:d.y===l?j:n}),r.offset.left-=r.position.left,r.offset.top-=r.position.top),f[d+h]=r),r=f[d+h]),r.width=r.height=0}r.position.left+=q.left,r.position.top+=q.top;return r},s.tip=function(a){var b=a.plugins.tip;return"object"===typeof b?b:a.plugins.tip=new O(a)},s.tip.initialize="render",s.tip.sanitize=function(a){var c=a.style,d;c&&"tip"in c&&(d=a.style.tip,typeof d!=="object"&&(a.style.tip={corner:d}),/string|boolean/i.test(typeof d.corner)||(d.corner=b),typeof d.width!=="number"&&delete d.width,typeof d.height!=="number"&&delete d.height,typeof d.border!=="number"&&d.border!==b&&delete d.border,typeof d.offset!=="number"&&delete d.offset)},a.extend(b,r.defaults,{style:{tip:{corner:b,mimic:c,width:6,height:6,border:b,offset:0}}}),s.svg=function(b,c,d,e){var f=a(document),g=c[0],h={width:0,height:0,position:{top:1e10,left:1e10}},i,j,k,l,m;while(!g.getBBox)g=g.parentNode;if(g.getBBox&&g.parentNode){i=g.getBBox(),j=g.getScreenCTM(),k=g.farthestViewportElement||g;if(!k.createSVGPoint)return h;l=k.createSVGPoint(),l.x=i.x,l.y=i.y,m=l.matrixTransform(j),h.position.left=m.x,h.position.top=m.y,l.x+=i.width,l.y+=i.height,m=l.matrixTransform(j),h.width=m.x-h.position.left,h.height=m.y-h.position.top,h.position.left+=f.scrollLeft(),h.position.top+=f.scrollTop()}return h},s.bgiframe=function(b){var d=a.browser,e=b.plugins.bgiframe;if(a("select, object").length<1||(!d.msie||(""+d.version).charAt(0)!=="6"))return c;return"object"===typeof e?e:b.plugins.bgiframe=new P(b)},s.bgiframe.initialize="render"})
;
$(document).ready(function() {
  var switched = false;
  var updateTables = function() {
    if (($(window).width() < 767) && !switched ){
      switched = true;
      $("table.responsive").each(function(i, element) {
        splitTable($(element));
      });
      return true;
    }
    else if (switched && ($(window).width() > 767)) {
      switched = false;
      $("table.responsive").each(function(i, element) {
        unsplitTable($(element));
      });
    }
  };
  
  $(window).load(updateTables);
  $(window).bind("resize", updateTables);
   
  
  function splitTable(original)
  {
    original.wrap("<div class='table-wrapper' />");
    
    var copy = original.clone();
    copy.find("td:not(:first-child), th:not(:first-child)").css("display", "none");
    copy.removeClass("responsive");
    
    original.closest(".table-wrapper").append(copy);
    copy.wrap("<div class='pinned' />");
    original.wrap("<div class='scrollable' />");
  }
  
  function unsplitTable(original) {
    original.closest(".table-wrapper").find(".pinned").remove();
    original.unwrap();
    original.unwrap();
  }

});

;
/*
Copyright 2012 Igor Vaynberg
 
Version: 3.0 Timestamp: Tue Jul 31 21:09:16 PDT 2012

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in
compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is
distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
(function(f){"undefined"==typeof f.fn.each2&&f.fn.extend({each2:function(h){for(var l=f([0]),j=-1,m=this.length;++j<m&&(l.context=l[0]=this[j])&&!1!==h.call(l[0],j,l););return this}})})(jQuery);
(function(f,h){function l(a){return a&&"string"===typeof a?a.replace("&","&amp;"):a}function j(a,b){var c=0,d=b.length,g;if("undefined"===typeof a)return-1;if(a.constructor===String)for(;c<d;c+=1){if(0===a.localeCompare(b[c]))return c}else for(;c<d;c+=1)if(g=b[c],g.constructor===String){if(0===g.localeCompare(a))return c}else if(g===a)return c;return-1}function m(a,b){return a===b?!0:a===h||b===h||null===a||null===b?!1:a.constructor===String?0===a.localeCompare(b):b.constructor===String?0===b.localeCompare(a):
!1}function y(a,b){var c,d,g;if(null===a||1>a.length)return[];c=a.split(b);d=0;for(g=c.length;d<g;d+=1)c[d]=f.trim(c[d]);return c}function z(a,b){var c;return function(){window.clearTimeout(c);c=window.setTimeout(b,a)}}function i(a){a.preventDefault();a.stopPropagation()}function A(a,b,c){var d=a.toUpperCase().indexOf(b.toUpperCase()),b=b.length;0>d?c.push(a):(c.push(a.substring(0,d)),c.push("<span class='select2-match'>"),c.push(a.substring(d,d+b)),c.push("</span>"),c.push(a.substring(d+b,a.length)))}
function B(a){var b,c=0,d=null,g=a.quietMillis||100;return function(k){window.clearTimeout(b);b=window.setTimeout(function(){var b=c+=1,g=a.data,e=a.transport||f.ajax,h=a.type||"GET",g=g.call(this,k.term,k.page,k.context);null!==d&&d.abort();d=e.call(null,{url:a.url,dataType:a.dataType,data:g,type:h,success:function(d){b<c||(d=a.results(d,k.page),k.callback(d))}})},g)}}function C(a){var b=a,c,d=function(a){return""+a.text};f.isArray(b)||(d=b.text,f.isFunction(d)||(c=b.text,d=function(a){return a[c]}),
b=b.results);return function(a){var c=a.term,e={};if(c==="")a.callback({results:b});else{e.results=f(b).filter(function(){return a.matcher(c,d(this))}).get();a.callback(e)}}}function D(a){return f.isFunction(a)?a:function(b){var c=b.term,d={results:[]};f(a).each(function(){var a=this.text!==h,f=a?this.text:this;if(""===c||b.matcher(c,f))d.results.push(a?this:{id:this,text:this})});b.callback(d)}}function s(a){if(f.isFunction(a))return!0;if(!a)return fasle;throw Error("formatterName must be a function or a falsy value");
}function t(a){return f.isFunction(a)?a():a}function v(a,b){var c=function(){};c.prototype=new a;c.prototype.constructor=c;c.prototype.parent=a.prototype;c.prototype=f.extend(c.prototype,b);return c}if(window.Select2===h){var e,u,w,x,r;e={TAB:9,ENTER:13,ESC:27,SPACE:32,LEFT:37,UP:38,RIGHT:39,DOWN:40,SHIFT:16,CTRL:17,ALT:18,PAGE_UP:33,PAGE_DOWN:34,HOME:36,END:35,BACKSPACE:8,DELETE:46,isArrow:function(a){a=a.which?a.which:a;switch(a){case e.LEFT:case e.RIGHT:case e.UP:case e.DOWN:return!0}return!1},
isControl:function(a){a=a.which?a.which:a;switch(a){case e.SHIFT:case e.CTRL:case e.ALT:return!0}return a.metaKey?!0:!1},isFunctionKey:function(a){a=a.which?a.which:a;return 112<=a&&123>=a}};f(document).delegate("*","mousemove",function(a){f.data(document,"select2-lastpos",{x:a.pageX,y:a.pageY})});f(document).ready(function(){f(document).delegate("*","mousedown touchend",function(a){var b=f(a.target).closest("div.select2-container").get(0),c;b?f(document).find("div.select2-container-active").each(function(){this!==
b&&f(this).data("select2").blur()}):(b=f(a.target).closest("div.select2-drop").get(0),f(document).find("div.select2-drop-active").each(function(){this!==b&&f(this).data("select2").blur()}));b=f(a.target);c=b.attr("for");"LABEL"===a.target.tagName&&(c&&0<c.length)&&(b=f("#"+c),b=b.data("select2"),b!==h&&(b.focus(),a.preventDefault()))})});u=v(Object,{bind:function(a){var b=this;return function(){a.apply(b,arguments)}},init:function(a){var b,c;this.opts=a=this.prepareOpts(a);this.id=a.id;a.element.data("select2")!==
h&&null!==a.element.data("select2")&&this.destroy();this.enabled=!0;this.container=this.createContainer();var d=!1,g;this.body=function(){!1===d&&(g=a.element.closest("body"),d=!0);return g};a.element.attr("class")!==h&&this.container.addClass(a.element.attr("class"));this.container.css(t(a.containerCss));this.container.addClass(t(a.containerCssClass));this.opts.element.data("select2",this).hide().after(this.container);this.container.data("select2",this);this.dropdown=this.container.find(".select2-drop");
this.dropdown.css(t(a.dropdownCss));this.dropdown.addClass(t(a.dropdownCssClass));this.dropdown.data("select2",this);this.results=b=this.container.find(".select2-results");this.search=c=this.container.find("input.select2-input");c.attr("tabIndex",this.opts.element.attr("tabIndex"));this.resultsPage=0;this.context=null;this.initContainer();this.initContainerWidth();this.results.bind("mousemove",function(a){var b=f.data(document,"select2-lastpos");(b===h||b.x!==a.pageX||b.y!==a.pageY)&&f(a.target).trigger("mousemove-filtered",
a)});this.dropdown.delegate(".select2-results","mousemove-filtered",this.bind(this.highlightUnderEvent));var k=this.results,e=z(80,function(a){k.trigger("scroll-debounced",a)});k.bind("scroll",function(a){0<=j(a.target,k.get())&&e(a)});this.dropdown.delegate(".select2-results","scroll-debounced",this.bind(this.loadMoreIfNeeded));f.fn.mousewheel&&b.mousewheel(function(a,c,d,g){c=b.scrollTop();0<g&&0>=c-g?(b.scrollTop(0),i(a)):0>g&&b.get(0).scrollHeight-b.scrollTop()+g<=b.height()&&(b.scrollTop(b.get(0).scrollHeight-
b.height()),i(a))});c.bind("keydown",function(){f.data(c,"keyup-change-value")===h&&f.data(c,"keyup-change-value",c.val())});c.bind("keyup",function(){var a=f.data(c,"keyup-change-value");a!==h&&c.val()!==a&&(f.removeData(c,"keyup-change-value"),c.trigger("keyup-change"))});c.bind("keyup-change",this.bind(this.updateResults));c.bind("focus",function(){c.addClass("select2-focused");" "===c.val()&&c.val("")});c.bind("blur",function(){c.removeClass("select2-focused")});this.dropdown.delegate(".select2-results",
"mouseup",this.bind(function(a){0<f(a.target).closest(".select2-result-selectable:not(.select2-disabled)").length?(this.highlightUnderEvent(a),this.selectHighlighted(a)):this.focusSearch();i(a)}));this.dropdown.bind("click mouseup mousedown",function(a){a.stopPropagation()});f.isFunction(this.opts.initSelection)&&(this.initSelection(),this.monitorSource());a.element.is(":disabled")&&this.disable()},destroy:function(){var a=this.opts.element.data("select2");a!==h&&(a.container.remove(),a.dropdown.remove(),
a.opts.element.removeData("select2").unbind(".select2").show())},prepareOpts:function(a){var b,c,d;b=a.element;"select"===b.get(0).tagName.toLowerCase()&&(this.select=c=a.element);a.separator=a.separator||",";c&&f.each("id multiple ajax query createSearchChoice initSelection data tags".split(" "),function(){if(this in a)throw Error("Option '"+this+"' is not allowed for Select2 when attached to a <select> element.");});a=f.extend({},{populateResults:function(b,c,d){var e,E=this.opts.id;e=function(b,
c,g){var k,i,j,p,q,n,m;k=0;for(i=b.length;k<i;k=k+1){j=b[k];p=E(j)!==h;q="children"in j&&j.children.length>0;n=f("<li></li>");n.addClass("select2-results-dept-"+g);n.addClass("select2-result");n.addClass(p?"select2-result-selectable":"select2-result-unselectable");q&&n.addClass("select2-result-with-children");p=f("<div></div>");p.addClass("select2-result-label");m=a.formatResult(j,p,d);m!==h&&p.html(l(m));n.append(p);if(q){q=f("<ul></ul>");q.addClass("select2-result-sub");e(j.children,q,g+1);n.append(q)}n.data("select2-data",
j);c.append(n)}};e(c,b,0)}},f.fn.select2.defaults,a);"function"!==typeof a.id&&(d=a.id,a.id=function(a){return a[d]});if(c)a.query=this.bind(function(a){var c={results:[],more:false},d=a.term,e,i,j;j=function(b,c){var f;if(b.is("option"))a.matcher(d,b.text(),b)&&c.push({id:b.attr("value"),text:b.text(),element:b.get()});else if(b.is("optgroup")){f={text:b.attr("label"),children:[],element:b.get()};b.children().each2(function(a,b){j(b,f.children)});f.children.length>0&&c.push(f)}};e=b.children();if(this.getPlaceholder()!==
h&&e.length>0){i=e[0];f(i).text()===""&&(e=e.not(i))}e.each2(function(a,b){j(b,c.results)});a.callback(c)}),a.id=function(a){return a.id};else if(!("query"in a))if("ajax"in a){if((c=a.element.data("ajax-url"))&&0<c.length)a.ajax.url=c;a.query=B(a.ajax)}else"data"in a?a.query=C(a.data):"tags"in a&&(a.query=D(a.tags),a.createSearchChoice=function(a){return{id:a,text:a}},a.initSelection=function(b,c){var d=[];f(y(b.val(),a.separator)).each(function(){var b=this,c=this,g=a.tags;f.isFunction(g)&&(g=g());
f(g).each(function(){if(m(this.id,b)){c=this.text;return false}});d.push({id:b,text:c})});c(d)});if("function"!==typeof a.query)throw"query function not defined for Select2 "+a.element.attr("id");return a},monitorSource:function(){this.opts.element.bind("change.select2",this.bind(function(){!0!==this.opts.element.data("select2-change-triggered")&&this.initSelection()}))},triggerChange:function(a){a=a||{};a=f.extend({},a,{type:"change",val:this.val()});this.opts.element.data("select2-change-triggered",
!0);this.opts.element.trigger(a);this.opts.element.data("select2-change-triggered",!1);this.opts.element.click()},enable:function(){this.enabled||(this.enabled=!0,this.container.removeClass("select2-container-disabled"))},disable:function(){this.enabled&&(this.close(),this.enabled=!1,this.container.addClass("select2-container-disabled"))},opened:function(){return this.container.hasClass("select2-dropdown-open")},positionDropdown:function(){var a=this.container.offset(),b=this.container.outerHeight(),
c=this.container.outerWidth(),d=this.dropdown.outerHeight(),g=f(window).scrollTop()+document.documentElement.clientHeight,b=a.top+b,g=b+d<=g,e=a.top-d>=this.body().scrollTop(),h;this.dropdown.hasClass("select2-drop-above")?(h=!0,!e&&g&&(h=!1)):(h=!1,!g&&e&&(h=!0));h?(b=a.top-d,this.container.addClass("select2-drop-above"),this.dropdown.addClass("select2-drop-above")):(this.container.removeClass("select2-drop-above"),this.dropdown.removeClass("select2-drop-above"));this.dropdown.css({top:b,left:a.left,
width:c})},shouldOpen:function(){var a;if(this.opened())return!1;a=jQuery.Event("open");this.opts.element.trigger(a);return!a.isDefaultPrevented()},clearDropdownAlignmentPreference:function(){this.container.removeClass("select2-drop-above");this.dropdown.removeClass("select2-drop-above")},open:function(){if(!this.shouldOpen())return!1;window.setTimeout(this.bind(this.opening),1);return!0},opening:function(){this.clearDropdownAlignmentPreference();" "===this.search.val()&&this.search.val("");this.dropdown.addClass("select2-drop-active");
this.container.addClass("select2-dropdown-open").addClass("select2-container-active");this.updateResults(!0);this.dropdown[0]!==this.body().children().last()[0]&&this.dropdown.detach().appendTo(this.body());this.dropdown.show();this.ensureHighlightVisible();this.positionDropdown();this.focusSearch()},close:function(){this.opened()&&(this.clearDropdownAlignmentPreference(),this.dropdown.hide(),this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active"),this.results.empty(),
this.clearSearch(),this.opts.element.trigger(jQuery.Event("close")))},clearSearch:function(){},ensureHighlightVisible:function(){var a=this.results,b,c,d,g;c=this.highlight();0>c||(0==c?a.scrollTop(0):(b=a.find(".select2-result-selectable"),d=f(b[c]),g=d.offset().top+d.outerHeight(),c===b.length-1&&(b=a.find("li.select2-more-results"),0<b.length&&(g=b.offset().top+b.outerHeight())),b=a.offset().top+a.outerHeight(),g>b&&a.scrollTop(a.scrollTop()+(g-b)),d=d.offset().top-a.offset().top,0>d&&a.scrollTop(a.scrollTop()+
d)))},moveHighlight:function(a){for(var b=this.results.find(".select2-result-selectable"),c=this.highlight();-1<c&&c<b.length;){var c=c+a,d=f(b[c]);if(d.hasClass("select2-result-selectable")&&!d.hasClass("select2-disabled")){this.highlight(c);break}}},highlight:function(a){var b=this.results.find(".select2-result-selectable").not(".select2-disabled");if(0===arguments.length)return j(b.filter(".select2-highlighted")[0],b.get());a>=b.length&&(a=b.length-1);0>a&&(a=0);b.removeClass("select2-highlighted");
f(b[a]).addClass("select2-highlighted");this.ensureHighlightVisible()},countSelectableResults:function(){return this.results.find(".select2-result-selectable").not(".select2-disabled").length},highlightUnderEvent:function(a){a=f(a.target).closest(".select2-result-selectable");if(0<a.length&&!a.is(".select2-highlighted")){var b=this.results.find(".select2-result-selectable");this.highlight(b.index(a))}else 0==a.length&&this.results.find(".select2-highlighted").removeClass("select2-highlighted")},loadMoreIfNeeded:function(){var a=
this.results,b=a.find("li.select2-more-results"),c,d=this.resultsPage+1,f=this,e=this.search.val(),h=this.context;0!==b.length&&(c=b.offset().top-a.offset().top-a.height(),0>=c&&(b.addClass("select2-active"),this.opts.query({term:e,page:d,context:h,matcher:this.opts.matcher,callback:this.bind(function(c){f.opts.populateResults.call(this,a,c.results,{term:e,page:d,context:h});!0===c.more?(b.detach().appendTo(a.children(":last")).text(f.opts.formatLoadMore(d+1)),window.setTimeout(function(){f.loadMoreIfNeeded()},
10)):b.remove();f.positionDropdown();f.resultsPage=d})})))},updateResults:function(a){function b(){g.scrollTop(0);d.removeClass("select2-active");j.positionDropdown()}function c(a){g.html(l(a));b()}var d=this.search,g=this.results,e=this.opts,i,j=this;if(!(!0!==a&&(!1===this.showSearchInput||!this.opened()))){d.addClass("select2-active");if(1<=e.maximumSelectionSize&&(i=this.data(),f.isArray(i)&&i.length>=e.maximumSelectionSize&&s(e.formatSelectionTooBig,"formatSelectionTooBig"))){c("<li class='select2-selection-limit'>"+
e.formatSelectionTooBig(e.maximumSelectionSize)+"</li>");return}d.val().length<e.minimumInputLength&&s(e.formatInputTooShort,"formatInputTooShort")?c("<li class='select2-no-results'>"+e.formatInputTooShort(d.val(),e.minimumInputLength)+"</li>"):(this.resultsPage=1,e.query({term:d.val(),page:this.resultsPage,context:null,matcher:e.matcher,callback:this.bind(function(i){var o;this.context=i.context===h?null:i.context;this.opts.createSearchChoice&&""!==d.val()&&(o=this.opts.createSearchChoice.call(null,
d.val(),i.results),o!==h&&null!==o&&j.id(o)!==h&&null!==j.id(o)&&0===f(i.results).filter(function(){return m(j.id(this),j.id(o))}).length&&i.results.unshift(o));0===i.results.length&&s(e.formatNoMatches,"formatNoMatches")?c("<li class='select2-no-results'>"+e.formatNoMatches(d.val())+"</li>"):(g.empty(),j.opts.populateResults.call(this,g,i.results,{term:d.val(),page:this.resultsPage,context:null}),!0===i.more&&s(e.formatLoadMore,"formatLoadMore")&&(g.children().filter(":last").append("<li class='select2-more-results'>"+
l(e.formatLoadMore(this.resultsPage))+"</li>"),window.setTimeout(function(){j.loadMoreIfNeeded()},10)),this.postprocessResults(i,a),b())})}))}},cancel:function(){this.close()},blur:function(){this.close();this.container.removeClass("select2-container-active");this.dropdown.removeClass("select2-drop-active");this.search[0]===document.activeElement&&this.search.blur();this.clearSearch();this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus")},focusSearch:function(){window.setTimeout(this.bind(function(){this.search.focus();
this.search.val(this.search.val())}),10)},selectHighlighted:function(){var a=this.highlight(),b=this.results.find(".select2-highlighted").not(".select2-disabled"),c=b.closest(".select2-result-selectable").data("select2-data");c&&(b.addClass("select2-disabled"),this.highlight(a),this.onSelect(c))},getPlaceholder:function(){return this.opts.element.attr("placeholder")||this.opts.element.attr("data-placeholder")||this.opts.element.data("placeholder")||this.opts.placeholder},initContainerWidth:function(){var a=
function(){var a,c,d,e;if("off"===this.opts.width)return null;if("element"===this.opts.width)return 0===this.opts.element.outerWidth()?"auto":this.opts.element.outerWidth()+"px";if("copy"===this.opts.width||"resolve"===this.opts.width){a=this.opts.element.attr("style");if(a!==h){a=a.split(";");d=0;for(e=a.length;d<e;d+=1)if(c=a[d].replace(/\s/g,"").match(/width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/),null!==c&&1<=c.length)return c[1]}return"resolve"===this.opts.width?(a=this.opts.element.css("width"),
0<a.indexOf("%")?a:0===this.opts.element.outerWidth()?"auto":this.opts.element.outerWidth()+"px"):null}return f.isFunction(this.opts.width)?this.opts.width():this.opts.width}.call(this);null!==a&&this.container.attr("style","width: "+a)}});w=v(u,{createContainer:function(){return f("<div></div>",{"class":"select2-container"}).html("    <a href='javascript:void(0)' class='select2-choice'>   <span></span><abbr class='select2-search-choice-close' style='display:none;'></abbr>   <div><b></b></div></a>    <div class='select2-drop select2-offscreen'>   <div class='select2-search'>       <input type='text' autocomplete='off' class='select2-input'/>   </div>   <ul class='select2-results'>   </ul></div>")},
opening:function(){this.search.show();this.parent.opening.apply(this,arguments);this.dropdown.removeClass("select2-offscreen")},close:function(){this.opened()&&(this.parent.close.apply(this,arguments),this.dropdown.removeAttr("style").addClass("select2-offscreen").insertAfter(this.selection).show())},focus:function(){this.close();this.selection.focus()},isFocused:function(){return this.selection[0]===document.activeElement},cancel:function(){this.parent.cancel.apply(this,arguments);this.selection.focus()},
initContainer:function(){var a,b=this.dropdown;this.selection=a=this.container.find(".select2-choice");this.search.bind("keydown",this.bind(function(a){if(this.enabled)if(a.which===e.PAGE_UP||a.which===e.PAGE_DOWN)i(a);else if(this.opened())switch(a.which){case e.UP:case e.DOWN:this.moveHighlight(a.which===e.UP?-1:1);i(a);break;case e.TAB:case e.ENTER:this.selectHighlighted();i(a);break;case e.ESC:this.cancel(a),i(a)}else a.which===e.TAB||(e.isControl(a)||e.isFunctionKey(a)||a.which===e.ESC)||this.open()}));
this.search.bind("focus",this.bind(function(){this.selection.attr("tabIndex","-1")}));this.search.bind("blur",this.bind(function(){this.opened()||this.container.removeClass("select2-container-active");window.setTimeout(this.bind(function(){this.selection.attr("tabIndex",this.opts.element.attr("tabIndex"))}),10)}));a.bind("mousedown",this.bind(function(a){this.opened()?(this.close(),this.selection.focus()):this.enabled&&this.open();i(a)}));b.bind("mousedown",this.bind(function(){this.search.focus()}));
a.bind("focus",this.bind(function(){this.container.addClass("select2-container-active");this.search.attr("tabIndex","-1")}));a.bind("blur",this.bind(function(){this.container.removeClass("select2-container-active");window.setTimeout(this.bind(function(){this.search.attr("tabIndex",this.opts.element.attr("tabIndex"))}),10)}));a.bind("keydown",this.bind(function(a){if(this.enabled)if(a.which===e.PAGE_UP||a.which===e.PAGE_DOWN)i(a);else if(!(a.which===e.TAB||e.isControl(a)||e.isFunctionKey(a)||a.which===
e.ESC)){this.open();if(a.which!==e.ENTER&&!(48>a.which)){var b=String.fromCharCode(a.which).toLowerCase();a.shiftKey&&(b=b.toUpperCase());this.search.val(b)}i(a)}}));a.delegate("abbr","mousedown",this.bind(function(a){this.enabled&&(this.clear(),i(a),this.close(),this.triggerChange(),this.selection.focus())}));this.setPlaceholder();this.search.bind("focus",this.bind(function(){this.container.addClass("select2-container-active")}))},clear:function(){this.opts.element.val("");this.selection.find("span").empty();
this.selection.removeData("select2-data");this.setPlaceholder()},initSelection:function(){if(""===this.opts.element.val())this.close(),this.setPlaceholder();else{var a=this;this.opts.initSelection.call(null,this.opts.element,function(b){b!==h&&null!==b&&(a.updateSelection(b),a.close(),a.setPlaceholder())})}},prepareOpts:function(){var a=this.parent.prepareOpts.apply(this,arguments);"select"===a.element.get(0).tagName.toLowerCase()&&(a.initSelection=function(a,c){var d=a.find(":selected");f.isFunction(c)&&
c({id:d.attr("value"),text:d.text()})});return a},setPlaceholder:function(){var a=this.getPlaceholder();""===this.opts.element.val()&&a!==h&&!(this.select&&""!==this.select.find("option:first").text())&&(this.selection.find("span").html(l(a)),this.selection.addClass("select2-default"),this.selection.find("abbr").hide())},postprocessResults:function(a,b){var c=0,d=this,e=!0;this.results.find(".select2-result-selectable").each2(function(a,b){if(m(d.id(b.data("select2-data")),d.opts.element.val()))return c=
a,!1});this.highlight(c);!0===b&&(e=this.showSearchInput=a.results.length>=this.opts.minimumResultsForSearch,this.dropdown.find(".select2-search")[e?"removeClass":"addClass"]("select2-search-hidden"),f(this.dropdown,this.container)[e?"addClass":"removeClass"]("select2-with-searchbox"))},onSelect:function(a){var b=this.opts.element.val();this.opts.element.val(this.id(a));this.updateSelection(a);this.close();this.selection.focus();m(b,this.id(a))||this.triggerChange()},updateSelection:function(a){var b=
this.selection.find("span");this.selection.data("select2-data",a);b.empty();a=this.opts.formatSelection(a,b);a!==h&&b.append(l(a));this.selection.removeClass("select2-default");this.opts.allowClear&&this.getPlaceholder()!==h&&this.selection.find("abbr").show()},val:function(){var a,b=null,c=this;if(0===arguments.length)return this.opts.element.val();a=arguments[0];if(this.select)this.select.val(a).find(":selected").each2(function(a,c){b={id:c.attr("value"),text:c.text()};return!1}),this.updateSelection(b),
this.setPlaceholder();else{if(this.opts.initSelection===h)throw Error("cannot call val() if initSelection() is not defined");a?this.opts.initSelection(this.opts.element,function(a){c.opts.element.val(!a?"":c.id(a));c.updateSelection(a);c.setPlaceholder()}):this.clear()}},clearSearch:function(){this.search.val("")},data:function(a){var b;if(0===arguments.length)return b=this.selection.data("select2-data"),b==h&&(b=null),b;!a||""===a?this.clear():(this.opts.element.val(!a?"":this.id(a)),this.updateSelection(a))}});
x=v(u,{createContainer:function(){return f("<div></div>",{"class":"select2-container select2-container-multi"}).html("    <ul class='select2-choices'>  <li class='select2-search-field'>    <input type='text' autocomplete='off' style='width: 25px;' class='select2-input'>  </li></ul><div class='select2-drop select2-drop-multi' style='display:none;'>   <ul class='select2-results'>   </ul></div>")},prepareOpts:function(){var a=this.parent.prepareOpts.apply(this,arguments);"select"===a.element.get(0).tagName.toLowerCase()&&
(a.initSelection=function(a,c){var d=[];a.find(":selected").each2(function(a,b){d.push({id:b.attr("value"),text:b.text()})});f.isFunction(c)&&c(d)});return a},initContainer:function(){var a;this.searchContainer=this.container.find(".select2-search-field");this.selection=a=this.container.find(".select2-choices");this.search.bind("keydown",this.bind(function(b){if(this.enabled){if(b.which===e.BACKSPACE&&""===this.search.val()){this.close();var c;c=a.find(".select2-search-choice-focus");if(0<c.length){this.unselect(c.first());
this.search.width(10);i(b);return}c=a.find(".select2-search-choice");0<c.length&&c.last().addClass("select2-search-choice-focus")}else a.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");if(this.opened())switch(b.which){case e.UP:case e.DOWN:this.moveHighlight(b.which===e.UP?-1:1);i(b);return;case e.ENTER:case e.TAB:this.selectHighlighted();i(b);return;case e.ESC:this.cancel(b);i(b);return}b.which===e.TAB||(e.isControl(b)||e.isFunctionKey(b)||b.which===e.BACKSPACE||b.which===
e.ESC)||(this.open(),(b.which===e.PAGE_UP||b.which===e.PAGE_DOWN)&&i(b))}}));this.search.bind("keyup",this.bind(this.resizeSearch));this.search.bind("blur",this.bind(function(){this.container.removeClass("select2-container-active")}));this.container.delegate(".select2-choices","mousedown",this.bind(function(a){this.enabled&&(this.clearPlaceholder(),this.open(),this.focusSearch(),a.preventDefault())}));this.container.delegate(".select2-choices","focus",this.bind(function(){this.enabled&&(this.container.addClass("select2-container-active"),
this.dropdown.addClass("select2-drop-active"),this.clearPlaceholder())}));this.clearSearch()},enable:function(){this.enabled||(this.parent.enable.apply(this,arguments),this.search.removeAttr("disabled"))},disable:function(){this.enabled&&(this.parent.disable.apply(this,arguments),this.search.attr("disabled",!0))},initSelection:function(){""===this.opts.element.val()&&(this.updateSelection([]),this.close(),this.clearSearch());if(this.select||""!==this.opts.element.val()){var a=this;this.opts.initSelection.call(null,
this.opts.element,function(b){if(b!==h&&b!==null){a.updateSelection(b);a.close();a.clearSearch()}})}},clearSearch:function(){var a=this.getPlaceholder();a!==h&&0===this.getVal().length&&!1===this.search.hasClass("select2-focused")?(this.search.val(a).addClass("select2-default"),this.resizeSearch()):this.search.val(" ").width(10)},clearPlaceholder:function(){this.search.hasClass("select2-default")?this.search.val("").removeClass("select2-default"):" "===this.search.val()&&this.search.val("")},opening:function(){this.parent.opening.apply(this,
arguments);this.clearPlaceholder();this.resizeSearch();this.focusSearch()},close:function(){this.opened()&&this.parent.close.apply(this,arguments)},focus:function(){this.close();this.search.focus()},isFocused:function(){return this.search.hasClass("select2-focused")},updateSelection:function(a){var b=[],c=[],d=this;f(a).each(function(){0>j(d.id(this),b)&&(b.push(d.id(this)),c.push(this))});a=c;this.selection.find(".select2-search-choice").remove();f(a).each(function(){d.addSelectedChoice(this)});
d.postprocessResults()},onSelect:function(a){this.addSelectedChoice(a);this.select&&this.postprocessResults();this.opts.closeOnSelect?(this.close(),this.search.width(10)):(this.search.width(10),this.resizeSearch(),0<this.countSelectableResults()?this.positionDropdown():this.close());this.triggerChange({added:a});this.focusSearch()},cancel:function(){this.close();this.focusSearch()},addSelectedChoice:function(a){var b=f("<li class='select2-search-choice'>    <div></div>    <a href='javascript:void(0)' class='select2-search-choice-close' tabindex='-1'></a></li>"),
c=this.id(a),d=this.getVal(),e;e=this.opts.formatSelection(a,b);b.find("div").replaceWith("<div>"+l(e)+"</div>");b.find(".select2-search-choice-close").bind("click dblclick",this.bind(function(a){this.enabled&&(f(a.target).closest(".select2-search-choice").fadeOut("fast").animate({width:"hide"},50,this.bind(function(){this.unselect(f(a.target));this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");this.close();this.focusSearch()})).dequeue(),i(a))})).bind("focus",
this.bind(function(){this.enabled&&(this.container.addClass("select2-container-active"),this.dropdown.addClass("select2-drop-active"))}));b.data("select2-data",a);b.insertBefore(this.searchContainer);d.push(c);this.setVal(d)},unselect:function(a){var b=this.getVal(),c,d,a=a.closest(".select2-search-choice");if(0===a.length)throw"Invalid argument: "+a+". Must be .select2-search-choice";c=a.data("select2-data");d=j(this.id(c),b);0<=d&&(b.splice(d,1),this.setVal(b),this.select&&this.postprocessResults());
a.remove();this.triggerChange({removed:c})},postprocessResults:function(){var a=this.getVal(),b=this.results.find(".select2-result-selectable"),c=this.results.find(".select2-result-with-children"),d=this;b.each2(function(b,c){var f=d.id(c.data("select2-data"));0<=j(f,a)?c.addClass("select2-disabled").removeClass("select2-result-selectable"):c.removeClass("select2-disabled").addClass("select2-result-selectable")});c.each2(function(a,b){0==b.find(".select2-result-selectable").length?b.addClass("select2-disabled"):
b.removeClass("select2-disabled")});b.each2(function(a,b){if(!b.hasClass("select2-disabled")&&b.hasClass("select2-result-selectable"))return d.highlight(0),!1})},resizeSearch:function(){var a,b,c,d,e=this.search.outerWidth()-this.search.width();a=this.search;r||(c=a[0].currentStyle||window.getComputedStyle(a[0],null),r=f("<div></div>").css({position:"absolute",left:"-10000px",top:"-10000px",display:"none",fontSize:c.fontSize,fontFamily:c.fontFamily,fontStyle:c.fontStyle,fontWeight:c.fontWeight,letterSpacing:c.letterSpacing,
textTransform:c.textTransform,whiteSpace:"nowrap"}),f("body").append(r));r.text(a.val());a=r.width()+10;b=this.search.offset().left;c=this.selection.width();d=this.selection.offset().left;b=c-(b-d)-e;b<a&&(b=c-e);40>b&&(b=c-e);this.search.width(b)},getVal:function(){var a;if(this.select)return a=this.select.val(),null===a?[]:a;a=this.opts.element.val();return y(a,this.opts.separator)},setVal:function(a){var b;this.select?this.select.val(a):(b=[],f(a).each(function(){0>j(this,b)&&b.push(this)}),this.opts.element.val(0===
b.length?"":b.join(this.opts.separator)))},val:function(){var a,b=[],c=this;if(0===arguments.length)return this.getVal();if(a=arguments[0])if(this.setVal(a),this.select)this.select.find(":selected").each(function(){b.push({id:f(this).attr("value"),text:f(this).text()})}),this.updateSelection(b);else{if(this.opts.initSelection===h)throw Error("val() cannot be called if initSelection() is not defined");this.opts.initSelection(this.opts.element,function(a){var b=f(a).map(c.id);c.setVal(b);c.updateSelection(a);
c.clearSearch()})}else this.opts.element.val(""),this.updateSelection([]);this.clearSearch()},onSortStart:function(){if(this.select)throw Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");this.search.width(0);this.searchContainer.hide()},onSortEnd:function(){var a=[],b=this;this.searchContainer.show();this.searchContainer.appendTo(this.searchContainer.parent());this.resizeSearch();this.selection.find(".select2-search-choice").each(function(){a.push(b.opts.id(f(this).data("select2-data")))});
this.setVal(a);this.triggerChange()},data:function(a){var b=this,c;if(0===arguments.length)return this.selection.find(".select2-search-choice").map(function(){return f(this).data("select2-data")}).get();a||(a=[]);c=f.map(a,function(a){return b.opts.id(a)});this.setVal(c);this.updateSelection(a);this.clearSearch()}});f.fn.select2=function(){var a=Array.prototype.slice.call(arguments,0),b,c,d,e,i="val destroy open close focus isFocused container onSortStart onSortEnd enable disable positionDropdown data".split(" ");
this.each(function(){if(0===a.length||"object"===typeof a[0])b=0===a.length?{}:f.extend({},a[0]),b.element=f(this),"select"===b.element.get(0).tagName.toLowerCase()?e=b.element.attr("multiple"):(e=b.multiple||!1,"tags"in b&&(b.multiple=e=!0)),c=e?new x:new w,c.init(b);else if("string"===typeof a[0]){if(0>j(a[0],i))throw"Unknown method: "+a[0];d=h;c=f(this).data("select2");if(c!==h&&(d="container"===a[0]?c.container:c[a[0]].apply(c,a.slice(1)),d!==h))return!1}else throw"Invalid arguments to select2 plugin: "+
a;});return d===h?this:d};f.fn.select2.defaults={width:"copy",closeOnSelect:!0,containerCss:{},dropdownCss:{},containerCssClass:"",dropdownCssClass:"",formatResult:function(a,b,c){b=[];A(a.text,c.term,b);return b.join("")},formatSelection:function(a){return a.text},formatNoMatches:function(){return"No matches found"},formatInputTooShort:function(a,b){return"Please enter "+(b-a.length)+" more characters"},formatSelectionTooBig:function(a){return"You can only select "+a+" items"},formatLoadMore:function(){return"Loading more results..."},
minimumResultsForSearch:0,minimumInputLength:0,maximumSelectionSize:0,id:function(a){return a.id},matcher:function(a,b){return 0<=b.toUpperCase().indexOf(a.toUpperCase())}};window.Select2={query:{ajax:B,local:C,tags:D},util:{debounce:z,markMatch:A},"class":{"abstract":u,single:w,multi:x}}}})(jQuery);

;
(function(a){a.fn.smartWizard=function(k){var c=a.extend({},a.fn.smartWizard.defaults,k),u=arguments;return this.each(function(){function z(){var d=b.children("div");b.children("ul").addClass("anchor");d.addClass("content");l=a("<div>Loading</div>").addClass("loader");i=a("<div></div>").addClass("actionBar");m=a("<div></div>").addClass("stepContainer");n=a("<a>"+c.labelNext+"</a>").attr("href","#").addClass("buttonNext");o=a("<a>"+c.labelPrevious+"</a>").attr("href","#").addClass("buttonPrevious");
p=a("<a>"+c.labelFinish+"</a>").attr("href","#").addClass("buttonFinish");c.errorSteps&&c.errorSteps.length>0&&a.each(c.errorSteps,function(a,b){v(b,!0)});m.append(d);i.append(l);b.append(m);b.append(i);i.append(p).append(n).append(o);w=m.width();a(n).click(function(){x();return!1});a(o).click(function(){y();return!1});a(p).click(function(){if(!a(this).hasClass("buttonDisabled"))if(a.isFunction(c.onFinish))c.onFinish.call(this,a(f));else{var d=b.parents("form");d&&d.length&&d.submit()}return!1});
a(f).bind("click",function(){if(f.index(this)==h)return!1;var a=f.index(this);f.eq(a).attr("isDone")-0==1&&q(a);return!1});c.keyNavigation&&a(document).keyup(function(a){a.which==39?x():a.which==37&&y()});A();q(h)}function A(){c.enableAllSteps?(a(f,b).removeClass("selected").removeClass("disabled").addClass("done"),a(f,b).attr("isDone",1)):(a(f,b).removeClass("selected").removeClass("done").addClass("disabled"),a(f,b).attr("isDone",0));a(f,b).each(function(d){a(a(this).attr("href"),b).hide();a(this).attr("rel",
d+1)})}function q(d){var e=f.eq(d),g=c.contentURL,h=e.data("hasContent");stepNum=d+1;g&&g.length>0?c.contentCache&&h?t(d):a.ajax({url:g,type:"POST",data:{step_number:stepNum},dataType:"text",beforeSend:function(){l.show()},error:function(){l.hide()},success:function(c){l.hide();c&&c.length>0&&(e.data("hasContent",!0),a(a(e,b).attr("href"),b).html(c),t(d))}}):t(d)}function t(d){var e=f.eq(d),g=f.eq(h);if(d!=h&&a.isFunction(c.onLeaveStep)&&!c.onLeaveStep.call(this,a(g)))return!1;m.height(a(a(e,b).attr("href"),
b).outerHeight());if(c.transitionEffect=="slide")a(a(g,b).attr("href"),b).slideUp("fast",function(){a(a(e,b).attr("href"),b).slideDown("fast");h=d;r(g,e)});else if(c.transitionEffect=="fade")a(a(g,b).attr("href"),b).fadeOut("fast",function(){a(a(e,b).attr("href"),b).fadeIn("fast");h=d;r(g,e)});else if(c.transitionEffect=="slideleft"){var i=0;d>h?(nextElmLeft1=w+10,nextElmLeft2=0,i=0-a(a(g,b).attr("href"),b).outerWidth()):(nextElmLeft1=0-a(a(e,b).attr("href"),b).outerWidth()+20,nextElmLeft2=0,i=10+
a(a(g,b).attr("href"),b).outerWidth());d==h?(nextElmLeft1=a(a(e,b).attr("href"),b).outerWidth()+20,nextElmLeft2=0,i=0-a(a(g,b).attr("href"),b).outerWidth()):a(a(g,b).attr("href"),b).animate({left:i},"fast",function(){a(a(g,b).attr("href"),b).hide()});a(a(e,b).attr("href"),b).css("left",nextElmLeft1);a(a(e,b).attr("href"),b).show();a(a(e,b).attr("href"),b).animate({left:nextElmLeft2},"fast",function(){h=d;r(g,e)})}else a(a(g,b).attr("href"),b).hide(),a(a(e,b).attr("href"),b).show(),h=d,r(g,e);return!0}
function r(d,e){a(d,b).removeClass("selected");a(d,b).addClass("done");a(e,b).removeClass("disabled");a(e,b).removeClass("done");a(e,b).addClass("selected");a(e,b).attr("isDone",1);c.cycleSteps||(0>=h?a(o).addClass("buttonDisabled"):a(o).removeClass("buttonDisabled"),f.length-1<=h?a(n).addClass("buttonDisabled"):a(n).removeClass("buttonDisabled"));!f.hasClass("disabled")||c.enableFinishButton?a(p).removeClass("buttonDisabled"):a(p).addClass("buttonDisabled");if(a.isFunction(c.onShowStep)&&!c.onShowStep.call(this,
a(e)))return!1}function x(){var a=h+1;if(f.length<=a){if(!c.cycleSteps)return!1;a=0}q(a)}function y(){var a=h-1;if(0>a){if(!c.cycleSteps)return!1;a=f.length-1}q(a)}function B(b){a(".content",j).html(b);j.show()}function v(d,c){c?a(f.eq(d-1),b).addClass("error"):a(f.eq(d-1),b).removeClass("error")}var b=a(this),h=c.selected,f=a("ul > li > a",b),w=0,l,j,i,m,n,o,p;i=a(".actionBar",b);i.length==0&&(i=a("<div></div>").addClass("actionBar"));j=a(".msgBox",b);j.length==0&&(j=a('<div class="msgBox"><div class="content"></div><a href="#" class="close">X</a></div>'),
i.append(j));a(".close",j).click(function(){j.fadeOut("normal");return!1});if(!k||k==="init"||typeof k==="object")z();else if(k==="showMessage"){var s=Array.prototype.slice.call(u,1);B(s[0]);return!0}else if(k==="setError")return s=Array.prototype.slice.call(u,1),v(s[0].stepnum,s[0].iserror),!0;else a.error("Method "+k+" does not exist")})};a.fn.smartWizard.defaults={selected:0,keyNavigation:!0,enableAllSteps:!1,transitionEffect:"fade",contentURL:null,contentCache:!0,cycleSteps:!1,enableFinishButton:!1,
errorSteps:[],labelNext:"Next",labelPrevious:"Previous",labelFinish:"Finish",onLeaveStep:null,onShowStep:null,onFinish:null}})(jQuery);
;
/**
*
* jquery.sparkline.js
*
* v2.0
* (c) Splunk, Inc
* Contact: Gareth Watts (gareth@splunk.com)
* http://omnipotent.net/jquery.sparkline/
*
* Generates inline sparkline charts from data supplied either to the method
* or inline in HTML
*
* Compatible with Internet Explorer 6.0+ and modern browsers equipped with the canvas tag
* (Firefox 2.0+, Safari, Opera, etc)
*
* License: New BSD License
*
* Copyright (c) 2012, Splunk Inc.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification,
* are permitted provided that the following conditions are met:
*
*     * Redistributions of source code must retain the above copyright notice,
*       this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright notice,
*       this list of conditions and the following disclaimer in the documentation
*       and/or other materials provided with the distribution.
*     * Neither the name of Splunk Inc nor the names of its contributors may
*       be used to endorse or promote products derived from this software without
*       specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
* OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
* SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
* SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
* OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
* HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
*
* Usage:
*  $(selector).sparkline(values, options)
*
* If values is undefined or set to 'html' then the data values are read from the specified tag:
*   <p>Sparkline: <span class="sparkline">1,4,6,6,8,5,3,5</span></p>
*   $('.sparkline').sparkline();
* There must be no spaces in the enclosed data set
*
* Otherwise values must be an array of numbers or null values
*    <p>Sparkline: <span id="sparkline1">This text replaced if the browser is compatible</span></p>
*    $('#sparkline1').sparkline([1,4,6,6,8,5,3,5])
*    $('#sparkline2').sparkline([1,4,6,null,null,5,3,5])
*
* Values can also be specified in an HTML comment, or as a values attribute:
*    <p>Sparkline: <span class="sparkline"><!--1,4,6,6,8,5,3,5 --></span></p>
*    <p>Sparkline: <span class="sparkline" values="1,4,6,6,8,5,3,5"></span></p>
*    $('.sparkline').sparkline();
*
* For line charts, x values can also be specified:
*   <p>Sparkline: <span class="sparkline">1:1,2.7:4,3.4:6,5:6,6:8,8.7:5,9:3,10:5</span></p>
*    $('#sparkline1').sparkline([ [1,1], [2.7,4], [3.4,6], [5,6], [6,8], [8.7,5], [9,3], [10,5] ])
*
* By default, options should be passed in as teh second argument to the sparkline function:
*   $('.sparkline').sparkline([1,2,3,4], {type: 'bar'})
*
* Options can also be set by passing them on the tag itself.  This feature is disabled by default though
* as there's a slight performance overhead:
*   $('.sparkline').sparkline([1,2,3,4], {enableTagOptions: true})
*   <p>Sparkline: <span class="sparkline" sparkType="bar" sparkBarColor="red">loading</span></p>
* Prefix all options supplied as tag attribute with "spark" (configurable by setting tagOptionPrefix)
*
* Supported options:
*   lineColor - Color of the line used for the chart
*   fillColor - Color used to fill in the chart - Set to '' or false for a transparent chart
*   width - Width of the chart - Defaults to 3 times the number of values in pixels
*   height - Height of the chart - Defaults to the height of the containing element
*   chartRangeMin - Specify the minimum value to use for the Y range of the chart - Defaults to the minimum value supplied
*   chartRangeMax - Specify the maximum value to use for the Y range of the chart - Defaults to the maximum value supplied
*   chartRangeClip - Clip out of range values to the max/min specified by chartRangeMin and chartRangeMax
*   chartRangeMinX - Specify the minimum value to use for the X range of the chart - Defaults to the minimum value supplied
*   chartRangeMaxX - Specify the maximum value to use for the X range of the chart - Defaults to the maximum value supplied
*   composite - If true then don't erase any existing chart attached to the tag, but draw
*           another chart over the top - Note that width and height are ignored if an
*           existing chart is detected.
*   tagValuesAttribute - Name of tag attribute to check for data values - Defaults to 'values'
*   enableTagOptions - Whether to check tags for sparkline options
*   tagOptionPrefix - Prefix used for options supplied as tag attributes - Defaults to 'spark'
*   disableHiddenCheck - If set to true, then the plugin will assume that charts will never be drawn into a
*           hidden dom element, avoding a browser reflow
*   disableInteraction - If set to true then all mouseover/click interaction behaviour will be disabled,
*       making the plugin perform much like it did in 1.x
*   disableTooltips - If set to true then tooltips will be disabled - Defaults to false (tooltips enabled)
*   disableHighlight - If set to true then highlighting of selected chart elements on mouseover will be disabled
*       defaults to false (highlights enabled)
*   highlightLighten - Factor to lighten/darken highlighted chart values by - Defaults to 1.4 for a 40% increase
*   tooltipContainer - Specify which DOM element the tooltip should be rendered into - defaults to document.body
*   tooltipClassname - Optional CSS classname to apply to tooltips - If not specified then a default style will be applied
*   tooltipOffsetX - How many pixels away from the mouse pointer to render the tooltip on the X axis
*   tooltipOffsetY - How many pixels away from the mouse pointer to render the tooltip on the r axis
*   tooltipFormatter  - Optional callback that allows you to override the HTML displayed in the tooltip
*       callback is given arguments of (sparkline, options, fields)
*   tooltipChartTitle - If specified then the tooltip uses the string specified by this setting as a title
*   tooltipFormat - A format string or SPFormat object  (or an array thereof for multiple entries)
*       to control the format of the tooltip
*   tooltipPrefix - A string to prepend to each field displayed in a tooltip
*   tooltipSuffix - A string to append to each field displayed in a tooltip
*   tooltipSkipNull - If true then null values will not have a tooltip displayed (defaults to true)
*   tooltipValueLookups - An object or range map to map field values to tooltip strings
*       (eg. to map -1 to "Lost", 0 to "Draw", and 1 to "Win")
*   numberFormatter - Optional callback for formatting numbers in tooltips
*   numberDigitGroupSep - Character to use for group separator in numbers "1,234" - Defaults to ","
*   numberDecimalMark - Character to use for the decimal point when formatting numbers - Defaults to "."
*   numberDigitGroupCount - Number of digits between group separator - Defaults to 3
*
* There are 7 types of sparkline, selected by supplying a "type" option of 'line' (default),
* 'bar', 'tristate', 'bullet', 'discrete', 'pie' or 'box'
*    line - Line chart.  Options:
*       spotColor - Set to '' to not end each line in a circular spot
*       minSpotColor - If set, color of spot at minimum value
*       maxSpotColor - If set, color of spot at maximum value
*       spotRadius - Radius in pixels
*       lineWidth - Width of line in pixels
*       normalRangeMin
*       normalRangeMax - If set draws a filled horizontal bar between these two values marking the "normal"
*                      or expected range of values
*       normalRangeColor - Color to use for the above bar
*       drawNormalOnTop - Draw the normal range above the chart fill color if true
*       defaultPixelsPerValue - Defaults to 3 pixels of width for each value in the chart
*       highlightSpotColor - The color to use for drawing a highlight spot on mouseover - Set to null to disable
*       highlightLineColor - The color to use for drawing a highlight line on mouseover - Set to null to disable
*       valueSpots - Specify which points to draw spots on, and in which color.  Accepts a range map
*
*   bar - Bar chart.  Options:
*       barColor - Color of bars for postive values
*       negBarColor - Color of bars for negative values
*       zeroColor - Color of bars with zero values
*       nullColor - Color of bars with null values - Defaults to omitting the bar entirely
*       barWidth - Width of bars in pixels
*       colorMap - Optional mappnig of values to colors to override the *BarColor values above
*                  can be an Array of values to control the color of individual bars or a range map
*                  to specify colors for individual ranges of values
*       barSpacing - Gap between bars in pixels
*       zeroAxis - Centers the y-axis around zero if true
*
*   tristate - Charts values of win (>0), lose (<0) or draw (=0)
*       posBarColor - Color of win values
*       negBarColor - Color of lose values
*       zeroBarColor - Color of draw values
*       barWidth - Width of bars in pixels
*       barSpacing - Gap between bars in pixels
*       colorMap - Optional mappnig of values to colors to override the *BarColor values above
*                  can be an Array of values to control the color of individual bars or a range map
*                  to specify colors for individual ranges of values
*
*   discrete - Options:
*       lineHeight - Height of each line in pixels - Defaults to 30% of the graph height
*       thesholdValue - Values less than this value will be drawn using thresholdColor instead of lineColor
*       thresholdColor
*
*   bullet - Values for bullet graphs msut be in the order: target, performance, range1, range2, range3, ...
*       options:
*       targetColor - The color of the vertical target marker
*       targetWidth - The width of the target marker in pixels
*       performanceColor - The color of the performance measure horizontal bar
*       rangeColors - Colors to use for each qualitative range background color
*
*   pie - Pie chart. Options:
*       sliceColors - An array of colors to use for pie slices
*       offset - Angle in degrees to offset the first slice - Try -90 or +90
*       borderWidth - Width of border to draw around the pie chart, in pixels - Defaults to 0 (no border)
*       borderColor - Color to use for the pie chart border - Defaults to #000
*
*   box - Box plot. Options:
*       raw - Set to true to supply pre-computed plot points as values
*             values should be: low_outlier, low_whisker, q1, median, q3, high_whisker, high_outlier
*             When set to false you can supply any number of values and the box plot will
*             be computed for you.  Default is false.
*       showOutliers - Set to true (default) to display outliers as circles
*       outlierIRQ - Interquartile range used to determine outliers.  Default 1.5
*       boxLineColor - Outline color of the box
*       boxFillColor - Fill color for the box
*       whiskerColor - Line color used for whiskers
*       outlierLineColor - Outline color of outlier circles
*       outlierFillColor - Fill color of the outlier circles
*       spotRadius - Radius of outlier circles
*       medianColor - Line color of the median line
*       target - Draw a target cross hair at the supplied value (default undefined)
*
*
*
*   Examples:
*   $('#sparkline1').sparkline(myvalues, { lineColor: '#f00', fillColor: false });
*   $('.barsparks').sparkline('html', { type:'bar', height:'40px', barWidth:5 });
*   $('#tristate').sparkline([1,1,-1,1,0,0,-1], { type:'tristate' }):
*   $('#discrete').sparkline([1,3,4,5,5,3,4,5], { type:'discrete' });
*   $('#bullet').sparkline([10,12,12,9,7], { type:'bullet' });
*   $('#pie').sparkline([1,1,2], { type:'pie' });
*/

/*jslint regexp: true, browser: true, jquery: true, white: true, nomen: false, plusplus: false, maxerr: 500, indent: 4 */

(function ($) {
    'use strict';

    var UNSET_OPTION = {},
        getDefaults, createClass, SPFormat, clipval, quartile, normalizeValue, normalizeValues,
        remove, isNumber, all, sum, addCSS, ensureArray, formatNumber, RangeMap,
        MouseHandler, Tooltip, barHighlightMixin,
        line, bar, tristate, discrete, bullet, pie, box, defaultStyles, initStyles,
         VShape, VCanvas_base, VCanvas_canvas, VCanvas_vml, pending, shapeCount = 0;

    /**
     * Default configuration settings
     */
    getDefaults = function () {
        return {
            // Settings common to most/all chart types
            common: {
                type: 'line',
                lineColor: '#00f',
                fillColor: '#cdf',
                defaultPixelsPerValue: 3,
                width: 'auto',
                height: 'auto',
                composite: false,
                tagValuesAttribute: 'values',
                tagOptionsPrefix: 'spark',
                enableTagOptions: false,
                enableHighlight: true,
                highlightLighten: 1.4,
                tooltipSkipNull: true,
                tooltipPrefix: '',
                tooltipSuffix: '',
                disableHiddenCheck: false,
                numberFormatter: false,
                numberDigitGroupCount: 3,
                numberDigitGroupSep: ',',
                numberDecimalMark: '.',
                disableTooltips: false,
                disableInteraction: false
            },
            // Defaults for line charts
            line: {
                spotColor: '#f80',
                highlightSpotColor: '#5f5',
                highlightLineColor: '#f22',
                spotRadius: 1.5,
                minSpotColor: '#f80',
                maxSpotColor: '#f80',
                lineWidth: 1,
                normalRangeMin: undefined,
                normalRangeMax: undefined,
                normalRangeColor: '#ccc',
                drawNormalOnTop: false,
                chartRangeMin: undefined,
                chartRangeMax: undefined,
                chartRangeMinX: undefined,
                chartRangeMaxX: undefined,
                tooltipFormat: new SPFormat('<span style="color: {{color}}">&#9679;</span> {{prefix}}{{y}}{{suffix}}')
            },
            // Defaults for bar charts
            bar: {
                barColor: '#3366cc',
                negBarColor: '#f44',
                stackedBarColor: ['#3366cc', '#dc3912', '#ff9900', '#109618', '#66aa00',
                    '#dd4477', '#0099c6', '#990099'],
                zeroColor: undefined,
                nullColor: undefined,
                zeroAxis: true,
                barWidth: 4,
                barSpacing: 1,
                chartRangeMax: undefined,
                chartRangeMin: undefined,
                chartRangeClip: false,
                colorMap: undefined,
                tooltipFormat: new SPFormat('<span style="color: {{color}}">&#9679;</span> {{prefix}}{{value}}{{suffix}}')
            },
            // Defaults for tristate charts
            tristate: {
                barWidth: 4,
                barSpacing: 1,
                posBarColor: '#6f6',
                negBarColor: '#f44',
                zeroBarColor: '#999',
                colorMap: {},
                tooltipFormat: new SPFormat('<span style="color: {{color}}">&#9679;</span> {{value:map}}'),
                tooltipValueLookups: { map: { '-1': 'Loss', '0': 'Draw', '1': 'Win' } }
            },
            // Defaults for discrete charts
            discrete: {
                lineHeight: 'auto',
                thresholdColor: undefined,
                thresholdValue: 0,
                chartRangeMax: undefined,
                chartRangeMin: undefined,
                chartRangeClip: false,
                tooltipFormat: new SPFormat('{{prefix}}{{value}}{{suffix}}')
            },
            // Defaults for bullet charts
            bullet: {
                targetColor: '#f33',
                targetWidth: 3, // width of the target bar in pixels
                performanceColor: '#33f',
                rangeColors: ['#d3dafe', '#a8b6ff', '#7f94ff'],
                base: undefined, // set this to a number to change the base start number
                tooltipFormat: new SPFormat('{{fieldkey:fields}} - {{value}}'),
                tooltipValueLookups: { fields: {r: 'Range', p: 'Performance', t: 'Target'} }
            },
            // Defaults for pie charts
            pie: {
                offset: 0,
                sliceColors: ['#3366cc', '#dc3912', '#ff9900', '#109618', '#66aa00',
                    '#dd4477', '#0099c6', '#990099'],
                borderWidth: 0,
                borderColor: '#000',
                tooltipFormat: new SPFormat('<span style="color: {{color}}">&#9679;</span> {{value}} ({{percent.1}}%)')
            },
            // Defaults for box plots
            box: {
                raw: false,
                boxLineColor: '#000',
                boxFillColor: '#cdf',
                whiskerColor: '#000',
                outlierLineColor: '#333',
                outlierFillColor: '#fff',
                medianColor: '#f00',
                showOutliers: true,
                outlierIQR: 1.5,
                spotRadius: 1.5,
                target: undefined,
                targetColor: '#4a2',
                chartRangeMax: undefined,
                chartRangeMin: undefined,
                tooltipFormat: new SPFormat('{{field:fields}}: {{value}}'),
                tooltipFormatFieldlistKey: 'field',
                tooltipValueLookups: { fields: { lq: 'Lower Quartile', med: 'Median',
                    uq: 'Upper Quartile', lo: 'Left Outlier', ro: 'Right Outlier',
                    lw: 'Left Whisker', rw: 'Right Whisker'} }
            }
        };
    };

    // You can have tooltips use a css class other than jqstooltip by specifying tooltipClassname
    defaultStyles = '.jqstooltip { ' +
            'position: absolute;' +
            'left: 0px;' +
            'top: 0px;' +
            'visibility: hidden;' +
            'background: rgb(0, 0, 0) transparent;' +
            'background-color: rgba(0,0,0,0.6);' +
            'filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000);' +
            '-ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000)";' +
            'color: white;' +
            'font: 10px arial, san serif;' +
            'text-align: left;' +
            'white-space: nowrap;' +
            'padding: 5px;' +
            'border: 1px solid white;' +
            '}' +
            '.jqsfield { ' +
            'color: white;' +
            'font: 10px arial, san serif;' +
            'text-align: left;' +
            '}';

    initStyles = function() {
        addCSS(defaultStyles);
    };

    $(initStyles);

    /**
     * Utilities
     */

    createClass = function (/* [baseclass, [mixin, ...]], definition */) {
        var Class, args;
        Class = function () {
            this.init.apply(this, arguments);
        };
        if (arguments.length > 1) {
            if (arguments[0]) {
                Class.prototype = $.extend(new arguments[0](), arguments[arguments.length - 1]);
                Class._super = arguments[0].prototype;
            } else {
                Class.prototype = arguments[arguments.length - 1];
            }
            if (arguments.length > 2) {
                args = Array.prototype.slice.call(arguments, 1, -1);
                args.unshift(Class.prototype);
                $.extend.apply($, args);
            }
        } else {
            Class.prototype = arguments[0];
        }
        Class.prototype.cls = Class;
        return Class;
    };

    /**
     * Wraps a format string for tooltips
     * {{x}}
     * {{x.2}
     * {{x:months}}
     */
    $.SPFormatClass = SPFormat = createClass({
        fre: /\{\{([\w.]+?)(:(.+?))?\}\}/g,
        precre: /(\w+)\.(\d+)/,

        init: function (format, fclass) {
            this.format = format;
            this.fclass = fclass;
        },

        render: function (fieldset, lookups, options) {
            var self = this,
                fields = fieldset,
                match, token, lookupkey, fieldvalue, prec;
            return this.format.replace(this.fre, function () {
                var lookup;
                token = arguments[1];
                lookupkey = arguments[3];
                match = self.precre.exec(token);
                if (match) {
                    prec = match[2];
                    token = match[1];
                } else {
                    prec = false;
                }
                fieldvalue = fields[token];
                if (fieldvalue === undefined) {
                    return '';
                }
                if (lookupkey && lookups && lookups[lookupkey]) {
                    lookup = lookups[lookupkey];
                    if (lookup.get) { // RangeMap
                        return lookups[lookupkey].get(fieldvalue) || fieldvalue;
                    } else {
                        return lookups[lookupkey][fieldvalue] || fieldvalue;
                    }
                }
                if (isNumber(fieldvalue)) {
                    if (options.get('numberFormatter')) {
                        fieldvalue = options.get('numberFormatter')(fieldvalue);
                    } else {
                        fieldvalue = formatNumber(fieldvalue, prec,
                            options.get('numberDigitGroupCount'),
                            options.get('numberDigitGroupSep'),
                            options.get('numberDecimalMark'));
                    }
                }
                return fieldvalue;
            });
        }
    });

    // convience method to avoid needing the new operator
    $.spformat = function(format, fclass) {
        return new SPFormat(format, fclass);
    };

    clipval = function (val, min, max) {
        if (val < min) {
            return min;
        }
        if (val > max) {
            return max;
        }
        return val;
    };

    quartile = function (values, q) {
        var vl;
        if (q === 2) {
            vl = Math.floor(values.length / 2);
            return values.length % 2 ? values[vl] : (values[vl] + values[vl + 1]) / 2;
        } else {
            vl = Math.floor(values.length / 4);
            return values.length % 2 ? (values[vl * q] + values[vl * q + 1]) / 2 : values[vl * q];
        }
    };

    normalizeValue = function (val) {
        var nf;
        switch (val) {
            case 'undefined':
                val = undefined;
                break;
            case 'null':
                val = null;
                break;
            case 'true':
                val = true;
                break;
            case 'false':
                val = false;
                break;
            default:
                nf = parseFloat(val);
                if (val == nf) {
                    val = nf;
                }
        }
        return val;
    };

    normalizeValues = function (vals) {
        var i, result = [];
        for (i = vals.length; i--;) {
            result[i] = normalizeValue(vals[i]);
        }
        return result;
    };

    remove = function (vals, filter) {
        var i, vl, result = [];
        for (i = 0, vl = vals.length; i < vl; i++) {
            if (vals[i] !== filter) {
                result.push(vals[i]);
            }
        }
        return result;
    };

    isNumber = function (num) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    };

    formatNumber = function (num, prec, groupsize, groupsep, decsep) {
        var p, i;
        num = (prec === false ? parseFloat(num).toString() : num.toFixed(prec)).split('');
        p = (p = $.inArray('.', num)) < 0 ? num.length : p;
        if (p < num.length) {
            num[p] = decsep;
        }
        for (i = p - groupsize; i > 0; i -= groupsize) {
            num.splice(i, 0, groupsep);
        }
        return num.join('');
    };

    // determine if all values of an array match a value
    // returns true if the array is empty
    all = function (val, arr, ignoreNull) {
        var i;
        for (i = arr.length; i--; ) {
            if (arr[i] !== val || (!ignoreNull && val === null)) {
                return false;
            }
        }
        return true;
    };

    // sums the numeric values in an array, ignoring other values
    sum = function (vals) {
        var total = 0, i;
        for (i = vals.length; i--;) {
            total += typeof vals[i] === 'number' ? vals[i] : 0;
        }
        return total;
    };

    ensureArray = function (val) {
        return $.isArray(val) ? val : [val];
    };

    // http://paulirish.com/2008/bookmarklet-inject-new-css-rules/
    addCSS = function(css) {
        var tag;
        //if ('\v' == 'v') /* ie only */ {
        if (document.createStyleSheet) {
            document.createStyleSheet().cssText = css;
        } else {
            tag = document.createElement('style');
            tag.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(tag);
            tag[(typeof document.body.style.WebkitAppearance == 'string') /* webkit only */ ? 'innerText' : 'innerHTML'] = css;
        }
    };

    // Provide a cross-browser interface to a few simple drawing primitives
    $.fn.simpledraw = function (width, height, useExisting, interact) {
        var target, mhandler;
        if (useExisting && (target = this.data('_jqs_vcanvas'))) {
            return target;
        }
        if (width === undefined) {
            width = $(this).innerWidth();
        }
        if (height === undefined) {
            height = $(this).innerHeight();
        }
        if ($.browser.hasCanvas) {
            target = new VCanvas_canvas(width, height, this, interact);
        } else if ($.browser.msie) {
            target = new VCanvas_vml(width, height, this);
        } else {
            return false;
        }
        mhandler = $(this).data('_jqs_mhandler');
        if (mhandler) {
            mhandler.registerCanvas(target);
        }
        return target;
    };

    $.fn.cleardraw = function () {
        var target = this.data('_jqs_vcanvas');
        if (target) {
            target.reset();
        }
    };

    $.RangeMapClass = RangeMap = createClass({
        init: function (map) {
            var key, range, rangelist = [];
            for (key in map) {
                if (map.hasOwnProperty(key) && typeof key === 'string' && key.indexOf(':') > -1) {
                    range = key.split(':');
                    range[0] = range[0].length === 0 ? -Infinity : parseFloat(range[0]);
                    range[1] = range[1].length === 0 ? Infinity : parseFloat(range[1]);
                    range[2] = map[key];
                    rangelist.push(range);
                }
            }
            this.map = map;
            this.rangelist = rangelist || false;
        },

        get: function (value) {
            var rangelist = this.rangelist,
                i, range, result;
            if ((result = this.map[value]) !== undefined) {
                return result;
            }
            if (rangelist) {
                for (i = rangelist.length; i--;) {
                    range = rangelist[i];
                    if (range[0] <= value && range[1] >= value) {
                        return range[2];
                    }
                }
            }
            return undefined;
        }
    });

    // Convenience function
    $.range_map = function(map) {
        return new RangeMap(map);
    };

    MouseHandler = createClass({
        init: function (el, options) {
            var $el = $(el);
            this.$el = $el;
            this.options = options;
            this.currentPageX = 0;
            this.currentPageY = 0;
            this.el = el;
            this.splist = [];
            this.tooltip = null;
            this.over = false;
            this.displayTooltips = !options.get('disableTooltips');
            this.highlightEnabled = !options.get('disableHighlight');
        },

        registerSparkline: function (sp) {
            this.splist.push(sp);
            if (this.over) {
                this.updateDisplay();
            }
        },

        registerCanvas: function (canvas) {
            var $canvas = $(canvas.canvas);
            this.canvas = canvas;
            this.$canvas = $canvas;
            $canvas.mouseenter($.proxy(this.mouseenter, this));
            $canvas.mouseleave($.proxy(this.mouseleave, this));
            $canvas.click($.proxy(this.mouseclick, this));
        },

        reset: function (removeTooltip) {
            this.splist = [];
            if (this.tooltip && removeTooltip) {
                this.tooltip.remove();
                this.tooltip = undefined;
            }
        },

        mouseclick: function (e) {
            var clickEvent = $.Event('sparklineClick');
            clickEvent.originalEvent = e;
            clickEvent.sparklines = this.splist;
            this.$el.trigger(clickEvent);
        },

        mouseenter: function (e) {
            $(document.body).unbind('mousemove.jqs');
            $(document.body).bind('mousemove.jqs', $.proxy(this.mousemove, this));
            this.over = true;
            this.currentPageX = e.pageX;
            this.currentPageY = e.pageY;
            this.currentEl = e.target;
            if (!this.tooltip && this.displayTooltips) {
                this.tooltip = new Tooltip(this.options);
                this.tooltip.updatePosition(e.pageX, e.pageY);
            }
            this.updateDisplay();
        },

        mouseleave: function () {
            $(document.body).unbind('mousemove.jqs');
            var splist = this.splist,
                 spcount = splist.length,
                 needsRefresh = false,
                 sp, i;
            this.over = false;
            this.currentEl = null;

            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }

            for (i = 0; i < spcount; i++) {
                sp = splist[i];
                if (sp.clearRegionHighlight()) {
                    needsRefresh = true;
                }
            }

            if (needsRefresh) {
                this.canvas.render();
            }
        },

        mousemove: function (e) {
            this.currentPageX = e.pageX;
            this.currentPageY = e.pageY;
            this.currentEl = e.target;
            if (this.tooltip) {
                this.tooltip.updatePosition(e.pageX, e.pageY);
            }
            this.updateDisplay();
        },

        updateDisplay: function () {
            var splist = this.splist,
                 spcount = splist.length,
                 needsRefresh = false,
                 offset = this.$canvas.offset(),
                 localX = this.currentPageX - offset.left,
                 localY = this.currentPageY - offset.top,
                 tooltiphtml, sp, i, result, changeEvent;
            if (!this.over) {
                return;
            }
            for (i = 0; i < spcount; i++) {
                sp = splist[i];
                result = sp.setRegionHighlight(this.currentEl, localX, localY);
                if (result) {
                    needsRefresh = true;
                }
            }
            if (needsRefresh) {
                changeEvent = $.Event('sparklineRegionChange');
                changeEvent.sparklines = this.splist;
                this.$el.trigger(changeEvent);
                if (this.tooltip) {
                    tooltiphtml = '';
                    for (i = 0; i < spcount; i++) {
                        sp = splist[i];
                        tooltiphtml += sp.getCurrentRegionTooltip();
                    }
                    this.tooltip.setContent(tooltiphtml);
                }
                if (!this.disableHighlight) {
                    this.canvas.render();
                }
            }
            if (result === null) {
                this.mouseleave();
            }
        }
    });


    Tooltip = createClass({
        sizeStyle: 'position: static !important;' +
            'display: block !important;' +
            'visibility: hidden !important;' +
            'float: left !important;',

        init: function (options) {
            var tooltipClassname = options.get('tooltipClassname', 'jqstooltip'),
                sizetipStyle = this.sizeStyle,
                offset;
            this.container = options.get('tooltipContainer') || document.body;
            this.tooltipOffsetX = options.get('tooltipOffsetX', 10);
            this.tooltipOffsetY = options.get('tooltipOffsetY', 12);
            // remove any previous lingering tooltip
            $('#jqssizetip').remove();
            $('#jqstooltip').remove();
            this.sizetip = $('<div/>', {
                id: 'jqssizetip',
                style: sizetipStyle,
                'class': tooltipClassname
            });
            this.tooltip = $('<div/>', {
                id: 'jqstooltip',
                'class': tooltipClassname
            }).appendTo(this.container);
            // account for the container's location
            offset = this.tooltip.offset();
            this.offsetLeft = offset.left;
            this.offsetTop = offset.top;
            this.hidden = true;
            $(window).unbind('resize.jqs scroll.jqs');
            $(window).bind('resize.jqs scroll.jqs', $.proxy(this.updateWindowDims, this));
            this.updateWindowDims();
        },

        updateWindowDims: function () {
            this.scrollTop = $(window).scrollTop();
            this.scrollLeft = $(window).scrollLeft();
            this.scrollRight = this.scrollLeft + $(window).width();
            this.updatePosition();
        },

        getSize: function (content) {
            this.sizetip.html(content).appendTo(this.container);
            this.width = this.sizetip.width() + 1;
            this.height = this.sizetip.height();
            this.sizetip.remove();
        },

        setContent: function (content) {
            if (!content) {
                this.tooltip.css('visibility', 'hidden');
                this.hidden = true;
                return;
            }
            this.getSize(content);
            this.tooltip.html(content)
                .css({
                    'width': this.width,
                    'height': this.height,
                    'visibility': 'visible'
                });
            if (this.hidden) {
                this.hidden = false;
                this.updatePosition();
            }
        },

        updatePosition: function (x, y) {
            if (x === undefined) {
                if (this.mousex === undefined) {
                    return;
                }
                x = this.mousex - this.offsetLeft;
                y = this.mousey - this.offsetTop;

            } else {
                this.mousex = x = x - this.offsetLeft;
                this.mousey = y = y - this.offsetTop;
            }
            if (!this.height || !this.width || this.hidden) {
                return;
            }

            y -= this.height + this.tooltipOffsetY;
            x += this.tooltipOffsetX;

            if (y < this.scrollTop) {
                y = this.scrollTop;
            }
            if (x < this.scrollLeft) {
                x = this.scrollLeft;
            } else if (x + this.width > this.scrollRight) {
                x = this.scrollRight - this.width;
            }

            this.tooltip.css({
                'left': x,
                'top': y
            });
        },

        remove: function () {
            this.tooltip.remove();
            this.sizetip.remove();
            this.sizetip = this.tooltip = undefined;
            $(window).unbind('resize.jqs scroll.jqs');
        }
    });

    pending = [];
    $.fn.sparkline = function (userValues, userOptions) {
        return this.each(function () {
            var options = new $.fn.sparkline.options(this, userOptions),
                 $this = $(this),
                 render, i;
            render = function () {
                var values, width, height, tmp, mhandler, sp, vals;
                if (userValues === 'html' || userValues === undefined) {
                    vals = this.getAttribute(options.get('tagValuesAttribute'));
                    if (vals === undefined || vals === null) {
                        vals = $this.html();
                    }
                    values = vals.replace(/(^\s*<!--)|(-->\s*$)|\s+/g, '').split(',');
                } else {
                    values = userValues;
                }

                width = options.get('width') === 'auto' ? values.length * options.get('defaultPixelsPerValue') : options.get('width');
                if (options.get('height') === 'auto') {
                    if (!options.get('composite') || !$.data(this, '_jqs_vcanvas')) {
                        // must be a better way to get the line height
                        tmp = document.createElement('span');
                        tmp.innerHTML = 'a';
                        $this.html(tmp);
                        height = $(tmp).innerHeight() || $(tmp).height();
                        $(tmp).remove();
                        tmp = null;
                    }
                } else {
                    height = options.get('height');
                }

                if (!options.get('disableInteraction')) {
                    mhandler = $.data(this, '_jqs_mhandler');
                    if (!mhandler) {
                        mhandler = new MouseHandler(this, options);
                        $.data(this, '_jqs_mhandler', mhandler);
                    } else if (!options.get('composite')) {
                        mhandler.reset();
                    }
                } else {
                    mhandler = false;
                }

                if (options.get('composite') && !$.data(this, '_jqs_vcanvas')) {
                    if (!$.data(this, '_jqs_errnotify')) {
                        alert('Attempted to attach a composite sparkline to an element with no existing sparkline');
                        $.data(this, '_jqs_errnotify', true);
                    }
                    return;
                }

                sp = new $.fn.sparkline[options.get('type')](this, values, options, width, height);

                sp.render();

                if (mhandler) {
                    mhandler.registerSparkline(sp);
                }
            };
            // jQuery 1.3.0 completely changed the meaning of :hidden :-/
            if (($(this).html() && !options.get('disableHiddenCheck') && $(this).is(':hidden')) || ($.fn.jquery < '1.3.0' && $(this).parents().is(':hidden')) || !$(this).parents('body').length) {
                if (!options.get('composite') && $.data(this, '_jqs_pending')) {
                    // remove any existing references to the element
                    for (i = pending.length; i; i--) {
                        if (pending[i - 1][0] == this) {
                            pending.splice(i - 1, 1);
                        }
                    }
                }
                pending.push([this, render]);
                $.data(this, '_jqs_pending', true);
            } else {
                render.call(this);
            }
        });
    };

    $.fn.sparkline.defaults = getDefaults();


    $.sparkline_display_visible = function () {
        var el, i, pl;
        var done = [];
        for (i = 0, pl = pending.length; i < pl; i++) {
            el = pending[i][0];
            if ($(el).is(':visible') && !$(el).parents().is(':hidden')) {
                pending[i][1].call(el);
                $.data(pending[i][0], '_jqs_pending', false);
                done.push(i);
            } else if (!$(el).closest('html').length && !$.data(el, '_jqs_pending')) {
                // element has been inserted and removed from the DOM
                // If it was not yet inserted into the dom then the .data request
                // will return true.
                // removing from the dom causes the data to be removed.
                $.data(pending[i][0], '_jqs_pending', false);
                done.push(i);
            }
        }
        for (i = done.length; i; i--) {
            pending.splice(done[i - 1], 1);
        }
    };


    /**
     * User option handler
     */
    $.fn.sparkline.options = createClass({
        init: function (tag, userOptions) {
            var extendedOptions, defaults, base, tagOptionType;
            this.userOptions = userOptions = userOptions || {};
            this.tag = tag;
            this.tagValCache = {};
            defaults = $.fn.sparkline.defaults;
            base = defaults.common;
            this.tagOptionsPrefix = userOptions.enableTagOptions && (userOptions.tagOptionsPrefix || base.tagOptionsPrefix);

            tagOptionType = this.getTagSetting('type');
            if (tagOptionType === UNSET_OPTION) {
                extendedOptions = defaults[userOptions.type || base.type];
            } else {
                extendedOptions = defaults[tagOptionType];
            }
            this.mergedOptions = $.extend({}, base, extendedOptions, userOptions);
        },


        getTagSetting: function (key) {
            var prefix = this.tagOptionsPrefix,
                val, i, pairs, keyval;
            if (prefix === false || prefix === undefined) {
                return UNSET_OPTION;
            }
            if (this.tagValCache.hasOwnProperty(key)) {
                val = this.tagValCache.key;
            } else {
                val = this.tag.getAttribute(prefix + key);
                if (val === undefined || val === null) {
                    val = UNSET_OPTION;
                } else if (val.substr(0, 1) === '[') {
                    val = val.substr(1, val.length - 2).split(',');
                    for (i = val.length; i--;) {
                        val[i] = normalizeValue(val[i].replace(/(^\s*)|(\s*$)/g, ''));
                    }
                } else if (val.substr(0, 1) === '{') {
                    pairs = val.substr(1, val.length - 2).split(',');
                    val = {};
                    for (i = pairs.length; i--;) {
                        keyval = pairs[i].split(':', 2);
                        val[keyval[0].replace(/(^\s*)|(\s*$)/g, '')] = normalizeValue(keyval[1].replace(/(^\s*)|(\s*$)/g, ''));
                    }
                } else {
                    val = normalizeValue(val);
                }
                this.tagValCache.key = val;
            }
            return val;
        },

        get: function (key, defaultval) {
            var tagOption = this.getTagSetting(key),
                result;
            if (tagOption !== UNSET_OPTION) {
                return tagOption;
            }
            return (result = this.mergedOptions[key]) === undefined ? defaultval : result;
        }
    });


    $.fn.sparkline._base = createClass({
        disabled: false,

        init: function (el, values, options, width, height) {
            this.el = el;
            this.$el = $(el);
            this.values = values;
            this.options = options;
            this.width = width;
            this.height = height;
            this.currentRegion = undefined;
        },

        /**
         * Setup the canvas
         */
        initTarget: function () {
            var interactive = !this.options.get('disableInteraction');
            if (!(this.target = this.$el.simpledraw(this.width, this.height, this.options.get('composite'), interactive))) {
                this.disabled = true;
            } else {
                this.canvasWidth = this.target.pixelWidth;
                this.canvasHeight = this.target.pixelHeight;
            }
        },

        /**
         * Actually render the chart to the canvas
         */
        render: function () {
            if (this.disabled) {
                this.el.innerHTML = '';
                return false;
            }
            return true;
        },

        /**
         * Return a region id for a given x/y co-ordinate
         */
        getRegion: function (x, y) {
        },

        /**
         * Highlight an item based on the moused-over x,y co-ordinate
         */
        setRegionHighlight: function (el, x, y) {
            var currentRegion = this.currentRegion,
                highlightEnabled = !this.options.get('disableHighlight'),
                newRegion;
            if (x > this.canvasWidth || y > this.canvasHeight || x < 0 || y < 0) {
                return null;
            }
            newRegion = this.getRegion(el, x, y);
            if (currentRegion !== newRegion) {
                if (currentRegion !== undefined && highlightEnabled) {
                    this.removeHighlight();
                }
                this.currentRegion = newRegion;
                if (newRegion !== undefined && highlightEnabled) {
                    this.renderHighlight();
                }
                return true;
            }
            return false;
        },

        /**
         * Reset any currently highlighted item
         */
        clearRegionHighlight: function () {
            if (this.currentRegion !== undefined) {
                this.removeHighlight();
                this.currentRegion = undefined;
                return true;
            }
            return false;
        },

        renderHighlight: function () {
            this.changeHighlight(true);
        },

        removeHighlight: function () {
            this.changeHighlight(false);
        },

        changeHighlight: function (highlight)  {},

        /**
         * Fetch the HTML to display as a tooltip
         */
        getCurrentRegionTooltip: function () {
            var options = this.options,
                header = '',
                entries = [],
                fields, formats, formatlen, fclass, text, i,
                showFields, showFieldsKey, newFields, fv,
                formatter, format, fieldlen, j;
            if (this.currentRegion === undefined) {
                return '';
            }
            fields = this.getCurrentRegionFields();
            formatter = options.get('tooltipFormatter');
            if (formatter) {
                return formatter(this, options, fields);
            }
            if (options.get('tooltipChartTitle')) {
                header += '<div class="jqs jqstitle">' + options.get('tooltipChartTitle') + '</div>\n';
            }
            formats = this.options.get('tooltipFormat');
            if (!formats) {
                return '';
            }
            if (!$.isArray(formats)) {
                formats = [formats];
            }
            if (!$.isArray(fields)) {
                fields = [fields];
            }
            showFields = this.options.get('tooltipFormatFieldlist');
            showFieldsKey = this.options.get('tooltipFormatFieldlistKey');
            if (showFields && showFieldsKey) {
                // user-selected ordering of fields
                newFields = [];
                for (i = fields.length; i--;) {
                    fv = fields[i][showFieldsKey];
                    if ((j = $.inArray(fv, showFields)) != -1) {
                        newFields[j] = fields[i];
                    }
                }
                fields = newFields;
            }
            formatlen = formats.length;
            fieldlen = fields.length;
            for (i = 0; i < formatlen; i++) {
                format = formats[i];
                if (typeof format === 'string') {
                    format = new SPFormat(format);
                }
                fclass = format.fclass || 'jqsfield';
                for (j = 0; j < fieldlen; j++) {
                    if (!fields[j].isNull || !options.get('tooltipSkipNull')) {
                        $.extend(fields[j], {
                            prefix: options.get('tooltipPrefix'),
                            suffix: options.get('tooltipSuffix')
                        });
                        text = format.render(fields[j], options.get('tooltipValueLookups'), options);
                        entries.push('<div class="' + fclass + '">' + text + '</div>');
                    }
                }
            }
            if (entries.length) {
                return header + entries.join('\n');
            }
            return '';
        },

        getCurrentRegionFields: function () {},

        calcHighlightColor: function (color, options) {
            var highlightColor = options.get('highlightColor'),
                lighten = options.get('highlightLighten'),
                parse, mult, rgbnew, i;
            if (highlightColor) {
                return highlightColor;
            }
            if (lighten) {
                // extract RGB values
                parse = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(color) || /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
                if (parse) {
                    rgbnew = [];
                    mult = color.length === 4 ? 16 : 1;
                    for (i = 0; i < 3; i++) {
                        rgbnew[i] = clipval(Math.round(parseInt(parse[i + 1], 16) * mult * lighten), 0, 255);
                    }
                    return 'rgb(' + rgbnew.join(',') + ')';
                }

            }
            return color;
        }

    });

    barHighlightMixin = {
        changeHighlight: function (highlight) {
            var currentRegion = this.currentRegion,
                target = this.target,
                shapeids = this.regionShapes[currentRegion],
                newShapes;
            // will be null if the region value was null
            if (shapeids) {
                newShapes = this.renderRegion(currentRegion, highlight);
                if ($.isArray(newShapes) || $.isArray(shapeids)) {
                    target.replaceWithShapes(shapeids, newShapes);
                    this.regionShapes[currentRegion] = $.map(newShapes, function (newShape) {
                        return newShape.id;
                    });
                } else {
                    target.replaceWithShape(shapeids, newShapes);
                    this.regionShapes[currentRegion] = newShapes.id;
                }
            }
        },

        render: function () {
            var values = this.values,
                target = this.target,
                regionShapes = this.regionShapes,
                shapes, ids, i, j;

            if (!this.cls._super.render.call(this)) {
                return;
            }
            for (i = values.length; i--;) {
                shapes = this.renderRegion(i);
                if (shapes) {
                    if ($.isArray(shapes)) {
                        ids = [];
                        for (j = shapes.length; j--;) {
                            shapes[j].append();
                            ids.push(shapes[j].id);
                        }
                        regionShapes[i] = ids;
                    } else {
                        shapes.append();
                        regionShapes[i] = shapes.id; // store just the shapeid
                    }
                } else {
                    // null value
                    regionShapes[i] = null;
                }
            }
            target.render();
        }
    };

    /**
     * Line charts
     */
    $.fn.sparkline.line = line = createClass($.fn.sparkline._base, {
        type: 'line',

        init: function (el, values, options, width, height) {
            line._super.init.call(this, el, values, options, width, height);
            this.vertices = [];
            this.regionMap = [];
            this.xvalues = [];
            this.yvalues = [];
            this.yminmax = [];
            this.hightlightSpotId = null;
            this.lastShapeId = null;
            this.initTarget();
        },

        getRegion: function (el, x, y) {
            var i,
                regionMap = this.regionMap; // maps regions to value positions
            for (i = regionMap.length; i--;) {
                if (regionMap[i] !== null && x >= regionMap[i][0] && x <= regionMap[i][1]) {
                    return regionMap[i][2];
                }
            }
            return undefined;
        },

        getCurrentRegionFields: function () {
            var currentRegion = this.currentRegion;
            return {
                isNull: this.yvalues[currentRegion] === null,
                x: this.xvalues[currentRegion],
                y: this.yvalues[currentRegion],
                color: this.options.get('lineColor'),
                fillColor: this.options.get('fillColor'),
                offset: currentRegion
            };
        },

        renderHighlight: function () {
            var currentRegion = this.currentRegion,
                target = this.target,
                vertex = this.vertices[currentRegion],
                options = this.options,
                spotRadius = options.get('spotRadius'),
                highlightSpotColor = options.get('highlightSpotColor'),
                highlightLineColor = options.get('highlightLineColor'),
                highlightSpot, highlightLine;

            if (!vertex) {
                return;
            }
            if (spotRadius && highlightSpotColor) {
                highlightSpot = target.drawCircle(vertex[0], vertex[1],
                    spotRadius, undefined, highlightSpotColor);
                this.highlightSpotId = highlightSpot.id;
                target.insertAfterShape(this.lastShapeId, highlightSpot);
            }
            if (highlightLineColor) {
                highlightLine = target.drawLine(vertex[0], this.canvasTop, vertex[0],
                    this.canvasTop + this.canvasHeight, highlightLineColor);
                this.highlightLineId = highlightLine.id;
                target.insertAfterShape(this.lastShapeId, highlightLine);
            }
        },

        removeHighlight: function () {
            var target = this.target;
            if (this.highlightSpotId) {
                target.removeShapeId(this.highlightSpotId);
                this.highlightSpotId = null;
            }
            if (this.highlightLineId) {
                target.removeShapeId(this.highlightLineId);
                this.highlightLineId = null;
            }
        },

        scanValues: function () {
            var values = this.values,
                valcount = values.length,
                xvalues = this.xvalues,
                yvalues = this.yvalues,
                yminmax = this.yminmax,
                i, val, isStr, isArray, sp;
            for (i = 0; i < valcount; i++) {
                val = values[i];
                isStr = typeof(values[i]) === 'string';
                isArray = typeof(values[i]) === 'object' && values[i] instanceof Array;
                sp = isStr && values[i].split(':');
                if (isStr && sp.length === 2) { // x:y
                    xvalues.push(Number(sp[0]));
                    yvalues.push(Number(sp[1]));
                    yminmax.push(Number(sp[1]));
                } else if (isArray) {
                    xvalues.push(val[0]);
                    yvalues.push(val[1]);
                    yminmax.push(val[1]);
                } else {
                    xvalues.push(i);
                    if (values[i] === null || values[i] === 'null') {
                        yvalues.push(null);
                    } else {
                        yvalues.push(Number(val));
                        yminmax.push(Number(val));
                    }
                }
            }
            if (this.options.get('xvalues')) {
                xvalues = this.options.get('xvalues');
            }

            this.maxy = this.maxyorg = Math.max.apply(Math, yminmax);
            this.miny = this.minyorg = Math.min.apply(Math, yminmax);

            this.maxx = Math.max.apply(Math, xvalues);
            this.minx = Math.min.apply(Math, xvalues);

            this.xvalues = xvalues;
            this.yvalues = yvalues;
            this.yminmax = yminmax;

        },

        processRangeOptions: function () {
            var options = this.options,
                normalRangeMin = options.get('normalRangeMin'),
                normalRangeMax = options.get('normalRangeMax');

            if (normalRangeMin !== undefined) {
                if (normalRangeMin < this.miny) {
                    this.miny = normalRangeMin;
                }
                if (normalRangeMax > this.maxy) {
                    this.maxy = normalRangeMax;
                }
            }
            if (options.get('chartRangeMin') !== undefined && (options.get('chartRangeClip') || options.get('chartRangeMin') < this.miny)) {
                this.miny = options.get('chartRangeMin');
            }
            if (options.get('chartRangeMax') !== undefined && (options.get('chartRangeClip') || options.get('chartRangeMax') > this.maxy)) {
                this.maxy = options.get('chartRangeMax');
            }
            if (options.get('chartRangeMinX') !== undefined && (options.get('chartRangeClipX') || options.get('chartRangeMinX') < this.minx)) {
                this.minx = options.get('chartRangeMinX');
            }
            if (options.get('chartRangeMaxX') !== undefined && (options.get('chartRangeClipX') || options.get('chartRangeMaxX') > this.maxx)) {
                this.maxx = options.get('chartRangeMaxX');
            }

        },

        drawNormalRange: function (canvasLeft, canvasTop, canvasHeight, canvasWidth, rangey) {
            var normalRangeMin = this.options.get('normalRangeMin'),
                normalRangeMax = this.options.get('normalRangeMax'),
                ytop = canvasTop + Math.round(canvasHeight - (canvasHeight * ((normalRangeMax - this.miny) / rangey))),
                height = Math.round((canvasHeight * (normalRangeMax - normalRangeMin)) / rangey);
            this.target.drawRect(canvasLeft, ytop, canvasWidth, height, undefined, this.options.get('normalRangeColor')).append();
        },

        render: function () {
            var options = this.options,
                target = this.target,
                canvasWidth = this.canvasWidth,
                canvasHeight = this.canvasHeight,
                vertices = this.vertices,
                spotRadius = options.get('spotRadius'),
                regionMap = this.regionMap,
                rangex, rangey, yvallast,
                canvasTop, canvasLeft,
                vertex, path, paths, x, y, xnext, xpos, xposnext,
                last, next, yvalcount, lineShapes, fillShapes, plen,
                valueSpots, color, xvalues, yvalues, i;

            if (!line._super.render.call(this)) {
                return;
            }

            this.scanValues();
            this.processRangeOptions();

            xvalues = this.xvalues;
            yvalues = this.yvalues;

            if (!this.yminmax.length || this.yvalues.length < 2) {
                // empty or all null valuess
                return;
            }

            canvasTop = canvasLeft = 0;

            rangex = this.maxx - this.minx === 0 ? 1 : this.maxx - this.minx;
            rangey = this.maxy - this.miny === 0 ? 1 : this.maxy - this.miny;
            yvallast = this.yvalues.length - 1;

            if (spotRadius && (canvasWidth < (spotRadius * 4) || canvasHeight < (spotRadius * 4))) {
                spotRadius = 0;
            }
            if (spotRadius) {
                // adjust the canvas size as required so that spots will fit
                if (options.get('minSpotColor') || (options.get('spotColor') && yvalues[yvallast] === this.miny)) {
                    canvasHeight -= Math.ceil(spotRadius);
                }
                if (options.get('maxSpotColor') || (options.get('spotColor') && yvalues[yvallast] === this.maxy)) {
                    canvasHeight -= Math.ceil(spotRadius);
                    canvasTop += Math.ceil(spotRadius);
                }
                if ((options.get('minSpotColor') || options.get('maxSpotColor')) && (yvalues[0] === this.miny || yvalues[0] === this.maxy)) {
                    canvasLeft += Math.ceil(spotRadius);
                    canvasWidth -= Math.ceil(spotRadius);
                }
                if (options.get('spotColor') ||
                    (options.get('minSpotColor') || options.get('maxSpotColor') &&
                        (yvalues[yvallast] === this.miny || yvalues[yvallast] === this.maxy))) {
                    canvasWidth -= Math.ceil(spotRadius);
                }
            }


            canvasHeight--;

            if (options.get('normalRangeMin') && !options.get('drawNormalOnTop')) {
                this.drawNormalRange(canvasLeft, canvasTop, canvasHeight, canvasWidth, rangey);
            }

            path = [];
            paths = [path];
            last = next = null;
            yvalcount = yvalues.length;
            for (i = 0; i < yvalcount; i++) {
                x = xvalues[i];
                xnext = xvalues[i + 1];
                y = yvalues[i];
                xpos = canvasLeft + Math.round((x - this.minx) * (canvasWidth / rangex));
                xposnext = i < yvalcount - 1 ? canvasLeft + Math.round((xnext - this.minx) * (canvasWidth / rangex)) : canvasWidth;
                next = xpos + ((xposnext - xpos) / 2);
                regionMap[i] = [last || 0, next, i];
                last = next;
                if (y === null) {
                    if (i) {
                        if (yvalues[i - 1] !== null) {
                            path = [];
                            paths.push(path);
                            vertices.push(null);
                        }
                    }
                } else {
                    if (y < this.miny) {
                        y = this.miny;
                    }
                    if (y > this.maxy) {
                        y = this.maxy;
                    }
                    if (!path.length) {
                        // previous value was null
                        path.push([xpos, canvasTop + canvasHeight]);
                    }
                    vertex = [xpos, canvasTop + Math.round(canvasHeight - (canvasHeight * ((y - this.miny) / rangey)))];
                    path.push(vertex);
                    vertices.push(vertex);
                }
            }

            lineShapes = [];
            fillShapes = [];
            plen = paths.length;
            for (i = 0; i < plen; i++) {
                path = paths[i];
                if (path.length) {
                    if (options.get('fillColor')) {
                        path.push([path[path.length - 1][0], (canvasTop + canvasHeight)]);
                        fillShapes.push(path.slice(0));
                        path.pop();
                    }
                    // if there's only a single point in this path, then we want to display it
                    // as a vertical line which means we keep path[0]  as is
                    if (path.length > 2) {
                        // else we want the first value
                        path[0] = [path[0][0], path[1][1]];
                    }
                    lineShapes.push(path);
                }
            }

            // draw the fill first, then optionally the normal range, then the line on top of that
            plen = fillShapes.length;
            for (i = 0; i < plen; i++) {
                target.drawShape(fillShapes[i],
                    options.get('fillColor'), options.get('fillColor')).append();
            }

            if (options.get('normalRangeMin') && options.get('drawNormalOnTop')) {
                this.drawNormalRange(canvasLeft, canvasTop, canvasHeight, canvasWidth, rangey);
            }

            plen = lineShapes.length;
            for (i = 0; i < plen; i++) {
                target.drawShape(lineShapes[i], options.get('lineColor'), undefined,
                    options.get('lineWidth')).append();
            }

            if (spotRadius && options.get('valueSpots')) {
                valueSpots = options.get('valueSpots');
                if (valueSpots.get === undefined) {
                    valueSpots = new RangeMap(valueSpots);
                }
                for (i = 0; i < yvalcount; i++) {
                    color = valueSpots.get(yvalues[i]);
                    if (color) {
                        target.drawCircle(canvasLeft + Math.round((xvalues[i] - this.minx) * (canvasWidth / rangex)),
                            canvasTop + Math.round(canvasHeight - (canvasHeight * ((yvalues[i] - this.miny) / rangey))),
                            spotRadius, undefined,
                            color).append();
                    }
                }

            }
            if (spotRadius && options.get('spotColor')) {
                target.drawCircle(canvasLeft + Math.round((xvalues[xvalues.length - 1] - this.minx) * (canvasWidth / rangex)),
                    canvasTop + Math.round(canvasHeight - (canvasHeight * ((yvalues[yvallast] - this.miny) / rangey))),
                    spotRadius, undefined,
                    options.get('spotColor')).append();
            }
            if (this.maxy !== this.minyorg) {
                if (spotRadius && options.get('minSpotColor')) {
                    x = xvalues[$.inArray(this.minyorg, yvalues)];
                    target.drawCircle(canvasLeft + Math.round((x - this.minx) * (canvasWidth / rangex)),
                        canvasTop + Math.round(canvasHeight - (canvasHeight * ((this.minyorg - this.miny) / rangey))),
                        spotRadius, undefined,
                        options.get('minSpotColor')).append();
                }
                if (spotRadius && options.get('maxSpotColor')) {
                    x = xvalues[$.inArray(this.maxyorg, yvalues)];
                    target.drawCircle(canvasLeft + Math.round((x - this.minx) * (canvasWidth / rangex)),
                        canvasTop + Math.round(canvasHeight - (canvasHeight * ((this.maxyorg - this.miny) / rangey))),
                        spotRadius, undefined,
                        options.get('maxSpotColor')).append();
                }
            }

            this.lastShapeId = target.getLastShapeId();
            this.canvasTop = canvasTop;
            target.render();
        }
    });

    /**
     * Bar charts
     */
    $.fn.sparkline.bar = bar = createClass($.fn.sparkline._base, barHighlightMixin, {
        type: 'bar',

        init: function (el, values, options, width, height) {
            var barWidth = parseInt(options.get('barWidth'), 10),
                barSpacing = parseInt(options.get('barSpacing'), 10),
                chartRangeMin = options.get('chartRangeMin'),
                chartRangeMax = options.get('chartRangeMax'),
                chartRangeClip = options.get('chartRangeClip'),
                stackMin = Infinity,
                stackMax = -Infinity,
                isStackString, groupMin, groupMax, stackRanges,
                numValues, i, vlen, range, zeroAxis, xaxisOffset, min, max, clipMin, clipMax,
                stacked, vlist, j, slen, svals, val, yoffset, yMaxCalc, canvasHeightEf;
            bar._super.init.call(this, el, values, options, width, height);

            // scan values to determine whether to stack bars
            for (i = 0, vlen = values.length; i < vlen; i++) {
                val = values[i];
                isStackString = typeof(val) === 'string' && val.indexOf(':') > -1;
                if (isStackString || $.isArray(val)) {
                    stacked = true;
                    if (isStackString) {
                        val = values[i] = normalizeValues(val.split(':'));
                    }
                    val = remove(val, null); // min/max will treat null as zero
                    groupMin = Math.min.apply(Math, val);
                    groupMax = Math.max.apply(Math, val);
                    if (groupMin < stackMin) {
                        stackMin = groupMin;
                    }
                    if (groupMax > stackMax) {
                        stackMax = groupMax;
                    }
                }
            }

            this.stacked = stacked;
            this.regionShapes = {};
            this.barWidth = barWidth;
            this.barSpacing = barSpacing;
            this.totalBarWidth = barWidth + barSpacing;
            this.width = width = (values.length * barWidth) + ((values.length - 1) * barSpacing);

            this.initTarget();

            if (chartRangeClip) {
                clipMin = chartRangeMin === undefined ? -Infinity : chartRangeMin;
                clipMax = chartRangeMax === undefined ? Infinity : chartRangeMax;
            }

            numValues = [];
            stackRanges = stacked ? [] : numValues;
            var stackTotals = [];
            var stackRangesNeg = [];
            for (i = 0, vlen = values.length; i < vlen; i++) {
                if (stacked) {
                    vlist = values[i];
                    values[i] = svals = [];
                    stackTotals[i] = 0;
                    stackRanges[i] = stackRangesNeg[i] = 0;
                    for (j = 0, slen = vlist.length; j < slen; j++) {
                        val = svals[j] = chartRangeClip ? clipval(vlist[j], clipMin, clipMax) : vlist[j];
                        if (val !== null) {
                            if (val > 0) {
                                stackTotals[i] += val;
                            }
                            if (stackMin < 0 && stackMax > 0) {
                                if (val < 0) {
                                    stackRangesNeg[i] += Math.abs(val);
                                } else {
                                    stackRanges[i] += val;
                                }
                            } else {
                                stackRanges[i] += Math.abs(val - (val < 0 ? stackMax : stackMin));
                            }
                            numValues.push(val);
                        }
                    }
                } else {
                    val = chartRangeClip ? clipval(values[i], clipMin, clipMax) : values[i];
                    val = values[i] = normalizeValue(val);
                    if (val !== null) {
                        numValues.push(val);
                    }
                }
            }
            this.max = max = Math.max.apply(Math, numValues);
            this.min = min = Math.min.apply(Math, numValues);
            this.stackMax = stackMax = stacked ? Math.max.apply(Math, stackTotals) : max;
            this.stackMin = stackMin = stacked ? Math.min.apply(Math, numValues) : min;

            if (options.get('chartRangeMin') !== undefined && (options.get('chartRangeClip') || options.get('chartRangeMin') < min)) {
                min = options.get('chartRangeMin');
            }
            if (options.get('chartRangeMax') !== undefined && (options.get('chartRangeClip') || options.get('chartRangeMax') > max)) {
                max = options.get('chartRangeMax');
            }

            this.zeroAxis = zeroAxis = options.get('zeroAxis', true);
            if (min <= 0 && max >= 0 && zeroAxis) {
                xaxisOffset = 0;
            } else if (zeroAxis == false) {
                xaxisOffset = min;
            } else if (min > 0) {
                xaxisOffset = min;
            } else {
                xaxisOffset = max;
            }
            this.xaxisOffset = xaxisOffset;

            range = stacked ? (Math.max.apply(Math, stackRanges) + Math.max.apply(Math, stackRangesNeg)) : max - min;

            // as we plot zero/min values a single pixel line, we add a pixel to all other
            // values - Reduce the effective canvas size to suit
            this.canvasHeightEf = (zeroAxis && min < 0) ? this.canvasHeight - 2 : this.canvasHeight - 1;

            if (min < xaxisOffset) {
                yMaxCalc = (stacked && max >= 0) ? stackMax : max;
                yoffset = (yMaxCalc - xaxisOffset) / range * this.canvasHeight;
                if (yoffset !== Math.ceil(yoffset)) {
                    this.canvasHeightEf -= 2;
                    yoffset = Math.ceil(yoffset);
                }
            } else {
                yoffset = this.canvasHeight;
            }
            this.yoffset = yoffset;

            if ($.isArray(options.get('colorMap'))) {
                this.colorMapByIndex = options.get('colorMap');
                this.colorMapByValue = null;
            } else {
                this.colorMapByIndex = null;
                this.colorMapByValue = options.get('colorMap');
                if (this.colorMapByValue && this.colorMapByValue.get === undefined) {
                    this.colorMapByValue = new RangeMap(this.colorMapByValue);
                }
            }

            this.range = range;
        },

        getRegion: function (el, x, y) {
            var result = Math.floor(x / this.totalBarWidth);
            return (result < 0 || result >= this.values.length) ? undefined : result;
        },

        getCurrentRegionFields: function () {
            var currentRegion = this.currentRegion,
                values = ensureArray(this.values[currentRegion]),
                result = [],
                value, i;
            for (i = values.length; i--;) {
                value = values[i];
                result.push({
                    isNull: value === null,
                    value: value,
                    color: this.calcColor(i, value, currentRegion),
                    offset: currentRegion
                });
            }
            return result;
        },

        calcColor: function (stacknum, value, valuenum) {
            var colorMapByIndex = this.colorMapByIndex,
                colorMapByValue = this.colorMapByValue,
                options = this.options,
                color, newColor;
            if (this.stacked) {
                color = options.get('stackedBarColor');
            } else {
                color = (value < 0) ? options.get('negBarColor') : options.get('barColor');
            }
            if (value === 0 && options.get('zeroColor') !== undefined) {
                color = options.get('zeroColor');
            }
            if (colorMapByValue && (newColor = colorMapByValue.get(value))) {
                color = newColor;
            } else if (colorMapByIndex && colorMapByIndex.length > valuenum) {
                color = colorMapByIndex[valuenum];
            }
            return $.isArray(color) ? color[stacknum % color.length] : color;
        },

        /**
         * Render bar(s) for a region
         */
        renderRegion: function (valuenum, highlight) {
            var vals = this.values[valuenum],
                options = this.options,
                xaxisOffset = this.xaxisOffset,
                result = [],
                range = this.range,
                stacked = this.stacked,
                target = this.target,
                x = valuenum * this.totalBarWidth,
                canvasHeightEf = this.canvasHeightEf,
                yoffset = this.yoffset,
                y, height, color, isNull, yoffsetNeg, i, valcount, val, minPlotted, allMin;

            vals = $.isArray(vals) ? vals : [vals];
            valcount = vals.length;
            val = vals[0];
            isNull = all(null, vals);
            allMin = all(xaxisOffset, vals, true);

            if (isNull) {
                if (options.get('nullColor')) {
                    color = highlight ? options.get('nullColor') : this.calcHighlightColor(options.get('nullColor'), options);
                    y = (yoffset > 0) ? yoffset - 1 : yoffset;
                    return target.drawRect(x, y, this.barWidth - 1, 0, color, color);
                } else {
                    return undefined;
                }
            }
            yoffsetNeg = yoffset;
            for (i = 0; i < valcount; i++) {
                val = vals[i];

                if (stacked && val === xaxisOffset) {
                    if (!allMin || minPlotted) {
                        continue;
                    }
                    minPlotted = true;
                }

                if (range > 0) {
                    height = Math.floor(canvasHeightEf * ((Math.abs(val - xaxisOffset) / range))) + 1;
                } else {
                    height = 1;
                }
                if (val < xaxisOffset || (val === xaxisOffset && yoffset === 0)) {
                    y = yoffsetNeg;
                    yoffsetNeg += height;
                } else {
                    y = yoffset - height;
                    yoffset -= height;
                }
                color = this.calcColor(i, val, valuenum);
                if (highlight) {
                    color = this.calcHighlightColor(color, options);
                }
                result.push(target.drawRect(x, y, this.barWidth - 1, height - 1, color, color));
            }
            if (result.length === 1) {
                return result[0];
            }
            return result;
        }
    });

    /**
     * Tristate charts
     */
    $.fn.sparkline.tristate = tristate = createClass($.fn.sparkline._base, barHighlightMixin, {
        type: 'tristate',

        init: function (el, values, options, width, height) {
            var barWidth = parseInt(options.get('barWidth'), 10),
                barSpacing = parseInt(options.get('barSpacing'), 10);
            tristate._super.init.call(this, el, values, options, width, height);

            this.regionShapes = {};
            this.barWidth = barWidth;
            this.barSpacing = barSpacing;
            this.totalBarWidth = barWidth + barSpacing;
            this.values = $.map(values, Number);
            this.width = width = (values.length * barWidth) + ((values.length - 1) * barSpacing);

            if ($.isArray(options.get('colorMap'))) {
                this.colorMapByIndex = options.get('colorMap');
                this.colorMapByValue = null;
            } else {
                this.colorMapByIndex = null;
                this.colorMapByValue = options.get('colorMap');
                if (this.colorMapByValue && this.colorMapByValue.get === undefined) {
                    this.colorMapByValue = new RangeMap(this.colorMapByValue);
                }
            }
            this.initTarget();
        },

        getRegion: function (el, x, y) {
            return Math.floor(x / this.totalBarWidth);
        },

        getCurrentRegionFields: function () {
            var currentRegion = this.currentRegion;
            return {
                isNull: this.values[currentRegion] === undefined,
                value: this.values[currentRegion],
                color: this.calcColor(this.values[currentRegion], currentRegion),
                offset: currentRegion
            };
        },

        calcColor: function (value, valuenum) {
            var values = this.values,
                options = this.options,
                colorMapByIndex = this.colorMapByIndex,
                colorMapByValue = this.colorMapByValue,
                color, newColor;

            if (colorMapByValue && (newColor = colorMapByValue.get(value))) {
                color = newColor;
            } else if (colorMapByIndex && colorMapByIndex.length > valuenum) {
                color = colorMapByIndex[valuenum];
            } else if (values[valuenum] < 0) {
                color = options.get('negBarColor');
            } else if (values[valuenum] > 0) {
                color = options.get('posBarColor');
            } else {
                color = options.get('zeroBarColor');
            }
            return color;
        },

        renderRegion: function (valuenum, highlight) {
            var values = this.values,
                options = this.options,
                target = this.target,
                canvasHeight, height, halfHeight,
                x, y, color;

            canvasHeight = target.pixelHeight;
            halfHeight = Math.round(canvasHeight / 2);

            x = valuenum * this.totalBarWidth;
            if (values[valuenum] < 0) {
                y = halfHeight;
                height = halfHeight - 1;
            } else if (values[valuenum] > 0) {
                y = 0;
                height = halfHeight - 1;
            } else {
                y = halfHeight - 1;
                height = 2;
            }
            color = this.calcColor(values[valuenum], valuenum);
            if (color === null) {
                return;
            }
            if (highlight) {
                color = this.calcHighlightColor(color, options);
            }
            return target.drawRect(x, y, this.barWidth - 1, height - 1, color, color);
        }
    });

    /**
     * Discrete charts
     */
    $.fn.sparkline.discrete = discrete = createClass($.fn.sparkline._base, barHighlightMixin, {
        type: 'discrete',

        init: function (el, values, options, width, height) {
            discrete._super.init.call(this, el, values, options, width, height);

            this.regionShapes = {};
            this.values = values = $.map(values, Number);
            this.min = Math.min.apply(Math, values);
            this.max = Math.max.apply(Math, values);
            this.range = this.max - this.min;
            this.width = width = options.get('width') === 'auto' ? values.length * 2 : this.width;
            this.interval = Math.floor(width / values.length);
            this.itemWidth = width / values.length;
            if (options.get('chartRangeMin') !== undefined && (options.get('chartRangeClip') || options.get('chartRangeMin') < this.min)) {
                this.min = options.get('chartRangeMin');
            }
            if (options.get('chartRangeMax') !== undefined && (options.get('chartRangeClip') || options.get('chartRangeMax') > this.max)) {
                this.max = options.get('chartRangeMax');
            }
            this.initTarget();
            if (this.target) {
                this.lineHeight = options.get('lineHeight') === 'auto' ? Math.round(this.canvasHeight * 0.3) : options.get('lineHeight');
            }
        },

        getRegion: function (el, x, y) {
            return Math.floor(x / this.itemWidth);
        },

        getCurrentRegionFields: function () {
            var currentRegion = this.currentRegion;
            return {
                isNull: this.values[currentRegion] === undefined,
                value: this.values[currentRegion],
                offset: currentRegion
            };
        },

        renderRegion: function (valuenum, highlight) {
            var values = this.values,
                options = this.options,
                min = this.min,
                max = this.max,
                range = this.range,
                interval = this.interval,
                target = this.target,
                canvasHeight = this.canvasHeight,
                lineHeight = this.lineHeight,
                pheight = canvasHeight - lineHeight,
                ytop, val, color, x;

            val = clipval(values[valuenum], min, max);
            x = valuenum * interval;
            ytop = Math.round(pheight - pheight * ((val - min) / range));
            color = (options.get('thresholdColor') && val < options.get('thresholdValue')) ? options.get('thresholdColor') : options.get('lineColor');
            if (highlight) {
                color = this.calcHighlightColor(color, options);
            }
            return target.drawLine(x, ytop, x, ytop + lineHeight, color);
        }
    });

    /**
     * Bullet charts
     */
    $.fn.sparkline.bullet = bullet = createClass($.fn.sparkline._base, {
        type: 'bullet',

        init: function (el, values, options, width, height) {
            var min, max;
            bullet._super.init.call(this, el, values, options, width, height);

            // values: target, performance, range1, range2, range3
            values = $.map(values, Number);
            min = Math.min.apply(Math, values);
            max = Math.max.apply(Math, values);
            if (options.get('base') === undefined) {
                min = min < 0 ? min : 0;
            } else {
                min = options.get('base');
            }
            this.min = min;
            this.max = max;
            this.range = max - min;
            this.shapes = {};
            this.valueShapes = {};
            this.regiondata = {};
            this.width = width = options.get('width') === 'auto' ? '4.0em' : width;
            this.target = this.$el.simpledraw(width, height, options.get('composite'));
            if (!values.length) {
                this.disabled = true;
            }
            this.initTarget();
        },

        getRegion: function (el, x, y) {
            var shapeid = this.target.getShapeAt(el, x, y);
            return (shapeid !== undefined && this.shapes[shapeid] !== undefined) ? this.shapes[shapeid] : undefined;
        },

        getCurrentRegionFields: function () {
            var currentRegion = this.currentRegion;
            return {
                fieldkey: currentRegion.substr(0, 1),
                value: this.values[currentRegion.substr(1)],
                region: currentRegion
            };
        },

        changeHighlight: function (highlight) {
            var currentRegion = this.currentRegion,
                shapeid = this.valueShapes[currentRegion],
                shape;
            delete this.shapes[shapeid];
            switch (currentRegion.substr(0, 1)) {
                case 'r':
                    shape = this.renderRange(currentRegion.substr(1), highlight);
                    break;
                case 'p':
                    shape = this.renderPerformance(highlight);
                    break;
                case 't':
                    shape = this.renderTarget(highlight);
                    break;
            }
            this.valueShapes[currentRegion] = shape.id;
            this.shapes[shape.id] = currentRegion;
            this.target.replaceWithShape(shapeid, shape);
        },

        renderRange: function (rn, highlight) {
            var rangeval = this.values[rn],
                rangewidth = Math.round(this.canvasWidth * ((rangeval - this.min) / this.range)),
                color = this.options.get('rangeColors')[rn - 2];
            if (highlight) {
                color = this.calcHighlightColor(color, this.options);
            }
            return this.target.drawRect(0, 0, rangewidth - 1, this.canvasHeight - 1, color, color);
        },

        renderPerformance: function (highlight) {
            var perfval = this.values[1],
                perfwidth = Math.round(this.canvasWidth * ((perfval - this.min) / this.range)),
                color = this.options.get('performanceColor');
            if (highlight) {
                color = this.calcHighlightColor(color, this.options);
            }
            return this.target.drawRect(0, Math.round(this.canvasHeight * 0.3), perfwidth - 1,
                Math.round(this.canvasHeight * 0.4) - 1, color, color);
        },

        renderTarget: function (highlight) {
            var targetval = this.values[0],
                x = Math.round(this.canvasWidth * ((targetval - this.min) / this.range) - (this.options.get('targetWidth') / 2)),
                targettop = Math.round(this.canvasHeight * 0.10),
                targetheight = this.canvasHeight - (targettop * 2),
                color = this.options.get('targetColor');
            if (highlight) {
                color = this.calcHighlightColor(color, this.options);
            }
            return this.target.drawRect(x, targettop, this.options.get('targetWidth') - 1, targetheight - 1, color, color);
        },

        render: function () {
            var vlen = this.values.length,
                target = this.target,
                i, shape;
            if (!bullet._super.render.call(this)) {
                return;
            }
            for (i = 2; i < vlen; i++) {
                shape = this.renderRange(i).append();
                this.shapes[shape.id] = 'r' + i;
                this.valueShapes['r' + i] = shape.id;
            }
            shape = this.renderPerformance().append();
            this.shapes[shape.id] = 'p1';
            this.valueShapes.p1 = shape.id;
            shape = this.renderTarget().append();
            this.shapes[shape.id] = 't0';
            this.valueShapes.t0 = shape.id;
            target.render();
        }
    });

    /**
     * Pie charts
     */
    $.fn.sparkline.pie = pie = createClass($.fn.sparkline._base, {
        type: 'pie',

        init: function (el, values, options, width, height) {
            var total = 0, i;

            pie._super.init.call(this, el, values, options, width, height);

            this.shapes = {}; // map shape ids to value offsets
            this.valueShapes = {}; // maps value offsets to shape ids
            this.values = values = $.map(values, Number);

            if (options.get('width') === 'auto') {
                this.width = this.height;
            }

            if (values.length > 0) {
                for (i = values.length; i--;) {
                    total += values[i];
                }
            }
            this.total = total;
            this.initTarget();
            this.radius = Math.floor(Math.min(this.canvasWidth, this.canvasHeight) / 2);
        },

        getRegion: function (el, x, y) {
            var shapeid = this.target.getShapeAt(el, x, y);
            return (shapeid !== undefined && this.shapes[shapeid] !== undefined) ? this.shapes[shapeid] : undefined;
        },

        getCurrentRegionFields: function () {
            var currentRegion = this.currentRegion;
            return {
                isNull: this.values[currentRegion] === undefined,
                value: this.values[currentRegion],
                percent: this.values[currentRegion] / this.total * 100,
                color: this.options.get('sliceColors')[currentRegion % this.options.get('sliceColors').length],
                offset: currentRegion
            };
        },

        changeHighlight: function (highlight) {
            var currentRegion = this.currentRegion,
                 newslice = this.renderSlice(currentRegion, highlight),
                 shapeid = this.valueShapes[currentRegion];
            delete this.shapes[shapeid];
            this.target.replaceWithShape(shapeid, newslice);
            this.valueShapes[currentRegion] = newslice.id;
            this.shapes[newslice.id] = currentRegion;
        },

        renderSlice: function (valuenum, highlight) {
            var target = this.target,
                options = this.options,
                radius = this.radius,
                borderWidth = options.get('borderWidth'),
                offset = options.get('offset'),
                circle = 2 * Math.PI,
                values = this.values,
                total = this.total,
                next = offset ? (2*Math.PI)*(offset/360) : 0,
                start, end, i, vlen, color;

            vlen = values.length;
            for (i = 0; i < vlen; i++) {
                start = next;
                end = next;
                if (total > 0) {  // avoid divide by zero
                    end = next + (circle * (values[i] / total));
                }
                if (valuenum === i) {
                    color = options.get('sliceColors')[i % options.get('sliceColors').length];
                    if (highlight) {
                        color = this.calcHighlightColor(color, options);
                    }

                    return target.drawPieSlice(radius, radius, radius - borderWidth, start, end, undefined, color);
                }
                next = end;
            }
        },

        render: function () {
            var target = this.target,
                values = this.values,
                options = this.options,
                radius = this.radius,
                borderWidth = options.get('borderWidth'),
                shape, i;

            if (!pie._super.render.call(this)) {
                return;
            }
            if (borderWidth) {
                target.drawCircle(radius, radius, Math.floor(radius - (borderWidth / 2)),
                    options.get('borderColor'), undefined, borderWidth).append();
            }
            for (i = values.length; i--;) {
                shape = this.renderSlice(i).append();
                this.valueShapes[i] = shape.id; // store just the shapeid
                this.shapes[shape.id] = i;
            }
            target.render();
        }
    });

    /**
     * Box plots
     */
    $.fn.sparkline.box = box = createClass($.fn.sparkline._base, {
        type: 'box',

        init: function (el, values, options, width, height) {
            box._super.init.call(this, el, values, options, width, height);
            this.values = $.map(values, Number);
            this.width = options.get('width') === 'auto' ? '4.0em' : width;
            this.initTarget();
            if (!this.values.length) {
                this.disabled = 1;
            }
        },

        /**
         * Simulate a single region
         */
        getRegion: function () {
            return 1;
        },

        getCurrentRegionFields: function () {
            var result = [
                { field: 'lq', value: this.quartiles[0] },
                { field: 'med', value: this.quartiles[1] },
                { field: 'uq', value: this.quartiles[2] },
                { field: 'lo', value: this.loutlier },
                { field: 'ro', value: this.routlier }
            ];
            if (this.lwhisker !== undefined) {
                result.push({ field: 'lw', value: this.lwhisker});
            }
            if (this.rwhisker !== undefined) {
                result.push({ field: 'rw', value: this.rwhisker});
            }
            return result;
        },

        render: function () {
            var target = this.target,
                values = this.values,
                vlen = values.length,
                options = this.options,
                canvasWidth = this.canvasWidth,
                canvasHeight = this.canvasHeight,
                minValue = options.get('chartRangeMin') === undefined ? Math.min.apply(Math, values) : options.get('chartRangeMin'),
                maxValue = options.get('chartRangeMax') === undefined ? Math.max.apply(Math, values) : options.get('chartRangeMax'),
                canvasLeft = 0,
                lwhisker, loutlier, iqr, q1, q2, q3, rwhisker, routlier, i,
                size, unitSize;

            if (!box._super.render.call(this)) {
                return;
            }

            if (options.get('raw')) {
                if (options.get('showOutliers') && values.length > 5) {
                    loutlier = values[0];
                    lwhisker = values[1];
                    q1 = values[2];
                    q2 = values[3];
                    q3 = values[4];
                    rwhisker = values[5];
                    routlier = values[6];
                } else {
                    lwhisker = values[0];
                    q1 = values[1];
                    q2 = values[2];
                    q3 = values[3];
                    rwhisker = values[4];
                }
            } else {
                values.sort(function (a, b) { return a - b; });
                q1 = quartile(values, 1);
                q2 = quartile(values, 2);
                q3 = quartile(values, 3);
                iqr = q3 - q1;
                if (options.get('showOutliers')) {
                    lwhisker = rwhisker = undefined;
                    for (i = 0; i < vlen; i++) {
                        if (lwhisker === undefined && values[i] > q1 - (iqr * options.get('outlierIQR'))) {
                            lwhisker = values[i];
                        }
                        if (values[i] < q3 + (iqr * options.get('outlierIQR'))) {
                            rwhisker = values[i];
                        }
                    }
                    loutlier = values[0];
                    routlier = values[vlen - 1];
                } else {
                    lwhisker = values[0];
                    rwhisker = values[vlen - 1];
                }
            }
            this.quartiles = [q1, q2, q3];
            this.lwhisker = lwhisker;
            this.rwhisker = rwhisker;
            this.loutlier = loutlier;
            this.routlier = routlier;

            unitSize = canvasWidth / (maxValue - minValue + 1);
            if (options.get('showOutliers')) {
                canvasLeft = Math.ceil(options.get('spotRadius'));
                canvasWidth -= 2 * Math.ceil(options.get('spotRadius'));
                unitSize = canvasWidth / (maxValue - minValue + 1);
                if (loutlier < lwhisker) {
                    target.drawCircle((loutlier - minValue) * unitSize + canvasLeft,
                        canvasHeight / 2,
                        options.get('spotRadius'),
                        options.get('outlierLineColor'),
                        options.get('outlierFillColor')).append();
                }
                if (routlier > rwhisker) {
                    target.drawCircle((routlier - minValue) * unitSize + canvasLeft,
                        canvasHeight / 2,
                        options.get('spotRadius'),
                        options.get('outlierLineColor'),
                        options.get('outlierFillColor')).append();
                }
            }

            // box
            target.drawRect(
                Math.round((q1 - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight * 0.1),
                Math.round((q3 - q1) * unitSize),
                Math.round(canvasHeight * 0.8),
                options.get('boxLineColor'),
                options.get('boxFillColor')).append();
            // left whisker
            target.drawLine(
                Math.round((lwhisker - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight / 2),
                Math.round((q1 - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight / 2),
                options.get('lineColor')).append();
            target.drawLine(
                Math.round((lwhisker - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight / 4),
                Math.round((lwhisker - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight - canvasHeight / 4),
                options.get('whiskerColor')).append();
            // right whisker
            target.drawLine(Math.round((rwhisker - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight / 2),
                Math.round((q3 - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight / 2),
                options.get('lineColor')).append();
            target.drawLine(
                Math.round((rwhisker - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight / 4),
                Math.round((rwhisker - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight - canvasHeight / 4),
                options.get('whiskerColor')).append();
            // median line
            target.drawLine(
                Math.round((q2 - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight * 0.1),
                Math.round((q2 - minValue) * unitSize + canvasLeft),
                Math.round(canvasHeight * 0.9),
                options.get('medianColor')).append();
            if (options.get('target')) {
                size = Math.ceil(options.get('spotRadius'));
                target.drawLine(
                    Math.round((options.get('target') - minValue) * unitSize + canvasLeft),
                    Math.round((canvasHeight / 2) - size),
                    Math.round((options.get('target') - minValue) * unitSize + canvasLeft),
                    Math.round((canvasHeight / 2) + size),
                    options.get('targetColor')).append();
                target.drawLine(
                    Math.round((options.get('target') - minValue) * unitSize + canvasLeft - size),
                    Math.round(canvasHeight / 2),
                    Math.round((options.get('target') - minValue) * unitSize + canvasLeft + size),
                    Math.round(canvasHeight / 2),
                    options.get('targetColor')).append();
            }
            target.render();
        }
    });

    // Setup a very simple "virtual canvas" to make drawing the few shapes we need easier
    // This is accessible as $(foo).simpledraw()

    if ($.browser.msie && !document.namespaces.v) {
        document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
    }

    if ($.browser.hasCanvas === undefined) {
        $.browser.hasCanvas = document.createElement('canvas').getContext !== undefined;
    }

    VShape = createClass({
        init: function (target, id, type, args) {
            this.target = target;
            this.id = id;
            this.type = type;
            this.args = args;
        },
        append: function () {
            this.target.appendShape(this);
            return this;
        }
    });

    VCanvas_base = createClass({
        _pxregex: /(\d+)(px)?\s*$/i,

        init: function (width, height, target) {
            if (!width) {
                return;
            }
            this.width = width;
            this.height = height;
            this.target = target;
            this.lastShapeId = null;
            if (target[0]) {
                target = target[0];
            }
            $.data(target, '_jqs_vcanvas', this);
        },

        drawLine: function (x1, y1, x2, y2, lineColor, lineWidth) {
            return this.drawShape([[x1, y1], [x2, y2]], lineColor, lineWidth);
        },

        drawShape: function (path, lineColor, fillColor, lineWidth) {
            return this._genShape('Shape', [path, lineColor, fillColor, lineWidth]);
        },

        drawCircle: function (x, y, radius, lineColor, fillColor, lineWidth) {
            return this._genShape('Circle', [x, y, radius, lineColor, fillColor, lineWidth]);
        },

        drawPieSlice: function (x, y, radius, startAngle, endAngle, lineColor, fillColor) {
            return this._genShape('PieSlice', [x, y, radius, startAngle, endAngle, lineColor, fillColor]);
        },

        drawRect: function (x, y, width, height, lineColor, fillColor) {
            return this._genShape('Rect', [x, y, width, height, lineColor, fillColor]);
        },

        getElement: function () {
            return this.canvas;
        },

        /**
         * Return the most recently inserted shape id
         */
        getLastShapeId: function () {
            return this.lastShapeId;
        },

        /**
         * Clear and reset the canvas
         */
        reset: function () {
            alert('reset not implemented');
        },

        _insert: function (el, target) {
            $(target).html(el);
        },

        /**
         * Calculate the pixel dimensions of the canvas
         */
        _calculatePixelDims: function (width, height, canvas) {
            // XXX This should probably be a configurable option
            var match;
            match = this._pxregex.exec(height);
            if (match) {
                this.pixelHeight = match[1];
            } else {
                this.pixelHeight = $(canvas).height();
            }
            match = this._pxregex.exec(width);
            if (match) {
                this.pixelWidth = match[1];
            } else {
                this.pixelWidth = $(canvas).width();
            }
        },

        /**
         * Generate a shape object and id for later rendering
         */
        _genShape: function (shapetype, shapeargs) {
            var id = shapeCount++;
            shapeargs.unshift(id);
            return new VShape(this, id, shapetype, shapeargs);
        },

        /**
         * Add a shape to the end of the render queue
         */
        appendShape: function (shape) {
            alert('appendShape not implemented');
        },

        /**
         * Replace one shape with another
         */
        replaceWithShape: function (shapeid, shape) {
            alert('replaceWithShape not implemented');
        },

        /**
         * Insert one shape after another in the render queue
         */
        insertAfterShape: function (shapeid, shape) {
            alert('insertAfterShape not implemented');
        },

        /**
         * Remove a shape from the queue
         */
        removeShapeId: function (shapeid) {
            alert('removeShapeId not implemented');
        },

        /**
         * Find a shape at the specified x/y co-ordinates
         */
        getShapeAt: function (el, x, y) {
            alert('getShapeAt not implemented');
        },

        /**
         * Render all queued shapes onto the canvas
         */
        render: function () {
            alert('render not implemented');
        }
    });

    VCanvas_canvas = createClass(VCanvas_base, {
        init: function (width, height, target, interact) {
            VCanvas_canvas._super.init.call(this, width, height, target);
            this.canvas = document.createElement('canvas');
            if (target[0]) {
                target = target[0];
            }
            $.data(target, '_jqs_vcanvas', this);
            $(this.canvas).css({ display: 'inline-block', width: width, height: height, verticalAlign: 'top' });
            this._insert(this.canvas, target);
            this._calculatePixelDims(width, height, this.canvas);
            this.canvas.width = this.pixelWidth;
            this.canvas.height = this.pixelHeight;
            this.interact = interact;
            this.shapes = {};
            this.shapeseq = [];
            this.currentTargetShapeId = undefined;
            $(this.canvas).css({width: this.pixelWidth, height: this.pixelHeight});
        },

        _getContext: function (lineColor, fillColor, lineWidth) {
            var context = this.canvas.getContext('2d');
            if (lineColor !== undefined) {
                context.strokeStyle = lineColor;
            }
            context.lineWidth = lineWidth === undefined ? 1 : lineWidth;
            if (fillColor !== undefined) {
                context.fillStyle = fillColor;
            }
            return context;
        },

        reset: function () {
            var context = this._getContext();
            context.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
            this.shapes = {};
            this.shapeseq = [];
            this.currentTargetShapeId = undefined;
        },

        _drawShape: function (shapeid, path, lineColor, fillColor, lineWidth) {
            var context = this._getContext(lineColor, fillColor, lineWidth),
                i, plen;
            context.beginPath();
            context.moveTo(path[0][0] + 0.5, path[0][1] + 0.5);
            for (i = 1, plen = path.length; i < plen; i++) {
                context.lineTo(path[i][0] + 0.5, path[i][1] + 0.5); // the 0.5 offset gives us crisp pixel-width lines
            }
            if (lineColor !== undefined) {
                context.stroke();
            }
            if (fillColor !== undefined) {
                context.fill();
            }
            if (this.targetX !== undefined && this.targetY !== undefined &&
                context.isPointInPath(this.targetX, this.targetY)) {
                this.currentTargetShapeId = shapeid;
            }
        },

        _drawCircle: function (shapeid, x, y, radius, lineColor, fillColor, lineWidth) {
            var context = this._getContext(lineColor, fillColor, lineWidth);
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI, false);
            if (this.targetX !== undefined && this.targetY !== undefined &&
                context.isPointInPath(this.targetX, this.targetY)) {
                this.currentTargetShapeId = shapeid;
            }
            if (lineColor !== undefined) {
                context.stroke();
            }
            if (fillColor !== undefined) {
                context.fill();
            }
        },

        _drawPieSlice: function (shapeid, x, y, radius, startAngle, endAngle, lineColor, fillColor) {
            var context = this._getContext(lineColor, fillColor);
            context.beginPath();
            context.moveTo(x, y);
            context.arc(x, y, radius, startAngle, endAngle, false);
            context.lineTo(x, y);
            context.closePath();
            if (lineColor !== undefined) {
                context.stroke();
            }
            if (fillColor) {
                context.fill();
            }
            if (this.targetX !== undefined && this.targetY !== undefined &&
                context.isPointInPath(this.targetX, this.targetY)) {
                this.currentTargetShapeId = shapeid;
            }
        },

        _drawRect: function (shapeid, x, y, width, height, lineColor, fillColor) {
            return this._drawShape(shapeid, [[x, y], [x + width, y], [x + width, y + height], [x, y + height], [x, y]], lineColor, fillColor);
        },

        appendShape: function (shape) {
            this.shapes[shape.id] = shape;
            this.shapeseq.push(shape.id);
            this.lastShapeId = shape.id;
            return shape.id;
        },

        replaceWithShape: function (shapeid, shape) {
            var shapeseq = this.shapeseq,
                i;
            this.shapes[shape.id] = shape;
            for (i = shapeseq.length; i--;) {
                if (shapeseq[i] == shapeid) {
                    shapeseq[i] = shape.id;
                }
            }
            delete this.shapes[shapeid];
        },

        replaceWithShapes: function (shapeids, shapes) {
            var shapeseq = this.shapeseq,
                shapemap = {},
                sid, i, first;

            for (i = shapeids.length; i--;) {
                shapemap[shapeids[i]] = true;
            }
            for (i = shapeseq.length; i--;) {
                sid = shapeseq[i];
                if (shapemap[sid]) {
                    shapeseq.splice(i, 1);
                    delete this.shapes[sid];
                    first = i;
                }
            }
            for (i = shapes.length; i--;) {
                shapeseq.splice(first, 0, shapes[i].id);
                this.shapes[shapes[i].id] = shapes[i];
            }

        },

        insertAfterShape: function (shapeid, shape) {
            var shapeseq = this.shapeseq,
                i;
            for (i = shapeseq.length; i--;) {
                if (shapeseq[i] === shapeid) {
                    shapeseq.splice(i + 1, 0, shape.id);
                    this.shapes[shape.id] = shape;
                    return;
                }
            }
        },

        removeShapeId: function (shapeid) {
            var shapeseq = this.shapeseq,
                i;
            for (i = shapeseq.length; i--;) {
                if (shapeseq[i] === shapeid) {
                    shapeseq.splice(i, 1);
                    break;
                }
            }
            delete this.shapes[shapeid];
        },

        getShapeAt: function (el, x, y) {
            this.targetX = x;
            this.targetY = y;
            this.render();
            return this.currentTargetShapeId;
        },

        render: function () {
            var shapeseq = this.shapeseq,
                shapes = this.shapes,
                shapeCount = shapeseq.length,
                context = this._getContext(),
                shapeid, shape, i;
            context.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
            for (i = 0; i < shapeCount; i++) {
                shapeid = shapeseq[i];
                shape = shapes[shapeid];
                this['_draw' + shape.type].apply(this, shape.args);
            }
            if (!this.interact) {
                // not interactive so no need to keep the shapes array
                this.shapes = {};
                this.shapeseq = [];
            }
        }

    });

    VCanvas_vml = createClass(VCanvas_base, {
        init: function (width, height, target) {
            var groupel;
            VCanvas_vml._super.init.call(this, width, height, target);
            if (target[0]) {
                target = target[0];
            }
            $.data(target, '_jqs_vcanvas', this);
            this.canvas = document.createElement('span');
            $(this.canvas).css({ display: 'inline-block', position: 'relative', overflow: 'hidden', width: width, height: height, margin: '0px', padding: '0px', verticalAlign: 'top'});
            this._insert(this.canvas, target);
            this._calculatePixelDims(width, height, this.canvas);
            this.canvas.width = this.pixelWidth;
            this.canvas.height = this.pixelHeight;
            groupel = '<v:group coordorigin="0 0" coordsize="' + this.pixelWidth + ' ' + this.pixelHeight + '"' +
                    ' style="position:absolute;top:0;left:0;width:' + this.pixelWidth + 'px;height=' + this.pixelHeight + 'px;"></v:group>';
            this.canvas.insertAdjacentHTML('beforeEnd', groupel);
            this.group = $(this.canvas).children()[0];
            this.rendered = false;
            this.prerender = '';
        },

        _drawShape: function (shapeid, path, lineColor, fillColor, lineWidth) {
            var vpath = [],
                initial, stroke, fill, closed, vel, plen, i;
            for (i = 0, plen = path.length; i < plen; i++) {
                vpath[i] = '' + (path[i][0]) + ',' + (path[i][1]);
            }
            initial = vpath.splice(0, 1);
            lineWidth = lineWidth === undefined ? 1 : lineWidth;
            stroke = lineColor === undefined ? ' stroked="false" ' : ' strokeWeight="' + lineWidth + 'px" strokeColor="' + lineColor + '" ';
            fill = fillColor === undefined ? ' filled="false"' : ' fillColor="' + fillColor + '" filled="true" ';
            closed = vpath[0] === vpath[vpath.length - 1] ? 'x ' : '';
            vel = '<v:shape coordorigin="0 0" coordsize="' + this.pixelWidth + ' ' + this.pixelHeight + '" ' +
                 ' id="jqsshape' + shapeid + '" ' +
                 stroke +
                 fill +
                ' style="position:absolute;left:0px;top:0px;height:' + this.pixelHeight + 'px;width:' + this.pixelWidth + 'px;padding:0px;margin:0px;" ' +
                ' path="m ' + initial + ' l ' + vpath.join(', ') + ' ' + closed + 'e">' +
                ' </v:shape>';
            return vel;
        },

        _drawCircle: function (shapeid, x, y, radius, lineColor, fillColor, lineWidth) {
            var stroke, fill, vel;
            x -= radius;
            y -= radius;
            stroke = lineColor === undefined ? ' stroked="false" ' : ' strokeWeight="' + lineWidth + 'px" strokeColor="' + lineColor + '" ';
            fill = fillColor === undefined ? ' filled="false"' : ' fillColor="' + fillColor + '" filled="true" ';
            vel = '<v:oval ' +
                 ' id="jqsshape' + shapeid + '" ' +
                stroke +
                fill +
                ' style="position:absolute;top:' + y + 'px; left:' + x + 'px; width:' + (radius * 2) + 'px; height:' + (radius * 2) + 'px"></v:oval>';
            return vel;

        },

        _drawPieSlice: function (shapeid, x, y, radius, startAngle, endAngle, lineColor, fillColor) {
            var vpath, startx, starty, endx, endy, stroke, fill, vel;
            if (startAngle === endAngle) {
                return;  // VML seems to have problem when start angle equals end angle.
            }
            if ((endAngle - startAngle) === (2 * Math.PI)) {
                startAngle = 0.0;  // VML seems to have a problem when drawing a full circle that doesn't start 0
                endAngle = (2 * Math.PI);
            }

            startx = x + Math.round(Math.cos(startAngle) * radius);
            starty = y + Math.round(Math.sin(startAngle) * radius);
            endx = x + Math.round(Math.cos(endAngle) * radius);
            endy = y + Math.round(Math.sin(endAngle) * radius);

            // Prevent very small slices from being mistaken as a whole pie
            if (startx === endx && starty === endy && (endAngle - startAngle) < Math.PI) {
                return;
            }

            vpath = [x - radius, y - radius, x + radius, y + radius, startx, starty, endx, endy];
            stroke = lineColor === undefined ? ' stroked="false" ' : ' strokeWeight="1px" strokeColor="' + lineColor + '" ';
            fill = fillColor === undefined ? ' filled="false"' : ' fillColor="' + fillColor + '" filled="true" ';
            vel = '<v:shape coordorigin="0 0" coordsize="' + this.pixelWidth + ' ' + this.pixelHeight + '" ' +
                 ' id="jqsshape' + shapeid + '" ' +
                 stroke +
                 fill +
                ' style="position:absolute;left:0px;top:0px;height:' + this.pixelHeight + 'px;width:' + this.pixelWidth + 'px;padding:0px;margin:0px;" ' +
                ' path="m ' + x + ',' + y + ' wa ' + vpath.join(', ') + ' x e">' +
                ' </v:shape>';
            return vel;
        },

        _drawRect: function (shapeid, x, y, width, height, lineColor, fillColor) {
            return this._drawShape(shapeid, [[x, y], [x, y + height], [x + width, y + height], [x + width, y], [x, y]], lineColor, fillColor);
        },

        reset: function () {
            this.group.innerHTML = '';
        },

        appendShape: function (shape) {
            var vel = this['_draw' + shape.type].apply(this, shape.args);
            if (this.rendered) {
                this.group.insertAdjacentHTML('beforeEnd', vel);
            } else {
                this.prerender += vel;
            }
            this.lastShapeId = shape.id;
            return shape.id;
        },

        replaceWithShape: function (shapeid, shape) {
            var existing = $('#jqsshape' + shapeid),
                vel = this['_draw' + shape.type].apply(this, shape.args);
            existing[0].outerHTML = vel;
        },

        replaceWithShapes: function (shapeids, shapes) {
            // replace the first shapeid with all the new shapes then toast the remaining old shapes
            var existing = $('#jqsshape' + shapeids[0]),
                replace = '',
                slen = shapes.length,
                i;
            for (i = 0; i < slen; i++) {
                replace += this['_draw' + shapes[i].type].apply(this, shapes[i].args);
            }
            existing[0].outerHTML = replace;
            for (i = 1; i < shapeids.length; i++) {
                $('#jqsshape' + shapeids[i]).remove();
            }
        },

        insertAfterShape: function (shapeid, shape) {
            var existing = $('#jqsshape' + shapeid),
                 vel = this['_draw' + shape.type].apply(this, shape.args);
            existing[0].insertAdjacentHTML('afterEnd', vel);
        },

        removeShapeId: function (shapeid) {
            var existing = $('#jqsshape' + shapeid);
            this.group.removeChild(existing[0]);
        },

        getShapeAt: function (el, x, y) {
            var shapeid = el.id.substr(8);
            return shapeid;
        },

        render: function () {
            if (!this.rendered) {
                // batch the intial render into a single repaint
                this.group.innerHTML = this.prerender;
                this.rendered = true;
            }
        }
    });


})(jQuery);

;
/* http://keith-wood.name/timeEntry.html
   Time entry for jQuery v1.4.9.
   Written by Keith Wood (kbwood{at}iinet.com.au) June 2007.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */
(function($){function TimeEntry(){this._disabledInputs=[];this.regional=[];this.regional['']={show24Hours:false,separator:':',ampmPrefix:'',ampmNames:['AM','PM'],spinnerTexts:['Now','Previous field','Next field','Increment','Decrement']};this._defaults={appendText:'',showSeconds:false,timeSteps:[1,1,1],initialField:0,useMouseWheel:true,defaultTime:null,minTime:null,maxTime:null,spinnerImage:'spinnerDefault.png',spinnerSize:[20,20,8],spinnerBigImage:'',spinnerBigSize:[40,40,16],spinnerIncDecOnly:false,spinnerRepeat:[500,250],beforeShow:null,beforeSetTime:null};$.extend(this._defaults,this.regional[''])}var m='timeEntry';$.extend(TimeEntry.prototype,{markerClassName:'hasTimeEntry',setDefaults:function(a){extendRemove(this._defaults,a||{});return this},_connectTimeEntry:function(b,c){var d=$(b);if(d.hasClass(this.markerClassName)){return}var e={};e.options=$.extend({},c);e._selectedHour=0;e._selectedMinute=0;e._selectedSecond=0;e._field=0;e.input=$(b);$.data(b,m,e);var f=this._get(e,'spinnerImage');var g=this._get(e,'spinnerText');var h=this._get(e,'spinnerSize');var i=this._get(e,'appendText');var j=(!f?null:$('<span class="timeEntry_control" style="display: inline-block; '+'background: url(\''+f+'\') 0 0 no-repeat; '+'width: '+h[0]+'px; height: '+h[1]+'px;'+($.browser.mozilla&&$.browser.version<'1.9'?' padding-left: '+h[0]+'px; padding-bottom: '+(h[1]-18)+'px;':'')+'"></span>'));d.wrap('<span class="timeEntry_wrap"></span>').after(i?'<span class="timeEntry_append">'+i+'</span>':'').after(j||'');d.addClass(this.markerClassName).bind('focus.timeEntry',this._doFocus).bind('blur.timeEntry',this._doBlur).bind('click.timeEntry',this._doClick).bind('keydown.timeEntry',this._doKeyDown).bind('keypress.timeEntry',this._doKeyPress);if($.browser.mozilla){d.bind('input.timeEntry',function(a){$.timeEntry._parseTime(e)})}if($.browser.msie){d.bind('paste.timeEntry',function(a){setTimeout(function(){$.timeEntry._parseTime(e)},1)})}if(this._get(e,'useMouseWheel')&&$.fn.mousewheel){d.mousewheel(this._doMouseWheel)}if(j){j.mousedown(this._handleSpinner).mouseup(this._endSpinner).mouseover(this._expandSpinner).mouseout(this._endSpinner).mousemove(this._describeSpinner)}},_enableTimeEntry:function(a){this._enableDisable(a,false)},_disableTimeEntry:function(a){this._enableDisable(a,true)},_enableDisable:function(b,c){var d=$.data(b,m);if(!d){return}b.disabled=c;if(b.nextSibling&&b.nextSibling.nodeName.toLowerCase()=='span'){$.timeEntry._changeSpinner(d,b.nextSibling,(c?5:-1))}$.timeEntry._disabledInputs=$.map($.timeEntry._disabledInputs,function(a){return(a==b?null:a)});if(c){$.timeEntry._disabledInputs.push(b)}},_isDisabledTimeEntry:function(a){return $.inArray(a,this._disabledInputs)>-1},_changeTimeEntry:function(a,b,c){var d=$.data(a,m);if(d){if(typeof b=='string'){var e=b;b={};b[e]=c}var f=this._extractTime(d);extendRemove(d.options,b||{});if(f){this._setTime(d,new Date(0,0,0,f[0],f[1],f[2]))}}$.data(a,m,d)},_destroyTimeEntry:function(b){$input=$(b);if(!$input.hasClass(this.markerClassName)){return}$input.removeClass(this.markerClassName).unbind('.timeEntry');if($.fn.mousewheel){$input.unmousewheel()}this._disabledInputs=$.map(this._disabledInputs,function(a){return(a==b?null:a)});$input.parent().replaceWith($input);$.removeData(b,m)},_setTimeTimeEntry:function(a,b){var c=$.data(a,m);if(c){if(b===null||b===''){c.input.val('')}else{this._setTime(c,b?(typeof b=='object'?new Date(b.getTime()):b):null)}}},_getTimeTimeEntry:function(a){var b=$.data(a,m);var c=(b?this._extractTime(b):null);return(!c?null:new Date(0,0,0,c[0],c[1],c[2]))},_getOffsetTimeEntry:function(a){var b=$.data(a,m);var c=(b?this._extractTime(b):null);return(!c?0:(c[0]*3600+c[1]*60+c[2])*1000)},_doFocus:function(a){var b=(a.nodeName&&a.nodeName.toLowerCase()=='input'?a:this);if($.timeEntry._lastInput==b||$.timeEntry._isDisabledTimeEntry(b)){$.timeEntry._focussed=false;return}var c=$.data(b,m);$.timeEntry._focussed=true;$.timeEntry._lastInput=b;$.timeEntry._blurredInput=null;var d=$.timeEntry._get(c,'beforeShow');extendRemove(c.options,(d?d.apply(b,[b]):{}));$.data(b,m,c);$.timeEntry._parseTime(c);setTimeout(function(){$.timeEntry._showField(c)},10)},_doBlur:function(a){$.timeEntry._blurredInput=$.timeEntry._lastInput;$.timeEntry._lastInput=null},_doClick:function(b){var c=b.target;var d=$.data(c,m);if(!$.timeEntry._focussed){var e=$.timeEntry._get(d,'separator').length+2;d._field=0;if(c.selectionStart!=null){for(var f=0;f<=Math.max(1,d._secondField,d._ampmField);f++){var g=(f!=d._ampmField?(f*e)+2:(d._ampmField*e)+$.timeEntry._get(d,'ampmPrefix').length+$.timeEntry._get(d,'ampmNames')[0].length);d._field=f;if(c.selectionStart<g){break}}}else if(c.createTextRange){var h=$(b.srcElement);var i=c.createTextRange();var j=function(a){return{thin:2,medium:4,thick:6}[a]||a};var k=b.clientX+document.documentElement.scrollLeft-(h.offset().left+parseInt(j(h.css('border-left-width')),10))-i.offsetLeft;for(var f=0;f<=Math.max(1,d._secondField,d._ampmField);f++){var g=(f!=d._ampmField?(f*e)+2:(d._ampmField*e)+$.timeEntry._get(d,'ampmPrefix').length+$.timeEntry._get(d,'ampmNames')[0].length);i.collapse();i.moveEnd('character',g);d._field=f;if(k<i.boundingWidth){break}}}}$.data(c,m,d);$.timeEntry._showField(d);$.timeEntry._focussed=false},_doKeyDown:function(a){if(a.keyCode>=48){return true}var b=$.data(a.target,m);switch(a.keyCode){case 9:return(a.shiftKey?$.timeEntry._changeField(b,-1,true):$.timeEntry._changeField(b,+1,true));case 35:if(a.ctrlKey){$.timeEntry._setValue(b,'')}else{b._field=Math.max(1,b._secondField,b._ampmField);$.timeEntry._adjustField(b,0)}break;case 36:if(a.ctrlKey){$.timeEntry._setTime(b)}else{b._field=0;$.timeEntry._adjustField(b,0)}break;case 37:$.timeEntry._changeField(b,-1,false);break;case 38:$.timeEntry._adjustField(b,+1);break;case 39:$.timeEntry._changeField(b,+1,false);break;case 40:$.timeEntry._adjustField(b,-1);break;case 46:$.timeEntry._setValue(b,'');break}return false},_doKeyPress:function(a){var b=String.fromCharCode(a.charCode==undefined?a.keyCode:a.charCode);if(b<' '){return true}var c=$.data(a.target,m);$.timeEntry._handleKeyPress(c,b);return false},_doMouseWheel:function(a,b){if($.timeEntry._isDisabledTimeEntry(a.target)){return}b=($.browser.opera?-b/Math.abs(b):($.browser.safari?b/Math.abs(b):b));var c=$.data(a.target,m);c.input.focus();if(!c.input.val()){$.timeEntry._parseTime(c)}$.timeEntry._adjustField(c,b);a.preventDefault()},_expandSpinner:function(b){var c=$.timeEntry._getSpinnerTarget(b);var d=$.data($.timeEntry._getInput(c),m);if($.timeEntry._isDisabledTimeEntry(d.input[0])){return}var e=$.timeEntry._get(d,'spinnerBigImage');if(e){d._expanded=true;var f=$(c).offset();var g=null;$(c).parents().each(function(){var a=$(this);if(a.css('position')=='relative'||a.css('position')=='absolute'){g=a.offset()}return!g});var h=$.timeEntry._get(d,'spinnerSize');var i=$.timeEntry._get(d,'spinnerBigSize');$('<div class="timeEntry_expand" style="position: absolute; left: '+(f.left-(i[0]-h[0])/2-(g?g.left:0))+'px; top: '+(f.top-(i[1]-h[1])/2-(g?g.top:0))+'px; width: '+i[0]+'px; height: '+i[1]+'px; background: transparent url('+e+') no-repeat 0px 0px; z-index: 10;"></div>').mousedown($.timeEntry._handleSpinner).mouseup($.timeEntry._endSpinner).mouseout($.timeEntry._endExpand).mousemove($.timeEntry._describeSpinner).insertAfter(c)}},_getInput:function(a){return $(a).siblings('.'+$.timeEntry.markerClassName)[0]},_describeSpinner:function(a){var b=$.timeEntry._getSpinnerTarget(a);var c=$.data($.timeEntry._getInput(b),m);b.title=$.timeEntry._get(c,'spinnerTexts')[$.timeEntry._getSpinnerRegion(c,a)]},_handleSpinner:function(a){var b=$.timeEntry._getSpinnerTarget(a);var c=$.timeEntry._getInput(b);if($.timeEntry._isDisabledTimeEntry(c)){return}if(c==$.timeEntry._blurredInput){$.timeEntry._lastInput=c;$.timeEntry._blurredInput=null}var d=$.data(c,m);$.timeEntry._doFocus(c);var e=$.timeEntry._getSpinnerRegion(d,a);$.timeEntry._changeSpinner(d,b,e);$.timeEntry._actionSpinner(d,e);$.timeEntry._timer=null;$.timeEntry._handlingSpinner=true;var f=$.timeEntry._get(d,'spinnerRepeat');if(e>=3&&f[0]){$.timeEntry._timer=setTimeout(function(){$.timeEntry._repeatSpinner(d,e)},f[0]);$(b).one('mouseout',$.timeEntry._releaseSpinner).one('mouseup',$.timeEntry._releaseSpinner)}},_actionSpinner:function(a,b){if(!a.input.val()){$.timeEntry._parseTime(a)}switch(b){case 0:this._setTime(a);break;case 1:this._changeField(a,-1,false);break;case 2:this._changeField(a,+1,false);break;case 3:this._adjustField(a,+1);break;case 4:this._adjustField(a,-1);break}},_repeatSpinner:function(a,b){if(!$.timeEntry._timer){return}$.timeEntry._lastInput=$.timeEntry._blurredInput;this._actionSpinner(a,b);this._timer=setTimeout(function(){$.timeEntry._repeatSpinner(a,b)},this._get(a,'spinnerRepeat')[1])},_releaseSpinner:function(a){clearTimeout($.timeEntry._timer);$.timeEntry._timer=null},_endExpand:function(a){$.timeEntry._timer=null;var b=$.timeEntry._getSpinnerTarget(a);var c=$.timeEntry._getInput(b);var d=$.data(c,m);$(b).remove();d._expanded=false},_endSpinner:function(a){$.timeEntry._timer=null;var b=$.timeEntry._getSpinnerTarget(a);var c=$.timeEntry._getInput(b);var d=$.data(c,m);if(!$.timeEntry._isDisabledTimeEntry(c)){$.timeEntry._changeSpinner(d,b,-1)}if($.timeEntry._handlingSpinner){$.timeEntry._lastInput=$.timeEntry._blurredInput}if($.timeEntry._lastInput&&$.timeEntry._handlingSpinner){$.timeEntry._showField(d)}$.timeEntry._handlingSpinner=false},_getSpinnerTarget:function(a){return a.target||a.srcElement},_getSpinnerRegion:function(a,b){var c=this._getSpinnerTarget(b);var d=($.browser.opera||$.browser.safari?$.timeEntry._findPos(c):$(c).offset());var e=($.browser.safari?$.timeEntry._findScroll(c):[document.documentElement.scrollLeft||document.body.scrollLeft,document.documentElement.scrollTop||document.body.scrollTop]);var f=this._get(a,'spinnerIncDecOnly');var g=(f?99:b.clientX+e[0]-d.left-($.browser.msie?2:0));var h=b.clientY+e[1]-d.top-($.browser.msie?2:0);var i=this._get(a,(a._expanded?'spinnerBigSize':'spinnerSize'));var j=(f?99:i[0]-1-g);var k=i[1]-1-h;if(i[2]>0&&Math.abs(g-j)<=i[2]&&Math.abs(h-k)<=i[2]){return 0}var l=Math.min(g,h,j,k);return(l==g?1:(l==j?2:(l==h?3:4)))},_changeSpinner:function(a,b,c){$(b).css('background-position','-'+((c+1)*this._get(a,(a._expanded?'spinnerBigSize':'spinnerSize'))[0])+'px 0px')},_findPos:function(a){var b=curTop=0;if(a.offsetParent){b=a.offsetLeft;curTop=a.offsetTop;while(a=a.offsetParent){var c=b;b+=a.offsetLeft;if(b<0){b=c}curTop+=a.offsetTop}}return{left:b,top:curTop}},_findScroll:function(a){var b=false;$(a).parents().each(function(){b|=$(this).css('position')=='fixed'});if(b){return[0,0]}var c=a.scrollLeft;var d=a.scrollTop;while(a=a.parentNode){c+=a.scrollLeft||0;d+=a.scrollTop||0}return[c,d]},_get:function(a,b){return(a.options[b]!=null?a.options[b]:$.timeEntry._defaults[b])},_parseTime:function(a){var b=this._extractTime(a);var c=this._get(a,'showSeconds');if(b){a._selectedHour=b[0];a._selectedMinute=b[1];a._selectedSecond=b[2]}else{var d=this._constrainTime(a);a._selectedHour=d[0];a._selectedMinute=d[1];a._selectedSecond=(c?d[2]:0)}a._secondField=(c?2:-1);a._ampmField=(this._get(a,'show24Hours')?-1:(c?3:2));a._lastChr='';a._field=Math.max(0,Math.min(Math.max(1,a._secondField,a._ampmField),this._get(a,'initialField')));if(a.input.val()!=''){this._showTime(a)}},_extractTime:function(a,b){b=b||a.input.val();var c=this._get(a,'separator');var d=b.split(c);if(c==''&&b!=''){d[0]=b.substring(0,2);d[1]=b.substring(2,4);d[2]=b.substring(4,6)}var e=this._get(a,'ampmNames');var f=this._get(a,'show24Hours');if(d.length>=2){var g=!f&&(b.indexOf(e[0])>-1);var h=!f&&(b.indexOf(e[1])>-1);var i=parseInt(d[0],10);i=(isNaN(i)?0:i);i=((g||h)&&i==12?0:i)+(h?12:0);var j=parseInt(d[1],10);j=(isNaN(j)?0:j);var k=(d.length>=3?parseInt(d[2],10):0);k=(isNaN(k)||!this._get(a,'showSeconds')?0:k);return this._constrainTime(a,[i,j,k])}return null},_constrainTime:function(a,b){var c=(b!=null);if(!c){var d=this._determineTime(a,this._get(a,'defaultTime'))||new Date();b=[d.getHours(),d.getMinutes(),d.getSeconds()]}var e=false;var f=this._get(a,'timeSteps');for(var i=0;i<f.length;i++){if(e){b[i]=0}else if(f[i]>1){b[i]=Math.round(b[i]/f[i])*f[i];e=true}}return b},_showTime:function(a){var b=this._get(a,'show24Hours');var c=this._get(a,'separator');var d=(this._formatNumber(b?a._selectedHour:((a._selectedHour+11)%12)+1)+c+this._formatNumber(a._selectedMinute)+(this._get(a,'showSeconds')?c+this._formatNumber(a._selectedSecond):'')+(b?'':this._get(a,'ampmPrefix')+this._get(a,'ampmNames')[(a._selectedHour<12?0:1)]));this._setValue(a,d);this._showField(a)},_showField:function(a){var b=a.input[0];if(a.input.is(':hidden')||$.timeEntry._lastInput!=b){return}var c=this._get(a,'separator');var d=c.length+2;var e=(a._field!=a._ampmField?(a._field*d):(a._ampmField*d)-c.length+this._get(a,'ampmPrefix').length);var f=e+(a._field!=a._ampmField?2:this._get(a,'ampmNames')[0].length);if(b.setSelectionRange){b.setSelectionRange(e,f)}else if(b.createTextRange){var g=b.createTextRange();g.moveStart('character',e);g.moveEnd('character',f-a.input.val().length);g.select()}if(!b.disabled){b.focus()}},_formatNumber:function(a){return(a<10?'0':'')+a},_setValue:function(a,b){if(b!=a.input.val()){a.input.val(b).trigger('change')}},_changeField:function(a,b,c){var d=(a.input.val()==''||a._field==(b==-1?0:Math.max(1,a._secondField,a._ampmField)));if(!d){a._field+=b}this._showField(a);a._lastChr='';$.data(a.input[0],m,a);return(d&&c)},_adjustField:function(a,b){if(a.input.val()==''){b=0}var c=this._get(a,'timeSteps');this._setTime(a,new Date(0,0,0,a._selectedHour+(a._field==0?b*c[0]:0)+(a._field==a._ampmField?b*12:0),a._selectedMinute+(a._field==1?b*c[1]:0),a._selectedSecond+(a._field==a._secondField?b*c[2]:0)))},_setTime:function(a,b){b=this._determineTime(a,b);var c=this._constrainTime(a,b?[b.getHours(),b.getMinutes(),b.getSeconds()]:null);b=new Date(0,0,0,c[0],c[1],c[2]);var b=this._normaliseTime(b);var d=this._normaliseTime(this._determineTime(a,this._get(a,'minTime')));var e=this._normaliseTime(this._determineTime(a,this._get(a,'maxTime')));b=(d&&b<d?d:(e&&b>e?e:b));var f=this._get(a,'beforeSetTime');if(f){b=f.apply(a.input[0],[this._getTimeTimeEntry(a.input[0]),b,d,e])}a._selectedHour=b.getHours();a._selectedMinute=b.getMinutes();a._selectedSecond=b.getSeconds();this._showTime(a);$.data(a.input[0],m,a)},_normaliseTime:function(a){if(!a){return null}a.setFullYear(1900);a.setMonth(0);a.setDate(0);return a},_determineTime:function(i,j){var k=function(a){var b=new Date();b.setTime(b.getTime()+a*1000);return b};var l=function(a){var b=$.timeEntry._extractTime(i,a);var c=new Date();var d=(b?b[0]:c.getHours());var e=(b?b[1]:c.getMinutes());var f=(b?b[2]:c.getSeconds());if(!b){var g=/([+-]?[0-9]+)\s*(s|S|m|M|h|H)?/g;var h=g.exec(a);while(h){switch(h[2]||'s'){case's':case'S':f+=parseInt(h[1],10);break;case'm':case'M':e+=parseInt(h[1],10);break;case'h':case'H':d+=parseInt(h[1],10);break}h=g.exec(a)}}c=new Date(0,0,10,d,e,f,0);if(/^!/.test(a)){if(c.getDate()>10){c=new Date(0,0,10,23,59,59)}else if(c.getDate()<10){c=new Date(0,0,10,0,0,0)}}return c};return(j?(typeof j=='string'?l(j):(typeof j=='number'?k(j):j)):null)},_handleKeyPress:function(a,b){if(b==this._get(a,'separator')){this._changeField(a,+1,false)}else if(b>='0'&&b<='9'){var c=parseInt(b,10);var d=parseInt(a._lastChr+b,10);var e=this._get(a,'show24Hours');var f=(a._field!=0?a._selectedHour:(e?(d<24?d:c):(d>=1&&d<=12?d:(c>0?c:a._selectedHour))%12+(a._selectedHour>=12?12:0)));var g=(a._field!=1?a._selectedMinute:(d<60?d:c));var h=(a._field!=a._secondField?a._selectedSecond:(d<60?d:c));var i=this._constrainTime(a,[f,g,h]);this._setTime(a,new Date(0,0,0,i[0],i[1],i[2]));a._lastChr=b}else if(!this._get(a,'show24Hours')){b=b.toLowerCase();var j=this._get(a,'ampmNames');if((b==j[0].substring(0,1).toLowerCase()&&a._selectedHour>=12)||(b==j[1].substring(0,1).toLowerCase()&&a._selectedHour<12)){var k=a._field;a._field=a._ampmField;this._adjustField(a,+1);a._field=k;this._showField(a)}}}});function extendRemove(a,b){$.extend(a,b);for(var c in b){if(b[c]==null){a[c]=null}}return a}var n=['getOffset','getTime','isDisabled'];$.fn.timeEntry=function(c){var d=Array.prototype.slice.call(arguments,1);if(typeof c=='string'&&$.inArray(c,n)>-1){return $.timeEntry['_'+c+'TimeEntry'].apply($.timeEntry,[this[0]].concat(d))}return this.each(function(){var a=this.nodeName.toLowerCase();if(a=='input'){if(typeof c=='string'){$.timeEntry['_'+c+'TimeEntry'].apply($.timeEntry,[this].concat(d))}else{var b=($.fn.metadata?$(this).metadata():{});$.timeEntry._connectTimeEntry(this,$.extend(b,c))}}})};$.timeEntry=new TimeEntry()})(jQuery);
;
(function(c){var b,e,a=[],d=window;c.fn.tinymce=function(j){var p=this,g,k,h,m,i,l="",n="";if(!p.length){return p}if(!j){return tinyMCE.get(p[0].id)}p.css("visibility","hidden");function o(){var r=[],q=0;if(f){f();f=null}p.each(function(t,u){var s,w=u.id,v=j.oninit;if(!w){u.id=w=tinymce.DOM.uniqueId()}s=new tinymce.Editor(w,j);r.push(s);s.onInit.add(function(){var x,y=v;p.css("visibility","");if(v){if(++q==r.length){if(tinymce.is(y,"string")){x=(y.indexOf(".")===-1)?null:tinymce.resolve(y.replace(/\.\w+$/,""));y=tinymce.resolve(y)}y.apply(x||tinymce,r)}}})});c.each(r,function(t,s){s.render()})}if(!d.tinymce&&!e&&(g=j.script_url)){e=1;h=g.substring(0,g.lastIndexOf("/"));if(/_(src|dev)\.js/g.test(g)){n="_src"}m=g.lastIndexOf("?");if(m!=-1){l=g.substring(m+1)}d.tinyMCEPreInit=d.tinyMCEPreInit||{base:h,suffix:n,query:l};if(g.indexOf("gzip")!=-1){i=j.language||"en";g=g+(/\?/.test(g)?"&":"?")+"js=true&core=true&suffix="+escape(n)+"&themes="+escape(j.theme)+"&plugins="+escape(j.plugins)+"&languages="+i;if(!d.tinyMCE_GZ){tinyMCE_GZ={start:function(){tinymce.suffix=n;function q(r){tinymce.ScriptLoader.markDone(tinyMCE.baseURI.toAbsolute(r))}q("langs/"+i+".js");q("themes/"+j.theme+"/editor_template"+n+".js");q("themes/"+j.theme+"/langs/"+i+".js");c.each(j.plugins.split(","),function(s,r){if(r){q("plugins/"+r+"/editor_plugin"+n+".js");q("plugins/"+r+"/langs/"+i+".js")}})},end:function(){}}}}c.ajax({type:"GET",url:g,dataType:"script",cache:true,success:function(){tinymce.dom.Event.domLoaded=1;e=2;if(j.script_loaded){j.script_loaded()}o();c.each(a,function(q,r){r()})}})}else{if(e===1){a.push(o)}else{o()}}return p};c.extend(c.expr[":"],{tinymce:function(g){return !!(g.id&&"tinyMCE" in window&&tinyMCE.get(g.id))}});function f(){function i(l){if(l==="remove"){this.each(function(n,o){var m=h(o);if(m){m.remove()}})}this.find("span.mceEditor,div.mceEditor").each(function(n,o){var m=tinyMCE.get(o.id.replace(/_parent$/,""));if(m){m.remove()}})}function k(n){var m=this,l;if(n!==b){i.call(m);m.each(function(p,q){var o;if(o=tinyMCE.get(q.id)){o.setContent(n)}})}else{if(m.length>0){if(l=tinyMCE.get(m[0].id)){return l.getContent()}}}}function h(m){var l=null;(m)&&(m.id)&&(d.tinymce)&&(l=tinyMCE.get(m.id));return l}function g(l){return !!((l)&&(l.length)&&(d.tinymce)&&(l.is(":tinymce")))}var j={};c.each(["text","html","val"],function(n,l){var o=j[l]=c.fn[l],m=(l==="text");c.fn[l]=function(s){var p=this;if(!g(p)){return o.apply(p,arguments)}if(s!==b){k.call(p.filter(":tinymce"),s);o.apply(p.not(":tinymce"),arguments);return p}else{var r="";var q=arguments;(m?p:p.eq(0)).each(function(u,v){var t=h(v);r+=t?(m?t.getContent().replace(/<(?:"[^"]*"|'[^']*'|[^'">])*>/g,""):t.getContent({save:true})):o.apply(c(v),q)});return r}}});c.each(["append","prepend"],function(n,m){var o=j[m]=c.fn[m],l=(m==="prepend");c.fn[m]=function(q){var p=this;if(!g(p)){return o.apply(p,arguments)}if(q!==b){p.filter(":tinymce").each(function(s,t){var r=h(t);r&&r.setContent(l?q+r.getContent():r.getContent()+q)});o.apply(p.not(":tinymce"),arguments);return p}}});c.each(["remove","replaceWith","replaceAll","empty"],function(m,l){var n=j[l]=c.fn[l];c.fn[l]=function(){i.call(this,l);return n.apply(this,arguments)}});j.attr=c.fn.attr;c.fn.attr=function(o,q){var m=this,n=arguments;if((!o)||(o!=="value")||(!g(m))){if(q!==b){return j.attr.apply(m,n)}else{return j.attr.apply(m,n)}}if(q!==b){k.call(m.filter(":tinymce"),q);j.attr.apply(m.not(":tinymce"),n);return m}else{var p=m[0],l=h(p);return l?l.getContent({save:true}):j.attr.apply(c(p),n)}}}})(jQuery);
;
/*
 * jQuery UI Touch Punch 0.2.2
 *
 * Copyright 2011, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
(function(b){b.support.touch="ontouchend" in document;if(!b.support.touch){return;}var c=b.ui.mouse.prototype,e=c._mouseInit,a;function d(g,h){if(g.originalEvent.touches.length>1){return;}g.preventDefault();var i=g.originalEvent.changedTouches[0],f=document.createEvent("MouseEvents");f.initMouseEvent(h,true,true,window,1,i.screenX,i.screenY,i.clientX,i.clientY,false,false,false,false,0,null);g.target.dispatchEvent(f);}c._touchStart=function(g){var f=this;if(a||!f._mouseCapture(g.originalEvent.changedTouches[0])){return;}a=true;f._touchMoved=false;d(g,"mouseover");d(g,"mousemove");d(g,"mousedown");};c._touchMove=function(f){if(!a){return;}this._touchMoved=true;d(f,"mousemove");};c._touchEnd=function(f){if(!a){return;}d(f,"mouseup");d(f,"mouseout");if(!this._touchMoved){d(f,"click");}a=false;};c._mouseInit=function(){var f=this;f.element.bind("touchstart",b.proxy(f,"_touchStart")).bind("touchmove",b.proxy(f,"_touchMove")).bind("touchend",b.proxy(f,"_touchEnd"));e.call(f);};})(jQuery);
;
/* UItoTop jQuery Plugin 1.2 | Matt Varone | http://www.mattvarone.com/web-design/uitotop-jquery-plugin */
(function($){$.fn.UItoTop=function(options){var defaults={text:'To Top',min:200,inDelay:600,outDelay:400,containerID:'toTop',containerHoverID:'toTopHover',scrollSpeed:1200,easingType:'linear'},settings=$.extend(defaults,options),containerIDhash='#'+settings.containerID,containerHoverIDHash='#'+settings.containerHoverID;$('body').append('<a href="#" id="'+settings.containerID+'">'+settings.text+'</a>');$(containerIDhash).hide().on('click.UItoTop',function(){$('html, body').animate({scrollTop:0},settings.scrollSpeed,settings.easingType);$('#'+settings.containerHoverID,this).stop().animate({'opacity':0},settings.inDelay,settings.easingType);return false;}).prepend('<span id="'+settings.containerHoverID+'"></span>').hover(function(){$(containerHoverIDHash,this).stop().animate({'opacity':1},600,'linear');},function(){$(containerHoverIDHash,this).stop().animate({'opacity':0},700,'linear');});$(window).scroll(function(){var sd=$(window).scrollTop();if(typeof document.body.style.maxHeight==="undefined"){$(containerIDhash).css({'position':'absolute','top':sd+$(window).height()-50});}
if(sd>settings.min)
$(containerIDhash).fadeIn(settings.inDelay);else
$(containerIDhash).fadeOut(settings.Outdelay);});};})(jQuery);
;
(function(a){a.uniform={options:{selectClass:"selector",radioClass:"radio",checkboxClass:"checker",fileClass:"uploader",filenameClass:"filename",fileBtnClass:"action",fileDefaultText:"No file selected",fileBtnText:"Choose File",checkedClass:"checked",focusClass:"focus",disabledClass:"disabled",buttonClass:"button",activeClass:"active",hoverClass:"hover",useID:true,idPrefix:"uniform",resetSelector:false,autoHide:true},elements:[]};if(a.browser.msie&&a.browser.version<7){a.support.selectOpacity=false}else{a.support.selectOpacity=true}a.fn.uniform=function(k){k=a.extend(a.uniform.options,k);var d=this;if(k.resetSelector!=false){a(k.resetSelector).mouseup(function(){function l(){a.uniform.update(d)}setTimeout(l,10)})}function j(l){$el=a(l);$el.addClass($el.attr("type"));b(l)}function g(l){a(l).addClass("uniform");b(l)}function i(o){var m=a(o);var p=a("<div>"),l=a("<span>");p.addClass(k.buttonClass);if(k.useID&&m.attr("id")!=""){p.attr("id",k.idPrefix+"-"+m.attr("id"))}var n;if(m.is("a")||m.is("button")){n=m.text()}else{if(m.is(":submit")||m.is(":reset")||m.is("input[type=button]")){n=m.attr("value")}}n=n==""?m.is(":reset")?"Reset":"Submit":n;l.html(n);m.css("opacity",0);m.wrap(p);m.wrap(l);p=m.closest("div");l=m.closest("span");if(m.is(":disabled")){p.addClass(k.disabledClass)}p.bind({"mouseenter.uniform":function(){p.addClass(k.hoverClass)},"mouseleave.uniform":function(){p.removeClass(k.hoverClass);p.removeClass(k.activeClass)},"mousedown.uniform touchbegin.uniform":function(){p.addClass(k.activeClass)},"mouseup.uniform touchend.uniform":function(){p.removeClass(k.activeClass)},"click.uniform touchend.uniform":function(r){if(a(r.target).is("span")||a(r.target).is("div")){if(o[0].dispatchEvent){var q=document.createEvent("MouseEvents");q.initEvent("click",true,true);o[0].dispatchEvent(q)}else{o[0].click()}}}});o.bind({"focus.uniform":function(){p.addClass(k.focusClass)},"blur.uniform":function(){p.removeClass(k.focusClass)}});a.uniform.noSelect(p);b(o)}function e(o){var m=a(o);var p=a("<div />"),l=a("<span />");if(!m.css("display")=="none"&&k.autoHide){p.hide()}p.addClass(k.selectClass);if(k.useID&&o.attr("id")!=""){p.attr("id",k.idPrefix+"-"+o.attr("id"))}var n=o.find(":selected:first");if(n.length==0){n=o.find("option:first")}l.html(n.html());o.css("opacity",0);o.wrap(p);o.before(l);p=o.parent("div");l=o.siblings("span");o.bind({"change.uniform":function(){l.text(o.find(":selected").html());p.removeClass(k.activeClass)},"focus.uniform":function(){p.addClass(k.focusClass)},"blur.uniform":function(){p.removeClass(k.focusClass);p.removeClass(k.activeClass)},"mousedown.uniform touchbegin.uniform":function(){p.addClass(k.activeClass)},"mouseup.uniform touchend.uniform":function(){p.removeClass(k.activeClass)},"click.uniform touchend.uniform":function(){p.removeClass(k.activeClass)},"mouseenter.uniform":function(){p.addClass(k.hoverClass)},"mouseleave.uniform":function(){p.removeClass(k.hoverClass);p.removeClass(k.activeClass)},"keyup.uniform":function(){l.text(o.find(":selected").html())}});if(a(o).attr("disabled")){p.addClass(k.disabledClass)}a.uniform.noSelect(l);b(o)}function f(n){var m=a(n);var o=a("<div />"),l=a("<span />");if(!m.css("display")=="none"&&k.autoHide){o.hide()}o.addClass(k.checkboxClass);if(k.useID&&n.attr("id")!=""){o.attr("id",k.idPrefix+"-"+n.attr("id"))}a(n).wrap(o);a(n).wrap(l);l=n.parent();o=l.parent();a(n).css("opacity",0).bind({"focus.uniform":function(){o.addClass(k.focusClass)},"blur.uniform":function(){o.removeClass(k.focusClass)},"click.uniform touchend.uniform":function(){if(!a(n).attr("checked")){l.removeClass(k.checkedClass)}else{l.addClass(k.checkedClass)}},"mousedown.uniform touchbegin.uniform":function(){o.addClass(k.activeClass)},"mouseup.uniform touchend.uniform":function(){o.removeClass(k.activeClass)},"mouseenter.uniform":function(){o.addClass(k.hoverClass)},"mouseleave.uniform":function(){o.removeClass(k.hoverClass);o.removeClass(k.activeClass)}});if(a(n).attr("checked")){l.addClass(k.checkedClass)}if(a(n).attr("disabled")){o.addClass(k.disabledClass)}b(n)}function c(n){var m=a(n);var o=a("<div />"),l=a("<span />");if(!m.css("display")=="none"&&k.autoHide){o.hide()}o.addClass(k.radioClass);if(k.useID&&n.attr("id")!=""){o.attr("id",k.idPrefix+"-"+n.attr("id"))}a(n).wrap(o);a(n).wrap(l);l=n.parent();o=l.parent();a(n).css("opacity",0).bind({"focus.uniform":function(){o.addClass(k.focusClass)},"blur.uniform":function(){o.removeClass(k.focusClass)},"click.uniform touchend.uniform":function(){if(!a(n).attr("checked")){l.removeClass(k.checkedClass)}else{var p=k.radioClass.split(" ")[0];a("."+p+" span."+k.checkedClass+":has([name='"+a(n).attr("name")+"'])").removeClass(k.checkedClass);l.addClass(k.checkedClass)}},"mousedown.uniform touchend.uniform":function(){if(!a(n).is(":disabled")){o.addClass(k.activeClass)}},"mouseup.uniform touchbegin.uniform":function(){o.removeClass(k.activeClass)},"mouseenter.uniform touchend.uniform":function(){o.addClass(k.hoverClass)},"mouseleave.uniform":function(){o.removeClass(k.hoverClass);o.removeClass(k.activeClass)}});if(a(n).attr("checked")){l.addClass(k.checkedClass)}if(a(n).attr("disabled")){o.addClass(k.disabledClass)}b(n)}function h(q){var o=a(q);var r=a("<div />"),p=a("<span>"+k.fileDefaultText+"</span>"),m=a("<span>"+k.fileBtnText+"</span>");if(!o.css("display")=="none"&&k.autoHide){r.hide()}r.addClass(k.fileClass);p.addClass(k.filenameClass);m.addClass(k.fileBtnClass);if(k.useID&&o.attr("id")!=""){r.attr("id",k.idPrefix+"-"+o.attr("id"))}o.wrap(r);o.after(m);o.after(p);r=o.closest("div");p=o.siblings("."+k.filenameClass);m=o.siblings("."+k.fileBtnClass);if(!o.attr("size")){var l=r.width();o.attr("size",l/10)}var n=function(){var s=o.val();if(s===""){s=k.fileDefaultText}else{s=s.split(/[\/\\]+/);s=s[(s.length-1)]}p.text(s)};n();o.css("opacity",0).bind({"focus.uniform":function(){r.addClass(k.focusClass)},"blur.uniform":function(){r.removeClass(k.focusClass)},"mousedown.uniform":function(){if(!a(q).is(":disabled")){r.addClass(k.activeClass)}},"mouseup.uniform":function(){r.removeClass(k.activeClass)},"mouseenter.uniform":function(){r.addClass(k.hoverClass)},"mouseleave.uniform":function(){r.removeClass(k.hoverClass);r.removeClass(k.activeClass)}});if(a.browser.msie){o.bind("click.uniform.ie7",function(){setTimeout(n,0)})}else{o.bind("change.uniform",n)}if(o.attr("disabled")){r.addClass(k.disabledClass)}a.uniform.noSelect(p);a.uniform.noSelect(m);b(q)}a.uniform.restore=function(l){if(l==undefined){l=a(a.uniform.elements)}a(l).each(function(){if(a(this).is(":checkbox")){a(this).unwrap().unwrap()}else{if(a(this).is("select")){a(this).siblings("span").remove();a(this).unwrap()}else{if(a(this).is(":radio")){a(this).unwrap().unwrap()}else{if(a(this).is(":file")){a(this).siblings("span").remove();a(this).unwrap()}else{if(a(this).is("button, :submit, :reset, a, input[type='button']")){a(this).unwrap().unwrap()}}}}}a(this).unbind(".uniform");a(this).css("opacity","1");var m=a.inArray(a(l),a.uniform.elements);a.uniform.elements.splice(m,1)})};function b(l){l=a(l).get();if(l.length>1){a.each(l,function(m,n){a.uniform.elements.push(n)})}else{a.uniform.elements.push(l)}}a.uniform.noSelect=function(l){function m(){return false}a(l).each(function(){this.onselectstart=this.ondragstart=m;a(this).mousedown(m).css({MozUserSelect:"none"})})};a.uniform.update=function(l){if(l==undefined){l=a(a.uniform.elements)}l=a(l);l.each(function(){var n=a(this);if(n.is("select")){var m=n.siblings("span");var p=n.parent("div");p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);m.html(n.find(":selected").html());if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}else{if(n.is(":checkbox")){var m=n.closest("span");var p=n.closest("div");p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);m.removeClass(k.checkedClass);if(n.is(":checked")){m.addClass(k.checkedClass)}if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}else{if(n.is(":radio")){var m=n.closest("span");var p=n.closest("div");p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);m.removeClass(k.checkedClass);if(n.is(":checked")){m.addClass(k.checkedClass)}if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}else{if(n.is(":file")){var p=n.parent("div");var o=n.siblings(k.filenameClass);btnTag=n.siblings(k.fileBtnClass);p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);o.text(n.val());if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}else{if(n.is(":submit")||n.is(":reset")||n.is("button")||n.is("a")||l.is("input[type=button]")){var p=n.closest("div");p.removeClass(k.hoverClass+" "+k.focusClass+" "+k.activeClass);if(n.is(":disabled")){p.addClass(k.disabledClass)}else{p.removeClass(k.disabledClass)}}}}}}})};return this.each(function(){if(a.support.selectOpacity){var l=a(this);if(l.is("select")){if(l.attr("multiple")!=true){if(l.attr("size")==undefined||l.attr("size")<=1){e(l)}}}else{if(l.is(":checkbox")){f(l)}else{if(l.is(":radio")){c(l)}else{if(l.is(":file")){h(l)}else{if(l.is(":text, :password, input[type='email']")){j(l)}else{if(l.is("textarea")){g(l)}else{if(l.is("a")||l.is(":submit")||l.is(":reset")||l.is("button")||l.is("input[type=button]")){i(l)}}}}}}}}})}})(jQuery);
;
/**
 * jQuery Validation Plugin 1.9.0
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright (c) 2006 - 2011 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function(c){c.extend(c.fn,{validate:function(a){if(this.length){var b=c.data(this[0],"validator");if(b)return b;this.attr("novalidate","novalidate");b=new c.validator(a,this[0]);c.data(this[0],"validator",b);if(b.settings.onsubmit){a=this.find("input, button");a.filter(".cancel").click(function(){b.cancelSubmit=true});b.settings.submitHandler&&a.filter(":submit").click(function(){b.submitButton=this});this.submit(function(d){function e(){if(b.settings.submitHandler){if(b.submitButton)var f=c("<input type='hidden'/>").attr("name",
b.submitButton.name).val(b.submitButton.value).appendTo(b.currentForm);b.settings.submitHandler.call(b,b.currentForm);b.submitButton&&f.remove();return false}return true}b.settings.debug&&d.preventDefault();if(b.cancelSubmit){b.cancelSubmit=false;return e()}if(b.form()){if(b.pendingRequest){b.formSubmitted=true;return false}return e()}else{b.focusInvalid();return false}})}return b}else a&&a.debug&&window.console&&console.warn("nothing selected, can't validate, returning nothing")},valid:function(){if(c(this[0]).is("form"))return this.validate().form();
else{var a=true,b=c(this[0].form).validate();this.each(function(){a&=b.element(this)});return a}},removeAttrs:function(a){var b={},d=this;c.each(a.split(/\s/),function(e,f){b[f]=d.attr(f);d.removeAttr(f)});return b},rules:function(a,b){var d=this[0];if(a){var e=c.data(d.form,"validator").settings,f=e.rules,g=c.validator.staticRules(d);switch(a){case "add":c.extend(g,c.validator.normalizeRule(b));f[d.name]=g;if(b.messages)e.messages[d.name]=c.extend(e.messages[d.name],b.messages);break;case "remove":if(!b){delete f[d.name];
return g}var h={};c.each(b.split(/\s/),function(j,i){h[i]=g[i];delete g[i]});return h}}d=c.validator.normalizeRules(c.extend({},c.validator.metadataRules(d),c.validator.classRules(d),c.validator.attributeRules(d),c.validator.staticRules(d)),d);if(d.required){e=d.required;delete d.required;d=c.extend({required:e},d)}return d}});c.extend(c.expr[":"],{blank:function(a){return!c.trim(""+a.value)},filled:function(a){return!!c.trim(""+a.value)},unchecked:function(a){return!a.checked}});c.validator=function(a,
b){this.settings=c.extend(true,{},c.validator.defaults,a);this.currentForm=b;this.init()};c.validator.format=function(a,b){if(arguments.length==1)return function(){var d=c.makeArray(arguments);d.unshift(a);return c.validator.format.apply(this,d)};if(arguments.length>2&&b.constructor!=Array)b=c.makeArray(arguments).slice(1);if(b.constructor!=Array)b=[b];c.each(b,function(d,e){a=a.replace(RegExp("\\{"+d+"\\}","g"),e)});return a};c.extend(c.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",
validClass:"valid",errorElement:"label",focusInvalid:true,errorContainer:c([]),errorLabelContainer:c([]),onsubmit:true,ignore:":hidden",ignoreTitle:false,onfocusin:function(a){this.lastActive=a;if(this.settings.focusCleanup&&!this.blockFocusCleanup){this.settings.unhighlight&&this.settings.unhighlight.call(this,a,this.settings.errorClass,this.settings.validClass);this.addWrapper(this.errorsFor(a)).hide()}},onfocusout:function(a){if(!this.checkable(a)&&(a.name in this.submitted||!this.optional(a)))this.element(a)},
onkeyup:function(a){if(a.name in this.submitted||a==this.lastElement)this.element(a)},onclick:function(a){if(a.name in this.submitted)this.element(a);else a.parentNode.name in this.submitted&&this.element(a.parentNode)},highlight:function(a,b,d){a.type==="radio"?this.findByName(a.name).addClass(b).removeClass(d):c(a).addClass(b).removeClass(d)},unhighlight:function(a,b,d){a.type==="radio"?this.findByName(a.name).removeClass(b).addClass(d):c(a).removeClass(b).addClass(d)}},setDefaults:function(a){c.extend(c.validator.defaults,
a)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",creditcard:"Please enter a valid credit card number.",equalTo:"Please enter the same value again.",accept:"Please enter a value with a valid extension.",maxlength:c.validator.format("Please enter no more than {0} characters."),
minlength:c.validator.format("Please enter at least {0} characters."),rangelength:c.validator.format("Please enter a value between {0} and {1} characters long."),range:c.validator.format("Please enter a value between {0} and {1}."),max:c.validator.format("Please enter a value less than or equal to {0}."),min:c.validator.format("Please enter a value greater than or equal to {0}.")},autoCreateRanges:false,prototype:{init:function(){function a(e){var f=c.data(this[0].form,"validator"),g="on"+e.type.replace(/^validate/,
"");f.settings[g]&&f.settings[g].call(f,this[0],e)}this.labelContainer=c(this.settings.errorLabelContainer);this.errorContext=this.labelContainer.length&&this.labelContainer||c(this.currentForm);this.containers=c(this.settings.errorContainer).add(this.settings.errorLabelContainer);this.submitted={};this.valueCache={};this.pendingRequest=0;this.pending={};this.invalid={};this.reset();var b=this.groups={};c.each(this.settings.groups,function(e,f){c.each(f.split(/\s/),function(g,h){b[h]=e})});var d=
this.settings.rules;c.each(d,function(e,f){d[e]=c.validator.normalizeRule(f)});c(this.currentForm).validateDelegate("[type='text'], [type='password'], [type='file'], select, textarea, [type='number'], [type='search'] ,[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'] ","focusin focusout keyup",a).validateDelegate("[type='radio'], [type='checkbox'], select, option","click",
a);this.settings.invalidHandler&&c(this.currentForm).bind("invalid-form.validate",this.settings.invalidHandler)},form:function(){this.checkForm();c.extend(this.submitted,this.errorMap);this.invalid=c.extend({},this.errorMap);this.valid()||c(this.currentForm).triggerHandler("invalid-form",[this]);this.showErrors();return this.valid()},checkForm:function(){this.prepareForm();for(var a=0,b=this.currentElements=this.elements();b[a];a++)this.check(b[a]);return this.valid()},element:function(a){this.lastElement=
a=this.validationTargetFor(this.clean(a));this.prepareElement(a);this.currentElements=c(a);var b=this.check(a);if(b)delete this.invalid[a.name];else this.invalid[a.name]=true;if(!this.numberOfInvalids())this.toHide=this.toHide.add(this.containers);this.showErrors();return b},showErrors:function(a){if(a){c.extend(this.errorMap,a);this.errorList=[];for(var b in a)this.errorList.push({message:a[b],element:this.findByName(b)[0]});this.successList=c.grep(this.successList,function(d){return!(d.name in a)})}this.settings.showErrors?
this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors()},resetForm:function(){c.fn.resetForm&&c(this.currentForm).resetForm();this.submitted={};this.lastElement=null;this.prepareForm();this.hideErrors();this.elements().removeClass(this.settings.errorClass)},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(a){var b=0,d;for(d in a)b++;return b},hideErrors:function(){this.addWrapper(this.toHide).hide()},valid:function(){return this.size()==
0},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid)try{c(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(a){}},findLastActive:function(){var a=this.lastActive;return a&&c.grep(this.errorList,function(b){return b.element.name==a.name}).length==1&&a},elements:function(){var a=this,b={};return c(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function(){!this.name&&
a.settings.debug&&window.console&&console.error("%o has no name assigned",this);if(this.name in b||!a.objectLength(c(this).rules()))return false;return b[this.name]=true})},clean:function(a){return c(a)[0]},errors:function(){return c(this.settings.errorElement+"."+this.settings.errorClass,this.errorContext)},reset:function(){this.successList=[];this.errorList=[];this.errorMap={};this.toShow=c([]);this.toHide=c([]);this.currentElements=c([])},prepareForm:function(){this.reset();this.toHide=this.errors().add(this.containers)},
prepareElement:function(a){this.reset();this.toHide=this.errorsFor(a)},check:function(a){a=this.validationTargetFor(this.clean(a));var b=c(a).rules(),d=false,e;for(e in b){var f={method:e,parameters:b[e]};try{var g=c.validator.methods[e].call(this,a.value.replace(/\r/g,""),a,f.parameters);if(g=="dependency-mismatch")d=true;else{d=false;if(g=="pending"){this.toHide=this.toHide.not(this.errorsFor(a));return}if(!g){this.formatAndAdd(a,f);return false}}}catch(h){this.settings.debug&&window.console&&console.log("exception occured when checking element "+
a.id+", check the '"+f.method+"' method",h);throw h;}}if(!d){this.objectLength(b)&&this.successList.push(a);return true}},customMetaMessage:function(a,b){if(c.metadata){var d=this.settings.meta?c(a).metadata()[this.settings.meta]:c(a).metadata();return d&&d.messages&&d.messages[b]}},customMessage:function(a,b){var d=this.settings.messages[a];return d&&(d.constructor==String?d:d[b])},findDefined:function(){for(var a=0;a<arguments.length;a++)if(arguments[a]!==undefined)return arguments[a]},defaultMessage:function(a,
b){return this.findDefined(this.customMessage(a.name,b),this.customMetaMessage(a,b),!this.settings.ignoreTitle&&a.title||undefined,c.validator.messages[b],"<strong>Warning: No message defined for "+a.name+"</strong>")},formatAndAdd:function(a,b){var d=this.defaultMessage(a,b.method),e=/\$?\{(\d+)\}/g;if(typeof d=="function")d=d.call(this,b.parameters,a);else if(e.test(d))d=jQuery.format(d.replace(e,"{$1}"),b.parameters);this.errorList.push({message:d,element:a});this.errorMap[a.name]=d;this.submitted[a.name]=
d},addWrapper:function(a){if(this.settings.wrapper)a=a.add(a.parent(this.settings.wrapper));return a},defaultShowErrors:function(){for(var a=0;this.errorList[a];a++){var b=this.errorList[a];this.settings.highlight&&this.settings.highlight.call(this,b.element,this.settings.errorClass,this.settings.validClass);this.showLabel(b.element,b.message)}if(this.errorList.length)this.toShow=this.toShow.add(this.containers);if(this.settings.success)for(a=0;this.successList[a];a++)this.showLabel(this.successList[a]);
if(this.settings.unhighlight){a=0;for(b=this.validElements();b[a];a++)this.settings.unhighlight.call(this,b[a],this.settings.errorClass,this.settings.validClass)}this.toHide=this.toHide.not(this.toShow);this.hideErrors();this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return c(this.errorList).map(function(){return this.element})},showLabel:function(a,b){var d=this.errorsFor(a);if(d.length){d.removeClass(this.settings.validClass).addClass(this.settings.errorClass);
d.attr("generated")&&d.html(b)}else{d=c("<"+this.settings.errorElement+"/>").attr({"for":this.idOrName(a),generated:true}).addClass(this.settings.errorClass).html(b||"");if(this.settings.wrapper)d=d.hide().show().wrap("<"+this.settings.wrapper+"/>").parent();this.labelContainer.append(d).length||(this.settings.errorPlacement?this.settings.errorPlacement(d,c(a)):d.insertAfter(a))}if(!b&&this.settings.success){d.text("");typeof this.settings.success=="string"?d.addClass(this.settings.success):this.settings.success(d)}this.toShow=
this.toShow.add(d)},errorsFor:function(a){var b=this.idOrName(a);return this.errors().filter(function(){return c(this).attr("for")==b})},idOrName:function(a){return this.groups[a.name]||(this.checkable(a)?a.name:a.id||a.name)},validationTargetFor:function(a){if(this.checkable(a))a=this.findByName(a.name).not(this.settings.ignore)[0];return a},checkable:function(a){return/radio|checkbox/i.test(a.type)},findByName:function(a){var b=this.currentForm;return c(document.getElementsByName(a)).map(function(d,
e){return e.form==b&&e.name==a&&e||null})},getLength:function(a,b){switch(b.nodeName.toLowerCase()){case "select":return c("option:selected",b).length;case "input":if(this.checkable(b))return this.findByName(b.name).filter(":checked").length}return a.length},depend:function(a,b){return this.dependTypes[typeof a]?this.dependTypes[typeof a](a,b):true},dependTypes:{"boolean":function(a){return a},string:function(a,b){return!!c(a,b.form).length},"function":function(a,b){return a(b)}},optional:function(a){return!c.validator.methods.required.call(this,
c.trim(a.value),a)&&"dependency-mismatch"},startRequest:function(a){if(!this.pending[a.name]){this.pendingRequest++;this.pending[a.name]=true}},stopRequest:function(a,b){this.pendingRequest--;if(this.pendingRequest<0)this.pendingRequest=0;delete this.pending[a.name];if(b&&this.pendingRequest==0&&this.formSubmitted&&this.form()){c(this.currentForm).submit();this.formSubmitted=false}else if(!b&&this.pendingRequest==0&&this.formSubmitted){c(this.currentForm).triggerHandler("invalid-form",[this]);this.formSubmitted=
false}},previousValue:function(a){return c.data(a,"previousValue")||c.data(a,"previousValue",{old:null,valid:true,message:this.defaultMessage(a,"remote")})}},classRuleSettings:{required:{required:true},email:{email:true},url:{url:true},date:{date:true},dateISO:{dateISO:true},dateDE:{dateDE:true},number:{number:true},numberDE:{numberDE:true},digits:{digits:true},creditcard:{creditcard:true}},addClassRules:function(a,b){a.constructor==String?this.classRuleSettings[a]=b:c.extend(this.classRuleSettings,
a)},classRules:function(a){var b={};(a=c(a).attr("class"))&&c.each(a.split(" "),function(){this in c.validator.classRuleSettings&&c.extend(b,c.validator.classRuleSettings[this])});return b},attributeRules:function(a){var b={};a=c(a);for(var d in c.validator.methods){var e;if(e=d==="required"&&typeof c.fn.prop==="function"?a.prop(d):a.attr(d))b[d]=e;else if(a[0].getAttribute("type")===d)b[d]=true}b.maxlength&&/-1|2147483647|524288/.test(b.maxlength)&&delete b.maxlength;return b},metadataRules:function(a){if(!c.metadata)return{};
var b=c.data(a.form,"validator").settings.meta;return b?c(a).metadata()[b]:c(a).metadata()},staticRules:function(a){var b={},d=c.data(a.form,"validator");if(d.settings.rules)b=c.validator.normalizeRule(d.settings.rules[a.name])||{};return b},normalizeRules:function(a,b){c.each(a,function(d,e){if(e===false)delete a[d];else if(e.param||e.depends){var f=true;switch(typeof e.depends){case "string":f=!!c(e.depends,b.form).length;break;case "function":f=e.depends.call(b,b)}if(f)a[d]=e.param!==undefined?
e.param:true;else delete a[d]}});c.each(a,function(d,e){a[d]=c.isFunction(e)?e(b):e});c.each(["minlength","maxlength","min","max"],function(){if(a[this])a[this]=Number(a[this])});c.each(["rangelength","range"],function(){if(a[this])a[this]=[Number(a[this][0]),Number(a[this][1])]});if(c.validator.autoCreateRanges){if(a.min&&a.max){a.range=[a.min,a.max];delete a.min;delete a.max}if(a.minlength&&a.maxlength){a.rangelength=[a.minlength,a.maxlength];delete a.minlength;delete a.maxlength}}a.messages&&delete a.messages;
return a},normalizeRule:function(a){if(typeof a=="string"){var b={};c.each(a.split(/\s/),function(){b[this]=true});a=b}return a},addMethod:function(a,b,d){c.validator.methods[a]=b;c.validator.messages[a]=d!=undefined?d:c.validator.messages[a];b.length<3&&c.validator.addClassRules(a,c.validator.normalizeRule(a))},methods:{required:function(a,b,d){if(!this.depend(d,b))return"dependency-mismatch";switch(b.nodeName.toLowerCase()){case "select":return(a=c(b).val())&&a.length>0;case "input":if(this.checkable(b))return this.getLength(a,
b)>0;default:return c.trim(a).length>0}},remote:function(a,b,d){if(this.optional(b))return"dependency-mismatch";var e=this.previousValue(b);this.settings.messages[b.name]||(this.settings.messages[b.name]={});e.originalMessage=this.settings.messages[b.name].remote;this.settings.messages[b.name].remote=e.message;d=typeof d=="string"&&{url:d}||d;if(this.pending[b.name])return"pending";if(e.old===a)return e.valid;e.old=a;var f=this;this.startRequest(b);var g={};g[b.name]=a;c.ajax(c.extend(true,{url:d,
mode:"abort",port:"validate"+b.name,dataType:"json",data:g,success:function(h){f.settings.messages[b.name].remote=e.originalMessage;var j=h===true;if(j){var i=f.formSubmitted;f.prepareElement(b);f.formSubmitted=i;f.successList.push(b);f.showErrors()}else{i={};h=h||f.defaultMessage(b,"remote");i[b.name]=e.message=c.isFunction(h)?h(a):h;f.showErrors(i)}e.valid=j;f.stopRequest(b,j)}},d));return"pending"},minlength:function(a,b,d){return this.optional(b)||this.getLength(c.trim(a),b)>=d},maxlength:function(a,
b,d){return this.optional(b)||this.getLength(c.trim(a),b)<=d},rangelength:function(a,b,d){a=this.getLength(c.trim(a),b);return this.optional(b)||a>=d[0]&&a<=d[1]},min:function(a,b,d){return this.optional(b)||a>=d},max:function(a,b,d){return this.optional(b)||a<=d},range:function(a,b,d){return this.optional(b)||a>=d[0]&&a<=d[1]},email:function(a,b){return this.optional(b)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(a)},
url:function(a,b){return this.optional(b)||/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(a)},
date:function(a,b){return this.optional(b)||!/Invalid|NaN/.test(new Date(a))},dateISO:function(a,b){return this.optional(b)||/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(a)},number:function(a,b){return this.optional(b)||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(a)},digits:function(a,b){return this.optional(b)||/^\d+$/.test(a)},creditcard:function(a,b){if(this.optional(b))return"dependency-mismatch";if(/[^0-9 -]+/.test(a))return false;var d=0,e=0,f=false;a=a.replace(/\D/g,"");for(var g=a.length-1;g>=
0;g--){e=a.charAt(g);e=parseInt(e,10);if(f)if((e*=2)>9)e-=9;d+=e;f=!f}return d%10==0},accept:function(a,b,d){d=typeof d=="string"?d.replace(/,/g,"|"):"png|jpe?g|gif";return this.optional(b)||a.match(RegExp(".("+d+")$","i"))},equalTo:function(a,b,d){d=c(d).unbind(".validate-equalTo").bind("blur.validate-equalTo",function(){c(b).valid()});return a==d.val()}}});c.format=c.validator.format})(jQuery);
(function(c){var a={};if(c.ajaxPrefilter)c.ajaxPrefilter(function(d,e,f){e=d.port;if(d.mode=="abort"){a[e]&&a[e].abort();a[e]=f}});else{var b=c.ajax;c.ajax=function(d){var e=("port"in d?d:c.ajaxSettings).port;if(("mode"in d?d:c.ajaxSettings).mode=="abort"){a[e]&&a[e].abort();return a[e]=b.apply(this,arguments)}return b.apply(this,arguments)}}})(jQuery);
(function(c){!jQuery.event.special.focusin&&!jQuery.event.special.focusout&&document.addEventListener&&c.each({focus:"focusin",blur:"focusout"},function(a,b){function d(e){e=c.event.fix(e);e.type=b;return c.event.handle.call(this,e)}c.event.special[b]={setup:function(){this.addEventListener(a,d,true)},teardown:function(){this.removeEventListener(a,d,true)},handler:function(e){arguments[0]=c.event.fix(e);arguments[0].type=b;return c.event.handle.apply(this,arguments)}}});c.extend(c.fn,{validateDelegate:function(a,
b,d){return this.bind(b,function(e){var f=c(e.target);if(f.is(a))return d.apply(f,arguments)})}})})(jQuery);

;
/*! http://mths.be/placeholder v1.8.7 by @mathias */
;(function(window, document, $) {

	var isInputSupported = 'placeholder' in document.createElement('input'),
	    isTextareaSupported = 'placeholder' in document.createElement('textarea'),
	    prototype = $.fn,
	    placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = prototype.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		placeholder = prototype.placeholder = function() {
			return this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.placeholder')
				.bind('focus.placeholder', clearPlaceholder)
				.bind('blur.placeholder', setPlaceholder)
				.trigger('blur.placeholder').end();
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don’t get submitted
				var $inputs = $('.placeholder', this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('unload.placeholder', function() {
			$('.placeholder').val('');
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {},
		    rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder() {
		var $input = $(this);
		if ($input.val() === $input.attr('placeholder') && $input.hasClass('placeholder')) {
			if ($input.data('placeholder-password')) {
				$input.hide().next().show().focus().attr('id', $input.removeAttr('id').data('placeholder-id'));
			} else {
				$input.val('').removeClass('placeholder');
			}
		}
	}

	function setPlaceholder() {
		var $replacement,
		    $input = $(this),
		    $origInput = $input,
		    id = this.id;
		if ($input.val() === '') {
			if ($input.is(':password')) {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ 'type': 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}
					$replacement
						.removeAttr('name')
						// We could just use the `.data(obj)` syntax here, but that wouldn’t work in pre-1.4.3 jQueries
						.data('placeholder-password', true)
						.data('placeholder-id', id)
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data('placeholder-textinput', $replacement)
						.data('placeholder-id', id)
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
			}
			$input.addClass('placeholder').val($input.attr('placeholder'));
		} else {
			$input.removeClass('placeholder');
		}
	}

}(this, document, jQuery));
;
/* jquery.nicescroll 2.9.6 InuYaksa*2012 MIT http://areaaperta.com/nicescroll */(function(e){var o=false,q=false,t=5E3,u=2E3,v=function(){var e=document.getElementsByTagName("script"),e=e[e.length-1].src.split("?")[0];return e.split("/").length>0?e.split("/").slice(0,-1).join("/")+"/":""}(),n=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||false,p=window.cancelRequestAnimationFrame||window.webkitCancelRequestAnimationFrame||window.mozCancelRequestAnimationFrame||
window.oCancelRequestAnimationFrame||window.msCancelRequestAnimationFrame||false,z=function(f,d){function h(c,g,d){g=c.css(g);c=parseFloat(g);return isNaN(c)?(c=m[g]||0,d=c==3?d?b.win.outerHeight()-b.win.innerHeight():b.win.outerWidth()-b.win.innerWidth():1,b.isie8&&c&&(c+=1),d?c:0):c}var b=this;this.version="2.9.6";this.name="nicescroll";this.me=d;this.opt={doc:e("body"),win:false,zindex:9E3,cursoropacitymin:0,cursoropacitymax:1,cursorcolor:"#424242",cursorwidth:"5px",cursorborder:"1px solid #fff",
cursorborderradius:"5px",scrollspeed:60,mousescrollstep:40,touchbehavior:false,hwacceleration:true,usetransition:true,boxzoom:false,dblclickzoom:true,gesturezoom:true,grabcursorenabled:true,autohidemode:true,background:"",iframeautoresize:true,cursorminheight:20,preservenativescrolling:true,railoffset:false,bouncescroll:false,spacebarenabled:true,railpadding:{top:0,right:0,left:0,bottom:0},disableoutline:true};if(f)for(var i in b.opt)typeof f[i]!="undefined"&&(b.opt[i]=f[i]);this.iddoc=(this.doc=
b.opt.doc)&&this.doc[0]?this.doc[0].id||"":"";this.ispage=/BODY|HTML/.test(b.opt.win?b.opt.win[0].nodeName:this.doc[0].nodeName);this.haswrapper=b.opt.win!==false;this.win=b.opt.win||(this.ispage?e(window):this.doc);this.docscroll=this.ispage&&!this.haswrapper?e(window):this.win;this.body=e("body");this.iframe=false;this.isiframe=this.doc[0].nodeName=="IFRAME"&&this.win[0].nodeName=="IFRAME";this.istextarea=this.win[0].nodeName=="TEXTAREA";this.page=this.view=this.onclick=this.ongesturezoom=this.onkeypress=
this.onmousewheel=this.onmousemove=this.onmouseup=this.onmousedown=false;this.scroll={x:0,y:0};this.scrollratio={x:0,y:0};this.cursorheight=20;this.scrollvaluemax=0;this.scrollmom=false;do this.id="ascrail"+u++;while(document.getElementById(this.id));this.hasmousefocus=this.hasfocus=this.zoomactive=this.zoom=this.cursorfreezed=this.cursor=this.rail=false;this.visibility=true;this.nativescrollingarea=this.hidden=this.locked=false;this.events=[];this.saved={};this.delaylist={};this.synclist={};this.lastdelta=
0;var j=document.createElement("DIV");this.isopera="opera"in window;this.isieold=(this.isie="all"in document&&"attachEvent"in j&&!this.isopera)&&!("msInterpolationMode"in j.style);this.isie7=this.isie&&!this.isieold&&(!("documentMode"in document)||document.documentMode==7);this.isie8=this.isie&&"documentMode"in document&&document.documentMode==8;this.isie9=this.isie&&"performance"in window&&document.documentMode>=9;this.isie9mobile=/iemobile.9/i.test(navigator.userAgent);this.isie7mobile=!this.isie9mobile&&
this.isie7&&/iemobile/i.test(navigator.userAgent);this.ismozilla="MozAppearance"in j.style;this.ischrome="chrome"in window;this.cantouch="ontouchstart"in document.documentElement;this.hasmstouch=window.navigator.msPointerEnabled||false;this.isios4=(this.isios=this.cantouch&&/iphone|ipad|ipod/i.test(navigator.platform))&&!("seal"in Object);if(b.opt.hwacceleration){if((this.trstyle=window.opera?"OTransform":document.all?"msTransform":j.style.webkitTransform!==void 0?"webkitTransform":j.style.MozTransform!==
void 0?"MozTransform":false)&&typeof j.style[this.trstyle]=="undefined")this.trstyle=false;if(this.hastransform=this.trstyle!=false)j.style[this.trstyle]="translate3d(1px,2px,3px)",this.hastranslate3d=/translate3d/.test(j.style[this.trstyle]);this.transitionstyle=false;this.prefixstyle="";this.transitionend=false;var r="transition,webkitTransition,MozTransition,OTransition,msTransition,KhtmlTransition".split(","),x=",-webkit-,-moz-,-o-,-ms-,-khtml-".split(","),l="transitionEnd,webkitTransitionEnd,transitionend,oTransitionEnd,msTransitionEnd,KhtmlTransitionEnd".split(",");
for(i=0;i<r.length;i++)if(r[i]in j.style){this.transitionstyle=r[i];this.prefixstyle=x[i];this.transitionend=l[i];break}this.hastransition=this.transitionstyle}else this.transitionend=this.hastransition=this.transitionstyle=this.hastranslate3d=this.hastransform=this.trstyle=false;this.cursorgrabvalue="";if(b.opt.grabcursorenabled&&b.opt.touchbehavior)this.cursorgrabvalue=function(){var c=["-moz-grab","-webkit-grab","grab"];if(b.ischrome||b.isie)c=[];for(var g=0;g<c.length;g++){var d=c[g];j.style.cursor=
d;if(j.style.cursor==d)return d}return"url(http://www.google.com/intl/en_ALL/mapfiles/openhand.cur),n-resize"}();j=null;this.ishwscroll=b.hastransform&&b.opt.hwacceleration&&b.haswrapper;this.delayed=function(c,g,d){var e=b.delaylist[c],f=(new Date).getTime();if(e&&e.tt)return false;if(e&&e.last+d>f&&!e.tt)b.delaylist[c]={last:f+d,tt:setTimeout(function(){b.delaylist[c].tt=0;g.call()},d)};else if(!e||!e.tt)b.delaylist[c]={last:f,tt:0},setTimeout(function(){g.call()},0)};this.requestSync=function(){if(!b.onsync)n(function(){b.onsync=
false;for(name in b.synclist){var c=b.synclist[name];c&&c.call(b);b.synclist[name]=false}}),b.onsync=true};this.synched=function(c,g){b.synclist[c]=g;b.requestSync()};this.css=function(c,g){for(var d in g)b.saved.css.push([c,d,c.css(d)]),c.css(d,g[d])};this.scrollTop=function(c){return typeof c=="undefined"?b.getScrollTop():b.setScrollTop(c)};BezierClass=function(b,d,e,k,f,h,y){this.st=b;this.ed=d;this.spd=e;this.p1=k||0;this.p2=f||1;this.p3=h||0;this.p4=y||1;this.ts=(new Date).getTime();this.df=
this.ed-this.st};BezierClass.prototype={B2:function(b){return 3*b*b*(1-b)},B3:function(b){return 3*b*(1-b)*(1-b)},B4:function(b){return(1-b)*(1-b)*(1-b)},getNow:function(){var b=1-((new Date).getTime()-this.ts)/this.spd,d=this.B2(b)+this.B3(b)+this.B4(b);return b<0?this.ed:this.st+Math.round(this.df*d)},update:function(b,d){this.st=this.getNow();this.ed=b;this.spd=d;this.ts=(new Date).getTime();this.df=this.ed-this.st;return this}};this.ishwscroll?(this.doc.translate={x:0,y:0},this.hastranslate3d&&
this.doc.css(this.prefixstyle+"backface-visibility","hidden"),this.getScrollTop=function(c){return b.timerscroll&&!c?b.timerscroll.bz.getNow():b.doc.translate.y},this.notifyScrollEvent=document.createEvent?function(b){var d=document.createEvent("UIEvents");d.initUIEvent("scroll",false,true,window,1);b.dispatchEvent(d)}:document.fireEvent?function(b){var d=document.createEventObject();b.fireEvent("onscroll");d.cancelBubble=true}:function(){},this.setScrollTop=this.hastranslate3d?function(c,d){b.doc.css(b.trstyle,
"translate3d(0px,"+c*-1+"px,0px)");b.doc.translate.y=c;d||b.notifyScrollEvent(b.win[0])}:function(c,d){b.doc.css(b.trstyle,"translate(0px,"+c*-1+"px)");b.doc.translate.y=c;d||b.notifyScrollEvent(b.win[0])}):(this.getScrollTop=function(){return b.docscroll.scrollTop()},this.setScrollTop=function(c){return b.docscroll.scrollTop(c)});this.getTarget=function(b){return!b?false:b.target?b.target:b.srcElement?b.srcElement:false};this.hasParent=function(b,d){if(!b)return false;for(var e=b.target||b.srcElement||
b||false;e&&e.id!=d;)e=e.parentNode||false;return e!==false};var m={thin:1,medium:3,thick:5};this.updateScrollBar=function(c){if(b.ishwscroll)b.rail.css({height:b.win.innerHeight()});else{var d=b.win.offset();d.top+=h(b.win,"border-top-width",true);d.left+=b.win.outerWidth()-h(b.win,"border-right-width",false)-b.rail.width;var e=b.opt.railoffset;e&&(e.top&&(d.top+=e.top),e.left&&(d.left+=e.left));b.rail.css({top:d.top,left:d.left,height:c?c.h:b.win.innerHeight()});b.zoom&&b.zoom.css({top:d.top+1,
left:d.left-20})}};b.hasanimationframe=n;b.hascancelanimationframe=p;b.hasanimationframe?b.hascancelanimationframe||(p=function(){b.cancelAnimationFrame=true}):(n=function(b){return setTimeout(b,16)},p=clearInterval);this.init=function(){b.saved.css=[];if(b.isie7mobile)return true;b.hasmstouch&&b.css(b.ispage?e("html"):b.win,{"-ms-touch-action":"none"});if(!b.ispage||!b.cantouch&&!b.isieold&&!b.isie9mobile){var c=b.docscroll;b.ispage&&(c=b.haswrapper?b.win:b.doc);b.isie9mobile||b.css(c,{"overflow-y":"hidden"});
b.ispage&&b.isie7&&b.win[0].nodeName=="BODY"&&b.css(e("html"),{"overflow-y":"hidden"});var d=e(document.createElement("div"));d.css({position:"relative",top:0,"float":"right",width:b.opt.cursorwidth,height:"0px","background-color":b.opt.cursorcolor,border:b.opt.cursorborder,"background-clip":"padding-box","-webkit-border-radius":b.opt.cursorborderradius,"-moz-border-radius":b.opt.cursorborderradius,"border-radius":b.opt.cursorborderradius});d.hborder=parseFloat(d.outerHeight()-d.innerHeight());b.cursor=
d;c=e(document.createElement("div"));c.attr("id",b.id);c.width=Math.max(parseFloat(b.opt.cursorwidth),d.outerWidth());c.css({width:c.width+"px",zIndex:b.ispage?b.opt.zindex:b.opt.zindex+2,background:b.opt.background});var w=["top","bottom","left","right"],k;for(k in w){var f=b.opt.railpadding[k];f&&c.css("padding-"+k,f+"px")}c.append(d);b.rail=c;k=b.rail.drag=false;if(b.opt.boxzoom&&!b.ispage&&!b.isieold&&(k=document.createElement("div"),b.bind(k,"click",b.doZoom),b.zoom=e(k),b.zoom.css({cursor:"pointer",
"z-index":b.opt.zindex,backgroundImage:"url("+v+"zoomico.png)",height:18,width:18,backgroundPosition:"0px 0px"}),b.opt.dblclickzoom&&b.bind(b.win,"dblclick",b.doZoom),b.cantouch&&b.opt.gesturezoom))b.ongesturezoom=function(c){c.scale>1.5&&b.doZoomIn(c);c.scale<0.8&&b.doZoomOut(c);return b.cancelEvent(c)},b.bind(b.win,"gestureend",b.ongesturezoom);b.ispage?(c.css({position:"fixed",top:"0px",right:"0px",height:"100%"}),b.body.append(c)):(b.ishwscroll?(b.win.css("position")=="static"&&b.css(b.win,{position:"relative"}),
k=b.win[0].nodeName=="HTML"?b.body:b.win,b.zoom&&(b.zoom.css({position:"absolute",top:1,right:0,"margin-right":c.width+4}),k.append(b.zoom)),c.css({position:"absolute",top:0,right:0}),k.append(c)):(c.css({position:"absolute"}),b.zoom&&b.zoom.css({position:"absolute"}),b.updateScrollBar(),b.body.append(c),b.zoom&&b.body.append(b.zoom)),b.isios&&b.css(b.win,{"-webkit-tap-highlight-color":"rgba(0,0,0,0)","-webkit-touch-callout":"none"}));if(b.opt.autohidemode===false)b.autohidedom=false;else if(b.opt.autohidemode===
true)b.autohidedom=b.rail;else if(b.opt.autohidemode=="cursor")b.autohidedom=b.cursor;if(b.isie9mobile)b.scrollmom={y:new s(b)},b.onmangotouch=function(){var c=b.getScrollTop();if(c==b.scrollmom.y.lastscrolly)return true;var d=c-b.mangotouch.sy;if(d!=0){var e=d<0?-1:1,g=(new Date).getTime();b.mangotouch.lazy&&clearTimeout(b.mangotouch.lazy);if(g-b.mangotouch.tm>60||b.mangotouch.dry!=e)b.scrollmom.y.stop(),b.scrollmom.y.reset(c),b.mangotouch.sy=c,b.mangotouch.ly=c,b.mangotouch.dry=e,b.mangotouch.tm=
g;else{b.scrollmom.y.stop();b.scrollmom.y.update(b.mangotouch.sy-d);var f=g-b.mangotouch.tm;b.mangotouch.tm=g;d=Math.abs(b.mangotouch.ly-c);b.mangotouch.ly=c;if(d>2)b.mangotouch.lazy=setTimeout(function(){b.mangotouch.lazy=false;b.mangotouch.dry=0;b.mangotouch.tm=0;b.scrollmom.y.doMomentum(f)},80)}}},c=b.getScrollTop(),b.mangotouch={sy:c,ly:c,dry:0,lazy:false,tm:0},b.bind(b.docscroll,"scroll",b.onmangotouch);else{if(b.cantouch||b.opt.touchbehavior||b.hasmstouch)b.scrollmom={y:new s(b)},b.ontouchstart=
function(c){if(c.pointerType&&c.pointerType!=2)return false;if(!b.locked){if(b.hasmstouch)for(var d=c.target?c.target:false;d;){var g=e(d).getNiceScroll();if(g.length>0&&g[0].me==b.me)break;if(g.length>0)return false;if(d.nodeName=="DIV"&&d.id==b.id)break;d=d.parentNode?d.parentNode:false}b.cancelScroll();b.rail.drag={x:c.clientX,y:c.clientY,sx:b.scroll.x,sy:b.scroll.y,st:b.getScrollTop(),pt:2};b.hasmoving=false;b.lastmouseup=false;b.scrollmom.y.reset(c.clientY);if(!b.cantouch&&!b.hasmstouch){d=b.getTarget(c);
if(!d||!/INPUT|SELECT|TEXTAREA/i.test(d.nodeName))return b.cancelEvent(c);if(/SUBMIT|CANCEL|BUTTON/i.test(e(d).attr("type")))pc={tg:d,click:false},b.preventclick=pc}}},b.ontouchend=function(c){if(c.pointerType&&c.pointerType!=2)return false;if(b.rail.drag&&b.rail.drag.pt==2&&(b.scrollmom.y.doMomentum(),b.rail.drag=false,b.hasmoving&&(b.hasmoving=false,b.lastmouseup=true,b.hideCursor(),!b.cantouch)))return b.cancelEvent(c)},b.ontouchmove=function(c){if(c.pointerType&&c.pointerType!=2)return false;
if(b.rail.drag&&b.rail.drag.pt==2){if(b.cantouch&&typeof c.original=="undefined")return true;b.hasmoving=true;if(b.preventclick&&!b.preventclick.click)b.preventclick.click=b.preventclick.tg.onclick||false,b.preventclick.tg.onclick=b.onpreventclick;var d=c.clientY,g=b.rail.drag.st-(d-b.rail.drag.y);if(b.ishwscroll)g<0?(g=Math.round(g/2),d=0):g>b.page.maxh&&(g=b.page.maxh+Math.round((g-b.page.maxh)/2),d=0);else if(g<0&&(g=0),g>b.page.maxh)g=b.page.maxh;b.synched("touchmove",function(){b.rail.drag&&
b.rail.drag.pt==2&&(b.prepareTransition&&b.prepareTransition(0),b.setScrollTop(g),b.showCursor(g),b.scrollmom.y.update(d))});return b.cancelEvent(c)}};b.cantouch||b.opt.touchbehavior?(b.onpreventclick=function(c){if(b.preventclick)return b.preventclick.tg.onclick=b.preventclick.click,b.preventclick=false,b.cancelEvent(c)},b.onmousedown=b.ontouchstart,b.onmouseup=b.ontouchend,b.onclick=b.isios?false:function(c){return b.lastmouseup?(b.lastmouseup=false,b.cancelEvent(c)):true},b.onmousemove=b.ontouchmove,
b.cursorgrabvalue&&(b.css(b.ispage?b.doc:b.win,{cursor:b.cursorgrabvalue}),b.css(b.rail,{cursor:b.cursorgrabvalue}))):(b.onmousedown=function(c){if(!(b.rail.drag&&b.rail.drag.pt!=1)){if(b.locked)return b.cancelEvent(c);b.cancelScroll();b.rail.drag={x:c.clientX,y:c.clientY,sx:b.scroll.x,sy:b.scroll.y,pt:1};return b.cancelEvent(c)}},b.onmouseup=function(c){if(b.rail.drag&&b.rail.drag.pt==1)return b.rail.drag=false,b.cancelEvent(c)},b.onmousemove=function(c){if(b.rail.drag){if(b.rail.drag.pt==1){b.scroll.y=
b.rail.drag.sy+(c.clientY-b.rail.drag.y);if(b.scroll.y<0)b.scroll.y=0;var d=b.scrollvaluemax;if(b.scroll.y>d)b.scroll.y=d;b.synched("mousemove",function(){if(b.rail.drag&&b.rail.drag.pt==1)b.showCursor(),b.cursorfreezed=true,b.doScroll(Math.round(b.scroll.y*b.scrollratio.y))});return b.cancelEvent(c)}}else b.checkarea=true});(b.cantouch||b.opt.touchbehavior)&&b.bind(b.win,"mousedown",b.onmousedown);b.hasmstouch&&(b.css(b.rail,{"-ms-touch-action":"none"}),b.css(b.cursor,{"-ms-touch-action":"none"}),
b.bind(b.win,"MSPointerDown",b.ontouchstart),b.bind(document,"MSPointerUp",b.ontouchend),b.bind(document,"MSPointerMove",b.ontouchmove),b.bind(b.cursor,"MSGestureHold",function(b){b.preventDefault()}),b.bind(b.cursor,"contextmenu",function(b){b.preventDefault()}));b.bind(b.cursor,"mousedown",b.onmousedown);b.bind(b.cursor,"mouseup",function(c){if(!(b.rail.drag&&b.rail.drag.pt==2))return b.rail.drag=false,b.hasmoving=false,b.hideCursor(),b.cancelEvent(c)});b.bind(document,"mouseup",b.onmouseup);b.bind(document,
"mousemove",b.onmousemove);b.onclick&&b.bind(document,"click",b.onclick);b.cantouch||(b.rail.mouseenter(function(){b.showCursor();b.rail.active=true}),b.rail.mouseleave(function(){b.rail.active=false;b.rail.drag||b.hideCursor()}),b.isiframe||b.bind(b.isie&&b.ispage?document:b.docscroll,"mousewheel",b.onmousewheel),b.bind(b.rail,"mousewheel",b.onmousewheel));b.zoom&&(b.zoom.mouseenter(function(){b.showCursor();b.rail.active=true}),b.zoom.mouseleave(function(){b.rail.active=false;b.rail.drag||b.hideCursor()}));
!b.ispage&&!b.cantouch&&!/HTML|BODY/.test(b.win[0].nodeName)&&(b.win.attr("tabindex")||b.win.attr({tabindex:t++}),b.ischrome&&b.opt.disableoutline&&b.win.css({outline:"none"}),b.win.focus(function(c){o=b.getTarget(c).id||true;b.hasfocus=true;b.noticeCursor()}),b.win.blur(function(){o=false;b.hasfocus=false}),b.win.mouseenter(function(c){q=b.getTarget(c).id||true;b.hasmousefocus=true;b.noticeCursor()}),b.win.mouseleave(function(){q=false;b.hasmousefocus=false}))}b.onkeypress=function(c){if(b.locked&&
b.page.maxh==0)return true;var c=c?c:window.e,d=b.getTarget(c);if(d&&/INPUT|TEXTAREA|SELECT|OPTION/.test(d.nodeName)&&(!d.getAttribute("type")&&!d.type||!/submit|button|cancel/i.tp))return true;if(b.hasfocus||b.hasmousefocus&&!o||b.ispage&&!o&&!q){d=c.keyCode;if(b.locked&&d!=27)return b.cancelEvent(c);var g=false;switch(d){case 38:case 63233:b.doScrollBy(72);g=true;break;case 40:case 63235:b.doScrollBy(-72);g=true;break;case 33:case 63276:b.doScrollBy(b.view.h);g=true;break;case 34:case 63277:b.doScrollBy(-b.view.h);
g=true;break;case 36:case 63273:b.doScrollTo(0);g=true;break;case 35:case 63275:b.doScrollTo(b.page.maxh);g=true;break;case 32:b.opt.spacebarenabled&&(b.doScrollBy(-b.view.h),g=true);break;case 27:b.zoomactive&&(b.doZoom(),g=true)}if(g)return b.cancelEvent(c)}};b.bind(document,b.isopera?"keypress":"keydown",b.onkeypress);b.bind(window,"resize",b.resize);b.bind(window,"orientationchange",b.resize);b.bind(window,"load",b.resize);b.onAttributeChange=function(){b.lazyResize()};!b.ispage&&!b.haswrapper&&
("WebKitMutationObserver"in window?(new WebKitMutationObserver(function(c){c.forEach(b.onAttributeChange)})).observe(b.win[0],{attributes:true,subtree:false}):(b.bind(b.win,b.isie&&!b.isie9?"propertychange":"DOMAttrModified",b.onAttributeChange),b.isie9&&b.win[0].attachEvent("onpropertychange",b.onAttributeChange)));!b.ispage&&b.opt.boxzoom&&b.bind(window,"resize",b.resizeZoom);b.istextarea&&b.bind(b.win,"mouseup",b.resize);b.resize()}if(this.doc[0].nodeName=="IFRAME"){var h=function(){b.iframexd=
false;try{var c="contentDocument"in this?this.contentDocument:this.contentWindow.document}catch(d){b.iframexd=true,c=false}if(b.iframexd)return true;if(b.isiframe)b.iframe={html:b.doc.contents().find("html")[0],body:b.doc.contents().find("body")[0]},b.getContentSize=function(){return{w:Math.max(b.iframe.html.scrollWidth,b.iframe.body.scrollWidth),h:Math.max(b.iframe.html.scrollHeight,b.iframe.body.scrollHeight)}},b.docscroll=e(this.contentWindow);if(b.opt.iframeautoresize&&!b.isiframe){b.win.scrollTop(0);
b.doc.height("");var g=Math.max(c.getElementsByTagName("html")[0].scrollHeight,c.body.scrollHeight);b.doc.height(g)}b.resize();b.isie7&&b.css(e(c).find("html"),{"overflow-y":"hidden"});b.css(e(c.body),{"overflow-y":"hidden"});"contentWindow"in this?b.bind(this.contentWindow,"scroll",b.onscroll):b.bind(c,"scroll",b.onscroll);b.bind(c,"mouseup",b.onmouseup);b.bind(c,"mousewheel",b.onmousewheel);b.bind(c,b.isopera?"keypress":"keydown",b.onkeypress);if(b.cantouch||b.opt.touchbehavior)b.bind(c,"mousedown",
b.onmousedown),b.cursorgrabvalue&&b.css(e(c.body),{cursor:b.cursorgrabvalue});b.bind(c,"mousemove",b.onmousemove);b.zoom&&(b.opt.dblclickzoom&&b.bind(c,"dblclick",b.doZoom),b.ongesturezoom&&b.bind(c,"gestureend",b.ongesturezoom))};this.doc[0].readyState&&this.doc[0].readyState=="complete"&&setTimeout(function(){h.call(b.doc[0],false)},500);b.bind(this.doc,"load",h)}};this.showCursor=function(c){if(b.cursortimeout)clearTimeout(b.cursortimeout),b.cursortimeout=0;if(b.rail){b.autohidedom&&b.autohidedom.stop().css({opacity:b.opt.cursoropacitymax});
if(typeof c!="undefined")b.scroll.y=Math.round(c*1/b.scrollratio.y);b.cursor.css({height:b.cursorheight,top:b.scroll.y});b.zoom&&b.zoom.stop().css({opacity:b.opt.cursoropacitymax})}};this.hideCursor=function(c){if(!b.cursortimeout&&b.rail&&b.autohidedom)b.cursortimeout=setTimeout(function(){b.rail.active||(b.autohidedom.stop().animate({opacity:b.opt.cursoropacitymin}),b.zoom&&b.zoom.stop().animate({opacity:b.opt.cursoropacitymin}));b.cursortimeout=0},c||400)};this.noticeCursor=function(c,d){b.showCursor(d);
b.hideCursor(c)};this.getContentSize=b.ispage?function(){return{w:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)}}:b.haswrapper?function(){return{w:b.doc.outerWidth()+parseInt(b.win.css("paddingLeft"))+parseInt(b.win.css("paddingRight")),h:b.doc.outerHeight()+parseInt(b.win.css("paddingTop"))+parseInt(b.win.css("paddingBottom"))}}:function(){return{w:b.docscroll[0].scrollWidth,h:b.docscroll[0].scrollHeight}};
this.resize=this.onResize=function(c,d){if(!b.haswrapper&&!b.ispage)if(b.win.css("display")=="none")return b.visibility&&b.hideRail(),false;else!b.visibility&&b.getScrollTop()==0&&b.doScrollTo(Math.floor(b.scroll.y*b.scrollratio.y)),!b.hidden&&!b.visibility&&b.showRail();var e=b.page.maxh,f=b.page.maxw,h=b.view.w;b.view={w:b.ispage?b.win.width():parseInt(b.win[0].clientWidth),h:b.ispage?b.win.height():parseInt(b.win[0].clientHeight)};b.page=d?d:b.getContentSize();b.page.maxh=Math.max(0,b.page.h-b.view.h);
b.page.maxw=Math.max(0,b.page.w-b.view.w);if(b.page.maxh==e&&b.page.maxw==f&&b.view.w==h)if(b.ispage)return b;else{e=b.win.offset();if(b.lastposition&&(f=b.lastposition,f.top==e.top&&f.left==e.left))return b;b.lastposition=e}if(b.page.maxh==0)return b.hideRail(),b.scrollvaluemax=0,b.scroll.y=0,b.scrollratio={x:0,y:0},b.cursorheight=0,b.locked=true,b.setScrollTop(0),false;else if(!b.hidden&&!b.visibility)b.showRail(),b.locked=false;b.istextarea&&b.win.css("resize")&&b.win.css("resize")!="none"&&(b.view.h-=
20);b.ispage||b.updateScrollBar(b.view);b.cursorheight=Math.min(b.view.h,Math.round(b.view.h*(b.view.h/b.page.h)));b.cursorheight=Math.max(b.opt.cursorminheight,b.cursorheight);b.scrollvaluemax=b.view.h-b.cursorheight-b.cursor.hborder;b.scrollratio={x:0,y:b.page.maxh/b.scrollvaluemax};b.getScrollTop()>b.page.maxh?b.doScroll(b.page.maxh):(b.scroll.y=Math.round(b.getScrollTop()*(1/b.scrollratio.y)),b.noticeCursor());return b};this.lazyResize=function(){b.delayed("resize",b.resize,250)};this._bind=function(c,
d,e,f){b.events.push({e:c,n:d,f:e});c.addEventListener?c.addEventListener(d,e,f||false):c.attachEvent?c.attachEvent("on"+d,e):c["on"+d]=e};this.bind=function(c,d,e,f){var h="jquery"in c?c[0]:c;h.addEventListener?(b.cantouch&&/mouseup|mousedown|mousemove/.test(d)&&b._bind(h,d=="mousedown"?"touchstart":d=="mouseup"?"touchend":"touchmove",function(b){if(b.touches){if(b.touches.length<2){var c=b.touches.length?b.touches[0]:b;c.original=b;e.call(this,c)}}else if(b.changedTouches)c=b.changedTouches[0],
c.original=b,e.call(this,c)},f||false),b._bind(h,d,e,f||false),d=="mousewheel"&&b._bind(h,"DOMMouseScroll",e,f||false),b.cantouch&&d=="mouseup"&&b._bind(h,"touchcancel",e,f||false)):b._bind(h,d,function(c){if((c=c||window.event||false)&&c.srcElement)c.target=c.srcElement;return e.call(h,c)===false||f===false?b.cancelEvent(c):true})};this._unbind=function(b,d,e){b.removeEventListener?b.removeEventListener(d,e,false):b.detachEvent?b.detachEvent("on"+d,e):b["on"+d]=false};this.unbindAll=function(){for(var c=
0;c<b.events.length;c++){var d=b.events[c];b._unbind(d.e,d.n,d.f)}};this.cancelEvent=function(b){b=b.original?b.original:b?b:window.event||false;if(!b)return false;b.preventDefault&&b.preventDefault();b.stopPropagation&&b.stopPropagation();b.preventManipulation&&b.preventManipulation();b.cancelBubble=true;b.cancel=true;return b.returnValue=false};this.showRail=function(){if(b.page.maxh!=0&&(b.ispage||b.win.css("display")!="none"))b.visibility=true,b.rail.css("display","block");return b};this.hideRail=
function(){b.visibility=false;b.rail.css("display","none");return b};this.show=function(){b.hidden=false;b.locked=false;return b.showRail()};this.hide=function(){b.hidden=true;b.locked=true;return b.hideRail()};this.remove=function(){b.doZoomOut();b.unbindAll();b.events=[];b.rail.remove();b.zoom&&b.zoom.remove();b.cursor=false;b.rail=false;b.zoom=false;for(var c=0;c<b.saved.css.length;c++){var d=b.saved.css[c];d[0].css(d[1],typeof d[2]=="undefined"?"":d[2])}b.saved=false;b.me.data("__nicescroll",
"");return b};this.isScrollable=function(b){for(b=b.target?b.target:b;b&&b.nodeName&&!/BODY|HTML/.test(b.nodeName);){var d=e(b);if(/scroll|auto/.test(d.css("overflowY")||d.css("overflow")||""))return b.clientHeight!=b.scrollHeight;b=b.parentNode?b.parentNode:false}return false};this.onmousewheel=function(c){if(b.locked&&b.page.maxh==0)return true;if(b.opt.preservenativescrolling&&b.checkarea)b.checkarea=false,b.nativescrollingarea=b.isScrollable(c);if(b.nativescrollingarea)return true;if(b.locked)return b.cancelEvent(c);
if(b.rail.drag)return b.cancelEvent(c);var d=0;if(d=c.detail?c.detail*-1:c.wheelDelta/40)b.scrollmom&&b.scrollmom.y.stop(),b.lastdelta+=d*b.opt.mousescrollstep,b.synched("mousewheel",function(){if(!b.rail.drag){var c=b.lastdelta;b.lastdelta=0;b.doScrollBy(c)}});return b.cancelEvent(c)};this.stop=function(){b.cancelScroll();b.scrollmon&&b.scrollmon.stop();b.cursorfreezed=false;b.scroll.y=Math.round(b.getScrollTop()*(1/b.scrollratio.y));b.noticeCursor();return b};b.ishwscroll&&b.hastransition&&b.opt.usetransition?
(this.prepareTransition=function(c){var d=Math.round(b.opt.scrollspeed*10),c=Math.min(d,Math.round(c/20*b.opt.scrollspeed)),d=c>20?b.prefixstyle+"transform "+c+"ms ease-out 0s":"";if(!b.lasttransitionstyle||b.lasttransitionstyle!=d)b.lasttransitionstyle=d,b.doc.css(b.transitionstyle,d);return c},this.doScroll=function(c,d){var e=b.getScrollTop();if(c<0&&e<=0)return b.noticeCursor();else if(c>b.page.maxh&&e>=b.page.maxh)return b.checkContentSize(),b.noticeCursor();b.newscrolly=c;b.newscrollspeed=d||
false;if(b.timer)return false;if(!b.scrollendtrapped)b.scrollendtrapped=true,b.bind(b.doc,b.transitionend,b.onScrollEnd,false);b.timer=setTimeout(function(){var c=b.getScrollTop(),c=b.newscrollspeed?b.newscrollspeed:Math.abs(c-b.newscrolly),d=b.prepareTransition(c);b.timer=setTimeout(function(){if(b.newscrolly<0&&!b.opt.bouncescroll)b.newscrolly=0;else if(b.newscrolly>b.page.maxh&&!b.opt.bouncescroll)b.newscrolly=b.page.maxh;if(b.newscrolly==b.getScrollTop())b.timer=0,b.onScrollEnd();else{var c=b.getScrollTop();
b.timerscroll&&b.timerscroll.tm&&clearInterval(b.timerscroll.tm);if(d>0&&(b.timerscroll={ts:(new Date).getTime(),s:b.getScrollTop(),e:b.newscrolly,sp:d,bz:new BezierClass(c,b.newscrolly,d,0,1,0,1)},!b.cursorfreezed))b.timerscroll.tm=setInterval(function(){b.showCursor(b.getScrollTop())},60);b.setScrollTop(b.newscrolly);b.timer=0}},15)},b.opt.scrollspeed)},this.cancelScroll=function(){if(!b.scrollendtrapped)return true;var c=b.getScrollTop();b.scrollendtrapped=false;b._unbind(b.doc,b.transitionend,
b.onScrollEnd);b.prepareTransition(0);b.setScrollTop(c);b.timerscroll&&b.timerscroll.tm&&clearInterval(b.timerscroll.tm);b.timerscroll=false;b.cursorfreezed=false;b.noticeCursor(false,c);return b},this.onScrollEnd=function(){b.scrollendtrapped=false;b._unbind(b.doc,b.transitionend,b.onScrollEnd);b.timerscroll&&b.timerscroll.tm&&clearInterval(b.timerscroll.tm);b.timerscroll=false;b.cursorfreezed=false;var c=b.getScrollTop();b.setScrollTop(c);b.noticeCursor(false,c);c<0?b.doScroll(0,60):c>b.page.maxh&&
b.doScroll(b.page.maxh,60)}):(this.doScroll=function(c){function d(){if(b.cancelAnimationFrame)return true;if(h=1-h)return b.timer=n(d)||1;var c=b.getScrollTop(),e=b.bzscroll?b.bzscroll.getNow():b.newscrolly,c=e-c;if(c<0&&e<b.newscrolly||c>0&&e>b.newscrolly)e=b.newscrolly;b.setScrollTop(e);e==b.newscrolly?(b.timer=0,b.cursorfreezed=false,b.bzscroll=false,e<0?b.doScroll(0):e>b.page.maxh&&b.doScroll(b.page.maxh)):b.timer=n(d)||1}if(b.newscrolly==c)return true;var e=b.getScrollTop();b.newscrolly=c;if(!b.bouncescroll)if(b.newscrolly<
0){if(b.newspeedy)b.newspeedy.x=0;b.newscrolly=0}else if(b.newscrolly>b.page.maxh){if(b.newspeedy)b.newspeedy.x=b.page.maxh;b.newscrolly=b.page.maxh}var f=Math.floor(Math.abs(c-e)/40);f>0?(f=Math.min(10,f)*100,b.bzscroll=b.bzscroll?b.bzscroll.update(c,f):new BezierClass(e,c,f,0,1,0,1)):b.bzscroll=false;if(!b.timer){e==b.page.maxh&&c>=b.page.maxh&&b.checkContentSize();var h=1;b.cancelAnimationFrame=false;b.timer=1;d();e==b.page.maxh&&c>=e&&b.checkContentSize();b.noticeCursor()}},this.cancelScroll=
function(){b.timer&&p(b.timer);b.timer=0;b.bzscroll=false;return b});this.doScrollBy=function(c,d){var e=0,e=d?Math.floor((b.scroll.y-c)*b.scrollratio.y):(b.timer?b.newscrolly:b.getScrollTop(true))-c;if(b.bouncescroll){var f=Math.round(b.view.h/2);e<-f?e=-f:e>b.page.maxh+f&&(e=b.page.maxh+f)}b.cursorfreezed=false;b.doScroll(e)};this.doScrollTo=function(c,d){d&&Math.round(c*b.scrollratio.y);b.cursorfreezed=false;b.doScroll(c)};this.checkContentSize=function(){var c=b.getContentSize();c.h!=b.page.h&&
b.resize(false,c)};b.onscroll=function(){b.rail.drag||b.cursorfreezed||b.synched("scroll",function(){b.scroll.y=Math.round(b.getScrollTop()*(1/b.scrollratio.y));b.noticeCursor()})};b.bind(b.docscroll,"scroll",b.onscroll);this.doZoomIn=function(c){if(!b.zoomactive){b.zoomactive=true;b.zoomrestore={style:{}};var d="position,top,left,zIndex,backgroundColor,marginTop,marginBottom,marginLeft,marginRight".split(","),f=b.win[0].style,h;for(h in d){var i=d[h];b.zoomrestore.style[i]=typeof f[i]!="undefined"?
f[i]:""}b.zoomrestore.style.width=b.win.css("width");b.zoomrestore.style.height=b.win.css("height");b.zoomrestore.padding={w:b.win.outerWidth()-b.win.width(),h:b.win.outerHeight()-b.win.height()};if(b.isios4)b.zoomrestore.scrollTop=e(window).scrollTop(),e(window).scrollTop(0);b.win.css({position:b.isios4?"absolute":"fixed",top:0,left:0,"z-index":b.opt.zindex+100,margin:"0px"});d=b.win.css("backgroundColor");(d==""||/transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(d))&&b.win.css("backgroundColor",
"#fff");b.rail.css({"z-index":b.opt.zindex+110});b.zoom.css({"z-index":b.opt.zindex+112});b.zoom.css("backgroundPosition","0px -18px");b.resizeZoom();return b.cancelEvent(c)}};this.doZoomOut=function(c){if(b.zoomactive)return b.zoomactive=false,b.win.css("margin",""),b.win.css(b.zoomrestore.style),b.isios4&&e(window).scrollTop(b.zoomrestore.scrollTop),b.rail.css({"z-index":b.ispage?b.opt.zindex:b.opt.zindex+2}),b.zoom.css({"z-index":b.opt.zindex}),b.zoomrestore=false,b.zoom.css("backgroundPosition",
"0px 0px"),b.onResize(),b.cancelEvent(c)};this.doZoom=function(c){return b.zoomactive?b.doZoomOut(c):b.doZoomIn(c)};this.resizeZoom=function(){if(b.zoomactive){var c=b.getScrollTop();b.win.css({width:e(window).width()-b.zoomrestore.padding.w+"px",height:e(window).height()-b.zoomrestore.padding.h+"px"});b.onResize();b.setScrollTop(Math.min(b.page.maxh,c))}};this.init();e.nicescroll.push(this)},s=function(e){var d=this;this.nc=e;this.lasttime=this.speedy=this.lasty=0;this.snapy=false;this.demuly=0;
this.lastscrolly=-1;this.timer=this.chky=0;this.time=function(){return(new Date).getTime()};this.reset=function(e){d.stop();d.lasttime=d.time();d.speedy=0;d.lasty=e;d.lastscrolly=-1};this.update=function(h){d.lasttime=d.time();var b=h-d.lasty,i=e.getScrollTop()+b;d.snapy=i<0||i>d.nc.page.maxh;d.speedy=b;d.lasty=h};this.stop=function(){if(d.timer)clearTimeout(d.timer),d.timer=0,d.lastscrolly=-1};this.doSnapy=function(e){e<0?d.nc.doScroll(0,60):e>d.nc.page.maxh&&d.nc.doScroll(d.nc.page.maxh,60)};this.doMomentum=
function(e){var b=d.time(),f=e?b+e:d.lasttime;d.speedy=Math.min(60,d.speedy);if(d.speedy&&f&&b-f<=50&&d.speedy){var e=b-f,j=d.nc.page.maxh;d.demuly=0;d.lastscrolly=d.nc.getScrollTop();d.chky=d.lastscrolly;var l=function(){var b=Math.floor(d.lastscrolly-d.speedy*(1-d.demuly));d.demuly+=b<0||b>j?0.08:0.01;d.lastscrolly=b;d.nc.synched("domomentum",function(){d.nc.getScrollTop()!=d.chky&&d.stop();d.chky=b;d.nc.setScrollTop(b);d.timer?d.nc.showCursor(b):(d.nc.hideCursor(),d.doSnapy(b))});d.timer=d.demuly<
1?setTimeout(l,e):0};l()}else d.snapy&&d.doSnapy(d.nc.getScrollTop())}},l=e.fn.scrollTop;e.cssHooks.scrollTop={get:function(f){var d=e.data(f,"__nicescroll")||false;return d&&d.ishwscroll?d.getScrollTop():l.call(f)},set:function(f,d){var h=e.data(f,"__nicescroll")||false;h&&h.ishwscroll?h.setScrollTop(parseInt(d)):l.call(f,d);return this}};e.fn.scrollTop=function(f){if(typeof f=="undefined"){var d=this[0]?e.data(this[0],"__nicescroll")||false:false;return d&&d.ishwscroll?d.getScrollTop():l.call(this)}else return this.each(function(){var d=
e.data(this,"__nicescroll")||false;d&&d.ishwscroll?d.setScrollTop(parseInt(f)):l.call(e(this),f)})};var m=function(f){var d=this;this.length=0;this.name="nicescrollarray";this.each=function(b){for(var e=0;e<d.length;e++)b.call(d[e]);return d};this.push=function(b){d[d.length]=b;d.length++};this.eq=function(b){return d[b]};if(f)for(a=0;a<f.length;a++){var h=e.data(f[a],"__nicescroll")||false;h&&(this[this.length]=h,this.length++)}return this};(function(e,d,h){for(var b=0;b<d.length;b++)h(e,d[b])})(m.prototype,
"show,hide,onResize,resize,remove,stop".split(","),function(e,d){e[d]=function(){return this.each(function(){this[d].call()})}});e.fn.getNiceScroll=function(f){return typeof f=="undefined"?new m(this):e.data(this[f],"__nicescroll")||false};e.extend(e.expr[":"],{nicescroll:function(f){return e.data(f,"__nicescroll")?true:false}});e.fn.niceScroll=function(f,d){typeof d=="undefined"&&typeof f=="object"&&!("jquery"in f)&&(d=f,f=false);var h=new m;typeof d=="undefined"&&(d={});if(f)d.doc=e(f),d.win=e(this);
var b=!("doc"in d);if(!b&&!("win"in d))d.win=e(this);this.each(function(){var f=e(this).data("__nicescroll")||false;if(!f)d.doc=b?e(this):d.doc,f=new z(d,e(this)),e(this).data("__nicescroll",f);h.push(f)});return h.length==1?h[0]:h};window.NiceScroll={getjQuery:function(){return e}};if(!e.nicescroll)e.nicescroll=new m})(jQuery);

;

/*
Tipue Search 1.1.1
Tipue Search Copyright (c) 2012 Tri-State Consultants
Tipue Search is free for both both commercial and non-commercial use and released under the MIT License.
For the latest release, documentation and licence see http://www.tipue.com/search

These settings are documented in Tipue Search Settings at http://www.tipue.com/help/search/set 
*/


var tipuesearch_show = 7;
var tipuesearch_show_url = 1;
var tipuesearch_minimum_length = 3;
var tipuesearch_new_window = 1;
var tipuesearch_descriptive_words = 25;

var tipuesearch_stop_words = ["and","be","by","do","for","he","how","if","is","it","my","not","of","or","the","to","up","what","when"];

var tipuesearch_replace = {"words": [
     {"word": "tipua", replace_with: "tipue"},
     {"word": "javscript", replace_with: "javascript"}
]};

var tipuesearch_stem = {"words": [
     {"word": "setup", stem: "install"},
     {"word": "email", stem: "contact"},
     {"word": "javascript", stem: "js"}
]};

;

var tipuesearch = {"pages": [
     {"title": "Tipue Search, a jQuery site search engine", "text": "Tipue Search is a jQuery site search engine. It includes advanced features such as word stemming but is designed to be easy to install. Tipue Search is free for both commercial and non-commercial use and released under the MIT License.", "tags": "JavaScript", "loc": "http://www.tipue.com/search"},
     {"title": "Tipue Search Settings", "text": "The settings for Tipue Search are found in the tipuesearch_set.js file.", "tags": "JavaScript", "loc": "http://www.tipue.com/help/search/set"},
     {"title": "Tipue Search Data", "text": "The data for Tipue Search is stored in the tipuesearch_data.js file and holds the page details to be searched.", "tags": "JavaScript", "loc": "http://www.tipue.com/help/search/data"},
     {"title": "Tipue Search FAQ", "text": "Frequently asked questions about Tipue Search.", "tags": "JavaScript site", "loc": "http://www.tipue.com/help/search/faq"},
     {"title": "Tipue drop, a jQuery Apple-influenced search box", "text": "Tipue drop is a jQuery Apple-influenced search box. Compact and easy to include on your site, Tipue drop is free for both commercial and non-commercial use and released under the MIT License</a>.", "tags": "JavaScript suggest suggestion", "loc": "http://www.tipue.com/drop"},
     {"title": "Tipue drop FAQ", "text": "Frequently asked questions about Tipue drop.", "tags": "JavaScript suggest suggestion", "loc": "http://www.tipue.com/help/drop/faq"},
     {"title": "About Tipue", "text": "Tipue is about cool stuff for web developers. We're based in London.", "tags": "", "loc": "http://www.tipue.com/about"},
     {"title": "Tipue Support", "text": "We aim to provide outstanding free support for our products, but check out Help and the FAQs first. You can get support from our Facebook or Google+ pages, or you can talk to us at post@tipue.com.", "tags": "", "loc": "http://www.tipue.com/support"},
     {"title": "Contact Tipue", "text": "We're more than happy for you to contact us about our products, support, media inquiries, business stuff or anything else at post@tipue.com.", "tags": "", "loc": "http://www.tipue.com/contact"},
     {"title": "Tipue Terms of Service", "text": "The following are terms of a legal agreement between you and Tri-State Consultants. By accessing, browsing and/or using Tipue or any of its services or products, you acknowledge that you have read, understood and agree to be bound by these terms and to comply with all applicable laws and regulations.", "tags": "", "loc": "http://www.tipue.com/tos"},
     {"title": "Tipue Privacy Policy", "text": "We don't share, sell or distribute any personal information you may disclose by using Tipue.", "tags": "", "loc": "http://www.tipue.com/privacy"}
]};

;

/*
Tipue Search 1.1.1
Tipue Search Copyright (c) 2012 Tri-State Consultants
Tipue Search is free for both both commercial and non-commercial use and released under the MIT License.
For the latest release, documentation and licence see http://www.tipue.com/search
*/


var tipue_search_w = '';
if (tipuesearch_new_window == 1)
{
     tipue_search_w = ' target="_blank"';      
}

var tipue_search_q = window.location.search;
if (tipue_search_q)
{
     var tipue_search_l_q = tipue_search_q.indexOf('?q=');
     var tipue_search_q = tipue_search_q.substring(tipue_search_l_q + 3);
     tipue_search_q = tipue_search_q.replace(/\+/g, ' ');
     tipue_search_q = decodeURIComponent(tipue_search_q);
     $('#tipue_search_input').val(tipue_search_q);
     
     getTipueSearch(0, 1);
}

$('#tipue_search_button').click(function()
{
     getTipueSearch(0, 1);
});

$('#tipue_search_input').keyup(function(event)
{
     if(event.keyCode == '13')
     {
          getTipueSearch(0, 1);
     }
});

function getTipueSearch(start, replace)
{
     $('#tipue_search_content').hide();     
     var out = '';
     var results = '';
     var show_replace = 0;
     var show_stop = 0;
     
     var d = $('#tipue_search_input').val().toLowerCase();
     d = $.trim(d);
     var d_w = d.split(' ');
          
     for (var i = 0; i < d_w.length; i++)
     {
          for (var f = 0; f < tipuesearch_stop_words.length; f++)
          {
               if (d_w[i] == tipuesearch_stop_words[f])
               {
                    d = d.replace(d_w[i], '');
                    show_stop = 1;
               }
          }
     }
     d = $.trim(d);
     d = d.replace(/\s+/g, ' ');
     d_w = d.split(' ');
          
     if (d.length >= tipuesearch_minimum_length)
     {
          if (replace == 1)
          {
               var d_r = d;
               for (var i = 0; i < d_w.length; i++)
               {
                    for (var f = 0; f < tipuesearch_replace.words.length; f++)
                    {
                         if (d_w[i] == tipuesearch_replace.words[f].word)
                         {
                              d = d.replace(d_w[i], tipuesearch_replace.words[f].replace_with);
                              show_replace = 1;
                         }
                    }
               }
               d_w = d.split(' ');
          }
          
          var d_t = d;
          for (var i = 0; i < d_w.length; i++)
          {
               for (var f = 0; f < tipuesearch_stem.words.length; f++)
               {
                    if (d_w[i] == tipuesearch_stem.words[f].word)
                    {
                         d_t = d_t + ' ' + tipuesearch_stem.words[f].stem;
                    }
               }
          }
          d_w = d_t.split(' ');
         
          var c = 0;
          found = new Array();
          for (var i = 0; i < tipuesearch.pages.length; i++)
          {
               var score = 10000000;
               for (var f = 0; f < d_w.length; f++)
               {
                    var pat = new RegExp(d_w[f], 'i');
                    if (tipuesearch.pages[i].title.search(pat) != -1)
                    {
                         score -= (2000 - i);
                    }
                    if (tipuesearch.pages[i].text.search(pat) != -1)
                    {
                         score -= (1500 - i);
                    }
                    if (tipuesearch.pages[i].tags.search(pat) != -1)
                    {
                         score -= (1000 - i);
                    }                    
               }
               if (score < 10000000)
               {
                    found[c++] = score + '^' + tipuesearch.pages[i].title + '^' + tipuesearch.pages[i].text + '^' + tipuesearch.pages[i].loc;
               }
          }
                   
          if (c != 0)
          {
               if (show_replace == 1)
               {
                    out += '<div id="tipue_search_warning_head">Showing results for ' + d + '</div>';
                    out += '<div id="tipue_search_warning">Show results for <a href="#" onclick="getTipueSearch(0, 0)">' + d_r + '</a></div>'; 
               }
               if (c == 1)
               {
                    out += '<div id="tipue_search_results_count">1 result</div>';
               }
               else
               {
                    c_c = c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    out += '<div id="tipue_search_results_count">' + c_c + ' results</div>';
               }
               
               found.sort();
               var l_o = 0;
               for (var i = 0; i < found.length; i++)
               {
                    var fo = found[i].split('^');
                    if (l_o >= start && l_o < tipuesearch_show + start)
                    {
                         out += '<div class="tipue_search_content_title"><a href="' + fo[3] + '"' + tipue_search_w + '>' +  fo[1] + '</a></div>';
  
                         var t = fo[2];
                         var t_d = '';
                         var t_w = t.split(' ');
                         if (t_w.length < tipuesearch_descriptive_words)
                         {
                              t_d = t;
                         }
                         else
                         {
                              for (var f = 0; f < tipuesearch_descriptive_words; f++)
                              {
                                   t_d += t_w[f] + ' '; 	
                              }
                         }
                         t_d = $.trim(t_d);
                         if (t_d.charAt(t_d.length - 1) != '.')
                         {
                              t_d += ' ...';
                         }
                         out += '<div class="tipue_search_content_text">' + t_d + '</div>';
                         
                         if (tipuesearch_show_url == 1)
                         {
                              out += '<div class="tipue_search_content_loc"><a href="' + fo[3] + '"' + tipue_search_w + '>' + fo[3] + '</a></div>';
                         }
                    }
                    l_o++;     
               }
                              
               if (c > tipuesearch_show)
               {
                    var pages = Math.ceil(c / tipuesearch_show);
                    var page = (start / tipuesearch_show);
                    out += '<div id="tipue_search_foot"><ul id="tipue_search_foot_boxes">';
                    
                    if (start > 0)
                    {
                        out += '<li><a href="#" onclick="getTipueSearch(' + (start - tipuesearch_show) + ', ' + replace + ')">&#171; Previous</a></li>'; 
                    }
                                        
                    if (page <= 4)
                    {
                         var p_b = pages;
                         if (pages > 5)
                         {
                              p_b = 5;
                         }                    
                         for (var f = 0; f < p_b; f++)
                         {
                              if (f == page)
                              {
                                   out += '<li class="current">' + (f + 1) + '</li>';
                              }
                              else
                              {
                                   out += '<li><a href="#" onclick="getTipueSearch(' + (f * tipuesearch_show) + ', ' + replace + ')">' + (f + 1) + '</a></li>';
                              }
                         }
                    }
                    else
                    {
                         var p_b = pages + 4;
                         if (p_b > pages)
                         {
                              p_b = pages; 
                         }
                         for (var f = page; f < p_b; f++)
                         {
                              if (f == page)
                              {
                                   out += '<li class="current">' + (f + 1) + '</li>';
                              }
                              else
                              {
                                   out += '<li><a href="#" onclick="getTipueSearch(' + (f * tipuesearch_show) + ', ' + replace + ')">' + (f + 1) + '</a></li>';
                              }
                         }                         
                    }
                                       
                    if (page + 1 != pages)
                    {
                        out += '<li><a href="#" onclick="getTipueSearch(' + (start + tipuesearch_show) + ', ' + replace + ')">Next &#187;</a></li>'; 
                    }                    
                    
                    out += '</ul></div>';
               }
          }
          else
          {
               out += '<div id="tipue_search_warning_head">Nothing found</div>'; 
          }          
     }
     else
     {
          if (show_stop == 1)
          {
               out += '<div id="tipue_search_warning_head">Nothing found</div><div id="tipue_search_warning">Common words are largely ignored</div>';     
          }
          else
          {
               out += '<div id="tipue_search_warning_head">Search too short</div>';
               if (tipuesearch_minimum_length == 1)
               {
                    out += '<div id="tipue_search_warning">Should be one character or more</div>';
               }
               else
               {
                    out += '<div id="tipue_search_warning">Should be ' + tipuesearch_minimum_length + ' characters or more</div>';
               }
          }
     }
     
     $('#tipue_search_content').html(out);
     $('#tipue_search_content').slideDown(200);
}



;
/*
 * jQuery UI @VERSION
 *
 * Copyright (c) 2008 Paul Bakaus (ui.jquery.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 *
 * $Id: ui.core.js 5587 2008-05-13 19:56:42Z scott.gonzalez $
 */
;(function($) {

$.ui = {
	plugin: {
		add: function(module, option, set) {
			var proto = $.ui[module].prototype;
			for(var i in set) {
				proto.plugins[i] = proto.plugins[i] || [];
				proto.plugins[i].push([option, set[i]]);
			}
		},
		call: function(instance, name, args) {
			var set = instance.plugins[name];
			if(!set) { return; }
			
			for (var i = 0; i < set.length; i++) {
				if (instance.options[set[i][0]]) {
					set[i][1].apply(instance.element, args);
				}
			}
		}	
	},
	cssCache: {},
	css: function(name) {
		if ($.ui.cssCache[name]) { return $.ui.cssCache[name]; }
		var tmp = $('<div class="ui-resizable-gen">').addClass(name).css({position:'absolute', top:'-5000px', left:'-5000px', display:'block'}).appendTo('body');
		
		//if (!$.browser.safari)
			//tmp.appendTo('body'); 
		
		//Opera and Safari set width and height to 0px instead of auto
		//Safari returns rgba(0,0,0,0) when bgcolor is not set
		$.ui.cssCache[name] = !!(
			(!(/auto|default/).test(tmp.css('cursor')) || (/^[1-9]/).test(tmp.css('height')) || (/^[1-9]/).test(tmp.css('width')) || 
			!(/none/).test(tmp.css('backgroundImage')) || !(/transparent|rgba\(0, 0, 0, 0\)/).test(tmp.css('backgroundColor')))
		);
		try { $('body').get(0).removeChild(tmp.get(0));	} catch(e){}
		return $.ui.cssCache[name];
	},
	disableSelection: function(e) {
		e.unselectable = "on";
		e.onselectstart = function() { return false; };
		if (e.style) { e.style.MozUserSelect = "none"; }
	},
	enableSelection: function(e) {
		e.unselectable = "off";
		e.onselectstart = function() { return true; };
		if (e.style) { e.style.MozUserSelect = ""; }
	},
	hasScroll: function(e, a) {
		var scroll = /top/.test(a||"top") ? 'scrollTop' : 'scrollLeft', has = false;
		if (e[scroll] > 0) return true; e[scroll] = 1;
		has = e[scroll] > 0 ? true : false; e[scroll] = 0;
		return has;
	}
};


/** jQuery core modifications and additions **/

var _remove = $.fn.remove;
$.fn.remove = function() {
	$("*", this).add(this).trigger("remove");
	return _remove.apply(this, arguments );
};

// $.widget is a factory to create jQuery plugins
// taking some boilerplate code out of the plugin code
// created by Scott Gonz?lez and J?rn Zaefferer
function getter(namespace, plugin, method) {
	var methods = $[namespace][plugin].getter || [];
	methods = (typeof methods == "string" ? methods.split(/,?\s+/) : methods);
	return ($.inArray(method, methods) != -1);
}

var widgetPrototype = {
	init: function() {},
	destroy: function() {
		this.element.removeData(this.widgetName);
	},
	
	getData: function(key) {
		return this.options[key];
	},
	setData: function(key, value) {
		this.options[key] = value;
	},
	
	enable: function() {
		this.setData('disabled', false);
	},
	disable: function() {
		this.setData('disabled', true);
	}
};

$.widget = function(name, prototype) {
	var namespace = name.split(".")[0];
	name = name.split(".")[1];
	// create plugin method
	$.fn[name] = function(options) {
		var isMethodCall = (typeof options == 'string'),
			args = Array.prototype.slice.call(arguments, 1);
		
		if (isMethodCall && getter(namespace, name, options)) {
			var instance = $.data(this[0], name);
			return (instance ? instance[options].apply(instance, args)
				: undefined);
		}
		
		return this.each(function() {
			var instance = $.data(this, name);
			if (!instance) {
				$.data(this, name, new $[namespace][name](this, options));
			} else if (isMethodCall) {
				instance[options].apply(instance, args);
			}
		});
	};
	
	// create widget constructor
	$[namespace][name] = function(element, options) {
		var self = this;
		
		this.widgetName = name;
		
		this.options = $.extend({}, $[namespace][name].defaults, options);
		this.element = $(element)
			.bind('setData.' + name, function(e, key, value) {
				return self.setData(key, value);
			})
			.bind('getData.' + name, function(e, key) {
				return self.getData(key);
			})
			.bind('remove', function() {
				return self.destroy();
			});
		this.init();
	};
	
	// add widget prototype
	$[namespace][name].prototype = $.extend({}, widgetPrototype, prototype);
};


/** Mouse Interaction Plugin **/

$.ui.mouse = {
	mouseInit: function() {
		var self = this;
	
		this.element.bind('mousedown.'+this.widgetName, function(e) {
			return self.mouseDown(e);
		});
		
		// Prevent text selection in IE
		if ($.browser.msie) {
			this._mouseUnselectable = this.element.attr('unselectable');
			this.element.attr('unselectable', 'on');
		}
		
		this.started = false;
	},
	
	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
		
		// Restore text selection in IE
		($.browser.msie
			&& this.element.attr('unselectable', this._mouseUnselectable));
	},
	
	mouseDown: function(e) {
		// we may have missed mouseup (out of window)
		(this._mouseStarted && this.mouseUp(e));
		
		this._mouseDownEvent = e;
		
		var self = this,
			btnIsLeft = (e.which == 1),
			elIsCancel = ($(e.target).is(this.options.cancel));
		if (!btnIsLeft || elIsCancel) {
			return true;
		}
		
		this._mouseDelayMet = !this.options.delay;
		if (!this._mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self._mouseDelayMet = true;
			}, this.options.delay);
		}
		
		// these delegates are required to keep context
		this._mouseMoveDelegate = function(e) {
			return self.mouseMove(e);
		};
		this._mouseUpDelegate = function(e) {
			return self.mouseUp(e);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		
		return false;
	},
	
	mouseMove: function(e) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !e.button) {
			return this.mouseUp(e);
		}
		
		if (this._mouseStarted) {
			this.mouseDrag(e);
			return false;
		}
		
		if (this.mouseDistanceMet(e) && this.mouseDelayMet(e)) {
			this._mouseStarted =
				(this.mouseStart(this._mouseDownEvent, e) !== false);
			(this._mouseStarted || this.mouseUp(e));
		}
		
		return !this._mouseStarted;
	},
	
	mouseUp: function(e) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);
		
		if (this._mouseStarted) {
			this._mouseStarted = false;
			this.mouseStop(e);
		}
		
		return false;
	},
	
	mouseDistanceMet: function(e) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - e.pageX),
				Math.abs(this._mouseDownEvent.pageY - e.pageY)
			) >= this.options.distance
		);
	},
	
	mouseDelayMet: function(e) {
		return this._mouseDelayMet;
	},
	
	// These are placeholder methods, to be overriden by extending plugin
	mouseStart: function(e) {},
	mouseDrag: function(e) {},
	mouseStop: function(e) {}
};

$.ui.mouse.defaults = {
	cancel: null,
	distance: 0,
	delay: 0
};

})(jQuery);

/*
 * jQuery UI Stepper
 *
 * Copyright (c) 2008 Ca Phun Ung <caphun at yelotofu dot com>
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://yelotofu.com/labs/jquery/UI/stepper
 *
 * Depends: 
 *	ui.core.js 
 *	jquery.mousewheel.js
 *
 */
;(function($) {

$.widget("ui.stepper", {
	plugins: {},
	
	ui: function(e) {
		return {
			instance: this,
			options: this.options,
			element: this.element
		};
	},
	
	keys: {
		BACK: 8,
		TAB: 9,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		PGUP: 33,
		PGDN: 34,
		HOME: 36,
		END: 35,
		PERIOD: 190,
		MINUS: 109,
		NUMPAD_DECIMAL: 110,
		NUMPAD_SUBTRACT: 109
	},
	
	init: function() {
		var self = this;
		this.element[0].value = this.options.start;
		this.element[0].textbox = $('input[type="text"]', this.element[0]);
		
		// check for decimals in step size
		if (this.options.step.toString().indexOf('.') != -1) {
			var s = this.options.step.toString();
			this.setData('decimals', s.slice(s.indexOf('.')+1, s.length).length);
		}
		
		this.element.each(function(){
			var ns = $(this);
			var textbox = $('input[type="text"]', ns); // get the input textbox
			var bup = $('.ui-stepper-plus', ns); // plus button
			var bdn = $('.ui-stepper-minus', ns); // minus button
			
			self.element[0].value = self.value(textbox.val());
			
			if (textbox.length > 0){
				if (self.element[0].value == '' || isNaN(self.element[0].value)) {
					textbox.val(self.format(self.options.start));
					self.element[0].value = self.value(textbox.val());
				}
				
				// detect key presses and restrict to numeric values only
				textbox
					.bind("keydown.stepper", function(e) {
						if(!self.counter) self.counter = 1;
						return self.keydown(e);
					})
					.bind("keyup.stepper", function(e) {
						if (e.keyCode !== self.keys.BACK && e.keyCode !== self.keys.MINUS && e.keyCode !== self.keys.PERIOD) {
							var val = self.value(this.value);
							var dif = parseFloat(val) % parseFloat(self.options.step);
							if (dif !== 0) {
								val = parseFloat(val) + (parseFloat(self.options.step) - parseFloat(dif));
							}
							if (val < self.options.min) val = self.options.min;
							if (val > self.options.max) val = self.options.max;
							self.element[0].value = self.value(val);
							this.value = self.format(val);
						}
						self.counter = 0;
						self.propagate("change", e);
					})
					// detect when textbox loses cursor focus
					.bind('blur', function(e){
						if (this.value < self.options.min) this.value = self.options.min;
						if (this.value > self.options.max) this.value = self.options.max;
						if (this.value === '') this.value = self.options.start;
					})
					.bind('mousewheel', function(e, delta){
						if (delta > 0)
							self.spin(self.options.step);
						else if (delta < 0)
							self.spin(-self.options.step);
						return false;
					})
					.attr('autocomplete', 'off') // turns off autocomplete in opera!
				;
				
			}
			
			// convert button type to button to prevent form submission onclick
			if (bup.attr('type') == 'submit') {
				try {
					bup.removeAttr('type');
					bup.attr('type', 'button');
				} catch(ex) {
					// IE fix
					bup.each(function(){
						this.removeAttribute('type');
						this.setAttribute('type','button');
					});
				}
			}
			//bup.click(function(){stepper(self.options.step);});
			bup
				.bind('mousedown', function(){
					self.mousedown(100, self.options.step);
				})
				.bind('mouseup', function(e){
					self.mouseup(e);
				})
				.bind('click', function(e){
					self.spin(self.options.step);
				})
				.bind('keyup', function(e) {
					var keynum = (window.event ? event.keyCode : (e.which ? e.which : null));
					switch (keynum) {
						// (prev object)
						case self.keys.UP :
						case self.keys.LEFT :
							textbox.focus(); break;
						// (next object)
						case self.keys.DOWN :
						case self.keys.RIGHT :
							bdn.focus(); break;
					}
				})
			;
			
			// convert button type to button to prevent form submission onclick
			if (bdn.attr('type') == 'submit') {
				try {
					bdn.removeAttr('type');
					bdn.attr('type', 'button');
				} catch(e) {
					// IE fix
					bdn.each(function(){
						this.removeAttribute('type');
						this.setAttribute('type','button');
					});
				}
			}
			bdn
				.bind('mousedown' ,function(){
					self.mousedown(100, -self.options.step);
				})
				.bind('mouseup', function(e){
					self.mouseup(e);
				})
				.bind('click', function(e){
					self.spin(-self.options.step);
				})
				.bind('keyup', function(e){
					var keynum = (window.event ? event.keyCode : (e.which ? e.which : null));
					switch (keynum) {
						// (prev object)
						case self.keys.UP :
						case self.keys.LEFT :
							bup.focus();
							break;
						// (next object)
						case self.keys.DOWN :
						case self.keys.RIGHT :
							break;
					}
				})
			;
		});
	},

	spin: function(val){
		var textbox = this.element[0].textbox;
		if (textbox == undefined)
			return false;
		
		if (val == undefined || isNaN(val))
			val = 1;

		var textboxVal = this.value(textbox.val());
		textboxVal = parseFloat(textboxVal) + parseFloat(val);
		
		if (isNaN(textboxVal)) textboxVal = this.options.start;
		if (textboxVal < this.options.min) textboxVal = this.options.min;
		if (textboxVal > this.options.max) textboxVal = this.options.max;
		
		textbox.val(this.format(textboxVal));
		this.element[0].value = textboxVal;
	},
	
	number: function(num, dec) {
		return Math.round(parseFloat(num)*Math.pow(10, dec)) / Math.pow(10, dec);
	},
	
	currency: function(num) {
		var s = this.number(num, 2).toString();
		var dot = parseInt(s).toString().length+1;
		s = s + ((s.indexOf('.') == -1) ? '.' : '') + '0000000001';
		s = s.substr(0, dot) + s.substr(dot, 2);
		return this.options.symbol + s;
	},
	
	value: function(val) {
		val = val.toString();
		return (this.options.format == 'currency') ? val.slice(this.options.symbol.length, val.length) : val;
	},
	
	format: function(val) {
		return (this.options.format == 'currency') ? this.currency(val) : this.number(val, this.options.decimals);
	},
	
	mousedown: function(i, val) {
		var self = this;
		i = i || 100;
		if(this.timer) window.clearInterval(this.timer);
		this.timer = window.setInterval(function() {
			self.spin(val);
			if(self.counter > 20) self.mousedown(20, val);
		}, i);
	},

	mouseup: function(e) {
		this.counter = 0;
		if(this.timer) 
			window.clearInterval(this.timer);
		this.propagate("change", e);
	},

	keydown: function(e) {
		if(this.upKey(e.keyCode)) this.spin(this.options.step);
		if(this.downKey(e.keyCode)) this.spin(-this.options.step);
		return this.allowedKey(e.keyCode);
	},
	
	upKey: function(key){
		return (key === this.keys.UP || key === this.keys.PGUP) ? true : false;
	},

	downKey: function(key){
		return (key === this.keys.DOWN || key === this.keys.PGDN) ? true : false;
	},
	
	allowedKey: function(key){
		// add support for numeric keys 0-9
		if (key >= 96 && key <= 105) {
			key = 'NUMPAD';
		}
		
		switch (key) {
			case this.keys.TAB :
			case this.keys.BACK :
			case this.keys.LEFT :
			case this.keys.RIGHT :
			case this.keys.PERIOD :
			case this.keys.MINUS :
			case this.keys.NUMPAD_DECIMAL :
			case this.keys.NUMPAD_SUBTRACT :
			case 'NUMPAD' :
				return true;
			default : 
				return (/[0-9\-\.]/).test(String.fromCharCode(key));
		}
	},

	propagate: function(n,e) {
		$.ui.plugin.call(this, n, [e, this.ui()]);
		return this.element.triggerHandler(n == "step" ? n : "step"+n, [e, this.ui()], this.options[n]);
	}
	
});

$.ui.stepper.defaults = {
	min: 0,
	max: 10,
	step: 1,
	start: 0,
	decimals: 0,
	format: '',
	symbol: '$'
};

})(jQuery);
;
(function($) { var settings = new Array(); var group1 = new Array(); var group2 = new Array(); var onSort = new Array(); $.configureBoxes = function(options) { var index = settings.push({ box1View: 'box1View', box1Storage: 'box1Storage', box1Filter: 'box1Filter', box1Clear: 'box1Clear', box1Counter: 'box1Counter', box2View: 'box2View', box2Storage: 'box2Storage', box2Filter: 'box2Filter', box2Clear: 'box2Clear', box2Counter: 'box2Counter', to1: 'to1', allTo1: 'allTo1', to2: 'to2', allTo2: 'allTo2', transferMode: 'move', sortBy: 'text', useFilters: true, useCounters: true, useSorting: true, selectOnSubmit: true }); index--; $.extend(settings[index], options); group1.push({ view: settings[index].box1View, storage: settings[index].box1Storage, filter: settings[index].box1Filter, clear: settings[index].box1Clear, counter: settings[index].box1Counter, index: index }); group2.push({ view: settings[index].box2View, storage: settings[index].box2Storage, filter: settings[index].box2Filter, clear: settings[index].box2Clear, counter: settings[index].box2Counter, index: index }); if (settings[index].sortBy == 'text') { onSort.push(function(a, b) { var aVal = a.text.toLowerCase(); var bVal = b.text.toLowerCase(); if (aVal < bVal) { return -1; } if (aVal > bVal) { return 1; } return 0; }); } else { onSort.push(function(a, b) { var aVal = a.value.toLowerCase(); var bVal = b.value.toLowerCase(); if (aVal < bVal) { return -1; } if (aVal > bVal) { return 1; } return 0; }); } if (settings[index].useFilters) { $('#' + group1[index].filter).keyup(function() { Filter(group1[index]); }); $('#' + group2[index].filter).keyup(function() { Filter(group2[index]); }); $('#' + group1[index].clear).click(function() { ClearFilter(group1[index]); }); $('#' + group2[index].clear).click(function() { ClearFilter(group2[index]); }); } if (IsMoveMode(settings[index])) { $('#' + group2[index].view).dblclick(function() { MoveSelected(group2[index], group1[index]); }); $('#' + settings[index].to1).click(function() { MoveSelected(group2[index], group1[index]); }); $('#' + settings[index].allTo1).click(function() { MoveAll(group2[index], group1[index]); }); } else { $('#' + group2[index].view).dblclick(function() { RemoveSelected(group2[index], group1[index]); }); $('#' + settings[index].to1).click(function() { RemoveSelected(group2[index], group1[index]); }); $('#' + settings[index].allTo1).click(function() { RemoveAll(group2[index], group1[index]); }); } $('#' + group1[index].view).dblclick(function() { MoveSelected(group1[index], group2[index]); }); $('#' + settings[index].to2).click(function() { MoveSelected(group1[index], group2[index]); }); $('#' + settings[index].allTo2).click(function() { MoveAll(group1[index], group2[index]); }); if (settings[index].useCounters) { UpdateLabel(group1[index]); UpdateLabel(group2[index]); } if (settings[index].useSorting) { SortOptions(group1[index]); SortOptions(group2[index]); } $('#' + group1[index].storage + ',#' + group2[index].storage).css('display', 'none'); if (settings[index].selectOnSubmit) { $('#' + settings[index].box2View).closest('form').submit(function() { $('#' + settings[index].box2View).children('option').attr('selected', 'selected'); }); } }; function UpdateLabel(group) { var showingCount = $("#" + group.view + " option").size(); var hiddenCount = $("#" + group.storage + " option").size(); $("#" + group.counter).text('Showing ' + showingCount + ' of ' + (showingCount + hiddenCount)); } function Filter(group) { var index = group.index; var filterLower; if (settings[index].useFilters) { filterLower = $('#' + group.filter).val().toString().toLowerCase(); } else { filterLower = ''; } $('#' + group.view + ' option').filter(function(i) { var toMatch = $(this).text().toString().toLowerCase(); return toMatch.indexOf(filterLower) == -1; }).appendTo('#' + group.storage); $('#' + group.storage + ' option').filter(function(i) { var toMatch = $(this).text().toString().toLowerCase(); return toMatch.indexOf(filterLower) != -1; }).appendTo('#' + group.view); try { $('#' + group.view + ' option').removeAttr('selected'); } catch (ex) { } if (settings[index].useSorting) { SortOptions(group); } if (settings[index].useCounters) { UpdateLabel(group); } } function SortOptions(group) { var $toSortOptions = $('#' + group.view + ' option'); $toSortOptions.sort(onSort[group.index]); $('#' + group.view).empty().append($toSortOptions); } function MoveSelected(fromGroup, toGroup) { if (IsMoveMode(settings[fromGroup.index])) { $('#' + fromGroup.view + ' option:selected').appendTo('#' + toGroup.view); } else { $('#' + fromGroup.view + ' option:selected:not([class*=copiedOption])').clone().appendTo('#' + toGroup.view).end().end().addClass('copiedOption'); } try { $('#' + fromGroup.view + ' option,#' + toGroup.view + ' option').removeAttr('selected'); } catch (ex) { } Filter(toGroup); if (settings[fromGroup.index].useCounters) { UpdateLabel(fromGroup); } } function MoveAll(fromGroup, toGroup) { if (IsMoveMode(settings[fromGroup.index])) { $('#' + fromGroup.view + ' option').appendTo('#' + toGroup.view); } else { $('#' + fromGroup.view + ' option:not([class*=copiedOption])').clone().appendTo('#' + toGroup.view).end().end().addClass('copiedOption'); } try { $('#' + fromGroup.view + ' option,#' + toGroup.view + ' option').removeAttr('selected'); } catch (ex) { } Filter(toGroup); if (settings[fromGroup.index].useCounters) { UpdateLabel(fromGroup); } } function RemoveSelected(removeGroup, otherGroup) { $('#' + otherGroup.view + ' option.copiedOption').add('#' + otherGroup.storage + ' option.copiedOption').remove(); try { $('#' + removeGroup.view + ' option:selected').appendTo('#' + otherGroup.view).removeAttr('selected'); } catch (ex) { } $('#' + removeGroup.view + ' option').add('#' + removeGroup.storage + ' option').clone().addClass('copiedOption').appendTo('#' + otherGroup.view); Filter(otherGroup); if (settings[removeGroup.index].useCounters) { UpdateLabel(removeGroup); } } function RemoveAll(removeGroup, otherGroup) { $('#' + otherGroup.view + ' option.copiedOption').add('#' + otherGroup.storage + ' option.copiedOption').remove(); try { $('#' + removeGroup.storage + ' option').clone().addClass('copiedOption').add('#' + removeGroup.view + ' option').appendTo('#' + otherGroup.view).removeAttr('selected'); } catch (ex) { } Filter(otherGroup); if (settings[removeGroup.index].useCounters) { UpdateLabel(removeGroup); } } function ClearFilter(group) { $('#' + group.filter).val(''); $('#' + group.storage + ' option').appendTo('#' + group.view); try { $('#' + group.view + ' option').removeAttr('selected'); } catch (ex) { } if (settings[group.index].useSorting) { SortOptions(group); } if (settings[group.index].useCounters) { UpdateLabel(group); } } function IsMoveMode(currSettings) { return currSettings.transferMode == 'move'; } })(jQuery);
;












































;
