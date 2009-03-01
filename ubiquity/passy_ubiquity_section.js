////////////// BEGIN passy_ubiquity_section.js ////////////////////
/// Please note passy.js is the combination of passy_ubiquity_section.js
/// and passy_core.js

CmdUtils.CreateCommand({
	name: "passy",
	description: "A strong, and simple, password generator.",
	homepage: "http://www.masukomi.org/projects/ubiquity/passy/index.html",
	author : {name: "masukomi", email:"masukomi@masukomi.org"},
		help : "<span style='font-size: 80%;'><dl><dt>Usage:</dt><dd><dl><dt style='font-style:italic;'>passy</dt><dd>Generates a medium length password for the current domain and inserts it into the page.</dd><dt style='font-style:italic;'>passy short/med/long</dt><dd>Same as above but with a password of your specified length.</dd><dt style='font-style:italic;'>passy short/med/long example.com</dt><dd>Same as above but with your specifed length and domain.</dd><dt style='font-style:italic;'>passy copy (short/med/long (domain))</dt><dd>Works just like the options above but copies the password to your clipboard instead.</dd><dt style='font-style:italic;'>passy clear</dt><dd>Clears your encrypted master password from memory</dd></dl></dd></dl></span>",

	license: "MIT",
	icon: "http://www.masukomi.org/projects/ubiquity/passy/icons/lock.png",
	takes: {"[length [domain]]": noun_arb_text},


	preview: function( pblock, params ) {
		var results = this.parseParams(params);

		if (results.command != 'clear'){
			var previewHeader = '';
			var undefined_var;
			if (results.length != null && results.length != undefined_var){
				if (results.domain != null){
					previewHeader = "Will generate <em>" + results.length + "</em> length password for <em>" + results.domain + "</em>";
					if (! results.copy){
						previewHeader += " and <em>insert</em> it into the page."
					} else {
						previewHeader += " and <em>copy</em> it to the clipboard."
					}
				} else {
					previewHeader = "<em><i>Unable to determine domain.</i></em> You'll have to specify length and domain.";
				}
			} else {
				previewHeader ="<p>Wait... What?</p>";
			}
			

			pblock.innerHTML = previewHeader + "<p>&nbsp;</p>" + this.help;

		} else {
			//FIXME: always claims is null even when it isn't in execute.
			//if (this.masterPass == null){
			//	pblock.innerHTML = "Nothing to clear. :)";
			//	displayMessage("masterPass: " + this.masterPass);
			//} else {
				pblock.innerHTML = "Will clear your encrypted master password from memory.";
			//}
		}
	},
	execute: function( params ) {
		var results = this.parseParams(params);

		if (results.command != 'clear'){ // only other option is genpass
			if (results.length == null){
				displayMessage("Sorry, I'm not sure what you wanted me to do.");
				return;
			}
			// do we have a master password stored?
			
			if (this.masterPass == null){
				//TODO launch a modal dialog with a password field 
				// so that the password isn't displayed in the open 
				// during entry.
				var userInput = Utils.currentChromeWindow.prompt("I'll need your master password");
				
				if (userInput == null || userInput == ''){
					displayMessage("You must enter a master password.");
					return;
				}
				
				this.masterPass = Utils.computeCryptoHash("SHA1", 
					userInput
					);
				userInput = '';
				userInput = null;
				
			}
			
			
			
			if (results.length != null){
				if (results.domain != null){
					var pc = new PassyCore();
					var password = pc.getPassword(
						this.masterPass,  // encrypted hash of master password
						results.domain, // domain 
						results.length	// length
					);
					
					if (! results.copy){
						//see if there's something selected
						if (results.hasFocus){
							CmdUtils.setSelection(password , {text:password});
							displayMessage("Password inserted into page.");
						} else {
							displayMessage("Select something for me to insert it into.");
						}
					} else {
						CmdUtils.copyToClipboard( password )
						displayMessage("Copied password to clipboard.");
						
					}
				} else {
					displayMessage("I was unable to determine a domain.");
				}
			} else {
				displayMessage("Wait... What?");
			}
			

			
		} else {
			delete this.masterPass;
			displayMessage("Master password has been cleared.");
			
		}
		params = null;
	},
	parseParams: function(params){
		//passy <length> <domain>
		//passy clear
		//passy copy <length> <domain>
		
		
		
		//CmdUtils.log("in parseParams");
		var undefined_var;
		var paramsS = "";
		if (params === undefined_var || params == null){
			paramsS = "";
			//CmdUtils.log("params were empty");
		} else {
			paramsS = params.text;
			//CmdUtils.log("raw params: " + paramsS);
		}
		var paramsA = paramsS.split(/\s+/);
		for (var i = 0; i < paramsA.length; i++){
			//CmdUtils.log("paramsA[" + i + "] = " + paramsA[i]);
		}

		var results = {copy:false}; // most options don't involve copying
		
		var context = CmdUtils.__globalObject.context;
		var focused = context.focusedElement;
		//TODO only set hasFocus to true if they have a text input field 
		// (of any sort) selected. text/password/textarea/awesomebar/search box...
		if (focused != null && typeof focused.setSelectionRange == 'function'){
			results.hasFocus =true;
		} else {
			results.hasFocus = false;
		}
			
		var pc = new PassyCore();
		var genPassCommand = "genpass";
		if (paramsA.length > 0){
			var p1 = paramsA[0];
			p1 = this.getFirstParam(p1);
			if (p1 != null){
				if (p1 != "clear" && p1 != "copy"){
					//CmdUtils.log("is not clear or copy: " + p1);
					// it's a length
					results.length = this.getFirstParam(p1);
					if (paramsA.length > 1){
						// and a domain
						results.domain = pc.getDomain(paramsA[1]);
					} else {
						results.domain = pc.getDomain(null);
					}
				} else {
					if (p1 == "clear"){
						//CmdUtils.log("is clear");
						results.command = p1;
						return results; // no more info needed
					} else {
						//CmdUtils.log("is copy");
						results.command = genPassCommand;
						results.copy = true;
						if (paramsA.length == 1){
							//generate the default command and copy it.
							results.length = "med";
							results.domain = pc.getDomain(null);
						} else {
							results.length = this.getFirstParam(paramsA[1]);
							if (paramsA.length == 3){
								//oh my, how... explicit
								results.domain = pc.getDomain(paramsA[2]);
							}
						}
					}
				}
			} else { //p1 == null means unknown command
				results.command = null;
			}
		} else {
			results.command = genPassCommand;
			results.length = "med";
			results.domain = pc.getDomain(null);
			
		}
		return results;
	},
	getFirstParam: function(param){
		// need to rethink the naming here. 
		//as sometimes the first param is the clear command
		if (param == null || param.length == 0){
			//CmdUtils.log("gfp null = med");
			return "med"; 
		}
		//guaranteed there's *something* there.
		if (/^(s|sh|shor|short)$/i.test(param)){
			//CmdUtils.log("gfp short");
			return "short";
		}
		if (/^(m|me|med|medi|mediu|medium)$/i.test(param)){
			//CmdUtils.log("gfp med");
			return "med";
		}
		if (/^(l|lo|lon|long)$/i.test(param)){
			//CmdUtils.log("gfp long");
			return "long";
		}
		if (param == "clear"){
			return param;
		}
		if (param == "copy"){
			return param;
		}
		return null;
		
	}
		
})


////////////// END passy_ubiquity_section.js ////////////////////


