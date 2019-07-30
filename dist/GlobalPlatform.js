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
    function GlobalPlatform(transceiveFunction, keys) {
        var _this = this;
        this.issueCommandStr = function (command) { return _this.issueCommand(Buffer.from(command)); };
        this.DefaultAuthKey = "404142434445464748494a4b4c4d4e4f";
        this.secureChannelBaseKey = "";
        this.sMacKey = "";
        this.sEncKey = "";
        this.dekKey = "";
        this._connected = false;
        this.issueCommand = transceiveFunction;
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
                        return [4 /*yield*/, this.issueCommandStr("00a4040000")];
                    case 1:
                        selectGpResponse = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(selectGpResponse), "unexpected " + Utils_1.SW(selectGpResponse).toString(16));
                        return [4 /*yield*/, this.issueCommandStr("8050000008" + hostChallenge + "28")];
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
                        return [4 /*yield*/, this.issueCommandStr(externalAuthenticate)];
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
                        return [4 /*yield*/, this.issueCommandStr("80f22000024f00")];
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
                        return [4 /*yield*/, this.issueCommandStr("80f24000024f00")];
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
                this.issueCommandStr("80e40080" + hexByte(status.aid.length + 2) + "4f" + hexByte(status.aid.length) + Buffer.from(status.aid).toString("hex") + "00");
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
                        return [4 /*yield*/, this.issueCommandStr(cmd)];
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
                        return [4 /*yield*/, this.issueCommandStr(apdu)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvR2xvYmFsUGxhdGZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFvQztBQUNwQywyQ0FBeUM7QUFFekMsaUNBQTBDO0FBSTFDO0lBY0k7O09BRUc7SUFDSCx3QkFBWSxrQkFBc0QsRUFBRSxJQUF1RjtRQUEzSixpQkFTQztRQXRCUSxvQkFBZSxHQUFHLFVBQUMsT0FBYyxJQUFLLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQXZDLENBQXVDLENBQUE7UUFFdEYsbUJBQWMsR0FBRyxrQ0FBa0MsQ0FBQTtRQUNuRCx5QkFBb0IsR0FBRyxFQUFFLENBQUE7UUFDekIsWUFBTyxHQUFHLEVBQUUsQ0FBQTtRQUNaLFlBQU8sR0FBRyxFQUFFLENBQUE7UUFDWixXQUFNLEdBQUcsRUFBRSxDQUFBO1FBRUgsZUFBVSxHQUFHLEtBQUssQ0FBQTtRQU10QixJQUFJLENBQUMsWUFBWSxHQUFHLGtCQUFrQixDQUFBO1FBQ3RDLElBQUksSUFBSSxFQUFFO1lBQ04sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDNUI7UUFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUE7UUFDNUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtRQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFBO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsb0JBQW9C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LENBQUMsYUFBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLHlCQUF1QixVQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxhQUFRLElBQU0sQ0FBQyxDQUFBO3dCQUUxRSxzQkFBTyxFQUFFLEVBQUE7Ozs7S0FDWjtJQUNMLHFCQUFDO0FBQUQsQ0FBQyxBQTNPRCxJQTJPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJhbmRvbUJ5dGVzIH0gZnJvbSBcImNyeXB0b1wiXHJcbmltcG9ydCB7IENhcmRDcnlwdG8gfSBmcm9tIFwiLi9DYXJkQ3J5cHRvXCJcclxuaW1wb3J0IElBcHBsaWNhdGlvbiBmcm9tIFwiLi9JQXBwbGljYXRpb25cIlxyXG5pbXBvcnQgeyBDSEVDSywgU1dfT0ssIFNXIH0gZnJvbSBcIi4vVXRpbHNcIlxyXG5pbXBvcnQgSlNaaXAsIHsgSlNaaXBPYmplY3QgfSBmcm9tIFwianN6aXBcIlxyXG5pbXBvcnQgeyBTdHJlYW0gfSBmcm9tIFwic3RyZWFtXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbG9iYWxQbGF0Zm9ybSBpbXBsZW1lbnRzIElBcHBsaWNhdGlvbiB7XHJcblxyXG4gICAgLy8gVE9ETzogZm9yayBzbWFydGNhcmQgYW5kIHBvcnQgdG8gVFNcclxuICAgIGlzc3VlQ29tbWFuZCE6IChjb21tYW5kOkJ1ZmZlcikgPT4gUHJvbWlzZTxCdWZmZXI+XHJcbiAgICByZWFkb25seSBpc3N1ZUNvbW1hbmRTdHIgPSAoY29tbWFuZDpzdHJpbmcpID0+IHRoaXMuaXNzdWVDb21tYW5kKEJ1ZmZlci5mcm9tKGNvbW1hbmQpKVxyXG5cclxuICAgIERlZmF1bHRBdXRoS2V5ID0gXCI0MDQxNDI0MzQ0NDU0NjQ3NDg0OTRhNGI0YzRkNGU0ZlwiXHJcbiAgICBzZWN1cmVDaGFubmVsQmFzZUtleSA9IFwiXCJcclxuICAgIHNNYWNLZXkgPSBcIlwiXHJcbiAgICBzRW5jS2V5ID0gXCJcIlxyXG4gICAgZGVrS2V5ID0gXCJcIlxyXG5cclxuICAgIHByaXZhdGUgX2Nvbm5lY3RlZCA9IGZhbHNlXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcih0cmFuc2NlaXZlRnVuY3Rpb246KGNvbW1hbmQ6QnVmZmVyKSA9PiBQcm9taXNlPEJ1ZmZlcj4sIGtleXM/Onsgc2VjdXJlQ2hhbm5lbEJhc2VLZXk/OnN0cmluZywgc01hY0tleT86c3RyaW5nLCBzRW5jS2V5OnN0cmluZywgZGVrS2V5PzpzdHJpbmcgfSkge1xyXG4gICAgICAgIHRoaXMuaXNzdWVDb21tYW5kID0gdHJhbnNjZWl2ZUZ1bmN0aW9uXHJcbiAgICAgICAgaWYgKGtleXMpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBrZXlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlY3VyZUNoYW5uZWxCYXNlS2V5ID0gdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleSB8fCB0aGlzLkRlZmF1bHRBdXRoS2V5XHJcbiAgICAgICAgdGhpcy5zTWFjS2V5ID0gdGhpcy5zTWFjS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgICAgICB0aGlzLnNFbmNLZXkgPSB0aGlzLnNFbmNLZXkgfHwgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleVxyXG4gICAgICAgIHRoaXMuZGVrS2V5ID0gdGhpcy5kZWtLZXkgfHwgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29ubmVjdHMgdG8gdGhlIHByZXNlbnQgZGV2aWNlIGFuZCBleGVjdXRlcyB0aGUgSU5JVElBTElaRSBVUERBVEUgY29tbWFuZFxyXG4gICAgICovXHJcbiAgICBhc3luYyBjb25uZWN0KCkge1xyXG4gICAgICAgIENIRUNLKCF0aGlzLl9jb25uZWN0ZWQsIFwiYWxyZWFkeSBjb25uZWN0ZWQgYW5kIElOSVRJQUxJWkUgc3RhdGUgdW5yZWNvdmVyYWJsZVwiKVxyXG5cclxuICAgICAgICAvLyBzZXR1cFxyXG4gICAgICAgIGNvbnN0IGhvc3RDaGFsbGVuZ2UgPSByYW5kb21CeXRlcyg4KS50b1N0cmluZyhcImhleFwiKVxyXG5cclxuICAgICAgICAvLyAxLiBzZWxlY3QgZ3BcclxuICAgICAgICBjb25zdCBzZWxlY3RHcFJlc3BvbnNlID0gYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoXCIwMGE0MDQwMDAwXCIpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soc2VsZWN0R3BSZXNwb25zZSksIGB1bmV4cGVjdGVkICR7U1coc2VsZWN0R3BSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gMi4gaW5pdGlhbGl6ZSB1cGRhdGVcclxuICAgICAgICBjb25zdCBpbml0VXBkYXRlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmlzc3VlQ29tbWFuZFN0cihcIjgwNTAwMDAwMDhcIiArIGhvc3RDaGFsbGVuZ2UgKyBcIjI4XCIpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soaW5pdFVwZGF0ZVJlc3BvbnNlKSwgYHVuZXhwZWN0ZWQgJHtTVyhzZWxlY3RHcFJlc3BvbnNlKS50b1N0cmluZygxNil9YClcclxuICAgICAgICBDSEVDSyhpbml0VXBkYXRlUmVzcG9uc2UubGVuZ3RoID09PSAzMCwgYGluaXQgcmVzcG9uc2UgbGVuZ3RoIGluY29ycmVjdGApXHJcblxyXG4gICAgICAgIGNvbnN0IHNlcXVlbmNlID0gaW5pdFVwZGF0ZVJlc3BvbnNlLnNsaWNlKDEyLCAxNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBzZXNzaW9uS2V5cyA9IHtcclxuICAgICAgICAgICAgY21hYzogICBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShcIjAxMDFcIiArIHNlcXVlbmNlICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKHRoaXMuc01hY0tleSwgXCJoZXhcIikpLFxyXG4gICAgICAgICAgICBybWFjOiAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDEwMlwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5zTWFjS2V5LCBcImhleFwiKSksXHJcbiAgICAgICAgICAgIGRlazogICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTgxXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNFbmNLZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgZW5jOiAgICBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShcIjAxODJcIiArIHNlcXVlbmNlICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKHRoaXMuZGVrS2V5LCBcImhleFwiKSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNhcmRDaGFsbGVuZ2UgPSBpbml0VXBkYXRlUmVzcG9uc2Uuc2xpY2UoMTIsIDIwKS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGNhcmRFeHBlY3RlZCA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgyMCwgMjgpLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgY2FyZENhbGMgPSBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShob3N0Q2hhbGxlbmdlICsgY2FyZENoYWxsZW5nZSArIFwiODAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgc2Vzc2lvbktleXMuZW5jKS5zbGljZSgxNiwgMjQpLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgaG9zdENhbGMgPSBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShjYXJkQ2hhbGxlbmdlICsgaG9zdENoYWxsZW5nZSArIFwiODAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgc2Vzc2lvbktleXMuZW5jKS5zbGljZSgxNiwgMjQpLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgQ0hFQ0soY2FyZEV4cGVjdGVkID09PSBjYXJkQ2FsYywgYGNhcmQgY3J5cHRvZ3JhbSBmYWlsZWRgKVxyXG5cclxuICAgICAgICBsZXQgZXh0ZXJuYWxBdXRoZW50aWNhdGUgPSBcIjg0ODIwMDAwMTBcIiArIGhvc3RDYWxjXHJcbiAgICAgICAgY29uc3QgZWFTaWduYXR1cmUgPSBDYXJkQ3J5cHRvLmdldFJldGFpbE1hYyhzZXNzaW9uS2V5cy5jbWFjLnRvU3RyaW5nKFwiaGV4XCIpLCBleHRlcm5hbEF1dGhlbnRpY2F0ZSwgXCIwMDAwMDAwMDAwMDAwMDAwXCIpXHJcbiAgICAgICAgZXh0ZXJuYWxBdXRoZW50aWNhdGUgKz0gZWFTaWduYXR1cmUudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBleHRlcm5hbEF1dGhlbnRpY2F0ZVJlc3BvbnNlID0gYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoZXh0ZXJuYWxBdXRoZW50aWNhdGUpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSksIGB1bmV4cGVjdGVkIGF1dGggcmVzcG9uc2UgJHtTVyhleHRlcm5hbEF1dGhlbnRpY2F0ZVJlc3BvbnNlKS50b1N0cmluZygxNil9YClcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9jb25uZWN0ZWQgPSB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHBhcnNlU3RhdHVzUmVzcG9uc2UocmVzcG9uc2U6QnVmZmVyKSB7XHJcbiAgICAgICAgbGV0IG1vZGUgPSAwXHJcbiAgICAgICAgbGV0IHJlYWQgPSAwXHJcbiAgICAgICAgbGV0IG91dHB1dDphbnlbXSA9IFtdXHJcbiAgICAgICAgcmVzcG9uc2UuZm9yRWFjaCgoZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHthaWQ6W119KVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQgPSBlXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV0uYWlkLnB1c2goZSkgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZC0tXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWQgPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGUgPSAyXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gM1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDRcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlID09PSAxNDQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGUgPSA1XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHthaWQ6W119KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gMVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBvdXRwdXRcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRQYWNrYWdlcygpIHtcclxuICAgICAgICBDSEVDSyh0aGlzLl9jb25uZWN0ZWQsIFwibm90IGNvbm5lY3RlZFwiKVxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlU3RhdHVzUmVzcG9uc2UoYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoXCI4MGYyMjAwMDAyNGYwMFwiKSlcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRBcHBsZXRzKCkge1xyXG4gICAgICAgIENIRUNLKHRoaXMuX2Nvbm5lY3RlZCwgXCJub3QgY29ubmVjdGVkXCIpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VTdGF0dXNSZXNwb25zZShhd2FpdCB0aGlzLmlzc3VlQ29tbWFuZFN0cihcIjgwZjI0MDAwMDI0ZjAwXCIpKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGRlbGV0ZVBhY2thZ2Uoc3RhdHVzOnthaWQ6QnVmZmVyIHwgVWludDhBcnJheX0pIHtcclxuICAgICAgICBjb25zdCBoZXhCeXRlID0gKHg6bnVtYmVyKSA9PiBCdWZmZXIuZnJvbShbeF0pLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoYDgwZTQwMDgwJHtoZXhCeXRlKHN0YXR1cy5haWQubGVuZ3RoICsgMil9NGYke2hleEJ5dGUoc3RhdHVzLmFpZC5sZW5ndGgpfSR7QnVmZmVyLmZyb20oc3RhdHVzLmFpZCkudG9TdHJpbmcoXCJoZXhcIil9MDBgKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHVuemlwQ2FwKHpkYXRhOkpTWmlwKTpQcm9taXNlPHttb2R1bGU6c3RyaW5nLCBkYXRhOkJ1ZmZlciwgaTpudW1iZXJ9W10+IHtcclxuICAgICAgICBjb25zdCBtb2R1bGVOYW1lcyA9IFtcIkhlYWRlclwiLCBcIkRpcmVjdG9yeVwiLCBcIkltcG9ydFwiLCBcIkFwcGxldFwiLCBcIkNsYXNzXCIsIFwiTWV0aG9kXCIsIFwiU3RhdGljRmllbGRcIiwgXCJFeHBvcnRcIiwgXCJDb25zdGFudFBvb2xcIiwgXCJSZWZMb2NhdGlvblwiXVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IG1vZCBvZiBtb2R1bGVOYW1lcykge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IHpkYXRhLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoYCR7bW9kfS5jYXBgKSlcclxuICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG1vZHVsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBtb2QsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogYXdhaXQgZmlsZXNbMF0uYXN5bmMoXCJub2RlYnVmZmVyXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGk6IG1vZHVsZXMubGVuZ3RoXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbW9kdWxlc1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGluc3RhbGxBdXRvKHpkYXRhOkpTWmlwKTpQcm9taXNlPEJ1ZmZlcj4ge1xyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBhd2FpdCB0aGlzLnVuemlwQ2FwKHpkYXRhKVxyXG4gICAgICAgIGNvbnN0IGNhcGFpZCA9IG1vZHVsZXMuZmluZCgobSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpIS5kYXRhLnNsaWNlKDEzLCAxMyArIG1vZHVsZXMuZmluZCgobSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpIS5kYXRhWzEyXSlcclxuICAgICAgICBjb25zdCBhcHBhaWQgPSBtb2R1bGVzLmZpbmQoKG0pID0+IG0ubW9kdWxlID09PSBcIkFwcGxldFwiKSEuZGF0YS5zbGljZSg1LCA1ICsgbW9kdWxlcy5maW5kKChtKSA9PiBtLm1vZHVsZSA9PT0gXCJBcHBsZXRcIikhLmRhdGFbNF0pXHJcblxyXG4gICAgICAgIGNvbnN0IGxzdyA9IGF3YWl0IHRoaXMuaW5zdGFsbEZvckxvYWQoemRhdGEpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0sobHN3KSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgJHtTVyhsc3cpLnRvU3RyaW5nKDE2KX1gKVxyXG5cclxuICAgICAgICBjb25zdCBpc3cgPSBhd2FpdCB0aGlzLmluc3RhbGxGb3JJbnN0YWxsKGNhcGFpZC50b1N0cmluZyhcImhleFwiKSwgYXBwYWlkLnRvU3RyaW5nKFwiaGV4XCIpKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGlzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1coaXN3KS50b1N0cmluZygxNil9YClcclxuXHJcbiAgICAgICAgcmV0dXJuIGlzd1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGluc3RhbGxGb3JMb2FkKHpkYXRhOkpTWmlwKTpQcm9taXNlPEJ1ZmZlcj4ge1xyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBhd2FpdCB0aGlzLnVuemlwQ2FwKHpkYXRhKVxyXG5cclxuICAgICAgICBjb25zdCBhaWQgPSBtb2R1bGVzLmZpbmQoKG0pID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKSEuZGF0YS5zbGljZSgxMywgMTMgKyBtb2R1bGVzLmZpbmQoKG06YW55KSA9PiBtLm1vZHVsZSA9PT0gXCJIZWFkZXJcIikhLmRhdGFbMTJdKVxyXG5cclxuICAgICAgICBsZXQgYXBkdTpzdHJpbmdbXSA9IFtdXHJcblxyXG4gICAgICAgIC8vIGluc3RhbGxcclxuICAgICAgICBhcGR1LnB1c2goYDgwZTYwMjAwJHsoYWlkLmxlbmd0aCArIDUgKyAyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSl9JHsoYWlkLmxlbmd0aCArIDI1NikudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKX0ke2FpZC50b1N0cmluZyhcImhleFwiKX0wMDAwMDAwMDAxYClcclxuXHJcbiAgICAgICAgLy8gbG9hZCBsb29wXHJcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9Qcm90b2NvbHMvSFRUUC1ORy9hc24xLmh0bWwgZm9yIEFTTi4xL1RMViBpbmZvXHJcbiAgICAgICAgbGV0IGNvbnRpZyA9IEJ1ZmZlci5jb25jYXQobW9kdWxlcy5tYXAobSA9PiBtLmRhdGEpKVxyXG4gICAgICAgIGNvbnN0IGJsb2NrID0gMHhmYSAgICAgICAgXHJcbiAgICAgICAgaWYgKGNvbnRpZy5sZW5ndGggPCAxMjgpIHtcclxuICAgICAgICAgICAgYXBkdS5wdXNoKGA4MGU4MDAwMGM0JHtCdWZmZXIuZnJvbShbY29udGlnLmxlbmd0aF0pLnRvU3RyaW5nKFwiaGV4XCIpfSR7Y29udGlnLnRvU3RyaW5nKFwiaGV4XCIpfWApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBCdWZmZXIuZnJvbShbYXBkdS5sZW5ndGggLSAxLCBibG9ja10pLnRvU3RyaW5nKFwiaGV4XCIpIC8vID9cclxuICAgICAgICAgICAgYXBkdS5wdXNoKGA4MGU4MDAke0J1ZmZlci5mcm9tKFthcGR1Lmxlbmd0aCAtIDEsIE1hdGgubWluKGJsb2NrLCBjb250aWcubGVuZ3RoKSArIDRdKS50b1N0cmluZyhcImhleFwiKX1jNDgyJHtCdWZmZXIuZnJvbShbY29udGlnLmxlbmd0aCA+PiA4LCBjb250aWcubGVuZ3RoXSkudG9TdHJpbmcoXCJoZXhcIil9JHtjb250aWcuc2xpY2UoMCwgYmxvY2spLnRvU3RyaW5nKFwiaGV4XCIpfWApXHJcbiAgICAgICAgICAgIGNvbnRpZyA9IGNvbnRpZy5zbGljZShibG9jaylcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKGNvbnRpZy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgYXBkdS5wdXNoKGA4MGU4JHtjb250aWcubGVuZ3RoID4gYmxvY2sgPyBcIjAwXCIgOiBcIjgwXCJ9JHtCdWZmZXIuZnJvbShbYXBkdS5sZW5ndGggLSAxLCBNYXRoLm1pbihibG9jaywgY29udGlnLmxlbmd0aCldKS50b1N0cmluZyhcImhleFwiKX0ke2NvbnRpZy5zbGljZSgwLCBibG9jaykudG9TdHJpbmcoXCJoZXhcIil9YClcclxuICAgICAgICAgICAgY29udGlnID0gY29udGlnLnNsaWNlKGJsb2NrKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3cgPSBCdWZmZXIuZnJvbShbMF0pXHJcbiAgICAgICAgZm9yIChsZXQgY21kIG9mIGFwZHUpIHtcclxuICAgICAgICAgICAgc3cgPSBhd2FpdCB0aGlzLmlzc3VlQ29tbWFuZFN0cihjbWQpXHJcbiAgICAgICAgICAgIENIRUNLKFNXX09LKHN3KSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgJHtTVyhzdykudG9TdHJpbmcoMTYpfSBmb3IgJHtjbWR9YClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN3XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW5zdGFsbEZvckluc3RhbGwoY2FwYWlkOnN0cmluZywgbW9kYWlkOnN0cmluZyk6UHJvbWlzZTxCdWZmZXI+IHtcclxuICAgICAgICAvLyBzZWUgc3BlYyAyLjEuMSA5LjUuMi4zLjEgZm9yIGRhdGFcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAxIGxlbiBsb2FkIGZpbGUgYWlkXHJcbiAgICAgICAgICogNS0xNlxyXG4gICAgICAgICAqIDEgbW9kdWxlIGFpZFxyXG4gICAgICAgICAqIDUtMTZcclxuICAgICAgICAgKiAxIGFwcCBhaWRcclxuICAgICAgICAgKiA1LTE2XHJcbiAgICAgICAgICogMSBsZW4gcHJpdnNcclxuICAgICAgICAgKiAxIHByaXZzXHJcbiAgICAgICAgICogMSBsZW4gcGFyYW1zXHJcbiAgICAgICAgICogMi1uIHBhcmFtc1xyXG4gICAgICAgICAqIDEgbGVuIHRva2VuXHJcbiAgICAgICAgICogMC1uIHRva2VuXHJcbiAgICAgICAgICogMDUgXHJcbiAgICAgICAgICogRDIgNzYgMDAgMDAgODVcclxuICAgICAgICAgKiAwN1xyXG4gICAgICAgICAqIEQyIDc2IDAwIDAwIDg1IDAxIDAxXHJcbiAgICAgICAgICogMDdcclxuICAgICAgICAgKiBEMiA3NiAwMCAwMCA4NSAwMSAwMVxyXG4gICAgICAgICAqIDAxXHJcbiAgICAgICAgICogMDAgXHJcbiAgICAgICAgICogMDIgXHJcbiAgICAgICAgICogQzkgMDAgKFRMVilcclxuICAgICAgICAgKiAwMFxyXG4gICAgICAgICAqIDAwXHJcbiAgICAgICAgICogICovXHJcbiAgICAgICAgbGV0IGluc3RhaWQgPSBtb2RhaWRcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBcIlwiXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbY2FwYWlkLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke2NhcGFpZH1gXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbbW9kYWlkLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke21vZGFpZH1gXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbaW5zdGFpZC5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHtpbnN0YWlkfWBcclxuICAgICAgICBkYXRhICs9IFwiMDEwMFwiIC8vIHByaXZzXHJcbiAgICAgICAgZGF0YSArPSBcIjAyYzkwMFwiIC8vIHBhcmFtc1xyXG4gICAgICAgIGRhdGEgKz0gXCIwMFwiIC8vIHRva2VuXHJcblxyXG4gICAgICAgIGNvbnN0IGFwZHUgPSBgODBlNjBjMDAke0J1ZmZlci5mcm9tKFtkYXRhLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke2RhdGF9MDBgXHJcblxyXG4gICAgICAgIGNvbnN0IHN3ID0gYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoYXBkdSlcclxuICAgICAgICBDSEVDSyhTV19PSyhzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1coc3cpLnRvU3RyaW5nKDE2KX0gZm9yICR7YXBkdX1gKVxyXG5cclxuICAgICAgICByZXR1cm4gc3dcclxuICAgIH1cclxufVxyXG4iXX0=