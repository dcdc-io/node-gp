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
    GlobalPlatform.prototype.installForLoad = function (zdata) {
        return __awaiter(this, void 0, void 0, function () {
            var moduleNames, modules, aid, sw, apdu;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        moduleNames = ["Header", "Directory", "Import", "Applet", "Class", "Method", "StaticField", "Export", "ConstantPool", "RefLocation"];
                        return [4 /*yield*/, moduleNames
                                .map(function (mod, o) { return [mod, zdata.filter(function (f) { return f.endsWith(mod + ".cap"); })[0], o]; })
                                .filter(function (x) { return x[1]; })
                                .reduce(function (p, c) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            _a = p;
                                            _b = c[2];
                                            _c = {
                                                module: c[0]
                                            };
                                            return [4 /*yield*/, c[1].async("nodebuffer")];
                                        case 1:
                                            _a[_b] = (_c.data = _d.sent(),
                                                _c);
                                            return [2 /*return*/, p];
                                    }
                                });
                            }); }, [])];
                    case 1:
                        modules = _a.sent();
                        console.log(modules);
                        aid = modules.find(function (m) { return m.module === "Header"; }).data.slice(13, 13 + modules.find(function (m) { return m.module === "Header"; }).data[12]);
                        sw = null;
                        apdu = [];
                        // install
                        apdu.push("80e60200" + (aid.length + 5 + 256).toString(16).substring(1) + (aid.length + 256).toString(16).substring(1) + aid.toString("hex") + "0000000001");
                        // load loop
                        while (true) {
                            break;
                        }
                        return [4 /*yield*/, this.card.issueCommand(apdu)];
                    case 2:
                        sw = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(sw), "unexpected response " + Utils_1.SW(sw).toString(16));
                        apdu;
                        return [2 /*return*/, Buffer.alloc(0)];
                }
            });
        });
    };
    return GlobalPlatform;
}());
exports.default = GlobalPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvR2xvYmFsUGxhdGZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFvQztBQUNwQywyQ0FBeUM7QUFFekMsaUNBQTBDO0FBSTFDO0lBYUk7O09BRUc7SUFDSCx3QkFBWSxJQUFRLEVBQUUsSUFBdUY7UUFkN0csc0NBQXNDO1FBQ3RDLFNBQUksR0FBTyxJQUFJLENBQUE7UUFFZixtQkFBYyxHQUFHLGtDQUFrQyxDQUFBO1FBQ25ELHlCQUFvQixHQUFHLEVBQUUsQ0FBQTtRQUN6QixZQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ1osWUFBTyxHQUFHLEVBQUUsQ0FBQTtRQUNaLFdBQU0sR0FBRyxFQUFFLENBQUE7UUFFSCxlQUFVLEdBQUcsS0FBSyxDQUFBO1FBTXRCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLElBQUksSUFBSSxFQUFFO1lBQ04sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDNUI7UUFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUE7UUFDNUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtRQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFBO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUE7SUFDMUQsQ0FBQztJQUVEOztPQUVHO0lBQ0csZ0NBQU8sR0FBYjs7Ozs7O3dCQUNJLGFBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVB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UUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxlQUFZLENBQUMsQ0FBQTt3QkFFdkosWUFBWTt3QkFDWixPQUFPLElBQUksRUFBRTs0QkFDVCxNQUFNO3lCQUNUO3dCQUdJLHFCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFBOzt3QkFBdkMsRUFBRSxHQUFHLFNBQWtDLENBQUE7d0JBQ3ZDLGFBQUssQ0FBQyxhQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUseUJBQXVCLFVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFHLENBQUMsQ0FBQTt3QkFFOUQsSUFBSSxDQUFBO3dCQUVKLHNCQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUE7Ozs7S0FDekI7SUFDTCxxQkFBQztBQUFELENBQUMsQUEvSkQsSUErSkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gXCJjcnlwdG9cIlxyXG5pbXBvcnQgeyBDYXJkQ3J5cHRvIH0gZnJvbSBcIi4vQ2FyZENyeXB0b1wiXHJcbmltcG9ydCBJQXBwbGljYXRpb24gZnJvbSBcIi4vSUFwcGxpY2F0aW9uXCJcclxuaW1wb3J0IHsgQ0hFQ0ssIFNXX09LLCBTVyB9IGZyb20gXCIuL1V0aWxzXCJcclxuaW1wb3J0IEpTWmlwLCB7IEpTWmlwT2JqZWN0IH0gZnJvbSBcImpzemlwXCJcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbG9iYWxQbGF0Zm9ybSBpbXBsZW1lbnRzIElBcHBsaWNhdGlvbiB7XHJcblxyXG4gICAgLy8gVE9ETzogZm9yayBzbWFydGNhcmQgYW5kIHBvcnQgdG8gVFNcclxuICAgIGNhcmQ6YW55ID0gbnVsbFxyXG5cclxuICAgIERlZmF1bHRBdXRoS2V5ID0gXCI0MDQxNDI0MzQ0NDU0NjQ3NDg0OTRhNGI0YzRkNGU0ZlwiXHJcbiAgICBzZWN1cmVDaGFubmVsQmFzZUtleSA9IFwiXCJcclxuICAgIHNNYWNLZXkgPSBcIlwiXHJcbiAgICBzRW5jS2V5ID0gXCJcIlxyXG4gICAgZGVrS2V5ID0gXCJcIlxyXG5cclxuICAgIHByaXZhdGUgX2Nvbm5lY3RlZCA9IGZhbHNlXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihjYXJkOmFueSwga2V5cz86eyBzZWN1cmVDaGFubmVsQmFzZUtleT86c3RyaW5nLCBzTWFjS2V5PzpzdHJpbmcsIHNFbmNLZXk6c3RyaW5nLCBkZWtLZXk/OnN0cmluZyB9KSB7XHJcbiAgICAgICAgdGhpcy5jYXJkID0gY2FyZFxyXG4gICAgICAgIGlmIChrZXlzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywga2V5cylcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleSA9IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXkgfHwgdGhpcy5EZWZhdWx0QXV0aEtleVxyXG4gICAgICAgIHRoaXMuc01hY0tleSA9IHRoaXMuc01hY0tleSB8fCB0aGlzLnNlY3VyZUNoYW5uZWxCYXNlS2V5XHJcbiAgICAgICAgdGhpcy5zRW5jS2V5ID0gdGhpcy5zRW5jS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgICAgICB0aGlzLmRla0tleSA9IHRoaXMuZGVrS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbm5lY3RzIHRvIHRoZSBwcmVzZW50IGRldmljZSBhbmQgZXhlY3V0ZXMgdGhlIElOSVRJQUxJWkUgVVBEQVRFIGNvbW1hbmRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29ubmVjdCgpIHtcclxuICAgICAgICBDSEVDSyghdGhpcy5fY29ubmVjdGVkLCBcImFscmVhZHkgY29ubmVjdGVkIGFuZCBJTklUSUFMSVpFIHN0YXRlIHVucmVjb3ZlcmFibGVcIilcclxuXHJcbiAgICAgICAgLy8gc2V0dXBcclxuICAgICAgICBjb25zdCBob3N0Q2hhbGxlbmdlID0gcmFuZG9tQnl0ZXMoOCkudG9TdHJpbmcoXCJoZXhcIilcclxuXHJcbiAgICAgICAgLy8gMS4gc2VsZWN0IGdwXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0R3BSZXNwb25zZSA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCIwMGE0MDQwMDAwXCIpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soc2VsZWN0R3BSZXNwb25zZSksIGB1bmV4cGVjdGVkICR7U1coc2VsZWN0R3BSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gMi4gaW5pdGlhbGl6ZSB1cGRhdGVcclxuICAgICAgICBjb25zdCBpbml0VXBkYXRlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKFwiODA1MDAwMDAwOFwiICsgaG9zdENoYWxsZW5nZSArIFwiMjhcIilcclxuICAgICAgICBDSEVDSyhTV19PSyhpbml0VXBkYXRlUmVzcG9uc2UpLCBgdW5leHBlY3RlZCAke1NXKHNlbGVjdEdwUmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG4gICAgICAgIENIRUNLKGluaXRVcGRhdGVSZXNwb25zZS5sZW5ndGggPT09IDMwLCBgaW5pdCByZXNwb25zZSBsZW5ndGggaW5jb3JyZWN0YClcclxuXHJcbiAgICAgICAgY29uc3Qgc2VxdWVuY2UgPSBpbml0VXBkYXRlUmVzcG9uc2Uuc2xpY2UoMTIsIDE0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IHNlc3Npb25LZXlzID0ge1xyXG4gICAgICAgICAgICBjbWFjOiAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDEwMVwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5zTWFjS2V5LCBcImhleFwiKSksXHJcbiAgICAgICAgICAgIHJtYWM6ICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTAyXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNNYWNLZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgZGVrOiAgICBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShcIjAxODFcIiArIHNlcXVlbmNlICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKHRoaXMuc0VuY0tleSwgXCJoZXhcIikpLFxyXG4gICAgICAgICAgICBlbmM6ICAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDE4MlwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5kZWtLZXksIFwiaGV4XCIpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2FyZENoYWxsZW5nZSA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgxMiwgMjApLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgY2FyZEV4cGVjdGVkID0gaW5pdFVwZGF0ZVJlc3BvbnNlLnNsaWNlKDIwLCAyOCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBjYXJkQ2FsYyA9IENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKGhvc3RDaGFsbGVuZ2UgKyBjYXJkQ2hhbGxlbmdlICsgXCI4MDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBzZXNzaW9uS2V5cy5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBob3N0Q2FsYyA9IENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKGNhcmRDaGFsbGVuZ2UgKyBob3N0Q2hhbGxlbmdlICsgXCI4MDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBzZXNzaW9uS2V5cy5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBDSEVDSyhjYXJkRXhwZWN0ZWQgPT09IGNhcmRDYWxjLCBgY2FyZCBjcnlwdG9ncmFtIGZhaWxlZGApXHJcblxyXG4gICAgICAgIGxldCBleHRlcm5hbEF1dGhlbnRpY2F0ZSA9IFwiODQ4MjAwMDAxMFwiICsgaG9zdENhbGNcclxuICAgICAgICBjb25zdCBlYVNpZ25hdHVyZSA9IENhcmRDcnlwdG8uZ2V0UmV0YWlsTWFjKHNlc3Npb25LZXlzLmNtYWMudG9TdHJpbmcoXCJoZXhcIiksIGV4dGVybmFsQXV0aGVudGljYXRlLCBcIjAwMDAwMDAwMDAwMDAwMDBcIilcclxuICAgICAgICBleHRlcm5hbEF1dGhlbnRpY2F0ZSArPSBlYVNpZ25hdHVyZS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKGV4dGVybmFsQXV0aGVudGljYXRlKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UpLCBgdW5leHBlY3RlZCBhdXRoIHJlc3BvbnNlICR7U1coZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkID0gdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwYXJzZVN0YXR1c1Jlc3BvbnNlKHJlc3BvbnNlOkJ1ZmZlcikge1xyXG4gICAgICAgIGxldCBtb2RlID0gMFxyXG4gICAgICAgIGxldCByZWFkID0gMFxyXG4gICAgICAgIGxldCBvdXRwdXQ6YW55W10gPSBbXVxyXG4gICAgICAgIHJlc3BvbnNlLmZvckVhY2goKGU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSAxXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdLmFpZC5wdXNoKGUpICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQtLVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gMlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDNcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSA0XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZSA9PT0gMTQ0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gNVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZCA9IGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSAgXHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gb3V0cHV0XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0UGFja2FnZXMoKSB7XHJcbiAgICAgICAgQ0hFQ0sodGhpcy5fY29ubmVjdGVkLCBcIm5vdCBjb25uZWN0ZWRcIilcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXR1c1Jlc3BvbnNlKGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCI4MGYyMjAwMDAyNGYwMFwiKSlcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRBcHBsZXRzKCkge1xyXG4gICAgICAgIENIRUNLKHRoaXMuX2Nvbm5lY3RlZCwgXCJub3QgY29ubmVjdGVkXCIpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VTdGF0dXNSZXNwb25zZShhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKFwiODBmMjQwMDAwMjRmMDBcIikpXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlUGFja2FnZShzdGF0dXM6e2FpZDpCdWZmZXIgfCBVaW50OEFycmF5fSkge1xyXG4gICAgICAgIGNvbnN0IGhleEJ5dGUgPSAoeDpudW1iZXIpID0+IEJ1ZmZlci5mcm9tKFt4XSkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKGA4MGU0MDA4MCR7aGV4Qnl0ZShzdGF0dXMuYWlkLmxlbmd0aCArIDIpfTRmJHtoZXhCeXRlKHN0YXR1cy5haWQubGVuZ3RoKX0ke0J1ZmZlci5mcm9tKHN0YXR1cy5haWQpLnRvU3RyaW5nKFwiaGV4XCIpfTAwYClcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbnN0YWxsRm9yTG9hZCh6ZGF0YTpKU1ppcCk6UHJvbWlzZTxCdWZmZXI+IHtcclxuICAgICAgICBjb25zdCBtb2R1bGVOYW1lcyA9IFtcIkhlYWRlclwiLCBcIkRpcmVjdG9yeVwiLCBcIkltcG9ydFwiLCBcIkFwcGxldFwiLCBcIkNsYXNzXCIsIFwiTWV0aG9kXCIsIFwiU3RhdGljRmllbGRcIiwgXCJFeHBvcnRcIiwgXCJDb25zdGFudFBvb2xcIiwgXCJSZWZMb2NhdGlvblwiXVxyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBhd2FpdCBtb2R1bGVOYW1lc1xyXG4gICAgICAgICAgICAubWFwKChtb2QsIG8pID0+IFttb2QsIHpkYXRhLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoYCR7bW9kfS5jYXBgKSlbMF0sIG9dKVxyXG4gICAgICAgICAgICAuZmlsdGVyKHggPT4geFsxXSlcclxuICAgICAgICAgICAgLnJlZHVjZShhc3luYyAocCwgYykgPT4geyBcclxuICAgICAgICAgICAgICAgIHBbY1syXSBhcyBudW1iZXJdID0geyBcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IGNbMF0gYXMgc3RyaW5nLCBcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBhd2FpdCAoY1sxXSBhcyBKU1ppcE9iamVjdCkuYXN5bmMoXCJub2RlYnVmZmVyXCIpIFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwIFxyXG4gICAgICAgICAgICB9LCBbXSBhcyBhbnkpXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2cobW9kdWxlcylcclxuXHJcblxyXG4gICAgICAgIGNvbnN0IGFpZCA9IG1vZHVsZXMuZmluZCgobTphbnkpID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKS5kYXRhLnNsaWNlKDEzLCAxMyArIG1vZHVsZXMuZmluZCgobTphbnkpID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKS5kYXRhWzEyXSlcclxuXHJcbiAgICAgICAgbGV0IHN3OmFueSA9IG51bGxcclxuICAgICAgICBsZXQgYXBkdTpzdHJpbmdbXSA9IFtdXHJcblxyXG4gICAgICAgIC8vIGluc3RhbGxcclxuICAgICAgICBhcGR1LnB1c2goYDgwZTYwMjAwJHsoYWlkLmxlbmd0aCArIDUgKyAyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSl9JHsoYWlkLmxlbmd0aCArIDI1NikudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKX0ke2FpZC50b1N0cmluZyhcImhleFwiKX0wMDAwMDAwMDAxYClcclxuICAgICAgICBcclxuICAgICAgICAvLyBsb2FkIGxvb3BcclxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBzdyA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoYXBkdSlcclxuICAgICAgICBDSEVDSyhTV19PSyhzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1coc3cpLnRvU3RyaW5nKDE2KX1gKVxyXG4gICAgICAgIFxyXG4gICAgICAgIGFwZHVcclxuXHJcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxyXG4gICAgfVxyXG59Il19