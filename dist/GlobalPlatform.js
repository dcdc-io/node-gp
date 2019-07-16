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
var CHECK = function (test, message) { if (!test)
    throw message; };
var SW = function (buffer) { return buffer.readUInt16BE(buffer.length - 2); };
var SW_OK = function (buffer) { return SW(buffer) === 0x9000; };
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
                        CHECK(!this._connected, "already connected and INITIALIZE state unrecoverable");
                        hostChallenge = crypto_1.randomBytes(8).toString("hex");
                        return [4 /*yield*/, this.card.issueCommand("00a4040000")];
                    case 1:
                        selectGpResponse = _a.sent();
                        CHECK(SW_OK(selectGpResponse), "unexpected " + SW(selectGpResponse).toString(16));
                        return [4 /*yield*/, this.card.issueCommand("8050000008" + hostChallenge + "28")];
                    case 2:
                        initUpdateResponse = _a.sent();
                        CHECK(SW_OK(initUpdateResponse), "unexpected " + SW(selectGpResponse).toString(16));
                        CHECK(initUpdateResponse.length === 30, "init response length incorrect");
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
                        CHECK(cardExpected === cardCalc, "card cryptogram failed");
                        externalAuthenticate = "8482000010" + hostCalc;
                        eaSignature = CardCrypto_1.CardCrypto.getRetailMac(sessionKeys.cmac.toString("hex"), externalAuthenticate, "0000000000000000");
                        externalAuthenticate += eaSignature.toString("hex");
                        return [4 /*yield*/, this.card.issueCommand(externalAuthenticate)];
                    case 3:
                        externalAuthenticateResponse = _a.sent();
                        CHECK(SW_OK(externalAuthenticateResponse), "unexpected auth response " + SW(externalAuthenticateResponse).toString(16));
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
                        CHECK(this._connected, "not connected");
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
                        CHECK(this._connected, "not connected");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9HbG9iYWxQbGF0Zm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQXFDO0FBQ3JDLDJDQUEwQztBQUcxQyxJQUFNLEtBQUssR0FBRyxVQUFDLElBQWEsRUFBRSxPQUFlLElBQU8sSUFBSSxDQUFDLElBQUk7SUFBRSxNQUFNLE9BQU8sQ0FBQSxDQUFDLENBQUMsQ0FBQTtBQUM5RSxJQUFNLEVBQUUsR0FBRyxVQUFDLE1BQWEsSUFBSyxPQUFBLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBdEMsQ0FBc0MsQ0FBQTtBQUNwRSxJQUFNLEtBQUssR0FBRyxVQUFDLE1BQWEsSUFBSyxPQUFBLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxNQUFNLEVBQXJCLENBQXFCLENBQUE7QUFFdEQ7SUFhSTs7T0FFRztJQUNILHdCQUFZLElBQVEsRUFBRSxJQUF1RjtRQWQ3RyxzQ0FBc0M7UUFDdEMsU0FBSSxHQUFPLElBQUksQ0FBQTtRQUVmLG1CQUFjLEdBQUcsa0NBQWtDLENBQUE7UUFDbkQseUJBQW9CLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLFlBQU8sR0FBRyxFQUFFLENBQUE7UUFDWixZQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ1osV0FBTSxHQUFHLEVBQUUsQ0FBQTtRQUVILGVBQVUsR0FBRyxLQUFLLENBQUE7UUFNdEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7UUFDaEIsSUFBSSxJQUFJLEVBQUU7WUFDTixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUM1QjtRQUNELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQTtRQUM1RSxJQUFJ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RSxlQUFlLENBQUMsQ0FBQTt3QkFDaEMsS0FBQSxJQUFJLENBQUMsbUJBQW1CLENBQUE7d0JBQUMscUJBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsRUFBQTs0QkFBOUUsc0JBQU8sU0FBQSxJQUFJLEdBQXFCLFNBQThDLEVBQUMsRUFBQTs7OztLQUNsRjtJQUVLLG1DQUFVLEdBQWhCOzs7Ozs7d0JBQ0ksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUE7d0JBQ2hDLEtBQUEsSUFBSSxDQUFDLG1CQUFtQixDQUFBO3dCQUFDLHFCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLEVBQUE7NEJBQTlFLHNCQUFPLFNBQUEsSUFBSSxHQUFxQixTQUE4QyxFQUFDLEVBQUE7Ozs7S0FDbEY7SUFFSyxzQ0FBYSxHQUFuQixVQUFvQixNQUFnQzs7OztnQkFDMUMsT0FBTyxHQUFHLFVBQUMsQ0FBUSxJQUFLLE9BQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFoQyxDQUFnQyxDQUFBO2dCQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFXLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBSyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQUksQ0FBQyxDQUFBOzs7O0tBQ2pKO0lBQ0wscUJBQUM7QUFBRCxDQUFDLEFBekhELElBeUhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmFuZG9tQnl0ZXMgfSBmcm9tIFwiY3J5cHRvXCI7XHJcbmltcG9ydCB7IENhcmRDcnlwdG8gfSBmcm9tIFwiLi9DYXJkQ3J5cHRvXCI7XHJcbmltcG9ydCBJQXBwbGljYXRpb24gZnJvbSBcIi4vSUFwcGxpY2F0aW9uXCI7XHJcblxyXG5jb25zdCBDSEVDSyA9ICh0ZXN0OiBib29sZWFuLCBtZXNzYWdlOiBzdHJpbmcpID0+IHsgaWYgKCF0ZXN0KSB0aHJvdyBtZXNzYWdlIH1cclxuY29uc3QgU1cgPSAoYnVmZmVyOkJ1ZmZlcikgPT4gYnVmZmVyLnJlYWRVSW50MTZCRShidWZmZXIubGVuZ3RoIC0gMilcclxuY29uc3QgU1dfT0sgPSAoYnVmZmVyOkJ1ZmZlcikgPT4gU1coYnVmZmVyKSA9PT0gMHg5MDAwXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbG9iYWxQbGF0Zm9ybSBpbXBsZW1lbnRzIElBcHBsaWNhdGlvbiB7XHJcblxyXG4gICAgLy8gVE9ETzogZm9yayBzbWFydGNhcmQgYW5kIHBvcnQgdG8gVFNcclxuICAgIGNhcmQ6YW55ID0gbnVsbFxyXG5cclxuICAgIERlZmF1bHRBdXRoS2V5ID0gXCI0MDQxNDI0MzQ0NDU0NjQ3NDg0OTRhNGI0YzRkNGU0ZlwiXHJcbiAgICBzZWN1cmVDaGFubmVsQmFzZUtleSA9IFwiXCJcclxuICAgIHNNYWNLZXkgPSBcIlwiXHJcbiAgICBzRW5jS2V5ID0gXCJcIlxyXG4gICAgZGVrS2V5ID0gXCJcIlxyXG5cclxuICAgIHByaXZhdGUgX2Nvbm5lY3RlZCA9IGZhbHNlXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihjYXJkOmFueSwga2V5cz86eyBzZWN1cmVDaGFubmVsQmFzZUtleT86c3RyaW5nLCBzTWFjS2V5PzpzdHJpbmcsIHNFbmNLZXk6c3RyaW5nLCBkZWtLZXk/OnN0cmluZyB9KSB7XHJcbiAgICAgICAgdGhpcy5jYXJkID0gY2FyZFxyXG4gICAgICAgIGlmIChrZXlzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywga2V5cylcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleSA9IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXkgfHwgdGhpcy5EZWZhdWx0QXV0aEtleVxyXG4gICAgICAgIHRoaXMuc01hY0tleSA9IHRoaXMuc01hY0tleSB8fCB0aGlzLnNlY3VyZUNoYW5uZWxCYXNlS2V5XHJcbiAgICAgICAgdGhpcy5zRW5jS2V5ID0gdGhpcy5zRW5jS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgICAgICB0aGlzLmRla0tleSA9IHRoaXMuZGVrS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbm5lY3RzIHRvIHRoZSBwcmVzZW50IGRldmljZSBhbmQgZXhlY3V0ZXMgdGhlIElOSVRJQUxJWkUgVVBEQVRFIGNvbW1hbmRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29ubmVjdCgpIHtcclxuICAgICAgICBDSEVDSyghdGhpcy5fY29ubmVjdGVkLCBcImFscmVhZHkgY29ubmVjdGVkIGFuZCBJTklUSUFMSVpFIHN0YXRlIHVucmVjb3ZlcmFibGVcIilcclxuXHJcbiAgICAgICAgLy8gc2V0dXBcclxuICAgICAgICBjb25zdCBob3N0Q2hhbGxlbmdlID0gcmFuZG9tQnl0ZXMoOCkudG9TdHJpbmcoXCJoZXhcIilcclxuXHJcbiAgICAgICAgLy8gMS4gc2VsZWN0IGdwXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0R3BSZXNwb25zZSA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCIwMGE0MDQwMDAwXCIpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soc2VsZWN0R3BSZXNwb25zZSksIGB1bmV4cGVjdGVkICR7U1coc2VsZWN0R3BSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gMi4gaW5pdGlhbGl6ZSB1cGRhdGVcclxuICAgICAgICBjb25zdCBpbml0VXBkYXRlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKFwiODA1MDAwMDAwOFwiICsgaG9zdENoYWxsZW5nZSArIFwiMjhcIilcclxuICAgICAgICBDSEVDSyhTV19PSyhpbml0VXBkYXRlUmVzcG9uc2UpLCBgdW5leHBlY3RlZCAke1NXKHNlbGVjdEdwUmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG4gICAgICAgIENIRUNLKGluaXRVcGRhdGVSZXNwb25zZS5sZW5ndGggPT09IDMwLCBgaW5pdCByZXNwb25zZSBsZW5ndGggaW5jb3JyZWN0YClcclxuXHJcbiAgICAgICAgY29uc3Qgc2VxdWVuY2UgPSBpbml0VXBkYXRlUmVzcG9uc2Uuc2xpY2UoMTIsIDE0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IHNlc3Npb25LZXlzID0ge1xyXG4gICAgICAgICAgICBjbWFjOiAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDEwMVwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5zTWFjS2V5LCBcImhleFwiKSksXHJcbiAgICAgICAgICAgIHJtYWM6ICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTAyXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNNYWNLZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgZGVrOiAgICBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShcIjAxODFcIiArIHNlcXVlbmNlICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKHRoaXMuc0VuY0tleSwgXCJoZXhcIikpLFxyXG4gICAgICAgICAgICBlbmM6ICAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDE4MlwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5kZWtLZXksIFwiaGV4XCIpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2FyZENoYWxsZW5nZSA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgxMiwgMjApLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgY2FyZEV4cGVjdGVkID0gaW5pdFVwZGF0ZVJlc3BvbnNlLnNsaWNlKDIwLCAyOCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBjYXJkQ2FsYyA9IENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKGhvc3RDaGFsbGVuZ2UgKyBjYXJkQ2hhbGxlbmdlICsgXCI4MDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBzZXNzaW9uS2V5cy5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBob3N0Q2FsYyA9IENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKGNhcmRDaGFsbGVuZ2UgKyBob3N0Q2hhbGxlbmdlICsgXCI4MDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBzZXNzaW9uS2V5cy5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBDSEVDSyhjYXJkRXhwZWN0ZWQgPT09IGNhcmRDYWxjLCBgY2FyZCBjcnlwdG9ncmFtIGZhaWxlZGApXHJcblxyXG4gICAgICAgIGxldCBleHRlcm5hbEF1dGhlbnRpY2F0ZSA9IFwiODQ4MjAwMDAxMFwiICsgaG9zdENhbGNcclxuICAgICAgICBjb25zdCBlYVNpZ25hdHVyZSA9IENhcmRDcnlwdG8uZ2V0UmV0YWlsTWFjKHNlc3Npb25LZXlzLmNtYWMudG9TdHJpbmcoXCJoZXhcIiksIGV4dGVybmFsQXV0aGVudGljYXRlLCBcIjAwMDAwMDAwMDAwMDAwMDBcIilcclxuICAgICAgICBleHRlcm5hbEF1dGhlbnRpY2F0ZSArPSBlYVNpZ25hdHVyZS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKGV4dGVybmFsQXV0aGVudGljYXRlKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UpLCBgdW5leHBlY3RlZCBhdXRoIHJlc3BvbnNlICR7U1coZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkID0gdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwYXJzZVN0YXR1c1Jlc3BvbnNlKHJlc3BvbnNlOkJ1ZmZlcikge1xyXG4gICAgICAgIGxldCBtb2RlID0gMFxyXG4gICAgICAgIGxldCByZWFkID0gMFxyXG4gICAgICAgIGxldCBvdXRwdXQ6YW55W10gPSBbXVxyXG4gICAgICAgIHJlc3BvbnNlLmZvckVhY2goKGU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSAxXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdLmFpZC5wdXNoKGUpICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQtLVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gMlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDNcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSA0XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZSA9PT0gMTQ0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gNVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZCA9IGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSAgXHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gb3V0cHV0XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0UGFja2FnZXMoKSB7XHJcbiAgICAgICAgQ0hFQ0sodGhpcy5fY29ubmVjdGVkLCBcIm5vdCBjb25uZWN0ZWRcIilcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXR1c1Jlc3BvbnNlKGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCI4MGYyMjAwMDAyNGYwMFwiKSlcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRBcHBsZXRzKCkge1xyXG4gICAgICAgIENIRUNLKHRoaXMuX2Nvbm5lY3RlZCwgXCJub3QgY29ubmVjdGVkXCIpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VTdGF0dXNSZXNwb25zZShhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKFwiODBmMjQwMDAwMjRmMDBcIikpXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlUGFja2FnZShzdGF0dXM6e2FpZDpCdWZmZXIgfCBVaW50OEFycmF5fSkge1xyXG4gICAgICAgIGNvbnN0IGhleEJ5dGUgPSAoeDpudW1iZXIpID0+IEJ1ZmZlci5mcm9tKFt4XSkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKGA4MGU0MDA4MCR7aGV4Qnl0ZShzdGF0dXMuYWlkLmxlbmd0aCArIDIpfTRmJHtoZXhCeXRlKHN0YXR1cy5haWQubGVuZ3RoKX0ke0J1ZmZlci5mcm9tKHN0YXR1cy5haWQpLnRvU3RyaW5nKFwiaGV4XCIpfTAwYClcclxuICAgIH1cclxufSJdfQ==