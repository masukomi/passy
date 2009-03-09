////////////// BEGIN passy_ubiquity_section.js ////////////////////
/// Please note passy.js is the combination of passy_ubiquity_section.js
/// and passy_core.js


CmdUtils.CreateCommand({
	name: "passy",
	description: "A strong, and simple, password generator.",
	homepage: "http://www.masukomi.org/projects/ubiquity/passy/index.html",
	author : {name: "masukomi", email:"masukomi@masukomi.org"},
		help : "<span style='font-size: 80%;'><dl><dt>Usage:</dt><dd><dl><dt style='font-style:italic;'>passy</dt><dd>Generates a medium length password for the current domain and inserts it into the page.</dd><dt style='font-style:italic;'>passy short/med/long</dt><dd>Same as above but with a password of your specified length.</dd><dt style='font-style:italic;'>passy short/med/long example.com</dt><dd>Same as above but with your specifed length and domain.</dd><dt style='font-style:italic;'>passy copy (short/med/long (domain))</dt><dd>Works just like the options above but copies the password to your clipboard instead.</dd><dt style='font-style:italic;'>... with ____</dt><dd>The with modifier can be used in two ways. <dl><dt style='font-style:italic;'>with temp</dt><dd>If you say \"with temp\" it'll ask you for a temporary master password that won't be stored. If you've already stored one this session it'll remain untouched for use the next time.</dd><dt style='font-style:italic;'>with &lt;suffix (anything except \"temp\")&gt;</dt><dd>This will append whatever text you enter to the end of the generated password. Useful if they require characters other than letters or numbers in your passwords.</dd></dl></dd><dt style='font-style:italic;'>passy clear</dt><dd>Clears your encrypted master password from memory</dd></dl></dd></dl><p>This is version 0.3.1 of passy.</p></span>",

	license: "MIT",
	icon: "http://www.masukomi.org/projects/ubiquity/passy/icons/lock.png",
	takes: {"[length [domain]]": noun_arb_text},
	modifiers: {"with" : noun_arb_text},

	preview: function( pblock, params, mods ) {
		var results = this.parseParams(params, mods);

		if (results.command != 'clear'){
			var previewHeader = '';
			var undefined_var;
			if (results.length != null && results.length != undefined_var){
				if (results.domain != null){
					previewHeader = "Will generate <em class='passy'>" + results.length + " length</em> password for <em class='passy'>" + results.domain + "</em>";
					if (! results.copy){
						previewHeader += " and <em class='passy'>insert</em> it into the page"
					} else {
						previewHeader += " and <em class='passy'>copy</em> it to the clipboard"
					}
				} else {
					previewHeader = "<em class='passy'><i>Unable to determine domain.</i></em> You'll have to specify length and domain";
				}
				if (results.useTempMaster){
					previewHeader += " using a <em class='passy'>temporary master password</em>"
				} 
				if (results.suffix != null){
					previewHeader += " and <em class='passy'>append</em> your suffix to the end of it"
				}
				previewHeader += ".";
				
			} else {
				previewHeader ="<p>Wait... What?</p>";
			}
			
			previewHeader = previewHeader.replace(/<em/g, "<em style='color: #9999FF;'");
			//6666FF looks decent too, a little too close to link color though.

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
	

	
	execute: function( params, mods ) {
		var results = this.parseParams(params, mods);
		
		if (results.command != 'clear'){ // only other option is genpass
			if (results.length == null){
				displayMessage("Sorry, I'm not sure what you wanted me to do.");
				return;
			}
			
			
			
			if (results.length != null){
				if (results.domain != null){
				
				
					// do we have a master password stored?
					if (getMasterPass() == null || results.useTempMaster){
						//TODO launch a modal dialog with a password field 
						// so that the password isn't displayed in the open 
						// during entry.

						

						/////////////////////////////////
						//// BEGIN Password Dialog
						
						// most of this dialog code is courtesy of 
						// Halobrite.com's Transparent Message script
						// http://halobrite.com/ubiquity/#transparent-message


						var doc = CmdUtils.getDocumentInsecure();
						var msgBox = doc.getElementById("transparent-msg");
						if (msgBox == null){
								var cssMsg = {  position: "fixed",
												top: "130px",
												left: "25%",
												width: "50%",
												color: "white",
												textAlign: "center",
												opacity: "0",
												zIndex: "100000",
												display: "none"
								};
											 
								var cssRBox = { display: "block",
												zIndex: "-10"
								};
								
								var cssR = [ {margin: "0 5px"},
											 {margin: "0 3px"},
											 {margin: "0 2px"},
											 {margin: "0 1px", height: "2px"}
								];
								var cssRAll = { display: "block",
												height: "1px",
												overflow: "hidden",
												background: "black"
								};
								
								var cssContent = { width: "100%",
												   background: "black",
								};
								
								var cssContentInner = { display: "block",
														color: "white",
														textAlign: "center",
														margin: "0 auto",
														padding: "15px",
														fontSize: "22px",
														fontFamily: "arial, sans-serif",
													
								};
								
								// Create the elements
								msgBox = _createElement("div", "transparent-msg", cssMsg);
								
								var rTop = _createElement("b", "rtop", cssRBox);
								for(i=1; i<=4; i++) {
									var r = _createElement("b", "r" + i, jQuery.extend(cssR[i-1], cssRAll) );
									rTop.appendChild(r);
								}
								msgBox.appendChild(rTop);
								
								var content = _createElement("div", "transparent-msg-content", cssContent);
								var contentInner = _createElement("div", "transparent-msg-content-inner", cssContentInner);
								content.appendChild(contentInner);
								msgBox.appendChild(content);
								
								var rBottom = _createElement("b", "rbottom", cssRBox);
								for(j=4; j>0; j--) {
									var r = _createElement("b", "r" + j, jQuery.extend(cssR[j-1], cssRAll) );
									rBottom.appendChild(r);
								}
								msgBox.appendChild(rBottom);
								
								CmdUtils.getDocumentInsecure().body.appendChild(msgBox);
							
								
								var instr = _createElement("p", "form-instructions");
								jQuery(instr).text("Enter your master password:");
								contentInner.appendChild(instr);
								var passyForm = _createElement("form", "master-pass-form");
								jQuery(passyForm).attr("action", "#");
								jQuery(passyForm).attr("autocomplete", "off"); 
								// never want it trying to autocomplete or store the master password field 
								// because a) it'll confuse people and b) it's seriously dangerous
								// with everything keyed off of said password and firefox defaulting to 
								// storing passwords in plain text.
								var passwordInput = _createElement("input", "master-password");
								jQuery(passwordInput).attr("type", "password");
								passyForm.appendChild(passwordInput);
								//passyForm.appendChild(_createElement("br"));
								var passyButton = _createElement("input", "master-pass-submit-button");
								jQuery(passyButton).attr("type", "submit");
								jQuery(passyButton).attr("value", "Generate");
								passyForm.appendChild(passyButton);
								jQuery(passyForm).bind("submit", function() { 
									///// BEGIN PASSY GENERATION
									var userInput = passwordInput.value;
									if (userInput == null || userInput == ''){
										displayMessage("You must enter a master password.");
										return;
									}
									if (! results.useTempMaster){
										setMasterPass(Utils.computeCryptoHash("SHA1", userInput));
									} else {
										results.tempMaster = Utils.computeCryptoHash("SHA1", userInput);
									}
									userInput = '';
									userInput = null;
									
									generatePasswordWithOptions((results.useTempMaster ? results.tempMaster : getMasterPass()), results);
									
									///// END PASSY GENERATION
									hide();
									
								});
								contentInner.appendChild(passyForm);
							}
							jQuery(msgBox).show().animate({opacity: "0.8"}, 200);
							jQuery(msgBox).focus();
						
						//// END Password Dialog
						////////////////////////////////
					} else {
						generatePasswordWithOptions(getMasterPass(), results);
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
	parseParams: function(params, mods){
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
			results.focusedElement = focused;//we'll need this later
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
							if (paramsA.length == 2){
								results.domain = pc.getDomain(null);
							} else if (paramsA.length == 3){
								//oh my, how... explicit
								results.domain = pc.getDomain(paramsA[2]);
							}
						}
					}
				}
				
				//handle the mods
				var withText = null;
				results.useTempMaster = false;
				results.suffix = null;
				if (mods != null && mods["with"] != null && /\S+/.test(mods["with"].text)){
					//either they want to use a temp master password
					//or they want to tack something on to the end of the generated password
					var withText = mods["with"].text;
					if (/^temp\s*/i.test(withText)){
						results.useTempMaster = true;
						if(/^temp\s+\S+.*/.test(withText)){
							//apparently they wanted a temporary password AND a suffix
							results.suffix = withText.replace(/^temp\s+/i, "");
						}
					} else if (/\S+/.test(withText)){
						results.suffix = withText;
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
		
});


// these are out here to get around some scoping issues with calbacks.
function setMasterPass(masterPass){
	this.masterPass = masterPass;
};
function getMasterPass(){
	return this.masterPass;
};


function generatePasswordWithOptions(currentMasterPass, options){
		
		var pc = new PassyCore();
		var password = pc.getPassword(
			currentMasterPass,  // encrypted hash of master password
			options.domain, // domain 
			options.length	// length
		);
		if (options.suffix != null){
			password += options.suffix;
		}
			
		delete options.tempMaster; //remove that from memory
		
		if (! options.copy){
			//see if there's something selected
			if (options.hasFocus && typeof options.focusedElement == "object"){
				//CmdUtils.setSelection(password , {text:password});
				// Can't use the above because if they had to enter 
				// a password then that form would have stolen focus.
				options.focusedElement.value = password;
				displayMessage("Password inserted into page.");
			} else {
				displayMessage("Select something for me to insert it into.");
			}
		} else {
			CmdUtils.copyToClipboard( password )
			displayMessage("Copied password to clipboard.");
			
		}
		
	};

function hide() {
				//_clear();
				var doc = CmdUtils.getDocumentInsecure();
		   
				var msgBox = doc.getElementById("transparent-msg");
				var passwordField =doc.getElementById("master-password");
				passwordField.value = '';
				//jQuery(msgBox).animate({opacity: "0.0"}, 500);
				msgBox.style.display='none';
			};

function _createElement(type, id, css) {
			var el = CmdUtils.getDocumentInsecure().createElement(type);
			if(id) jQuery(el).attr("id", id);
			if(css) jQuery(el).css(css);
			
			return el;
		};
function _clear() {
			//jQuery(window).unbind("mousemove").unbind("click").unbind("keypress");
			//Utils.clearTimeout( _T_GoAway );
			//Utils.clearTimeout(_T_Event );
		};

////////////// END passy_ubiquity_section.js ////////////////////


