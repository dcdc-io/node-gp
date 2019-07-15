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
            var gpcard, packages, applets, r, data, zdata, loadresponse;
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
                        return [4 /*yield*/, Promise.all(packages.map(function (p) { return card.issueCommand("80e40080" + hbyte(p.aid.length + 2) + "4f" + hbyte(p.aid.length) + Buffer.from(p.aid).toString("hex") + "00"); }))];
                    case 4:
                        r = _b.sent();
                        console.log(r);
                        data = fs_1.readFileSync("d:/javacard-ndef-full-plain.cap");
                        return [4 /*yield*/, jszip_1.loadAsync(data)];
                    case 5:
                        zdata = _b.sent();
                        zdata.forEach(function (path, file) {
                            console.log(path);
                        });
                        return [4 /*yield*/, CardCrypto_1.CardCrypto.installForLoad(card, zdata)];
                    case 6:
                        loadresponse = _b.sent();
                        check(SW_OK(loadresponse), "unexpected response for INSTALL (for load) " + SW(loadresponse).toString(16));
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkErRkk7O0FBOUZKLDJDQUEwQztBQUUxQyx5QkFBMkM7QUFDM0MsK0JBQTRDO0FBQzVDLG9FQUE4QztBQUU5QyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDdEMsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQTtBQUNqQyxJQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFBO0FBRTdCLElBQU0sT0FBTyxHQUFHLGtDQUFrQyxDQUFBO0FBRWxELElBQU0sRUFBRSxHQUFHLFVBQUMsTUFBYSxJQUFLLE9BQUEsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUF0QyxDQUFzQyxDQUFBO0FBQ3BFLElBQU0sS0FBSyxHQUFHLFVBQUMsTUFBYSxJQUFLLE9BQUEsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLE1BQU0sRUFBckIsQ0FBcUIsQ0FBQTtBQUV0RCxJQUFNLFdBQVcsR0FBRztJQUNoQixRQUFRLEVBQUUsWUFBWTtJQUN0QixTQUFTLEVBQUMsZ0JBQWdCO0lBQzFCLFFBQVEsRUFBQyxnQkFBZ0I7Q0FDNUIsQ0FBQTtBQUVELElBQU0sS0FBSyxHQUFHLFVBQUMsSUFBYSxFQUFFLE9BQWUsSUFBTyxJQUFJLENBQUMsSUFBSTtJQUFFLE1BQU0sT0FBTyxDQUFBLENBQUMsQ0FBQyxDQUFBO0FBRTlFLElBQU0sS0FBSyxHQUFHLFVBQUMsQ0FBSyxJQUFLLE9BQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUF6QyxDQUF5QyxDQUFBO0FBRWxFLElBQU0sVUFBVSxHQUFHLFVBQUMs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SyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBQyxJQUFJOzRCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUNyQixDQUFDLENBQUMsQ0FBQTt3QkFFbUIscUJBQU0sdUJBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFBOzt3QkFBM0QsWUFBWSxHQUFHLFNBQTRDO3dCQUNqRSxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLGdEQUE4QyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDLENBQUE7Ozs7O0tBRTVHLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ2lwaGVyaXYsIGNyZWF0ZURlY2lwaGVyaXYsIHJhbmRvbUJ5dGVzLCBjcmVhdGVIYXNoIH0gZnJvbSBcImNyeXB0b1wiXHJcbmltcG9ydCB7IENhcmRDcnlwdG8gfSBmcm9tIFwiLi9DYXJkQ3J5cHRvXCI7XHJcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tIFwidXRpbFwiO1xyXG5pbXBvcnQgeyByZWFkRmlsZSwgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCJcclxuaW1wb3J0IHsgbG9hZEFzeW5jIGFzIGxvYWRaaXAgfSBmcm9tIFwianN6aXBcIlxyXG5pbXBvcnQgR2xvYmFsUGxhdGZvcm0gZnJvbSBcIi4vR2xvYmFsUGxhdGZvcm1cIjtcclxuXHJcbmNvbnN0IHNtYXJ0Y2FyZCA9IHJlcXVpcmUoJ3NtYXJ0Y2FyZCcpXHJcbmNvbnN0IERldmljZXMgPSBzbWFydGNhcmQuRGV2aWNlc1xyXG5jb25zdCBkZXZpY2VzID0gbmV3IERldmljZXMoKVxyXG5cclxuY29uc3QgYXV0aGtleSA9IFwiNDA0MTQyNDM0NDQ1NDY0NzQ4NDk0YTRiNGM0ZDRlNGZcIlxyXG5cclxuY29uc3QgU1cgPSAoYnVmZmVyOkJ1ZmZlcikgPT4gYnVmZmVyLnJlYWRVSW50MTZCRShidWZmZXIubGVuZ3RoIC0gMilcclxuY29uc3QgU1dfT0sgPSAoYnVmZmVyOkJ1ZmZlcikgPT4gU1coYnVmZmVyKSA9PT0gMHg5MDAwXHJcblxyXG5jb25zdCBBUERVX1NUQVRJQyA9IHtcclxuICAgIHNlbGVjdEdwOiBcIjAwYTQwNDAwMDBcIixcclxuICAgIGxzUGFja2FnZTpcIjgwZjIyMDAwMDI0ZjAwXCIsXHJcbiAgICBsc0FwcGxldDpcIjgwZjI0MDAwMDI0ZjAwXCIsXHJcbn1cclxuXHJcbmNvbnN0IGNoZWNrID0gKHRlc3Q6IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZykgPT4geyBpZiAoIXRlc3QpIHRocm93IG1lc3NhZ2UgfVxyXG5cclxuY29uc3QgaGJ5dGUgPSAoeDphbnkpID0+IHgudG9TdHJpbmcoXCIxNlwiKS5yZXBsYWNlKC8oXlxcZCQpLywgXCIwJDFcIilcclxuXHJcbmNvbnN0IHJlYWRTdGF0dXMgPSAocmVzcG9uc2U6QnVmZmVyKSA9PiB7XHJcbiAgICBsZXQgbW9kZSA9IDBcclxuICAgIGxldCByZWFkID0gMFxyXG4gICAgbGV0IG91dHB1dDphbnlbXSA9IFtdXHJcbiAgICByZXNwb25zZS5mb3JFYWNoKChlOiBhbnkpID0+IHtcclxuICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goe2FpZDpbXX0pXHJcbiAgICAgICAgICAgICAgICByZWFkID0gZVxyXG4gICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIG91dHB1dFtvdXRwdXQubGVuZ3RoIC0gMV0uYWlkLnB1c2goZSkgICAgXHJcbiAgICAgICAgICAgICAgICByZWFkLS1cclxuICAgICAgICAgICAgICAgIGlmIChyZWFkID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGUgPSAyXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBtb2RlID0gM1xyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgbW9kZSA9IDRcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgIGlmIChlID09PSAxNDQpXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDVcclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKHthaWQ6W119KVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWQgPSBlXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZSA9IDFcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIGJyZWFrICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIH0gIFxyXG4gICAgfSlcclxuICAgIHJldHVybiBvdXRwdXRcclxufVxyXG5cclxuZGV2aWNlcy5vbignZGV2aWNlLWFjdGl2YXRlZCcsICh7IGRldmljZSB9OmFueSkgPT4ge1xyXG4gICAgLy8gZGV2aWNlLnNldFNoYXJlTW9kZSgyKSAvLyBUT0RPOiBiZW5iZW5iZW5iZW5iZW5iZW4vc21hcnRjYXJkXHJcbiAgICBkZXZpY2Uub24oJ2NhcmQtaW5zZXJ0ZWQnLCBhc3luYyAoeyBjYXJkIH06YW55KSA9PiB7XHJcblxyXG4gICAgICAgIGxldCBncGNhcmQgPSBuZXcgR2xvYmFsUGxhdGZvcm0oY2FyZClcclxuICAgICAgICBhd2FpdCBncGNhcmQuY29ubmVjdCgpXHJcblxyXG4gICAgICAgIGxldCBwYWNrYWdlcyA9IGF3YWl0IGdwY2FyZC5nZXRQYWNrYWdlcygpXHJcbiAgICAgICAgbGV0IGFwcGxldHMgPSBhd2FpdCBncGNhcmQuZ2V0QXBwbGV0cygpXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2cocGFja2FnZXMpXHJcbiAgICAgICAgY29uc29sZS5sb2coYXBwbGV0cylcclxuICAgICAgICAvL2NvbnNvbGUubG9nKGFwcGxldHNyYXcpXHJcblxyXG4gICAgICAgIC8vIGRlbGV0ZSBwYWNrYWdlcyAocmVjdXJzaXZlID0gODApXHJcbiAgICAgICAgbGV0IHIgPSBhd2FpdCBQcm9taXNlLmFsbChwYWNrYWdlcy5tYXAocCA9PiBjYXJkLmlzc3VlQ29tbWFuZChgODBlNDAwODAke2hieXRlKHAuYWlkLmxlbmd0aCArIDIpfTRmJHtoYnl0ZShwLmFpZC5sZW5ndGgpfSR7QnVmZmVyLmZyb20ocC5haWQpLnRvU3RyaW5nKFwiaGV4XCIpfTAwYCkpKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKHIpXHJcblxyXG4gICAgICAgIC8vIGxvYWQgY2FwIGZpbGUgKGUuZy4gbmRlZiB0YWcpXHJcbiAgICAgICAgLy8gRDpcXGphdmFjYXJkLW5kZWYtZnVsbC1wbGFpbi5jYXBcclxuICAgICAgICBjb25zdCBkYXRhID0gcmVhZEZpbGVTeW5jKFwiZDovamF2YWNhcmQtbmRlZi1mdWxsLXBsYWluLmNhcFwiKVxyXG4gICAgICAgIGNvbnN0IHpkYXRhID0gYXdhaXQgbG9hZFppcChkYXRhKVxyXG4gICAgICAgIHpkYXRhLmZvckVhY2goKHBhdGgsZmlsZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwYXRoKVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWRyZXNwb25zZSA9IGF3YWl0IENhcmRDcnlwdG8uaW5zdGFsbEZvckxvYWQoY2FyZCwgemRhdGEpXHJcbiAgICAgICAgY2hlY2soU1dfT0sobG9hZHJlc3BvbnNlKSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgZm9yIElOU1RBTEwgKGZvciBsb2FkKSAke1NXKGxvYWRyZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcblxyXG4gICAgfSlcclxufSk7ICJdfQ==