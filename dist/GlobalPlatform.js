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
    GlobalPlatform.prototype.unzipCap = function (zdata) {
        return __awaiter(this, void 0, void 0, function () {
            var moduleNames, modules, _loop_1, _i, moduleNames_1, mod;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        moduleNames = ["Header", "Directory", "Import", "Applet", "Class", "Method", "StaticField", "Export", "ConstantPool", "RefLocation"];
                        modules = [];
                        _loop_1 = function (mod) {
                            var files, _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        files = zdata.filter(function (f) { return f.endsWith(mod + ".cap"); });
                                        if (!(files.length > 0)) return [3 /*break*/, 2];
                                        _b = (_a = modules).push;
                                        _c = {
                                            module: mod
                                        };
                                        return [4 /*yield*/, files[0].async("nodebuffer")];
                                    case 1:
                                        _b.apply(_a, [(_c.data = _d.sent(),
                                                _c.i = modules.length,
                                                _c)]);
                                        _d.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, moduleNames_1 = moduleNames;
                        _a.label = 1;
                    case 1:
                        if (!(_i < moduleNames_1.length)) return [3 /*break*/, 4];
                        mod = moduleNames_1[_i];
                        return [5 /*yield**/, _loop_1(mod)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, modules];
                }
            });
        });
    };
    GlobalPlatform.prototype.installAuto = function (zdata) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, capaid, appaid, lsw, isw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.unzipCap(zdata)];
                    case 1:
                        modules = _a.sent();
                        capaid = modules.find(function (m) { return m.module === "Header"; }).data.slice(13, 13 + modules.find(function (m) { return m.module === "Header"; }).data[12]);
                        appaid = modules.find(function (m) { return m.module === "Applet"; }).data.slice(5, 5 + modules.find(function (m) { return m.module === "Applet"; }).data[4]);
                        return [4 /*yield*/, this.installForLoad(zdata)];
                    case 2:
                        lsw = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(lsw), "unexpected response " + Utils_1.SW(lsw).toString(16));
                        return [4 /*yield*/, this.installForInstall(capaid.toString("hex"), appaid.toString("hex"))];
                    case 3:
                        isw = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(isw), "unexpected response " + Utils_1.SW(isw).toString(16));
                        return [2 /*return*/, isw];
                }
            });
        });
    };
    GlobalPlatform.prototype.installForLoad = function (zdata) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, aid, apdu, contig, block, sw, _i, apdu_1, cmd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.unzipCap(zdata)];
                    case 1:
                        modules = _a.sent();
                        aid = modules.find(function (m) { return m.module === "Header"; }).data.slice(13, 13 + modules.find(function (m) { return m.module === "Header"; }).data[12]);
                        apdu = [];
                        // install
                        apdu.push("80e60200" + (aid.length + 5 + 256).toString(16).substring(1) + (aid.length + 256).toString(16).substring(1) + aid.toString("hex") + "0000000001");
                        contig = Buffer.concat(modules.map(function (m) { return m.data; }));
                        block = 0xfa;
                        if (contig.length < 128) {
                            apdu.push("80e80000c4" + Buffer.from([contig.length]).toString("hex") + contig.toString("hex"));
                        }
                        else {
                            Buffer.from([apdu.length - 1, block]).toString("hex"); // ?
                            apdu.push("80e800" + Buffer.from([apdu.length - 1, Math.min(block, contig.length) + 4]).toString("hex") + "c482" + Buffer.from([contig.length >> 8, contig.length]).toString("hex") + contig.slice(0, block).toString("hex"));
                            contig = contig.slice(block);
                        }
                        while (contig.length) {
                            apdu.push("80e8" + (contig.length > block ? "00" : "80") + Buffer.from([apdu.length - 1, Math.min(block, contig.length)]).toString("hex") + contig.slice(0, block).toString("hex"));
                            contig = contig.slice(block);
                        }
                        sw = Buffer.from([0]);
                        _i = 0, apdu_1 = apdu;
                        _a.label = 2;
                    case 2:
                        if (!(_i < apdu_1.length)) return [3 /*break*/, 5];
                        cmd = apdu_1[_i];
                        return [4 /*yield*/, this.card.issueCommand(cmd)];
                    case 3:
                        sw = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(sw), "unexpected response " + Utils_1.SW(sw).toString(16) + " for " + cmd);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, sw];
                }
            });
        });
    };
    GlobalPlatform.prototype.installForInstall = function (capaid, modaid) {
        return __awaiter(this, void 0, void 0, function () {
            var instaid, data, apdu, sw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        instaid = modaid;
                        data = "";
                        data += "" + Buffer.from([capaid.length / 2]).toString("hex") + capaid;
                        data += "" + Buffer.from([modaid.length / 2]).toString("hex") + modaid;
                        data += "" + Buffer.from([instaid.length / 2]).toString("hex") + instaid;
                        data += "0100"; // privs
                        data += "02c900"; // params
                        data += "00"; // token
                        apdu = "80e60c00" + Buffer.from([data.length / 2]).toString("hex") + data + "00";
                        return [4 /*yield*/, this.card.issueCommand(apdu)];
                    case 1:
                        sw = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(sw), "unexpected response " + Utils_1.SW(sw).toString(16) + " for " + apdu);
                        return [2 /*return*/, sw];
                }
            });
        });
    };
    return GlobalPlatform;
}());
exports.default = GlobalPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvR2xvYmFsUGxhdGZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFvQztBQUNwQywyQ0FBeUM7QUFFekMsaUNBQTBDO0FBSzFDO0lBYUk7O09BRUc7SUFDSCx3QkFBWSxJQUFRLEVBQUUsSUFBdUY7UUFkN0csc0NBQXNDO1FBQ3RDLFNBQUksR0FBTyxJQUFJLENBQUE7UUFFZixtQkFBYyxHQUFHLGtDQUFrQyxDQUFBO1FBQ25ELHlCQUFvQixHQUFHLEVBQUUsQ0FBQTtRQUN6QixZQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ1osWUFBTyxHQUFHLEVBQUUsQ0FBQTtRQUNaLFdBQU0sR0FBRyxFQUFFLENBQUE7UUFFSCxlQUFVLEdBQUcsS0FBSyxDQUFBO1FBTXRCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLElBQUksSUFBSSxFQUFFO1lBQ04sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDNUI7UUFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUE7UUFDNUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtRQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFBO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUE7SUFDMUQsQ0FBQztJQUVEOztPQUVHO0lBQ0csZ0NBQU8sR0FBYjs7Ozs7O3dCQUNJLGFBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVB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QUFLLENBQUMsRUFBRSxDQUFDLEVBQUUseUJBQXVCLFVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQVEsSUFBTSxDQUFDLENBQUE7d0JBRTFFLHNCQUFPLEVBQUUsRUFBQTs7OztLQUNaO0lBQ0wscUJBQUM7QUFBRCxDQUFDLEFBMU9ELElBME9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmFuZG9tQnl0ZXMgfSBmcm9tIFwiY3J5cHRvXCJcclxuaW1wb3J0IHsgQ2FyZENyeXB0byB9IGZyb20gXCIuL0NhcmRDcnlwdG9cIlxyXG5pbXBvcnQgSUFwcGxpY2F0aW9uIGZyb20gXCIuL0lBcHBsaWNhdGlvblwiXHJcbmltcG9ydCB7IENIRUNLLCBTV19PSywgU1cgfSBmcm9tIFwiLi9VdGlsc1wiXHJcbmltcG9ydCBKU1ppcCwgeyBKU1ppcE9iamVjdCB9IGZyb20gXCJqc3ppcFwiXHJcbmltcG9ydCB7IFN0cmVhbSB9IGZyb20gXCJzdHJlYW1cIjtcclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbG9iYWxQbGF0Zm9ybSBpbXBsZW1lbnRzIElBcHBsaWNhdGlvbiB7XHJcblxyXG4gICAgLy8gVE9ETzogZm9yayBzbWFydGNhcmQgYW5kIHBvcnQgdG8gVFNcclxuICAgIGNhcmQ6YW55ID0gbnVsbFxyXG5cclxuICAgIERlZmF1bHRBdXRoS2V5ID0gXCI0MDQxNDI0MzQ0NDU0NjQ3NDg0OTRhNGI0YzRkNGU0ZlwiXHJcbiAgICBzZWN1cmVDaGFubmVsQmFzZUtleSA9IFwiXCJcclxuICAgIHNNYWNLZXkgPSBcIlwiXHJcbiAgICBzRW5jS2V5ID0gXCJcIlxyXG4gICAgZGVrS2V5ID0gXCJcIlxyXG5cclxuICAgIHByaXZhdGUgX2Nvbm5lY3RlZCA9IGZhbHNlXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihjYXJkOmFueSwga2V5cz86eyBzZWN1cmVDaGFubmVsQmFzZUtleT86c3RyaW5nLCBzTWFjS2V5PzpzdHJpbmcsIHNFbmNLZXk6c3RyaW5nLCBkZWtLZXk/OnN0cmluZyB9KSB7XHJcbiAgICAgICAgdGhpcy5jYXJkID0gY2FyZFxyXG4gICAgICAgIGlmIChrZXlzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywga2V5cylcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleSA9IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXkgfHwgdGhpcy5EZWZhdWx0QXV0aEtleVxyXG4gICAgICAgIHRoaXMuc01hY0tleSA9IHRoaXMuc01hY0tleSB8fCB0aGlzLnNlY3VyZUNoYW5uZWxCYXNlS2V5XHJcbiAgICAgICAgdGhpcy5zRW5jS2V5ID0gdGhpcy5zRW5jS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgICAgICB0aGlzLmRla0tleSA9IHRoaXMuZGVrS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbm5lY3RzIHRvIHRoZSBwcmVzZW50IGRldmljZSBhbmQgZXhlY3V0ZXMgdGhlIElOSVRJQUxJWkUgVVBEQVRFIGNvbW1hbmRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29ubmVjdCgpIHtcclxuICAgICAgICBDSEVDSyghdGhpcy5fY29ubmVjdGVkLCBcImFscmVhZHkgY29ubmVjdGVkIGFuZCBJTklUSUFMSVpFIHN0YXRlIHVucmVjb3ZlcmFibGVcIilcclxuXHJcbiAgICAgICAgLy8gc2V0dXBcclxuICAgICAgICBjb25zdCBob3N0Q2hhbGxlbmdlID0gcmFuZG9tQnl0ZXMoOCkudG9TdHJpbmcoXCJoZXhcIilcclxuXHJcbiAgICAgICAgLy8gMS4gc2VsZWN0IGdwXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0R3BSZXNwb25zZSA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCIwMGE0MDQwMDAwXCIpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soc2VsZWN0R3BSZXNwb25zZSksIGB1bmV4cGVjdGVkICR7U1coc2VsZWN0R3BSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gMi4gaW5pdGlhbGl6ZSB1cGRhdGVcclxuICAgICAgICBjb25zdCBpbml0VXBkYXRlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKFwiODA1MDAwMDAwOFwiICsgaG9zdENoYWxsZW5nZSArIFwiMjhcIilcclxuICAgICAgICBDSEVDSyhTV19PSyhpbml0VXBkYXRlUmVzcG9uc2UpLCBgdW5leHBlY3RlZCAke1NXKHNlbGVjdEdwUmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG4gICAgICAgIENIRUNLKGluaXRVcGRhdGVSZXNwb25zZS5sZW5ndGggPT09IDMwLCBgaW5pdCByZXNwb25zZSBsZW5ndGggaW5jb3JyZWN0YClcclxuXHJcbiAgICAgICAgY29uc3Qgc2VxdWVuY2UgPSBpbml0VXBkYXRlUmVzcG9uc2Uuc2xpY2UoMTIsIDE0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IHNlc3Npb25LZXlzID0ge1xyXG4gICAgICAgICAgICBjbWFjOiAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDEwMVwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5zTWFjS2V5LCBcImhleFwiKSksXHJcbiAgICAgICAgICAgIHJtYWM6ICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTAyXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNNYWNLZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgZGVrOiAgICBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShcIjAxODFcIiArIHNlcXVlbmNlICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKHRoaXMuc0VuY0tleSwgXCJoZXhcIikpLFxyXG4gICAgICAgICAgICBlbmM6ICAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDE4MlwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5kZWtLZXksIFwiaGV4XCIpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2FyZENoYWxsZW5nZSA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgxMiwgMjApLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgY2FyZEV4cGVjdGVkID0gaW5pdFVwZGF0ZVJlc3BvbnNlLnNsaWNlKDIwLCAyOCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBjYXJkQ2FsYyA9IENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKGhvc3RDaGFsbGVuZ2UgKyBjYXJkQ2hhbGxlbmdlICsgXCI4MDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBzZXNzaW9uS2V5cy5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBob3N0Q2FsYyA9IENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKGNhcmRDaGFsbGVuZ2UgKyBob3N0Q2hhbGxlbmdlICsgXCI4MDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBzZXNzaW9uS2V5cy5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBDSEVDSyhjYXJkRXhwZWN0ZWQgPT09IGNhcmRDYWxjLCBgY2FyZCBjcnlwdG9ncmFtIGZhaWxlZGApXHJcblxyXG4gICAgICAgIGxldCBleHRlcm5hbEF1dGhlbnRpY2F0ZSA9IFwiODQ4MjAwMDAxMFwiICsgaG9zdENhbGNcclxuICAgICAgICBjb25zdCBlYVNpZ25hdHVyZSA9IENhcmRDcnlwdG8uZ2V0UmV0YWlsTWFjKHNlc3Npb25LZXlzLmNtYWMudG9TdHJpbmcoXCJoZXhcIiksIGV4dGVybmFsQXV0aGVudGljYXRlLCBcIjAwMDAwMDAwMDAwMDAwMDBcIilcclxuICAgICAgICBleHRlcm5hbEF1dGhlbnRpY2F0ZSArPSBlYVNpZ25hdHVyZS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKGV4dGVybmFsQXV0aGVudGljYXRlKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UpLCBgdW5leHBlY3RlZCBhdXRoIHJlc3BvbnNlICR7U1coZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkID0gdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwYXJzZVN0YXR1c1Jlc3BvbnNlKHJlc3BvbnNlOkJ1ZmZlcikge1xyXG4gICAgICAgIGxldCBtb2RlID0gMFxyXG4gICAgICAgIGxldCByZWFkID0gMFxyXG4gICAgICAgIGxldCBvdXRwdXQ6YW55W10gPSBbXVxyXG4gICAgICAgIHJlc3BvbnNlLmZvckVhY2goKGU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSAxXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdLmFpZC5wdXNoKGUpICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQtLVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gMlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDNcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSA0XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZSA9PT0gMTQ0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gNVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZCA9IGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSAgXHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gb3V0cHV0XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0UGFja2FnZXMoKSB7XHJcbiAgICAgICAgQ0hFQ0sodGhpcy5fY29ubmVjdGVkLCBcIm5vdCBjb25uZWN0ZWRcIilcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXR1c1Jlc3BvbnNlKGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCI4MGYyMjAwMDAyNGYwMFwiKSlcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRBcHBsZXRzKCkge1xyXG4gICAgICAgIENIRUNLKHRoaXMuX2Nvbm5lY3RlZCwgXCJub3QgY29ubmVjdGVkXCIpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VTdGF0dXNSZXNwb25zZShhd2FpdCB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKFwiODBmMjQwMDAwMjRmMDBcIikpXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlUGFja2FnZShzdGF0dXM6e2FpZDpCdWZmZXIgfCBVaW50OEFycmF5fSkge1xyXG4gICAgICAgIGNvbnN0IGhleEJ5dGUgPSAoeDpudW1iZXIpID0+IEJ1ZmZlci5mcm9tKFt4XSkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICB0aGlzLmNhcmQuaXNzdWVDb21tYW5kKGA4MGU0MDA4MCR7aGV4Qnl0ZShzdGF0dXMuYWlkLmxlbmd0aCArIDIpfTRmJHtoZXhCeXRlKHN0YXR1cy5haWQubGVuZ3RoKX0ke0J1ZmZlci5mcm9tKHN0YXR1cy5haWQpLnRvU3RyaW5nKFwiaGV4XCIpfTAwYClcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB1bnppcENhcCh6ZGF0YTpKU1ppcCk6UHJvbWlzZTx7bW9kdWxlOnN0cmluZywgZGF0YTpCdWZmZXIsIGk6bnVtYmVyfVtdPiB7XHJcbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZXMgPSBbXCJIZWFkZXJcIiwgXCJEaXJlY3RvcnlcIiwgXCJJbXBvcnRcIiwgXCJBcHBsZXRcIiwgXCJDbGFzc1wiLCBcIk1ldGhvZFwiLCBcIlN0YXRpY0ZpZWxkXCIsIFwiRXhwb3J0XCIsIFwiQ29uc3RhbnRQb29sXCIsIFwiUmVmTG9jYXRpb25cIl1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBtb2R1bGVzID0gW11cclxuICAgICAgICBmb3IgKGxldCBtb2Qgb2YgbW9kdWxlTmFtZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSB6ZGF0YS5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKGAke21vZH0uY2FwYCkpXHJcbiAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBtb2R1bGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZTogbW9kLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGF3YWl0IGZpbGVzWzBdLmFzeW5jKFwibm9kZWJ1ZmZlclwiKSxcclxuICAgICAgICAgICAgICAgICAgICBpOiBtb2R1bGVzLmxlbmd0aFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG1vZHVsZXNcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbnN0YWxsQXV0byh6ZGF0YTpKU1ppcCk6UHJvbWlzZTxCdWZmZXI+IHtcclxuICAgICAgICBjb25zdCBtb2R1bGVzID0gYXdhaXQgdGhpcy51bnppcENhcCh6ZGF0YSlcclxuICAgICAgICBjb25zdCBjYXBhaWQgPSBtb2R1bGVzLmZpbmQoKG0pID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKSEuZGF0YS5zbGljZSgxMywgMTMgKyBtb2R1bGVzLmZpbmQoKG0pID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKSEuZGF0YVsxMl0pXHJcbiAgICAgICAgY29uc3QgYXBwYWlkID0gbW9kdWxlcy5maW5kKChtKSA9PiBtLm1vZHVsZSA9PT0gXCJBcHBsZXRcIikhLmRhdGEuc2xpY2UoNSwgNSArIG1vZHVsZXMuZmluZCgobSkgPT4gbS5tb2R1bGUgPT09IFwiQXBwbGV0XCIpIS5kYXRhWzRdKVxyXG5cclxuICAgICAgICBjb25zdCBsc3cgPSBhd2FpdCB0aGlzLmluc3RhbGxGb3JMb2FkKHpkYXRhKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGxzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1cobHN3KS50b1N0cmluZygxNil9YClcclxuXHJcbiAgICAgICAgY29uc3QgaXN3ID0gYXdhaXQgdGhpcy5pbnN0YWxsRm9ySW5zdGFsbChjYXBhaWQudG9TdHJpbmcoXCJoZXhcIiksIGFwcGFpZC50b1N0cmluZyhcImhleFwiKSlcclxuICAgICAgICBDSEVDSyhTV19PSyhpc3cpLCBgdW5leHBlY3RlZCByZXNwb25zZSAke1NXKGlzdykudG9TdHJpbmcoMTYpfWApXHJcblxyXG4gICAgICAgIHJldHVybiBpc3dcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbnN0YWxsRm9yTG9hZCh6ZGF0YTpKU1ppcCk6UHJvbWlzZTxCdWZmZXI+IHtcclxuICAgICAgICBjb25zdCBtb2R1bGVzID0gYXdhaXQgdGhpcy51bnppcENhcCh6ZGF0YSlcclxuXHJcbiAgICAgICAgY29uc3QgYWlkID0gbW9kdWxlcy5maW5kKChtKSA9PiBtLm1vZHVsZSA9PT0gXCJIZWFkZXJcIikhLmRhdGEuc2xpY2UoMTMsIDEzICsgbW9kdWxlcy5maW5kKChtOmFueSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpIS5kYXRhWzEyXSlcclxuXHJcbiAgICAgICAgbGV0IGFwZHU6c3RyaW5nW10gPSBbXVxyXG5cclxuICAgICAgICAvLyBpbnN0YWxsXHJcbiAgICAgICAgYXBkdS5wdXNoKGA4MGU2MDIwMCR7KGFpZC5sZW5ndGggKyA1ICsgMjU2KS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpfSR7KGFpZC5sZW5ndGggKyAyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSl9JHthaWQudG9TdHJpbmcoXCJoZXhcIil9MDAwMDAwMDAwMWApXHJcblxyXG4gICAgICAgIC8vIGxvYWQgbG9vcFxyXG4gICAgICAgIC8vIHNlZSBodHRwczovL3d3dy53My5vcmcvUHJvdG9jb2xzL0hUVFAtTkcvYXNuMS5odG1sIGZvciBBU04uMS9UTFYgaW5mb1xyXG4gICAgICAgIGxldCBjb250aWcgPSBCdWZmZXIuY29uY2F0KG1vZHVsZXMubWFwKG0gPT4gbS5kYXRhKSlcclxuICAgICAgICBjb25zdCBibG9jayA9IDB4ZmEgICAgICAgIFxyXG4gICAgICAgIGlmIChjb250aWcubGVuZ3RoIDwgMTI4KSB7XHJcbiAgICAgICAgICAgIGFwZHUucHVzaChgODBlODAwMDBjNCR7QnVmZmVyLmZyb20oW2NvbnRpZy5sZW5ndGhdKS50b1N0cmluZyhcImhleFwiKX0ke2NvbnRpZy50b1N0cmluZyhcImhleFwiKX1gKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgQnVmZmVyLmZyb20oW2FwZHUubGVuZ3RoIC0gMSwgYmxvY2tdKS50b1N0cmluZyhcImhleFwiKSAvLyA/XHJcbiAgICAgICAgICAgIGFwZHUucHVzaChgODBlODAwJHtCdWZmZXIuZnJvbShbYXBkdS5sZW5ndGggLSAxLCBNYXRoLm1pbihibG9jaywgY29udGlnLmxlbmd0aCkgKyA0XSkudG9TdHJpbmcoXCJoZXhcIil9YzQ4MiR7QnVmZmVyLmZyb20oW2NvbnRpZy5sZW5ndGggPj4gOCwgY29udGlnLmxlbmd0aF0pLnRvU3RyaW5nKFwiaGV4XCIpfSR7Y29udGlnLnNsaWNlKDAsIGJsb2NrKS50b1N0cmluZyhcImhleFwiKX1gKVxyXG4gICAgICAgICAgICBjb250aWcgPSBjb250aWcuc2xpY2UoYmxvY2spXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChjb250aWcubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGFwZHUucHVzaChgODBlOCR7Y29udGlnLmxlbmd0aCA+IGJsb2NrID8gXCIwMFwiIDogXCI4MFwifSR7QnVmZmVyLmZyb20oW2FwZHUubGVuZ3RoIC0gMSwgTWF0aC5taW4oYmxvY2ssIGNvbnRpZy5sZW5ndGgpXSkudG9TdHJpbmcoXCJoZXhcIil9JHtjb250aWcuc2xpY2UoMCwgYmxvY2spLnRvU3RyaW5nKFwiaGV4XCIpfWApXHJcbiAgICAgICAgICAgIGNvbnRpZyA9IGNvbnRpZy5zbGljZShibG9jaylcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN3ID0gQnVmZmVyLmZyb20oWzBdKVxyXG4gICAgICAgIGZvciAobGV0IGNtZCBvZiBhcGR1KSB7XHJcbiAgICAgICAgICAgIHN3ID0gYXdhaXQgdGhpcy5jYXJkLmlzc3VlQ29tbWFuZChjbWQpXHJcbiAgICAgICAgICAgIENIRUNLKFNXX09LKHN3KSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgJHtTVyhzdykudG9TdHJpbmcoMTYpfSBmb3IgJHtjbWR9YClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN3XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW5zdGFsbEZvckluc3RhbGwoY2FwYWlkOnN0cmluZywgbW9kYWlkOnN0cmluZyk6UHJvbWlzZTxCdWZmZXI+IHtcclxuICAgICAgICAvLyBzZWUgc3BlYyAyLjEuMSA5LjUuMi4zLjEgZm9yIGRhdGFcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAxIGxlbiBsb2FkIGZpbGUgYWlkXHJcbiAgICAgICAgICogNS0xNlxyXG4gICAgICAgICAqIDEgbW9kdWxlIGFpZFxyXG4gICAgICAgICAqIDUtMTZcclxuICAgICAgICAgKiAxIGFwcCBhaWRcclxuICAgICAgICAgKiA1LTE2XHJcbiAgICAgICAgICogMSBsZW4gcHJpdnNcclxuICAgICAgICAgKiAxIHByaXZzXHJcbiAgICAgICAgICogMSBsZW4gcGFyYW1zXHJcbiAgICAgICAgICogMi1uIHBhcmFtc1xyXG4gICAgICAgICAqIDEgbGVuIHRva2VuXHJcbiAgICAgICAgICogMC1uIHRva2VuXHJcbiAgICAgICAgICogMDUgXHJcbiAgICAgICAgICogRDIgNzYgMDAgMDAgODVcclxuICAgICAgICAgKiAwN1xyXG4gICAgICAgICAqIEQyIDc2IDAwIDAwIDg1IDAxIDAxXHJcbiAgICAgICAgICogMDdcclxuICAgICAgICAgKiBEMiA3NiAwMCAwMCA4NSAwMSAwMVxyXG4gICAgICAgICAqIDAxXHJcbiAgICAgICAgICogMDAgXHJcbiAgICAgICAgICogMDIgXHJcbiAgICAgICAgICogQzkgMDAgKFRMVilcclxuICAgICAgICAgKiAwMFxyXG4gICAgICAgICAqIDAwXHJcbiAgICAgICAgICogICovXHJcbiAgICAgICAgbGV0IGluc3RhaWQgPSBtb2RhaWRcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBcIlwiXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbY2FwYWlkLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke2NhcGFpZH1gXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbbW9kYWlkLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke21vZGFpZH1gXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbaW5zdGFpZC5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHtpbnN0YWlkfWBcclxuICAgICAgICBkYXRhICs9IFwiMDEwMFwiIC8vIHByaXZzXHJcbiAgICAgICAgZGF0YSArPSBcIjAyYzkwMFwiIC8vIHBhcmFtc1xyXG4gICAgICAgIGRhdGEgKz0gXCIwMFwiIC8vIHRva2VuXHJcblxyXG4gICAgICAgIGNvbnN0IGFwZHUgPSBgODBlNjBjMDAke0J1ZmZlci5mcm9tKFtkYXRhLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke2RhdGF9MDBgXHJcblxyXG4gICAgICAgIGNvbnN0IHN3ID0gYXdhaXQgdGhpcy5jYXJkLmlzc3VlQ29tbWFuZChhcGR1KVxyXG4gICAgICAgIENIRUNLKFNXX09LKHN3KSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgJHtTVyhzdykudG9TdHJpbmcoMTYpfSBmb3IgJHthcGR1fWApXHJcblxyXG4gICAgICAgIHJldHVybiBzd1xyXG4gICAgfVxyXG59XHJcbiJdfQ==