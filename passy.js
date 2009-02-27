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
			length	= null;
		}
		if (domain === undefined_var || domain == null || domain == ''){
			domain	= null;
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
			/*
			Domain Extraction algorithm Copyright 2005 Collin Jackson

			Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

				* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
				* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
				* Neither the name of Stanford University nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

			*/

			
			var fullDomain = CmdUtils.getDocument( ).domain;
			var host = fullDomain.split('.');
			var shortDomain = '';
			if(host[2]!=null) { // if it has at least 3 sections
				domains='ab.ca|ac.ac|ac.at|ac.be|ac.cn|ac.il|ac.in|ac.jp|ac.kr|ac.nz|ac.th|ac.uk|ac.za|adm.br|adv.br|agro.pl|ah.cn|aid.pl|alt.za|am.br|arq.br|art.br|arts.ro|asn.au|asso.fr|asso.mc|atm.pl|auto.pl|bbs.tr|bc.ca|bio.br|biz.pl|bj.cn|br.com|cn.com|cng.br|cnt.br|co.ac|co.at|co.il|co.in|co.jp|co.kr|co.nz|co.th|co.uk|co.za|com.au|com.br|com.cn|com.ec|com.fr|com.hk|com.mm|com.mx|com.pl|com.ro|com.ru|com.sg|com.tr|com.tw|cq.cn|cri.nz|de.com|ecn.br|edu.au|edu.cn|edu.hk|edu.mm|edu.mx|edu.pl|edu.tr|edu.za|eng.br|ernet.in|esp.br|etc.br|eti.br|eu.com|eu.lv|fin.ec|firm.ro|fm.br|fot.br|fst.br|g12.br|gb.com|gb.net|gd.cn|gen.nz|gmina.pl|go.jp|go.kr|go.th|gob.mx|gov.br|gov.cn|gov.ec|gov.il|gov.in|gov.mm|gov.mx|gov.sg|gov.tr|gov.za|govt.nz|gs.cn|gsm.pl|gv.ac|gv.at|gx.cn|gz.cn|hb.cn|he.cn|hi.cn|hk.cn|hl.cn|hn.cn|hu.com|idv.tw|ind.br|inf.br|info.pl|info.ro|iwi.nz|jl.cn|jor.br|jpn.com|js.cn|k12.il|k12.tr|lel.br|ln.cn|ltd.uk|mail.pl|maori.nz|mb.ca|me.uk|med.br|med.ec|media.pl|mi.th|miasta.pl|mil.br|mil.ec|mil.nz|mil.pl|mil.tr|mil.za|mo.cn|muni.il|nb.ca|ne.jp|ne.kr|net.au|net.br|net.cn|net.ec|net.hk|net.il|net.in|net.mm|net.mx|net.nz|net.pl|net.ru|net.sg|net.th|net.tr|net.tw|net.za|nf.ca|ngo.za|nm.cn|nm.kr|no.com|nom.br|nom.pl|nom.ro|nom.za|ns.ca|nt.ca|nt.ro|ntr.br|nx.cn|odo.br|on.ca|or.ac|or.at|or.jp|or.kr|or.th|org.au|org.br|org.cn|org.ec|org.hk|org.il|org.mm|org.mx|org.nz|org.pl|org.ro|org.ru|org.sg|org.tr|org.tw|org.uk|org.za|pc.pl|pe.ca|plc.uk|ppg.br|presse.fr|priv.pl|pro.br|psc.br|psi.br|qc.ca|qc.com|qh.cn|re.kr|realestate.pl|rec.br|rec.ro|rel.pl|res.in|ru.com|sa.com|sc.cn|school.nz|school.za|se.com|se.net|sh.cn|shop.pl|sk.ca|sklep.pl|slg.br|sn.cn|sos.pl|store.ro|targi.pl|tj.cn|tm.fr|tm.mc|tm.pl|tm.ro|tm.za|tmp.br|tourism.pl|travel.pl|tur.br|turystyka.pl|tv.br|tw.cn|uk.co|uk.com|uk.net|us.com|uy.com|vet.br|web.za|web.com|www.ro|xj.cn|xz.cn|yk.ca|yn.cn|za.com';
				domains=domains.split('|');
				shortDomain=host[host.length-2]+'.'+host[host.length-1];
				for(var i=0;i<domains.length;i++) {
					if(shortDomain==domains[i]) { // if the last two sections match any in the list
						shortDomain=host[host.length-3]+'.'+specifiedDomain; // tack on the one before it
						break;
					}
				}
			} else {
				shortDomain=host.join('.');
			}
			specifiedDomain = shortDomain;
				
		} // END if (specifiedDomain == null){
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


