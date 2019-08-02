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
        this.issueCommandStr = function (command) { return _this.issueCommand(Buffer.from(command, "hex")); };
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
                            cmac: CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from("0101" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sMacKey, "hex")).slice(0, 16),
                            rmac: CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from("0102" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sMacKey, "hex")).slice(0, 16),
                            dek: CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from("0181" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.sEncKey, "hex")).slice(0, 16),
                            enc: CardCrypto_1.CardCrypto.tripleDesCbc(Buffer.from("0182" + sequence + "000000000000000000000000", "hex"), Buffer.from(this.dekKey, "hex")).slice(0, 16)
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
            var statusResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Utils_1.CHECK(this._connected, "not connected");
                        return [4 /*yield*/, this.issueCommandStr("80f22000024f00")];
                    case 1:
                        statusResponse = _a.sent();
                        if (Utils_1.SW(statusResponse) == 0x6a88) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, this.parseStatusResponse(statusResponse)];
                }
            });
        });
    };
    GlobalPlatform.prototype.getApplets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statusResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Utils_1.CHECK(this._connected, "not connected");
                        return [4 /*yield*/, this.issueCommandStr("80f24000024f00")];
                    case 1:
                        statusResponse = _a.sent();
                        if (Utils_1.SW(statusResponse) == 0x6a88) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/, this.parseStatusResponse(statusResponse)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvR2xvYmFsUGxhdGZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFvQztBQUNwQywyQ0FBeUM7QUFFekMsaUNBQTBDO0FBSTFDO0lBY0k7O09BRUc7SUFDSCx3QkFBWSxrQkFBc0QsRUFBRSxJQUF1RjtRQUEzSixpQkFTQztRQXRCUSxvQkFBZSxHQUFHLFVBQUMsT0FBYyxJQUFLLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUE5QyxDQUE4QyxDQUFBO1FBRTdGLG1CQUFjLEdBQUcsa0NBQWtDLENBQUE7UUFDbkQseUJBQW9CLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLFlBQU8sR0FBRyxFQUFFLENBQUE7UUFDWixZQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ1osV0FBTSxHQUFHLEVBQUUsQ0FBQTtRQUVILGVBQVUsR0FBRyxLQUFLLENBQUE7UUFNdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBa0IsQ0FBQTtRQUN0QyxJQUFJLElBQUksRUFBRTtZQUNOLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQzVCO1FBQ0QsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFBO1FBQzVFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUE7UUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtRQUN4RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFBO0lBQzFELENBQUM7SUFFRDs7T0FFRztJQUNHLGdDQUFPLEdBQWI7Ozs7Ozt3QkFDSSxhQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHNEQUFzRCxDQUFDLENBQUE7d0JBR3pFLGFBQWEsR0FBRyxvQkFBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTt3QkFHM0IscUJBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsRUFBQTs7d0JBQTNELGdCQUFnQixHQUFHLFNBQXdDO3dCQUNqRSxhQUFLLENBQUMsYUFBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsZ0JBQWMsVUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDLENBQUE7d0JBR3RELHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxHQUFHLGFBQWEsR0FBRyxJQUFJLENBQUMsRUFBQTs7d0JBQXBGLGtCQUFrQixHQUFHLFNBQStEO3dCQUMxRixhQUFLLENBQUMsYUFBSyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsZ0JBQWMsVUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDLENBQUE7d0JBQ25GLGFBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFLGdDQUFnQyxDQUFDLENBQUE7d0JBRW5FLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTt3QkFDM0QsV0FBVyxHQUFHOzRCQUNoQixJQUFJLEVBQUksdUJBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxHQUFHLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUNsSixJQUFJLEVBQUksdUJBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxHQUFHLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUNsSixHQUFHLEVBQUssdUJBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxHQUFHLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUNsSixHQUFHLEVBQUssdUJBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxHQUFHLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO3lCQUNwSixDQUFBO3dCQUVLLGFBQWEsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTt3QkFDaEUsWUFBWSxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO3dCQUMvRCxRQUFRLEdBQUcsdUJBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxHQUFHLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTt3QkFDekosUUFBUSxHQUFHLHVCQUFVLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsR0FBRyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQy9KLGFBQUssQ0FBQyxZQUFZLEtBQUssUUFBUSxFQUFFLHdCQUF3QixDQUFDLENBQUE7d0JBRXRELG9CQUFvQixHQUFHLFlBQVksR0FBRyxRQUFRLENBQUE7d0JBQzVDLFdBQVcsR0FBRyx1QkFBVSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO3dCQUN2SCxvQkFBb0IsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO3dCQUNkLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsRUFBQTs7d0JBQS9FLDRCQUE0QixHQUFHLFNBQWdEO3dCQUNyRixhQUFLLENBQUMsYUFBSyxDQUFDLDRCQUE0QixDQUFDLEVBQUUsOEJBQTRCLFVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUcsQ0FBQyxDQUFBO3dCQUV2SCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTs7Ozs7S0FDekI7SUFFRCw0Q0FBbUIsR0FBbkIsVUFBb0IsUUFBZTtRQUMvQixJQUFJLElBQUksR0FBRyxDQUFDLENBQUE7UUFDWixJQUFJLElBQUksR0FBRyxDQUFDLENBQUE7UUFDWixJQUFJLE1BQU0sR0FBUyxFQUFFLENBQUE7UUFDckIsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQU07WUFDcEIsUUFBUSxJQUFJLEVBQUU7Z0JBQ1YsS0FBSyxDQUFDO29CQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQTtvQkFDckIsSUFBSSxHQUFHLENBQUMsQ0FBQTtvQkFDUixJQUFJLEdBQUcsQ0FBQyxDQUFBO29CQUNSLE1BQUs7Z0JBQ1QsS0FBSyxDQUFDO29CQUNGLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ3JDLElBQUksRUFBRSxDQUFBO29CQUNOLElBQUksSUFBSSxLQUFLLENBQUM7d0JBQ1YsSUFBSSxHQUFHLENBQUMsQ0FBQTtvQkFDWixNQUFLO2dCQUNULEtBQUssQ0FBQztvQkFDRixJQUFJLEdBQUcsQ0FBQyxDQUFBO29CQUNSLE1BQUs7Z0JBQ1QsS0FBSyxDQUFDO29CQUNGLElBQUksR0FBRyxDQUFDLENBQUE7b0JBQ1IsTUFBSztnQkFDVCxLQUFLLENBQUM7b0JBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRzt3QkFDVCxJQUFJLEdBQUcsQ0FBQyxDQUFBO3lCQUNQO3dCQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQTt3QkFDckIsSUFBSSxHQUFHLENBQUMsQ0FBQTt3QkFDUixJQUFJLEdBQUcsQ0FBQyxDQUFBO3FCQUNYO29CQUNELE1BQUs7Z0JBQ1QsS0FBSyxDQUFDO29CQUNGLE1BQUs7YUFDWjtRQUNMLENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQztJQUVLLG9DQUFXLEdBQWpCOzs7Ozs7d0JBQ0ksYUFBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUE7d0JBQ2hCLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsRUFBQTs7d0JBQTdELGNBQWMsR0FBRyxTQUE0Qzt3QkFDbkUsSUFBSSxVQUFFLENBQUMsY0FBYyxDQUFDLElBQUksTUFBTSxFQUFFOzRCQUM5QixzQkFBTyxFQUFFLEVBQUE7eUJBQ1o7d0JBQ0Qsc0JBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxFQUFBOzs7O0tBQ2xEO0lBRUssbUNBQVUsR0FBaEI7Ozs7Ozt3QkFDSSxhQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQTt3QkFDaEIscUJBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFBOzt3QkFBN0QsY0FBYyxHQUFHLFNBQTRDO3dCQUNuRSxJQUFJLFVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxNQUFNLEVBQUU7NEJBQzlCLHNCQUFPLEVBQUUsRUFBQTt5QkFDWjt3QkFDRCxzQkFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLEVBQUE7Ozs7S0FDbEQ7SUFFSyxzQ0FBYSxHQUFuQixVQUFvQixNQUFnQzs7OztnQkFDMUMsT0FBTyxHQUFHLFVBQUMsQ0FBUSxJQUFLLE9BQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFoQyxDQUFnQyxDQUFBO2dCQUM5RCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQVcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxVQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBSSxDQUFDLENBQUE7Ozs7S0FDL0k7SUFFSyxpQ0FBUSxHQUFkLFVBQWUsS0FBVzs7Ozs7O3dCQUNoQixXQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQTt3QkFFcEksT0FBTyxHQUFHLEVBQUUsQ0FBQTs0Q0FDVCxHQUFHOzs7Ozt3Q0FDRixLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLENBQUksR0FBRyxTQUFNLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFBOzZDQUNyRCxDQUFBLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBLEVBQWhCLHdCQUFnQjt3Q0FDaEIsS0FBQSxDQUFBLEtBQUEsT0FBTyxDQUFBLENBQUMsSUFBSSxDQUFBOzs0Q0FDUixNQUFNLEVBQUUsR0FBRzs7d0NBQ0wscUJBQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBQTs7d0NBRjVDLGVBRUksT0FBSSxHQUFFLFNBQWtDO2dEQUN4QyxJQUFDLEdBQUUsT0FBTyxDQUFDLE1BQU07cURBQ25CLENBQUE7Ozs7Ozs4QkFQaUIsRUFBWCwyQkFBVzs7OzZCQUFYLENBQUEseUJBQVcsQ0FBQTt3QkFBbEIsR0FBRztzREFBSCxHQUFHOzs7Ozt3QkFBSSxJQUFXLENBQUE7OzRCQVczQixzQkFBTyxPQUFPLEVBQUE7Ozs7S0FDakI7SUFFSyxvQ0FBVyxHQUFqQixVQUFrQixLQUFXOzs7Ozs0QkFDVCxxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFBOzt3QkFBcEMsT0FBTyxHQUFHLFNBQTBCO3dCQUNwQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFyQixDQUFxQixDQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBckIsQ0FBcUIsQ0FBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO3dCQUM5SCxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFyQixDQUFxQixDQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFBckIsQ0FBcUIsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO3dCQUVySCxxQkFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFBOzt3QkFBdEMsR0FBRyxHQUFHLFNBQWdDO3dCQUM1QyxhQUFLLENBQUMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLHlCQUF1QixVQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDLENBQUE7d0JBRXBELHFCQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQTs7d0JBQWxGLEdBQUcsR0FBRyxTQUE0RTt3QkFDeEYsYUFBSyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSx5QkFBdUIsVUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUcsQ0FBQyxDQUFBO3dCQUVoRSxzQkFBTyxHQUFHLEVBQUE7Ozs7S0FDYjtJQUVLLHVDQUFjLEdBQXBCLFVBQXFCLEtBQVc7Ozs7OzRCQUNaLHFCQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUE7O3dCQUFwQyxPQUFPLEdBQUcsU0FBMEI7d0JBRXBDLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQXJCLENBQXFCLENBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUssSUFBSyxPQUFBLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFyQixDQUFxQixDQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7d0JBRWpJLElBQUksR0FBWSxFQUFFLENBQUE7d0JBRXRCLFVBQVU7d0JBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxlQUFZLENBQUMsQ0FBQTt3QkFJbkosTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLENBQUMsQ0FBQTt3QkFDOUMsS0FBSyxHQUFHLElBQUksQ0FBQTt3QkFDbEIsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTs0QkFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUcsQ0FBQyxDQUFBO3lCQUNsRzs2QkFDSTs0QkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUEsQ0FBQyxJQUFJOzRCQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUcsQ0FBQyxDQUFBOzRCQUN4TixNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTt5QkFDL0I7d0JBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxFQUFFOzRCQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQU8sTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFHLENBQUMsQ0FBQTs0QkFDakwsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7eUJBQy9CO3dCQUVHLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTs4QkFDTCxFQUFKLGFBQUk7Ozs2QkFBSixDQUFBLGtCQUFJLENBQUE7d0JBQVgsR0FBRzt3QkFDSCxxQkFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFBOzt3QkFBcEMsRUFBRSxHQUFHLFNBQStCLENBQUE7d0JBQ3BDLGFBQUssQ0FBQyxhQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUseUJBQXVCLFVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQVEsR0FBSyxDQUFDLENBQUE7Ozt3QkFGN0QsSUFBSSxDQUFBOzs0QkFJcEIsc0JBQU8sRUFBRSxFQUFBOzs7O0tBQ1o7SUFFSywwQ0FBaUIsR0FBdkIsVUFBd0IsTUFBYSxFQUFFLE1BQWE7Ozs7Ozt3QkE0QjVDLE9BQU8sR0FBRyxNQUFNLENBQUE7d0JBRWhCLElBQUksR0FBRyxFQUFFLENBQUE7d0JBQ2IsSUFBSSxJQUFJLEtBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBUSxDQUFBO3dCQUN0RSxJQUFJLElBQUksS0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFRLENBQUE7d0JBQ3RFLElBQUksSUFBSSxLQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQVMsQ0FBQTt3QkFDeEUsSUFBSSxJQUFJLE1BQU0sQ0FBQSxDQUFDLFFBQVE7d0JBQ3ZCLElBQUksSUFBSSxRQUFRLENBQUEsQ0FBQyxTQUFTO3dCQUMxQixJQUFJLElBQUksSUFBSSxDQUFBLENBQUMsUUFBUTt3QkFFZixJQUFJLEdBQUcsYUFBVyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLE9BQUksQ0FBQTt3QkFFdEUscUJBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBQTs7d0JBQXJDLEVBQUUsR0FBRyxTQUFnQzt3QkFDM0MsYUFBSyxDQUFDLGFBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSx5QkFBdUIsVUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsYUFBUSxJQUFNLENBQUMsQ0FBQTt3QkFFMUUsc0JBQU8sRUFBRSxFQUFBOzs7O0tBQ1o7SUFDTCxxQkFBQztBQUFELENBQUMsQUFuUEQsSUFtUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gXCJjcnlwdG9cIlxyXG5pbXBvcnQgeyBDYXJkQ3J5cHRvIH0gZnJvbSBcIi4vQ2FyZENyeXB0b1wiXHJcbmltcG9ydCBJQXBwbGljYXRpb24gZnJvbSBcIi4vSUFwcGxpY2F0aW9uXCJcclxuaW1wb3J0IHsgQ0hFQ0ssIFNXX09LLCBTVyB9IGZyb20gXCIuL1V0aWxzXCJcclxuaW1wb3J0IEpTWmlwLCB7IEpTWmlwT2JqZWN0IH0gZnJvbSBcImpzemlwXCJcclxuaW1wb3J0IHsgU3RyZWFtIH0gZnJvbSBcInN0cmVhbVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2xvYmFsUGxhdGZvcm0gaW1wbGVtZW50cyBJQXBwbGljYXRpb24ge1xyXG5cclxuICAgIC8vIFRPRE86IGZvcmsgc21hcnRjYXJkIGFuZCBwb3J0IHRvIFRTXHJcbiAgICBpc3N1ZUNvbW1hbmQhOiAoY29tbWFuZDpCdWZmZXIpID0+IFByb21pc2U8QnVmZmVyPlxyXG4gICAgcmVhZG9ubHkgaXNzdWVDb21tYW5kU3RyID0gKGNvbW1hbmQ6c3RyaW5nKSA9PiB0aGlzLmlzc3VlQ29tbWFuZChCdWZmZXIuZnJvbShjb21tYW5kLCBcImhleFwiKSlcclxuXHJcbiAgICBEZWZhdWx0QXV0aEtleSA9IFwiNDA0MTQyNDM0NDQ1NDY0NzQ4NDk0YTRiNGM0ZDRlNGZcIlxyXG4gICAgc2VjdXJlQ2hhbm5lbEJhc2VLZXkgPSBcIlwiXHJcbiAgICBzTWFjS2V5ID0gXCJcIlxyXG4gICAgc0VuY0tleSA9IFwiXCJcclxuICAgIGRla0tleSA9IFwiXCJcclxuXHJcbiAgICBwcml2YXRlIF9jb25uZWN0ZWQgPSBmYWxzZVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IodHJhbnNjZWl2ZUZ1bmN0aW9uOihjb21tYW5kOkJ1ZmZlcikgPT4gUHJvbWlzZTxCdWZmZXI+LCBrZXlzPzp7IHNlY3VyZUNoYW5uZWxCYXNlS2V5PzpzdHJpbmcsIHNNYWNLZXk/OnN0cmluZywgc0VuY0tleTpzdHJpbmcsIGRla0tleT86c3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmlzc3VlQ29tbWFuZCA9IHRyYW5zY2VpdmVGdW5jdGlvblxyXG4gICAgICAgIGlmIChrZXlzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywga2V5cylcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleSA9IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXkgfHwgdGhpcy5EZWZhdWx0QXV0aEtleVxyXG4gICAgICAgIHRoaXMuc01hY0tleSA9IHRoaXMuc01hY0tleSB8fCB0aGlzLnNlY3VyZUNoYW5uZWxCYXNlS2V5XHJcbiAgICAgICAgdGhpcy5zRW5jS2V5ID0gdGhpcy5zRW5jS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgICAgICB0aGlzLmRla0tleSA9IHRoaXMuZGVrS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbm5lY3RzIHRvIHRoZSBwcmVzZW50IGRldmljZSBhbmQgZXhlY3V0ZXMgdGhlIElOSVRJQUxJWkUgVVBEQVRFIGNvbW1hbmRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29ubmVjdCgpIHtcclxuICAgICAgICBDSEVDSyghdGhpcy5fY29ubmVjdGVkLCBcImFscmVhZHkgY29ubmVjdGVkIGFuZCBJTklUSUFMSVpFIHN0YXRlIHVucmVjb3ZlcmFibGVcIilcclxuXHJcbiAgICAgICAgLy8gc2V0dXBcclxuICAgICAgICBjb25zdCBob3N0Q2hhbGxlbmdlID0gcmFuZG9tQnl0ZXMoOCkudG9TdHJpbmcoXCJoZXhcIilcclxuXHJcbiAgICAgICAgLy8gMS4gc2VsZWN0IGdwXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0R3BSZXNwb25zZSA9IGF3YWl0IHRoaXMuaXNzdWVDb21tYW5kU3RyKFwiMDBhNDA0MDAwMFwiKVxyXG4gICAgICAgIENIRUNLKFNXX09LKHNlbGVjdEdwUmVzcG9uc2UpLCBgdW5leHBlY3RlZCAke1NXKHNlbGVjdEdwUmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIDIuIGluaXRpYWxpemUgdXBkYXRlXHJcbiAgICAgICAgY29uc3QgaW5pdFVwZGF0ZVJlc3BvbnNlID0gYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoXCI4MDUwMDAwMDA4XCIgKyBob3N0Q2hhbGxlbmdlICsgXCIyOFwiKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGluaXRVcGRhdGVSZXNwb25zZSksIGB1bmV4cGVjdGVkICR7U1coc2VsZWN0R3BSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgQ0hFQ0soaW5pdFVwZGF0ZVJlc3BvbnNlLmxlbmd0aCA9PT0gMzAsIGBpbml0IHJlc3BvbnNlIGxlbmd0aCBpbmNvcnJlY3RgKVxyXG5cclxuICAgICAgICBjb25zdCBzZXF1ZW5jZSA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgxMiwgMTQpLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3Qgc2Vzc2lvbktleXMgPSB7XHJcbiAgICAgICAgICAgIGNtYWM6ICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTAxXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNNYWNLZXksIFwiaGV4XCIpKS5zbGljZSgwLCAxNiksXHJcbiAgICAgICAgICAgIHJtYWM6ICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTAyXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNNYWNLZXksIFwiaGV4XCIpKS5zbGljZSgwLCAxNiksXHJcbiAgICAgICAgICAgIGRlazogICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTgxXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNFbmNLZXksIFwiaGV4XCIpKS5zbGljZSgwLCAxNiksXHJcbiAgICAgICAgICAgIGVuYzogICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTgyXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLmRla0tleSwgXCJoZXhcIikpLnNsaWNlKDAsIDE2KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY2FyZENoYWxsZW5nZSA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgxMiwgMjApLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgY2FyZEV4cGVjdGVkID0gaW5pdFVwZGF0ZVJlc3BvbnNlLnNsaWNlKDIwLCAyOCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBjYXJkQ2FsYyA9IENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKGhvc3RDaGFsbGVuZ2UgKyBjYXJkQ2hhbGxlbmdlICsgXCI4MDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBzZXNzaW9uS2V5cy5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBob3N0Q2FsYyA9IENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKGNhcmRDaGFsbGVuZ2UgKyBob3N0Q2hhbGxlbmdlICsgXCI4MDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBzZXNzaW9uS2V5cy5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBDSEVDSyhjYXJkRXhwZWN0ZWQgPT09IGNhcmRDYWxjLCBgY2FyZCBjcnlwdG9ncmFtIGZhaWxlZGApXHJcblxyXG4gICAgICAgIGxldCBleHRlcm5hbEF1dGhlbnRpY2F0ZSA9IFwiODQ4MjAwMDAxMFwiICsgaG9zdENhbGNcclxuICAgICAgICBjb25zdCBlYVNpZ25hdHVyZSA9IENhcmRDcnlwdG8uZ2V0UmV0YWlsTWFjKHNlc3Npb25LZXlzLmNtYWMudG9TdHJpbmcoXCJoZXhcIiksIGV4dGVybmFsQXV0aGVudGljYXRlLCBcIjAwMDAwMDAwMDAwMDAwMDBcIilcclxuICAgICAgICBleHRlcm5hbEF1dGhlbnRpY2F0ZSArPSBlYVNpZ25hdHVyZS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmlzc3VlQ29tbWFuZFN0cihleHRlcm5hbEF1dGhlbnRpY2F0ZSlcclxuICAgICAgICBDSEVDSyhTV19PSyhleHRlcm5hbEF1dGhlbnRpY2F0ZVJlc3BvbnNlKSwgYHVuZXhwZWN0ZWQgYXV0aCByZXNwb25zZSAke1NXKGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2Nvbm5lY3RlZCA9IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgcGFyc2VTdGF0dXNSZXNwb25zZShyZXNwb25zZTpCdWZmZXIpIHtcclxuICAgICAgICBsZXQgbW9kZSA9IDBcclxuICAgICAgICBsZXQgcmVhZCA9IDBcclxuICAgICAgICBsZXQgb3V0cHV0OmFueVtdID0gW11cclxuICAgICAgICByZXNwb25zZS5mb3JFYWNoKChlOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgc3dpdGNoIChtb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goe2FpZDpbXX0pXHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZCA9IGVcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gMVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0W291dHB1dC5sZW5ndGggLSAxXS5haWQucHVzaChlKSAgICBcclxuICAgICAgICAgICAgICAgICAgICByZWFkLS1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVhZCA9PT0gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDJcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSAzXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gNFxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUgPT09IDE0NClcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDVcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goe2FpZDpbXX0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWQgPSBlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGUgPSAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gIFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIG91dHB1dFxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldFBhY2thZ2VzKCkge1xyXG4gICAgICAgIENIRUNLKHRoaXMuX2Nvbm5lY3RlZCwgXCJub3QgY29ubmVjdGVkXCIpXHJcbiAgICAgICAgY29uc3Qgc3RhdHVzUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmlzc3VlQ29tbWFuZFN0cihcIjgwZjIyMDAwMDI0ZjAwXCIpXHJcbiAgICAgICAgaWYgKFNXKHN0YXR1c1Jlc3BvbnNlKSA9PSAweDZhODgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlU3RhdHVzUmVzcG9uc2Uoc3RhdHVzUmVzcG9uc2UpXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0QXBwbGV0cygpIHtcclxuICAgICAgICBDSEVDSyh0aGlzLl9jb25uZWN0ZWQsIFwibm90IGNvbm5lY3RlZFwiKVxyXG4gICAgICAgIGNvbnN0IHN0YXR1c1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoXCI4MGYyNDAwMDAyNGYwMFwiKVxyXG4gICAgICAgIGlmIChTVyhzdGF0dXNSZXNwb25zZSkgPT0gMHg2YTg4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXR1c1Jlc3BvbnNlKHN0YXR1c1Jlc3BvbnNlKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGRlbGV0ZVBhY2thZ2Uoc3RhdHVzOnthaWQ6QnVmZmVyIHwgVWludDhBcnJheX0pIHtcclxuICAgICAgICBjb25zdCBoZXhCeXRlID0gKHg6bnVtYmVyKSA9PiBCdWZmZXIuZnJvbShbeF0pLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoYDgwZTQwMDgwJHtoZXhCeXRlKHN0YXR1cy5haWQubGVuZ3RoICsgMil9NGYke2hleEJ5dGUoc3RhdHVzLmFpZC5sZW5ndGgpfSR7QnVmZmVyLmZyb20oc3RhdHVzLmFpZCkudG9TdHJpbmcoXCJoZXhcIil9MDBgKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHVuemlwQ2FwKHpkYXRhOkpTWmlwKTpQcm9taXNlPHttb2R1bGU6c3RyaW5nLCBkYXRhOkJ1ZmZlciwgaTpudW1iZXJ9W10+IHtcclxuICAgICAgICBjb25zdCBtb2R1bGVOYW1lcyA9IFtcIkhlYWRlclwiLCBcIkRpcmVjdG9yeVwiLCBcIkltcG9ydFwiLCBcIkFwcGxldFwiLCBcIkNsYXNzXCIsIFwiTWV0aG9kXCIsIFwiU3RhdGljRmllbGRcIiwgXCJFeHBvcnRcIiwgXCJDb25zdGFudFBvb2xcIiwgXCJSZWZMb2NhdGlvblwiXVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IG1vZCBvZiBtb2R1bGVOYW1lcykge1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlcyA9IHpkYXRhLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoYCR7bW9kfS5jYXBgKSlcclxuICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG1vZHVsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBtb2QsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogYXdhaXQgZmlsZXNbMF0uYXN5bmMoXCJub2RlYnVmZmVyXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGk6IG1vZHVsZXMubGVuZ3RoXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbW9kdWxlc1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGluc3RhbGxBdXRvKHpkYXRhOkpTWmlwKTpQcm9taXNlPEJ1ZmZlcj4ge1xyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBhd2FpdCB0aGlzLnVuemlwQ2FwKHpkYXRhKVxyXG4gICAgICAgIGNvbnN0IGNhcGFpZCA9IG1vZHVsZXMuZmluZCgobSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpIS5kYXRhLnNsaWNlKDEzLCAxMyArIG1vZHVsZXMuZmluZCgobSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpIS5kYXRhWzEyXSlcclxuICAgICAgICBjb25zdCBhcHBhaWQgPSBtb2R1bGVzLmZpbmQoKG0pID0+IG0ubW9kdWxlID09PSBcIkFwcGxldFwiKSEuZGF0YS5zbGljZSg1LCA1ICsgbW9kdWxlcy5maW5kKChtKSA9PiBtLm1vZHVsZSA9PT0gXCJBcHBsZXRcIikhLmRhdGFbNF0pXHJcblxyXG4gICAgICAgIGNvbnN0IGxzdyA9IGF3YWl0IHRoaXMuaW5zdGFsbEZvckxvYWQoemRhdGEpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0sobHN3KSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgJHtTVyhsc3cpLnRvU3RyaW5nKDE2KX1gKVxyXG5cclxuICAgICAgICBjb25zdCBpc3cgPSBhd2FpdCB0aGlzLmluc3RhbGxGb3JJbnN0YWxsKGNhcGFpZC50b1N0cmluZyhcImhleFwiKSwgYXBwYWlkLnRvU3RyaW5nKFwiaGV4XCIpKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGlzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1coaXN3KS50b1N0cmluZygxNil9YClcclxuXHJcbiAgICAgICAgcmV0dXJuIGlzd1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGluc3RhbGxGb3JMb2FkKHpkYXRhOkpTWmlwKTpQcm9taXNlPEJ1ZmZlcj4ge1xyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBhd2FpdCB0aGlzLnVuemlwQ2FwKHpkYXRhKVxyXG5cclxuICAgICAgICBjb25zdCBhaWQgPSBtb2R1bGVzLmZpbmQoKG0pID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKSEuZGF0YS5zbGljZSgxMywgMTMgKyBtb2R1bGVzLmZpbmQoKG06YW55KSA9PiBtLm1vZHVsZSA9PT0gXCJIZWFkZXJcIikhLmRhdGFbMTJdKVxyXG5cclxuICAgICAgICBsZXQgYXBkdTpzdHJpbmdbXSA9IFtdXHJcblxyXG4gICAgICAgIC8vIGluc3RhbGxcclxuICAgICAgICBhcGR1LnB1c2goYDgwZTYwMjAwJHsoYWlkLmxlbmd0aCArIDUgKyAyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSl9JHsoYWlkLmxlbmd0aCArIDI1NikudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKX0ke2FpZC50b1N0cmluZyhcImhleFwiKX0wMDAwMDAwMDAxYClcclxuXHJcbiAgICAgICAgLy8gbG9hZCBsb29wXHJcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9Qcm90b2NvbHMvSFRUUC1ORy9hc24xLmh0bWwgZm9yIEFTTi4xL1RMViBpbmZvXHJcbiAgICAgICAgbGV0IGNvbnRpZyA9IEJ1ZmZlci5jb25jYXQobW9kdWxlcy5tYXAobSA9PiBtLmRhdGEpKVxyXG4gICAgICAgIGNvbnN0IGJsb2NrID0gMHhmYSAgICAgICAgXHJcbiAgICAgICAgaWYgKGNvbnRpZy5sZW5ndGggPCAxMjgpIHtcclxuICAgICAgICAgICAgYXBkdS5wdXNoKGA4MGU4MDAwMGM0JHtCdWZmZXIuZnJvbShbY29udGlnLmxlbmd0aF0pLnRvU3RyaW5nKFwiaGV4XCIpfSR7Y29udGlnLnRvU3RyaW5nKFwiaGV4XCIpfWApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBCdWZmZXIuZnJvbShbYXBkdS5sZW5ndGggLSAxLCBibG9ja10pLnRvU3RyaW5nKFwiaGV4XCIpIC8vID9cclxuICAgICAgICAgICAgYXBkdS5wdXNoKGA4MGU4MDAke0J1ZmZlci5mcm9tKFthcGR1Lmxlbmd0aCAtIDEsIE1hdGgubWluKGJsb2NrLCBjb250aWcubGVuZ3RoKSArIDRdKS50b1N0cmluZyhcImhleFwiKX1jNDgyJHtCdWZmZXIuZnJvbShbY29udGlnLmxlbmd0aCA+PiA4LCBjb250aWcubGVuZ3RoXSkudG9TdHJpbmcoXCJoZXhcIil9JHtjb250aWcuc2xpY2UoMCwgYmxvY2spLnRvU3RyaW5nKFwiaGV4XCIpfWApXHJcbiAgICAgICAgICAgIGNvbnRpZyA9IGNvbnRpZy5zbGljZShibG9jaylcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKGNvbnRpZy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgYXBkdS5wdXNoKGA4MGU4JHtjb250aWcubGVuZ3RoID4gYmxvY2sgPyBcIjAwXCIgOiBcIjgwXCJ9JHtCdWZmZXIuZnJvbShbYXBkdS5sZW5ndGggLSAxLCBNYXRoLm1pbihibG9jaywgY29udGlnLmxlbmd0aCldKS50b1N0cmluZyhcImhleFwiKX0ke2NvbnRpZy5zbGljZSgwLCBibG9jaykudG9TdHJpbmcoXCJoZXhcIil9YClcclxuICAgICAgICAgICAgY29udGlnID0gY29udGlnLnNsaWNlKGJsb2NrKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBsZXQgc3cgPSBCdWZmZXIuZnJvbShbMF0pXHJcbiAgICAgICAgZm9yIChsZXQgY21kIG9mIGFwZHUpIHtcclxuICAgICAgICAgICAgc3cgPSBhd2FpdCB0aGlzLmlzc3VlQ29tbWFuZFN0cihjbWQpXHJcbiAgICAgICAgICAgIENIRUNLKFNXX09LKHN3KSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgJHtTVyhzdykudG9TdHJpbmcoMTYpfSBmb3IgJHtjbWR9YClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN3XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgaW5zdGFsbEZvckluc3RhbGwoY2FwYWlkOnN0cmluZywgbW9kYWlkOnN0cmluZyk6UHJvbWlzZTxCdWZmZXI+IHtcclxuICAgICAgICAvLyBzZWUgc3BlYyAyLjEuMSA5LjUuMi4zLjEgZm9yIGRhdGFcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiAxIGxlbiBsb2FkIGZpbGUgYWlkXHJcbiAgICAgICAgICogNS0xNlxyXG4gICAgICAgICAqIDEgbW9kdWxlIGFpZFxyXG4gICAgICAgICAqIDUtMTZcclxuICAgICAgICAgKiAxIGFwcCBhaWRcclxuICAgICAgICAgKiA1LTE2XHJcbiAgICAgICAgICogMSBsZW4gcHJpdnNcclxuICAgICAgICAgKiAxIHByaXZzXHJcbiAgICAgICAgICogMSBsZW4gcGFyYW1zXHJcbiAgICAgICAgICogMi1uIHBhcmFtc1xyXG4gICAgICAgICAqIDEgbGVuIHRva2VuXHJcbiAgICAgICAgICogMC1uIHRva2VuXHJcbiAgICAgICAgICogMDUgXHJcbiAgICAgICAgICogRDIgNzYgMDAgMDAgODVcclxuICAgICAgICAgKiAwN1xyXG4gICAgICAgICAqIEQyIDc2IDAwIDAwIDg1IDAxIDAxXHJcbiAgICAgICAgICogMDdcclxuICAgICAgICAgKiBEMiA3NiAwMCAwMCA4NSAwMSAwMVxyXG4gICAgICAgICAqIDAxXHJcbiAgICAgICAgICogMDAgXHJcbiAgICAgICAgICogMDIgXHJcbiAgICAgICAgICogQzkgMDAgKFRMVilcclxuICAgICAgICAgKiAwMFxyXG4gICAgICAgICAqIDAwXHJcbiAgICAgICAgICogICovXHJcbiAgICAgICAgbGV0IGluc3RhaWQgPSBtb2RhaWRcclxuXHJcbiAgICAgICAgbGV0IGRhdGEgPSBcIlwiXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbY2FwYWlkLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke2NhcGFpZH1gXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbbW9kYWlkLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke21vZGFpZH1gXHJcbiAgICAgICAgZGF0YSArPSBgJHtCdWZmZXIuZnJvbShbaW5zdGFpZC5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHtpbnN0YWlkfWBcclxuICAgICAgICBkYXRhICs9IFwiMDEwMFwiIC8vIHByaXZzXHJcbiAgICAgICAgZGF0YSArPSBcIjAyYzkwMFwiIC8vIHBhcmFtc1xyXG4gICAgICAgIGRhdGEgKz0gXCIwMFwiIC8vIHRva2VuXHJcblxyXG4gICAgICAgIGNvbnN0IGFwZHUgPSBgODBlNjBjMDAke0J1ZmZlci5mcm9tKFtkYXRhLmxlbmd0aCAvIDJdKS50b1N0cmluZyhcImhleFwiKX0ke2RhdGF9MDBgXHJcblxyXG4gICAgICAgIGNvbnN0IHN3ID0gYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoYXBkdSlcclxuICAgICAgICBDSEVDSyhTV19PSyhzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1coc3cpLnRvU3RyaW5nKDE2KX0gZm9yICR7YXBkdX1gKVxyXG5cclxuICAgICAgICByZXR1cm4gc3dcclxuICAgIH1cclxufVxyXG4iXX0=