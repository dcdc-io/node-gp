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
require("mocha");
var fs_1 = require("fs");
var jszip_1 = require("jszip");
var GlobalPlatform_1 = __importDefault(require("../GlobalPlatform"));
describe("GlobalPlatform", function () { return __awaiter(_this, void 0, void 0, function () {
    var gp;
    var _this = this;
    return __generator(this, function (_a) {
        gp = new GlobalPlatform_1.default(function (x) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, x];
        }); }); });
        it("should load a cap file", function () { return __awaiter(_this, void 0, void 0, function () {
            var data, zdata, x;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = fs_1.readFileSync("d:/javacard-ndef-full-plain.cap");
                        return [4 /*yield*/, jszip_1.loadAsync(data)];
                    case 1:
                        zdata = _a.sent();
                        return [4 /*yield*/, gp.installForLoad(zdata)];
                    case 2:
                        x = _a.sent();
                        x; // ?+
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYmFsUGxhdGZvcm0uc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0L0dsb2JhbFBsYXRmb3JtLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUJBZUU7O0FBZEYsaUJBQWM7QUFDZCx5QkFBa0M7QUFDbEMsK0JBQWlDO0FBQ2pDLHFFQUErQztBQUUvQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7Ozs7UUFDakIsRUFBRSxHQUFHLElBQUksd0JBQWMsQ0FBQyxVQUFPLENBQUM7WUFBSyxzQkFBQSxDQUFDLEVBQUE7aUJBQUEsQ0FBQyxDQUFBO1FBQzdDLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTs7Ozs7d0JBRW5CLElBQUksR0FBRyxpQkFBWSxDQUFDLGlDQUFpQyxDQUFDLENBQUE7d0JBQzlDLHFCQUFNLGlCQUFTLENBQUMsSUFBSSxDQUFDLEVBQUE7O3dCQUE3QixLQUFLLEdBQUcsU0FBcUI7d0JBQ3pCLHFCQUFNLEVBQUUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUE7O3dCQUFsQyxDQUFDLEdBQUcsU0FBOEI7d0JBQ3hDLENBQUMsQ0FBQSxDQUFDLEtBQUs7Ozs7YUFDVixDQUFDLENBQUE7OztLQUNMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4cGVjdCB9IGZyb20gXCJjaGFpXCJcclxuaW1wb3J0IFwibW9jaGFcIlxyXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHsgbG9hZEFzeW5jIH0gZnJvbSBcImpzemlwXCJcclxuaW1wb3J0IEdsb2JhbFBsYXRmb3JtIGZyb20gXCIuLi9HbG9iYWxQbGF0Zm9ybVwiO1xyXG5cclxuZGVzY3JpYmUoXCJHbG9iYWxQbGF0Zm9ybVwiLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBncCA9IG5ldyBHbG9iYWxQbGF0Zm9ybShhc3luYyAoeCkgPT4geClcclxuICAgIGl0KFwic2hvdWxkIGxvYWQgYSBjYXAgZmlsZVwiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgLy8gZ3BcclxuICAgICAgICBjb25zdCBkYXRhID0gcmVhZEZpbGVTeW5jKFwiZDovamF2YWNhcmQtbmRlZi1mdWxsLXBsYWluLmNhcFwiKVxyXG4gICAgICAgIGNvbnN0IHpkYXRhID0gYXdhaXQgbG9hZEFzeW5jKGRhdGEpXHJcbiAgICAgICAgY29uc3QgeCA9IGF3YWl0IGdwLmluc3RhbGxGb3JMb2FkKHpkYXRhKVxyXG4gICAgICAgIHggLy8gPytcclxuICAgIH0pXHJcbn0pIl19