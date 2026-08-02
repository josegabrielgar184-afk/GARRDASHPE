"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[972],{1963:function(e,t,r){r.d(t,{$:function(){return tE},C:function(){return tF},D:function(){return nD},F:function(){return uv},H:function(){return ux},N:function(){return au},P:function(){return aN},Q:function(){return nA},R:function(){return Q},S:function(){return ri},T:function(){return O},Y:function(){return x},Z:function(){return nz},_:function(){return g},a:function(){return k},a$:function(){return n8},a0:function(){return r9},a1:function(){return nH},a2:function(){return nG},a3:function(){return tk},a5:function(){return um},a7:function(){return uf},a9:function(){return nL},aC:function(){return en},aR:function(){return nR},a_:function(){return u_},aa:function(){return t6},ab:function(){return ud},af:function(){return up},aq:function(){return tY},b:function(){return P},b4:function(){return n5},c:function(){return eO},d:function(){return I},e:function(){return S},f:function(){return re},g:function(){return nq},h:function(){return nW},i:function(){return tM},j:function(){return n0},k:function(){return rt},l:function(){return rr},m:function(){return ee},p:function(){return et},r:function(){return eZ},u:function(){return t5},v:function(){return G},w:function(){return X},y:function(){return Z},z:function(){return uE}});var n,s,i,a,o=r(3304),u=r(4534),l=r(3172),c=r(8650),h=r(4203),d=r(220);r(2601);var m=r(263).Buffer;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}f.UNAUTHENTICATED=new f(null),f.GOOGLE_CREDENTIALS=new f("google-credentials-uid"),f.FIRST_PARTY=new f("first-party-uid"),f.MOCK_USER=new f("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let p="12.15.0";function g(e){p=e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let y=new c.Yd("@firebase/firestore");function w(){return y.logLevel}function v(e,...t){if(y.logLevel<=c.in.DEBUG){let r=t.map(T);y.debug(`Firestore (${p}): ${e}`,...r)}}function _(e,...t){if(y.logLevel<=c.in.ERROR){let r=t.map(T);y.error(`Firestore (${p}): ${e}`,...r)}}function E(e,...t){if(y.logLevel<=c.in.WARN){let r=t.map(T);y.warn(`Firestore (${p}): ${e}`,...r)}}function T(e){if("string"==typeof e)return e;try{return JSON.stringify(e)}catch(t){return e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function x(e,t,r){let n="Unexpected state";"string"==typeof t?n=t:r=t,b(e,n,r)}function b(e,t,r){let n=`FIRESTORE (${p}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;if(void 0!==r)try{n+=" CONTEXT: "+JSON.stringify(r)}catch(e){n+=" CONTEXT: "+r}throw _(n),Error(n)}function N(e,t,r,n){let s="Unexpected state";"string"==typeof r?s=r:n=r,e||b(t,s,n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class I extends u.ZR{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class C{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class A{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(f.UNAUTHENTICATED))}shutdown(){}}class D{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class k{constructor(e){this.t=e,this.currentUser=f.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){N(void 0===this.o,42304);let r=this.i,n=e=>this.i!==r?(r=this.i,t(e)):Promise.resolve(),s=new V;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new V,e.enqueueRetryable(()=>n(this.currentUser))};let i=()=>{let t=s;e.enqueueRetryable(async()=>{await t.promise,await n(this.currentUser)})},a=e=>{v("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(e=>a(e)),setTimeout(()=>{if(!this.auth){let e=this.t.getImmediate({optional:!0});e?a(e):(v("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new V)}},0),i()}getToken(){let e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(t=>this.i!==e?(v("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):t?(N("string"==typeof t.accessToken,31837,{l:t}),new C(t.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return N(null===e||"string"==typeof e,2055,{h:e}),new f(e)}}class R{constructor(e,t,r){this.T=e,this.P=t,this.R=r,this.type="FirstParty",this.user=f.FIRST_PARTY,this.I=new Map}A(){return this.R?this.R():null}get headers(){this.I.set("X-Goog-AuthUser",this.T);let e=this.A();return e&&this.I.set("Authorization",e),this.P&&this.I.set("X-Goog-Iam-Authorization-Token",this.P),this.I}}class L{constructor(e,t,r){this.T=e,this.P=t,this.R=r}getToken(){return Promise.resolve(new R(this.T,this.P,this.R))}start(e,t){e.enqueueRetryable(()=>t(f.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class U{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class P{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,(0,o.rh)(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){N(void 0===this.o,3512);let r=e=>{null!=e.error&&v("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);let r=e.token!==this.m;return this.m=e.token,v("FirebaseAppCheckTokenProvider",`Received ${r?"new":"existing"} token.`),r?t(e.token):Promise.resolve()};this.o=t=>{e.enqueueRetryable(()=>r(t))};let n=e=>{v("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(e=>n(e)),setTimeout(()=>{if(!this.appCheck){let e=this.V.getImmediate({optional:!0});e?n(e):v("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new U(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(e=>e?(N("string"==typeof e.token,44558,{tokenResult:e}),this.m=e.token,new U(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{static newId(){let e=62*Math.floor(256/62),t="";for(;t.length<20;){let r=/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function(e){let t="undefined"!=typeof self&&(self.crypto||self.msCrypto),r=new Uint8Array(e);if(t&&"function"==typeof t.getRandomValues)t.getRandomValues(r);else for(let t=0;t<e;t++)r[t]=Math.floor(256*Math.random());return r}(40);for(let n=0;n<r.length;++n)t.length<20&&r[n]<e&&(t+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(r[n]%62))}return t}}function M(e,t){return e<t?-1:e>t?1:0}function F(e,t){let r=Math.min(e.length,t.length);for(let n=0;n<r;n++){let r=e.charAt(n),s=t.charAt(n);if(r!==s)return $(r)===$(s)?M(r,s):$(r)?1:-1}return M(e.length,t.length)}function $(e){let t=e.charCodeAt(0);return t>=55296&&t<=57343}function B(e,t,r){return e.length===t.length&&e.every((e,n)=>r(e,t[n]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let q="__name__";class z{constructor(e,t,r){void 0===t?t=0:t>e.length&&x(637,{offset:t,range:e.length}),void 0===r?r=e.length-t:r>e.length-t&&x(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return 0===z.comparator(this,e)}child(e){let t=this.segments.slice(this.offset,this.limit());return e instanceof z?e.forEach(e=>{t.push(e)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){let r=Math.min(e.length,t.length);for(let n=0;n<r;n++){let r=z.compareSegments(e.get(n),t.get(n));if(0!==r)return r}return M(e.length,t.length)}static compareSegments(e,t){let r=z.isNumericId(e),n=z.isNumericId(t);return r&&!n?-1:!r&&n?1:r&&n?z.extractNumericId(e).compare(z.extractNumericId(t)):F(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return l.z8.fromString(e.substring(4,e.length-2))}}class Q extends z{construct(e,t,r){return new Q(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let t=[];for(let r of e){if(r.indexOf("//")>=0)throw new I(S.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(e=>e.length>0))}return new Q(t)}static emptyPath(){return new Q([])}}let j=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class K extends z{construct(e,t,r){return new K(e,t,r)}static isValidIdentifier(e){return j.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),K.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===q}static keyField(){return new K([q])}static fromServerFormat(e){let t=[],r="",n=0,s=()=>{if(0===r.length)throw new I(S.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""},i=!1;for(;n<e.length;){let t=e[n];if("\\"===t){if(n+1===e.length)throw new I(S.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let t=e[n+1];if("\\"!==t&&"."!==t&&"`"!==t)throw new I(S.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=t,n+=2}else"`"===t?i=!i:"."!==t||i?r+=t:s(),n++}if(s(),i)throw new I(S.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new K(t)}static emptyPath(){return new K([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G{constructor(e){this.path=e}static fromPath(e){return new G(Q.fromString(e))}static fromName(e){return new G(Q.fromString(e).popFirst(5))}static empty(){return new G(Q.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===Q.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,t){return Q.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new G(new Q(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function H(e,t,r){if(!r)throw new I(S.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${t}.`)}function W(e){if(!G.isDocumentKey(e))throw new I(S.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`)}function Y(e){if(G.isDocumentKey(e))throw new I(S.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function J(e){return"object"==typeof e&&null!==e&&(Object.getPrototypeOf(e)===Object.prototype||null===Object.getPrototypeOf(e))}function X(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{var t;let r=(t=e).constructor?t.constructor.name:null;return r?`a custom ${r} object`:"an object"}}return"function"==typeof e?"a function":x(12329,{type:typeof e})}function Z(e,t){if("_delegate"in e&&(e=e._delegate),!(e instanceof t)){if(t.name===e.constructor.name)throw new I(S.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let r=X(e);throw new I(S.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${r}`)}}return e}function ee(e,t){if(t<=0)throw new I(S.INVALID_ARGUMENT,`Function ${e}() requires a positive number, but it was: ${t}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function et(e,t){let r={typeString:e};return t&&(r.value=t),r}function er(e,t){let r;if(!J(e))throw new I(S.INVALID_ARGUMENT,"JSON must be an object");for(let n in t)if(t[n]){let s=t[n].typeString,i="value"in t[n]?{value:t[n].value}:void 0;if(!(n in e)){r=`JSON missing required field: '${n}'`;break}let a=e[n];if(s&&typeof a!==s){r=`JSON field '${n}' must be a ${s}.`;break}if(void 0!==i&&a!==i.value){r=`Expected '${n}' field to equal '${i.value}'`;break}}if(r)throw new I(S.INVALID_ARGUMENT,r);return!0}class en{static now(){return en.fromMillis(Date.now())}static fromDate(e){return en.fromMillis(e.getTime())}static fromMillis(e){let t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*1e6);return new en(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0||t>=1e9)throw new I(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800||e>=253402300800)throw new I(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?M(this.nanoseconds,e.nanoseconds):M(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:en._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(er(e,en._jsonSchema))return new en(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}en._jsonSchemaVersion="firestore/timestamp/1.0",en._jsonSchema={type:et("string",en._jsonSchemaVersion),seconds:et("number"),nanoseconds:et("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class es{static fromTimestamp(e){return new es(e)}static min(){return new es(new en(0,0))}static max(){return new es(new en(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}class ei{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new ei(es.min(),G.empty(),-1)}static max(){return new ei(es.max(),G.empty(),-1)}}class ea{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eo(e){if(e.code!==S.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==e.message)throw e;v("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eu{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&x(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new eu((r,n)=>{this.nextCallback=t=>{this.wrapSuccess(e,t).next(r,n)},this.catchCallback=e=>{this.wrapFailure(t,e).next(r,n)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{let t=e();return t instanceof eu?t:eu.resolve(t)}catch(e){return eu.reject(e)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):eu.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):eu.reject(t)}static resolve(e){return new eu((t,r)=>{t(e)})}static reject(e){return new eu((t,r)=>{r(e)})}static waitFor(e){return new eu((t,r)=>{let n=0,s=0,i=!1;e.forEach(e=>{++n,e.next(()=>{++s,i&&s===n&&t()},e=>r(e))}),i=!0,s===n&&t()})}static or(e){let t=eu.resolve(!1);for(let r of e)t=t.next(e=>e?eu.resolve(e):r());return t}static forEach(e,t){let r=[];return e.forEach((e,n)=>{r.push(t.call(this,e,n))}),this.waitFor(r)}static mapArray(e,t){return new eu((r,n)=>{let s=e.length,i=Array(s),a=0;for(let o=0;o<s;o++){let u=o;t(e[u]).next(e=>{i[u]=e,++a===s&&r(i)},e=>n(e))}})}static doWhile(e,t){return new eu((r,n)=>{let s=()=>{!0===e()?t().next(()=>{s()},n):r()};s()})}}function el(e){return"IndexedDbTransactionError"===e.name}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ec{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=e=>this.ae(e),this.ue=e=>t.writeSequenceNumber(e))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}}function eh(e){return 0===e&&1/e==-1/0}ec.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ed{constructor(e,t){this.comparator=e,this.root=t||ef.EMPTY}insert(e,t){return new ed(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ef.BLACK,null,null))}remove(e){return new ed(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ef.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){let r=this.comparator(e,t.key);if(0===r)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){let n=this.comparator(e,r.key);if(0===n)return t+r.left.size;n<0?r=r.left:(t+=r.left.size+1,r=r.right)}return -1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){let e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new em(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new em(this.root,e,this.comparator,!1)}getReverseIterator(){return new em(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new em(this.root,e,this.comparator,!0)}}class em{constructor(e,t,r,n){this.isReverse=n,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&n&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(0===s){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ef{constructor(e,t,r,n,s){this.key=e,this.value=t,this.color=null!=r?r:ef.RED,this.left=null!=n?n:ef.EMPTY,this.right=null!=s?s:ef.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,n,s){return new ef(null!=e?e:this.key,null!=t?t:this.value,null!=r?r:this.color,null!=n?n:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let n=this,s=r(e,n.key);return(n=s<0?n.copy(null,null,null,n.left.insert(e,t,r),null):0===s?n.copy(null,t,null,null,null):n.copy(null,null,null,null,n.right.insert(e,t,r))).fixUp()}removeMin(){if(this.left.isEmpty())return ef.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),(e=e.copy(null,null,null,e.left.removeMin(),null)).fixUp()}remove(e,t){let r,n=this;if(0>t(e,n.key))n.left.isEmpty()||n.left.isRed()||n.left.left.isRed()||(n=n.moveRedLeft()),n=n.copy(null,null,null,n.left.remove(e,t),null);else{if(n.left.isRed()&&(n=n.rotateRight()),n.right.isEmpty()||n.right.isRed()||n.right.left.isRed()||(n=n.moveRedRight()),0===t(e,n.key)){if(n.right.isEmpty())return ef.EMPTY;r=n.right.min(),n=n.copy(r.key,r.value,null,null,n.right.removeMin())}n=n.copy(null,null,null,null,n.right.remove(e,t))}return n.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=(e=(e=e.copy(null,null,null,null,e.right.rotateRight())).rotateLeft()).colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=(e=e.rotateRight()).colorFlip()),e}rotateLeft(){let e=this.copy(null,null,ef.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,ef.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw x(43730,{key:this.key,value:this.value});if(this.right.isRed())throw x(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw x(27949);return e+(this.isRed()?0:1)}}ef.EMPTY=null,ef.RED=!0,ef.BLACK=!1,ef.EMPTY=new class{constructor(){this.size=0}get key(){throw x(57766)}get value(){throw x(16141)}get color(){throw x(16727)}get left(){throw x(29726)}get right(){throw x(36894)}copy(e,t,r,n,s){return this}insert(e,t,r){return new ef(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ep{constructor(e){this.comparator=e,this.data=new ed(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){let r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){let n=r.getNext();if(this.comparator(n.key,e[1])>=0)return;t(n.key)}}forEachWhile(e,t){let r;for(r=void 0!==t?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){let t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new eg(this.data.getIterator())}getIteratorFrom(e){return new eg(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(e=>{t=t.add(e)}),t}isEqual(e){if(!(e instanceof ep)||this.size!==e.size)return!1;let t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){let e=t.getNext().key,n=r.getNext().key;if(0!==this.comparator(e,n))return!1}return!0}toArray(){let e=[];return this.forEach(t=>{e.push(t)}),e}toString(){let e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){let t=new ep(this.comparator);return t.data=e,t}}class eg{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ey{constructor(e){this.fields=e,e.sort(K.comparator)}static empty(){return new ey([])}unionWith(e){let t=new ep(K.comparator);for(let e of this.fields)t=t.add(e);for(let r of e)t=t.add(r);return new ey(t.toArray())}covers(e){for(let t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return B(this.fields,e.fields,(e,t)=>e.isEqual(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ew(e){let t=0;for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&t++;return t}function ev(e,t){for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&t(r,e[r])}function e_(e){for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eE extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eT{constructor(e){this.binaryString=e}static fromBase64String(e){let t=function(e){try{return atob(e)}catch(e){throw"undefined"!=typeof DOMException&&e instanceof DOMException?new eE("Invalid base64 string: "+e):e}}(e);return new eT(t)}static fromUint8Array(e){let t=function(e){let t="";for(let r=0;r<e.length;++r)t+=String.fromCharCode(e[r]);return t}(e);return new eT(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return btoa(this.binaryString)}toUint8Array(){return function(e){let t=new Uint8Array(e.length);for(let r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return M(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}eT.EMPTY_BYTE_STRING=new eT("");let ex=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function eb(e){if(N(!!e,39018),"string"==typeof e){let t=0,r=ex.exec(e);if(N(!!r,46558,{timestamp:e}),r[1]){let e=r[1];t=Number(e=(e+"000000000").substr(0,9))}let n=new Date(e);return{seconds:Math.floor(n.getTime()/1e3),nanos:t}}return{seconds:eN(e.seconds),nanos:eN(e.nanos)}}function eN(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function eS(e){return"string"==typeof e?eT.fromBase64String(e):eT.fromUint8Array(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let eI="server_timestamp",eV="__type__",eC="__previous_value__",eA="__local_write_time__";function eD(e){let t=(e?.mapValue?.fields||{})[eV]?.stringValue;return t===eI}function ek(e){let t=e.mapValue.fields[eC];return eD(t)?ek(t):t}function eR(e){let t=eb(e.mapValue.fields[eA].timestampValue);return new en(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eL{constructor(e,t,r,n,s,i,a,o,u,l,c){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=n,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=a,this.longPollingOptions=o,this.useFetchStreams=u,this.isUsingEmulator=l,this.apiKey=c}}let eU="(default)";class eP{constructor(e,t){this.projectId=e,this.database=t||eU}static empty(){return new eP("","")}get isDefaultDatabase(){return this.database===eU}isEqual(e){return e instanceof eP&&e.projectId===this.projectId&&e.database===this.database}}function eO(e,t){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new I(S.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new eP(e.options.projectId,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let eM="__type__",eF="__max__",e$={mapValue:{fields:{__type__:{stringValue:eF}}}},eB="__vector__",eq="value",ez={nullValue:"NULL_VALUE"},eQ={booleanValue:!0},ej={booleanValue:!1};function eK(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?eD(e)?4:te(e)?9007199254740991:e5(e)?10:11:x(28295,{value:e})}function eG(e,t,r){if(e===t)return!0;let n=eK(e);if(n!==eK(t))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===t.booleanValue;case 4:return eR(e).isEqual(eR(t));case 3:return function(e,t){if("string"==typeof e.timestampValue&&"string"==typeof t.timestampValue&&e.timestampValue.length===t.timestampValue.length)return e.timestampValue===t.timestampValue;let r=eb(e.timestampValue),n=eb(t.timestampValue);return r.seconds===n.seconds&&r.nanos===n.nanos}(e,t);case 5:return e.stringValue===t.stringValue;case 6:return eS(e.bytesValue).isEqual(eS(t.bytesValue));case 7:return e.referenceValue===t.referenceValue;case 8:return eN(e.geoPointValue.latitude)===eN(t.geoPointValue.latitude)&&eN(e.geoPointValue.longitude)===eN(t.geoPointValue.longitude);case 2:return function(e,t,r){let n,s;if("integerValue"in e&&"integerValue"in t)return eN(e.integerValue)===eN(t.integerValue);if("doubleValue"in e&&"doubleValue"in t)n=eN(e.doubleValue),s=eN(t.doubleValue);else{if(!r?.Ee)return!1;n=eN(e.integerValue??e.doubleValue),s=eN(t.integerValue??t.doubleValue)}return n===s?!!r?.he||eh(n)===eh(s):!!(void 0===r||r.Te)&&isNaN(n)&&isNaN(s)}(e,t,r);case 9:return B(e.arrayValue.values||[],t.arrayValue.values||[],(e,t)=>eG(e,t,r));case 10:case 11:return function(e,t,r){let n=e.mapValue.fields||{},s=t.mapValue.fields||{};if(ew(n)!==ew(s))return!1;for(let e in n)if(n.hasOwnProperty(e)&&(void 0===s[e]||!eG(n[e],s[e],r)))return!1;return!0}(e,t,r);default:return x(52216,{left:e})}}function eH(e,t){return void 0!==(e.values||[]).find(e=>eG(e,t))}function eW(e,t){if(e===t)return 0;let r=eK(e),n=eK(t);if(r!==n)return M(r,n);switch(r){case 0:case 9007199254740991:return 0;case 1:return M(e.booleanValue,t.booleanValue);case 2:return function(e,t){let r=eN(e.integerValue||e.doubleValue),n=eN(t.integerValue||t.doubleValue);return r<n?-1:r>n?1:r===n?0:isNaN(r)?isNaN(n)?0:-1:1}(e,t);case 3:return eY(e.timestampValue,t.timestampValue);case 4:return eY(eR(e),eR(t));case 5:return F(e.stringValue,t.stringValue);case 6:return function(e,t){let r=eS(e),n=eS(t);return r.compareTo(n)}(e.bytesValue,t.bytesValue);case 7:return function(e,t){let r=e.split("/"),n=t.split("/");for(let e=0;e<r.length&&e<n.length;e++){let t=M(r[e],n[e]);if(0!==t)return t}return M(r.length,n.length)}(e.referenceValue,t.referenceValue);case 8:return function(e,t){let r=M(eN(e.latitude),eN(t.latitude));return 0!==r?r:M(eN(e.longitude),eN(t.longitude))}(e.geoPointValue,t.geoPointValue);case 9:return eJ(e.arrayValue,t.arrayValue);case 10:return function(e,t){let r=e.fields||{},n=t.fields||{},s=r[eq]?.arrayValue,i=n[eq]?.arrayValue,a=M(s?.values?.length||0,i?.values?.length||0);return 0!==a?a:eJ(s,i)}(e.mapValue,t.mapValue);case 11:return function(e,t){if(e===e$.mapValue&&t===e$.mapValue)return 0;if(e===e$.mapValue)return 1;if(t===e$.mapValue)return -1;let r=e.fields||{},n=Object.keys(r),s=t.fields||{},i=Object.keys(s);n.sort(),i.sort();for(let e=0;e<n.length&&e<i.length;++e){let t=F(n[e],i[e]);if(0!==t)return t;let a=eW(r[n[e]],s[i[e]]);if(0!==a)return a}return M(n.length,i.length)}(e.mapValue,t.mapValue);default:throw x(23264,{Pe:r})}}function eY(e,t){if("string"==typeof e&&"string"==typeof t&&e.length===t.length)return M(e,t);let r=eb(e),n=eb(t),s=M(r.seconds,n.seconds);return 0!==s?s:M(r.nanos,n.nanos)}function eJ(e,t){let r=e.values||[],n=t.values||[];for(let e=0;e<r.length&&e<n.length;++e){let t=eW(r[e],n[e]);if(void 0!==t&&0!==t)return t}return M(r.length,n.length)}function eX(e){var t,r;return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){let t=eb(e);return`time(${t.seconds},${t.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?eS(e.bytesValue).toBase64():"referenceValue"in e?(t=e.referenceValue,G.fromName(t).toString()):"geoPointValue"in e?(r=e.geoPointValue,`geo(${r.latitude},${r.longitude})`):"arrayValue"in e?function(e){let t="[",r=!0;for(let n of e.values||[])r?r=!1:t+=",",t+=eX(n);return t+"]"}(e.arrayValue):"mapValue"in e?function(e){let t=Object.keys(e.fields||{}).sort(),r="{",n=!0;for(let s of t)n?n=!1:r+=",",r+=`${s}:${eX(e.fields[s])}`;return r+"}"}(e.mapValue):x(61005,{value:e})}function eZ(e,t){return{referenceValue:`projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}`}}function e0(e){return!!e&&"integerValue"in e}function e1(e){return!!e&&"doubleValue"in e}function e2(e){return e0(e)||e1(e)}function e3(e){return!!e&&"arrayValue"in e}function e4(e){return!!e&&"nullValue"in e}function e6(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function e9(e){return!!e&&"mapValue"in e}function e5(e){let t=(e?.mapValue?.fields||{})[eM]?.stringValue;return t===eB}function e8(e){return(e?.mapValue?.fields||{})[eq]?.arrayValue}function e7(e){if(e.geoPointValue)return{geoPointValue:{...e.geoPointValue}};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:{...e.timestampValue}};if(e.mapValue){let t={mapValue:{fields:{}}};return ev(e.mapValue.fields,(e,r)=>t.mapValue.fields[e]=e7(r)),t}if(e.arrayValue){let t={arrayValue:{values:[]}};for(let r=0;r<(e.arrayValue.values||[]).length;++r)t.arrayValue.values[r]=e7(e.arrayValue.values[r]);return t}return{...e}}function te(e){return(((e.mapValue||{}).fields||{}).__type__||{}).stringValue===eF}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(e){this.value=e}static empty(){return new tt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(!e9(t=(t.mapValue.fields||{})[e.get(r)]))return null;return(t=(t.mapValue.fields||{})[e.lastSegment()])||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=e7(t)}setAll(e){let t=K.emptyPath(),r={},n=[];e.forEach((e,s)=>{if(!t.isImmediateParentOf(s)){let e=this.getFieldsMap(t);this.applyChanges(e,r,n),r={},n=[],t=s.popLast()}e?r[s.lastSegment()]=e7(e):n.push(s.lastSegment())});let s=this.getFieldsMap(t);this.applyChanges(s,r,n)}delete(e){let t=this.field(e.popLast());e9(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return eG(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let n=t.mapValue.fields[e.get(r)];e9(n)&&n.mapValue.fields||(n={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=n),t=n}return t.mapValue.fields}applyChanges(e,t,r){for(let n of(ev(t,(t,r)=>e[t]=r),r))delete e[n]}clone(){return new tt(e7(this.value))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tr(e,t){if(e.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:eh(t)?"-0":t}}function tn(e){return{integerValue:""+e}}function ts(e,t,r){return Number.isInteger(t)&&r?.preferIntegers||"number"==typeof t&&Number.isInteger(t)&&!eh(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER?tn(t):tr(e,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ti{constructor(){this._=void 0}}function ta(e,t){return e instanceof tm?e2(t)?t:{integerValue:0}:null}class to extends ti{}class tu extends ti{constructor(e){super(),this.elements=e}}function tl(e,t){let r=tw(t);for(let t of e.elements)r.some(e=>eG(e,t))||r.push(t);return{arrayValue:{values:r}}}class tc extends ti{constructor(e){super(),this.elements=e}}function th(e,t){let r=tw(t);for(let t of e.elements)r=r.filter(e=>!eG(e,t));return{arrayValue:{values:r}}}class td extends ti{constructor(e,t){super(),this.serializer=e,this.Re=t}}class tm extends td{}class tf extends td{}class tp extends td{}function tg(e,t,r){if(!e2(t))return e.Re;let n=r(ty(t),ty(e.Re));return e0(t)&&e0(e.Re)?tn(n):tr(e.serializer,n)}function ty(e){return eN(e.integerValue||e.doubleValue)}function tw(e){return e3(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tv{constructor(e,t){this.field=e,this.transform=t}}class t_{constructor(e,t){this.version=e,this.transformResults=t}}class tE{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new tE}static exists(e){return new tE(void 0,e)}static updateTime(e){return new tE(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function tT(e,t){return void 0!==e.updateTime?t.isFoundDocument()&&t.version.isEqual(e.updateTime):void 0===e.exists||e.exists===t.isFoundDocument()}class tx{}function tb(e,t){if(!e.hasLocalMutations||t&&0===t.fields.length)return null;if(null===t)return e.isNoDocument()?new tk(e.key,tE.none()):new tI(e.key,e.data,tE.none());{let r=e.data,n=tt.empty(),s=new ep(K.comparator);for(let e of t.fields)if(!s.has(e)){let t=r.field(e);null===t&&e.length>1&&(e=e.popLast(),t=r.field(e)),null===t?n.delete(e):n.set(e,t),s=s.add(e)}return new tV(e.key,n,new ey(s.toArray()),tE.none())}}function tN(e,t,r,n){return e instanceof tI?function(e,t,r,n){if(!tT(e.precondition,t))return r;let s=e.value.clone(),i=tD(e.fieldTransforms,n,t);return s.setAll(i),t.convertToFoundDocument(t.version,s).setHasLocalMutations(),null}(e,t,r,n):e instanceof tV?function(e,t,r,n){if(!tT(e.precondition,t))return r;let s=tD(e.fieldTransforms,n,t),i=t.data;return(i.setAll(tC(e)),i.setAll(s),t.convertToFoundDocument(t.version,i).setHasLocalMutations(),null===r)?null:r.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(e=>e.field))}(e,t,r,n):tT(e.precondition,t)?(t.convertToNoDocument(t.version).setHasLocalMutations(),null):r}function tS(e,t){var r,n;return e.type===t.type&&!!e.key.isEqual(t.key)&&!!e.precondition.isEqual(t.precondition)&&(r=e.fieldTransforms,n=t.fieldTransforms,!!(void 0===r&&void 0===n||!(!r||!n)&&B(r,n,(e,t)=>{var r,n;return e.field.isEqual(t.field)&&(r=e.transform,n=t.transform,r instanceof tu&&n instanceof tu||r instanceof tc&&n instanceof tc?B(r.elements,n.elements,eG):r instanceof tm&&n instanceof tm||r instanceof tf&&n instanceof tf||r instanceof tp&&n instanceof tp?eG(r.Re,n.Re):r instanceof to&&n instanceof to)})))&&(0===e.type?e.value.isEqual(t.value):1!==e.type||e.data.isEqual(t.data)&&e.fieldMask.isEqual(t.fieldMask))}class tI extends tx{constructor(e,t,r,n=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=n,this.type=0}getFieldMask(){return null}}class tV extends tx{constructor(e,t,r,n,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=n,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function tC(e){let t=new Map;return e.fieldMask.fields.forEach(r=>{if(!r.isEmpty()){let n=e.data.field(r);t.set(r,n)}}),t}function tA(e,t,r){let n=new Map;N(e.length===r.length,32656,{Ie:r.length,Ae:e.length});for(let i=0;i<r.length;i++){var s;let a=e[i],o=a.transform,u=t.data.field(a.field);n.set(a.field,(s=r[i],o instanceof tu?tl(o,u):o instanceof tc?th(o,u):s))}return n}function tD(e,t,r){let n=new Map;for(let s of e){let e=s.transform,i=r.data.field(s.field);n.set(s.field,e instanceof to?function(e,t){let r={fields:{[eV]:{stringValue:eI},[eA]:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return t&&eD(t)&&(t=ek(t)),t&&(r.fields[eC]=t),{mapValue:r}}(t,i):e instanceof tu?tl(e,i):e instanceof tc?th(e,i):e instanceof tm?function(e,t){let r=ta(e,t),n=ty(r)+ty(e.Re);return e0(r)&&e0(e.Re)?tn(n):tr(e.serializer,n)}(e,i):e instanceof tf?tg(e,i,Math.min):e instanceof tp?tg(e,i,Math.max):void 0)}return n}class tk extends tx{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class tR extends tx{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tL{constructor(e,t){this.position=e,this.inclusive=t}}function tU(e,t,r){let n=0;for(let s=0;s<e.position.length;s++){let i=t[s],a=e.position[s];if(n=i.field.isKeyField()?G.comparator(G.fromName(a.referenceValue),r.key):eW(a,r.data.field(i.field)),"desc"===i.dir&&(n*=-1),0!==n)break}return n}function tP(e,t){if(null===e)return null===t;if(null===t||e.inclusive!==t.inclusive||e.position.length!==t.position.length)return!1;for(let r=0;r<e.position.length;r++)if(!eG(e.position[r],t.position[r]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tO{}class tM extends tO{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?"in"===t||"not-in"===t?this.createKeyFieldInFilter(e,t,r):new tq(e,t,r):"array-contains"===t?new tK(e,r):"in"===t?new tG(e,r):"not-in"===t?new tH(e,r):"array-contains-any"===t?new tW(e,r):new tM(e,t,r)}static createKeyFieldInFilter(e,t,r){return"in"===t?new tz(e,r):new tQ(e,r)}matches(e){let t=e.data.field(this.field);return"!="===this.op?null!==t&&void 0===t.nullValue&&this.matchesComparison(eW(t,this.value)):null!==t&&eK(this.value)===eK(t)&&this.matchesComparison(eW(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return x(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class tF extends tO{constructor(e,t){super(),this.filters=e,this.op=t,this.Ve=null}static create(e,t){return new tF(e,t)}matches(e){return t$(this)?void 0===this.filters.find(t=>!t.matches(e)):void 0!==this.filters.find(t=>t.matches(e))}getFlattenedFilters(){return null!==this.Ve||(this.Ve=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Ve}getFilters(){return Object.assign([],this.filters)}}function t$(e){return"and"===e.op}function tB(e){for(let t of e.filters)if(t instanceof tF)return!1;return!0}class tq extends tM{constructor(e,t,r){super(e,t,r),this.key=G.fromName(r.referenceValue)}matches(e){let t=G.comparator(e.key,this.key);return this.matchesComparison(t)}}class tz extends tM{constructor(e,t){super(e,"in",t),this.keys=tj("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class tQ extends tM{constructor(e,t){super(e,"not-in",t),this.keys=tj("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function tj(e,t){return(t.arrayValue?.values||[]).map(e=>G.fromName(e.referenceValue))}class tK extends tM{constructor(e,t){super(e,"array-contains",t)}matches(e){let t=e.data.field(this.field);return e3(t)&&eH(t.arrayValue,this.value)}}class tG extends tM{constructor(e,t){super(e,"in",t)}matches(e){let t=e.data.field(this.field);return null!==t&&eH(this.value.arrayValue,t)}}class tH extends tM{constructor(e,t){super(e,"not-in",t)}matches(e){if(eH(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let t=e.data.field(this.field);return null!==t&&void 0===t.nullValue&&!eH(this.value.arrayValue,t)}}class tW extends tM{constructor(e,t){super(e,"array-contains-any",t)}matches(e){let t=e.data.field(this.field);return!(!e3(t)||!t.arrayValue.values)&&t.arrayValue.values.some(e=>eH(this.value.arrayValue,e))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tY{constructor(e,t="asc"){this.field=e,this.dir=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tJ{constructor(e,t,r,n,s,i,a){this.key=e,this.documentType=t,this.version=r,this.readTime=n,this.createTime=s,this.data=i,this.documentState=a}static newInvalidDocument(e){return new tJ(e,0,es.min(),es.min(),es.min(),tt.empty(),0)}static newFoundDocument(e,t,r,n){return new tJ(e,1,t,es.min(),r,n,0)}static newNoDocument(e,t){return new tJ(e,2,t,es.min(),es.min(),tt.empty(),0)}static newUnknownDocument(e,t){return new tJ(e,3,t,es.min(),es.min(),tt.empty(),2)}convertToFoundDocument(e,t){return this.createTime.isEqual(es.min())&&(2===this.documentType||0===this.documentType)&&(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=tt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=tt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=es.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof tJ&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new tJ(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tX{constructor(e,t=null,r=[],n=[],s=null,i=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=n,this.limit=s,this.startAt=i,this.endAt=a,this.de=null}}function tZ(e,t=null,r=[],n=[],s=null,i=null,a=null){return new tX(e,t,r,n,s,i,a)}function t0(e){if(null===e.de){let t=e.path.canonicalString();null!==e.collectionGroup&&(t+="|cg:"+e.collectionGroup),t+="|f:"+e.filters.map(e=>(function e(t){if(t instanceof tM)return t.field.canonicalString()+t.op.toString()+eX(t.value);if(tB(t)&&t$(t))return t.filters.map(t=>e(t)).join(",");{let r=t.filters.map(t=>e(t)).join(",");return`${t.op}(${r})`}})(e)).join(",")+"|ob:"+e.orderBy.map(e=>e.field.canonicalString()+e.dir).join(","),null==e.limit||(t+="|l:"+e.limit),e.startAt&&(t+="|lb:"+(e.startAt.inclusive?"b:":"a:")+e.startAt.position.map(e=>eX(e)).join(",")),e.endAt&&(t+="|ub:"+(e.endAt.inclusive?"a:":"b:")+e.endAt.position.map(e=>eX(e)).join(",")),e.de=t}return e.de}function t1(e,t){if(e.limit!==t.limit||e.orderBy.length!==t.orderBy.length)return!1;for(let s=0;s<e.orderBy.length;s++){var r,n;if(r=e.orderBy[s],n=t.orderBy[s],!(r.dir===n.dir&&r.field.isEqual(n.field)))return!1}if(e.filters.length!==t.filters.length)return!1;for(let r=0;r<e.filters.length;r++)if(!function e(t,r){return t instanceof tM?r instanceof tM&&t.op===r.op&&t.field.isEqual(r.field)&&eG(t.value,r.value):t instanceof tF?r instanceof tF&&t.op===r.op&&t.filters.length===r.filters.length&&t.filters.reduce((t,n,s)=>t&&e(n,r.filters[s]),!0):void x(19439)}(e.filters[r],t.filters[r]))return!1;return e.collectionGroup===t.collectionGroup&&!!e.path.isEqual(t.path)&&!!tP(e.startAt,t.startAt)&&tP(e.endAt,t.endAt)}function t2(e){return!!e.isCorePipeline}function t3(e){return!!e.path&&G.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t4{constructor(e,t=null,r=[],n=[],s=null,i="F",a=null,o=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=n,this.limit=s,this.limitType=i,this.startAt=a,this.endAt=o,this.fe=null,this.me=null,this.pe=null,this.startAt,this.endAt}}function t6(e){return new t4(e)}function t9(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function t5(e){return null!==e.collectionGroup}function t8(e){if(null===e.fe){let t;e.fe=[];let r=new Set;for(let t of e.explicitOrderBy)e.fe.push(t),r.add(t.field.canonicalString());let n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc",s=(t=new ep(K.comparator),e.filters.forEach(e=>{e.getFlattenedFilters().forEach(e=>{e.isInequality()&&(t=t.add(e.field))})}),t);s.forEach(t=>{r.has(t.canonicalString())||t.isKeyField()||e.fe.push(new tY(t,n))}),r.has(K.keyField().canonicalString())||e.fe.push(new tY(K.keyField(),n))}return e.fe}function t7(e){return e.me||(e.me=function(e,t){if("F"===e.limitType)return tZ(e.path,e.collectionGroup,t,e.filters,e.limit,e.startAt,e.endAt);{t=t.map(e=>{let t="desc"===e.dir?"asc":"desc";return new tY(e.field,t)});let r=e.endAt?new tL(e.endAt.position,e.endAt.inclusive):null,n=e.startAt?new tL(e.startAt.position,e.startAt.inclusive):null;return tZ(e.path,e.collectionGroup,t,e.filters,e.limit,r,n)}}(e,t8(e))),e.me}function re(e,t){let r=e.filters.concat([t]);return new t4(e.path,e.collectionGroup,e.explicitOrderBy.slice(),r,e.limit,e.limitType,e.startAt,e.endAt)}function rt(e,t){let r=e.explicitOrderBy.concat([t]);return new t4(e.path,e.collectionGroup,r,e.filters.slice(),e.limit,e.limitType,e.startAt,e.endAt)}function rr(e,t,r){return new t4(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),t,r,e.startAt,e.endAt)}function rn(e){var t;let r;return`Query(target=${r=(t=t7(e)).path.canonicalString(),null!==t.collectionGroup&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(e=>(function e(t){return t instanceof tM?`${t.field.canonicalString()} ${t.op} ${eX(t.value)}`:t instanceof tF?t.op.toString()+" {"+t.getFilters().map(e).join(" ,")+"}":"Filter"})(e)).join(", ")}]`),null==t.limit||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(e=>`${e.field.canonicalString()} (${e.dir})`).join(", ")}]`),t.startAt&&(r+=", startAt: "+(t.startAt.inclusive?"b:":"a:")+t.startAt.position.map(e=>eX(e)).join(",")),t.endAt&&(r+=", endAt: "+(t.endAt.inclusive?"a:":"b:")+t.endAt.position.map(e=>eX(e)).join(",")),`Target(${r})`}; limitType=${e.limitType})`}function rs(e,t){return t.isFoundDocument()&&function(e,t){let r=t.key.path;return null!==e.collectionGroup?t.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(r):G.isDocumentKey(e.path)?e.path.isEqual(r):e.path.isImmediateParentOf(r)}(e,t)&&function(e,t){for(let r of t8(e))if(!r.field.isKeyField()&&null===t.data.field(r.field))return!1;return!0}(e,t)&&function(e,t){for(let r of e.filters)if(!r.matches(t))return!1;return!0}(e,t)&&(!e.startAt||!!function(e,t,r){let n=tU(e,t,r);return e.inclusive?n<=0:n<0}(e.startAt,t8(e),t))&&(!e.endAt||!!function(e,t,r){let n=tU(e,t,r);return e.inclusive?n>=0:n>0}(e.endAt,t8(e),t))}function ri(e){return(t,r)=>{let n=!1;for(let s of t8(e)){let e=function(e,t,r){let n=e.field.isKeyField()?G.comparator(t.key,r.key):function(e,t,r){let n=t.data.field(e),s=r.data.field(e);return null!==n&&null!==s?eW(n,s):x(42886)}(e.field,t,r);switch(e.dir){case"asc":return n;case"desc":return -1*n;default:return x(19790,{direction:e.dir})}}(s,t,r);if(0!==e)return e;n=n||s.field.isKeyField()}return 0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ra{constructor(e,t){this.count=e,this.unchangedNames=t}}function ro(e){if(void 0===e)return _("GRPC error has no .code"),S.UNKNOWN;switch(e){case s.OK:return S.OK;case s.CANCELLED:return S.CANCELLED;case s.UNKNOWN:return S.UNKNOWN;case s.DEADLINE_EXCEEDED:return S.DEADLINE_EXCEEDED;case s.RESOURCE_EXHAUSTED:return S.RESOURCE_EXHAUSTED;case s.INTERNAL:return S.INTERNAL;case s.UNAVAILABLE:return S.UNAVAILABLE;case s.UNAUTHENTICATED:return S.UNAUTHENTICATED;case s.INVALID_ARGUMENT:return S.INVALID_ARGUMENT;case s.NOT_FOUND:return S.NOT_FOUND;case s.ALREADY_EXISTS:return S.ALREADY_EXISTS;case s.PERMISSION_DENIED:return S.PERMISSION_DENIED;case s.FAILED_PRECONDITION:return S.FAILED_PRECONDITION;case s.ABORTED:return S.ABORTED;case s.OUT_OF_RANGE:return S.OUT_OF_RANGE;case s.UNIMPLEMENTED:return S.UNIMPLEMENTED;case s.DATA_LOSS:return S.DATA_LOSS;default:return x(39323,{code:e})}}(i=s||(s={}))[i.OK=0]="OK",i[i.CANCELLED=1]="CANCELLED",i[i.UNKNOWN=2]="UNKNOWN",i[i.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",i[i.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",i[i.NOT_FOUND=5]="NOT_FOUND",i[i.ALREADY_EXISTS=6]="ALREADY_EXISTS",i[i.PERMISSION_DENIED=7]="PERMISSION_DENIED",i[i.UNAUTHENTICATED=16]="UNAUTHENTICATED",i[i.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",i[i.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",i[i.ABORTED=10]="ABORTED",i[i.OUT_OF_RANGE=11]="OUT_OF_RANGE",i[i.UNIMPLEMENTED=12]="UNIMPLEMENTED",i[i.INTERNAL=13]="INTERNAL",i[i.UNAVAILABLE=14]="UNAVAILABLE",i[i.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ru{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){let t=this.mapKeyFn(e),r=this.inner[t];if(void 0!==r){for(let[t,n]of r)if(this.equalsFn(t,e))return n}}has(e){return void 0!==this.get(e)}set(e,t){let r=this.mapKeyFn(e),n=this.inner[r];if(void 0===n)return this.inner[r]=[[e,t]],void this.innerSize++;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],e))return void(n[r]=[e,t]);n.push([e,t]),this.innerSize++}delete(e){let t=this.mapKeyFn(e),r=this.inner[t];if(void 0===r)return!1;for(let n=0;n<r.length;n++)if(this.equalsFn(r[n][0],e))return 1===r.length?delete this.inner[t]:r.splice(n,1),this.innerSize--,!0;return!1}forEach(e){ev(this.inner,(t,r)=>{for(let[t,n]of r)e(t,n)})}isEmpty(){return e_(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let rl=new ed(G.comparator),rc=new ed(G.comparator);function rh(...e){let t=rc;for(let r of e)t=t.insert(r.key,r);return t}function rd(e){let t=rc;return e.forEach((e,r)=>t=t.insert(e,r.overlayedDocument)),t}function rm(){return new ru(e=>e.toString(),(e,t)=>e.isEqual(t))}let rf=new ed(G.comparator),rp=new ep(G.comparator);function rg(...e){let t=rp;for(let r of e)t=t.add(r);return t}let ry=new ep(M),rw=new l.z8([4294967295,4294967295],0);function rv(e){let t=(new TextEncoder).encode(e),r=new l.V8;return r.update(t),new Uint8Array(r.digest())}function r_(e){let t=new DataView(e.buffer),r=t.getUint32(0,!0),n=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new l.z8([r,n],0),new l.z8([s,i],0)]}class rE{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new rT(`Invalid padding: ${t}`);if(r<0||e.length>0&&0===this.hashCount)throw new rT(`Invalid hash count: ${r}`);if(0===e.length&&0!==t)throw new rT(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.ye=l.z8.fromNumber(this.ge)}we(e,t,r){let n=e.add(t.multiply(l.z8.fromNumber(r)));return 1===n.compare(rw)&&(n=new l.z8([n.getBits(0),n.getBits(1)],0)),n.modulo(this.ye).toNumber()}be(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.ge)return!1;let t=rv(e),[r,n]=r_(t);for(let e=0;e<this.hashCount;e++){let t=this.we(r,n,e);if(!this.be(t))return!1}return!0}static create(e,t,r){let n=new Uint8Array(Math.ceil(e/8)),s=new rE(n,e%8==0?0:8-e%8,t);return r.forEach(e=>s.insert(e)),s}insert(e){if(0===this.ge)return;let t=rv(e),[r,n]=r_(t);for(let e=0;e<this.hashCount;e++){let t=this.we(r,n,e);this.ve(t)}}ve(e){this.bitmap[Math.floor(e/8)]|=1<<e%8}}class rT extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rx{constructor(e,t,r,n,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=n,this.augmentedDocumentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){let n=new Map;return n.set(e,rb.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new rx(es.min(),n,new ed(M),rl,rl,rg())}}class rb{constructor(e,t,r,n,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=n,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new rb(r,t,rg(),rg(),rg())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rN{constructor(e,t,r,n){this.Se=e,this.removedTargetIds=t,this.key=r,this.De=n}}class rS{constructor(e,t){this.targetId=e,this.xe=t}}class rI{constructor(e,t,r=eT.EMPTY_BYTE_STRING,n=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=n}}class rV{constructor(e){this.targetId=e,this.Ce=0,this.Fe=rk(),this.Oe=eT.EMPTY_BYTE_STRING,this.Me=!1,this.Ne=!0}get current(){return this.Me}get resumeToken(){return this.Oe}get Le(){return 0!==this.Ce}get Be(){return this.Ne}Ue(e){e.approximateByteSize()>0&&(this.Ne=!0,this.Oe=e)}ke(){let e=rg(),t=rg(),r=rg();return this.Fe.forEach((n,s)=>{switch(s){case 0:e=e.add(n);break;case 2:t=t.add(n);break;case 1:r=r.add(n);break;default:x(38017,{changeType:s})}}),new rb(this.Oe,this.Me,e,t,r)}qe(){this.Ne=!1,this.Fe=rk()}$e(e,t){this.Ne=!0,this.Fe=this.Fe.insert(e,t)}Ke(e){this.Ne=!0,this.Fe=this.Fe.remove(e)}We(){this.Ce+=1}Qe(){this.Ce-=1,N(this.Ce>=0,3241,{Ce:this.Ce,targetId:this.targetId})}Ge(){this.Ne=!0,this.Me=!0}}let rC="WatchChangeAggregator";class rA{constructor(e){this.ze=e,this.je=new Map,this.He=rl,this.Je=rD(),this.Ye=rl,this.Ze=rD(),this.Xe=new ed(M)}et(e){for(let t of e.Se)e.De&&e.De.isFoundDocument()?this.tt(t,e.De):this.nt(t,e.key,e.De);for(let t of e.removedTargetIds)this.nt(t,e.key,e.De)}rt(e){this.forEachTarget(e,t=>{let r=this.je.get(t);if(r)switch(e.state){case 0:this.it(t)&&r.Ue(e.resumeToken);break;case 1:r.Qe(),r.Le||r.qe(),r.Ue(e.resumeToken);break;case 2:r.Qe(),r.Le||this.removeTarget(t);break;case 3:this.it(t)&&(r.Ge(),r.Ue(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),r.Ue(e.resumeToken));break;default:x(56790,{state:e.state})}else v(rC,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach((e,r)=>{this.it(r)&&t(r)})}_t(e){return t2(e)?"documents"===e.getPipelineSourceType()&&1===e.getPipelineDocuments()?.length:t3(e)}ot(e){let t=e.targetId,r=e.xe.count,n=this.ut(t);if(n){let s=n.target;if(this._t(s)){if(0===r){let e=new G(t2(s)?Q.fromString(s.getPipelineDocuments()[0]):s.path);this.nt(t,e,tJ.newNoDocument(e,es.min()))}else N(1===r,20013,"Single document existence filter with count: "+r)}else{let n=this.ct(t);if(n!==r){let r=this.lt(e),s=r?this.Et(r,e,n):1;0!==s&&(this.st(t),this.Xe=this.Xe.insert(t,2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch"))}}}}lt(e){let t,r;let n=e.xe.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:s="",padding:i=0},hashCount:a=0}=n;try{t=eS(s).toUint8Array()}catch(e){if(e instanceof eE)return E("Decoding the base64 bloom filter in existence filter failed ("+e.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw e}try{r=new rE(t,i,a)}catch(e){return E(e instanceof rT?"BloomFilter error: ":"Applying bloom filter failed: ",e),null}return 0===r.ge?null:r}Et(e,t,r){return t.xe.count===r-this.Pt(e,t.targetId)?0:2}Pt(e,t){let r=this.ze.getRemoteKeysForTarget(t),n=0;return r.forEach(r=>{let s=this.ze.Tt(),i=`projects/${s.projectId}/databases/${s.database}/documents/${r.path.canonicalString()}`;e.mightContain(i)||(this.nt(t,r,null),n++)}),n}Rt(e){let t=new Map;this.je.forEach((r,n)=>{let s=this.ut(n);if(s){if(r.current&&this._t(s.target)){let t=t2(s.target)?Q.fromString(s.target.getPipelineDocuments()[0]):s.target.path,r=new G(t);this.It(r).has(n)||this.At(n,r)||this.nt(n,r,tJ.newNoDocument(r,e))}r.Be&&(t.set(n,r.ke()),r.qe())}});let r=rg();this.Ze.forEach((e,t)=>{let n=!0;t.forEachWhile(e=>{let t=this.ut(e);return!t||"TargetPurposeLimboResolution"===t.purpose||(n=!1,!1)}),n&&(r=r.add(e))}),this.He.forEach((t,r)=>r.setReadTime(e)),this.Ye.forEach((t,r)=>r.setReadTime(e));let n=new rx(e,t,this.Xe,this.He,this.Ye,r);return this.He=rl,this.Je=rD(),this.Ye=rl,this.Ze=rD(),this.Xe=new ed(M),n}tt(e,t){let r=this.je.get(e);if(!r||!this.it(e))return void v(rC,`addDocumentToTarget received document for unknown inactive target (${e})`);let n=this.At(e,t.key)?2:0;r.$e(t.key,n),t2(this.ut(e).target)&&"exact"!==this.ut(e).target.getPipelineFlavor()?this.Ye=this.Ye.insert(t.key,t):this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.Ze=this.Ze.insert(t.key,this.Vt(t.key).add(e))}nt(e,t,r){let n=this.je.get(e);n&&this.it(e)?(this.At(e,t)?n.$e(t,1):n.Ke(t),this.Ze=this.Ze.insert(t,this.Vt(t).delete(e)),this.Ze=this.Ze.insert(t,this.Vt(t).add(e)),r&&(t2(this.ut(e).target)&&"exact"!==this.ut(e).target.getPipelineFlavor()?this.Ye=this.Ye.insert(t,r):this.He=this.He.insert(t,r))):v(rC,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.je.delete(e)}ct(e){let t=this.je.get(e);if(!t)return 0;let r=t.ke();return this.ze.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}We(e){let t=this.je.get(e);t||(v(rC,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new rV(e),this.je.set(e,t)),t.We()}Vt(e){let t=this.Ze.get(e);return t||(t=new ep(M),this.Ze=this.Ze.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new ep(M),this.Je=this.Je.insert(e,t)),t}it(e){let t=null!==this.ut(e);return t||v(rC,"Detected inactive target",e),t}ut(e){let t=this.je.get(e);return void 0===t||t.Le?null:this.ze.dt(e)}st(e){this.je.set(e,new rV(e)),this.ze.getRemoteKeysForTarget(e).forEach(t=>{this.nt(e,t,null)})}At(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function rD(){return new ed(G.comparator)}function rk(){return new ed(G.comparator)}let rR={asc:"ASCENDING",desc:"DESCENDING"},rL={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},rU={and:"AND",or:"OR"};class rP{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function rO(e,t){return e.useProto3Json||null==t?t:{value:t}}function rM(e,t){return e.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function rF(e){let t=eb(e);return new en(t.seconds,t.nanos)}function r$(e,t){return e.useProto3Json?t.toBase64():t.toUint8Array()}function rB(e,t){return rM(e,t.toTimestamp())}function rq(e){return N(!!e,49232),es.fromTimestamp(rF(e))}function rz(e,t){return rQ(e,t).canonicalString()}function rQ(e,t){let r=new Q(["projects",e.projectId,"databases",e.database]).child("documents");return void 0===t?r:r.child(t)}function rj(e){let t=Q.fromString(e);return N(r0(t),10190,{key:t.toString()}),t}function rK(e,t){return rz(e.databaseId,t.path)}function rG(e,t){let r=rj(t);if(r.get(1)!==e.databaseId.projectId)throw new I(S.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+r.get(1)+" vs "+e.databaseId.projectId);if(r.get(3)!==e.databaseId.database)throw new I(S.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+r.get(3)+" vs "+e.databaseId.database);return new G(rY(r))}function rH(e,t){return rz(e.databaseId,t)}function rW(e){return new Q(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function rY(e){return N(e.length>4&&"documents"===e.get(4),29091,{key:e.toString()}),e.popFirst(5)}function rJ(e,t,r){return{name:rK(e,t),fields:r.value.mapValue.fields}}function rX(e){return{fieldPath:e.canonicalString()}}function rZ(e){return K.fromServerFormat(e.fieldPath)}function r0(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}function r1(e){return!!e&&"function"==typeof e._toProto&&"ProtoValue"===e._protoValueType}function r2(e,t){let r={fields:{}};return t.forEach((t,n)=>{if("string"!=typeof n)throw Error(`Cannot encode map with non-string key: ${n}`);r.fields[n]=t._toProto(e)}),{mapValue:r}}function r3(e){return{stringValue:e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function r4(e){return new rP(e,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r6{constructor(e){this._byteString=e}static fromBase64String(e){try{return new r6(eT.fromBase64String(e))}catch(e){throw new I(S.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(e){return new r6(eT.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:r6._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(er(e,r6._jsonSchema))return r6.fromBase64String(e.bytes)}}r6._jsonSchemaVersion="firestore/bytes/1.0",r6._jsonSchema={type:et("string",r6._jsonSchemaVersion),bytes:et("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r9{constructor(...e){for(let t=0;t<e.length;++t)if(0===e[t].length)throw new I(S.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new K(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r5{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r8{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new I(S.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new I(S.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return M(this._lat,e._lat)||M(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:r8._jsonSchemaVersion}}static fromJSON(e){if(er(e,r8._jsonSchema))return new r8(e.latitude,e.longitude)}}function r7(e){let t={};return void 0!==e.timeoutSeconds&&(t.timeoutSeconds=e.timeoutSeconds),t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */r8._jsonSchemaVersion="firestore/geoPoint/1.0",r8._jsonSchema={type:et("string",r8._jsonSchemaVersion),latitude:et("number"),longitude:et("number")};class ne{bt(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nt="ConnectivityMonitor";class nr{constructor(){this.vt=()=>this.St(),this.Dt=()=>this.xt(),this.Ct=[],this.Ft()}bt(e){this.Ct.push(e)}shutdown(){window.removeEventListener("online",this.vt),window.removeEventListener("offline",this.Dt)}Ft(){window.addEventListener("online",this.vt),window.addEventListener("offline",this.Dt)}St(){for(let e of(v(nt,"Network connectivity changed: AVAILABLE"),this.Ct))e(0)}xt(){for(let e of(v(nt,"Network connectivity changed: UNAVAILABLE"),this.Ct))e(1)}static C(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nn=null;function ns(){return null===nn?nn=268435456+Math.round(2147483648*Math.random()):nn++,"0x"+nn.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ni="RestConnection",na={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class no{get Ot(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),n=encodeURIComponent(this.databaseId.database);this.Mt=t+"://"+e.host,this.Nt=`projects/${r}/databases/${n}`,this.Lt=this.databaseId.database===eU?`project_id=${r}`:`project_id=${r}&database_id=${n}`}Bt(e,t,r,n,s){let i=ns(),a=this.Ut(e,t.toUriEncodedString());v(ni,`Sending RPC '${e}' ${i}:`,a,r);let o={"google-cloud-resource-prefix":this.Nt,"x-goog-request-params":this.Lt};this.kt(o,n,s);let{host:l}=new URL(a),c=(0,u.Xx)(l);return this.qt(e,a,o,r,c).then(t=>(v(ni,`Received RPC '${e}' ${i}: `,t),t),t=>{throw E(ni,`RPC '${e}' ${i} failed with error: `,t,"url: ",a,"request:",r),t})}$t(e,t,r,n,s,i){return this.Bt(e,t,r,n,s)}kt(e,t,r){e["X-Goog-Api-Client"]="gl-js/ fire/"+p,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((t,r)=>e[r]=t),r&&r.headers.forEach((t,r)=>e[r]=t)}Ut(e,t){let r=na[e],n=`${this.Mt}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(n=`${n}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),n}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nu{constructor(e){this.Kt=e.Kt,this.Wt=e.Wt}Qt(e){this.Gt=e}zt(e){this.jt=e}Ht(e){this.Jt=e}onMessage(e){this.Yt=e}close(){this.Wt()}send(e){this.Kt(e)}Zt(){this.Gt()}Xt(){this.jt()}en(e){this.Jt(e)}tn(e){this.Yt(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nl="WebChannelConnection",nc=(e,t,r)=>{e.listen(t,e=>{try{r(e)}catch(e){setTimeout(()=>{throw e},0)}})};class nh extends no{constructor(e){super(e),this.nn=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static rn(){if(!nh.sn){let e=(0,h.FJ)();nc(e,h.ju.STAT_EVENT,e=>{e.stat===h.kN.PROXY?v(nl,"STAT_EVENT: detected buffering proxy"):e.stat===h.kN.NOPROXY&&v(nl,"STAT_EVENT: detected no buffering proxy")}),nh.sn=!0}}qt(e,t,r,n,s){let i=ns();return new Promise((s,a)=>{let o=new h.JJ;o.setWithCredentials(!0),o.listenOnce(h.tw.COMPLETE,()=>{try{switch(o.getLastErrorCode()){case h.jK.NO_ERROR:let t=o.getResponseJson();v(nl,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(t)),s(t);break;case h.jK.TIMEOUT:v(nl,`RPC '${e}' ${i} timed out`),a(new I(S.DEADLINE_EXCEEDED,"Request time out"));break;case h.jK.HTTP_ERROR:let r=o.getStatus();if(v(nl,`RPC '${e}' ${i} failed with status:`,r,"response text:",o.getResponseText()),r>0){let e=o.getResponseJson();Array.isArray(e)&&(e=e[0]);let t=e?.error;if(t&&t.status&&t.message){let e=function(e){let t=e.toLowerCase().replace(/_/g,"-");return Object.values(S).indexOf(t)>=0?t:S.UNKNOWN}(t.status);a(new I(e,t.message))}else a(new I(S.UNKNOWN,"Server responded with status "+o.getStatus()))}else a(new I(S.UNAVAILABLE,"Connection failed."));break;default:x(9055,{_n:e,streamId:i,an:o.getLastErrorCode(),un:o.getLastError()})}}finally{v(nl,`RPC '${e}' ${i} completed.`)}});let u=JSON.stringify(n);v(nl,`RPC '${e}' ${i} sending request:`,n),o.send(t,"POST",u,r,15)})}cn(e,t,r){let n=ns(),i=[this.Mt,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=this.createWebChannelTransport(),o={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;void 0!==u&&(o.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(o.useFetchStreams=!0),this.kt(o.initMessageHeaders,t,r),o.encodeInitMessageHeaders=!0;let l=i.join("");v(nl,`Creating RPC '${e}' stream ${n}: ${l}`,o);let c=a.createWebChannel(l,o);this.En(c);let d=!1,m=!1,f=new nu({Kt:t=>{m?v(nl,`Not sending because RPC '${e}' stream ${n} is closed:`,t):(d||(v(nl,`Opening RPC '${e}' stream ${n} transport.`),c.open(),d=!0),v(nl,`RPC '${e}' stream ${n} sending:`,t),c.send(t))},Wt:()=>c.close()});return nc(c,h.ii.EventType.OPEN,()=>{m||(v(nl,`RPC '${e}' stream ${n} transport opened.`),f.Zt())}),nc(c,h.ii.EventType.CLOSE,()=>{m||(m=!0,v(nl,`RPC '${e}' stream ${n} transport closed`),f.en(),this.hn(c))}),nc(c,h.ii.EventType.ERROR,t=>{m||(m=!0,E(nl,`RPC '${e}' stream ${n} transport errored. Name:`,t.name,"Message:",t.message),f.en(new I(S.UNAVAILABLE,"The operation could not be completed")))}),nc(c,h.ii.EventType.MESSAGE,t=>{if(!m){let r=t.data[0];N(!!r,16349);let i=r?.error||r[0]?.error;if(i){v(nl,`RPC '${e}' stream ${n} received error:`,i);let t=i.status,r=function(e){let t=s[e];if(void 0!==t)return ro(t)}(t),a=i.message;"NOT_FOUND"===t&&a.includes("database")&&a.includes("does not exist")&&a.includes(this.databaseId.database)&&E(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),void 0===r&&(r=S.INTERNAL,a="Unknown error status: "+t+" with message "+i.message),m=!0,f.en(new I(r,a)),c.close()}else v(nl,`RPC '${e}' stream ${n} received:`,r),f.tn(r)}}),nh.rn(),setTimeout(()=>{f.Xt()},0),f}terminate(){this.nn.forEach(e=>e.close()),this.nn=[]}En(e){this.nn.push(e)}hn(e){this.nn=this.nn.filter(t=>t===e)}kt(e,t,r){super.kt(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return(0,h.UE)()}}nh.sn=!1;class nd{constructor(e,t,r=1e3,n=1.5,s=6e4){this.Tn=e,this.timerId=t,this.Pn=r,this.Rn=n,this.In=s,this.An=0,this.Vn=null,this.dn=Date.now(),this.reset()}reset(){this.An=0}fn(){this.An=this.In}mn(e){this.cancel();let t=Math.floor(this.An+this.pn()),r=Math.max(0,Date.now()-this.dn),n=Math.max(0,t-r);n>0&&v("ExponentialBackoff",`Backing off for ${n} ms (base delay: ${this.An} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Vn=this.Tn.enqueueAfterDelay(this.timerId,n,()=>(this.dn=Date.now(),e())),this.An*=this.Rn,this.An<this.Pn&&(this.An=this.Pn),this.An>this.In&&(this.An=this.In)}gn(){null!==this.Vn&&(this.Vn.skipDelay(),this.Vn=null)}cancel(){null!==this.Vn&&(this.Vn.cancel(),this.Vn=null)}pn(){return(Math.random()-.5)*this.An}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nm="PersistentStream";class nf{constructor(e,t,r,n,s,i,a,o){this.Tn=e,this.yn=r,this.wn=n,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=a,this.listener=o,this.state=0,this.bn=0,this.vn=null,this.Sn=null,this.stream=null,this.Dn=0,this.xn=new nd(e,t)}Cn(){return 1===this.state||5===this.state||this.Fn()}Fn(){return 2===this.state||3===this.state}start(){this.Dn=0,4!==this.state?this.auth():this.On()}async stop(){this.Cn()&&await this.close(0)}Mn(){this.state=0,this.xn.reset()}Nn(){this.Fn()&&null===this.vn&&(this.vn=this.Tn.enqueueAfterDelay(this.yn,6e4,()=>this.Ln()))}Bn(e){this.Un(),this.stream.send(e)}async Ln(){if(this.Fn())return this.close(0)}Un(){this.vn&&(this.vn.cancel(),this.vn=null)}kn(){this.Sn&&(this.Sn.cancel(),this.Sn=null)}async close(e,t){this.Un(),this.kn(),this.xn.cancel(),this.bn++,4!==e?this.xn.reset():t&&t.code===S.RESOURCE_EXHAUSTED?(_(t.toString()),_("Using maximum backoff delay to prevent overloading the backend."),this.xn.fn()):t&&t.code===S.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.qn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Ht(t)}qn(){}auth(){this.state=1;let e=this.$n(this.bn),t=this.bn;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([e,r])=>{this.bn===t&&this.Kn(e,r)},t=>{e(()=>{let e=new I(S.UNKNOWN,"Fetching auth token failed: "+t.message);return this.Wn(e)})})}Kn(e,t){let r=this.$n(this.bn);this.stream=this.Qn(e,t),this.stream.Qt(()=>{r(()=>this.listener.Qt())}),this.stream.zt(()=>{r(()=>(this.state=2,this.Sn=this.Tn.enqueueAfterDelay(this.wn,1e4,()=>(this.Fn()&&(this.state=3),Promise.resolve())),this.listener.zt()))}),this.stream.Ht(e=>{r(()=>this.Wn(e))}),this.stream.onMessage(e=>{r(()=>1==++this.Dn?this.Gn(e):this.onNext(e))})}On(){this.state=5,this.xn.mn(async()=>{this.state=0,this.start()})}Wn(e){return v(nm,`close with error: ${e}`),this.stream=null,this.close(4,e)}$n(e){return t=>{this.Tn.enqueueAndForget(()=>this.bn===e?t():(v(nm,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class np extends nf{constructor(e,t,r,n,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,n,i),this.serializer=s}Qn(e,t){return this.connection.cn("Listen",e,t)}Gn(e){return this.onNext(e)}onNext(e){this.xn.reset();let t=function(e,t){let r;if("targetChange"in t){var n,s;t.targetChange;let i="NO_CHANGE"===(n=t.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===n?1:"REMOVE"===n?2:"CURRENT"===n?3:"RESET"===n?4:x(39313,{state:n}),a=t.targetChange.targetIds||[],o=(s=t.targetChange.resumeToken,e.useProto3Json?(N(void 0===s||"string"==typeof s,58123),eT.fromBase64String(s||"")):(N(void 0===s||s instanceof m||s instanceof Uint8Array,16193),eT.fromUint8Array(s||new Uint8Array))),u=t.targetChange.cause,l=u&&function(e){let t=void 0===e.code?S.UNKNOWN:ro(e.code);return new I(t,e.message||"")}(u);r=new rI(i,a,o,l||null)}else if("documentChange"in t){t.documentChange;let n=t.documentChange;n.document,n.document.name,n.document.updateTime;let s=rG(e,n.document.name),i=rq(n.document.updateTime),a=n.document.createTime?rq(n.document.createTime):es.min(),o=new tt({mapValue:{fields:n.document.fields}}),u=tJ.newFoundDocument(s,i,a,o),l=n.targetIds||[],c=n.removedTargetIds||[];r=new rN(l,c,u.key,u)}else if("documentDelete"in t){t.documentDelete;let n=t.documentDelete;n.document;let s=rG(e,n.document),i=n.readTime?rq(n.readTime):es.min(),a=tJ.newNoDocument(s,i),o=n.removedTargetIds||[];r=new rN([],o,a.key,a)}else if("documentRemove"in t){t.documentRemove;let n=t.documentRemove;n.document;let s=rG(e,n.document),i=n.removedTargetIds||[];r=new rN([],i,s,null)}else{if(!("filter"in t))return x(11601,{ft:t});{t.filter;let e=t.filter;e.targetId;let{count:n=0,unchangedNames:s}=e,i=new ra(n,s),a=e.targetId;r=new rS(a,i)}}return r}(this.serializer,e),r=function(e){if(!("targetChange"in e))return es.min();let t=e.targetChange;return t.targetIds&&t.targetIds.length?es.min():t.readTime?rq(t.readTime):es.min()}(e);return this.listener.zn(t,r)}jn(e){let t={};t.database=rW(this.serializer),t.addTarget=function(e,t){let r;let n=t.target;if((r=t2(n)?{pipelineQuery:{structuredPipeline:{pipeline:{stages:n.stages.map(t=>t._toProto(e))}}}}:t3(n)?{documents:{documents:[rH(e,n.path)]}}:{query:function(e,t){var r,n;let s;let i={structuredQuery:{}},a=t.path;null!==t.collectionGroup?(s=a,i.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=a.popLast(),i.structuredQuery.from=[{collectionId:a.lastSegment()}]),i.parent=rH(e,s);let o=function(e){if(0!==e.length)return function e(t){return t instanceof tM?function(e){if("=="===e.op){if(e6(e.value))return{unaryFilter:{field:rX(e.field),op:"IS_NAN"}};if(e4(e.value))return{unaryFilter:{field:rX(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(e6(e.value))return{unaryFilter:{field:rX(e.field),op:"IS_NOT_NAN"}};if(e4(e.value))return{unaryFilter:{field:rX(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:rX(e.field),op:rL[e.op],value:e.value}}}(t):t instanceof tF?function(t){let r=t.getFilters().map(t=>e(t));return 1===r.length?r[0]:{compositeFilter:{op:rU[t.op],filters:r}}}(t):x(54877,{filter:t})}(tF.create(e,"and"))}(t.filters);o&&(i.structuredQuery.where=o);let u=function(e){if(0!==e.length)return e.map(e=>({field:rX(e.field),direction:rR[e.dir]}))}(t.orderBy);u&&(i.structuredQuery.orderBy=u);let l=rO(e,t.limit);return null!==l&&(i.structuredQuery.limit=l),t.startAt&&(i.structuredQuery.startAt={before:(r=t.startAt).inclusive,values:r.position}),t.endAt&&(i.structuredQuery.endAt={before:!(n=t.endAt).inclusive,values:n.position}),{yt:i,parent:s}}(e,n).yt}).targetId=t.targetId,t.resumeToken.approximateByteSize()>0){r.resumeToken=r$(e,t.resumeToken);let n=rO(e,t.expectedCount);null!==n&&(r.expectedCount=n)}else if(t.snapshotVersion.compareTo(es.min())>0){r.readTime=rM(e,t.snapshotVersion.toTimestamp());let n=rO(e,t.expectedCount);null!==n&&(r.expectedCount=n)}return r}(this.serializer,e);let r=function(e,t){let r=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return x(28987,{purpose:e})}}(t.purpose);return null==r?null:{"goog-listen-tags":r}}(this.serializer,e);r&&(t.labels=r),this.Bn(t)}Hn(e){let t={};t.database=rW(this.serializer),t.removeTarget=e,this.Bn(t)}}class ng extends nf{constructor(e,t,r,n,s,i){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,n,i),this.serializer=s}get Jn(){return this.Dn>0}start(){this.lastStreamToken=void 0,super.start()}qn(){this.Jn&&this.Yn([])}Qn(e,t){return this.connection.cn("Write",e,t)}Gn(e){return N(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,N(!e.writeResults||0===e.writeResults.length,55816),this.listener.Zn()}onNext(e){var t,r;N(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.xn.reset();let n=(t=e.writeResults,r=e.commitTime,t&&t.length>0?(N(void 0!==r,14353),t.map(e=>{let t;return(t=e.updateTime?rq(e.updateTime):rq(r)).isEqual(es.min())&&(t=rq(r)),new t_(t,e.transformResults||[])})):[]),s=rq(e.commitTime);return this.listener.Xn(s,n)}er(){let e={};e.database=rW(this.serializer),this.Bn(e)}Yn(e){let t={streamToken:this.lastStreamToken,writes:e.map(e=>(function(e,t){var r;let n;if(t instanceof tI)n={update:rJ(e,t.key,t.value)};else if(t instanceof tk)n={delete:rK(e,t.key)};else if(t instanceof tV)n={update:rJ(e,t.key,t.data),updateMask:function(e){let t=[];return e.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}(t.fieldMask)};else{if(!(t instanceof tR))return x(16599,{gt:t.type});n={verify:rK(e,t.key)}}return t.fieldTransforms.length>0&&(n.updateTransforms=t.fieldTransforms.map(e=>(function(e,t){let r=t.transform;if(r instanceof to)return{fieldPath:t.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(r instanceof tu)return{fieldPath:t.field.canonicalString(),appendMissingElements:{values:r.elements}};if(r instanceof tc)return{fieldPath:t.field.canonicalString(),removeAllFromArray:{values:r.elements}};if(r instanceof tm)return{fieldPath:t.field.canonicalString(),increment:r.Re};if(r instanceof tf)return{fieldPath:t.field.canonicalString(),minimum:r.Re};if(r instanceof tp)return{fieldPath:t.field.canonicalString(),maximum:r.Re};throw x(20930,{transform:t.transform})})(0,e))),t.precondition.isNone||(n.currentDocument=void 0!==(r=t.precondition).updateTime?{updateTime:rB(e,r.updateTime)}:void 0!==r.exists?{exists:r.exists}:x(27497)),n})(this.serializer,e))};this.Bn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ny{}class nw extends ny{constructor(e,t,r,n){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=n,this.tr=!1}nr(){if(this.tr)throw new I(S.FAILED_PRECONDITION,"The client has already been terminated.")}Bt(e,t,r,n){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Bt(e,rQ(t,r),n,s,i)).catch(e=>{throw"FirebaseError"===e.name?(e.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new I(S.UNKNOWN,e.toString())})}$t(e,t,r,n,s){return this.nr(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.$t(e,rQ(t,r),n,i,a,s)).catch(e=>{throw"FirebaseError"===e.name?(e.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new I(S.UNKNOWN,e.toString())})}terminate(){this.tr=!0,this.connection.terminate()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nv=new Map,n_={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class nE{static withCacheSize(e){return new nE(e,nE.DEFAULT_COLLECTION_PERCENTILE,nE.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}nE.DEFAULT_COLLECTION_PERCENTILE=10,nE.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,nE.DEFAULT=new nE(41943040,nE.DEFAULT_COLLECTION_PERCENTILE,nE.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),nE.DISABLED=new nE(-1,0,0);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nT="LruGarbageCollector";function nx([e,t],[r,n]){let s=M(e,r);return 0===s?M(t,n):s}class nb{constructor(e){this.rr=e,this.buffer=new ep(nx),this.ir=0}sr(){return++this.ir}_r(e){let t=[e,this.sr()];if(this.buffer.size<this.rr)this.buffer=this.buffer.add(t);else{let e=this.buffer.last();0>nx(t,e)&&(this.buffer=this.buffer.delete(e).add(t))}}get maxValue(){return this.buffer.last()[0]}}class nN{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.ar=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.ur(6e4)}stop(){this.ar&&(this.ar.cancel(),this.ar=null)}get started(){return null!==this.ar}ur(e){v(nT,`Garbage collection scheduled in ${e}ms`),this.ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){el(e)?v(nT,"Ignoring IndexedDB error during garbage collection: ",e):await eo(e)}await this.ur(3e5)})}}class nS{constructor(e,t){this.cr=e,this.params=t}calculateTargetCount(e,t){return this.cr.lr(e).next(e=>Math.floor(t/100*e))}nthSequenceNumber(e,t){if(0===t)return eu.resolve(ec.ce);let r=new nb(t);return this.cr.forEachTarget(e,e=>r._r(e.sequenceNumber)).next(()=>this.cr.Er(e,e=>r._r(e))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.cr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.cr.removeOrphanedDocuments(e,t)}collect(e,t){return -1===this.params.cacheSizeCollectionThreshold?(v("LruGarbageCollector","Garbage collection skipped; disabled"),eu.resolve(n_)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(v("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),n_):this.hr(e,t))}getCacheSize(e){return this.cr.getCacheSize(e)}hr(e,t){let r,n,s,i,a,o,u;let l=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(t=>(t>this.params.maximumSequenceNumbersToCollect?(v("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${t}`),n=this.params.maximumSequenceNumbersToCollect):n=t,i=Date.now(),this.nthSequenceNumber(e,n))).next(n=>(r=n,a=Date.now(),this.removeTargets(e,r,t))).next(t=>(s=t,o=Date.now(),this.removeOrphanedDocuments(e,r))).next(e=>(u=Date.now(),w()<=c.in.DEBUG&&v("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-l}ms
	Determined least recently used ${n} in `+(a-i)+"ms\n"+`	Removed ${s} targets in `+(o-a)+"ms\n"+`	Removed ${e} documents in `+(u-o)+"ms\n"+`Total Duration: ${u-l}ms`),eu.resolve({didRun:!0,sequenceNumbersCollected:n,targetsRemoved:s,documentsRemoved:e})))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nI="firestore.googleapis.com";class nV{constructor(e){if(void 0===e.host){if(void 0!==e.ssl)throw new I(S.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=nI,this.ssl=!0}else this.host=e.host,this.ssl=e.ssl??!0;if(this.isUsingEmulator=void 0!==e.emulatorOptions,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,void 0===e.cacheSizeBytes)this.cacheSizeBytes=41943040;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<1048576)throw new I(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}(function(e,t,r,n){if(!0===t&&!0===n)throw new I(S.INVALID_ARGUMENT,`${e} and ${r} cannot be used together.`)})("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=r7(e.experimentalLongPollingOptions??{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new I(S.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new I(S.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new I(S.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){var t,r;return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(t=this.experimentalLongPollingOptions,r=e.experimentalLongPollingOptions,t.timeoutSeconds===r.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class nC{constructor(e,t,r,n){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=n,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new nV({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new I(S.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new I(S.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new nV(e),this._emulatorOptions=e.emulatorOptions||{},void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new A;switch(e.type){case"firstParty":return new L(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new I(S.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){let t=nv.get(e);t&&(v("ComponentProvider","Removing Datastore"),nv.delete(e),t.terminate())}(this),Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nA{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new nA(this.firestore,e,this._query)}}class nD{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new nk(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new nD(this.firestore,e,this._key)}toJSON(){return{type:nD._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(er(t,nD._jsonSchema))return new nD(e,r||null,new G(Q.fromString(t.referencePath)))}}nD._jsonSchemaVersion="firestore/documentReference/1.0",nD._jsonSchema={type:et("string",nD._jsonSchemaVersion),referencePath:et("string")};class nk extends nA{constructor(e,t,r){super(e,t,t6(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new nD(this.firestore,null,new G(e))}withConverter(e){return new nk(this.firestore,e,this._path)}}function nR(e,t,...r){if(e=(0,u.m9)(e),H("collection","path",t),e instanceof nC){let n=Q.fromString(t,...r);return Y(n),new nk(e,null,n)}{if(!(e instanceof nD||e instanceof nk))throw new I(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let n=e._path.child(Q.fromString(t,...r));return Y(n),new nk(e.firestore,null,n)}}function nL(e,t,...r){if(e=(0,u.m9)(e),1==arguments.length&&(t=O.newId()),H("doc","path",t),e instanceof nC){let n=Q.fromString(t,...r);return W(n),new nD(e,null,new G(n))}{if(!(e instanceof nD||e instanceof nk))throw new I(S.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let n=e._path.child(Q.fromString(t,...r));return W(n),new nD(e.firestore,e instanceof nk?e.converter:null,new G(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nU{constructor(e){this._values=(e||[]).map(e=>e)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;++r)if(e[r]!==t[r])return!1;return!0}(this._values,e._values)}toJSON(){return{type:nU._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(er(e,nU._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(e=>"number"==typeof e))return new nU(e.vectorValues);throw new I(S.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}nU._jsonSchemaVersion="firestore/vectorValue/1.0",nU._jsonSchema={type:et("string",nU._jsonSchemaVersion),vectorValues:et("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nP=/^__.*__$/;class nO{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return null!==this.fieldMask?new tV(e,this.data,this.fieldMask,t,this.fieldTransforms):new tI(e,this.data,t,this.fieldTransforms)}}class nM{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new tV(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function nF(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw x(40011,{dataSource:e})}}class n${constructor(e,t,r,n,s,i){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=n,void 0===s&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new n$({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){let t=this.path?.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return n3(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return void 0!==this.fieldMask.find(t=>e.isPrefixOf(t))||void 0!==this.fieldTransforms.find(t=>e.isPrefixOf(t.field))}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(0===e.length)throw this.createError("Document fields must not be empty");if(nF(this.dataSource)&&nP.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class nB{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||r4(e)}createContext(e,t,r,n=!1){return new n$({dataSource:e,methodName:t,targetDoc:r,path:K.emptyPath(),arrayElement:!1,hasConverter:n},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function nq(e){let t=e._freezeSettings(),r=r4(e._databaseId);return new nB(e._databaseId,!!t.ignoreUndefinedProperties,r)}function nz(e,t,r,n,s,i={}){let a,o;let u=e.createContext(i.merge||i.mergeFields?2:0,t,r,s);nZ("Data must be an object, but it was:",u,n);let l=nJ(n,u);if(i.merge)a=new ey(u.fieldMask),o=u.fieldTransforms;else if(i.mergeFields){let e=[];for(let n of i.mergeFields){let s=n0(t,n,r);if(!u.contains(s))throw new I(S.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);n4(e,s)||e.push(s)}a=new ey(e),o=u.fieldTransforms.filter(e=>a.covers(e.field))}else a=null,o=u.fieldTransforms;return new nO(new tt(l),a,o)}class nQ extends r5{_toFieldTransform(e){if(2!==e.dataSource)throw 1===e.dataSource?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof nQ}}class nj extends r5{_toFieldTransform(e){return new tv(e.path,new to)}isEqual(e){return e instanceof nj}}class nK extends r5{constructor(e,t){super(e),this.Pr=t}_toFieldTransform(e){let t=new tm(e.serializer,ts(e.serializer,this.Pr));return new tv(e.path,t)}isEqual(e){return e instanceof nK&&(this.Pr===e.Pr||Number.isNaN(this.Pr)&&Number.isNaN(e.Pr))}}function nG(e,t,r,n){let s=e.createContext(1,t,r);nZ("Data must be an object, but it was:",s,n);let i=[],a=tt.empty();ev(n,(e,n)=>{let o=n2(t,e,r);n=(0,u.m9)(n);let l=s.childContextForFieldPath(o);if(n instanceof nQ)i.push(o);else{let e=nY(n,l);null!=e&&(i.push(o),a.set(o,e))}});let o=new ey(i);return new nM(a,o,s.fieldTransforms)}function nH(e,t,r,n,s,i){let a=e.createContext(1,t,r),o=[n0(t,n,r)],l=[s];if(i.length%2!=0)throw new I(S.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let e=0;e<i.length;e+=2)o.push(n0(t,i[e])),l.push(i[e+1]);let c=[],h=tt.empty();for(let e=o.length-1;e>=0;--e)if(!n4(c,o[e])){let t=o[e],r=l[e];r=(0,u.m9)(r);let n=a.childContextForFieldPath(t);if(r instanceof nQ)c.push(t);else{let e=nY(r,n);null!=e&&(c.push(t),h.set(t,e))}}let d=new ey(c);return new nM(h,d,a.fieldTransforms)}function nW(e,t,r,n=!1){return nY(r,e.createContext(n?4:3,t))}function nY(e,t,r){if(nX(e=(0,u.m9)(e)))return nZ("Unsupported field value:",t,e),nJ(e,t);if(e instanceof r5)return function(e,t){if(!nF(t.dataSource))throw t.createError(`${e._methodName}() can only be used with update() and set()`);if(!t.path)throw t.createError(`${e._methodName}() is not currently supported inside arrays`);let r=e._toFieldTransform(t);r&&t.fieldTransforms.push(r)}(e,t),null;if(void 0===e&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),e instanceof Array){if(t.settings.arrayElement&&4!==t.dataSource)throw t.createError("Nested arrays are not supported");return function(e,t){let r=[],n=0;for(let s of e){let e=nY(s,t.childContextForArray(n));null==e&&(e={nullValue:"NULL_VALUE"}),r.push(e),n++}return{arrayValue:{values:r}}}(e,t)}return function(e,t,r){if(null===(e=(0,u.m9)(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return ts(t.serializer,e,r);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){let r=en.fromDate(e);return{timestampValue:rM(t.serializer,r)}}if(e instanceof en){let r=new en(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:rM(t.serializer,r)}}if(e instanceof r8)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof r6)return{bytesValue:r$(t.serializer,e._byteString)};if(e instanceof nD){let r=t.databaseId,n=e.firestore._databaseId;if(!n.isEqual(r))throw t.createError(`Document reference is for database ${n.projectId}/${n.database} but should be for database ${r.projectId}/${r.database}`);return{referenceValue:rz(e.firestore._databaseId||t.databaseId,e._key.path)}}if(e instanceof nU)return function(e,t){let r=e instanceof nU?e.toArray():e,n={fields:{[eM]:{stringValue:eB},[eq]:{arrayValue:{values:r.map(e=>{if("number"!=typeof e)throw t.createError("VectorValues must only contain numeric values.");return tr(t.serializer,e)})}}}};return{mapValue:n}}(e,t);if(r1(e))return e._toProto(t.serializer);throw t.createError(`Unsupported field value: ${X(e)}`)}(e,t,r)}function nJ(e,t){let r={};return e_(e)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):ev(e,(e,n)=>{let s=nY(n,t.childContextForField(e));null!=s&&(r[e]=s)}),{mapValue:{fields:r}}}function nX(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof en||e instanceof r8||e instanceof r6||e instanceof nD||e instanceof r5||e instanceof nU||r1(e))}function nZ(e,t,r){if(!nX(r)||!J(r)){let n=X(r);throw"an object"===n?t.createError(e+" a custom object"):t.createError(e+" "+n)}}function n0(e,t,r){if((t=(0,u.m9)(t))instanceof r9)return t._internalPath;if("string"==typeof t)return n2(e,t);throw n3("Field path arguments must be of type string or ",e,!1,void 0,r)}let n1=RegExp("[~\\*/\\[\\]]");function n2(e,t,r){if(t.search(n1)>=0)throw n3(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,r);try{return new r9(...t.split("."))._internalPath}catch(n){throw n3(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,r)}}function n3(e,t,r,n,s){let i=n&&!n.isEmpty(),a=void 0!==s,o=`Function ${t}() called with invalid data`;r&&(o+=" (via `toFirestore()`)"),o+=". ";let u="";return(i||a)&&(u+=" (found",i&&(u+=` in field ${n}`),a&&(u+=` in document ${s}`),u+=")"),new I(S.INVALID_ARGUMENT,o+e+u)}function n4(e,t){return e.some(e=>e.isEqual(t))}function n6(e){return"function"==typeof e._readUserData}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n9{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){let r=tt.empty();for(let n in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(n)){let s=this.optionDefinitions[n];if(n in e){let i;let a=e[n];s.nestedOptions&&J(a)?i={mapValue:{fields:new n9(s.nestedOptions).getOptionsProto(t,a)}}:a&&(i=nY(a,t)??void 0),i&&r.set(K.fromServerFormat(s.serverName),i)}}return r}getOptionsProto(e,t,r){let n=this._getKnownOptions(t,e);if(r){let t=new Map(function(e,t){let r=[];for(let n in e)Object.prototype.hasOwnProperty.call(e,n)&&r.push(t(e[n],n,e));return r}(r,(t,r)=>[K.fromServerFormat(r),void 0!==t?nY(t,e):null]));n.setAll(t)}return n.value.mapValue.fields??{}}}function n5(){return new nj("serverTimestamp")}function n8(e){return new nK("increment",e)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function n7(e){var t;return e instanceof sr?e:J(e)?function(e,t){let r=[];for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t)){let n=e[t];r.push(sc(t)),r.push(n7(n))}return new sd("map",r,"map")}(e):e instanceof Array?(t=e,new sd("array",t.map(e=>n7(e)),"array")):sh(e,void 0)}function se(e){if(e instanceof sr)return e;if(e instanceof nU)return sc(e);if(Array.isArray(e))return sc(new nU(e));throw Error("Unsupported value: "+typeof e)}function st(e){return"string"==typeof e?su(e):n7(e)}class sr{constructor(){this._protoValueType="ProtoValue"}add(e){return new sd("add",[this,n7(e)],"add")}asBoolean(){if(this instanceof sm)return this;if(this instanceof sl)return new sp(this);if(this instanceof so)return new sg(this);if(this instanceof sd)return new sf(this);throw new I("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new sd("subtract",[this,n7(e)],"subtract")}multiply(e){return new sd("multiply",[this,n7(e)],"multiply")}divide(e){return new sd("divide",[this,n7(e)],"divide")}mod(e){return new sd("mod",[this,n7(e)],"mod")}equal(e){return new sd("equal",[this,n7(e)],"equal").asBoolean()}notEqual(e){return new sd("not_equal",[this,n7(e)],"notEqual").asBoolean()}lessThan(e){return new sd("less_than",[this,n7(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new sd("less_than_or_equal",[this,n7(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new sd("greater_than",[this,n7(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new sd("greater_than_or_equal",[this,n7(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){let r=[e,...t].map(e=>n7(e));return new sd("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new sd("array_contains",[this,n7(e)],"arrayContains").asBoolean()}arrayContainsAll(e){let t=Array.isArray(e)?new sa(e.map(n7),"arrayContainsAll"):e;return new sd("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){let t=Array.isArray(e)?new sa(e.map(n7),"arrayContainsAny"):e;return new sd("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new sd("array_reverse",[this])}arrayLength(){return new sd("array_length",[this],"arrayLength")}equalAny(e){let t=Array.isArray(e)?new sa(e.map(n7),"equalAny"):e;return new sd("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){let t=Array.isArray(e)?new sa(e.map(n7),"notEqualAny"):e;return new sd("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new sd("exists",[this],"exists").asBoolean()}charLength(){return new sd("char_length",[this],"charLength")}like(e){return new sd("like",[this,n7(e)],"like").asBoolean()}regexContains(e){return new sd("regex_contains",[this,n7(e)],"regexContains").asBoolean()}regexFind(e){return new sd("regex_find",[this,n7(e)],"regexFind")}regexFindAll(e){return new sd("regex_find_all",[this,n7(e)],"regexFindAll")}regexMatch(e){return new sd("regex_match",[this,n7(e)],"regexMatch").asBoolean()}stringContains(e){return new sd("string_contains",[this,n7(e)],"stringContains").asBoolean()}startsWith(e){return new sd("starts_with",[this,n7(e)],"startsWith").asBoolean()}endsWith(e){return new sd("ends_with",[this,n7(e)],"endsWith").asBoolean()}toLower(){return new sd("to_lower",[this],"toLower")}toUpper(){return new sd("to_upper",[this],"toUpper")}trim(e){let t=[this];return e&&t.push(n7(e)),new sd("trim",t,"trim")}ltrim(e){let t=[this];return e&&t.push(n7(e)),new sd("ltrim",t,"ltrim")}rtrim(e){let t=[this];return e&&t.push(n7(e)),new sd("rtrim",t,"rtrim")}type(){return new sd("type",[this])}isType(e){return new sd("is_type",[this,sc(e)],"isType").asBoolean()}stringConcat(e,...t){let r=[e,...t].map(n7);return new sd("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new sd("string_index_of",[this,n7(e)],"stringIndexOf")}stringRepeat(e){return new sd("string_repeat",[this,n7(e)],"stringRepeat")}stringReplaceAll(e,t){return new sd("string_replace_all",[this,n7(e),n7(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new sd("string_replace_one",[this,n7(e),n7(t)],"stringReplaceOne")}concat(e,...t){let r=[e,...t].map(n7);return new sd("concat",[this,...r],"concat")}reverse(){return new sd("reverse",[this],"reverse")}arrayFilter(e,t){return new sd("array_filter",[this,n7(e),t],"arrayFilter")}arrayTransform(e,t){return new sd("array_transform",[this,n7(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new sd("array_transform",[this,n7(e),n7(t),r],"arrayTransformWithIndex")}arraySlice(e,t){let r=[this,n7(e)];return void 0!==t&&r.push(n7(t)),new sd("array_slice",r,"arraySlice")}arrayFirst(){return new sd("array_first",[this],"arrayFirst")}arrayFirstN(e){return new sd("array_first_n",[this,n7(e)],"arrayFirstN")}arrayLast(){return new sd("array_last",[this],"arrayLast")}arrayLastN(e){return new sd("array_last_n",[this,n7(e)],"arrayLastN")}arrayMaximum(){return new sd("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new sd("maximum_n",[this,n7(e)],"arrayMaximumN")}arrayMinimum(){return new sd("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new sd("minimum_n",[this,n7(e)],"arrayMinimumN")}arrayIndexOf(e){return new sd("array_index_of",[this,n7(e),n7("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new sd("array_index_of",[this,n7(e),n7("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new sd("array_index_of_all",[this,n7(e)],"arrayIndexOfAll")}byteLength(){return new sd("byte_length",[this],"byteLength")}ceil(){return new sd("ceil",[this])}floor(){return new sd("floor",[this])}abs(){return new sd("abs",[this])}exp(){return new sd("exp",[this])}mapGet(e){return new sd("map_get",[this,sc(e)],"mapGet")}mapSet(e,t,...r){let n=[this,n7(e),n7(t),...r.map(n7)];return new sd("map_set",n,"mapSet")}mapKeys(){return new sd("map_keys",[this],"mapKeys")}mapValues(){return new sd("map_values",[this],"mapValues")}mapEntries(){return new sd("map_entries",[this],"mapEntries")}getField(e){return new sd("get_field",[this,n7(e)],"get_field")}count(){return sn._create("count",[this],"count")}sum(){return sn._create("sum",[this],"sum")}average(){return sn._create("average",[this],"average")}minimum(){return sn._create("minimum",[this],"minimum")}maximum(){return sn._create("maximum",[this],"maximum")}first(){return sn._create("first",[this],"first")}last(){return sn._create("last",[this],"last")}arrayAgg(){return sn._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return sn._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return sn._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){let r=[e,...t];return new sd("maximum",[this,...r.map(n7)],"logicalMaximum")}logicalMinimum(e,...t){let r=[e,...t];return new sd("minimum",[this,...r.map(n7)],"minimum")}vectorLength(){return new sd("vector_length",[this],"vectorLength")}cosineDistance(e){return new sd("cosine_distance",[this,se(e)],"cosineDistance")}dotProduct(e){return new sd("dot_product",[this,se(e)],"dotProduct")}euclideanDistance(e){return new sd("euclidean_distance",[this,se(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new sd("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new sd("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new sd("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new sd("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new sd("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new sd("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new sd("timestamp_add",[this,n7(e),n7(t)],"timestampAdd")}timestampSubtract(e,t){return new sd("timestamp_subtract",[this,n7(e),n7(t)],"timestampSubtract")}timestampDiff(e,t){return new sd("timestamp_diff",[this,st(e),n7(t)],"timestampDiff")}timestampExtract(e,t){let r=[this,n7(e)];return t&&r.push(n7(t)),new sd("timestamp_extract",r,"timestampExtract")}documentId(){return new sd("document_id",[this],"documentId")}parent(){return new sd("parent",[this],"parent")}substring(e,t){let r=n7(e);return new sd("substring",void 0===t?[this,r]:[this,r,n7(t)],"substring")}arrayGet(e){return new sd("array_get",[this,n7(e)],"arrayGet")}isError(){return new sd("is_error",[this],"isError").asBoolean()}ifError(e){let t=new sd("if_error",[this,n7(e)],"ifError");return e instanceof sm?t.asBoolean():t}isAbsent(){return new sd("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new sd("map_remove",[this,n7(e)],"mapRemove")}mapMerge(e,...t){let r=n7(e),n=t.map(n7);return new sd("map_merge",[this,r,...n],"mapMerge")}pow(e){return new sd("pow",[this,n7(e)])}trunc(e){return void 0===e?new sd("trunc",[this]):new sd("trunc",[this,n7(e)],"trunc")}round(e){return void 0===e?new sd("round",[this]):new sd("round",[this,n7(e)],"round")}collectionId(){return new sd("collection_id",[this])}length(){return new sd("length",[this])}ln(){return new sd("ln",[this])}sqrt(){return new sd("sqrt",[this])}stringReverse(){return new sd("string_reverse",[this])}ifAbsent(e){return new sd("if_absent",[this,n7(e)],"ifAbsent")}ifNull(e){return new sd("if_null",[this,n7(e)],"ifNull")}coalesce(e,...t){return new sd("coalesce",[this,n7(e),...t.map(n7)],"coalesce")}join(e){return new sd("join",[this,n7(e)],"join")}log10(){return new sd("log10",[this])}arraySum(){return new sd("sum",[this])}split(e){return new sd("split",[this,n7(e)])}timestampTruncate(e,t){let r=[this,n7(e)];return t&&r.push(n7(t)),new sd("timestamp_trunc",r)}ascending(){return new sy(st(this),"ascending","ascending")}descending(){return new sy(st(this),"descending","descending")}as(e){return new si(this,e,"as")}}class sn{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){let n=new sn(e,t);return n._methodName=r,n}as(e){return new ss(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e))}}class ss{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class si{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class sa extends sr{constructor(e,t){super(),this.Rr=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.Rr.map(t=>t._toProto(e))}}}_readUserData(e){this.Rr.forEach(t=>t._readUserData(e))}}class so extends sr{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new sd("geo_distance",[this,n7(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function su(e){return new so("string"==typeof e?q===e?new r9(q)._internalPath:n0("field",e):e._internalPath,"field")}class sl extends sr{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){let t=new sl(e,void 0);return t._protoValue=e,t}_toProto(e){return N(void 0!==this._protoValue,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){var t,r,n,s,i,a,o;e=this._methodName?e.contextWith({methodName:this._methodName}):e,"object"==typeof(t=this._protoValue)&&null!==t&&("nullValue"in t&&(null===t.nullValue||"NULL_VALUE"===t.nullValue)||"booleanValue"in t&&(null===t.booleanValue||"boolean"==typeof t.booleanValue)||"integerValue"in t&&(null===t.integerValue||"number"==typeof t.integerValue||"string"==typeof t.integerValue)||"doubleValue"in t&&(null===t.doubleValue||"number"==typeof t.doubleValue)||"timestampValue"in t&&(null===t.timestampValue||"object"==typeof(r=t.timestampValue)&&null!==r&&"seconds"in r&&(null===r.seconds||"number"==typeof r.seconds||"string"==typeof r.seconds)&&"nanos"in r&&(null===r.nanos||"number"==typeof r.nanos))||"stringValue"in t&&(null===t.stringValue||"string"==typeof t.stringValue)||"bytesValue"in t&&(null===t.bytesValue||t.bytesValue instanceof Uint8Array)||"referenceValue"in t&&(null===t.referenceValue||"string"==typeof t.referenceValue)||"geoPointValue"in t&&(null===t.geoPointValue||"object"==typeof(n=t.geoPointValue)&&null!==n&&"latitude"in n&&(null===n.latitude||"number"==typeof n.latitude)&&"longitude"in n&&(null===n.longitude||"number"==typeof n.longitude))||"arrayValue"in t&&(null===t.arrayValue||"object"==typeof(s=t.arrayValue)&&null!==s&&!(!("values"in s)||null!==s.values&&!Array.isArray(s.values)))||"mapValue"in t&&(null===t.mapValue||"object"==typeof(i=t.mapValue)&&null!==i&&!(!("fields"in i)||null!==i.fields&&!J(i.fields)))||"fieldReferenceValue"in t&&(null===t.fieldReferenceValue||"string"==typeof t.fieldReferenceValue)||"functionValue"in t&&(null===t.functionValue||"object"==typeof(a=t.functionValue)&&null!==a&&!(!("name"in a)||null!==a.name&&"string"!=typeof a.name||!("args"in a)||null!==a.args&&!Array.isArray(a.args)))||"pipelineValue"in t&&(null===t.pipelineValue||"object"==typeof(o=t.pipelineValue)&&null!==o&&!(!("stages"in o)||null!==o.stages&&!Array.isArray(o.stages))))||(this._protoValue=nY(this.value,e))}}function sc(e,t){return sh(e,"constant")}function sh(e,t){let r=new sl(e,t);return"boolean"==typeof e?new sp(r):r}class sd extends sr{constructor(e,t,r,n){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,void 0!==r&&(this._methodName=r),void 0!==n&&(this._options=n)}get _optionsUtil(){return new n9({})}_toProto(e){let t={functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e)),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class sm extends sr{get _methodName(){return this._expr._methodName}countIf(){return sn._create("count_if",[this],"countIf")}not(){return new sd("not",[this],"not").asBoolean()}conditional(e,t){return new sd("conditional",[this,e,t],"conditional")}ifError(e){let t=n7(e),r=new sd("if_error",[this,t],"ifError");return t instanceof sm?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class sf extends sm{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class sp extends sm{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class sg extends sm{constructor(e){super(),this._expr=e,this.expressionType="Field"}}class sy{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:r3(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sw{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class sv extends sw{get _name(){return"add_fields"}get _optionsUtil(){return new n9({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[r2(e,this.fields)]}}_readUserData(e){super._readUserData(e),sk(this.fields,e)}}class s_ extends sw{get _name(){return"aggregate"}get _optionsUtil(){return new n9({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[r2(e,this.accumulators),r2(e,this.groups)]}}_readUserData(e){super._readUserData(e),sk(this.groups,e),sk(this.accumulators,e)}}class sE extends sw{get _name(){return"distinct"}get _optionsUtil(){return new n9({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[r2(e,this.groups)]}}_readUserData(e){super._readUserData(e),sk(this.groups,e)}}class sT extends sw{get _name(){return"collection"}get _optionsUtil(){return new n9({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Vr=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Vr}]}}_readUserData(e){super._readUserData(e)}}class sx extends sw{get _name(){return"collection_group"}get _optionsUtil(){return new n9({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class sb extends sw{get _name(){return"database"}get _optionsUtil(){return new n9({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class sN extends sw{get _name(){return"documents"}get _optionsUtil(){return new n9({})}constructor(e,t){if(super(t),!e||0===e.length)throw new I(S.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");let r=e.map(e=>e.startsWith("/")?e:"/"+e),n=new Set(r);if(n.size!==r.length)throw new I(S.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.dr=r,this.mr=n}_toProto(e){return{...super._toProto(e),args:this.dr.map(e=>({referenceValue:e}))}}_readUserData(e){super._readUserData(e)}}class sS extends sw{get _name(){return"where"}get _optionsUtil(){return new n9({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),sk(this.condition,e)}}class sI extends sw{get _name(){return"limit"}get _optionsUtil(){return new n9({})}constructor(e,t){N(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[ts(e,this.limit)]}}}class sV extends sw{get _name(){return"offset"}get _optionsUtil(){return new n9({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[ts(e,this.offset)]}}}class sC extends sw{get _name(){return"select"}get _optionsUtil(){return new n9({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[r2(e,this.selections)]}}_readUserData(e){super._readUserData(e),sk(this.selections,e)}}class sA extends sw{get _name(){return"sort"}get _optionsUtil(){return new n9({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map(t=>t._toProto(e))}}_readUserData(e){super._readUserData(e),sk(this.orderings,e)}}class sD extends sw{get _name(){return"replace_with"}get _optionsUtil(){return new n9({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),r3(sD.pr)]}}_readUserData(e){super._readUserData(e),sk(this.map,e)}}function sk(e,t){return n6(e)?e._readUserData(t):Array.isArray(e)?e.forEach(e=>e._readUserData(t)):e instanceof Map?e.forEach(e=>e._readUserData(t)):Object.values(e).forEach(e=>e._readUserData(t)),e}sD.pr="full_replace";// Copyright 2024 Google LLC* @license
class sR{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return sU(this)}getPipelineCollectionGroup(){return sP(this)}getPipelineCollectionId(){return function(e){switch(sL(e)){case"collection":return Q.fromString(sU(e)).lastSegment();case"collection_group":return sP(e);default:return}}(this)}getPipelineDocuments(){return sO(this)}getPipelineFlavor(){var e;let t;return e=this,t="exact",e.stages.forEach((r,n)=>{r._name!==sE.name&&r._name!==s_.name||(t="keyless"),r._name===sC.name&&"exact"===t&&(t="augmented"),r._name===sv.name&&n<e.stages.length-1&&"exact"===t&&(t="augmented")}),t}getPipelineSourceType(){return sL(this)}}function sL(e){let t=e.stages[0];return t instanceof sT||t instanceof sx||t instanceof sb||t instanceof sN?t._name:"unknown"}function sU(e){if("collection"===sL(e))return e.stages[0].Vr}function sP(e){if("collection_group"===sL(e))return e.stages[0].collectionId}function sO(e){if("documents"===sL(e))return e.stages[0].dr}class sM{constructor(e,t,r,n){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=n}wr(e,t){let r=this.userDataReader.createContext(3,e);return n6(t)?t._readUserData(r):Array.isArray(t)?t.forEach(e=>e._readUserData(r)):t.forEach(e=>e._readUserData(r)),t}where(e){let t=this.stages.map(e=>e);return this.wr("where",e),t.push(new sS(e,{})),new sM(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){let t=this.stages.map(e=>e);return t.push(new sI(e,{})),new sM(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){let r=this.stages.map(e=>e);return"orderings"in e?r.push(new sA(this.wr("sort",e.orderings),{})):r.push(new sA(this.wr("sort",[e,...t]),{})),new sM(this._db,this.userDataReader,this._userDataWriter,r)}br(e){return{pipeline:{stages:this.stages.map(t=>t._toProto(e))}}}}// Copyright 2024 Google LLC* @license
class sF{constructor(e,t){this.type=e,this.value=t}static vr(){return new sF("ERROR",void 0)}static Sr(){return new sF("UNSET",void 0)}static Dr(){return new sF("NULL",ez)}static newValue(e){return e4(e)?new sF("NULL",ez):e&&"booleanValue"in e?new sF("BOOLEAN",e):e0(e)?new sF("INT",e):e1(e)?new sF("DOUBLE",e):e&&"timestampValue"in e&&e.timestampValue?new sF("TIMESTAMP",e):e&&"stringValue"in e?new sF("STRING",e):e&&"bytesValue"in e?new sF("BYTES",e):e.referenceValue?new sF("REFERENCE",e):e.geoPointValue?new sF("GEO_POINT",e):e3(e)?new sF("ARRAY",e):e5(e)?new sF("VECTOR",e):e9(e)?new sF("MAP",e):new sF("ERROR",void 0)}Cr(){return"ERROR"===this.type||"UNSET"===this.type}Fr(){return"NULL"===this.type}}function s$(e){if(!e.Cr())return e.value}function sB(e){return e instanceof sm?e._expr:e}function sq(e){if((e=sB(e))instanceof so)return new sz(e);if(e instanceof sl)return new sQ(e);if(e instanceof sa)return new sj(e);if(e instanceof sd){if("add"===e.name)return new sX(e);if("subtract"===e.name)return new sZ(e);if("multiply"===e.name)return new s0(e);if("divide"===e.name)return new s1(e);if("mod"===e.name)return new s2(e);if("and"===e.name)return new s3(e);if("equal"===e.name)return new ic(e);if("not_equal"===e.name)return new ih(e);if("less_than"===e.name)return new id(e);if("less_than_or_equal"===e.name)return new im(e);if("greater_than"===e.name)return new ip(e);if("greater_than_or_equal"===e.name)return new ig(e);if("array_concat"===e.name)return new iy(e);if("array_reverse"===e.name)return new iw(e);if("array_contains"===e.name)return new iv(e);if("array_contains_all"===e.name)return new i_(e);if("array_contains_any"===e.name)return new iE(e);if("array_length"===e.name)return new iT(e);if("array_element"===e.name)return new ix(e);if("equal_any"===e.name)return new s5(e);if("not_equal_any"===e.name)return new s8(e);if("is_nan"===e.name)return new s7(e);if("is_not_nan"===e.name)return new ie(e);if("is_null"===e.name)return new it(e);if("is_not_null"===e.name)return new ir(e);if("is_error"===e.name)return new is(e);if("exists"===e.name)return new ii(e);if("not"===e.name)return new s4(e);if("or"===e.name)return new s6(e);if("xor"===e.name)return new s9(e);if("conditional"===e.name)return new ia(e);if("maximum"===e.name)return new io(e);if("minimum"===e.name)return new iu(e);if("reverse"===e.name)return new ib(e);if("replace_first"===e.name)return new iN(e);if("replace_all"===e.name)return new iS(e);if("char_length"===e.name)return new iI(e);if("byte_length"===e.name)return new iV(e);if("like"===e.name)return new iA(e);if("regex_contains"===e.name)return new iD(e);if("regex_match"===e.name)return new ik(e);if("string_contains"===e.name)return new iR(e);if("starts_with"===e.name)return new iL(e);if("ends_with"===e.name)return new iU(e);if("to_lower"===e.name)return new iP(e);if("to_upper"===e.name)return new iO(e);if("trim"===e.name)return new iM(e);if("string_concat"===e.name)return new iF(e);if("map_get"===e.name)return new i$(e);if("cosine_distance"===e.name)return new iq(e);if("dot_product"===e.name)return new iz(e);if("euclidean_distance"===e.name)return new iQ(e);if("vector_length"===e.name)return new ij(e);if("unix_micros_to_timestamp"===e.name)return new i6(e);if("timestamp_to_unix_micros"===e.name)return new i7(e);if("unix_millis_to_timestamp"===e.name)return new i9(e);if("timestamp_to_unix_millis"===e.name)return new ae(e);if("unix_seconds_to_timestamp"===e.name)return new i5(e);if("timestamp_to_unix_seconds"===e.name)return new at(e);if("timestamp_add"===e.name)return new an(e);if("timestamp_subtract"===e.name)return new as(e)}throw Error(`Unknown Expr : ${e}`)}class sz{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===q)return sF.newValue({referenceValue:rK(e.serializer,t.key)});if("__update_time__"===this.expr.fieldName)return sF.newValue({timestampValue:rB(e.serializer,t.version)});if("__create_time__"===this.expr.fieldName)return sF.newValue({timestampValue:rB(e.serializer,t.createTime)});let r=t.data.field(this.expr._fieldPath);return r?eD(r)?sF.newValue(function(e,t){if("estimate"===e.serverTimestampBehavior)return{timestampValue:rB(e.serializer,es.fromTimestamp(eR(t)))};if("previous"===e.serverTimestampBehavior){let e=ek(t);if(e)return e}return{nullValue:"NULL_VALUE"}}(e,r)):sF.newValue(r):sF.Sr()}}class sQ{constructor(e){this.expr=e}evaluate(e,t){return sF.newValue(this.expr._getValue())}}class sj{constructor(e){this.expr=e}evaluate(e,t){let r=this.expr.Rr.map(r=>sq(r).evaluate(e,t));return r.some(e=>e.Cr())?sF.vr():sF.newValue({arrayValue:{values:r.map(e=>e.value)}})}}function sK(e){return e1(e)?Number(e.doubleValue):Number(e.integerValue)}function sG(e){return BigInt(e.integerValue)}let sH=BigInt("0x7fffffffffffffff"),sW=-BigInt("0x8000000000000000");class sY{constructor(e){this.expr=e}evaluate(e,t){N(this.expr.params.length>=2,24778);let r=sq(this.expr.params[0]).evaluate(e,t),n=sq(this.expr.params[1]).evaluate(e,t),s=this.Or(r,n);for(let r of this.expr.params.slice(2)){let n=sq(r).evaluate(e,t);s=this.Or(s,n)}return s}Or(e,t){if(e.Cr()||t.Cr())return sF.vr();if(e.Fr()||t.Fr())return sF.Dr();let r=e.value,n=t.value;if(!e1(r)&&!e0(r)||!e1(n)&&!e0(n))return sF.vr();if(e1(r)||e1(n)){let e=this.Mr(r,n);return e?sF.newValue(e):sF.vr()}if(e0(r)&&e0(n)){let e=this.Nr(r,n);return void 0===e?sF.vr():"number"==typeof e?sF.newValue({doubleValue:e}):e<sW||e>sH?sF.vr():sF.newValue({integerValue:`${e}`})}return sF.vr()}}function sJ(e,t){return eK(e)!==eK(t)?"TYPE_MISMATCH":e6(e)||e6(t)?"NOT_EQ":e4(e)&&e4(t)?"EQ":e4(e)||e4(t)?"NULL":e3(e)&&e3(t)?function(e,t){if(e.values?.length!==t.values?.length)return"NOT_EQ";let r=!1;for(let n=0;n<(e.values?.length??0);n++){let s=e.values[n],i=t.values[n];switch(sJ(s,i)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":r=!0;break;default:x(44609,{Lr:s,Br:i})}}return r?"NULL":"EQ"}(e.arrayValue,t.arrayValue):e5(e)&&e5(t)||e9(e)&&e9(t)?function(e,t){let r=e.fields||{},n=t.fields||{};if(ew(r)!==ew(n))return"NOT_EQ";let s=!1;for(let e in r)if(r.hasOwnProperty(e)){if(void 0===n[e])return"NOT_EQ";switch(sJ(r[e],n[e])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":s=!0}}return s?"NULL":"EQ"}(e.mapValue,t.mapValue):eG(e,t,{Te:!1,Ee:!0,he:!0})?"EQ":"NOT_EQ"}class sX extends sY{Nr(e,t){return sG(e)+sG(t)}Mr(e,t){return{doubleValue:sK(e)+sK(t)}}}class sZ extends sY{constructor(e){super(e),this.expr=e}Nr(e,t){return sG(e)-sG(t)}Mr(e,t){return{doubleValue:sK(e)-sK(t)}}}class s0 extends sY{constructor(e){super(e),this.expr=e}Nr(e,t){return sG(e)*sG(t)}Mr(e,t){return{doubleValue:sK(e)*sK(t)}}}class s1 extends sY{constructor(e){super(e),this.expr=e}Nr(e,t){let r=sG(t);if(r!==BigInt(0))return sG(e)/r}Mr(e,t){let r=sK(t);return 0===r?{doubleValue:eh(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:sK(e)/r}}}class s2 extends sY{constructor(e){super(e),this.expr=e}Nr(e,t){let r=sG(t);if(r!==BigInt(0))return sG(e)%r}Mr(e,t){let r=sK(t);if(0!==r)return{doubleValue:sK(e)%r}}}class s3{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sq(s).evaluate(e,t);switch(i.type){case"BOOLEAN":if(!i.value?.booleanValue)return sF.newValue(ej);break;case"NULL":n=!0;break;default:r=!0}}return r?sF.vr():n?sF.Dr():sF.newValue(eQ)}}class s4{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,9634);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return sF.newValue({booleanValue:!r.value?.booleanValue});case"NULL":return sF.Dr();default:return sF.vr()}}}class s6{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sq(s).evaluate(e,t);switch(i.type){case"BOOLEAN":if(i.value?.booleanValue)return sF.newValue(eQ);break;case"NULL":n=!0;break;default:r=!0}}return r?sF.vr():n?sF.Dr():sF.newValue(ej)}}class s9{constructor(e){this.expr=e}evaluate(e,t){let r=!1,n=!1;for(let s of this.expr.params){let i=sq(s).evaluate(e,t);switch(i.type){case"BOOLEAN":r=s9.xor(r,!!i.value?.booleanValue);break;case"NULL":n=!0;break;default:return sF.vr()}}return n?sF.Dr():sF.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class s5{constructor(e){this.expr=e}evaluate(e,t){N(2===this.expr.params.length,55094);let r=!1,n=sq(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return sF.vr()}let s=sq(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sF.vr()}if(r)return sF.Dr();for(let e of s.value?.arrayValue?.values??[])switch(e4(n.value)&&e4(e)?"EQ":sJ(n.value,e)){case"EQ":return sF.newValue(eQ);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:x(44608,{value:n.value,candidate:e})}return r?sF.Dr():sF.newValue(ej)}}class s8{constructor(e){this.expr=e}evaluate(e,t){return new s4(new sd("not",[new sd("equal_any",this.expr.params)])).evaluate(e,t)}}class s7{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,23322);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return sF.newValue(ej);case"DOUBLE":return sF.newValue({booleanValue:isNaN(sK(r.value))});case"NULL":return sF.Dr();default:return sF.vr()}}}class ie{constructor(e){this.expr=e}evaluate(e,t){return N(1===this.expr.params.length,50406),new s4(new sd("not",[new sd("is_nan",this.expr.params)])).evaluate(e,t)}}class it{constructor(e){this.expr=e}evaluate(e,t){switch(N(1===this.expr.params.length,23123),sq(this.expr.params[0]).evaluate(e,t).type){case"NULL":return sF.newValue(eQ);case"UNSET":case"ERROR":return sF.vr();default:return sF.newValue(ej)}}}class ir{constructor(e){this.expr=e}evaluate(e,t){return N(1===this.expr.params.length,23167),new s4(new sd("not",[new sd("is_null",this.expr.params)])).evaluate(e,t)}}class is{constructor(e){this.expr=e}evaluate(e,t){return N(1===this.expr.params.length,5228),"ERROR"===sq(this.expr.params[0]).evaluate(e,t).type?sF.newValue(eQ):sF.newValue(ej)}}class ii{constructor(e){this.expr=e}evaluate(e,t){switch(N(1===this.expr.params.length,6877),sq(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return sF.vr();case"UNSET":return sF.newValue(ej);default:return sF.newValue(eQ)}}}class ia{constructor(e){this.expr=e}evaluate(e,t){N(3===this.expr.params.length,11706);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return r.value?.booleanValue?sq(this.expr.params[1]).evaluate(e,t):sq(this.expr.params[2]).evaluate(e,t);case"NULL":return sq(this.expr.params[2]).evaluate(e,t);default:return sF.vr()}}}class io{constructor(e){this.expr=e}evaluate(e,t){let r;let n=this.expr.params.map(r=>sq(r).evaluate(e,t));for(let e of n)switch(e.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||eW(e.value,r.value)>0?e:r}return void 0===r?sF.Dr():r}}class iu{constructor(e){this.expr=e}evaluate(e,t){let r;let n=this.expr.params.map(r=>sq(r).evaluate(e,t));for(let e of n)switch(e.type){case"ERROR":case"UNSET":case"NULL":continue;default:r=void 0===r||0>eW(e.value,r.value)?e:r}return void 0===r?sF.Dr():r}}class il{constructor(e){this.expr=e}evaluate(e,t){N(2===this.expr.params.length,31033,`${this.expr.name}() function should have exactly 2 params`);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return sF.vr()}let n=sq(this.expr.params[1]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return sF.vr()}return this.Ur(r,n)}}class ic extends il{constructor(e){super(e),this.expr=e}Ur(e,t){if(e.Fr()&&t.Fr())return sF.newValue(eQ);if(e.Fr()||t.Fr()||e6(e.value)||e6(t.value)||eK(e.value)!==eK(t.value))return sF.newValue(ej);switch(sJ(e.value,t.value)){case"EQ":return sF.newValue(eQ);case"NOT_EQ":return sF.newValue(ej);case"NULL":return sF.Dr();default:x(44615,{left:e,right:t})}}}class ih extends il{constructor(e){super(e),this.expr=e}Ur(e,t){switch(sJ(e.value,t.value)){case"EQ":return sF.newValue(ej);case"NOT_EQ":case"TYPE_MISMATCH":return sF.newValue(eQ);case"NULL":return sF.Dr();default:x(44614,{left:e,right:t})}}}class id extends il{constructor(e){super(e),this.expr=e}Ur(e,t){return eK(e.value)!==eK(t.value)||e6(e.value)||e6(t.value)?sF.newValue(ej):sF.newValue({booleanValue:0>eW(e.value,t.value)})}}class im extends il{constructor(e){super(e),this.expr=e}Ur(e,t){return eK(e.value)!==eK(t.value)||e6(e.value)||e6(t.value)?sF.newValue(ej):"EQ"===sJ(e.value,t.value)?sF.newValue(eQ):sF.newValue({booleanValue:0>eW(e.value,t.value)})}}class ip extends il{constructor(e){super(e),this.expr=e}Ur(e,t){return eK(e.value)!==eK(t.value)||e6(e.value)||e6(t.value)?sF.newValue(ej):sF.newValue({booleanValue:eW(e.value,t.value)>0})}}class ig extends il{constructor(e){super(e),this.expr=e}Ur(e,t){return eK(e.value)!==eK(t.value)||e6(e.value)||e6(t.value)?sF.newValue(ej):"EQ"===sJ(e.value,t.value)?sF.newValue(eQ):sF.newValue({booleanValue:eW(e.value,t.value)>0})}}class iy{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class iw{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,216);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sF.Dr();case"ARRAY":{let e=r.value.arrayValue?.values??[];return sF.newValue({arrayValue:{values:[...e].reverse()}})}default:return sF.vr()}}}class iv{constructor(e){this.expr=e}evaluate(e,t){return N(2===this.expr.params.length,52884),new s5(new sd("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class i_{constructor(e){this.expr=e}evaluate(e,t){N(2===this.expr.params.length,1392);let r=!1,n=sq(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sF.vr()}let s=sq(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sF.vr()}if(r)return sF.Dr();let i=s.value?.arrayValue?.values??[],a=n.value?.arrayValue?.values??[];for(let e of i){let t=!1;for(let n of(r=!1,a)){switch(e4(e)&&e4(n)?"EQ":sJ(e,n)){case"EQ":t=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:x(44613,{value:n,search:e})}if(t)break}if(!t)return sF.newValue(ej)}return sF.newValue(eQ)}}class iE{constructor(e){this.expr=e}evaluate(e,t){N(2===this.expr.params.length,2680);let r=!1,n=sq(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sF.vr()}let s=sq(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return sF.vr()}if(r)return sF.Dr();let i=s.value?.arrayValue?.values??[],a=n.value?.arrayValue?.values??[];for(let e of a)for(let t of i)switch(e4(e)&&e4(t)?"EQ":sJ(e,t)){case"EQ":return sF.newValue(eQ);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:x(44608,{value:e,search:t})}return r?sF.Dr():sF.newValue(ej)}}class iT{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,38605);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sF.Dr();case"ARRAY":return sF.newValue({integerValue:`${r.value?.arrayValue?.values?.length??0}`});default:return sF.vr()}}}class ix{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class ib{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,1508);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sF.Dr();case"BYTES":{let e=r.value?.bytesValue;if("string"==typeof e){let t=eT.fromBase64String(e).toUint8Array();return t.reverse(),sF.newValue({bytesValue:eT.fromUint8Array(t).toBase64()})}return sF.newValue({bytesValue:new Uint8Array(e).reverse()})}case"STRING":{let e=r.value?.stringValue,t=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(e),n=Array.from(t,e=>e.segment).reverse();return sF.newValue({stringValue:n.join("")})}default:return sF.vr()}}}class iN{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class iS{constructor(e){this.expr=e}evaluate(e,t){throw Error("Unimplemented")}}class iI{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,19400);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return sF.Dr();case"STRING":{let e=function(e){let t=0;for(let r=0;r<e.length;r++){let n=e.codePointAt(r);if(void 0===n)return;if(n<=65535){if(n>=55296&&n<=57343){if(n<=56319){let n=e.codePointAt(r+1);void 0!==n&&n>=56320&&n<=57343?(t+=1,r++):t+=1}else t+=1}else t+=1}else{if(!(n<=1114111))return;t+=1,r++}}return t}(r.value.stringValue);return void 0===e?sF.vr():sF.newValue({integerValue:e})}default:return sF.vr()}}}class iV{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,8486);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{let e=r.value?.bytesValue;return"string"==typeof e?sF.newValue({integerValue:eT.fromBase64String(e).toUint8Array().length}):sF.newValue({integerValue:new Uint8Array(e).length})}case"STRING":{let e=function(e){let t=0;for(let r=0;r<e.length;r++){let n=e.codePointAt(r);if(void 0===n)return;if(n>=55296&&n<=57343){if(!(n<=56319))return;{let n=e.codePointAt(r+1);if(void 0===n||!(n>=56320&&n<=57343))return;t+=4,r++}}else if(n<=127)t+=1;else if(n<=2047)t+=2;else if(n<=65535)t+=3;else{if(!(n<=1114111))return;t+=4,r++}}return t}(r.value?.stringValue);return void 0===e?sF.vr():sF.newValue({integerValue:e})}case"NULL":return sF.Dr();default:return sF.vr()}}}class iC{constructor(e){this.expr=e}evaluate(e,t){N(2===this.expr.params.length,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1,n=sq(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":break;case"NULL":r=!0;break;default:return sF.vr()}let s=sq(this.expr.params[1]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return sF.vr()}return r?sF.Dr():this.kr(n.value?.stringValue,s.value?.stringValue)}}class iA extends iC{kr(e,t){try{let r=function(e){let t="";for(let r=0;r<e.length;r++){let n=e.charAt(r);switch(n){case"_":t+=".";break;case"%":t+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":t+="\\"+n;break;default:t+=n}}return"^"+t+"$"}(t),n=d.n_.compile(r);return sF.newValue({booleanValue:n.matches(e)})}catch(e){return E(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${e}`),sF.vr()}}}class iD extends iC{kr(e,t){try{let r=d.n_.compile(t);return sF.newValue({booleanValue:r.matcher(e).find()})}catch(e){return E(`Invalid regex pattern found in regex_contains: ${t}, returning error`),sF.vr()}}}class ik extends iC{kr(e,t){try{return sF.newValue({booleanValue:d.n_.compile(t).matches(e)})}catch(e){return E(`Invalid regex pattern found in regex_match: ${t}, returning error`),sF.vr()}}}class iR extends iC{kr(e,t){return sF.newValue({booleanValue:e.includes(t)})}}class iL extends iC{kr(e,t){return sF.newValue({booleanValue:e.startsWith(t)})}}class iU extends iC{kr(e,t){return sF.newValue({booleanValue:e.endsWith(t)})}}class iP{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,29079);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sF.newValue({stringValue:r.value?.stringValue?.toLowerCase()});case"NULL":return sF.Dr();default:return sF.vr()}}}class iO{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,60487);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sF.newValue({stringValue:r.value?.stringValue?.toUpperCase()});case"NULL":return sF.Dr();default:return sF.vr()}}}class iM{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,28544);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return sF.newValue({stringValue:r.value?.stringValue?.trim()});case"NULL":return sF.Dr();default:return sF.vr()}}}class iF{constructor(e){this.expr=e}evaluate(e,t){let r=this.expr.params.map(r=>sq(r).evaluate(e,t)),n="",s=!1;for(let e of r)switch(e.type){case"STRING":n+=e.value.stringValue;break;case"NULL":s=!0;break;default:return sF.vr()}return s?sF.Dr():sF.newValue({stringValue:n})}}class i${constructor(e){this.expr=e}evaluate(e,t){N(2===this.expr.params.length,4483);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return sF.Sr();case"MAP":break;default:return sF.vr()}let n=sq(this.expr.params[1]).evaluate(e,t);if("STRING"!==n.type)return sF.vr();let s=r.value?.mapValue?.fields?.[n.value?.stringValue];return void 0===s?sF.Sr():sF.newValue(s)}}class iB{constructor(e){this.expr=e}evaluate(e,t){N(2===this.expr.params.length,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1,n=sq(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":break;case"NULL":r=!0;break;default:return sF.vr()}let s=sq(this.expr.params[1]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return sF.vr()}if(r)return sF.Dr();let i=e8(n.value),a=e8(s.value);if(void 0===i||void 0===a||i.values?.length!==a.values?.length)return sF.vr();let o=this.qr(i,a);return void 0===o||isNaN(o)?sF.vr():sF.newValue({doubleValue:o})}}class iq extends iB{qr(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return;let s=0,i=0,a=0;for(let e=0;e<r.length;e++){if(!e2(r[e])||!e2(n[e]))return;let t=sK(r[e]),o=sK(n[e]);s+=t*o,i+=t*t,a+=o*o}let o=Math.sqrt(i)*Math.sqrt(a);if(0!==o)return 1-Math.max(-1,Math.min(1,s/o))}}class iz extends iB{qr(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return 0;let s=0;for(let e=0;e<r.length;e++){if(!e2(r[e])||!e2(n[e]))return;s+=sK(r[e])*sK(n[e])}return s}}class iQ extends iB{qr(e,t){let r=e?.values??[],n=t?.values??[];if(0===r.length)return 0;let s=0;for(let e=0;e<r.length;e++){if(!e2(r[e])||!e2(n[e]))return;let t=sK(r[e]),i=sK(n[e]);s+=Math.pow(t-i,2)}return Math.sqrt(s)}}class ij{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,39044);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{let e=e8(r.value);return sF.newValue({integerValue:e?.values?.length??0})}case"NULL":return sF.Dr();default:return sF.vr()}}}let iK=BigInt(-62135596800),iG=BigInt(253402300799),iH=BigInt(1e3),iW=BigInt(1e6),iY=iK*iH,iJ=iG*iH+BigInt(999),iX=iK*iW,iZ=iG*iW+BigInt(999999);function i0(e){return e>=iX&&e<=iZ}function i1(e,t){let r=BigInt(e);return!(r<iK||r>iG)&&!(t<0||t>=1e9)&&(r!==iK||0===t)&&!(r===iG&&t>999999999)}function i2(e,t){return t<0?{seconds:e-1,nanos:t+1e9}:{seconds:e,nanos:t}}function i3(e){return BigInt(e.seconds)*iW+BigInt(Math.trunc(e.nanoseconds/1e3))}class i4{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,49262,`${this.expr.name}() function should have exactly one parameter`);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return sF.Dr();default:return sF.vr()}}}class i6 extends i4{toTimestamp(e){if(!i0(e))return sF.vr();let t=Number(e/iW),r=Number(e%iW*BigInt(1e3)),n=i2(t,r);return i1(t=n.seconds,r=n.nanos)?sF.newValue({timestampValue:{seconds:t,nanos:r}}):sF.vr()}}class i9 extends i4{toTimestamp(e){if(!(e>=iY&&e<=iJ))return sF.vr();let t=Number(e/iH),r=Number(e%iH*BigInt(1e6)),n=i2(t,r);return i1(t=n.seconds,r=n.nanos)?sF.newValue({timestampValue:{seconds:t,nanos:r}}):sF.vr()}}class i5 extends i4{toTimestamp(e){if(!(e>=iK&&e<=iG))return sF.vr();let t=Number(e);return sF.newValue({timestampValue:{seconds:t,nanos:0}})}}class i8{constructor(e){this.expr=e}evaluate(e,t){N(1===this.expr.params.length,1265,`${this.expr.name}() function should have exactly one parameter`);let r=sq(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return sF.Dr();default:return sF.vr()}let n=rF(r.value.timestampValue);return i1(n.seconds,n.nanoseconds)?this.$r(n):sF.vr()}}class i7 extends i8{$r(e){let t=i3(e);return i0(t)?sF.newValue({integerValue:`${t.toString()}`}):sF.vr()}}class ae extends i8{$r(e){let t=i3(e),r=t/BigInt(1e3),n=t%BigInt(1e3);return r>BigInt(0)||n===BigInt(0)?sF.newValue({integerValue:r.toString()}):sF.newValue({integerValue:(r-BigInt(1)).toString()})}}class at extends i8{$r(e){let t=BigInt(e.seconds);return t>=iK&&t<=iG?sF.newValue({integerValue:t.toString()}):sF.vr()}}class ar{constructor(e){this.expr=e}evaluate(e,t){let r,n;N(3===this.expr.params.length,2775,`${this.expr.name}() function should have exactly 3 parameters`);let s=!1,i=sq(this.expr.params[0]).evaluate(e,t);switch(i.type){case"TIMESTAMP":break;case"NULL":s=!0;break;default:return sF.vr()}let a=sq(this.expr.params[1]).evaluate(e,t);switch(a.type){case"STRING":if(void 0===(r=function(e){switch(e){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}}(a.value.stringValue)))return sF.vr();break;case"NULL":s=!0;break;default:return sF.vr()}let o=sq(this.expr.params[2]).evaluate(e,t);switch(o.type){case"INT":break;case"NULL":s=!0;break;default:return sF.vr()}if(s)return sF.Dr();let u=BigInt(o.value.integerValue);try{switch(r){case"microsecond":n=u;break;case"millisecond":n=u*BigInt(1e3);break;case"second":n=u*BigInt(1e6);break;case"minute":n=u*BigInt(6e7);break;case"hour":n=u*BigInt(36e8);break;case"day":n=u*BigInt(864e8);break;default:return sF.vr()}if("microsecond"!==r&&u!==BigInt(0)&&n/u!==BigInt(this.Kr(r)))return sF.vr()}catch(e){return E(`Error during timestamp arithmetic: ${e}`),sF.vr()}let l=rF(i.value.timestampValue);if(!i1(l.seconds,l.nanoseconds))return sF.vr();let c=i3(l),h=this.Wr(c,n);if(!i0(h))return sF.vr();let d=Number(h/iW),m=h%iW,f=Number((m<0?m+iW:m)*BigInt(1e3)),p=m<0?d-1:d;return i1(p,f)?sF.newValue({timestampValue:{seconds:p,nanos:f}}):sF.vr()}Kr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class an extends ar{Wr(e,t){return e+t}}class as extends ar{Wr(e,t){return e-t}}function ai(e){if((e=sB(e))instanceof so)return`fld(${e.fieldName})`;if(e instanceof sl){var t;return`cst(${null===(t=e.value)?"null":"number"==typeof t?t.toString():"string"==typeof t?`"${t}"`:t instanceof nD?`ref(${t.path})`:t instanceof nU?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})`}if(e instanceof sd)return`fn(${e.name},[${e.params.map(ai).join(",")}])`;if("ListOfExpressions"===e.expressionType)return`list([${e.Rr.map(ai).join(",")}])`;throw Error(`Unrecognized expr ${JSON.stringify(e,null,2)}`)}function aa(e){return`${Array.from(e.entries()).sort().map(([e,t])=>`${e}=${ai(t)}`).join(",")}`}function ao(e){return e.stages.map(e=>(function(e){if(e instanceof sv)return`${e._name}(${aa(e.fields)})`;if(e instanceof s_){let t=`${e._name}(${aa(e.accumulators)})`;return e.groups.size>0&&(t+=`grouping(${aa(e.groups)})`),t}if(e instanceof sE)return`${e._name}(${aa(e.groups)})`;if(e instanceof sT)return`${e._name}(${e.Vr})`;if(e instanceof sx)return`${e._name}(${e.collectionId})`;if(e instanceof sb)return`${e._name}()`;if(e instanceof sN)return`${e._name}(${e.dr.sort()})`;if(e instanceof sS)return`${e._name}(${ai(e.condition)})`;if(e instanceof sI)return`${e._name}(${e.limit})`;if(e instanceof sA)return`${e._name}(${e.orderings.map(e=>`${ai(e.expr)}${e.direction}`).join(",")})`;throw Error(`Unrecognized stage ${e._name}`)})(e)).join("|")}function au(e){return e instanceof sR}function al(e){return au(e)?ao(e):rn(e)}function ac(e){return au(e)?ao(e):`${t0(t7(e))}|lt:${e.limitType}`}function ah(e,t){return e instanceof sR&&t instanceof sR?ao(e)===ao(t):!(e instanceof sR&&!(t instanceof sR)||!(e instanceof sR)&&t instanceof sR)&&t1(t7(e),t7(t))&&e.limitType===t.limitType}function ad(e){return t2(e)?ao(e):t0(e)}function am(e,t){return e instanceof sR&&t instanceof sR?ao(e)===ao(t):!(e instanceof sR&&!(t instanceof sR)||!(e instanceof sR)&&t instanceof sR)&&t1(e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class af{constructor(e,t,r,n){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=n}applyToRemoteDocument(e,t){let r=t.mutationResults;for(let t=0;t<this.mutations.length;t++){let s=this.mutations[t];if(s.key.isEqual(e.key)){var n;n=r[t],s instanceof tI?function(e,t,r){let n=e.value.clone(),s=tA(e.fieldTransforms,t,r.transformResults);n.setAll(s),t.convertToFoundDocument(r.version,n).setHasCommittedMutations()}(s,e,n):s instanceof tV?function(e,t,r){if(!tT(e.precondition,t))return void t.convertToUnknownDocument(r.version);let n=tA(e.fieldTransforms,t,r.transformResults),s=t.data;s.setAll(tC(e)),s.setAll(n),t.convertToFoundDocument(r.version,s).setHasCommittedMutations()}(s,e,n):function(e,t,r){t.convertToNoDocument(r.version).setHasCommittedMutations()}(0,e,n)}}}applyToLocalView(e,t){for(let r of this.baseMutations)r.key.isEqual(e.key)&&(t=tN(r,e,t,this.localWriteTime));for(let r of this.mutations)r.key.isEqual(e.key)&&(t=tN(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){let r=rm();return this.mutations.forEach(n=>{let s=e.get(n.key),i=s.overlayedDocument,a=this.applyToLocalView(i,s.mutatedFields);a=t.has(n.key)?null:a;let o=tb(i,a);null!==o&&r.set(n.key,o),i.isValidDocument()||i.convertToNoDocument(es.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),rg())}isEqual(e){return this.batchId===e.batchId&&B(this.mutations,e.mutations,(e,t)=>tS(e,t))&&B(this.baseMutations,e.baseMutations,(e,t)=>tS(e,t))}}class ap{constructor(e,t,r,n){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=n}static from(e,t,r){N(e.mutations.length===r.length,58842,{Qr:e.mutations.length,Gr:r.length});let n=rf,s=e.mutations;for(let e=0;e<s.length;e++)n=n.insert(s[e].key,r[e].version);return new ap(e,t,r,n)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ag{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ay{constructor(e,t,r,n,s=es.min(),i=es.min(),a=eT.EMPTY_BYTE_STRING,o=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=n,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=a,this.expectedCount=o}withSequenceNumber(e){return new ay(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new ay(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ay(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ay(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aw{constructor(e){this.zr=e}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class av{constructor(){}Yr(e,t){this.Zr(e,t),t.Xr()}Zr(e,t){if("nullValue"in e)this.ei(t,5);else if("booleanValue"in e)this.ei(t,10),t.ti(e.booleanValue?1:0);else if("integerValue"in e)this.ei(t,15),t.ti(eN(e.integerValue));else if("doubleValue"in e){let r=eN(e.doubleValue);isNaN(r)?this.ei(t,13):(this.ei(t,15),eh(r)?t.ti(0):t.ti(r))}else if("timestampValue"in e){let r=e.timestampValue;this.ei(t,20),"string"==typeof r&&(r=eb(r)),t.ni(`${r.seconds||""}`),t.ti(r.nanos||0)}else if("stringValue"in e)this.ri(e.stringValue,t),this.ii(t);else if("bytesValue"in e)this.ei(t,30),t.si(eS(e.bytesValue)),this.ii(t);else if("referenceValue"in e)this._i(e.referenceValue,t);else if("geoPointValue"in e){let r=e.geoPointValue;this.ei(t,45),t.ti(r.latitude||0),t.ti(r.longitude||0)}else"mapValue"in e?te(e)?this.ei(t,Number.MAX_SAFE_INTEGER):e5(e)?this.oi(e.mapValue,t):(this.ai(e.mapValue,t),this.ii(t)):"arrayValue"in e?(this.ui(e.arrayValue,t),this.ii(t)):x(19022,{ci:e})}ri(e,t){this.ei(t,25),this.li(e,t)}li(e,t){t.ni(e)}ai(e,t){let r=e.fields||{};for(let e of(this.ei(t,55),Object.keys(r)))this.ri(e,t),this.Zr(r[e],t)}oi(e,t){let r=e.fields||{};this.ei(t,53);let n=r[eq].arrayValue?.values?.length||0;this.ei(t,15),t.ti(eN(n)),this.ri(eq,t),this.Zr(r[eq],t)}ui(e,t){let r=e.values||[];for(let e of(this.ei(t,50),r))this.Zr(e,t)}_i(e,t){this.ei(t,37),G.fromName(e).path.forEach(e=>{this.ei(t,60),this.li(e,t)})}ei(e,t){e.ti(t)}ii(e){e.ti(2)}}av.Ei=new av;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a_{constructor(){this.Hi=new aE}addToCollectionParentIndex(e,t){return this.Hi.add(t),eu.resolve()}getCollectionParents(e,t){return eu.resolve(this.Hi.getEntries(t))}addFieldIndex(e,t){return eu.resolve()}deleteFieldIndex(e,t){return eu.resolve()}deleteAllFieldIndexes(e){return eu.resolve()}createTargetIndexes(e,t){return eu.resolve()}getDocumentsMatchingTarget(e,t){return eu.resolve(null)}getIndexType(e,t){return eu.resolve(0)}getFieldIndexes(e,t){return eu.resolve([])}getNextCollectionGroupToUpdate(e){return eu.resolve(null)}getMinOffset(e,t){return eu.resolve(ei.min())}getMinOffsetFromCollectionGroup(e,t){return eu.resolve(ei.min())}updateCollectionGroup(e,t,r){return eu.resolve()}updateIndexEntries(e,t){return eu.resolve()}}class aE{constructor(){this.index={}}add(e){let t=e.lastSegment(),r=e.popLast(),n=this.index[t]||new ep(Q.comparator),s=!n.has(r);return this.index[t]=n.add(r),s}has(e){let t=e.lastSegment(),r=e.popLast(),n=this.index[t];return n&&n.has(r)}getEntries(e){return(this.index[e]||new ep(Q.comparator)).toArray()}}new Uint8Array(0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aT{constructor(e){this.Ds=e}next(){return this.Ds+=2,this.Ds}static xs(){return new aT(0)}static Cs(){return new aT(-1)}}// Copyright 2024 Google LLC* @license
function ax(e,t){let r=t;for(let t of e.stages)r=function(e,t,r){if(t instanceof sT)return r.filter(e=>e.isFoundDocument()&&`/${e.key.getCollectionPath().canonicalString()}`===t.Vr);if(t instanceof sS)return r.filter(r=>{let n=s$(sq(t.condition).evaluate(e,r));return void 0!==n&&eG(n,eQ)});if(t instanceof sx)return r.filter(e=>e.isFoundDocument()&&e.key.getCollectionPath().lastSegment()===t.collectionId);if(t instanceof sb)return r.filter(e=>e.isFoundDocument());if(t instanceof sN)return r.filter(e=>e.isFoundDocument()&&t.mr.has(e.key.path.toStringWithLeadingSlash()));if(t instanceof sI)return r.slice(0,t.limit);if(t instanceof sA)return function(e,t,r){let n=t.orderings.map(e=>({ks:sq(e.expr),direction:e.direction}));return[...r].sort((t,r)=>{for(let{ks:s,direction:i}of n){let n=s$(s.evaluate(e,t)),a=s$(s.evaluate(e,r)),o=eW(n??ez,a??ez);if(0!==o)return"ascending"===i?o:-o}return 0})}(e,t,r);throw Error(`Unknown stage: ${t._name}`)}({serializer:e.serializer,serverTimestampBehavior:e.listenOptions?.serverTimestampBehavior},t,r);return r}function ab(e,t){return ax(e,[t]).length>0}function aN(e){let t=function(e){for(let t=e.stages.length-1;t>=0;t--){let r=e.stages[t];if(r instanceof sA)return r.orderings}throw Error("Pipeline must contain at least one Sort stage")}(e);return(r,n)=>{for(let s of t){let t=s$(sq(s.expr).evaluate({serializer:e.serializer},r)),i=s$(sq(s.expr).evaluate({serializer:e.serializer},n)),a=eW(t||ez,i||ez);if(0!==a)return"ascending"===s.direction?a:-a}return 0}}function aS(e){for(let t=e.stages.length-1;t>=0;t--){let r=e.stages[t];if(r instanceof sI)return{limit:r.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aI{constructor(){this.changes=new ru(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,tJ.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();let r=this.changes.get(t);return void 0!==r?eu.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aV{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aC{constructor(e,t,r,n){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=n}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(n=>(r=n,this.remoteDocumentCache.getEntry(e,t))).next(e=>(null!==r&&tN(r.mutation,e,ey.empty(),en.now()),e))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.getLocalViewOfDocuments(e,t,rg()).next(()=>t))}getLocalViewOfDocuments(e,t,r=rg()){let n=rm();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,r).next(e=>{let t=rh();return e.forEach((e,r)=>{t=t.insert(e,r.overlayedDocument)}),t}))}getOverlayedDocuments(e,t){let r=rm();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,rg()))}populateOverlays(e,t,r){let n=[];return r.forEach(e=>{t.has(e)||n.push(e)}),this.documentOverlayCache.getOverlays(e,n).next(e=>{e.forEach((e,r)=>{t.set(e,r)})})}computeViews(e,t,r,n){let s=rl,i=rm(),a=rm();return t.forEach((e,t)=>{let a=r.get(t.key);n.has(t.key)&&(void 0===a||a.mutation instanceof tV)?s=s.insert(t.key,t):void 0!==a?(i.set(t.key,a.mutation.getFieldMask()),tN(a.mutation,t,a.mutation.getFieldMask(),en.now())):i.set(t.key,ey.empty())}),this.recalculateAndSaveOverlays(e,s).next(e=>(e.forEach((e,t)=>i.set(e,t)),t.forEach((e,t)=>a.set(e,new aV(t,i.get(e)??null))),a))}recalculateAndSaveOverlays(e,t){let r=rm(),n=new ed((e,t)=>e-t),s=rg();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(e=>{for(let s of e)s.keys().forEach(e=>{let i=t.get(e);if(null===i)return;let a=r.get(e)||ey.empty();a=s.applyToLocalView(i,a),r.set(e,a);let o=(n.get(s.batchId)||rg()).add(e);n=n.insert(s.batchId,o)})}).next(()=>{let i=[],a=n.getReverseIterator();for(;a.hasNext();){let n=a.getNext(),o=n.key,u=n.value,l=rm();u.forEach(e=>{if(!s.has(e)){let n=tb(t.get(e),r.get(e));null!==n&&l.set(e,n),s=s.add(e)}}),i.push(this.documentOverlayCache.saveOverlays(e,o,l))}return eu.waitFor(i)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.recalculateAndSaveOverlays(e,t))}getDocumentsMatchingQuery(e,t,r,n){return au(t)?this.getDocumentsMatchingPipeline(e,t,r,n):G.isDocumentKey(t.path)&&null===t.collectionGroup&&0===t.filters.length?this.getDocumentsMatchingDocumentQuery(e,t.path):t5(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,n):this.getDocumentsMatchingCollectionQuery(e,t,r,n)}getNextDocuments(e,t,r,n){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,n).next(s=>{let i=n-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,n-s.size):eu.resolve(rm()),a=-1,o=s;return i.next(t=>eu.forEach(t,(t,r)=>(a<r.largestBatchId&&(a=r.largestBatchId),s.get(t)?eu.resolve():this.remoteDocumentCache.getEntry(e,t).next(e=>{o=o.insert(t,e)}))).next(()=>this.populateOverlays(e,t,s)).next(()=>this.computeViews(e,o,t,rg())).next(e=>({batchId:a,changes:rd(e)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new G(t)).next(e=>{let t=rh();return e.isFoundDocument()&&(t=t.insert(e.key,e)),t})}getDocumentsMatchingCollectionGroupQuery(e,t,r,n){let s=t.collectionGroup,i=rh();return this.indexManager.getCollectionParents(e,s).next(a=>eu.forEach(a,a=>{var o;let u=(o=a.child(s),new t4(o,null,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt));return this.getDocumentsMatchingCollectionQuery(e,u,r,n).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,t,r,n){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,n))).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>rs(t,e)))}getDocumentsMatchingPipeline(e,t,r,n){if("collection_group"===sL(t)){let s=sP(t),i=rh();return this.indexManager.getCollectionParents(e,s).next(a=>eu.forEach(a,a=>{let o=function(e,t){let r=e.stages.map(e=>e instanceof sx?new sT(t.canonicalString(),{}):e);return new sR(e.serializer,r)}(t,a.child(s));return this.getDocumentsMatchingPipeline(e,o,r,n).next(e=>{e.forEach((e,t)=>{i=i.insert(e,t)})})}).next(()=>i))}{let s;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next(i=>{switch(s=i,sL(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,n);case"documents":let a=rg();for(let e of sO(t))a=a.add(G.fromPath(e));return this.remoteDocumentCache.getEntries(e,a);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new I("invalid-argument",`Invalid pipeline source to execute offline: ${ao(t)}`)}}).next(e=>this.retrieveMatchingLocalDocuments(s,e,e=>ab(t,e)))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach((e,r)=>{let n=r.getKey();null===t.get(n)&&(t=t.insert(n,tJ.newInvalidDocument(n)))});let n=rh();return t.forEach((t,s)=>{let i=e.get(t);void 0!==i&&tN(i.mutation,s,ey.empty(),en.now()),r(s)&&(n=n.insert(t,s))}),n}getOverlaysForPipeline(e,t,r){switch(sL(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,Q.fromString(sU(t)),r);case"collection_group":throw new I("invalid-argument",`Unexpected collection group pipeline: ${ao(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,sO(t).map(e=>G.fromPath(e)));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new I("invalid-argument",`Failed to get overlays for pipeline: ${ao(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aA{constructor(e){this.serializer=e,this.Hs=new Map,this.Js=new Map}getBundleMetadata(e,t){return eu.resolve(this.Hs.get(t))}saveBundleMetadata(e,t){return this.Hs.set(t.id,{id:t.id,version:t.version,createTime:rq(t.createTime)}),eu.resolve()}getNamedQuery(e,t){return eu.resolve(this.Js.get(t))}saveNamedQuery(e,t){return this.Js.set(t.name,{name:t.name,query:function(e){let t=function(e){var t,r,n,s,i,a,o,u;let l,c=function(e){let t=rj(e);return 4===t.length?Q.emptyPath():rY(t)}(e.parent),h=e.structuredQuery,d=h.from?h.from.length:0,m=null;if(d>0){N(1===d,65062);let e=h.from[0];e.allDescendants?m=e.collectionId:c=c.child(e.collectionId)}let f=[];h.where&&(f=function(e){var t;let r=function e(t){return void 0!==t.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":let t=rZ(e.unaryFilter.field);return tM.create(t,"==",{doubleValue:NaN});case"IS_NULL":let r=rZ(e.unaryFilter.field);return tM.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let n=rZ(e.unaryFilter.field);return tM.create(n,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let s=rZ(e.unaryFilter.field);return tM.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return x(61313);default:return x(60726)}}(t):void 0!==t.fieldFilter?tM.create(rZ(t.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return x(58110);default:return x(50506)}}(t.fieldFilter.op),t.fieldFilter.value):void 0!==t.compositeFilter?tF.create(t.compositeFilter.filters.map(t=>e(t)),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return x(1026)}}(t.compositeFilter.op)):x(30097,{filter:t})}(e);return r instanceof tF&&tB(t=r)&&t$(t)?r.getFilters():[r]}(h.where));let p=[];h.orderBy&&(p=h.orderBy.map(e=>new tY(rZ(e.field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(e.direction))));let g=null;h.limit&&(g=null==(l="object"==typeof(t=h.limit)?t.value:t)?null:l);let y=null;h.startAt&&(y=function(e){let t=!!e.before,r=e.values||[];return new tL(r,t)}(h.startAt));let w=null;return h.endAt&&(w=function(e){let t=!e.before,r=e.values||[];return new tL(r,t)}(h.endAt)),r=c,n=m,s=p,i=f,a=g,o=y,u=w,new t4(r,n,s,i,a,"F",o,u)}({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?rr(t,t.limit,"L"):t}(t.bundledQuery),readTime:rq(t.readTime)}),eu.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aD{constructor(){this.overlays=new ed(G.comparator),this.Ys=new Map}getOverlay(e,t){return eu.resolve(this.overlays.get(t))}getOverlays(e,t){let r=rm();return eu.forEach(t,t=>this.getOverlay(e,t).next(e=>{null!==e&&r.set(t,e)})).next(()=>r)}getAllOverlays(e,t){let r=rm();return this.overlays.forEach((e,n)=>{n.largestBatchId>t&&r.set(e,n)}),eu.resolve(r)}saveOverlays(e,t,r){return r.forEach((r,n)=>{this.Hr(e,t,n)}),eu.resolve()}removeOverlaysForBatchId(e,t,r){let n=this.Ys.get(r);return void 0!==n&&(n.forEach(e=>this.overlays=this.overlays.remove(e)),this.Ys.delete(r)),eu.resolve()}getOverlaysForCollection(e,t,r){let n=rm(),s=t.length+1,i=new G(t.child("")),a=this.overlays.getIteratorFrom(i);for(;a.hasNext();){let e=a.getNext().value,i=e.getKey();if(!t.isPrefixOf(i.path))break;i.path.length===s&&e.largestBatchId>r&&n.set(e.getKey(),e)}return eu.resolve(n)}getOverlaysForCollectionGroup(e,t,r,n){let s=new ed((e,t)=>e-t),i=this.overlays.getIterator();for(;i.hasNext();){let e=i.getNext().value;if(e.getKey().getCollectionGroup()===t&&e.largestBatchId>r){let t=s.get(e.largestBatchId);null===t&&(t=rm(),s=s.insert(e.largestBatchId,t)),t.set(e.getKey(),e)}}let a=rm(),o=s.getIterator();for(;o.hasNext()&&(o.getNext().value.forEach((e,t)=>a.set(e,t)),!(a.size()>=n)););return eu.resolve(a)}Hr(e,t,r){let n=this.overlays.get(r.key);if(null!==n){let e=this.Ys.get(n.largestBatchId).delete(r.key);this.Ys.set(n.largestBatchId,e)}this.overlays=this.overlays.insert(r.key,new ag(t,r));let s=this.Ys.get(t);void 0===s&&(s=rg(),this.Ys.set(t,s)),this.Ys.set(t,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ak{constructor(){this.sessionToken=eT.EMPTY_BYTE_STRING}getSessionToken(e){return eu.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,eu.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aR{constructor(){this.Zs=new ep(aL.Xs),this.e_=new ep(aL.t_)}isEmpty(){return this.Zs.isEmpty()}addReference(e,t){let r=new aL(e,t);this.Zs=this.Zs.add(r),this.e_=this.e_.add(r)}n_(e,t){e.forEach(e=>this.addReference(e,t))}removeReference(e,t){this.r_(new aL(e,t))}i_(e,t){e.forEach(e=>this.removeReference(e,t))}s_(e){let t=new G(new Q([])),r=new aL(t,e),n=new aL(t,e+1),s=[];return this.e_.forEachInRange([r,n],e=>{this.r_(e),s.push(e.key)}),s}__(){this.Zs.forEach(e=>this.r_(e))}r_(e){this.Zs=this.Zs.delete(e),this.e_=this.e_.delete(e)}o_(e){let t=new G(new Q([])),r=new aL(t,e),n=new aL(t,e+1),s=rg();return this.e_.forEachInRange([r,n],e=>{s=s.add(e.key)}),s}containsKey(e){let t=new aL(e,0),r=this.Zs.firstAfterOrEqual(t);return null!==r&&e.isEqual(r.key)}}class aL{constructor(e,t){this.key=e,this.a_=t}static Xs(e,t){return G.comparator(e.key,t.key)||M(e.a_,t.a_)}static t_(e,t){return M(e.a_,t.a_)||G.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aU{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.gs=1,this.u_=new ep(aL.Xs)}checkEmpty(e){return eu.resolve(0===this.mutationQueue.length)}addMutationBatch(e,t,r,n){let s=this.gs;this.gs++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new af(s,t,r,n);for(let t of(this.mutationQueue.push(i),n))this.u_=this.u_.add(new aL(t.key,s)),this.indexManager.addToCollectionParentIndex(e,t.key.path.popLast());return eu.resolve(i)}lookupMutationBatch(e,t){return eu.resolve(this.c_(t))}getNextMutationBatchAfterBatchId(e,t){let r=this.l_(t+1),n=r<0?0:r;return eu.resolve(this.mutationQueue.length>n?this.mutationQueue[n]:null)}getHighestUnacknowledgedBatchId(){return eu.resolve(0===this.mutationQueue.length?-1:this.gs-1)}getAllMutationBatches(e){return eu.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){let r=new aL(t,0),n=new aL(t,Number.POSITIVE_INFINITY),s=[];return this.u_.forEachInRange([r,n],e=>{let t=this.c_(e.a_);s.push(t)}),eu.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ep(M);return t.forEach(e=>{let t=new aL(e,0),n=new aL(e,Number.POSITIVE_INFINITY);this.u_.forEachInRange([t,n],e=>{r=r.add(e.a_)})}),eu.resolve(this.E_(r))}getAllMutationBatchesAffectingQuery(e,t){let r=t.path,n=r.length+1,s=r;G.isDocumentKey(s)||(s=s.child(""));let i=new aL(new G(s),0),a=new ep(M);return this.u_.forEachWhile(e=>{let t=e.key.path;return!!r.isPrefixOf(t)&&(t.length===n&&(a=a.add(e.a_)),!0)},i),eu.resolve(this.E_(a))}E_(e){let t=[];return e.forEach(e=>{let r=this.c_(e);null!==r&&t.push(r)}),t}removeMutationBatch(e,t){N(0===this.h_(t.batchId,"removed"),55003),this.mutationQueue.shift();let r=this.u_;return eu.forEach(t.mutations,n=>{let s=new aL(n.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,n.key)}).next(()=>{this.u_=r})}bs(e){}containsKey(e,t){let r=new aL(t,0),n=this.u_.firstAfterOrEqual(r);return eu.resolve(t.isEqual(n&&n.key))}performConsistencyCheck(e){return this.mutationQueue.length,eu.resolve()}h_(e,t){return this.l_(e)}l_(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}c_(e){let t=this.l_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aP{constructor(e){this.T_=e,this.docs=new ed(G.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){let r=t.key,n=this.docs.get(r),s=n?n.size:0,i=this.T_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){let t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){let r=this.docs.get(t);return eu.resolve(r?r.document.mutableCopy():tJ.newInvalidDocument(t))}getEntries(e,t){let r=rl;return t.forEach(e=>{let t=this.docs.get(e);r=r.insert(e,t?t.document.mutableCopy():tJ.newInvalidDocument(e))}),eu.resolve(r)}getAllEntries(e){let t=rl;return this.docs.forEach((e,r)=>{t=t.insert(e,r.document)}),eu.resolve(t)}getDocumentsMatchingQuery(e,t,r,n){let s,i;au(t)?(s=Q.fromString(sU(t)),i=e=>ab(t,e)):(s=t.path,i=e=>rs(t,e));let a=rl,o=new G(s.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(o);for(;u.hasNext();){let{key:e,value:{document:t}}=u.getNext();if(!s.isPrefixOf(e.path))break;e.path.length>s.length+1||0>=function(e,t){let r=e.readTime.compareTo(t.readTime);return 0!==r?r:0!==(r=G.comparator(e.documentKey,t.documentKey))?r:M(e.largestBatchId,t.largestBatchId)}(new ei(t.readTime,t.key,-1),r)||(n.has(t.key)||i(t))&&(a=a.insert(t.key,t.mutableCopy()))}return eu.resolve(a)}getAllFromCollectionGroup(e,t,r,n){x(9500)}P_(e,t){return eu.forEach(this.docs,e=>t(e))}newChangeBuffer(e){return new aO(this)}getSize(e){return eu.resolve(this.size)}}class aO extends aI{constructor(e){super(),this.zs=e}applyChanges(e){let t=[];return this.changes.forEach((r,n)=>{n.isValidDocument()?t.push(this.zs.addEntry(e,n)):this.zs.removeEntry(r)}),eu.waitFor(t)}getFromCache(e,t){return this.zs.getEntry(e,t)}getAllFromCache(e,t){return this.zs.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aM{constructor(e){this.persistence=e,this.R_=new ru(e=>ad(e),am),this.lastRemoteSnapshotVersion=es.min(),this.highestTargetId=0,this.I_=0,this.A_=new aR,this.targetCount=0,this.V_=aT.xs()}forEachTarget(e,t){return this.R_.forEach((e,r)=>t(r)),eu.resolve()}getLastRemoteSnapshotVersion(e){return eu.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return eu.resolve(this.I_)}allocateTargetId(e){return this.highestTargetId=this.V_.next(),eu.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.I_&&(this.I_=t),eu.resolve()}Ms(e){this.R_.set(e.target,e);let t=e.targetId;t>this.highestTargetId&&(this.V_=new aT(t),this.highestTargetId=t),e.sequenceNumber>this.I_&&(this.I_=e.sequenceNumber)}addTargetData(e,t){return this.Ms(t),this.targetCount+=1,eu.resolve()}updateTargetData(e,t){return this.Ms(t),eu.resolve()}removeTargetData(e,t){return this.R_.delete(t.target),this.A_.s_(t.targetId),this.targetCount-=1,eu.resolve()}removeTargets(e,t,r){let n=0,s=[];return this.R_.forEach((i,a)=>{a.sequenceNumber<=t&&null===r.get(a.targetId)&&(this.R_.delete(i),s.push(this.removeMatchingKeysForTargetId(e,a.targetId)),n++)}),eu.waitFor(s).next(()=>n)}getTargetCount(e){return eu.resolve(this.targetCount)}getTargetData(e,t){let r=this.R_.get(t)||null;return eu.resolve(r)}addMatchingKeys(e,t,r){return this.A_.n_(t,r),eu.resolve()}removeMatchingKeys(e,t,r){this.A_.i_(t,r);let n=this.persistence.referenceDelegate,s=[];return n&&t.forEach(t=>{s.push(n.markPotentiallyOrphaned(e,t))}),eu.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.A_.s_(t),eu.resolve()}getMatchingKeysForTargetId(e,t){let r=this.A_.o_(t);return eu.resolve(r)}containsKey(e,t){return eu.resolve(this.A_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aF{constructor(e,t){this.d_={},this.overlays={},this.f_=new ec(0),this.m_=!1,this.m_=!0,this.p_=new ak,this.referenceDelegate=e(this),this.g_=new aM(this),this.indexManager=new a_,this.remoteDocumentCache=new aP(e=>this.referenceDelegate.y_(e)),this.serializer=new aw(t),this.w_=new aA(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.m_=!1,Promise.resolve()}get started(){return this.m_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new aD,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.d_[e.toKey()];return r||(r=new aU(t,this.referenceDelegate),this.d_[e.toKey()]=r),r}getGlobalsCache(){return this.p_}getTargetCache(){return this.g_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.w_}runTransaction(e,t,r){v("MemoryPersistence","Starting transaction:",e);let n=new a$(this.f_.next());return this.referenceDelegate.b_(),r(n).next(e=>this.referenceDelegate.v_(n).next(()=>e)).toPromise().then(e=>(n.raiseOnCommittedEvent(),e))}S_(e,t){return eu.or(Object.values(this.d_).map(r=>()=>r.containsKey(e,t)))}}class a$ extends ea{constructor(e){super(),this.currentSequenceNumber=e}}class aB{constructor(e){this.persistence=e,this.D_=new aR,this.x_=null}static C_(e){return new aB(e)}get F_(){if(this.x_)return this.x_;throw x(60996)}addReference(e,t,r){return this.D_.addReference(r,t),this.F_.delete(r.toString()),eu.resolve()}removeReference(e,t,r){return this.D_.removeReference(r,t),this.F_.add(r.toString()),eu.resolve()}markPotentiallyOrphaned(e,t){return this.F_.add(t.toString()),eu.resolve()}removeTarget(e,t){this.D_.s_(t.targetId).forEach(e=>this.F_.add(e.toString()));let r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(e=>{e.forEach(e=>this.F_.add(e.toString()))}).next(()=>r.removeTargetData(e,t))}b_(){this.x_=new Set}v_(e){let t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return eu.forEach(this.F_,r=>{let n=G.fromPath(r);return this.O_(e,n).next(e=>{e||t.removeEntry(n,es.min())})}).next(()=>(this.x_=null,t.apply(e)))}updateLimboDocument(e,t){return this.O_(e,t).next(e=>{e?this.F_.delete(t.toString()):this.F_.add(t.toString())})}y_(e){return 0}O_(e,t){return eu.or([()=>eu.resolve(this.D_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.S_(e,t)])}}class aq{constructor(e,t){this.persistence=e,this.M_=new ru(e=>(function(e){var t,r;let n="";for(let t=0;t<e.length;t++)n.length>0&&(n=n+"\x01\x01"),n=function(e,t){let r=t,n=e.length;for(let t=0;t<n;t++){let n=e.charAt(t);switch(n){case"\x00":r+="\x01\x10";break;case"\x01":r+="\x01\x11";break;default:r+=n}}return r}(e.get(t),n);return n+"\x01\x01"})(e.path),(e,t)=>e.isEqual(t)),this.garbageCollector=new nS(this,t)}static C_(e,t){return new aq(e,t)}b_(){}v_(e){return eu.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}lr(e){let t=this.Ls(e);return this.persistence.getTargetCache().getTargetCount(e).next(e=>t.next(t=>e+t))}Ls(e){let t=0;return this.Er(e,e=>{t++}).next(()=>t)}Er(e,t){return eu.forEach(this.M_,(r,n)=>this.Us(e,r,n).next(e=>e?eu.resolve():t(n)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0,n=this.persistence.getRemoteDocumentCache(),s=n.newChangeBuffer();return n.P_(e,n=>this.Us(e,n,t).next(e=>{e||(r++,s.removeEntry(n,es.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.M_.set(t,e.currentSequenceNumber),eu.resolve()}removeTarget(e,t){let r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.M_.set(r,e.currentSequenceNumber),eu.resolve()}removeReference(e,t,r){return this.M_.set(r,e.currentSequenceNumber),eu.resolve()}updateLimboDocument(e,t){return this.M_.set(t,e.currentSequenceNumber),eu.resolve()}y_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=function e(t){switch(eK(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let r=ek(t);return r?16+e(r):16;case 5:return 2*t.stringValue.length;case 6:return eS(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return(t.arrayValue.values||[]).reduce((t,r)=>t+e(r),0);case 10:case 11:var n;let s;return n=t.mapValue,s=0,ev(n.fields,(t,r)=>{s+=t.length+e(r)}),s;default:throw x(13486,{value:t})}}(e.data.value)),t}Us(e,t,r){return eu.or([()=>this.persistence.S_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{let e=this.M_.get(t);return eu.resolve(void 0!==e&&e>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class az{constructor(e,t,r,n){this.targetId=e,this.fromCache=t,this.wo=r,this.bo=n}static vo(e,t){let r=rg(),n=rg();for(let e of t.docChanges)switch(e.type){case 0:r=r.add(e.doc.key);break;case 1:n=n.add(e.doc.key)}return new az(e,t.fromCache,r,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aQ(e,t){return G.comparator(e.key,t.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aj{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aK{constructor(){this.So=!1,this.Do=!1,this.xo=100,this.Co=(0,u.G6)()?8:function(e){let t=e.match(/Android ([\d.]+)/i),r=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(r)}((0,u.z$)())>0?6:4}initialize(e,t){this.Fo=e,this.indexManager=t,this.So=!0}getDocumentsMatchingQuery(e,t,r,n){let s={result:null};return this.Oo(e,t).next(e=>{s.result=e}).next(()=>{if(!s.result)return this.Mo(e,t,n,r).next(e=>{s.result=e})}).next(()=>{if(s.result)return;let r=new aj;return this.No(e,t,r).next(n=>{if(s.result=n,this.Do)return this.Lo(e,t,r,n.size)})}).next(()=>s.result)}Lo(e,t,r,n){return au(t)?eu.resolve():r.documentReadCount<this.xo?(w()<=c.in.DEBUG&&v("QueryEngine","SDK will not create cache indexes for query:",rn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.xo,"documents"),eu.resolve()):(w()<=c.in.DEBUG&&v("QueryEngine","Query:",rn(t),"scans",r.documentReadCount,"local documents and returns",n,"documents as results."),r.documentReadCount>this.Co*n?(w()<=c.in.DEBUG&&v("QueryEngine","The SDK decides to create cache indexes for query:",rn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,t7(t))):eu.resolve())}Oo(e,t){if(au(t))return eu.resolve(null);let r=t;if(t9(r))return eu.resolve(null);let n=t7(r);return this.indexManager.getIndexType(e,n).next(t=>0===t?null:(null!==r.limit&&1===t&&(n=t7(r=rr(r,null,"F"))),this.indexManager.getDocumentsMatchingTarget(e,n).next(t=>{let s=rg(...t);return this.Fo.getDocuments(e,s).next(t=>this.indexManager.getMinOffset(e,n).next(n=>{let i=this.Bo(r,t);return this.Uo(r,i,s,n.readTime)?this.Oo(e,rr(r,null,"F")):this.ko(e,i,r,n)}))})))}Mo(e,t,r,n){return(au(t)?function(e){for(let t of e.stages){if(t instanceof sI||t instanceof sV)return!1;if(t instanceof sS){if(t.condition instanceof sf&&"exists"===t.condition._expr.name&&t.condition._expr.params[0]instanceof so&&t.condition._expr.params[0].fieldName===q)continue;return!1}}return!0}(t):t9(t))||n.isEqual(es.min())?eu.resolve(null):this.Fo.getDocuments(e,r).next(s=>{let i=this.Bo(t,s);return this.Uo(t,i,r,n)?eu.resolve(null):(w()<=c.in.DEBUG&&v("QueryEngine","Re-using previous result from %s to execute query: %s",n.toString(),al(t)),this.ko(e,i,t,function(e,t){let r=e.toTimestamp().seconds,n=e.toTimestamp().nanoseconds+1,s=es.fromTimestamp(1e9===n?new en(r+1,0):new en(r,n));return new ei(s,G.empty(),-1)}(n,0)).next(e=>e))})}Bo(e,t){let r,n;return au(e)?(r=new ep(aQ),n=t=>ab(e,t)):(r=new ep(ri(e)),n=t=>rs(e,t)),t.forEach((e,t)=>{n(t)&&(r=r.add(t))}),r}Uo(e,t,r,n){if(au(e))return e.stages.some(e=>e instanceof sI||e instanceof sV);if(null===e.limit)return!1;if(r.size!==t.size)return!0;let s="F"===e.limitType?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(n)>0)}No(e,t,r){return w()<=c.in.DEBUG&&v("QueryEngine","Using full collection scan to execute query:",al(t)),this.Fo.getDocumentsMatchingQuery(e,t,ei.min(),r)}ko(e,t,r,n){return this.Fo.getDocumentsMatchingQuery(e,r,n).next(e=>(t.forEach(t=>{e=e.insert(t.key,t)}),e))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let aG="LocalStore";class aH{constructor(e,t,r,n){this.persistence=e,this.qo=t,this.serializer=n,this.$o=new ed(M),this.Ko=new ru(e=>ad(e),am),this.Wo=new Map,this.Qo=e.getRemoteDocumentCache(),this.g_=e.getTargetCache(),this.w_=e.getBundleCache(),this.Go(r)}Go(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new aC(this.Qo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Qo.setIndexManager(this.indexManager),this.qo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.$o))}}async function aW(e,t){return await e.persistence.runTransaction("Handle user change","readonly",r=>{let n;return e.mutationQueue.getAllMutationBatches(r).next(s=>(n=s,e.Go(t),e.mutationQueue.getAllMutationBatches(r))).next(t=>{let s=[],i=[],a=rg();for(let e of n)for(let t of(s.push(e.batchId),e.mutations))a=a.add(t.key);for(let e of t)for(let t of(i.push(e.batchId),e.mutations))a=a.add(t.key);return e.localDocuments.getDocuments(r,a).next(e=>({zo:e,removedBatchIds:s,addedBatchIds:i}))})})}function aY(e){return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.g_.getLastRemoteSnapshotVersion(t))}async function aJ(e,t,r){let n=e.$o.get(t);try{r||await e.persistence.runTransaction("Release target",r?"readwrite":"readwrite-primary",t=>e.persistence.referenceDelegate.removeTarget(t,n))}catch(e){if(!el(e))throw e;v(aG,`Failed to update sequence numbers for target ${t}: ${e}`)}e.$o=e.$o.remove(t),e.Ko.delete(n.target)}function aX(e,t,r){let n=es.min(),s=rg();return e.persistence.runTransaction("Execute query","readwrite",i=>(function(e,t,r){let n=e.Ko.get(r);return void 0!==n?eu.resolve(e.$o.get(n)):e.g_.getTargetData(t,r)})(e,i,au(t)?t:t7(t)).next(t=>{if(t)return n=t.lastLimboFreeSnapshotVersion,e.g_.getMatchingKeysForTargetId(i,t.targetId).next(e=>{s=e})}).next(()=>e.qo.getDocumentsMatchingQuery(i,t,r?n:es.min(),r?s:rg())).next(t=>((function(e,t){t.forEach((t,r)=>{let n=r.key.getCollectionGroup(),s=e.Wo.get(n)||es.min();r.readTime.compareTo(s)>0&&e.Wo.set(n,r.readTime)})})(e,t),{documents:t,Jo:s})))}class aZ{constructor(){this.activeTargetIds=ry}na(e){this.activeTargetIds=this.activeTargetIds.add(e)}ra(e){this.activeTargetIds=this.activeTargetIds.delete(e)}ta(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class a0{constructor(){this.Ua=new aZ,this.ka={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.Ua.na(e),this.ka[e]||"not-current"}updateQueryState(e,t,r){this.ka[e]=t}removeLocalQueryTarget(e){this.Ua.ra(e)}isLocalQueryTarget(e){return this.Ua.activeTargetIds.has(e)}clearQueryState(e){delete this.ka[e]}getAllActiveQueryTargets(){return this.Ua.activeTargetIds}isActiveQueryTarget(e){return this.Ua.activeTargetIds.has(e)}start(){return this.Ua=new aZ,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function a1(){return"undefined"!=typeof document?document:null}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a2{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.qa=0,this.$a=null,this.Ka=!0}Wa(){0===this.qa&&(this.Qa("Unknown"),this.$a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.$a=null,this.Ga("Backend didn't respond within 10 seconds."),this.Qa("Offline"),Promise.resolve())))}za(e){"Online"===this.state?this.Qa("Unknown"):(this.qa++,this.qa>=1&&(this.ja(),this.Ga(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.Qa("Offline")))}set(e){this.ja(),this.qa=0,"Online"===e&&(this.Ka=!1),this.Qa(e)}Qa(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}Ga(e){let t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Ka?(_(t),this.Ka=!1):v("OnlineStateTracker",t)}ja(){null!==this.$a&&(this.$a.cancel(),this.$a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let a3="RemoteStore";class a4{constructor(e,t,r,n,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.Ha=[],this.Ja=new Map,this.Ya=new Map,this.Za=new Map,this.Xa=new aT(1e3),this.eu=new aT(1001),this.tu=new Set,this.nu=[],this.ru=s,this.ru.bt(e=>{r.enqueueAndForget(async()=>{os(this)&&(v(a3,"Restarting streams for network reachability change."),await async function(e){e.tu.add(4),await a9(e),e.iu.set("Unknown"),e.tu.delete(4),await a6(e)}(this))})}),this.iu=new a2(r,n)}}async function a6(e){if(os(e))for(let t of e.nu)await t(!0)}async function a9(e){for(let t of e.nu)await t(!1)}function a5(e,t){return e.Ya.get(t)||void 0}function a8(e,t){let r=a5(e,t.targetId);if(void 0!==r&&e.Ja.has(r))return;let n=function(e,t){let r=a5(e,t);void 0!==r&&e.Za.delete(r);let n=t%2!=0?e.eu.next():e.Xa.next();return e.Ya.set(t,n),e.Za.set(n,t),n}(e,t.targetId);v(a3,"remoteStoreListen mapping SDK target ID to remote",t.targetId,n);let s=new ay(t.target,n,t.purpose,t.sequenceNumber,t.snapshotVersion,t.lastLimboFreeSnapshotVersion,t.resumeToken);e.Ja.set(n,s),on(e)?or(e):o_(e).Fn()&&oe(e,s)}function a7(e,t){let r=o_(e),n=a5(e,t);v(a3,"remoteStoreUnlisten removing mapping of SDK target ID to remote",t,n),e.Ja.delete(n),e.Ya.delete(t),e.Za.delete(n),r.Fn()&&ot(e,n),0===e.Ja.size&&(r.Fn()?r.Nn():os(e)&&e.iu.set("Unknown"))}function oe(e,t){if(e.su.We(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(es.min())>0){let r=e.Za.get(t.targetId);if(void 0===r)return void v(a3,"SDK target ID not found for remote ID: "+t.targetId);let n=e.remoteSyncer.getRemoteKeysForTarget(r).size;t=t.withExpectedCount(n)}o_(e).jn(t)}function ot(e,t){e.su.We(t),o_(e).Hn(t)}function or(e){e.su=new rA({getRemoteKeysForTarget:t=>{let r=e.Za.get(t);return void 0!==r?e.remoteSyncer.getRemoteKeysForTarget(r):rg()},dt:t=>e.Ja.get(t)||null,Tt:()=>e.datastore.serializer.databaseId}),o_(e).start(),e.iu.Wa()}function on(e){return os(e)&&!o_(e).Cn()&&e.Ja.size>0}function os(e){return 0===e.tu.size}async function oi(e){e.iu.set("Online")}async function oa(e){e.Ja.forEach((t,r)=>{oe(e,t)})}async function oo(e,t){e.su=void 0,on(e)?(e.iu.za(t),or(e)):e.iu.set("Unknown")}async function ou(e,t,r){if(e.iu.set("Online"),t instanceof rI&&2===t.state&&t.cause)try{await async function(e,t){let r=t.cause;for(let n of t.targetIds){if(e.Ja.has(n)){let t=e.Za.get(n);void 0!==t&&(await e.remoteSyncer.rejectListen(t,r),e.Ya.delete(t),e.Za.delete(n)),e.Ja.delete(n)}e.su.removeTarget(n)}}(e,t)}catch(r){v(a3,"Failed to remove targets %s: %s ",t.targetIds.join(","),r),await ol(e,r)}else if(t instanceof rN?e.su.et(t):t instanceof rS?e.su.ot(t):e.su.rt(t),!r.isEqual(es.min()))try{let t=await aY(e.localStore);r.compareTo(t)>=0&&await function(e,t){let r=e.su.Rt(t);r.targetChanges.forEach((r,n)=>{if(r.resumeToken.approximateByteSize()>0){let s=e.Ja.get(n);s&&e.Ja.set(n,s.withResumeToken(r.resumeToken,t))}}),r.targetMismatches.forEach((t,r)=>{let n=e.Ja.get(t);if(!n)return;e.Ja.set(t,n.withResumeToken(eT.EMPTY_BYTE_STRING,n.snapshotVersion)),ot(e,t);let s=new ay(n.target,t,r,n.sequenceNumber);oe(e,s)});let n=function(e,t){let r=new Map;t.targetChanges.forEach((t,n)=>{let s=e.Za.get(n);void 0!==s&&r.set(s,t)});let n=new ed(M);return t.targetMismatches.forEach((t,r)=>{let s=e.Za.get(t);void 0!==s&&(n=n.insert(s,r))}),new rx(t.snapshotVersion,r,n,t.documentUpdates,t.augmentedDocumentUpdates,t.resolvedLimboDocuments)}(e,r);return e.remoteSyncer.applyRemoteEvent(n)}(e,r)}catch(t){v(a3,"Failed to raise snapshot:",t),await ol(e,t)}}async function ol(e,t,r){if(!el(t))throw t;e.tu.add(1),await a9(e),e.iu.set("Offline"),r||(r=()=>aY(e.localStore)),e.asyncQueue.enqueueRetryable(async()=>{v(a3,"Retrying IndexedDB access"),await r(),e.tu.delete(1),await a6(e)})}function oc(e,t){return t().catch(r=>ol(e,r,t))}async function oh(e){let t=oE(e),r=e.Ha.length>0?e.Ha[e.Ha.length-1].batchId:-1;for(;os(e)&&e.Ha.length<10;)try{let n=await function(e,t){return e.persistence.runTransaction("Get next mutation batch","readonly",r=>(void 0===t&&(t=-1),e.mutationQueue.getNextMutationBatchAfterBatchId(r,t)))}(e.localStore,r);if(null===n){0===e.Ha.length&&t.Nn();break}r=n.batchId,function(e,t){e.Ha.push(t);let r=oE(e);r.Fn()&&r.Jn&&r.Yn(t.mutations)}(e,n)}catch(t){await ol(e,t)}od(e)&&om(e)}function od(e){return os(e)&&!oE(e).Cn()&&e.Ha.length>0}function om(e){oE(e).start()}async function of(e){oE(e).er()}async function op(e){let t=oE(e);for(let r of e.Ha)t.Yn(r.mutations)}async function og(e,t,r){let n=e.Ha.shift(),s=ap.from(n,t,r);await oc(e,()=>e.remoteSyncer.applySuccessfulWrite(s)),await oh(e)}async function oy(e,t){t&&oE(e).Jn&&await async function(e,t){var r;if(function(e){switch(e){case S.OK:return x(64938);case S.CANCELLED:case S.UNKNOWN:case S.DEADLINE_EXCEEDED:case S.RESOURCE_EXHAUSTED:case S.INTERNAL:case S.UNAVAILABLE:case S.UNAUTHENTICATED:return!1;case S.INVALID_ARGUMENT:case S.NOT_FOUND:case S.ALREADY_EXISTS:case S.PERMISSION_DENIED:case S.FAILED_PRECONDITION:case S.ABORTED:case S.OUT_OF_RANGE:case S.UNIMPLEMENTED:case S.DATA_LOSS:return!0;default:return x(15467,{code:e})}}(r=t.code)&&r!==S.ABORTED){let r=e.Ha.shift();oE(e).Mn(),await oc(e,()=>e.remoteSyncer.rejectFailedWrite(r.batchId,t)),await oh(e)}}(e,t),od(e)&&om(e)}async function ow(e,t){e.asyncQueue.verifyOperationInProgress(),v(a3,"RemoteStore received new credentials");let r=os(e);e.tu.add(3),await a9(e),r&&e.iu.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.tu.delete(3),await a6(e)}async function ov(e,t){t?(e.tu.delete(2),await a6(e)):t||(e.tu.add(2),await a9(e),e.iu.set("Unknown"))}function o_(e){var t,r,n;return e._u||(e._u=(t=e.datastore,r=e.asyncQueue,n={Qt:oi.bind(null,e),zt:oa.bind(null,e),Ht:oo.bind(null,e),zn:ou.bind(null,e)},t.nr(),new np(r,t.connection,t.authCredentials,t.appCheckCredentials,t.serializer,n)),e.nu.push(async t=>{t?(e._u.Mn(),on(e)?or(e):e.iu.set("Unknown")):(await e._u.stop(),e.su=void 0)})),e._u}function oE(e){var t,r,n;return e.ou||(e.ou=(t=e.datastore,r=e.asyncQueue,n={Qt:()=>Promise.resolve(),zt:of.bind(null,e),Ht:oy.bind(null,e),Zn:op.bind(null,e),Xn:og.bind(null,e)},t.nr(),new ng(r,t.connection,t.authCredentials,t.appCheckCredentials,t.serializer,n)),e.nu.push(async t=>{t?(e.ou.Mn(),await oh(e)):(await e.ou.stop(),e.Ha.length>0&&(v(a3,`Stopping write stream with ${e.Ha.length} pending writes`),e.Ha=[]))})),e.ou}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oT{constructor(e,t,r,n,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=n,this.removalCallback=s,this.deferred=new V,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(e=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,n,s){let i=Date.now()+r,a=new oT(e,t,i,n,s);return a.start(r),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new I(S.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function ox(e,t){if(_("AsyncQueue",`${t}: ${e}`),el(e))return new I(S.UNAVAILABLE,`${t}: ${e}`);throw e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ob{static emptySet(e){return new ob(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||G.comparator(t.key,r.key):(e,t)=>G.comparator(e.key,t.key),this.keyedMap=rh(),this.sortedSet=new ed(this.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){let t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){let t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof ob)||this.size!==e.size)return!1;let t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){let e=t.getNext().key,n=r.getNext().key;if(!e.isEqual(n))return!1}return!0}toString(){let e=[];return this.forEach(t=>{e.push(t.toString())}),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,t){let r=new ob;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oN{constructor(){this.au=new ed(G.comparator)}track(e){let t=e.doc.key,r=this.au.get(t);r?0!==e.type&&3===r.type?this.au=this.au.insert(t,e):3===e.type&&1!==r.type?this.au=this.au.insert(t,{type:r.type,doc:e.doc}):2===e.type&&2===r.type?this.au=this.au.insert(t,{type:2,doc:e.doc}):2===e.type&&0===r.type?this.au=this.au.insert(t,{type:0,doc:e.doc}):1===e.type&&0===r.type?this.au=this.au.remove(t):1===e.type&&2===r.type?this.au=this.au.insert(t,{type:1,doc:r.doc}):0===e.type&&1===r.type?this.au=this.au.insert(t,{type:2,doc:e.doc}):x(63341,{ft:e,uu:r}):this.au=this.au.insert(t,e)}cu(){let e=[];return this.au.inorderTraversal((t,r)=>{e.push(r)}),e}}class oS{constructor(e,t,r,n,s,i,a,o,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=n,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=a,this.excludesMetadataChanges=o,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,n,s){let i=[];return t.forEach(e=>{i.push({type:0,doc:e})}),new oS(e,t,ob.emptySet(t),i,r,n,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ah(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let e=0;e<t.length;e++)if(t[e].type!==r[e].type||!t[e].doc.isEqual(r[e].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oI{constructor(){this.lu=void 0,this.Eu=[]}hu(){return this.Eu.some(e=>e.Tu())}}class oV{constructor(){this.queries=oC(),this.onlineState="Unknown",this.Pu=new Set}terminate(){!function(e,t){let r=e.queries;e.queries=oC(),r.forEach((e,r)=>{for(let e of r.Eu)e.onError(t)})}(this,new I(S.ABORTED,"Firestore shutting down"))}}function oC(){return new ru(e=>ac(e),ah)}async function oA(e,t){let r=3,n=t.query,s=e.queries.get(n);s?!s.hu()&&t.Tu()&&(r=2):(s=new oI,r=t.Tu()?0:1);try{switch(r){case 0:s.lu=await e.onListen(n,!0);break;case 1:s.lu=await e.onListen(n,!1);break;case 2:await e.onFirstRemoteStoreListen(n)}}catch(r){let e=ox(r,`Initialization of query '${au(t.query)?ao(t.query):rn(t.query)}' failed`);return void t.onError(e)}e.queries.set(n,s),s.Eu.push(t),t.Ru(e.onlineState),s.lu&&t.Iu(s.lu)&&oL(e)}async function oD(e,t){let r=t.query,n=3,s=e.queries.get(r);if(s){let e=s.Eu.indexOf(t);e>=0&&(s.Eu.splice(e,1),0===s.Eu.length?n=t.Tu()?0:1:!s.hu()&&t.Tu()&&(n=2))}switch(n){case 0:return e.queries.delete(r),e.onUnlisten(r,!0);case 1:return e.queries.delete(r),e.onUnlisten(r,!1);case 2:return e.onLastRemoteStoreUnlisten(r);default:return}}function ok(e,t){let r=!1;for(let n of t){let t=n.query,s=e.queries.get(t);if(s){for(let e of s.Eu)e.Iu(n)&&(r=!0);s.lu=n}}r&&oL(e)}function oR(e,t,r){let n=e.queries.get(t);if(n)for(let e of n.Eu)e.onError(r);e.queries.delete(t)}function oL(e){e.Pu.forEach(e=>{e.next()})}(n=a||(a={})).Default="default",n.Cache="cache";class oU{constructor(e,t,r){this.query=e,this.Au=t,this.Vu=!1,this.du=null,this.onlineState="Unknown",this.options=r||{}}Iu(e){if(!this.options.includeMetadataChanges){let t=[];for(let r of e.docChanges)3!==r.type&&t.push(r);e=new oS(e.query,e.docs,e.oldDocs,t,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Vu?this.fu(e)&&(this.Au.next(e),t=!0):this.mu(e,this.onlineState)&&(this.pu(e),t=!0),this.du=e,t}onError(e){this.Au.error(e)}Ru(e){this.onlineState=e;let t=!1;return this.du&&!this.Vu&&this.mu(this.du,e)&&(this.pu(this.du),t=!0),t}mu(e,t){return!(e.fromCache&&this.Tu())||(!this.options.waitForSyncWhenOnline||!("Offline"!==t))&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===t)}fu(e){if(e.docChanges.length>0)return!0;let t=this.du&&this.du.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&!0===this.options.includeMetadataChanges}pu(e){e=oS.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Vu=!0,this.Au.next(e)}Tu(){return this.options.source!==a.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oP{constructor(e){this.key=e}}class oO{constructor(e){this.key=e}}class oM{constructor(e,t){this.query=e,this.Ou=t,this.Mu=null,this.hasCachedResults=!1,this.current=!1,this.Nu=rg(),this.mutatedKeys=rg(),this.Lu=au(e)?aN(e):ri(e),this.Bu=new ob(this.Lu)}get Uu(){return this.Ou}ku(e,t){let r=t?t.qu:new oN,n=t?t.Bu:this.Bu,s=t?t.mutatedKeys:this.mutatedKeys,i=n,a=!1,[o,u]=this.$u(this.query,n);e.inorderTraversal((e,t)=>{var l;let c=n.get(e),h=(au(l=this.query)?ab(l,t):rs(l,t))?t:null,d=!!c&&this.mutatedKeys.has(c.key),m=!!h&&(h.hasLocalMutations||this.mutatedKeys.has(h.key)&&h.hasCommittedMutations),f=!1;c&&h?c.data.isEqual(h.data)?d!==m&&(r.track({type:3,doc:h}),f=!0):this.Ku(c,h)||(r.track({type:2,doc:h}),f=!0,(o&&this.Lu(h,o)>0||u&&0>this.Lu(h,u))&&(a=!0)):!c&&h?(r.track({type:0,doc:h}),f=!0):c&&!h&&(r.track({type:1,doc:c}),f=!0,(o||u)&&(a=!0)),f&&(h?(i=i.add(h),s=m?s.add(e):s.delete(e)):(i=i.delete(e),s=s.delete(e)))});let l=this.Wu(this.query);if(l){if(au(this.query)){let e=[];i.forEach(t=>e.push(t));let t=ax(this.query,e),n=new ob(aN(this.query));for(let e of t)n=n.add(e);i.forEach(e=>{n.has(e.key)||(s=s.delete(e.key),r.track({type:1,doc:e}))}),i=n}else{let e=this.Qu(this.query);for(;i.size>l;){let t="F"===e?i.last():i.first();i=i.delete(t.key),s=s.delete(t.key),r.track({type:1,doc:t})}}}return{Bu:i,qu:r,Uo:a,mutatedKeys:s}}Wu(e){return au(e)?aS(e)?.limit:e.limit||void 0}Qu(e){if(au(e)){let t=aS(e);return t&&t.limit<0?"L":"F"}return e.limitType}$u(e,t){if(au(e)){let r=aS(e)?.limit;return[t.size===r?t.last():null,null]}return["F"===e.limitType&&t.size===this.Wu(this.query)?t.last():null,"L"===e.limitType&&t.size===this.Wu(this.query)?t.first():null]}Ku(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,n){let s=this.Bu;this.Bu=e.Bu,this.mutatedKeys=e.mutatedKeys;let i=e.qu.cu();i.sort((e,t)=>(function(e,t){let r=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return x(20277,{ft:e})}};return r(e)-r(t)})(e.type,t.type)||this.Lu(e.doc,t.doc)),this.Gu(r),n=n??!1;let a=t&&!n?this.zu():[],o=0===this.Nu.size&&this.current&&!n?1:0,u=o!==this.Mu;return(this.Mu=o,0!==i.length||u)?{snapshot:new oS(this.query,e.Bu,s,i,e.mutatedKeys,0===o,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),ju:a}:{ju:a}}Ru(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({Bu:this.Bu,qu:new oN,mutatedKeys:this.mutatedKeys,Uo:!1},!1)):{ju:[]}}Hu(e){return!this.Ou.has(e)&&!!this.Bu.has(e)&&!this.Bu.get(e).hasLocalMutations}Gu(e){e&&(e.addedDocuments.forEach(e=>this.Ou=this.Ou.add(e)),e.modifiedDocuments.forEach(e=>{}),e.removedDocuments.forEach(e=>this.Ou=this.Ou.delete(e)),this.current=e.current)}zu(){if(!this.current)return[];let e=this.Nu;this.Nu=rg(),this.Bu.forEach(e=>{this.Hu(e.key)&&(this.Nu=this.Nu.add(e.key))});let t=[];return e.forEach(e=>{this.Nu.has(e)||t.push(new oO(e))}),this.Nu.forEach(r=>{e.has(r)||t.push(new oP(r))}),t}Ju(e){this.Ou=e.Jo,this.Nu=rg();let t=this.ku(e.documents);return this.applyChanges(t,!0)}Yu(){return oS.fromInitialDocuments(this.query,this.Bu,this.mutatedKeys,0===this.Mu,this.hasCachedResults)}}let oF="SyncEngine";class o${constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class oB{constructor(e){this.key=e,this.Zu=!1}}class oq{constructor(e,t,r,n,s,i){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=n,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Xu={},this.ec=new ru(e=>ac(e),ah),this.tc=new Map,this.nc=new Set,this.rc=new ed(G.comparator),this.sc=new Map,this._c=new aR,this.oc={},this.ac=new Map,this.uc=aT.Cs(),this.onlineState="Unknown",this.cc=void 0}get isPrimaryClient(){return!0===this.cc}}async function oz(e,t,r=!0){let n;let s=ue(e),i=s.ec.get(t);return i?(s.sharedClientState.addLocalQueryTarget(i.targetId),n=i.view.Yu()):n=await oj(s,t,r,!0),n}async function oQ(e,t){let r=ue(e);await oj(r,t,!0,!1)}async function oj(e,t,r,n){var s,i;let a;let o=await (s=e.localStore,i=au(t)?t:t7(t),s.persistence.runTransaction("Allocate target","readwrite",e=>{let t;return s.g_.getTargetData(e,i).next(r=>r?(t=r,eu.resolve(t)):s.g_.allocateTargetId(e).next(r=>(t=new ay(i,r,"TargetPurposeListen",e.currentSequenceNumber),s.g_.addTargetData(e,t).next(()=>t))))}).then(e=>{let t=s.$o.get(e.targetId);return(null===t||e.snapshotVersion.compareTo(t.snapshotVersion)>0)&&(s.$o=s.$o.insert(e.targetId,e),s.Ko.set(i,e.targetId)),e})),u=o.targetId,l=e.sharedClientState.addLocalQueryTarget(u,r);return n&&(a=await oK(e,t,u,"current"===l,o.resumeToken)),e.isPrimaryClient&&r&&a8(e.remoteStore,o),a}async function oK(e,t,r,n,s){e.lc=(t,r,n)=>(async function(e,t,r,n){let s=t.view.ku(r);s.Uo&&(s=await aX(e.localStore,t.query,!1).then(({documents:e})=>t.view.ku(e,s)));let i=n&&n.targetChanges.get(t.targetId),a=n&&null!=n.targetMismatches.get(t.targetId),o=t.view.applyChanges(s,e.isPrimaryClient,i,a);return o6(e,t.targetId,o.ju),o.snapshot})(e,t,r,n);let i=await aX(e.localStore,t,!0),a=new oM(t,i.Jo),o=a.ku(i.documents),u=rb.createSynthesizedTargetChangeForCurrentChange(r,n&&"Offline"!==e.onlineState,s),l=a.applyChanges(o,e.isPrimaryClient,u);o6(e,r,l.ju);let c=new o$(t,r,a);return e.ec.set(t,c),e.tc.has(r)?e.tc.get(r).push(t):e.tc.set(r,[t]),l.snapshot}async function oG(e,t,r){let n=e.ec.get(t),s=e.tc.get(n.targetId);if(s.length>1)return e.tc.set(n.targetId,s.filter(e=>!ah(e,t))),void e.ec.delete(t);e.isPrimaryClient?(e.sharedClientState.removeLocalQueryTarget(n.targetId),e.sharedClientState.isActiveQueryTarget(n.targetId)||await aJ(e.localStore,n.targetId,!1).then(()=>{e.sharedClientState.clearQueryState(n.targetId),r&&a7(e.remoteStore,n.targetId),o3(e,n.targetId)}).catch(eo)):(o3(e,n.targetId),await aJ(e.localStore,n.targetId,!0))}async function oH(e,t){let r=e.ec.get(t),n=e.tc.get(r.targetId);e.isPrimaryClient&&1===n.length&&(e.sharedClientState.removeLocalQueryTarget(r.targetId),a7(e.remoteStore,r.targetId))}async function oW(e,t,r){var n;let s=(e.remoteStore.remoteSyncer.applySuccessfulWrite=oZ.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=o0.bind(null,e),e);try{let e;let i=await function(e,t){let r,n;let s=en.now(),i=t.reduce((e,t)=>e.add(t.key),rg());return e.persistence.runTransaction("Locally write mutations","readwrite",a=>{let o=rl,u=rg();return e.Qo.getEntries(a,i).next(e=>{(o=e).forEach((e,t)=>{t.isValidDocument()||(u=u.add(e))})}).next(()=>e.localDocuments.getOverlayedDocuments(a,o)).next(n=>{r=n;let i=[];for(let e of t){let t=function(e,t){let r=null;for(let n of e.fieldTransforms){let e=t.data.field(n.field),s=ta(n.transform,e||null);null!=s&&(null===r&&(r=tt.empty()),r.set(n.field,s))}return r||null}(e,r.get(e.key).overlayedDocument);null!=t&&i.push(new tV(e.key,t,function e(t){let r=[];return ev(t.fields,(t,n)=>{let s=new K([t]);if(e9(n)){let t=e(n.mapValue).fields;if(0===t.length)r.push(s);else for(let e of t)r.push(s.child(e))}else r.push(s)}),new ey(r)}(t.value.mapValue),tE.exists(!0)))}return e.mutationQueue.addMutationBatch(a,s,i,t)}).next(t=>{n=t;let s=t.applyToLocalDocumentSet(r,u);return e.documentOverlayCache.saveOverlays(a,t.batchId,s)})}).then(()=>({batchId:n.batchId,changes:rd(r)}))}(s.localStore,t);s.sharedClientState.addPendingMutation(i.batchId),n=i.batchId,(e=s.oc[s.currentUser.toKey()])||(e=new ed(M)),e=e.insert(n,r),s.oc[s.currentUser.toKey()]=e,await o5(s,i.changes),await oh(s.remoteStore)}catch(t){let e=ox(t,"Failed to persist write");r.reject(e)}}async function oY(e,t){try{let r=await function(e,t){let r=t.snapshotVersion,n=e.$o;return e.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{var i;let a,o;let u=e.Qo.newChangeBuffer({trackRemovals:!0});n=e.$o;let l=[];t.targetChanges.forEach((i,a)=>{let o=n.get(a);if(!o)return;l.push(e.g_.removeMatchingKeys(s,i.removedDocuments,a).next(()=>e.g_.addMatchingKeys(s,i.addedDocuments,a)));let u=o.withSequenceNumber(s.currentSequenceNumber);null!==t.targetMismatches.get(a)?u=u.withResumeToken(eT.EMPTY_BYTE_STRING,es.min()).withLastLimboFreeSnapshotVersion(es.min()):i.resumeToken.approximateByteSize()>0&&(u=u.withResumeToken(i.resumeToken,r)),n=n.insert(a,u),function(e,t,r){if(0===e.resumeToken.approximateByteSize())return!0;let n=t.snapshotVersion.toMicroseconds()-e.snapshotVersion.toMicroseconds();if(n>=3e8)return!0;let s=r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size;return s>0}(o,u,i)&&l.push(e.g_.updateTargetData(s,u))});let c=rl,h=rg();if(t.documentUpdates.forEach(r=>{t.resolvedLimboDocuments.has(r)&&l.push(e.persistence.referenceDelegate.updateLimboDocument(s,r))}),l.push((i=t.documentUpdates,a=rg(),o=rg(),i.forEach(e=>a=a.add(e)),u.getEntries(s,a).next(e=>{let t=rl;return i.forEach((r,n)=>{let s=e.get(r);n.isFoundDocument()!==s.isFoundDocument()&&(o=o.add(r)),n.isNoDocument()&&n.version.isEqual(es.min())?(u.removeEntry(r,n.readTime),t=t.insert(r,n)):!s.isValidDocument()||n.version.compareTo(s.version)>0||0===n.version.compareTo(s.version)&&s.hasPendingWrites?(u.addEntry(n),t=t.insert(r,n)):v(aG,"Ignoring outdated watch update for ",r,". Current version:",s.version," Watch version:",n.version)}),{jo:t,Ho:o}})).next(e=>{c=e.jo,h=e.Ho})),!r.isEqual(es.min())){let t=e.g_.getLastRemoteSnapshotVersion(s).next(t=>e.g_.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(t)}return eu.waitFor(l).next(()=>u.apply(s)).next(()=>e.localDocuments.getLocalViewOfDocuments(s,c,h)).next(()=>c)}).then(t=>(e.$o=n,t))}(e.localStore,t);t.targetChanges.forEach((t,r)=>{let n=e.sc.get(r);n&&(N(t.addedDocuments.size+t.modifiedDocuments.size+t.removedDocuments.size<=1,22616),t.addedDocuments.size>0?n.Zu=!0:t.modifiedDocuments.size>0?N(n.Zu,14607):t.removedDocuments.size>0&&(N(n.Zu,42227),n.Zu=!1))}),await o5(e,r,t)}catch(e){await eo(e)}}function oJ(e,t,r){var n;if(e.isPrimaryClient&&0===r||!e.isPrimaryClient&&1===r){let r;let s=[];e.ec.forEach((e,r)=>{let n=r.view.Ru(t);n.snapshot&&s.push(n.snapshot)}),(n=e.eventManager).onlineState=t,r=!1,n.queries.forEach((e,n)=>{for(let e of n.Eu)e.Ru(t)&&(r=!0)}),r&&oL(n),s.length&&e.Xu.zn(s),e.onlineState=t,e.isPrimaryClient&&e.sharedClientState.setOnlineState(t)}}async function oX(e,t,r){e.sharedClientState.updateQueryState(t,"rejected",r);let n=e.sc.get(t),s=n&&n.key;if(s){let r=new ed(G.comparator);r=r.insert(s,tJ.newNoDocument(s,es.min()));let n=rg().add(s),i=new rx(es.min(),new Map,new ed(M),r,rl,n);await oY(e,i),e.rc=e.rc.remove(s),e.sc.delete(t),o9(e)}else await aJ(e.localStore,t,!1).then(()=>o3(e,t,r)).catch(eo)}async function oZ(e,t){var r;let n=t.batch.batchId;try{let s=await (r=e.localStore).persistence.runTransaction("Acknowledge batch","readwrite-primary",e=>{let n=t.batch.keys(),s=r.Qo.newChangeBuffer({trackRemovals:!0});return(function(e,t,r,n){let s=r.batch,i=s.keys(),a=eu.resolve();return i.forEach(e=>{a=a.next(()=>n.getEntry(t,e)).next(t=>{let i=r.docVersions.get(e);N(null!==i,48541),0>t.version.compareTo(i)&&(s.applyToRemoteDocument(t,r),t.isValidDocument()&&(t.setReadTime(r.commitVersion),n.addEntry(t)))})}),a.next(()=>e.mutationQueue.removeMutationBatch(t,s))})(r,e,t,s).next(()=>s.apply(e)).next(()=>r.mutationQueue.performConsistencyCheck(e)).next(()=>r.documentOverlayCache.removeOverlaysForBatchId(e,n,t.batch.batchId)).next(()=>r.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,function(e){let t=rg();for(let r=0;r<e.mutationResults.length;++r)e.mutationResults[r].transformResults.length>0&&(t=t.add(e.batch.mutations[r].key));return t}(t))).next(()=>r.localDocuments.getDocuments(e,n))});o2(e,n,null),o1(e,n),e.sharedClientState.updateMutationState(n,"acknowledged"),await o5(e,s)}catch(e){await eo(e)}}async function o0(e,t,r){var n;try{let s=await (n=e.localStore).persistence.runTransaction("Reject batch","readwrite-primary",e=>{let r;return n.mutationQueue.lookupMutationBatch(e,t).next(t=>(N(null!==t,37113),r=t.keys(),n.mutationQueue.removeMutationBatch(e,t))).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,r,t)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,r)).next(()=>n.localDocuments.getDocuments(e,r))});o2(e,t,r),o1(e,t),e.sharedClientState.updateMutationState(t,"rejected",r),await o5(e,s)}catch(e){await eo(e)}}function o1(e,t){(e.ac.get(t)||[]).forEach(e=>{e.resolve()}),e.ac.delete(t)}function o2(e,t,r){let n=e.oc[e.currentUser.toKey()];if(n){let s=n.get(t);s&&(r?s.reject(r):s.resolve(),n=n.remove(t)),e.oc[e.currentUser.toKey()]=n}}function o3(e,t,r=null){for(let n of(e.sharedClientState.removeLocalQueryTarget(t),e.tc.get(t)))e.ec.delete(n),r&&e.Xu.Ec(n,r);e.tc.delete(t),e.isPrimaryClient&&e._c.s_(t).forEach(t=>{e._c.containsKey(t)||o4(e,t)})}function o4(e,t){e.nc.delete(t.path.canonicalString());let r=e.rc.get(t);null!==r&&(a7(e.remoteStore,r),e.rc=e.rc.remove(t),e.sc.delete(r),o9(e))}function o6(e,t,r){for(let n of r)n instanceof oP?(e._c.addReference(n.key,t),function(e,t){let r=t.key,n=r.path.canonicalString();e.rc.get(r)||e.nc.has(n)||(v(oF,"New document in limbo: "+r),e.nc.add(n),o9(e))}(e,n)):n instanceof oO?(v(oF,"Document no longer in limbo: "+n.key),e._c.removeReference(n.key,t),e._c.containsKey(n.key)||o4(e,n.key)):x(19791,{hc:n})}function o9(e){for(;e.nc.size>0&&e.rc.size<e.maxConcurrentLimboResolutions;){let t=e.nc.values().next().value;e.nc.delete(t);let r=new G(Q.fromString(t)),n=e.uc.next();e.sc.set(n,new oB(r)),e.rc=e.rc.insert(r,n),a8(e.remoteStore,new ay(t7(t6(r.path)),n,"TargetPurposeLimboResolution",ec.ce))}}async function o5(e,t,r){let n=[],s=[],i=[];e.ec.isEmpty()||(e.ec.forEach((a,o)=>{i.push(e.lc(o,t,r).then(t=>{if((t||r)&&e.isPrimaryClient){let n=t?!t.fromCache:r?.targetChanges.get(o.targetId)?.current;e.sharedClientState.updateQueryState(o.targetId,n?"current":"not-current")}if(t){n.push(t);let e=az.vo(o.targetId,t);s.push(e)}}))}),await Promise.all(i),e.Xu.zn(n),await async function(e,t){try{await e.persistence.runTransaction("notifyLocalViewChanges","readwrite",r=>eu.forEach(t,t=>eu.forEach(t.wo,n=>e.persistence.referenceDelegate.addReference(r,t.targetId,n)).next(()=>eu.forEach(t.bo,n=>e.persistence.referenceDelegate.removeReference(r,t.targetId,n)))))}catch(e){if(!el(e))throw e;v(aG,"Failed to update sequence numbers: "+e)}for(let r of t){let t=r.targetId;if(!r.fromCache){let r=e.$o.get(t),n=r.snapshotVersion,s=r.withLastLimboFreeSnapshotVersion(n);e.$o=e.$o.insert(t,s)}}}(e.localStore,s))}async function o8(e,t){if(!e.currentUser.isEqual(t)){v(oF,"User change. New user:",t.toKey());let r=await aW(e.localStore,t);e.currentUser=t,e.ac.forEach(e=>{e.forEach(e=>{e.reject(new I(S.CANCELLED,"'waitForPendingWrites' promise is rejected due to a user change."))})}),e.ac.clear(),e.sharedClientState.handleUserChange(t,r.removedBatchIds,r.addedBatchIds),await o5(e,r.zo)}}function o7(e,t){let r=e.sc.get(t);if(r&&r.Zu)return rg().add(r.key);{let r=rg(),n=e.tc.get(t);if(!n)return r;for(let t of n??[]){let n=e.ec.get(t);r=r.unionWith(n.view.Uu)}return r}}function ue(e){return e.remoteStore.remoteSyncer.applyRemoteEvent=oY.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=o7.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=oX.bind(null,e),e.Xu.zn=ok.bind(null,e.eventManager),e.Xu.Ec=oR.bind(null,e.eventManager),e}class ut{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=r4(e.databaseInfo.databaseId),this.sharedClientState=this.Rc(e),this.persistence=this.Ic(e),await this.persistence.start(),this.localStore=this.Ac(e),this.gcScheduler=this.Vc(e,this.localStore),this.indexBackfillerScheduler=this.dc(e,this.localStore)}Vc(e,t){return null}dc(e,t){return null}Ac(e){var t,r,n,s;return t=this.persistence,r=new aK,n=e.initialUser,s=this.serializer,new aH(t,r,n,s)}Ic(e){return new aF(aB.C_,this.serializer)}Rc(e){return new a0}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ut.provider={build:()=>new ut};class ur extends ut{constructor(e){super(),this.cacheSizeBytes=e}Vc(e,t){N(this.persistence.referenceDelegate instanceof aq,46915);let r=this.persistence.referenceDelegate.garbageCollector;return new nN(r,e.asyncQueue,t)}Ic(e){let t=void 0!==this.cacheSizeBytes?nE.withCacheSize(this.cacheSizeBytes):nE.DEFAULT;return new aF(e=>aq.C_(e,t),this.serializer)}}class un{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>oJ(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=o8.bind(null,this.syncEngine),await ov(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new oV}createDatastore(e){var t,r,n;let s=r4(e.databaseInfo.databaseId),i=(t=e.databaseInfo,new nh(t));return r=e.authCredentials,n=e.appCheckCredentials,new nw(r,n,i,s)}createRemoteStore(e){var t,r,n,s;return t=this.localStore,r=this.datastore,n=e.asyncQueue,s=nr.C()?new nr:new ne,new a4(t,r,n,e=>oJ(this.syncEngine,e,0),s)}createSyncEngine(e,t){return function(e,t,r,n,s,i,a){let o=new oq(e,t,r,n,s,i);return a&&(o.cc=!0),o}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){await async function(e){v(a3,"RemoteStore shutting down."),e.tu.add(5),await a9(e),e.ru.shutdown(),e.iu.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}}un.provider={build:()=>new un};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.mc(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.mc(this.observer.error,e):_("Uncaught Error in snapshot listener:",e.toString()))}gc(){this.muted=!0}mc(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ui="FirestoreClient";class ua{constructor(e,t,r,n,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=n,this.user=f.UNAUTHENTICATED,this.clientId=O.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async e=>{v(ui,"Received user=",e.uid),await this.authCredentialListener(e),this.user=e}),this.appCheckCredentials.start(r,e=>(v(ui,"Received new app check token=",e),this.appCheckCredentialListener(e,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new V;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(r){let t=ox(r,"Failed to shutdown persistence");e.reject(t)}}),e.promise}}async function uo(e,t){e.asyncQueue.verifyOperationInProgress(),v(ui,"Initializing OfflineComponentProvider");let r=e.configuration;await t.initialize(r);let n=r.initialUser;e.setCredentialChangeListener(async e=>{n.isEqual(e)||(await aW(t.localStore,e),n=e)}),t.persistence.setDatabaseDeletedListener(()=>e.terminate()),e._offlineComponents=t}async function uu(e,t){e.asyncQueue.verifyOperationInProgress();let r=await ul(e);v(ui,"Initializing OnlineComponentProvider"),await t.initialize(r,e.configuration),e.setCredentialChangeListener(e=>ow(t.remoteStore,e)),e.setAppCheckTokenChangeListener((e,r)=>ow(t.remoteStore,r)),e._onlineComponents=t}async function ul(e){if(!e._offlineComponents){if(e._uninitializedComponentsProvider){v(ui,"Using user provided OfflineComponentProvider");try{await uo(e,e._uninitializedComponentsProvider._offline)}catch(t){if(!("FirebaseError"===t.name?t.code===S.FAILED_PRECONDITION||t.code===S.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&t instanceof DOMException)||22===t.code||20===t.code||11===t.code))throw t;E("Error using user provided cache. Falling back to memory cache: "+t),await uo(e,new ut)}}else v(ui,"Using default OfflineComponentProvider"),await uo(e,new ur(void 0))}return e._offlineComponents}async function uc(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(v(ui,"Using user provided OnlineComponentProvider"),await uu(e,e._uninitializedComponentsProvider._online)):(v(ui,"Using default OnlineComponentProvider"),await uu(e,new un))),e._onlineComponents}async function uh(e){let t=await uc(e),r=t.eventManager;return r.onListen=oz.bind(null,t.syncEngine),r.onUnlisten=oG.bind(null,t.syncEngine),r.onFirstRemoteStoreListen=oQ.bind(null,t.syncEngine),r.onLastRemoteStoreUnlisten=oH.bind(null,t.syncEngine),r}function ud(e,t,r,n){let s=new us(n),i=new oU(t,s,r);return e.asyncQueue.enqueueAndForget(async()=>oA(await uh(e),i)),()=>{s.gc(),e.asyncQueue.enqueueAndForget(async()=>oD(await uh(e),i))}}function um(e,t,r={}){let n=new V;return e.asyncQueue.enqueueAndForget(async()=>(function(e,t,r,n,s){let i=new us({next:o=>{i.gc(),t.enqueueAndForget(()=>oD(e,a));let u=o.docs.has(r);!u&&o.fromCache?s.reject(new I(S.UNAVAILABLE,"Failed to get document because the client is offline.")):u&&o.fromCache&&n&&"server"===n.source?s.reject(new I(S.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):s.resolve(o)},error:e=>s.reject(e)}),a=new oU(t6(r.path),i,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return oA(e,a)})(await uh(e),e.asyncQueue,t,r,n)),n.promise}function uf(e,t,r={}){let n=new V;return e.asyncQueue.enqueueAndForget(async()=>(function(e,t,r,n,s){let i=new us({next:r=>{i.gc(),t.enqueueAndForget(()=>oD(e,a)),r.fromCache&&"server"===n.source?s.reject(new I(S.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):s.resolve(r)},error:e=>s.reject(e)}),a=new oU(r instanceof sM?function(e,t){let r=function(e){let t=!1,r=[];for(let n of e)if(n instanceof sA){if(t=!0,n.orderings.some(e=>e.expr instanceof so&&e.expr.fieldName===q))r.push(n);else{let e=n.orderings.map(e=>e);e.push(su(q).ascending()),r.push(new sA(e,{}))}}else n instanceof sI&&(t||(r.push(new sA([su(q).ascending()],{})),t=!0)),r.push(n);return t||r.push(new sA([su(q).ascending()],{})),r}(e.stages);if(e.userDataReader){let t=e.userDataReader.createContext(3,"toCorePipeline");r.forEach(e=>e._readUserData(t))}return new sR(e.userDataReader.serializer,r,void 0)}(r):r,i,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return oA(e,a)})(await uh(e),e.asyncQueue,t,r,n)),n.promise}function up(e,t){let r=new V;return e.asyncQueue.enqueueAndForget(async()=>oW(await uc(e).then(e=>e.syncEngine),t,r)),r.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ug="AsyncQueue";class uy{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Wc=null,this.Qc=!1,this.Gc=!1,this.zc=[],this.xn=new nd(this,"async_queue_retry"),this.jc=()=>{let e=a1();e&&v(ug,"Visibility state changed to "+e.visibilityState),this.xn.gn()},this.Hc=e;let t=a1();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;let t=a1();t&&"function"==typeof t.removeEventListener&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise(()=>{});let t=new V;return this.Yc(()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.qc.push(e),this.Zc()))}async Zc(){if(0!==this.qc.length){try{await this.qc[0](),this.qc.shift(),this.xn.reset()}catch(e){if(!el(e))throw e;v(ug,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.xn.mn(()=>this.Zc())}}Yc(e){let t=this.Hc.then(()=>(this.Qc=!0,e().catch(e=>{throw this.Wc=e,this.Qc=!1,_("INTERNAL UNHANDLED ERROR: ",uw(e)),e}).then(e=>(this.Qc=!1,e))));return this.Hc=t,t}enqueueAfterDelay(e,t,r){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);let n=oT.createAndSchedule(this,e,t,r,e=>this.Xc(e));return this.Kc.push(n),n}Jc(){this.Wc&&x(47125,{el:uw(this.Wc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(let t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then(()=>{for(let t of(this.Kc.sort((e,t)=>e.targetTimeMs-t.targetTimeMs),this.Kc))if(t.skipDelay(),"all"!==e&&t.timerId===e)break;return this.tl()})}il(e){this.zc.push(e)}Xc(e){let t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function uw(e){let t=e.message||"";return e.stack&&(t=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),t}class uv extends nC{constructor(e,t,r,n){super(e,t,r,n),this.type="firestore",this._queue=new uy,this._persistenceKey=n?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new uy(e),this._firestoreClient=void 0,await e}}}function u_(e,t){let r="object"==typeof e?e:(0,o.Mq)(),n=(0,o.qX)(r,"firestore").getImmediate({identifier:"string"==typeof e?e:t||eU});if(!n._initialized){let e=(0,u.P0)("firestore");e&&function(e,t,r,n={}){e=Z(e,nC);let s=(0,u.Xx)(t),i=e._getSettings(),a={...i,emulatorOptions:e._getEmulatorOptions()},o=`${t}:${r}`;s&&(0,u.Uo)(`https://${o}`),i.host!==nI&&i.host!==o&&E("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...i,host:o,ssl:s,emulatorOptions:n};if(!(0,u.vZ)(l,a)&&(e._setSettings(l),n.mockUserToken)){let t,r;if("string"==typeof n.mockUserToken)t=n.mockUserToken,r=f.MOCK_USER;else{t=(0,u.Sg)(n.mockUserToken,e._app?.options.projectId);let s=n.mockUserToken.sub||n.mockUserToken.user_id;if(!s)throw new I(S.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");r=new f(s)}e._authCredentials=new D(new C(t,r))}}(n,...e)}return n}function uE(e){if(e._terminated)throw new I(S.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||function(e){var t,r,n,s;let i=e._freezeSettings(),a=(t=e._databaseId,r=e._app?.options.appId||"",n=e._persistenceKey,s=e._app?.options.apiKey,new eL(t,r,n,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,r7(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,s));e._componentsProvider||i.localCache?._offlineComponentProvider&&i.localCache?._onlineComponentProvider&&(e._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),e._firestoreClient=new ua(e._authCredentials,e._appCheckCredentials,e._queue,a,e._componentsProvider&&function(e){let t=e?._online.build();return{_offline:e?._offline.build(t),_online:t}}(e._componentsProvider))}(e),e._firestoreClient}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uT{convertValue(e,t="none"){switch(eK(e)){case 0:return null;case 1:return e.booleanValue;case 2:return eN(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(eS(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw x(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){let r={};return ev(e,(e,n)=>{r[e]=this.convertValue(n,t)}),r}convertVectorValue(e){let t=e.fields?.[eq].arrayValue?.values?.map(e=>eN(e.doubleValue));return new nU(t)}convertGeoPoint(e){return new r8(eN(e.latitude),eN(e.longitude))}convertArray(e,t){return(e.values||[]).map(e=>this.convertValue(e,t))}convertServerTimestamp(e,t){switch(t){case"previous":let r=ek(e);return null==r?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(eR(e));default:return null}}convertTimestamp(e){let t=eb(e);return new en(t.seconds,t.nanos)}convertDocumentKey(e,t){let r=Q.fromString(e);N(r0(r),9688,{name:e});let n=new eP(r.get(1),r.get(3)),s=new G(r.popFirst(5));return n.isEqual(t)||_(`Document ${s} contains a document reference within a different database (${n.projectId}/${n.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ux extends uT{constructor(e){super(),this.firestore=e}convertBytes(e){return new r6(e)}convertReference(e){let t=this.convertDocumentKey(e,this.firestore._databaseId);return new nD(this.firestore,null,t)}}}}]);