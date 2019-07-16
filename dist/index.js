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
var Utils_1 = require("./Utils");
var fs_1 = require("fs");
var jszip_1 = require("jszip");
var GlobalPlatform_1 = __importDefault(require("./GlobalPlatform"));
var smartcard = require('smartcard');
var Devices = smartcard.Devices;
var devices = new Devices();
devices.on('device-activated', function (_a) {
    var device = _a.device;
    // device.setShareMode(2) // TODO: benbenbenbenbenben/smartcard
    device.on('card-inserted', function (_a) {
        var card = _a.card;
        return setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var gpcard, packages, applets, data, zdata, loadresponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        device.on('card-removed', function (x) {
                            debugger;
                            console.log(x === card);
                        });
                        gpcard = new GlobalPlatform_1.default(card);
                        return [4 /*yield*/, gpcard.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, gpcard.getPackages()];
                    case 2:
                        packages = _a.sent();
                        return [4 /*yield*/, gpcard.getApplets()];
                    case 3:
                        applets = _a.sent();
                        console.log(packages);
                        console.log(applets);
                        data = fs_1.readFileSync("d:/javacard-ndef-full-plain.cap");
                        return [4 /*yield*/, jszip_1.loadAsync(data)];
                    case 4:
                        zdata = _a.sent();
                        zdata.forEach(function (path) {
                            console.log(path);
                        });
                        return [4 /*yield*/, CardCrypto_1.CardCrypto.installForLoad(card, zdata)];
                    case 5:
                        loadresponse = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(loadresponse), "unexpected response for INSTALL (for load) " + Utils_1.SW(loadresponse).toString(16));
                        return [2 /*return*/];
                }
            });
        }); }, 500 /* TODO: remove this delay hack for exclusive/shared access interference */);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkF5Q0k7O0FBekNKLDJDQUF5QztBQUN6QyxpQ0FBMEM7QUFDMUMseUJBQWlDO0FBQ2pDLCtCQUE0QztBQUM1QyxvRUFBNkM7QUFFN0MsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUE7QUFDakMsSUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUU3QixPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQUMsRUFBYztRQUFaLGtCQUFNO0lBQ3BDLCtEQUErRDtJQUMvRCxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLEVBQVU7WUFBVCxjQUFJO1FBQVUsT0FBQSxVQUFVLENBQUM7Ozs7O3dCQUVsRCxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFDLENBQUs7NEJBQzVCLFFBQVEsQ0FBQTs0QkFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQTt3QkFDM0IsQ0FBQyxDQUFDLENBQUE7d0JBRUUsTUFBTSxHQUFHLElBQUksd0JBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDckMscUJBQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFBOzt3QkFBdEIsU0FBc0IsQ0FBQTt3QkFFUCxxQkFBTSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUE7O3dCQUFyQyxRQUFRLEdBQUcsU0FBMEI7d0JBQzNCLHFCQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBQTs7d0JBQW5DLE9BQU8sR0FBRyxTQUF5Qjt3QkFFdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTt3QkFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTt3QkFLZCxJQUFJLEdBQUcsaUJBQVksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO3dCQUM5QyxxQkFBTSxpQkFBTyxDQUFDLElBQUksQ0FBQyxFQUFBOzt3QkFBM0IsS0FBSyxHQUFHLFNBQW1CO3dCQUNqQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTs0QkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUNyQixDQUFDLENBQUMsQ0FBQTt3QkFFbUIscUJBQU0sdUJBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFBOzt3QkFBM0QsWUFBWSxHQUFHLFNBQTRDO3dCQUNqRSxhQUFLLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLGdEQUE4QyxVQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDLENBQUE7Ozs7YUFFNUcsRUFBRSxHQUFHLENBQUMsMkVBQTJFLENBQUM7SUE1QnhDLENBNEJ3QyxDQUFDLENBQUE7QUFDeEYsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYXJkQ3J5cHRvIH0gZnJvbSBcIi4vQ2FyZENyeXB0b1wiXHJcbmltcG9ydCB7IFNXX09LLCBDSEVDSywgU1cgfSBmcm9tIFwiLi9VdGlsc1wiXHJcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJmc1wiXHJcbmltcG9ydCB7IGxvYWRBc3luYyBhcyBsb2FkWmlwIH0gZnJvbSBcImpzemlwXCJcclxuaW1wb3J0IEdsb2JhbFBsYXRmb3JtIGZyb20gXCIuL0dsb2JhbFBsYXRmb3JtXCJcclxuXHJcbmNvbnN0IHNtYXJ0Y2FyZCA9IHJlcXVpcmUoJ3NtYXJ0Y2FyZCcpXHJcbmNvbnN0IERldmljZXMgPSBzbWFydGNhcmQuRGV2aWNlc1xyXG5jb25zdCBkZXZpY2VzID0gbmV3IERldmljZXMoKVxyXG5cclxuZGV2aWNlcy5vbignZGV2aWNlLWFjdGl2YXRlZCcsICh7IGRldmljZSB9OmFueSkgPT4ge1xyXG4gICAgLy8gZGV2aWNlLnNldFNoYXJlTW9kZSgyKSAvLyBUT0RPOiBiZW5iZW5iZW5iZW5iZW5iZW4vc21hcnRjYXJkXHJcbiAgICBkZXZpY2Uub24oJ2NhcmQtaW5zZXJ0ZWQnLCAoe2NhcmR9OmFueSkgPT4gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcblxyXG4gICAgICAgIGRldmljZS5vbignY2FyZC1yZW1vdmVkJywgKHg6YW55KSA9PiB7XHJcbiAgICAgICAgICAgIGRlYnVnZ2VyXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHggPT09IGNhcmQpXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgbGV0IGdwY2FyZCA9IG5ldyBHbG9iYWxQbGF0Zm9ybShjYXJkKVxyXG4gICAgICAgIGF3YWl0IGdwY2FyZC5jb25uZWN0KClcclxuXHJcbiAgICAgICAgbGV0IHBhY2thZ2VzID0gYXdhaXQgZ3BjYXJkLmdldFBhY2thZ2VzKClcclxuICAgICAgICBsZXQgYXBwbGV0cyA9IGF3YWl0IGdwY2FyZC5nZXRBcHBsZXRzKClcclxuICAgICAgICBcclxuICAgICAgICBjb25zb2xlLmxvZyhwYWNrYWdlcylcclxuICAgICAgICBjb25zb2xlLmxvZyhhcHBsZXRzKVxyXG4gICAgICAgIC8vY29uc29sZS5sb2coYXBwbGV0c3JhdylcclxuXHJcbiAgICAgICAgLy8gbG9hZCBjYXAgZmlsZSAoZS5nLiBuZGVmIHRhZylcclxuICAgICAgICAvLyBEOlxcamF2YWNhcmQtbmRlZi1mdWxsLXBsYWluLmNhcFxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSByZWFkRmlsZVN5bmMoXCJkOi9qYXZhY2FyZC1uZGVmLWZ1bGwtcGxhaW4uY2FwXCIpXHJcbiAgICAgICAgY29uc3QgemRhdGEgPSBhd2FpdCBsb2FkWmlwKGRhdGEpXHJcbiAgICAgICAgemRhdGEuZm9yRWFjaCgocGF0aCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwYXRoKVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGNvbnN0IGxvYWRyZXNwb25zZSA9IGF3YWl0IENhcmRDcnlwdG8uaW5zdGFsbEZvckxvYWQoY2FyZCwgemRhdGEpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0sobG9hZHJlc3BvbnNlKSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgZm9yIElOU1RBTEwgKGZvciBsb2FkKSAke1NXKGxvYWRyZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcblxyXG4gICAgfSwgNTAwIC8qIFRPRE86IHJlbW92ZSB0aGlzIGRlbGF5IGhhY2sgZm9yIGV4Y2x1c2l2ZS9zaGFyZWQgYWNjZXNzIGludGVyZmVyZW5jZSAqLykpXHJcbn0pOyAiXX0=