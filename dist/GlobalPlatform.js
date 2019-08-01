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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvR2xvYmFsUGxhdGZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFvQztBQUNwQywyQ0FBeUM7QUFFekMsaUNBQTBDO0FBSTFDO0lBY0k7O09BRUc7SUFDSCx3QkFBWSxrQkFBc0QsRUFBRSxJQUF1RjtRQUEzSixpQkFTQztRQXRCUSxvQkFBZSxHQUFHLFVBQUMsT0FBYyxJQUFLLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUE5QyxDQUE4QyxDQUFBO1FBRTdGLG1CQUFjLEdBQUcsa0NBQWtDLENBQUE7UUFDbkQseUJBQW9CLEdBQUcsRUFBRSxDQUFBO1FBQ3pCLFlBQU8sR0FBRyxFQUFFLENBQUE7UUFDWixZQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ1osV0FBTSxHQUFHLEVBQUUsQ0FBQTtRQUVILGVBQVUsR0FBRyxLQUFLLENBQUE7UUFNdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBa0IsQ0FBQTtRQUN0QyxJQUFJLElBQUksRUFBRTtZQUNOLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQzVCO1FBQ0QsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFBO1FBQzVFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUE7UUFDeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtRQUN4RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxD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Q1YsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxlQUFZLENBQUMsQ0FBQTt3QkFJbkosTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLENBQUMsQ0FBQTt3QkFDOUMsS0FBSyxHQUFHLElBQUksQ0FBQTt3QkFDbEIsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTs0QkFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUcsQ0FBQyxDQUFBO3lCQUNsRzs2QkFDSTs0QkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUEsQ0FBQyxJQUFJOzRCQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FB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QkFDM0MsYUFBSyxDQUFDLGFBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSx5QkFBdUIsVUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsYUFBUSxJQUFNLENBQUMsQ0FBQTt3QkFFMUUsc0JBQU8sRUFBRSxFQUFBOzs7O0tBQ1o7SUFDTCxxQkFBQztBQUFELENBQUMsQUEzT0QsSUEyT0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gXCJjcnlwdG9cIlxyXG5pbXBvcnQgeyBDYXJkQ3J5cHRvIH0gZnJvbSBcIi4vQ2FyZENyeXB0b1wiXHJcbmltcG9ydCBJQXBwbGljYXRpb24gZnJvbSBcIi4vSUFwcGxpY2F0aW9uXCJcclxuaW1wb3J0IHsgQ0hFQ0ssIFNXX09LLCBTVyB9IGZyb20gXCIuL1V0aWxzXCJcclxuaW1wb3J0IEpTWmlwLCB7IEpTWmlwT2JqZWN0IH0gZnJvbSBcImpzemlwXCJcclxuaW1wb3J0IHsgU3RyZWFtIH0gZnJvbSBcInN0cmVhbVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2xvYmFsUGxhdGZvcm0gaW1wbGVtZW50cyBJQXBwbGljYXRpb24ge1xyXG5cclxuICAgIC8vIFRPRE86IGZvcmsgc21hcnRjYXJkIGFuZCBwb3J0IHRvIFRTXHJcbiAgICBpc3N1ZUNvbW1hbmQhOiAoY29tbWFuZDpCdWZmZXIpID0+IFByb21pc2U8QnVmZmVyPlxyXG4gICAgcmVhZG9ubHkgaXNzdWVDb21tYW5kU3RyID0gKGNvbW1hbmQ6c3RyaW5nKSA9PiB0aGlzLmlzc3VlQ29tbWFuZChCdWZmZXIuZnJvbShjb21tYW5kLCBcImhleFwiKSlcclxuXHJcbiAgICBEZWZhdWx0QXV0aEtleSA9IFwiNDA0MTQyNDM0NDQ1NDY0NzQ4NDk0YTRiNGM0ZDRlNGZcIlxyXG4gICAgc2VjdXJlQ2hhbm5lbEJhc2VLZXkgPSBcIlwiXHJcbiAgICBzTWFjS2V5ID0gXCJcIlxyXG4gICAgc0VuY0tleSA9IFwiXCJcclxuICAgIGRla0tleSA9IFwiXCJcclxuXHJcbiAgICBwcml2YXRlIF9jb25uZWN0ZWQgPSBmYWxzZVxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IodHJhbnNjZWl2ZUZ1bmN0aW9uOihjb21tYW5kOkJ1ZmZlcikgPT4gUHJvbWlzZTxCdWZmZXI+LCBrZXlzPzp7IHNlY3VyZUNoYW5uZWxCYXNlS2V5PzpzdHJpbmcsIHNNYWNLZXk/OnN0cmluZywgc0VuY0tleTpzdHJpbmcsIGRla0tleT86c3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmlzc3VlQ29tbWFuZCA9IHRyYW5zY2VpdmVGdW5jdGlvblxyXG4gICAgICAgIGlmIChrZXlzKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywga2V5cylcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleSA9IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXkgfHwgdGhpcy5EZWZhdWx0QXV0aEtleVxyXG4gICAgICAgIHRoaXMuc01hY0tleSA9IHRoaXMuc01hY0tleSB8fCB0aGlzLnNlY3VyZUNoYW5uZWxCYXNlS2V5XHJcbiAgICAgICAgdGhpcy5zRW5jS2V5ID0gdGhpcy5zRW5jS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgICAgICB0aGlzLmRla0tleSA9IHRoaXMuZGVrS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbm5lY3RzIHRvIHRoZSBwcmVzZW50IGRldmljZSBhbmQgZXhlY3V0ZXMgdGhlIElOSVRJQUxJWkUgVVBEQVRFIGNvbW1hbmRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29ubmVjdCgpIHtcclxuICAgICAgICBDSEVDSyghdGhpcy5fY29ubmVjdGVkLCBcImFscmVhZHkgY29ubmVjdGVkIGFuZCBJTklUSUFMSVpFIHN0YXRlIHVucmVjb3ZlcmFibGVcIilcclxuXHJcbiAgICAgICAgLy8gc2V0dXBcclxuICAgICAgICBjb25zdCBob3N0Q2hhbGxlbmdlID0gcmFuZG9tQnl0ZXMoOCkudG9TdHJpbmcoXCJoZXhcIilcclxuXHJcbiAgICAgICAgLy8gMS4gc2VsZWN0IGdwXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0R3BSZXNwb25zZSA9IGF3YWl0IHRoaXMuaXNzdWVDb21tYW5kU3RyKFwiMDBhNDA0MDAwMFwiKVxyXG4gICAgICAgIENIRUNLKFNXX09LKHNlbGVjdEdwUmVzcG9uc2UpLCBgdW5leHBlY3RlZCAke1NXKHNlbGVjdEdwUmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIDIuIGluaXRpYWxpemUgdXBkYXRlXHJcbiAgICAgICAgY29uc3QgaW5pdFVwZGF0ZVJlc3BvbnNlID0gYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoXCI4MDUwMDAwMDA4XCIgKyBob3N0Q2hhbGxlbmdlICsgXCIyOFwiKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGluaXRVcGRhdGVSZXNwb25zZSksIGB1bmV4cGVjdGVkICR7U1coc2VsZWN0R3BSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgQ0hFQ0soaW5pdFVwZGF0ZVJlc3BvbnNlLmxlbmd0aCA9PT0gMzAsIGBpbml0IHJlc3BvbnNlIGxlbmd0aCBpbmNvcnJlY3RgKVxyXG5cclxuICAgICAgICBjb25zdCBzZXF1ZW5jZSA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgxMiwgMTQpLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3Qgc2Vzc2lvbktleXMgPSB7XHJcbiAgICAgICAgICAgIGNtYWM6ICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTAxXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNNYWNLZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgcm1hYzogICBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShcIjAxMDJcIiArIHNlcXVlbmNlICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKHRoaXMuc01hY0tleSwgXCJoZXhcIikpLFxyXG4gICAgICAgICAgICBkZWs6ICAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDE4MVwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5zRW5jS2V5LCBcImhleFwiKSksXHJcbiAgICAgICAgICAgIGVuYzogICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTgyXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLmRla0tleSwgXCJoZXhcIikpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjYXJkQ2hhbGxlbmdlID0gaW5pdFVwZGF0ZVJlc3BvbnNlLnNsaWNlKDEyLCAyMCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBjYXJkRXhwZWN0ZWQgPSBpbml0VXBkYXRlUmVzcG9uc2Uuc2xpY2UoMjAsIDI4KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGNhcmRDYWxjID0gQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oaG9zdENoYWxsZW5nZSArIGNhcmRDaGFsbGVuZ2UgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIHNlc3Npb25LZXlzLmVuYykuc2xpY2UoMTYsIDI0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGhvc3RDYWxjID0gQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oY2FyZENoYWxsZW5nZSArIGhvc3RDaGFsbGVuZ2UgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIHNlc3Npb25LZXlzLmVuYykuc2xpY2UoMTYsIDI0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIENIRUNLKGNhcmRFeHBlY3RlZCA9PT0gY2FyZENhbGMsIGBjYXJkIGNyeXB0b2dyYW0gZmFpbGVkYClcclxuXHJcbiAgICAgICAgbGV0IGV4dGVybmFsQXV0aGVudGljYXRlID0gXCI4NDgyMDAwMDEwXCIgKyBob3N0Q2FsY1xyXG4gICAgICAgIGNvbnN0IGVhU2lnbmF0dXJlID0gQ2FyZENyeXB0by5nZXRSZXRhaWxNYWMoc2Vzc2lvbktleXMuY21hYy50b1N0cmluZyhcImhleFwiKSwgZXh0ZXJuYWxBdXRoZW50aWNhdGUsIFwiMDAwMDAwMDAwMDAwMDAwMFwiKVxyXG4gICAgICAgIGV4dGVybmFsQXV0aGVudGljYXRlICs9IGVhU2lnbmF0dXJlLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSA9IGF3YWl0IHRoaXMuaXNzdWVDb21tYW5kU3RyKGV4dGVybmFsQXV0aGVudGljYXRlKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGV4dGVybmFsQXV0aGVudGljYXRlUmVzcG9uc2UpLCBgdW5leHBlY3RlZCBhdXRoIHJlc3BvbnNlICR7U1coZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fY29ubmVjdGVkID0gdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwYXJzZVN0YXR1c1Jlc3BvbnNlKHJlc3BvbnNlOkJ1ZmZlcikge1xyXG4gICAgICAgIGxldCBtb2RlID0gMFxyXG4gICAgICAgIGxldCByZWFkID0gMFxyXG4gICAgICAgIGxldCBvdXRwdXQ6YW55W10gPSBbXVxyXG4gICAgICAgIHJlc3BvbnNlLmZvckVhY2goKGU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSAxXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdLmFpZC5wdXNoKGUpICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQtLVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWFkID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gMlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDNcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSA0XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZSA9PT0gMTQ0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gNVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZCA9IGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSAgXHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gb3V0cHV0XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0UGFja2FnZXMoKSB7XHJcbiAgICAgICAgQ0hFQ0sodGhpcy5fY29ubmVjdGVkLCBcIm5vdCBjb25uZWN0ZWRcIilcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXR1c1Jlc3BvbnNlKGF3YWl0IHRoaXMuaXNzdWVDb21tYW5kU3RyKFwiODBmMjIwMDAwMjRmMDBcIikpXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0QXBwbGV0cygpIHtcclxuICAgICAgICBDSEVDSyh0aGlzLl9jb25uZWN0ZWQsIFwibm90IGNvbm5lY3RlZFwiKVxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlU3RhdHVzUmVzcG9uc2UoYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoXCI4MGYyNDAwMDAyNGYwMFwiKSlcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkZWxldGVQYWNrYWdlKHN0YXR1czp7YWlkOkJ1ZmZlciB8IFVpbnQ4QXJyYXl9KSB7XHJcbiAgICAgICAgY29uc3QgaGV4Qnl0ZSA9ICh4Om51bWJlcikgPT4gQnVmZmVyLmZyb20oW3hdKS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIHRoaXMuaXNzdWVDb21tYW5kU3RyKGA4MGU0MDA4MCR7aGV4Qnl0ZShzdGF0dXMuYWlkLmxlbmd0aCArIDIpfTRmJHtoZXhCeXRlKHN0YXR1cy5haWQubGVuZ3RoKX0ke0J1ZmZlci5mcm9tKHN0YXR1cy5haWQpLnRvU3RyaW5nKFwiaGV4XCIpfTAwYClcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB1bnppcENhcCh6ZGF0YTpKU1ppcCk6UHJvbWlzZTx7bW9kdWxlOnN0cmluZywgZGF0YTpCdWZmZXIsIGk6bnVtYmVyfVtdPiB7XHJcbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZXMgPSBbXCJIZWFkZXJcIiwgXCJEaXJlY3RvcnlcIiwgXCJJbXBvcnRcIiwgXCJBcHBsZXRcIiwgXCJDbGFzc1wiLCBcIk1ldGhvZFwiLCBcIlN0YXRpY0ZpZWxkXCIsIFwiRXhwb3J0XCIsIFwiQ29uc3RhbnRQb29sXCIsIFwiUmVmTG9jYXRpb25cIl1cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCBtb2R1bGVzID0gW11cclxuICAgICAgICBmb3IgKGxldCBtb2Qgb2YgbW9kdWxlTmFtZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSB6ZGF0YS5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKGAke21vZH0uY2FwYCkpXHJcbiAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBtb2R1bGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZTogbW9kLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGF3YWl0IGZpbGVzWzBdLmFzeW5jKFwibm9kZWJ1ZmZlclwiKSxcclxuICAgICAgICAgICAgICAgICAgICBpOiBtb2R1bGVzLmxlbmd0aFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG1vZHVsZXNcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbnN0YWxsQXV0byh6ZGF0YTpKU1ppcCk6UHJvbWlzZTxCdWZmZXI+IHtcclxuICAgICAgICBjb25zdCBtb2R1bGVzID0gYXdhaXQgdGhpcy51bnppcENhcCh6ZGF0YSlcclxuICAgICAgICBjb25zdCBjYXBhaWQgPSBtb2R1bGVzLmZpbmQoKG0pID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKSEuZGF0YS5zbGljZSgxMywgMTMgKyBtb2R1bGVzLmZpbmQoKG0pID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKSEuZGF0YVsxMl0pXHJcbiAgICAgICAgY29uc3QgYXBwYWlkID0gbW9kdWxlcy5maW5kKChtKSA9PiBtLm1vZHVsZSA9PT0gXCJBcHBsZXRcIikhLmRhdGEuc2xpY2UoNSwgNSArIG1vZHVsZXMuZmluZCgobSkgPT4gbS5tb2R1bGUgPT09IFwiQXBwbGV0XCIpIS5kYXRhWzRdKVxyXG5cclxuICAgICAgICBjb25zdCBsc3cgPSBhd2FpdCB0aGlzLmluc3RhbGxGb3JMb2FkKHpkYXRhKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGxzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1cobHN3KS50b1N0cmluZygxNil9YClcclxuXHJcbiAgICAgICAgY29uc3QgaXN3ID0gYXdhaXQgdGhpcy5pbnN0YWxsRm9ySW5zdGFsbChjYXBhaWQudG9TdHJpbmcoXCJoZXhcIiksIGFwcGFpZC50b1N0cmluZyhcImhleFwiKSlcclxuICAgICAgICBDSEVDSyhTV19PSyhpc3cpLCBgdW5leHBlY3RlZCByZXNwb25zZSAke1NXKGlzdykudG9TdHJpbmcoMTYpfWApXHJcblxyXG4gICAgICAgIHJldHVybiBpc3dcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbnN0YWxsRm9yTG9hZCh6ZGF0YTpKU1ppcCk6UHJvbWlzZTxCdWZmZXI+IHtcclxuICAgICAgICBjb25zdCBtb2R1bGVzID0gYXdhaXQgdGhpcy51bnppcENhcCh6ZGF0YSlcclxuXHJcbiAgICAgICAgY29uc3QgYWlkID0gbW9kdWxlcy5maW5kKChtKSA9PiBtLm1vZHVsZSA9PT0gXCJIZWFkZXJcIikhLmRhdGEuc2xpY2UoMTMsIDEzICsgbW9kdWxlcy5maW5kKChtOmFueSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpIS5kYXRhWzEyXSlcclxuXHJcbiAgICAgICAgbGV0IGFwZHU6c3RyaW5nW10gPSBbXVxyXG5cclxuICAgICAgICAvLyBpbnN0YWxsXHJcbiAgICAgICAgYXBkdS5wdXNoKGA4MGU2MDIwMCR7KGFpZC5sZW5ndGggKyA1ICsgMjU2KS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpfSR7KGFpZC5sZW5ndGggKyAyNTYpLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSl9JHthaWQudG9TdHJpbmcoXCJoZXhcIil9MDAwMDAwMDAwMWApXHJcblxyXG4gICAgICAgIC8vIGxvYWQgbG9vcFxyXG4gICAgICAgIC8vIHNlZSBodHRwczovL3d3dy53My5vcmcvUHJvdG9jb2xzL0hUVFAtTkcvYXNuMS5odG1sIGZvciBBU04uMS9UTFYgaW5mb1xyXG4gICAgICAgIGxldCBjb250aWcgPSBCdWZmZXIuY29uY2F0KG1vZHVsZXMubWFwKG0gPT4gbS5kYXRhKSlcclxuICAgICAgICBjb25zdCBibG9jayA9IDB4ZmEgICAgICAgIFxyXG4gICAgICAgIGlmIChjb250aWcubGVuZ3RoIDwgMTI4KSB7XHJcbiAgICAgICAgICAgIGFwZHUucHVzaChgODBlODAwMDBjNCR7QnVmZmVyLmZyb20oW2NvbnRpZy5sZW5ndGhdKS50b1N0cmluZyhcImhleFwiKX0ke2NvbnRpZy50b1N0cmluZyhcImhleFwiKX1gKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgQnVmZmVyLmZyb20oW2FwZHUubGVuZ3RoIC0gMSwgYmxvY2tdKS50b1N0cmluZyhcImhleFwiKSAvLyA/XHJcbiAgICAgICAgICAgIGFwZHUucHVzaChgODBlODAwJHtCdWZmZXIuZnJvbShbYXBkdS5sZW5ndGggLSAxLCBNYXRoLm1pbihibG9jaywgY29udGlnLmxlbmd0aCkgKyA0XSkudG9TdHJpbmcoXCJoZXhcIil9YzQ4MiR7QnVmZmVyLmZyb20oW2NvbnRpZy5sZW5ndGggPj4gOCwgY29udGlnLmxlbmd0aF0pLnRvU3RyaW5nKFwiaGV4XCIpfSR7Y29udGlnLnNsaWNlKDAsIGJsb2NrKS50b1N0cmluZyhcImhleFwiKX1gKVxyXG4gICAgICAgICAgICBjb250aWcgPSBjb250aWcuc2xpY2UoYmxvY2spXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChjb250aWcubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGFwZHUucHVzaChgODBlOCR7Y29udGlnLmxlbmd0aCA+IGJsb2NrID8gXCIwMFwiIDogXCI4MFwifSR7QnVmZmVyLmZyb20oW2FwZHUubGVuZ3RoIC0gMSwgTWF0aC5taW4oYmxvY2ssIGNvbnRpZy5sZW5ndGgpXSkudG9TdHJpbmcoXCJoZXhcIil9JHtjb250aWcuc2xpY2UoMCwgYmxvY2spLnRvU3RyaW5nKFwiaGV4XCIpfWApXHJcbiAgICAgICAgICAgIGNvbnRpZyA9IGNvbnRpZy5zbGljZShibG9jaylcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN3ID0gQnVmZmVyLmZyb20oWzBdKVxyXG4gICAgICAgIGZvciAobGV0IGNtZCBvZiBhcGR1KSB7XHJcbiAgICAgICAgICAgIHN3ID0gYXdhaXQgdGhpcy5pc3N1ZUNvbW1hbmRTdHIoY21kKVxyXG4gICAgICAgICAgICBDSEVDSyhTV19PSyhzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1coc3cpLnRvU3RyaW5nKDE2KX0gZm9yICR7Y21kfWApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzd1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGluc3RhbGxGb3JJbnN0YWxsKGNhcGFpZDpzdHJpbmcsIG1vZGFpZDpzdHJpbmcpOlByb21pc2U8QnVmZmVyPiB7XHJcbiAgICAgICAgLy8gc2VlIHNwZWMgMi4xLjEgOS41LjIuMy4xIGZvciBkYXRhXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogMSBsZW4gbG9hZCBmaWxlIGFpZFxyXG4gICAgICAgICAqIDUtMTZcclxuICAgICAgICAgKiAxIG1vZHVsZSBhaWRcclxuICAgICAgICAgKiA1LTE2XHJcbiAgICAgICAgICogMSBhcHAgYWlkXHJcbiAgICAgICAgICogNS0xNlxyXG4gICAgICAgICAqIDEgbGVuIHByaXZzXHJcbiAgICAgICAgICogMSBwcml2c1xyXG4gICAgICAgICAqIDEgbGVuIHBhcmFtc1xyXG4gICAgICAgICAqIDItbiBwYXJhbXNcclxuICAgICAgICAgKiAxIGxlbiB0b2tlblxyXG4gICAgICAgICAqIDAtbiB0b2tlblxyXG4gICAgICAgICAqIDA1IFxyXG4gICAgICAgICAqIEQyIDc2IDAwIDAwIDg1XHJcbiAgICAgICAgICogMDdcclxuICAgICAgICAgKiBEMiA3NiAwMCAwMCA4NSAwMSAwMVxyXG4gICAgICAgICAqIDA3XHJcbiAgICAgICAgICogRDIgNzYgMDAgMDAgODUgMDEgMDFcclxuICAgICAgICAgKiAwMVxyXG4gICAgICAgICAqIDAwIFxyXG4gICAgICAgICAqIDAyIFxyXG4gICAgICAgICAqIEM5IDAwIChUTFYpXHJcbiAgICAgICAgICogMDBcclxuICAgICAgICAgKiAwMFxyXG4gICAgICAgICAqICAqL1xyXG4gICAgICAgIGxldCBpbnN0YWlkID0gbW9kYWlkXHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gXCJcIlxyXG4gICAgICAgIGRhdGEgKz0gYCR7QnVmZmVyLmZyb20oW2NhcGFpZC5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHtjYXBhaWR9YFxyXG4gICAgICAgIGRhdGEgKz0gYCR7QnVmZmVyLmZyb20oW21vZGFpZC5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHttb2RhaWR9YFxyXG4gICAgICAgIGRhdGEgKz0gYCR7QnVmZmVyLmZyb20oW2luc3RhaWQubGVuZ3RoIC8gMl0pLnRvU3RyaW5nKFwiaGV4XCIpfSR7aW5zdGFpZH1gXHJcbiAgICAgICAgZGF0YSArPSBcIjAxMDBcIiAvLyBwcml2c1xyXG4gICAgICAgIGRhdGEgKz0gXCIwMmM5MDBcIiAvLyBwYXJhbXNcclxuICAgICAgICBkYXRhICs9IFwiMDBcIiAvLyB0b2tlblxyXG5cclxuICAgICAgICBjb25zdCBhcGR1ID0gYDgwZTYwYzAwJHtCdWZmZXIuZnJvbShbZGF0YS5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHtkYXRhfTAwYFxyXG5cclxuICAgICAgICBjb25zdCBzdyA9IGF3YWl0IHRoaXMuaXNzdWVDb21tYW5kU3RyKGFwZHUpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soc3cpLCBgdW5leHBlY3RlZCByZXNwb25zZSAke1NXKHN3KS50b1N0cmluZygxNil9IGZvciAke2FwZHV9YClcclxuXHJcbiAgICAgICAgcmV0dXJuIHN3XHJcbiAgICB9XHJcbn1cclxuIl19