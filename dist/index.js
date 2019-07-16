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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var CardCrypto_1 = require("./CardCrypto");
var fs_1 = require("fs");
var jszip_1 = require("jszip");
var GlobalPlatform_1 = __importDefault(require("./GlobalPlatform"));
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
            var gpcard, packages, applets, data, zdata, loadresponse;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        gpcard = new GlobalPlatform_1.default(card);
                        return [4 /*yield*/, gpcard.connect()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, gpcard.getPackages()];
                    case 2:
                        packages = _b.sent();
                        return [4 /*yield*/, gpcard.getApplets()];
                    case 3:
                        applets = _b.sent();
                        console.log(packages);
                        console.log(applets);
                        data = fs_1.readFileSync("d:/javacard-ndef-full-plain.cap");
                        return [4 /*yield*/, jszip_1.loadAsync(data)];
                    case 4:
                        zdata = _b.sent();
                        zdata.forEach(function (path, file) {
                            console.log(path);
                        });
                        return [4 /*yield*/, CardCrypto_1.CardCrypto.installForLoad(card, zdata)];
                    case 5:
                        loadresponse = _b.sent();
                        check(SW_OK(loadresponse), "unexpected response for INSTALL (for load) " + SW(loadresponse).toString(16));
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkEyRkk7O0FBMUZKLDJDQUEwQztBQUUxQyx5QkFBMkM7QUFDM0MsK0JBQTRDO0FBQzVDLG9FQUE4QztBQUU5QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDdEMsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQTtBQUNqQyxJQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFBO0FBRTdCLElBQU0sT0FBTyxHQUFHLGtDQUFrQyxDQUFBO0FBRWxELElBQU0sRUFBRSxHQUFHLFVBQUMsTUFBYSxJQUFLLE9BQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUF0QyxDQUFzQyxDQUFBO0FBQ3BFLElBQU0sS0FBSyxHQUFHLFVBQUMsTUFBYSxJQUFLLE9BQUEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLE1BQU0sRUFBckIsQ0FBcUIsQ0FBQTtBQUV0RCxJQUFNLFdBQVcsR0FBRztJQUNoQixRQUFRLEVBQUUsWUFBWTtJQUN0QixTQUFTLEVBQUMsZ0JBQWdCO0lBQzFCLFFBQVEsRUFBQyxnQkFBZ0I7Q0FDNUIsQ0FBQTtBQUVELElBQU0sS0FBSyxHQUFHLFVBQUMsSUFBYSxFQUFFLE9BQWUsSUFBTyxJQUFJLENBQUMsSUFBSTtJQUFFLE1BQU0sT0FBTyxDQUFBLENBQUMsQ0FBQyxDQUFBO0FBRTlFLElBQU0sS0FBSyxHQUFHLFVBQUMsQ0FBSyxJQUFLLE9BQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUF6QyxDQUF5QyxDQUFBO0FBRWxFLElBQU0sVUFBVSxHQUFHLFVBQUMs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cGhlcml2LCBjcmVhdGVEZWNpcGhlcml2LCByYW5kb21CeXRlcywgY3JlYXRlSGFzaCB9IGZyb20gXCJjcnlwdG9cIlxyXG5pbXBvcnQgeyBDYXJkQ3J5cHRvIH0gZnJvbSBcIi4vQ2FyZENyeXB0b1wiO1xyXG5pbXBvcnQgeyBpc0FycmF5IH0gZnJvbSBcInV0aWxcIjtcclxuaW1wb3J0IHsgcmVhZEZpbGUsIHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiXHJcbmltcG9ydCB7IGxvYWRBc3luYyBhcyBsb2FkWmlwIH0gZnJvbSBcImpzemlwXCJcclxuaW1wb3J0IEdsb2JhbFBsYXRmb3JtIGZyb20gXCIuL0dsb2JhbFBsYXRmb3JtXCI7XHJcblxyXG5jb25zdCBzbWFydGNhcmQgPSByZXF1aXJlKCdzbWFydGNhcmQnKVxyXG5jb25zdCBEZXZpY2VzID0gc21hcnRjYXJkLkRldmljZXNcclxuY29uc3QgZGV2aWNlcyA9IG5ldyBEZXZpY2VzKClcclxuXHJcbmNvbnN0IGF1dGhrZXkgPSBcIjQwNDE0MjQzNDQ0NTQ2NDc0ODQ5NGE0YjRjNGQ0ZTRmXCJcclxuXHJcbmNvbnN0IFNXID0gKGJ1ZmZlcjpCdWZmZXIpID0+IGJ1ZmZlci5yZWFkVUludDE2QkUoYnVmZmVyLmxlbmd0aCAtIDIpXHJcbmNvbnN0IFNXX09LID0gKGJ1ZmZlcjpCdWZmZXIpID0+IFNXKGJ1ZmZlcikgPT09IDB4OTAwMFxyXG5cclxuY29uc3QgQVBEVV9TVEFUSUMgPSB7XHJcbiAgICBzZWxlY3RHcDogXCIwMGE0MDQwMDAwXCIsXHJcbiAgICBsc1BhY2thZ2U6XCI4MGYyMjAwMDAyNGYwMFwiLFxyXG4gICAgbHNBcHBsZXQ6XCI4MGYyNDAwMDAyNGYwMFwiLFxyXG59XHJcblxyXG5jb25zdCBjaGVjayA9ICh0ZXN0OiBib29sZWFuLCBtZXNzYWdlOiBzdHJpbmcpID0+IHsgaWYgKCF0ZXN0KSB0aHJvdyBtZXNzYWdlIH1cclxuXHJcbmNvbnN0IGhieXRlID0gKHg6YW55KSA9PiB4LnRvU3RyaW5nKFwiMTZcIikucmVwbGFjZSgvKF5cXGQkKS8sIFwiMCQxXCIpXHJcblxyXG5jb25zdCByZWFkU3RhdHVzID0gKHJlc3BvbnNlOkJ1ZmZlcikgPT4ge1xyXG4gICAgbGV0IG1vZGUgPSAwXHJcbiAgICBsZXQgcmVhZCA9IDBcclxuICAgIGxldCBvdXRwdXQ6YW55W10gPSBbXVxyXG4gICAgcmVzcG9uc2UuZm9yRWFjaCgoZTogYW55KSA9PiB7XHJcbiAgICAgICAgc3dpdGNoIChtb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHthaWQ6W119KVxyXG4gICAgICAgICAgICAgICAgcmVhZCA9IGVcclxuICAgICAgICAgICAgICAgIG1vZGUgPSAxXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRbb3V0cHV0Lmxlbmd0aCAtIDFdLmFpZC5wdXNoKGUpICAgIFxyXG4gICAgICAgICAgICAgICAgcmVhZC0tXHJcbiAgICAgICAgICAgICAgICBpZiAocmVhZCA9PT0gMClcclxuICAgICAgICAgICAgICAgICAgICBtb2RlID0gMlxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgbW9kZSA9IDNcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIG1vZGUgPSA0XHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBpZiAoZSA9PT0gMTQ0KVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSA1XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCh7YWlkOltdfSlcclxuICAgICAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSAxXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICBicmVhayAgICAgICAgICAgICAgICBcclxuICAgICAgICB9ICBcclxuICAgIH0pXHJcbiAgICByZXR1cm4gb3V0cHV0XHJcbn1cclxuXHJcbmRldmljZXMub24oJ2RldmljZS1hY3RpdmF0ZWQnLCAoeyBkZXZpY2UgfTphbnkpID0+IHtcclxuICAgIC8vIGRldmljZS5zZXRTaGFyZU1vZGUoMikgLy8gVE9ETzogYmVuYmVuYmVuYmVuYmVuYmVuL3NtYXJ0Y2FyZFxyXG4gICAgZGV2aWNlLm9uKCdjYXJkLWluc2VydGVkJywgYXN5bmMgKHsgY2FyZCB9OmFueSkgPT4ge1xyXG5cclxuICAgICAgICBsZXQgZ3BjYXJkID0gbmV3IEdsb2JhbFBsYXRmb3JtKGNhcmQpXHJcbiAgICAgICAgYXdhaXQgZ3BjYXJkLmNvbm5lY3QoKVxyXG5cclxuICAgICAgICBsZXQgcGFja2FnZXMgPSBhd2FpdCBncGNhcmQuZ2V0UGFja2FnZXMoKVxyXG4gICAgICAgIGxldCBhcHBsZXRzID0gYXdhaXQgZ3BjYXJkLmdldEFwcGxldHMoKVxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnNvbGUubG9nKHBhY2thZ2VzKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGFwcGxldHMpXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhhcHBsZXRzcmF3KVxyXG5cclxuICAgICAgICAvLyBsb2FkIGNhcCBmaWxlIChlLmcuIG5kZWYgdGFnKVxyXG4gICAgICAgIC8vIEQ6XFxqYXZhY2FyZC1uZGVmLWZ1bGwtcGxhaW4uY2FwXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHJlYWRGaWxlU3luYyhcImQ6L2phdmFjYXJkLW5kZWYtZnVsbC1wbGFpbi5jYXBcIilcclxuICAgICAgICBjb25zdCB6ZGF0YSA9IGF3YWl0IGxvYWRaaXAoZGF0YSlcclxuICAgICAgICB6ZGF0YS5mb3JFYWNoKChwYXRoLGZpbGUpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocGF0aClcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zdCBsb2FkcmVzcG9uc2UgPSBhd2FpdCBDYXJkQ3J5cHRvLmluc3RhbGxGb3JMb2FkKGNhcmQsIHpkYXRhKVxyXG4gICAgICAgIGNoZWNrKFNXX09LKGxvYWRyZXNwb25zZSksIGB1bmV4cGVjdGVkIHJlc3BvbnNlIGZvciBJTlNUQUxMIChmb3IgbG9hZCkgJHtTVyhsb2FkcmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG5cclxuICAgIH0pXHJcbn0pOyAiXX0=