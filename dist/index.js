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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var cardcrypto_1 = require("./cardcrypto");
var fs_1 = require("fs");
var jszip_1 = require("jszip");
var smartcard = require('smartcard');
var Devices = smartcard.Devices;
var devices = new Devices();
var authkey = "404142434445464748494a4b4c4d4e4f";
var SW = function (buffer) { return buffer.readUInt16BE(buffer.length - 2); };
var SW_OK = function (buffer) { return SW(buffer) === 0x9000; };
var APDU_STATIC = {
    selectGp: "00a4040000",
    lsPackage: "80f22000024f00",
    lsApplet: "80f24000024f00",
};
var check = function (test, message) { if (!test)
    throw message; };
var enccbc3des = function (data, key) {
    var cipher = crypto_1.createCipheriv('des-ede-cbc', key, Buffer.alloc(8));
    //let cipher = crypto.createCipher('des-ede3-cbc', key)
    cipher.setAutoPadding(false);
    var b = cipher.update(data);
    var f = cipher.final();
    return Buffer.concat([b, f], b.length + f.length);
};
var hbyte = function (x) { return x.toString("16").replace(/(^\d$)/, "0$1"); };
var readStatus = function (response) {
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
devices.on('device-activated', function (_a) {
    var device = _a.device;
    // device.setShareMode(2) // TODO: benbenbenbenbenben/smartcard
    device.on('card-inserted', function (_a) {
        var card = _a.card;
        return __awaiter(_this, void 0, void 0, function () {
            var hostchallenge, selectresponse, initresponse, seq, session, cardchallenge, cardexpected, cardactual, hostactual, externalauth, sig, authresponse, packagesraw, appletsraw, packages, applets, r, data, zdata, loadresponse;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        hostchallenge = crypto_1.randomBytes(8).toString("hex");
                        return [4 /*yield*/, card.issueCommand(APDU_STATIC.selectGp)];
                    case 1:
                        selectresponse = _b.sent();
                        check(SW_OK(selectresponse), "unexpected " + SW(selectresponse).toString(16));
                        return [4 /*yield*/, card.issueCommand("8050000008" + hostchallenge + "28")];
                    case 2:
                        initresponse = _b.sent();
                        check(SW_OK(initresponse), "unexpected " + SW(selectresponse).toString(16));
                        check(initresponse.length === 30, "init response length incorrect");
                        seq = initresponse.slice(12, 14).toString("hex");
                        session = {
                            cmac: enccbc3des(Buffer.from("0101" + seq + "000000000000000000000000", "hex"), Buffer.from(authkey, "hex")),
                            rmac: enccbc3des(Buffer.from("0102" + seq + "000000000000000000000000", "hex"), Buffer.from(authkey, "hex")),
                            dek: enccbc3des(Buffer.from("0181" + seq + "000000000000000000000000", "hex"), Buffer.from(authkey, "hex")),
                            enc: enccbc3des(Buffer.from("0182" + seq + "000000000000000000000000", "hex"), Buffer.from(authkey, "hex"))
                        };
                        cardchallenge = initresponse.slice(12, 20).toString("hex");
                        cardexpected = initresponse.slice(20, 28).toString("hex");
                        cardactual = enccbc3des(Buffer.from(hostchallenge + cardchallenge + "8000000000000000", "hex"), session.enc).slice(16, 24).toString("hex");
                        hostactual = enccbc3des(Buffer.from(cardchallenge + hostchallenge + "8000000000000000", "hex"), session.enc).slice(16, 24).toString("hex");
                        check(cardexpected === cardactual, "card cryptogram failed");
                        externalauth = "8482000010" + hostactual;
                        sig = cardcrypto_1.CardCrypto.getRetailMac(session.cmac.toString("hex"), externalauth, "0000000000000000");
                        externalauth += sig.toString("hex");
                        return [4 /*yield*/, card.issueCommand(externalauth)];
                    case 3:
                        authresponse = _b.sent();
                        check(SW_OK(authresponse), "unexpected auth response " + SW(authresponse).toString(16));
                        console.log("gp device authenticated and ready");
                        return [4 /*yield*/, card.issueCommand(APDU_STATIC.lsPackage)];
                    case 4:
                        packagesraw = _b.sent();
                        return [4 /*yield*/, card.issueCommand(APDU_STATIC.lsApplet)
                            // packages and applets - 1 aid len, n aid, 1 state, 1 privs
                        ];
                    case 5:
                        appletsraw = _b.sent();
                        packages = readStatus(packagesraw);
                        applets = readStatus(appletsraw);
                        console.log(packages);
                        console.log(applets);
                        return [4 /*yield*/, Promise.all(packages.map(function (p) { return card.issueCommand("80e40080" + hbyte(p.aid.length + 2) + "4f" + hbyte(p.aid.length) + Buffer.from(p.aid).toString("hex") + "00"); }))];
                    case 6:
                        r = _b.sent();
                        console.log(r);
                        data = fs_1.readFileSync("d:/javacard-ndef-full-plain.cap");
                        return [4 /*yield*/, jszip_1.loadAsync(data)];
                    case 7:
                        zdata = _b.sent();
                        zdata.forEach(function (path, file) {
                            console.log(path);
                        });
                        return [4 /*yield*/, cardcrypto_1.CardCrypto.installForLoad(card, zdata)];
                    case 8:
                        loadresponse = _b.sent();
                        check(SW_OK(loadresponse), "unexpected response for INSTALL (for load) " + SW(loadresponse).toString(16));
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkFtSkk7O0FBbkpKLGlDQUFrRjtBQUNsRiwyQ0FBMEM7QUFFMUMseUJBQTJDO0FBQzNDLCtCQUE0QztBQUU1QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDdEMsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQTtBQUNqQyxJQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFBO0FBRTdCLElBQU0sT0FBTyxHQUFHLGtDQUFrQyxDQUFBO0FBRWxELElBQU0sRUFBRSxHQUFHLFVBQUMsTUFBYSxJQUFLLE9BQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUF0QyxDQUFzQyxDQUFBO0FBQ3BFLElBQU0sS0FBSyxHQUFHLFVBQUMsTUFBYSxJQUFLLE9BQUEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLE1BQU0sRUFBckIsQ0FBcUIsQ0FBQTtBQUV0RCxJQUFNLFdBQVcsR0FBRztJQUNoQixRQUFRLEVBQUUsWUFBWTtJQUN0QixTQUFTLEVBQUMsZ0JBQWdCO0lBQzFCLFFBQVEsRUFBQyxnQkFBZ0I7Q0FDNUIsQ0FBQTtBQUVELElBQU0sS0FBSyxHQUFHLFVBQUMsSUFBYSxFQUFFLE9BQWUsSUFBTyxJQUFJLENBQUMsSUFBSTtJQUFFLE1BQU0sT0FBTyxDQUFBLENBQUMsQ0FBQyxDQUFBO0FBRTlFLElBQU0sVUFBVSxHQUFHLFVBQUMsSUFBUSxFQUFFLEdBQU87SUFDakMsSUFBSSxNQUFNLEdBQUcsdUJBQWMsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNoRSx1REFBdUQ7SUFDdkQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUU1QixJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzNCLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUN0QixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDckQsQ0FBQyxDQUFBO0FBRUQsSUFBTSxLQUFLLEdBQUcsVUFBQyxDQUFLLElBQUssT0FBQSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQXpDLENBQXlDLENBQUE7QUFFbEUsSUFBTSxVQUFVLEdBQUcsVUFBQyxRQUFlO0lBQy9CLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQTtJQUNaLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQTtJQUNaLElBQUksTUFBTSxHQUFTLEVBQUUsQ0FBQTtJQUNyQixRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBTTtRQUNwQixRQUFRLElBQUksRUFBRTtZQUNWLEtBQUssQ0FBQztnQkFDRixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxDQUFDLENBQUE7Z0JBQ3JCLElBQUksR0FBRyxDQUFDLENBQUE7Z0JBQ1IsSUFBSSxHQUFHLENBQUMsQ0FBQTtnQkFDUixNQUFLO1lBQ1QsS0FBSyxDQUFDO2dCQUNGLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3JDLElBQUksRUFBRSxDQUFBO2dCQUNOLElBQUksSUFBSSxLQUFLLENBQUM7b0JBQ1YsSUFBSSxHQUFHLENBQUMsQ0FBQTtnQkFDWixNQUFLO1lBQ1QsS0FBSyxDQUFDO2dCQUNGLElBQUksR0FBRyxDQUFDLENBQUE7Z0JBQ1IsTUFBSztZQUNULEtBQUssQ0FBQztnQkFDRixJQUFJLEdBQUcsQ0FBQyxDQUFBO2dCQUNSLE1BQUs7WUFDVCxLQUFLLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRztvQkFDVCxJQUFJLEdBQUcsQ0FBQyxDQUFBO3FCQUNQO29CQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQTtvQkFDckIsSUFBSSxHQUFHLENBQUMsQ0FBQTtvQkFDUixJQUFJLEdBQUcsQ0FBQyxDQUFBO2lCQUNYO2dCQUNELE1BQUs7WUFDVCxLQUFLLENBQUM7Z0JBQ0YsTUFBSztTQUNaO0lBQ0wsQ0FBQyxDQUFDLENBQUE7SUFDRixPQUFPLE1BQU0sQ0FBQTtBQUNqQixDQUFDLENBQUE7QUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQUMsRUFBYztRQUFaLGtCQUFNO0lBQ3BDLCtEQUErRDtJQUMvRCxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFPLEVBQVk7WUFBVixjQUFJOzs7Ozs7d0JBR2hDLGFBQWEsR0FBRyxvQkFBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTt3QkFHN0IscUJBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUE7O3dCQUE5RCxjQUFjLEdBQUcsU0FBNkM7d0JBQ2xFLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUUsZ0JBQWMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUcsQ0FBQyxDQUFBO3dCQUcxRCxxQkFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLEVBQUE7O3dCQUEzRSxZQUFZLEdBQUcsU0FBNEQ7d0JBQy9FLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUUsZ0JBQWMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUcsQ0FBQyxDQUFBO3dCQUMzRSxLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxFQUFFLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQTt3QkFRL0QsR0FBRyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTt3QkFDaEQsT0FBTyxHQUFHOzRCQUNWLElBQUksRUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDOzRCQUM5RyxJQUFJLEVBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRywwQkFBMEIsRUFBRSxLQUFLLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzs0QkFDOUcsR0FBRyxFQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7NEJBQzlHLEdBQUcsRUFBSyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO3lCQUNqSCxDQUFBO3dCQUVHLGFBQWEsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQzFELFlBQVksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQ3pELFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxHQUFHLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTt3QkFDMUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLEdBQUcsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO3dCQUM5SSxLQUFLLENBQUMsWUFBWSxLQUFLLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxDQUFBO3dCQUV4RCxZQUFZLEdBQUcsWUFBWSxHQUFHLFVBQVUsQ0FBQTt3QkFDeEMsR0FBRyxHQUFHLHVCQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFLFlBQVksRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO3dCQUNqRyxZQUFZLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTt3QkFDaEIscUJBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBQTs7d0JBQXBELFlBQVksR0FBRyxTQUFxQzt3QkFDeEQsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSw4QkFBNEIsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUcsQ0FBQyxDQUFBO3dCQUV2RixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUE7d0JBRzlCLHFCQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFBOzt3QkFBNUQsV0FBVyxHQUFHLFNBQThDO3dCQUMvQyxxQkFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7NEJBRTlELDREQUE0RDswQkFGRTs7d0JBQTFELFVBQVUsR0FBRyxTQUE2Qzt3QkFHMUQsUUFBUSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQTt3QkFDbEMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQTt3QkFHcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTt3QkFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTt3QkFJWixxQkFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxVQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBSSxDQUFDLEVBQXRILENBQXNILENBQUMsQ0FBQyxFQUFBOzt3QkFBaEssQ0FBQyxHQUFHLFNBQTRKO3dCQUNwSyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO3dCQUlSLElBQUksR0FBRyxpQkFBWSxDQUFDLGlDQUFpQyxDQUFDLENBQUE7d0JBQzlDLHFCQUFNLGlCQUFPLENBQUMsSUFBSSxDQUFDLEVBQUE7O3dCQUEzQixLQUFLLEdBQUcsU0FBbUI7d0JBQ2pDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUMsSUFBSTs0QkFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDckIsQ0FBQyxDQUFDLENBQUE7d0JBRW1CLHFCQUFNLHVCQUFVLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBQTs7d0JBQTNELFlBQVksR0FBRyxTQUE0Qzt3QkFDakUsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxnREFBOEMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUcsQ0FBQyxDQUFBOzs7OztLQUU1RyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNpcGhlcml2LCBjcmVhdGVEZWNpcGhlcml2LCByYW5kb21CeXRlcywgY3JlYXRlSGFzaCB9IGZyb20gXCJjcnlwdG9cIlxyXG5pbXBvcnQgeyBDYXJkQ3J5cHRvIH0gZnJvbSBcIi4vY2FyZGNyeXB0b1wiO1xyXG5pbXBvcnQgeyBpc0FycmF5IH0gZnJvbSBcInV0aWxcIjtcclxuaW1wb3J0IHsgcmVhZEZpbGUsIHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiXHJcbmltcG9ydCB7IGxvYWRBc3luYyBhcyBsb2FkWmlwIH0gZnJvbSBcImpzemlwXCJcclxuXHJcbmNvbnN0IHNtYXJ0Y2FyZCA9IHJlcXVpcmUoJ3NtYXJ0Y2FyZCcpXHJcbmNvbnN0IERldmljZXMgPSBzbWFydGNhcmQuRGV2aWNlc1xyXG5jb25zdCBkZXZpY2VzID0gbmV3IERldmljZXMoKVxyXG5cclxuY29uc3QgYXV0aGtleSA9IFwiNDA0MTQyNDM0NDQ1NDY0NzQ4NDk0YTRiNGM0ZDRlNGZcIlxyXG5cclxuY29uc3QgU1cgPSAoYnVmZmVyOkJ1ZmZlcikgPT4gYnVmZmVyLnJlYWRVSW50MTZCRShidWZmZXIubGVuZ3RoIC0gMilcclxuY29uc3QgU1dfT0sgPSAoYnVmZmVyOkJ1ZmZlcikgPT4gU1coYnVmZmVyKSA9PT0gMHg5MDAwXHJcblxyXG5jb25zdCBBUERVX1NUQVRJQyA9IHtcclxuICAgIHNlbGVjdEdwOiBcIjAwYTQwNDAwMDBcIixcclxuICAgIGxzUGFja2FnZTpcIjgwZjIyMDAwMDI0ZjAwXCIsXHJcbiAgICBsc0FwcGxldDpcIjgwZjI0MDAwMDI0ZjAwXCIsXHJcbn1cclxuXHJcbmNvbnN0IGNoZWNrID0gKHRlc3Q6IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZykgPT4geyBpZiAoIXRlc3QpIHRocm93IG1lc3NhZ2UgfVxyXG5cclxuY29uc3QgZW5jY2JjM2RlcyA9IChkYXRhOmFueSwga2V5OmFueSkgPT4ge1xyXG4gICAgbGV0IGNpcGhlciA9IGNyZWF0ZUNpcGhlcml2KCdkZXMtZWRlLWNiYycsIGtleSwgQnVmZmVyLmFsbG9jKDgpKVxyXG4gICAgLy9sZXQgY2lwaGVyID0gY3J5cHRvLmNyZWF0ZUNpcGhlcignZGVzLWVkZTMtY2JjJywga2V5KVxyXG4gICAgY2lwaGVyLnNldEF1dG9QYWRkaW5nKGZhbHNlKVxyXG5cclxuICAgIGxldCBiID0gY2lwaGVyLnVwZGF0ZShkYXRhKVxyXG4gICAgbGV0IGYgPSBjaXBoZXIuZmluYWwoKVxyXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW2IsIGZdLCBiLmxlbmd0aCArIGYubGVuZ3RoKVxyXG59XHJcblxyXG5jb25zdCBoYnl0ZSA9ICh4OmFueSkgPT4geC50b1N0cmluZyhcIjE2XCIpLnJlcGxhY2UoLyheXFxkJCkvLCBcIjAkMVwiKVxyXG5cclxuY29uc3QgcmVhZFN0YXR1cyA9IChyZXNwb25zZTpCdWZmZXIpID0+IHtcclxuICAgIGxldCBtb2RlID0gMFxyXG4gICAgbGV0IHJlYWQgPSAwXHJcbiAgICBsZXQgb3V0cHV0OmFueVtdID0gW11cclxuICAgIHJlc3BvbnNlLmZvckVhY2goKGU6IGFueSkgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAobW9kZSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgIHJlYWQgPSBlXHJcbiAgICAgICAgICAgICAgICBtb2RlID0gMVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgb3V0cHV0W291dHB1dC5sZW5ndGggLSAxXS5haWQucHVzaChlKSAgICBcclxuICAgICAgICAgICAgICAgIHJlYWQtLVxyXG4gICAgICAgICAgICAgICAgaWYgKHJlYWQgPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDJcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIG1vZGUgPSAzXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBtb2RlID0gNFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgaWYgKGUgPT09IDE0NClcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gNVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goe2FpZDpbXX0pXHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZCA9IGVcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gMVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSA1OlxyXG4gICAgICAgICAgICAgICAgYnJlYWsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgfSAgXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIG91dHB1dFxyXG59XHJcblxyXG5kZXZpY2VzLm9uKCdkZXZpY2UtYWN0aXZhdGVkJywgKHsgZGV2aWNlIH06YW55KSA9PiB7XHJcbiAgICAvLyBkZXZpY2Uuc2V0U2hhcmVNb2RlKDIpIC8vIFRPRE86IGJlbmJlbmJlbmJlbmJlbmJlbi9zbWFydGNhcmRcclxuICAgIGRldmljZS5vbignY2FyZC1pbnNlcnRlZCcsIGFzeW5jICh7IGNhcmQgfTphbnkpID0+IHtcclxuXHJcbiAgICAgICAgLy8gc2V0dXBcclxuICAgICAgICBsZXQgaG9zdGNoYWxsZW5nZSA9IHJhbmRvbUJ5dGVzKDgpLnRvU3RyaW5nKFwiaGV4XCIpXHJcblxyXG4gICAgICAgIC8vIDEuIHNlbGVjdCBncFxyXG4gICAgICAgIGxldCBzZWxlY3RyZXNwb25zZSA9IGF3YWl0IGNhcmQuaXNzdWVDb21tYW5kKEFQRFVfU1RBVElDLnNlbGVjdEdwKVxyXG4gICAgICAgIGNoZWNrKFNXX09LKHNlbGVjdHJlc3BvbnNlKSwgYHVuZXhwZWN0ZWQgJHtTVyhzZWxlY3RyZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcblxyXG4gICAgICAgIC8vIDIuIGluaXQgdXBkYXRlXHJcbiAgICAgICAgbGV0IGluaXRyZXNwb25zZSA9IGF3YWl0IGNhcmQuaXNzdWVDb21tYW5kKFwiODA1MDAwMDAwOFwiICsgaG9zdGNoYWxsZW5nZSArIFwiMjhcIilcclxuICAgICAgICBjaGVjayhTV19PSyhpbml0cmVzcG9uc2UpLCBgdW5leHBlY3RlZCAke1NXKHNlbGVjdHJlc3BvbnNlKS50b1N0cmluZygxNil9YClcclxuICAgICAgICBjaGVjayhpbml0cmVzcG9uc2UubGVuZ3RoID09PSAzMCwgYGluaXQgcmVzcG9uc2UgbGVuZ3RoIGluY29ycmVjdGApXHJcbiAgICAgICAgLyoqKlxyXG4gICAgICAgICAqIGtleSBkaXYgZGF0YSAgICAgMTBcclxuICAgICAgICAgKiBrZXkgaW5mbyAgICAgICAgIDJcclxuICAgICAgICAgKiBzZXEgICAgICAgICAgICAgIDJcclxuICAgICAgICAgKiBjaGFsbGVuZ2UgICAgICAgIDZcclxuICAgICAgICAgKiBjcnlwdG9ncmFtICAgICAgIDhcclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgc2VxID0gaW5pdHJlc3BvbnNlLnNsaWNlKDEyLCAxNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBsZXQgc2Vzc2lvbiA9IHtcclxuICAgICAgICAgICAgY21hYzogICBlbmNjYmMzZGVzKEJ1ZmZlci5mcm9tKFwiMDEwMVwiICsgc2VxICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKGF1dGhrZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgcm1hYzogICBlbmNjYmMzZGVzKEJ1ZmZlci5mcm9tKFwiMDEwMlwiICsgc2VxICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKGF1dGhrZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgZGVrOiAgICBlbmNjYmMzZGVzKEJ1ZmZlci5mcm9tKFwiMDE4MVwiICsgc2VxICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKGF1dGhrZXksIFwiaGV4XCIpKSxcclxuICAgICAgICAgICAgZW5jOiAgICBlbmNjYmMzZGVzKEJ1ZmZlci5mcm9tKFwiMDE4MlwiICsgc2VxICsgXCIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIEJ1ZmZlci5mcm9tKGF1dGhrZXksIFwiaGV4XCIpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNhcmRjaGFsbGVuZ2UgPSBpbml0cmVzcG9uc2Uuc2xpY2UoMTIsIDIwKS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGxldCBjYXJkZXhwZWN0ZWQgPSBpbml0cmVzcG9uc2Uuc2xpY2UoMjAsIDI4KS50b1N0cmluZyhcImhleFwiKVxyXG4gICAgICAgIGxldCBjYXJkYWN0dWFsID0gZW5jY2JjM2RlcyhCdWZmZXIuZnJvbShob3N0Y2hhbGxlbmdlICsgY2FyZGNoYWxsZW5nZSArIFwiODAwMDAwMDAwMDAwMDAwMFwiLCBcImhleFwiKSwgc2Vzc2lvbi5lbmMpLnNsaWNlKDE2LCAyNCkudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBsZXQgaG9zdGFjdHVhbCA9IGVuY2NiYzNkZXMoQnVmZmVyLmZyb20oY2FyZGNoYWxsZW5nZSArIGhvc3RjaGFsbGVuZ2UgKyBcIjgwMDAwMDAwMDAwMDAwMDBcIiwgXCJoZXhcIiksIHNlc3Npb24uZW5jKS5zbGljZSgxNiwgMjQpLnRvU3RyaW5nKFwiaGV4XCIpXHJcbiAgICAgICAgY2hlY2soY2FyZGV4cGVjdGVkID09PSBjYXJkYWN0dWFsLCBgY2FyZCBjcnlwdG9ncmFtIGZhaWxlZGApXHJcblxyXG4gICAgICAgIGxldCBleHRlcm5hbGF1dGggPSBcIjg0ODIwMDAwMTBcIiArIGhvc3RhY3R1YWxcclxuICAgICAgICBsZXQgc2lnID0gQ2FyZENyeXB0by5nZXRSZXRhaWxNYWMoc2Vzc2lvbi5jbWFjLnRvU3RyaW5nKFwiaGV4XCIpLCBleHRlcm5hbGF1dGgsIFwiMDAwMDAwMDAwMDAwMDAwMFwiKVxyXG4gICAgICAgIGV4dGVybmFsYXV0aCArPSBzaWcudG9TdHJpbmcoXCJoZXhcIilcclxuICAgICAgICBsZXQgYXV0aHJlc3BvbnNlID0gYXdhaXQgY2FyZC5pc3N1ZUNvbW1hbmQoZXh0ZXJuYWxhdXRoKVxyXG4gICAgICAgIGNoZWNrKFNXX09LKGF1dGhyZXNwb25zZSksIGB1bmV4cGVjdGVkIGF1dGggcmVzcG9uc2UgJHtTVyhhdXRocmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZ3AgZGV2aWNlIGF1dGhlbnRpY2F0ZWQgYW5kIHJlYWR5XCIpXHJcblxyXG4gICAgICAgIC8vIGxpc3QgcGFja2FnZXMgKyBhcHBsZXRzXHJcbiAgICAgICAgbGV0IHBhY2thZ2VzcmF3ID0gYXdhaXQgY2FyZC5pc3N1ZUNvbW1hbmQoQVBEVV9TVEFUSUMubHNQYWNrYWdlKVxyXG4gICAgICAgIGxldCBhcHBsZXRzcmF3ID0gYXdhaXQgY2FyZC5pc3N1ZUNvbW1hbmQoQVBEVV9TVEFUSUMubHNBcHBsZXQpXHJcblxyXG4gICAgICAgIC8vIHBhY2thZ2VzIGFuZCBhcHBsZXRzIC0gMSBhaWQgbGVuLCBuIGFpZCwgMSBzdGF0ZSwgMSBwcml2c1xyXG4gICAgICAgIGxldCBwYWNrYWdlcyA9IHJlYWRTdGF0dXMocGFja2FnZXNyYXcpXHJcbiAgICAgICAgbGV0IGFwcGxldHMgPSByZWFkU3RhdHVzKGFwcGxldHNyYXcpXHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKHBhY2thZ2VzKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGFwcGxldHMpXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhhcHBsZXRzcmF3KVxyXG5cclxuICAgICAgICAvLyBkZWxldGUgcGFja2FnZXMgKHJlY3Vyc2l2ZSA9IDgwKVxyXG4gICAgICAgIGxldCByID0gYXdhaXQgUHJvbWlzZS5hbGwocGFja2FnZXMubWFwKHAgPT4gY2FyZC5pc3N1ZUNvbW1hbmQoYDgwZTQwMDgwJHtoYnl0ZShwLmFpZC5sZW5ndGggKyAyKX00ZiR7aGJ5dGUocC5haWQubGVuZ3RoKX0ke0J1ZmZlci5mcm9tKHAuYWlkKS50b1N0cmluZyhcImhleFwiKX0wMGApKSlcclxuICAgICAgICBjb25zb2xlLmxvZyhyKVxyXG5cclxuICAgICAgICAvLyBsb2FkIGNhcCBmaWxlIChlLmcuIG5kZWYgdGFnKVxyXG4gICAgICAgIC8vIEQ6XFxqYXZhY2FyZC1uZGVmLWZ1bGwtcGxhaW4uY2FwXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlYWRGaWxlU3luYyhcImQ6L2phdmFjYXJkLW5kZWYtZnVsbC1wbGFpbi5jYXBcIilcclxuICAgICAgICBjb25zdCB6ZGF0YSA9IGF3YWl0IGxvYWRaaXAoZGF0YSlcclxuICAgICAgICB6ZGF0YS5mb3JFYWNoKChwYXRoLGZpbGUpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocGF0aClcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zdCBsb2FkcmVzcG9uc2UgPSBhd2FpdCBDYXJkQ3J5cHRvLmluc3RhbGxGb3JMb2FkKGNhcmQsIHpkYXRhKVxyXG4gICAgICAgIGNoZWNrKFNXX09LKGxvYWRyZXNwb25zZSksIGB1bmV4cGVjdGVkIHJlc3BvbnNlIGZvciBJTlNUQUxMIChmb3IgbG9hZCkgJHtTVyhsb2FkcmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG5cclxuICAgIH0pXHJcbn0pOyAiXX0=