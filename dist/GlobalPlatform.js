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
            var moduleNames, modules, _loop_1, _i, moduleNames_1, mod, aid, apdu, contig, block, sw, _a, apdu_1, cmd;
            return __generator(this, function (_b) {
                switch (_b.label) {
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
                        _b.label = 1;
                    case 1:
                        if (!(_i < moduleNames_1.length)) return [3 /*break*/, 4];
                        mod = moduleNames_1[_i];
                        return [5 /*yield**/, _loop_1(mod)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
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
                        _a = 0, apdu_1 = apdu;
                        _b.label = 5;
                    case 5:
                        if (!(_a < apdu_1.length)) return [3 /*break*/, 8];
                        cmd = apdu_1[_a];
                        return [4 /*yield*/, this.card.issueCommand(cmd)];
                    case 6:
                        sw = _b.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(sw), "unexpected response " + Utils_1.SW(sw).toString(16) + " for " + cmd);
                        _b.label = 7;
                    case 7:
                        _a++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, sw];
                }
            });
        });
    };
    GlobalPlatform.prototype.installForInstall = function (capaid, modaid) {
        return __awaiter(this, void 0, void 0, function () {
            var instaid, data, apdu, sw;
            return __generator(this, function (_a) {
                instaid = modaid;
                data = "";
                data += "" + Buffer.from([capaid.length / 2]).toString("hex") + capaid;
                data += "" + Buffer.from([modaid.length / 2]).toString("hex") + modaid;
                data += "" + Buffer.from([instaid.length / 2]).toString("hex") + instaid;
                data += "0100"; // privs
                data += "02c900"; // params
                data += "00"; // token
                apdu = "80e60c00" + Buffer.from([data.length / 2]).toString("hex") + data + "00";
                sw = this.card.issueCommand(apdu);
                Utils_1.CHECK(Utils_1.SW_OK(sw), "unexpected response " + Utils_1.SW(sw).toString(16) + " for " + apdu);
                return [2 /*return*/, sw];
            });
        });
    };
    return GlobalPlatform;
}());
exports.default = GlobalPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvR2xvYmFsUGxhdGZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFvQztBQUNwQywyQ0FBeUM7QUFFekMsaUNBQTBDO0FBSzFDO0lBYUk7O09BRUc7SUFDSCx3QkFBWSxJQUFRLEVBQUUsSUFBdUY7UUFkN0csc0NBQXNDO1FBQ3RDLFNBQUksR0FBTyxJQUFJLENBQUE7UUFFZixtQkFBYyxHQUFHLGtDQUFrQyxDQUFBO1FBQ25ELHlCQUFvQixHQUFHLEVBQUUsQ0FBQTtRQUN6QixZQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ1osWUFBTyxHQUFHLEVBQUUsQ0FBQTtRQUNaLFdBQU0sR0FBRyxFQUFFLENBQUE7UUFFSCxlQUFVLEdBQUcsS0FBSyxDQUFBO1FBTXRCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1FBQ2hCLElBQUksSUFBSSxFQUFFO1lBQ04sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7U0FDNUI7UUFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxjQUFjLENBQUE7UUFDNUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQTtRQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFBO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUE7SUFDMUQsQ0FBQztJQUVEOztPQUVHO0lBQ0csZ0NBQU8sR0FBYjs7Ozs7O3dCQUNJLGFBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVB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LENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLENBQUMsQ0FBQTt3QkFDOUMsS0FBSyxHQUFHLElBQUksQ0FBQTt3QkFDbEIsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTs0QkFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUcsQ0FBQyxDQUFBO3lCQUNsRzs2QkFDSTs0QkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUEsQ0FBQyxJQUFJOzRCQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUcsQ0FBQyxDQUFBOzRCQUN4TixNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTt5QkFDL0I7d0JBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxFQUFFOzRCQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQU8sTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFHLENBQUMsQ0FBQTs0QkFDakwsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7eUJBQy9CO3dCQUVHLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTs4QkFDTCxFQUFKLGFBQUk7Ozs2QkFBSixDQUFBLGtCQUFJLENBQUE7d0JBQVgsR0FBRzt3QkFDSCxxQkFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0JBQXRDLEVBQUUsR0FBRyxTQUFpQyxDQUFBO3dCQUN0QyxhQUFLLENBQUMsYUFBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLHlCQUF1QixVQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxhQUFRLEdBQUssQ0FBQyxDQUFBOzs7d0JBRjdELElBQUksQ0FBQTs7NEJBSXBCLHNCQUFPLEVBQUUsRUFBQTs7OztLQUNaO0lBRUssMENBQWlCLEdBQXZCLFVBQXdCLE1BQWEsRUFBRSxNQUFhOzs7O2dCQTRCNUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtnQkFFaEIsSUFBSSxHQUFHLEVBQUUsQ0FBQTtnQkFDYixJQUFJLElBQUksS0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFRLENBQUE7Z0JBQ3RFLElBQUksSUFBSSxLQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQVEsQ0FBQTtnQkFDdEUsSUFBSSxJQUFJLEtBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBUyxDQUFBO2dCQUN4RSxJQUFJLElBQUksTUFBTSxDQUFBLENBQUMsUUFBUTtnQkFDdkIsSUFBSSxJQUFJLFFBQVEsQ0FBQSxDQUFDLFNBQVM7Z0JBQzFCLElBQUksSUFBSSxJQUFJLENBQUEsQ0FBQyxRQUFRO2dCQUVmLElBQUksR0FBRyxhQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksT0FBSSxDQUFBO2dCQUUzRSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ3ZDLGFBQUssQ0FBQyxhQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUseUJBQXVCLFVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQVEsSUFBTSxDQUFDLENBQUE7Z0JBRTFFLHNCQUFPLEVBQUUsRUFBQTs7O0tBQ1o7SUFDTCxxQkFBQztBQUFELENBQUMsQUF0TkQsSUFzTkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByYW5kb21CeXRlcyB9IGZyb20gXCJjcnlwdG9cIlxyXG5pbXBvcnQgeyBDYXJkQ3J5cHRvIH0gZnJvbSBcIi4vQ2FyZENyeXB0b1wiXHJcbmltcG9ydCBJQXBwbGljYXRpb24gZnJvbSBcIi4vSUFwcGxpY2F0aW9uXCJcclxuaW1wb3J0IHsgQ0hFQ0ssIFNXX09LLCBTVyB9IGZyb20gXCIuL1V0aWxzXCJcclxuaW1wb3J0IEpTWmlwLCB7IEpTWmlwT2JqZWN0IH0gZnJvbSBcImpzemlwXCJcclxuaW1wb3J0IHsgU3RyZWFtIH0gZnJvbSBcInN0cmVhbVwiO1xyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdsb2JhbFBsYXRmb3JtIGltcGxlbWVudHMgSUFwcGxpY2F0aW9uIHtcclxuXHJcbiAgICAvLyBUT0RPOiBmb3JrIHNtYXJ0Y2FyZCBhbmQgcG9ydCB0byBUU1xyXG4gICAgY2FyZDphbnkgPSBudWxsXHJcblxyXG4gICAgRGVmYXVsdEF1dGhLZXkgPSBcIjQwNDE0MjQzNDQ0NTQ2NDc0ODQ5NGE0YjRjNGQ0ZTRmXCJcclxuICAgIHNlY3VyZUNoYW5uZWxCYXNlS2V5ID0gXCJcIlxyXG4gICAgc01hY0tleSA9IFwiXCJcclxuICAgIHNFbmNLZXkgPSBcIlwiXHJcbiAgICBkZWtLZXkgPSBcIlwiXHJcblxyXG4gICAgcHJpdmF0ZSBfY29ubmVjdGVkID0gZmFsc2VcclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGNhcmQ6YW55LCBrZXlzPzp7IHNlY3VyZUNoYW5uZWxCYXNlS2V5PzpzdHJpbmcsIHNNYWNLZXk/OnN0cmluZywgc0VuY0tleTpzdHJpbmcsIGRla0tleT86c3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmNhcmQgPSBjYXJkXHJcbiAgICAgICAgaWYgKGtleXMpIHtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBrZXlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlY3VyZUNoYW5uZWxCYXNlS2V5ID0gdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleSB8fCB0aGlzLkRlZmF1bHRBdXRoS2V5XHJcbiAgICAgICAgdGhpcy5zTWFjS2V5ID0gdGhpcy5zTWFjS2V5IHx8IHRoaXMuc2VjdXJlQ2hhbm5lbEJhc2VLZXlcclxuICAgICAgICB0aGlzLnNFbmNLZXkgPSB0aGlzLnNFbmNLZXkgfHwgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleVxyXG4gICAgICAgIHRoaXMuZGVrS2V5ID0gdGhpcy5kZWtLZXkgfHwgdGhpcy5zZWN1cmVDaGFubmVsQmFzZUtleVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29ubmVjdHMgdG8gdGhlIHByZXNlbnQgZGV2aWNlIGFuZCBleGVjdXRlcyB0aGUgSU5JVElBTElaRSBVUERBVEUgY29tbWFuZFxyXG4gICAgICovXHJcbiAgICBhc3luYyBjb25uZWN0KCkge1xyXG4gICAgICAgIENIRUNLKCF0aGlzLl9jb25uZWN0ZWQsIFwiYWxyZWFkeSBjb25uZWN0ZWQgYW5kIElOSVRJQUxJWkUgc3RhdGUgdW5yZWNvdmVyYWJsZVwiKVxyXG5cclxuICAgICAgICAvLyBzZXR1cFxyXG4gICAgICAgIGNvbnN0IGhvc3RDaGFsbGVuZ2UgPSByYW5kb21CeXRlcyg4KS50b1N0cmluZyhcImhleFwiKVxyXG5cclxuICAgICAgICAvLyAxLiBzZWxlY3QgZ3BcclxuICAgICAgICBjb25zdCBzZWxlY3RHcFJlc3BvbnNlID0gYXdhaXQgdGhpcy5jYXJkLmlzc3VlQ29tbWFuZChcIjAwYTQwNDAwMDBcIilcclxuICAgICAgICBDSEVDSyhTV19PSyhzZWxlY3RHcFJlc3BvbnNlKSwgYHVuZXhwZWN0ZWQgJHtTVyhzZWxlY3RHcFJlc3BvbnNlKS50b1N0cmluZygxNil9YClcclxuICAgICAgICBcclxuICAgICAgICAvLyAyLiBpbml0aWFsaXplIHVwZGF0ZVxyXG4gICAgICAgIGNvbnN0IGluaXRVcGRhdGVSZXNwb25zZSA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCI4MDUwMDAwMDA4XCIgKyBob3N0Q2hhbGxlbmdlICsgXCIyOFwiKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGluaXRVcGRhdGVSZXNwb25zZSksIGB1bmV4cGVjdGVkICR7U1coc2VsZWN0R3BSZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcbiAgICAgICAgQ0hFQ0soaW5pdFVwZGF0ZVJlc3BvbnNlLmxlbmd0aCA9PT0gMzAsIGBpbml0IHJlc3BvbnNlIGxlbmd0aCBpbmNvcnJlY3RgKVxyXG5cclxuICAgICAgICBjb25zdCBzZXF1ZW5jZSA9IGluaXRVcGRhdGVSZXNwb25zZS5zbGljZSgxMiwgMTQpLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3Qgc2Vzc2lvbktleXMgPSB7XHJcbiAgICAgICAgICAgIGNtYWM6ICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTAxXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLnNNYWNLZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgcm1hYzogICBDYXJkQ3J5cHRvLnRyaXBsZURlc0NiYyhCdWZmZXIuZnJvbShcIjAxMDJcIiArIHNlcXVlbmNlICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKHRoaXMuc01hY0tleSwgXCJoZXhcIikpLFxyXG4gICAgICAgICAgICBkZWs6ICAgIENhcmRDcnlwdG8udHJpcGxlRGVzQ2JjKEJ1ZmZlci5mcm9tKFwiMDE4MVwiICsgc2VxdWVuY2UgKyBcIjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgQnVmZmVyLmZyb20odGhpcy5zRW5jS2V5LCBcImhleFwiKSksXHJcbiAgICAgICAgICAgIGVuYzogICAgQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oXCIwMTgyXCIgKyBzZXF1ZW5jZSArIFwiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXCIsIFwiaGV4XCIpLCBCdWZmZXIuZnJvbSh0aGlzLmRla0tleSwgXCJoZXhcIikpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjYXJkQ2hhbGxlbmdlID0gaW5pdFVwZGF0ZVJlc3BvbnNlLnNsaWNlKDEyLCAyMCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBjb25zdCBjYXJkRXhwZWN0ZWQgPSBpbml0VXBkYXRlUmVzcG9uc2Uuc2xpY2UoMjAsIDI4KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGNhcmRDYWxjID0gQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oaG9zdENoYWxsZW5nZSArIGNhcmRDaGFsbGVuZ2UgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIHNlc3Npb25LZXlzLmVuYykuc2xpY2UoMTYsIDI0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGNvbnN0IGhvc3RDYWxjID0gQ2FyZENyeXB0by50cmlwbGVEZXNDYmMoQnVmZmVyLmZyb20oY2FyZENoYWxsZW5nZSArIGhvc3RDaGFsbGVuZ2UgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIHNlc3Npb25LZXlzLmVuYykuc2xpY2UoMTYsIDI0KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIENIRUNLKGNhcmRFeHBlY3RlZCA9PT0gY2FyZENhbGMsIGBjYXJkIGNyeXB0b2dyYW0gZmFpbGVkYClcclxuXHJcbiAgICAgICAgbGV0IGV4dGVybmFsQXV0aGVudGljYXRlID0gXCI4NDgyMDAwMDEwXCIgKyBob3N0Q2FsY1xyXG4gICAgICAgIGNvbnN0IGVhU2lnbmF0dXJlID0gQ2FyZENyeXB0by5nZXRSZXRhaWxNYWMoc2Vzc2lvbktleXMuY21hYy50b1N0cmluZyhcImhleFwiKSwgZXh0ZXJuYWxBdXRoZW50aWNhdGUsIFwiMDAwMDAwMDAwMDAwMDAwMFwiKVxyXG4gICAgICAgIGV4dGVybmFsQXV0aGVudGljYXRlICs9IGVhU2lnbmF0dXJlLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY29uc3QgZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoZXh0ZXJuYWxBdXRoZW50aWNhdGUpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0soZXh0ZXJuYWxBdXRoZW50aWNhdGVSZXNwb25zZSksIGB1bmV4cGVjdGVkIGF1dGggcmVzcG9uc2UgJHtTVyhleHRlcm5hbEF1dGhlbnRpY2F0ZVJlc3BvbnNlKS50b1N0cmluZygxNil9YClcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLl9jb25uZWN0ZWQgPSB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHBhcnNlU3RhdHVzUmVzcG9uc2UocmVzcG9uc2U6QnVmZmVyKSB7XHJcbiAgICAgICAgbGV0IG1vZGUgPSAwXHJcbiAgICAgICAgbGV0IHJlYWQgPSAwXHJcbiAgICAgICAgbGV0IG91dHB1dDphbnlbXSA9IFtdXHJcbiAgICAgICAgcmVzcG9uc2UuZm9yRWFjaCgoZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHthaWQ6W119KVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQgPSBlXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV0uYWlkLnB1c2goZSkgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZC0tXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWQgPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGUgPSAyXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gM1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDRcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlID09PSAxNDQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGUgPSA1XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHthaWQ6W119KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlID0gMVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9ICBcclxuICAgICAgICB9KVxyXG4gICAgICAgIHJldHVybiBvdXRwdXRcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRQYWNrYWdlcygpIHtcclxuICAgICAgICBDSEVDSyh0aGlzLl9jb25uZWN0ZWQsIFwibm90IGNvbm5lY3RlZFwiKVxyXG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlU3RhdHVzUmVzcG9uc2UoYXdhaXQgdGhpcy5jYXJkLmlzc3VlQ29tbWFuZChcIjgwZjIyMDAwMDI0ZjAwXCIpKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldEFwcGxldHMoKSB7XHJcbiAgICAgICAgQ0hFQ0sodGhpcy5fY29ubmVjdGVkLCBcIm5vdCBjb25uZWN0ZWRcIilcclxuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZVN0YXR1c1Jlc3BvbnNlKGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoXCI4MGYyNDAwMDAyNGYwMFwiKSlcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkZWxldGVQYWNrYWdlKHN0YXR1czp7YWlkOkJ1ZmZlciB8IFVpbnQ4QXJyYXl9KSB7XHJcbiAgICAgICAgY29uc3QgaGV4Qnl0ZSA9ICh4Om51bWJlcikgPT4gQnVmZmVyLmZyb20oW3hdKS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoYDgwZTQwMDgwJHtoZXhCeXRlKHN0YXR1cy5haWQubGVuZ3RoICsgMil9NGYke2hleEJ5dGUoc3RhdHVzLmFpZC5sZW5ndGgpfSR7QnVmZmVyLmZyb20oc3RhdHVzLmFpZCkudG9TdHJpbmcoXCJoZXhcIil9MDBgKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGluc3RhbGxGb3JMb2FkKHpkYXRhOkpTWmlwKTpQcm9taXNlPEJ1ZmZlcj4ge1xyXG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWVzID0gW1wiSGVhZGVyXCIsIFwiRGlyZWN0b3J5XCIsIFwiSW1wb3J0XCIsIFwiQXBwbGV0XCIsIFwiQ2xhc3NcIiwgXCJNZXRob2RcIiwgXCJTdGF0aWNGaWVsZFwiLCBcIkV4cG9ydFwiLCBcIkNvbnN0YW50UG9vbFwiLCBcIlJlZkxvY2F0aW9uXCJdXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgbW9kdWxlcyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgbW9kIG9mIG1vZHVsZU5hbWVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gemRhdGEuZmlsdGVyKGYgPT4gZi5lbmRzV2l0aChgJHttb2R9LmNhcGApKVxyXG4gICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbW9kdWxlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IG1vZCxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBhd2FpdCBmaWxlc1swXS5hc3luYyhcIm5vZGVidWZmZXJcIiksXHJcbiAgICAgICAgICAgICAgICAgICAgaTogbW9kdWxlcy5sZW5ndGhcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFpZCA9IG1vZHVsZXMuZmluZCgobSkgPT4gbS5tb2R1bGUgPT09IFwiSGVhZGVyXCIpIS5kYXRhLnNsaWNlKDEzLCAxMyArIG1vZHVsZXMuZmluZCgobTphbnkpID0+IG0ubW9kdWxlID09PSBcIkhlYWRlclwiKSEuZGF0YVsxMl0pXHJcblxyXG4gICAgICAgIGxldCBhcGR1OnN0cmluZ1tdID0gW11cclxuXHJcbiAgICAgICAgLy8gaW5zdGFsbFxyXG4gICAgICAgIGFwZHUucHVzaChgODBlNjAyMDAkeyhhaWQubGVuZ3RoICsgNSArIDI1NikudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKX0keyhhaWQubGVuZ3RoICsgMjU2KS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpfSR7YWlkLnRvU3RyaW5nKFwiaGV4XCIpfTAwMDAwMDAwMDFgKVxyXG5cclxuICAgICAgICAvLyBsb2FkIGxvb3BcclxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1Byb3RvY29scy9IVFRQLU5HL2FzbjEuaHRtbCBmb3IgQVNOLjEvVExWIGluZm9cclxuICAgICAgICBsZXQgY29udGlnID0gQnVmZmVyLmNvbmNhdChtb2R1bGVzLm1hcChtID0+IG0uZGF0YSkpXHJcbiAgICAgICAgY29uc3QgYmxvY2sgPSAweGZhICAgICAgICBcclxuICAgICAgICBpZiAoY29udGlnLmxlbmd0aCA8IDEyOCkge1xyXG4gICAgICAgICAgICBhcGR1LnB1c2goYDgwZTgwMDAwYzQke0J1ZmZlci5mcm9tKFtjb250aWcubGVuZ3RoXSkudG9TdHJpbmcoXCJoZXhcIil9JHtjb250aWcudG9TdHJpbmcoXCJoZXhcIil9YClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIEJ1ZmZlci5mcm9tKFthcGR1Lmxlbmd0aCAtIDEsIGJsb2NrXSkudG9TdHJpbmcoXCJoZXhcIikgLy8gP1xyXG4gICAgICAgICAgICBhcGR1LnB1c2goYDgwZTgwMCR7QnVmZmVyLmZyb20oW2FwZHUubGVuZ3RoIC0gMSwgTWF0aC5taW4oYmxvY2ssIGNvbnRpZy5sZW5ndGgpICsgNF0pLnRvU3RyaW5nKFwiaGV4XCIpfWM0ODIke0J1ZmZlci5mcm9tKFtjb250aWcubGVuZ3RoID4+IDgsIGNvbnRpZy5sZW5ndGhdKS50b1N0cmluZyhcImhleFwiKX0ke2NvbnRpZy5zbGljZSgwLCBibG9jaykudG9TdHJpbmcoXCJoZXhcIil9YClcclxuICAgICAgICAgICAgY29udGlnID0gY29udGlnLnNsaWNlKGJsb2NrKVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAoY29udGlnLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBhcGR1LnB1c2goYDgwZTgke2NvbnRpZy5sZW5ndGggPiBibG9jayA/IFwiMDBcIiA6IFwiODBcIn0ke0J1ZmZlci5mcm9tKFthcGR1Lmxlbmd0aCAtIDEsIE1hdGgubWluKGJsb2NrLCBjb250aWcubGVuZ3RoKV0pLnRvU3RyaW5nKFwiaGV4XCIpfSR7Y29udGlnLnNsaWNlKDAsIGJsb2NrKS50b1N0cmluZyhcImhleFwiKX1gKVxyXG4gICAgICAgICAgICBjb250aWcgPSBjb250aWcuc2xpY2UoYmxvY2spXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdyA9IEJ1ZmZlci5mcm9tKFswXSlcclxuICAgICAgICBmb3IgKGxldCBjbWQgb2YgYXBkdSkge1xyXG4gICAgICAgICAgICBzdyA9IGF3YWl0IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoY21kKVxyXG4gICAgICAgICAgICBDSEVDSyhTV19PSyhzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1coc3cpLnRvU3RyaW5nKDE2KX0gZm9yICR7Y21kfWApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzd1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGluc3RhbGxGb3JJbnN0YWxsKGNhcGFpZDpzdHJpbmcsIG1vZGFpZDpzdHJpbmcpOlByb21pc2U8QnVmZmVyPiB7XHJcbiAgICAgICAgLy8gc2VlIHNwZWMgMi4xLjEgOS41LjIuMy4xIGZvciBkYXRhXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogMSBsZW4gbG9hZCBmaWxlIGFpZFxyXG4gICAgICAgICAqIDUtMTZcclxuICAgICAgICAgKiAxIG1vZHVsZSBhaWRcclxuICAgICAgICAgKiA1LTE2XHJcbiAgICAgICAgICogMSBhcHAgYWlkXHJcbiAgICAgICAgICogNS0xNlxyXG4gICAgICAgICAqIDEgbGVuIHByaXZzXHJcbiAgICAgICAgICogMSBwcml2c1xyXG4gICAgICAgICAqIDEgbGVuIHBhcmFtc1xyXG4gICAgICAgICAqIDItbiBwYXJhbXNcclxuICAgICAgICAgKiAxIGxlbiB0b2tlblxyXG4gICAgICAgICAqIDAtbiB0b2tlblxyXG4gICAgICAgICAqIDA1IFxyXG4gICAgICAgICAqIEQyIDc2IDAwIDAwIDg1XHJcbiAgICAgICAgICogMDdcclxuICAgICAgICAgKiBEMiA3NiAwMCAwMCA4NSAwMSAwMVxyXG4gICAgICAgICAqIDA3XHJcbiAgICAgICAgICogRDIgNzYgMDAgMDAgODUgMDEgMDFcclxuICAgICAgICAgKiAwMVxyXG4gICAgICAgICAqIDAwIFxyXG4gICAgICAgICAqIDAyIFxyXG4gICAgICAgICAqIEM5IDAwIChUTFYpXHJcbiAgICAgICAgICogMDBcclxuICAgICAgICAgKiAwMFxyXG4gICAgICAgICAqICAqL1xyXG4gICAgICAgIGxldCBpbnN0YWlkID0gbW9kYWlkXHJcblxyXG4gICAgICAgIGxldCBkYXRhID0gXCJcIlxyXG4gICAgICAgIGRhdGEgKz0gYCR7QnVmZmVyLmZyb20oW2NhcGFpZC5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHtjYXBhaWR9YFxyXG4gICAgICAgIGRhdGEgKz0gYCR7QnVmZmVyLmZyb20oW21vZGFpZC5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHttb2RhaWR9YFxyXG4gICAgICAgIGRhdGEgKz0gYCR7QnVmZmVyLmZyb20oW2luc3RhaWQubGVuZ3RoIC8gMl0pLnRvU3RyaW5nKFwiaGV4XCIpfSR7aW5zdGFpZH1gXHJcbiAgICAgICAgZGF0YSArPSBcIjAxMDBcIiAvLyBwcml2c1xyXG4gICAgICAgIGRhdGEgKz0gXCIwMmM5MDBcIiAvLyBwYXJhbXNcclxuICAgICAgICBkYXRhICs9IFwiMDBcIiAvLyB0b2tlblxyXG5cclxuICAgICAgICBjb25zdCBhcGR1ID0gYDgwZTYwYzAwJHtCdWZmZXIuZnJvbShbZGF0YS5sZW5ndGggLyAyXSkudG9TdHJpbmcoXCJoZXhcIil9JHtkYXRhfTAwYFxyXG5cclxuICAgICAgICBjb25zdCBzdyA9IHRoaXMuY2FyZC5pc3N1ZUNvbW1hbmQoYXBkdSlcclxuICAgICAgICBDSEVDSyhTV19PSyhzdyksIGB1bmV4cGVjdGVkIHJlc3BvbnNlICR7U1coc3cpLnRvU3RyaW5nKDE2KX0gZm9yICR7YXBkdX1gKVxyXG5cclxuICAgICAgICByZXR1cm4gc3dcclxuICAgIH1cclxufSJdfQ==