/*
 * Copyright (c) 2009 Greg Stoll
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * */
var pc = new PassyCore();
var passy = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("passy-strings");
   /*document.getElementById("contentAreaContextMenu")
            .addEventListener("popupshowing", function(e) { this.showContextMenu(e); }, false);*/
  },

  popupNodeIsTextBox: function() {
    if (document.popupNode.localName == 'INPUT') {
        var inputType = document.popupNode.type;
        if (inputType == 'text' || inputType == 'password') {
            return true;
        }
    }
    return false;
  },
  onMenuItemCommand: function(e) {
    var mainWindow = document.getElementById("passy-mainWindow");
    var ownerDocument = document.popupNode.ownerDocument;
    // See if we're http or https and set the icon accordingly.
    var isHttps = (ownerDocument.location.protocol.substr(0, 5) == 'https');
    document.getElementById("passy-icon-secure").setAttribute('hidden', !isHttps);
    document.getElementById("passy-icon-notsecure").setAttribute('hidden', isHttps);
    var backgroundColor = isHttps ? '#FFFFAA' : '#EEEEEE';
    document.getElementById('passy-topbar').setAttribute('style', 'background-color: ' + backgroundColor);
    // See if we were popped up on a textbox or password box.
    var onTextBox = this.popupNodeIsTextBox();
    document.getElementById('passy-result-insert').setAttribute('disabled', !onTextBox);
    if (!onTextBox) {
        // Make sure the "fill in" isn't selected.
        document.getElementById('passy-result-radiogroup').selectedIndex = 1;
    } else {
        // We could be fill in or copy to clipboard.  Read the preference to
        // see what our default is.
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefService);
        prefs = prefs.getBranch("extensions.passy.");
        if (prefs.getPrefType('fillInTextField') == 0) {
            // This preference has not been created.  Create it now and
            // default it to true.
            prefs.setBoolPref('fillInTextField', true);
        }
        var fillIn = prefs.getBoolPref('fillInTextField');
        // Set the radio button
        document.getElementById('passy-result-radiogroup').selectedIndex = fillIn ? 0 : 1;
    }
    // Fill in the domain
    document.getElementById('passy-domainBox').value = pc.getDomain(ownerDocument.domain, true);

    mainWindow.openPopup(document.popupNode, "at_pointer", 0, 0, false, false);
    document.getElementById('passy-master-passwordbox').value = '';
    document.getElementById('passy-master-passwordbox').focus();

    //window.openDialog('chrome://passy/content/passwordWindow.xul', 'somename', 'chrome');
  },
  
  doPassword: function(length) {
    // First get the relevant data and calculate the password.
    var master = hex_sha1(document.getElementById('passy-master-passwordbox').value);
    var domain = document.getElementById('passy-domainBox').value;
	var result = pc.getPassword(master, domain, length);
    // Now copy or fill in the result.
    var doFillIn = document.getElementById('passy-result-radiogroup').selectedIndex == 0;
    // Check and see if the popupNode is valid, because if it isn't we shouldn't
    // set the preference.
    var onTextBox = this.popupNodeIsTextBox();
    if (onTextBox) {
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                             .getService(Components.interfaces.nsIPrefService);
        prefs = prefs.getBranch("extensions.passy.");
        prefs.setBoolPref('fillInTextField', doFillIn);
    }
    if (doFillIn) {
        // Fill in
        // To be safe, make sure popupNode is still acceptable
        if (onTextBox) {
            document.popupNode.value = result;
        }
    } else {
        // Copy to clipboard
        var clipboardService = Components.classes["@mozilla.org/widget/clipboardhelper;1"]
                                         .getService(Components.interfaces.nsIClipboardHelper);
        clipboardService.copyString(result);
    }
    // Close the popup
    var mainWindow = document.getElementById("passy-mainWindow");
    mainWindow.hidePopup();
  },

};
window.addEventListener("load", function(e) { passy.onLoad(e); }, false);
