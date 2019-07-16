"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var CardCrypto_1 = require("./CardCrypto");
var Utils_1 = require("./Utils");
var GlobalPlatform = /** @class */ (function () {
    /**
     *
     */
    function GlobalPlatform(card, keys) {
        // TODO: fork smartcard and port to TS
        this.card = null;
        this.DefaultAuthKey = "404142434445464748494a4b4c4d4e4f";
        this.secureChannelBaseKey = "";
        this.sMacKey = "";
        this.sEncKey = "";
        this.dekKey = "";
        this._connected = false;
        this.card = card;
        if (keys) {
            Object.assign(this, keys);
        }
        this.secureChannelBaseKey = this.secureChannelBaseKey || this.DefaultAuthKey;
        this.sMacKey = this.sMacKey || this.secureChannelBaseKey;
        this.sEncKey = this.sEncKey || this.secureChannelBaseKey;
        this.dekKey = this.dekKey || this.secureChannelBaseKey;
    }
    /**
     * Connects to the present device and executes the INITIALIZE UPDATE command
     */
    GlobalPlatform.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hostChallenge, selectGpResponse, initUpdateResponse, sequence, sessionKeys, cardChallenge, cardExpected, cardCalc, hostCalc, externalAuthenticate, eaSignature, externalAuthenticateResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Utils_1.CHECK(!this._connected, "already connected and INITIALIZE state unrecoverable");
                        hostChallenge = crypto_1.randomBytes(8).toString("hex");
                        return [4 /*yield*/, this.card.issueCommand("00a4040000")];
                    case 1:
                        selectGpResponse = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(selectGpResponse), "unexpected " + Utils_1.SW(selectGpResponse).toString(16));
                        return [4 /*yield*/, this.card.issueCommand("8050000008" + hostChallenge + "28")];
                    case 2:
                        initUpdateResponse = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(initUpdateResponse), "unexpected " + Utils_1.SW(selectGpResponse).toString(16));
                        Utils_1.CHECK(initUpdateResponse.length === 30, "init response length incorrect");
                        sequence = initUpdateResponse.slice(12, 14).toString("hex");
                        sessionKeys = {
                            cmac: CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from("0101" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sMacKey, "hex")),
                            rmac: CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from("0102" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sMacKey, "hex")),
                            dek: CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from("0181" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sEncKey, "hex")),
                            enc: CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from("0182" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.dekKey, "hex"))
                        };
                        cardChallenge = initUpdateResponse.slice(12, 20).toString("hex");
                        cardExpected = initUpdateResponse.slice(20, 28).toString("hex");
                        cardCalc = CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from(hostChallenge + cardChallenge + "8000000000000000", "hex"), sessionKeys.enc).slice(16, 24).toString("hex");
                        hostCalc = CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from(cardChallenge + hostChallenge + "8000000000000000", "hex"), sessionKeys.enc).slice(16, 24).toString("hex");
                        Utils_1.CHECK(cardExpected === cardCalc, "card cryptogram failed");
                        externalAuthenticate = "8482000010" + hostCalc;
                        eaSignature = CardCrypto_1.CardCrypto.getRetailMac(sessionKeys.cmac.toString("hex"), externalAuthenticate, "0000000000000000");
                        externalAuthenticate += eaSignature.toString("hex");
                        return [4 /*yield*/, this.card.issueCommand(externalAuthenticate)];
                    case 3:
                        externalAuthenticateResponse = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(externalAuthenticateResponse), "unexpected auth response " + Utils_1.SW(externalAuthenticateResponse).toString(16));
                        this._connected = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    GlobalPlatform.prototype.parseStatusResponse = function (response) {
        var mode = 0;
        var read = 0;
        var output = [];
        response.forEach(function (e) {
            switch (mode) {
                case 0:
                    output.push({ aid: [] });
                    read = e;
                    mode = 1;
                    break;
                case 1:
                    output[output.length - 1].aid.push(e);
                    read--;
                    if (read === 0)
                        mode = 2;
                    break;
                case 2:
                    mode = 3;
                    break;
                case 3:
                    mode = 4;
                    break;
                case 4:
                    if (e === 144)
                        mode = 5;
                    else {
                        output.push({ aid: [] });
                        read = e;
                        mode = 1;
                    }
                    break;
                case 5:
                    break;
            }
        });
        return output;
    };
    GlobalPlatform.prototype.getPackages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Utils_1.CHECK(this._connected, "not connected");
                        _a = this.parseStatusResponse;
                        return [4 /*yield*/, this.card.issueCommand("80f22000024f00")];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                }
            });
        });
    };
    GlobalPlatform.prototype.getApplets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Utils_1.CHECK(this._connected, "not connected");
                        _a = this.parseStatusResponse;
                        return [4 /*yield*/, this.card.issueCommand("80f24000024f00")];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                }
            });
        });
    };
    GlobalPlatform.prototype.deletePackage = function (status) {
        return __awaiter(this, void 0, void 0, function () {
            var hexByte;
            return __generator(this, function (_a) {
                hexByte = function (x) { return Buffer.from([x]).toString("hex"); };
                this.card.issueCommand("80e40080" + hexByte(status.aid.length + 2) + "4f" + hexByte(status.aid.length) + Buffer.from(status.aid).toString("hex") + "00");
                return [2 /*return*/];
            });
        });
    };
    return GlobalPlatform;
}());
exports.default = GlobalPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9HbG9iYWxQbGF0Zm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQXFDO0FBQ3JDLDJDQUEwQztBQUUxQyxpQ0FBMkM7QUFHM0M7SUFhSTs7T0FFRztJQUNILHdCQUFZLElBQVEsRUFBRSxJQUF1RjtRQWQ3RyxzQ0FBc0M7UUFDdEMsU0FBSSxHQUFPLElBQUksQ0FBQTtRQUVmLG1CQUFjLEdBQUcsa0NBQWtDLENBQUE7UUFDbkQseUJBQW9CLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLFlBQU8sR0FBRyxFQUFFLENBQUE7UUFDWixZQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ1osV0FBTSxHQUFHLEVBQUUsQ0FBQTtRQUVILGVBQVUsR0FBRyxLQUFLLENBQUE7UUFNdEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7UUFDaEIsSUFBSSxJQUFJLEVBQUU7WUFDTixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUM1QjtRQUNELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQTtRQUM1RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFBO1FBQ3hELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUE7UUFDeEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtJQUMxRCxDQUFDO0lBRUQ7O09BRUc7SUFDRyxnQ0FBTyxHQUFiOzs7Ozs7d0JBQ0ksYUFBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxz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QUFNLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEVBQUE7NEJBQTlFLHNCQUFPLFNBQUEsSUFBSSxHQUFxQixTQUE4QyxFQUFDLEVBQUE7Ozs7S0FDbEY7SUFFSyxzQ0FBYSxHQUFuQixVQUFvQixNQUFnQzs7OztnQkFDMUMsT0FBTyxHQUFHLFVBQUMsQ0FBUSxJQUFLLE9BQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFoQyxDQUFnQyxDQUFBO2dCQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFXLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBSyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQUksQ0FBQyxDQUFBOzs7O0tBQ2pKO0lBQ0wscUJBQUM7QUFBRCxDQUFDLEFBekhELElBeUhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmFuZG9tQnl0ZXMgfSBmcm9tIFwiY3J5cHRvXCI7XHJcbmltcG9ydCB7IENhcmRDcnlwdG8gfSBmcm9tIFwiLi9DYXJkQ3J5cHRvXCI7XHJcbmltcG9ydCBJQXBwbGljYXRpb24gZnJvbSBcIi4vSUFwcGxpY2F0aW9uXCI7XHJcbmltcG9ydCB7IENIRUNLLCBTV19PSywgU1cgfSBmcm9tIFwiLi9VdGlsc1wiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdsb2JhbFBsYXRmb3JtIGltcGxlbWVudHMgSUFwcGxpY2F0aW9uIHtcclxuXHJcbiAgICAvLyBUT0RPOiBmb3JrIHNtYXJ0Y2FyZCBhbmQgcG9ydCB0byBUU1xyXG4gICAgY2FyZDphbnkgPSBudWxsXHJcblxyXG4gICAgRGVmYXVsdEF1dGhLZXkgPSBcIjQwNDE0MjQzNDQ0NTQ2NDc0ODQ5NGE0YjRjNGQ0ZTRmXCJcclxuICAgIHNlY3VyZUNoYW5uZWxCYXNlS2V5ID0gXCJcIlxyXG4gICAgc01hY0tleSA9IFwiXCJcclxuICAgIHNFbmNLZXkgPSBcIlwiXHJcbiAgICBkZWtLZXkgPSBcIlwiXHJcblxyXG4gICAgcHJpdmF0ZSBfY29ubmVjdGVkID0gZmFsc2VcclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGNhcmQ6YW55LCBrZXlzPzp7IHNlY3VyZUNoYW5uZWxCYXNlS2V5PzpzdHJpbmcsIHNNYWNLZXk/OnN0cmluZywgc0VuY0tleTpzdHJpbmcsIGRla0tleT86c3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmNhcmQgPSBjYXJkXHJcbiAgICAgICAgaWYgKGtleXMpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBrZXlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlY3VyZUNoYW5uZWxCYXNlS2V5ID0gdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleSB8fCB0aGlzLkRlZmF1bHRBdXRoS2V5XHJcbiAgICAgICAgdGhpcy5zTWFjS2V5ID0gdGhpcy5zTWFjS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgICAgICB0aGlzLnNFbmNLZXkgPSB0aGlzLnNFbmNLZXkgfHwgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleVxyXG4gICAgICAgIHRoaXMuZGVrS2V5ID0gdGhpcy5kZWtLZXkgfHwgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29ubmVjdHMgdG8gdGhlIHByZXNlbnQgZGV2aWNlIGFuZCBleGVjdXRlcyB0aGUgSU5JVElBTElaRSBVUERBVEUgY29tbWFuZFxyXG4gICAgICovXHJcbiAgICBhc3luYyBjb25uZWN0KCkge1xyXG4gICAgICAgIENIRUNLKCF0aGlzLl9jb25uZWN0ZWQsIFwiYWxyZWFkeSBjb25uZWN0ZWQgYW5kIElOSVRJQUxJWkUgc3RhdGUgdW5yZWNvdmVyYWJsZVwiKVxyXG5cclxuICAgICAgICAvLyBzZXR1cFxyXG4gICAgICAgIGNvbnN0IGhvc3RDaGFsbGVuZ2UgPSByYW5kb21CeXRlcyg4KS50b1N0cmluZyhcImhleFwiKVxyXG5cclxuICAgICAgICAvLyAxLiBzZWxlY3QgZ3BcclxuICAgICAgICBjb25zdCBzZWxlY3RHcFJlc3BvbnNlID0gYXdhaXQgdGhpcy5jYXJkLmlzc3VlQ29tbWFuZChcIjAwYTQwNDAwMDBcIilcclxuICAgICAgICBDSEVDSyhTV19PSyhzZWxlY3RHcFJlc3BvbnNlKSwgYHVuZXhwZWN0ZWQgJHtTVyhzZWxlY3RHcFJlc3BvbnNlKS50b1N0cmluZygxNil9YClcclxuICAgICAgICBcclxuICAgICAgICAvLyAyLiBpbml0aWFsaXplIHVwZGF0ZVxyXG4gICAgICAgIGNvbnN0IGluaXRVcGRhdGVSZXNwb25zZSA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCI4MDUwMDAwMDA4XCIgKyBob3N0Q2hhbGxlbmdlICsgXCIyOFwiKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGluaXRVcGRhdGVSZXNwb25zZSksIGB1bmV4cGVjdGVkICR7U1coc2VsZWN0R3BSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgQ0hFQ0soaW5pdFVwZGF0ZVJlc3BvbnNlLmxlbmd0aCA9PT0gMzAsIGBpbml0IHJlc3BvbnNlIGxlbmd0aCBpbmNvcnJlY3RgKVxyXG5cclxuICAgICAgICBjb25zdCBzZXF1ZW5jZSA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgxMiwgMTQpLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3Qgc2Vzc2lvbktleXMgPSB7XHJcbiAgICAgICAgICAgIGNtYWM6ICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTAxXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNNYWNLZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgcm1hYzogICBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShcIjAxMDJcIiArIHNlcXVlbmNlICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKHRoaXMuc01hY0tleSwgXCJoZXhcIikpLFxyXG4gICAgICAgICAgICBkZWs6ICAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDE4MVwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5zRW5jS2V5LCBcImhleFwiKSksXHJcbiAgICAgICAgICAgIGVuYzogICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTgyXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLmRla0tleSwgXCJoZXhcIikpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjYXJkQ2hhbGxlbmdlID0gaW5pdFVwZGF0ZVJlc3BvbnNlLnNsaWNlKDEyLCAyMCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBjYXJkRXhwZWN0ZWQgPSBpbml0VXBkYXRlUmVzcG9uc2Uuc2xpY2UoMjAsIDI4KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGNhcmRDYWxjID0gQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oaG9zdENoYWxsZW5nZSArIGNhcmRDaGFsbGVuZ2UgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIHNlc3Npb25LZXlzLmVuYykuc2xpY2UoMTYsIDI0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGhvc3RDYWxjID0gQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oY2FyZENoYWxsZW5nZSArIGhvc3RDaGFsbGVuZ2UgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIHNlc3Npb25LZXlzLmVuYykuc2xpY2UoMTYsIDI0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIENIRUNLKGNhcmRFeHBlY3RlZCA9PT0gY2FyZENhbGMsIGBjYXJkIGNyeXB0b2dyYW0gZmFpbGVkYClcclxuXHJcbiAgICAgICAgbGV0IGV4dGVybmFsQXV0aGVudGljYXRlID0gXCI4NDgyMDAwMDEwXCIgKyBob3N0Q2FsY1xyXG4gICAgICAgIGNvbnN0IGVhU2lnbmF0dXJlID0gQ2FyZENyeXB0by5nZXRSZXRhaWxNYWMoc2Vzc2lvbktleXMuY21hYy50b1N0cmluZyhcImhleFwiKSwgZXh0ZXJuYWxBdXRoZW50aWNhdGUsIFwiMDAwMDAwMDAwMDAwMDAwMFwiKVxyXG4gICAgICAgIGV4dGVybmFsQXV0aGVudGljYXRlICs9IGVhU2lnbmF0dXJlLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoZXh0ZXJuYWxBdXRoZW50aWNhdGUpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSksIGB1bmV4cGVjdGVkIGF1dGggcmVzcG9uc2UgJHtTVyhleHRlcm5hbEF1dGhlbnRpY2F0ZVJlc3BvbnNlKS50b1N0cmluZygxNil9YClcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9jb25uZWN0ZWQgPSB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHBhcnNlU3RhdHVzUmVzcG9uc2UocmVzcG9uc2U6QnVmZmVyKSB7XHJcbiAgICAgICAgbGV0IG1vZGUgPSAwXHJcbiAgICAgICAgbGV0IHJlYWQgPSAwXHJcbiAgICAgICAgbGV0IG91dHB1dDphbnlbXSA9IFtdXHJcbiAgICAgICAgcmVzcG9uc2UuZm9yRWFjaCgoZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHthaWQ6W119KVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQgPSBlXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV0uYWlkLnB1c2goZSkgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZC0tXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWQgPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGUgPSAyXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gM1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDRcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlID09PSAxNDQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGUgPSA1XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHthaWQ6W119KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gMVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBvdXRwdXRcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRQYWNrYWdlcygpIHtcclxuICAgICAgICBDSEVDSyh0aGlzLl9jb25uZWN0ZWQsIFwibm90IGNvbm5lY3RlZFwiKVxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlU3RhdHVzUmVzcG9uc2UoYXdhaXQgdGhpcy5jYXJkLmlzc3VlQ29tbWFuZChcIjgwZjIyMDAwMDI0ZjAwXCIpKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldEFwcGxldHMoKSB7XHJcbiAgICAgICAgQ0hFQ0sodGhpcy5fY29ubmVjdGVkLCBcIm5vdCBjb25uZWN0ZWRcIilcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXR1c1Jlc3BvbnNlKGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCI4MGYyNDAwMDAyNGYwMFwiKSlcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkZWxldGVQYWNrYWdlKHN0YXR1czp7YWlkOkJ1ZmZlciB8IFVpbnQ4QXJyYXl9KSB7XHJcbiAgICAgICAgY29uc3QgaGV4Qnl0ZSA9ICh4Om51bWJlcikgPT4gQnVmZmVyLmZyb20oW3hdKS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoYDgwZTQwMDgwJHtoZXhCeXRlKHN0YXR1cy5haWQubGVuZ3RoICsgMil9NGYke2hleEJ5dGUoc3RhdHVzLmFpZC5sZW5ndGgpfSR7QnVmZmVyLmZyb20oc3RhdHVzLmFpZCkudG9TdHJpbmcoXCJoZXhcIil9MDBgKVxyXG4gICAgfVxyXG59Il19