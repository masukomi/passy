CmdUtils.CreateCommand({
	name: "passy",
	homepage: "http://www.masukomi.org/projects/ubiquity/passy/index.html",
	athor : {name: "masukomi (Kate Rhodes)", email:"masukomi@masukomi.org"},
	license: "MIT",
	icon: "http://www.masukomi.org/projects/ubiquity/passy/icons/lock.png",
	takes: {"[length [domain]]": noun_arb_text},
	preview: function( pblock, params ) {
		var paramsA = this.parseParams(params);

		if (paramsA[0] != 'clear'){
			var previewHeader = '';
			if (paramsA[1] !=''){
				previewHeader = "Will generate " + paramsA[0] + " length password for " + paramsA[1];
			} else {
				previewHeader = "<em><i>Unable to determine domain.</i></em> You'll have to specify length and domain.";
			}
			
			

			pblock.innerHTML = previewHeader 
			+ "<br /><br />Length is optional (unless you're specifying a domain) and can be: \"short\", \"med\", or \"long\" (defaults to med)."
			+ "<br />Domain is optional and defaults to the current site."
			+ "<p>Please note: Your master password will be encrypted and stored in memory until you close Firefox or execute 'passy clear'.</p>"
			;
		} else {
			/* FIXME: always claims is null even when it isn't in execute.
			if (this.masterPass == null){
				pblock.innerHTML = "Nothing to clear. :)";
				displayMessage("masterPass: " + this.masterPass);
			} else {
			*/
				pblock.innerHTML = "Will clear your encrypted master password from memory.";
			//}
		}

	},
	execute: function( params ) {
		var paramsA = this.parseParams(params);
		if (paramsA[0] != 'clear'){
			if (this.masterPass == null){
				//TODO launch a modal dialog with a password field 
				// so that the password isn't displayed in the open 
				// during entry.
				this.masterPass = Utils.computeCryptoHash("SHA1", 
					Utils.currentChromeWindow.prompt("I'll need your master password")
					);
			}
			//displayMessage("masterPass: " + this.masterPass);
			var password = this.getPassword(
				this.masterPass,  // encrypted hash of master password
				paramsA[1], // domain 
				paramsA[0]	// length
			);
			//displayMessage( password );
		
			CmdUtils.setSelection(password , {text:password});
			//CmdUtils.copyToClipboard( password )

		} else {
			delete this.masterPass;
			displayMessage("Master password has been cleared.");
		}
	},
	parseParams: function(params){
		var undefined_var;
		var paramsS = "";
		if (params === undefined_var || params == null){
			paramsS = "";
		} else {
			paramsS = params.text;
		}
		var paramsA = paramsS.split(/\s+/);
		
		var length = paramsA[0];
		var domain = paramsA[1];
		if (length === undefined_var || length == null || length == ''){
			length	= "med";
		}
		if (domain === undefined_var || domain == null || domain == ''){
			domain	= CmdUtils.getDocument( ).domain;
		}
		paramsA[0] = this.getFirstParam(length);
		paramsA[1] = this.getDomain(domain);
		return paramsA;
	},
	getFirstParam: function(specifiedLength){
		// need to rethink the naming here. 
		//as sometimes the first param is the clear command
		if (specifiedLength == null 
			|| specifiedLength == "medium"
		){
			return "med"; 
		}
		if (specifiedLength != "short" 
			&& specifiedLength != "med"
			&& specifiedLength != "long"
			&& specifiedLength != "clear"){
			return "med";
		}
		return specifiedLength;
	},
	getDomain: function(specifiedDomain){
		if (specifiedDomain == null){
			return CmdUtils.getDocument( ).domain;
		}
		return specifiedDomain;
	},
	getPassword: function(secret, domain, length){
		var passHash = this.trimPassword(this.getFullPassword(secret, domain),length); 
		return this.strengthen(passHash);
	},
	getFullPassword: function(secret, domain){
		// the secret was encrypted immediately after entry
		return Utils.computeCryptoHash("SHA1",  secret  + domain); 
	},
	strengthen :function(text){
		/* alternates between upper and lower case for each character
			but also guarantees that there will be one uppercase and one lower
			and one number
				*/
		if (! /\d+/.test(text)){
			text += ""+text.length; // a consistent non-static number to give it.
		}

		var chars  = text.split('');
		var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
		if (! /[a-zA-Z]/.test(text)){
			// a consistent non-static way way to give it two letters
			chars[chars.length] = letters[chars[0]];
			chars[chars.length] = letters[chars[1]];
		}else{
			var match = /[a-zA-Z]/.exec(text);
			if (match.length == 0){
				var first = /[A-Z]/.search(text);
				chars[chars.length] = letters[chars[first > 0 ? 0 : 1]];
			}
		}
		var result = '';
		var gotUpcaseLetter = false;
		var gotDowncaseLetter = false;
		for (var i = 0; i < chars.length; i++){
			var nextChar = null;
			if (i % 2 == 0){
				nextChar= chars[i].toUpperCase(); // not necessary but makes it more generically useful
			} else {
				nextChar = chars[i].toLowerCase();
			}
			
			if (! gotUpcaseLetter || ! gotDowncaseLetter){
				if (/[A-Z]/.test(nextChar)){
						if (gotUpcaseLetter && ! gotDowncaseLetter){
							nextChar = nextChar.toLowerCase(); // not necessary but makes it more generically useful
							gotDowncaseLetter = true;
						} else {
							gotUpcaseLetter = true;
						}
					
				} else if (/[a-z]/.test(nextChar)){
					if (gotDowncaseLetter && ! gotUpcaseLetter){
						nextChar=nextChar.toUpperCase();
						gotUpcaseLetter = true;
					} else {
						gotDowncaseLetter = true;
					}
				}
			}
			result += nextChar;
			
		}
		return result;
	},
	trimPassword: function(hash, length){
		/* trims the password to the specified length but guarantees
			that it contains at least one number and one character */
		var ion = this.indexOfNumber(hash);
		var iol = this.indexOfLetter(hash);
		var lastRequiredIndex = (iol > ion ? iol : ion);
		if (length == "long"){
		  return hash; 
		} else if (length == "med"){
			lastRequiredIndex = lastRequiredIndex < 16 ? 16 : lastRequiredIndex;
			return hash.substr(0,lastRequiredIndex);
		} else { // small
			lastRequiredIndex = lastRequiredIndex < 8 ? 8 : lastRequiredIndex;
			return hash.substr(0,lastRequiredIndex);
		}
	},
	indexOfNumber: function(text){
		var chars = text.split('');
		for (var i = 0; i < chars.length; i++){
			if (/\d/.test(chars[i])){
				return i;
			}
		}
		return -1;
	},
	indexOfLetter: function(text){
		var chars = text.split('');
		for (var i = 0; i < chars.length; i++){
			if (/[a-fA-F]/.test(chars[i])){
				return i;
			}
		}
		return -1;
	}

	
})


