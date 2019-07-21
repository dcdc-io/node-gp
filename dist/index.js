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
            var gpcard, packages, applets, data, zdata, loadresponse, installresponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        device.on('card-removed', function (rDevice) {
                            if (rDevice.card === card) {
                                // this card removed
                            }
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
                        data = fs_1.readFileSync("javacard-ndef-full-plain.cap");
                        return [4 /*yield*/, jszip_1.loadAsync(data)];
                    case 4:
                        zdata = _a.sent();
                        zdata.forEach(function (path) {
                            console.log(path);
                        });
                        return [4 /*yield*/, gpcard.installForLoad(zdata)];
                    case 5:
                        loadresponse = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(loadresponse), "unexpected response for INSTALL (for load) " + Utils_1.SW(loadresponse).toString(16));
                        return [4 /*yield*/, gpcard.installForInstall("D276000085", "D2760000850101")];
                    case 6:
                        installresponse = _a.sent();
                        Utils_1.CHECK(Utils_1.SW_OK(installresponse), "unexpected response for INSTALL (for load) " + Utils_1.SW(installresponse).toString(16));
                        return [2 /*return*/];
                }
            });
        }); }, 500 /* TODO: remove this delay hack for exclusive/shared access interference */);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUJBOENJOztBQTdDSixpQ0FBMEM7QUFDMUMseUJBQWlDO0FBQ2pDLCtCQUE0QztBQUM1QyxvRUFBNkM7QUFFN0MsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUE7QUFDakMsSUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUU3QixPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQUMsRUFBYztRQUFaLGtCQUFNO0lBQ3BDLCtEQUErRDtJQUMvRCxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLEVBQVU7WUFBVCxjQUFJO1FBQVUsT0FBQSxVQUFVLENBQUM7Ozs7O3dCQUVsRCxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFDLE9BQVc7NEJBQ2xDLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0NBQ3ZCLG9CQUFvQjs2QkFDdkI7d0JBQ0wsQ0FBQyxDQUFDLENBQUE7d0JBRUUsTUFBTSxHQUFHLElBQUksd0JBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDckMscUJBQU0sTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFBOzt3QkFBdEIsU0FBc0IsQ0FBQTt3QkFFUCxxQkFBTSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUE7O3dCQUFyQyxRQUFRLEdBQUcsU0FBMEI7d0JBQzNCLHFCQUFNLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBQTs7d0JBQW5DLE9BQU8sR0FBRyxTQUF5Qjt3QkFFdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTt3QkFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTt3QkFLZCxJQUFJLEdBQUcsaUJBQVksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO3dCQUMzQyxxQkFBTSxpQkFBTyxDQUFDLElBQUksQ0FBQyxFQUFBOzt3QkFBM0IsS0FBSyxHQUFHLFNBQW1CO3dCQUNqQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTs0QkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUNyQixDQUFDLENBQUMsQ0FBQTt3QkFFbUIscUJBQU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBQTs7d0JBQWpELFlBQVksR0FBRyxTQUFrQzt3QkFDdkQsYUFBSyxDQUFDLGFBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxnREFBOEMsVUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUcsQ0FBQyxDQUFBO3dCQUVqRixxQkFBTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLGdCQUFnQixDQUFDLEVBQUE7O3dCQUFoRixlQUFlLEdBQUcsU0FBOEQ7d0JBQ3RGLGFBQUssQ0FBQyxhQUFLLENBQUMsZUFBZSxDQUFDLEVBQUUsZ0RBQThDLFVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFHLENBQUMsQ0FBQTs7OzthQUdsSCxFQUFFLEdBQUcsQ0FBQywyRUFBMkUsQ0FBQztJQWpDeEMsQ0FpQ3dDLENBQUMsQ0FBQTtBQUN4RixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhcmRDcnlwdG8gfSBmcm9tIFwiLi9DYXJkQ3J5cHRvXCJcclxuaW1wb3J0IHsgU1dfT0ssIENIRUNLLCBTVyB9IGZyb20gXCIuL1V0aWxzXCJcclxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCJcclxuaW1wb3J0IHsgbG9hZEFzeW5jIGFzIGxvYWRaaXAgfSBmcm9tIFwianN6aXBcIlxyXG5pbXBvcnQgR2xvYmFsUGxhdGZvcm0gZnJvbSBcIi4vR2xvYmFsUGxhdGZvcm1cIlxyXG5cclxuY29uc3Qgc21hcnRjYXJkID0gcmVxdWlyZSgnc21hcnRjYXJkJylcclxuY29uc3QgRGV2aWNlcyA9IHNtYXJ0Y2FyZC5EZXZpY2VzXHJcbmNvbnN0IGRldmljZXMgPSBuZXcgRGV2aWNlcygpXHJcblxyXG5kZXZpY2VzLm9uKCdkZXZpY2UtYWN0aXZhdGVkJywgKHsgZGV2aWNlIH06YW55KSA9PiB7XHJcbiAgICAvLyBkZXZpY2Uuc2V0U2hhcmVNb2RlKDIpIC8vIFRPRE86IGJlbmJlbmJlbmJlbmJlbmJlbi9zbWFydGNhcmRcclxuICAgIGRldmljZS5vbignY2FyZC1pbnNlcnRlZCcsICh7Y2FyZH06YW55KSA9PiBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuXHJcbiAgICAgICAgZGV2aWNlLm9uKCdjYXJkLXJlbW92ZWQnLCAockRldmljZTphbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJEZXZpY2UuY2FyZCA9PT0gY2FyZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gdGhpcyBjYXJkIHJlbW92ZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGxldCBncGNhcmQgPSBuZXcgR2xvYmFsUGxhdGZvcm0oY2FyZClcclxuICAgICAgICBhd2FpdCBncGNhcmQuY29ubmVjdCgpXHJcblxyXG4gICAgICAgIGxldCBwYWNrYWdlcyA9IGF3YWl0IGdwY2FyZC5nZXRQYWNrYWdlcygpXHJcbiAgICAgICAgbGV0IGFwcGxldHMgPSBhd2FpdCBncGNhcmQuZ2V0QXBwbGV0cygpXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc29sZS5sb2cocGFja2FnZXMpXHJcbiAgICAgICAgY29uc29sZS5sb2coYXBwbGV0cylcclxuICAgICAgICAvL2NvbnNvbGUubG9nKGFwcGxldHNyYXcpXHJcblxyXG4gICAgICAgIC8vIGxvYWQgY2FwIGZpbGUgKGUuZy4gbmRlZiB0YWcpXHJcbiAgICAgICAgLy8gRDpcXGphdmFjYXJkLW5kZWYtZnVsbC1wbGFpbi5jYXBcclxuICAgICAgICBjb25zdCBkYXRhID0gcmVhZEZpbGVTeW5jKFwiamF2YWNhcmQtbmRlZi1mdWxsLXBsYWluLmNhcFwiKVxyXG4gICAgICAgIGNvbnN0IHpkYXRhID0gYXdhaXQgbG9hZFppcChkYXRhKVxyXG4gICAgICAgIHpkYXRhLmZvckVhY2goKHBhdGgpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cocGF0aClcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBjb25zdCBsb2FkcmVzcG9uc2UgPSBhd2FpdCBncGNhcmQuaW5zdGFsbEZvckxvYWQoemRhdGEpXHJcbiAgICAgICAgQ0hFQ0soU1dfT0sobG9hZHJlc3BvbnNlKSwgYHVuZXhwZWN0ZWQgcmVzcG9uc2UgZm9yIElOU1RBTEwgKGZvciBsb2FkKSAke1NXKGxvYWRyZXNwb25zZSkudG9TdHJpbmcoMTYpfWApXHJcblxyXG4gICAgICAgIGNvbnN0IGluc3RhbGxyZXNwb25zZSA9IGF3YWl0IGdwY2FyZC5pbnN0YWxsRm9ySW5zdGFsbChcIkQyNzYwMDAwODVcIiwgXCJEMjc2MDAwMDg1MDEwMVwiKVxyXG4gICAgICAgIENIRUNLKFNXX09LKGluc3RhbGxyZXNwb25zZSksIGB1bmV4cGVjdGVkIHJlc3BvbnNlIGZvciBJTlNUQUxMIChmb3IgbG9hZCkgJHtTVyhpbnN0YWxscmVzcG9uc2UpLnRvU3RyaW5nKDE2KX1gKVxyXG5cclxuXHJcbiAgICB9LCA1MDAgLyogVE9ETzogcmVtb3ZlIHRoaXMgZGVsYXkgaGFjayBmb3IgZXhjbHVzaXZlL3NoYXJlZCBhY2Nlc3MgaW50ZXJmZXJlbmNlICovKSlcclxufSk7ICJdfQ==