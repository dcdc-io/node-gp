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
            var gpcard, zdata, installauto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        device.on('card-removed', function (rDevice) {
                            if (rDevice.card === card) {
                                // this card was removed
                            }
                        });
                        gpcard = new GlobalPlatform_1.default(card);
                        return [4 /*yield*/, gpcard.connect()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, jszip_1.loadAsync(fs_1.readFileSync("javacard-ndef-full-plain.cap"))];
                    case 2:
                        zdata = _a.sent();
                        return [4 /*yield*/, gpcard.installAuto(zdata)];
                    case 3:
                        installauto = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(installauto), "unexpected response for INSTALL " + Utils_1.SW(installauto).toString(16));
                        return [2 /*return*/];
                }
            });
        }); }, 500 /* TODO: remove this delay hack for exclusive/shared access interference */);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUJBMkJJOztBQTNCSixpQ0FBMEM7QUFDMUMseUJBQWlDO0FBQ2pDLCtCQUE0QztBQUM1QyxvRUFBNkM7QUFFN0MsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUE7QUFDakMsSUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUU3QixPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQUMsRUFBYztRQUFaLGtCQUFNO0lBQ3BDLCtEQUErRDtJQUMvRCxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLEVBQVU7WUFBVCxjQUFJO1FBQVUsT0FBQSxVQUFVLENBQUM7Ozs7O3dCQUVsRCxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFDLE9BQVc7NEJBQ2xDLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0NBQ3ZCLHdCQUF3Qjs2QkFDM0I7d0JBQ0wsQ0FBQyxDQUFDLENBQUE7d0JBRUksTUFBTSxHQUFHLElBQUksd0JBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDdkMscUJBQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFBOzt3QkFBdEIsU0FBc0IsQ0FBQTt3QkFFUixxQkFBTSxpQkFBTyxDQUFDLGlCQUFZLENBQUMsOEJBQThCLENBQUMsQ0FBQyxFQUFBOzt3QkFBbkUsS0FBSyxHQUFHLFNBQTJEO3dCQUNyRCxxQkFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFBOzt3QkFBN0MsV0FBVyxHQUFHLFNBQStCO3dCQUVuRCxhQUFLLENBQUMsYUFBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLHFDQUFtQyxVQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBRyxDQUFDLENBQUE7Ozs7YUFDL0YsRUFBRSxHQUFHLENBQUMsMkVBQTJFLENBQUM7SUFmeEMsQ0Fld0MsQ0FBQyxDQUFBO0FBQ3hGLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU1dfT0ssIENIRUNLLCBTVyB9IGZyb20gXCIuL1V0aWxzXCJcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCJcclxuaW1wb3J0IHsgbG9hZEFzeW5jIGFzIGxvYWRaaXAgfSBmcm9tIFwianN6aXBcIlxyXG5pbXBvcnQgR2xvYmFsUGxhdGZvcm0gZnJvbSBcIi4vR2xvYmFsUGxhdGZvcm1cIlxyXG5cclxuY29uc3Qgc21hcnRjYXJkID0gcmVxdWlyZSgnc21hcnRjYXJkJylcclxuY29uc3QgRGV2aWNlcyA9IHNtYXJ0Y2FyZC5EZXZpY2VzXHJcbmNvbnN0IGRldmljZXMgPSBuZXcgRGV2aWNlcygpXHJcblxyXG5kZXZpY2VzLm9uKCdkZXZpY2UtYWN0aXZhdGVkJywgKHsgZGV2aWNlIH06YW55KSA9PiB7XHJcbiAgICAvLyBkZXZpY2Uuc2V0U2hhcmVNb2RlKDIpIC8vIFRPRE86IGJlbmJlbmJlbmJlbmJlbmJlbi9zbWFydGNhcmRcclxuICAgIGRldmljZS5vbignY2FyZC1pbnNlcnRlZCcsICh7Y2FyZH06YW55KSA9PiBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuXHJcbiAgICAgICAgZGV2aWNlLm9uKCdjYXJkLXJlbW92ZWQnLCAockRldmljZTphbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJEZXZpY2UuY2FyZCA9PT0gY2FyZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcyBjYXJkIHdhcyByZW1vdmVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zdCBncGNhcmQgPSBuZXcgR2xvYmFsUGxhdGZvcm0oY2FyZClcclxuICAgICAgICBhd2FpdCBncGNhcmQuY29ubmVjdCgpXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgemRhdGEgPSBhd2FpdCBsb2FkWmlwKHJlYWRGaWxlU3luYyhcImphdmFjYXJkLW5kZWYtZnVsbC1wbGFpbi5jYXBcIikpXHJcbiAgICAgICAgY29uc3QgaW5zdGFsbGF1dG8gPSBhd2FpdCBncGNhcmQuaW5zdGFsbEF1dG8oemRhdGEpXHJcblxyXG4gICAgICAgIENIRUNLKFNXX09LKGluc3RhbGxhdXRvKSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgZm9yIElOU1RBTEwgJHtTVyhpbnN0YWxsYXV0bykudG9TdHJpbmcoMTYpfWApXHJcbiAgICB9LCA1MDAgLyogVE9ETzogcmVtb3ZlIHRoaXMgZGVsYXkgaGFjayBmb3IgZXhjbHVzaXZlL3NoYXJlZCBhY2Nlc3MgaW50ZXJmZXJlbmNlICovKSlcclxufSk7ICJdfQ==